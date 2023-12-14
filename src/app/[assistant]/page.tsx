"use client";

import { InvalidAssistantDialog } from "@/components/invalid-assistant-dialog";
import { UnauthorizedDialog } from "@/components/unauthorized-dialog";
import { WelcomeForm } from "@/components/welcome-form";
import { useEnforceAuthenticated } from "@/hooks/useEnforceAuthenticated";
import { useMapPathToAssistantId } from "@/hooks/useMapPathToAssistantId";
import { useUserHasAccess } from "@/hooks/useUserHasAccess";
import { ChatProvider } from "@/providers/ChatProvider";
import { HydrationGuardProvider } from "@/providers/HydrationProvider";
import { NextPage } from "next";
import { useParams } from "next/navigation";

const Root: NextPage = () => {
    const { assistant } = useParams<{ assistant: string }>();

    useEnforceAuthenticated();

    const hasAccess = useUserHasAccess(assistant);
    const assistantId = useMapPathToAssistantId(assistant);

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
            <WelcomeForm />
        </ChatProvider>
    );
};

export default Root;
