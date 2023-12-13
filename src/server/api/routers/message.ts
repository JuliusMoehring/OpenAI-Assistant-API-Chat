import { env } from "@/env.mjs";
import { TRPCError } from "@trpc/server";
import { OpenAI } from "openai";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const messageRouter = createTRPCRouter({
  addMessage: protectedProcedure
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

      const response = await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: message,
        file_ids: fileIds,
      });

      return {
        message: "Message created successfully",
        response,
      };
    }),

  getMessages: protectedProcedure
    .input(
      z.object({
        threadId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { threadId } = input;

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const messages = await openai.beta.threads.messages.list(threadId);

      messages.data.forEach((message, index) => {
        console.log(`Message ${index + 1} content:`, message.content);
      });

      const assistantMessage = messages.data.find(
        (message) => message.role === "assistant",
      );

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
          message:
            "Assistant message is not text, only text supported in this demo",
        });
      }

      return assistantMessageContent.text.value;
    }),
});
