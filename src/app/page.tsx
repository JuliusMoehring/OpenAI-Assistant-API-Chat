"use client";

import { Chat } from "@/components/chat";
import { useMapPathToAssistantId } from "@/hooks/useMapPathToAssistantId";
import { ChatProvider } from "@/providers/ChatProvider";
import { NextPage } from "next";

const Root: NextPage = () => {
    const assistantId = useMapPathToAssistantId("default");

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
