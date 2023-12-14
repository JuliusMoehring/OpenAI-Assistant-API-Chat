"use client";

import { Chat } from "@/components/chat";
import { useMapPathToAssistantId } from "@/hooks/useMapPathToAssistantId";
import { ChatProvider } from "@/providers/ChatProvider";
import { NextPage } from "next";
import { useParams } from "next/navigation";

const Root: NextPage = () => {
    const { assistant } = useParams<{ assistant: string }>();

    const assistantId = useMapPathToAssistantId(assistant);

    if (!assistantId) {
        return null;
    }

    return (
        <ChatProvider assistantId={assistantId}>
            <Chat />
        </ChatProvider>
    );
};

export default Root;
