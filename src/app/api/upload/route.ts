import { env } from "@/env.mjs";
import { createReadStream } from "fs";
import { unlink, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import OpenAI, { OpenAIError } from "openai";
import { v4 as uuid } from "uuid";

const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
});

export const handleUpload = async (request: NextRequest) => {
    const formData = await request.formData();
    const file: File | null = formData.get("file") as unknown as File;

    if (!file) {
        return NextResponse.json({ success: false, message: "No file provided" });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const path = `/tmp/${uuid()}_${file.name}`;

    try {
        await writeFile(path, buffer);

        const fileForRetrieval = await openai.files.create({
            file: createReadStream(path),
            purpose: "assistants",
        });

        return NextResponse.json({ success: true, fileId: fileForRetrieval.id });
    } catch (error) {
        if (error instanceof OpenAIError) {
            return NextResponse.json({ success: false, message: error.message });
        }

        return NextResponse.json({ success: false, message: "Error uploading file" });
    } finally {
        if (env.NODE_ENV !== "production") {
            await unlink(path);
        }
    }
};

export { handleUpload as POST };
