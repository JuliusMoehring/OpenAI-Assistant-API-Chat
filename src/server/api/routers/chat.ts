import { env } from "@/env.mjs";
import { FileSchema } from "@/providers/ChatProvider";
import { TRPCError } from "@trpc/server";
import { createReadStream } from "fs";
import { unlink, writeFile } from "fs/promises";
import OpenAI, { OpenAIError } from "openai";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const chatRouter = createTRPCRouter({
    initializeChat: protectedProcedure
        .input(
            z.object({
                assistantId: z.string(),
                initialMessage: z.string(),
            }),
        )
        .query(async ({ input }) => {
            const { assistantId, initialMessage } = input;

            const openai = new OpenAI({
                apiKey: env.OPENAI_API_KEY,
            });

            const thread = await openai.beta.threads.create({
                messages: [
                    {
                        role: "user",
                        content: initialMessage,
                    },
                ],
            });

            const run = await openai.beta.threads.runs.create(thread.id, {
                assistant_id: assistantId,
            });

            let status = null;

            do {
                const runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

                status = runStatus.status;

                await new Promise((resolve) => setTimeout(resolve, 1_000));
            } while (status !== "completed");

            const messages = await openai.beta.threads.messages.list(thread.id);

            const assistantMessage = messages.data.find((message) => message.role === "assistant");

            if (!assistantMessage) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "No assistant message found",
                });
            }

            const assistantMessageContent = assistantMessage.content.at(0);

            if (!assistantMessageContent) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "No assistant message content found",
                });
            }

            if (assistantMessageContent.type !== "text") {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Assistant message is not text, only text supported in this demo",
                });
            }

            return {
                threadId: thread.id,
                runId: run.id,
                assistantMessage: assistantMessageContent.text.value,
            };
        }),

    sendMessage: protectedProcedure
        .input(
            z.object({
                threadId: z.string(),
                message: z.string(),
                files: z.array(FileSchema),
            }),
        )
        .mutation(async ({ input }) => {
            const { threadId, message, files } = input;

            const openai = new OpenAI({
                apiKey: env.OPENAI_API_KEY,
            });

            const fileIds = await Promise.all(
                files.map(async (file) => {
                    const path = `/tmp/${uuid()}-${file.name}`;

                    try {
                        await writeFile(path, file.content);

                        const fileForRetrieval = await openai.files.create({
                            file: createReadStream(path),
                            purpose: "assistants",
                        });

                        return fileForRetrieval.id;
                    } catch (error) {
                        if (error instanceof OpenAIError) {
                            throw new TRPCError({
                                code: "INTERNAL_SERVER_ERROR",
                                message: error.message,
                            });
                        }

                        throw new TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Error uploading file",
                        });
                    } finally {
                        await unlink(path);
                    }
                }),
            );

            const response = await openai.beta.threads.messages.create(threadId, {
                role: "user",
                content: message,
                file_ids: fileIds,
            });

            const content = response.content
                .filter(
                    (content): content is OpenAI.Beta.Threads.Messages.MessageContentText => content.type === "text",
                )
                .at(0);

            if (!content) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "No text content returned from OpenAI",
                });
            }

            return content;
        }),

    getMessages: protectedProcedure.input(z.object({ threadId: z.string() })).query(async ({ input }) => {
        const { threadId } = input;

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const messages = await openai.beta.threads.messages.list(threadId);

        return messages.data;
    }),

    getLastestAssistantMessage: protectedProcedure
        .input(z.object({ threadId: z.string() }))
        .query(async ({ input }) => {
            const { threadId } = input;

            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });

            const messages = await openai.beta.threads.messages.list(threadId);

            const assistantMessages = messages.data.filter((message) => message.role === "assistant");

            if (assistantMessages.length === 0) {
                return null;
            }

            const assistantMessagesByCreatedAt = assistantMessages.sort((a, b) => b.created_at - a.created_at);

            const assistantMessage = assistantMessagesByCreatedAt.at(0);

            if (!assistantMessage) {
                return null;
            }

            return assistantMessage;
        }),
});
