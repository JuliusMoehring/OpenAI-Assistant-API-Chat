import { env } from "@/env.mjs";
import { TRPCError } from "@trpc/server";
import { createReadStream } from "fs";
import { unlink, writeFile } from "fs/promises";
import OpenAI from "openai";
import { OpenAIError } from "openai/error";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const FileSchema = z.object({
  name: z.string(),
  type: z.string(),
  size: z.number(),
  content: z.string(),
});

export const fileRouter = createTRPCRouter({
  uploadGPT4File: protectedProcedure
    .input(
      z.object({
        base64Image: z.string(),
        prompt: z
          .string()
          .optional()
          .default(
            "Analyze and describe the image in detail. Focus on visual elements like colors, object details, people's positions and expressions, and the environment. Transcribe any text as 'Content: “[Text]”', noting font attributes. Aim for a clear, thorough representation of all visual and textual aspects.",
          ),
      }),
    )
    .mutation(async ({ input }) => {
      const { base64Image, prompt } = input;

      const openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: base64Image,
                },
              },
            ],
          },
        ],
        max_tokens: 200,
      });

      const analysis = response?.choices[0]?.message?.content;

      return { success: true, analysis: analysis };
    }),

  uploadFile: protectedProcedure
    .input(
      z.object({
        file: FileSchema,
      }),
    )
    .mutation(async ({ input }) => {
      const { file } = input;

      const openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
      });

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

  deleteFile: protectedProcedure
    .input(
      z.object({
        fileId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { fileId } = input;

      const openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
      });

      try {
        const deletionStatus = await openai.files.del(fileId);

        console.log(
          `File deleted, ID: ${deletionStatus.id}, Status: ${deletionStatus.deleted}`,
        );

        return {
          success: deletionStatus.deleted,
          fileId: deletionStatus.id,
        };
      } catch (error) {
        if (error instanceof OpenAIError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error deleting file",
        });
      }
    }),
});
