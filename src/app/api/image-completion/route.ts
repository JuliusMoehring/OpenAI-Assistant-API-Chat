import { env } from "@/env.mjs";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
});

const RequestBodySchema = z.object({
    file: z.string().min(1),
    prompt: z
        .string()
        .optional()
        .default(
            "Analyze and describe the image in detail. Focus on visual elements like colors, object details, people's positions and expressions, and the environment. Transcribe any text as 'Content: “[Text]”', noting font attributes. Aim for a clear, thorough representation of all visual and textual aspects.",
        ),
});

const handleUpload = async (request: NextRequest) => {
    const body = RequestBodySchema.parse(await request.json());

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: body.prompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: body.file,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 200,
        });

        const analysis = response?.choices[0]?.message?.content;

        return NextResponse.json({ success: true, analysis: analysis });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Error sending request to OpenAI" });
    }
};

export { handleUpload as POST };
