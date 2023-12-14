import { env } from "@/env.mjs";
import { getServerAuthSession } from "@/server/auth";
import { createReadStream } from "fs";
import { unlink, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import OpenAI, { OpenAIError } from "openai";
import { v4 as uuid } from "uuid";

const DEFAULT_PROMPT =
    "Analyze and describe the image in detail. Focus on visual elements like colors, object details, people's positions and expressions, and the environment. Transcribe any text as 'Content: “[Text]”', noting font attributes. Aim for a clear, thorough representation of all visual and textual aspects.";

const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
});

const isImage = (file: File) => {
    return file.type.startsWith("image");
};

const getImageDesciption = async (prompt: string, file: File) => {
    const base64Image = Buffer.from(await file.arrayBuffer()).toString("base64");

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
                            url: `data:image/${file.type};base64,${base64Image}`,
                        },
                    },
                ],
            },
        ],
        max_tokens: 200,
    });

    const imageDesciption = response.choices[0].message.content;

    return imageDesciption;
};

const uploadFile = async (path: string, buffer: Buffer) => {
    try {
        await writeFile(path, buffer);

        const fileForRetrieval = await openai.files.create({
            file: createReadStream(path),
            purpose: "assistants",
        });

        return NextResponse.json({ success: true, fileId: fileForRetrieval.id });
    } catch (error) {
        if (error instanceof OpenAIError) {
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: false, message: "Error uploading file" }, { status: 500 });
    } finally {
        if (env.NODE_ENV !== "production") {
            await unlink(path);
        }
    }
};

export const handleUpload = async (request: NextRequest) => {
    const session = await getServerAuthSession();

    if (!session) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const formData = await request.formData();

    const file: File | null = formData.get("file") as unknown as File;

    if (!file) {
        return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    if (isImage(file)) {
        const imageDesciption = await getImageDesciption(DEFAULT_PROMPT, file);

        if (!imageDesciption) {
            return NextResponse.json(
                { success: false, message: "Error generating image description" },
                { status: 500 },
            );
        }

        const path = `/tmp/${uuid()}_image_description.txt`;
        const buffer = Buffer.from(imageDesciption);

        return uploadFile(path, buffer);
    }

    const path = `/tmp/${uuid()}_${file.name}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return uploadFile(path, buffer);
};

export { handleUpload as POST };
