import { env } from "@/env.mjs";
import { TRPCError } from "@trpc/server";
import OpenAI from "openai";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const FileSchema = z.object({
    name: z.string(),
    type: z.string(),
    content: z.string(),
    size: z.number(),
});

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
                fileIds: z.array(z.string()).default([]),
            }),
        )
        .mutation(async ({ input }) => {
            const { threadId, message, fileIds } = input;

            const openai = new OpenAI({
                apiKey: env.OPENAI_API_KEY,
            });

            /**

            const fileIds = await Promise.all(
                files.map(async (file) => {
                    await mkdir(`${__dirname}/tmp`, { recursive: true });

                    const path = `${__dirname}/tmp/${uuid()}-${file.name}`;

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

                        console.error(error);

                        throw new TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Error uploading file",
                        });
                    } finally {
                        if (env.NODE_ENV !== "development") {
                            await unlink(path);
                        }
                    }
                }),
            );

            */

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
