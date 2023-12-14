"use client";

import { Chat } from "@/components/chat";
import { InvalidAssistantDialog } from "@/components/invalid-assistant-dialog";
import { UnauthorizedDialog } from "@/components/unauthorized-dialog";
import { useMapPathToAssistantId } from "@/hooks/useMapPathToAssistantId";
import { useUserHasAccess } from "@/hooks/useUserHasAccess";
import { ChatProvider } from "@/providers/ChatProvider";
import { HydrationGuardProvider } from "@/providers/HydrationProvider";
import { NextPage } from "next";

const Root: NextPage = () => {
    const hasAccess = useUserHasAccess("default");
    const assistantId = useMapPathToAssistantId("default");

    if (!hasAccess) {
        return (
            <HydrationGuardProvider>
                <UnauthorizedDialog />
            </HydrationGuardProvider>
        );
    }

    if (!assistantId) {
        return (
            <HydrationGuardProvider>
                <InvalidAssistantDialog />
            </HydrationGuardProvider>
        );
    }

    return (
        <ChatProvider assistantId={assistantId}>
            <Chat />
        </ChatProvider>
    );
};

export default Root;
