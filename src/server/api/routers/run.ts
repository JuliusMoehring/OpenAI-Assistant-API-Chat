import { env } from "@/env.mjs";
import OpenAI from "openai";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const runRouter = createTRPCRouter({
    getRunStatus: protectedProcedure
        .input(
            z.object({
                threadId: z.string(),
                runId: z.string(),
            }),
        )
        .query(async ({ input }) => {
            const { threadId, runId } = input;

            const openai = new OpenAI({
                apiKey: env.OPENAI_API_KEY,
            });

            const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);

            return runStatus;
        }),
});
