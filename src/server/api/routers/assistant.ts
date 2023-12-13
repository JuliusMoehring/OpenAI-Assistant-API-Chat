import { env } from "@/env.mjs";
import { OpenAI } from "openai";
import { AssistantCreateParams } from "openai/resources/beta/assistants/assistants";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const assistantRouter = createTRPCRouter({
    createAssistant: protectedProcedure
        .input(
            z.object({
                name: z.string(),
                model: z.string(),
                description: z.string(),
                fileIds: z.array(z.string()).default([]),
            }),
        )
        .mutation(async ({ input }) => {
            const { name, model, description, fileIds } = input;

            const openai = new OpenAI({
                apiKey: env.OPENAI_API_KEY,
            });

            const assistantOptions: AssistantCreateParams = {
                name,
                instructions: description,
                model: model,
                tools: [{ type: "retrieval" }],
                file_ids: fileIds ? fileIds : [],
            };

            console.log("Assistant Options:", assistantOptions);

            const assistant = await openai.beta.assistants.create(assistantOptions);

            return assistant.id;
        }),

    runAssistant: protectedProcedure
        .input(
            z.object({
                assistantId: z.string(),
                threadId: z.string(),
            }),
        )
        .mutation(async ({ input }) => {
            const { assistantId, threadId } = input;

            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });

            const run = await openai.beta.threads.runs.create(threadId, {
                assistant_id: assistantId,
            });

            return run.id;
        }),
});
