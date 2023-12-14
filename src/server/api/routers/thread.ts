import { env } from "@/env.mjs";
import OpenAI from "openai";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const threadRouter = createTRPCRouter({
    createThread: protectedProcedure
        .input(
            z.object({
                message: z.string(),
            }),
        )
        .mutation(async ({ input }) => {
            const { message } = input;

            const openai = new OpenAI({
                apiKey: env.OPENAI_API_KEY,
            });

            const thread = await openai.beta.threads.create({
                messages: [
                    {
                        role: "user",
                        content: message,
                    },
                ],
            });

            return thread.id;
        }),
});
