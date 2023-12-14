"use client";

import { env } from "@/env.mjs";
import { ChatManager } from "@/lib/ChatManager";
import { FC, PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
import { z } from "zod";

export const FileSchema = z.object({
    name: z.string(),
    type: z.string(),
    content: z.string(),
    size: z.number(),
});

export type FileType = z.infer<typeof FileSchema>;

export type FileDetailsType = Omit<FileType, "content">;

export type ChatMessage =
    | {
          role: "user";
          content: string;
          fileDetails: FileDetailsType[];
      }
    | {
          role: "assistant";
          content: string;
      };

type ChatContextType = {
    messages: ChatMessage[];
    isReady: boolean;
    chatManager: ChatManager | null;
    isFetchingAssistantMessage: boolean;
};

const ChatContext = createContext<ChatContextType>({
    messages: [],
    isReady: false,
    chatManager: null,
    isFetchingAssistantMessage: false,
});

type ChatProviderProps = {
    assistantId: string;
};

export const ChatProvider: FC<PropsWithChildren<ChatProviderProps>> = ({ assistantId, children }) => {
    const [threadId, setThreadId] = useState<string | null>(null);
    const [runId, setRunId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isReady, setIsReady] = useState(false);
    const [isFetchingAssistantMessage, setIsFetchingAssistantMessage] = useState(false);
    const [chatManager, setChatManager] = useState<ChatManager | null>(null);

    const initialMessage = env.NEXT_PUBLIC_ASSISTENT_CONFIG.find((assistant) => assistant.assistantId === assistantId)
        ?.initialThreadMessage;

    useEffect(() => {
        setChatManager(ChatManager.getInstance(assistantId, setMessages, setIsFetchingAssistantMessage));
    }, [assistantId, setMessages]);

    useEffect(() => {
        const handleInitialization = async () => {
            if (!chatManager) {
                return;
            }

            await chatManager.init(initialMessage ?? "");

            setIsReady(chatManager.getReadyState());
        };

        handleInitialization();
    }, [chatManager]);

    return (
        <ChatContext.Provider
            value={{
                messages,
                isReady,
                chatManager,
                isFetchingAssistantMessage,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const chatContext = useContext(ChatContext);

    if (chatContext === null) {
        const error = new Error("useChat must be used within a ChatContext");

        if (Error.captureStackTrace) {
            Error.captureStackTrace(error, useChat);
        }

        throw error;
    }

    return chatContext;
};
