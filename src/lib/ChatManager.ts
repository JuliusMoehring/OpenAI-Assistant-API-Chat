import { ChatMessage, FileType } from "@/providers/ChatProvider";
import { AppRouter } from "@/server/api/root";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { MessageContentText, ThreadMessage } from "openai/resources/beta/threads/messages/messages";
import { Dispatch, SetStateAction } from "react";
import superjson from "superjson";

const trpcClient = createTRPCProxyClient<AppRouter>({
    transformer: superjson,
    links: [
        httpBatchLink({
            url: "/api/trpc",
        }),
    ],
});

export class ChatManager {
    private assistantId: string | null = null;
    private threadId: string | null = null;
    private runId: string | null = null;
    private isReady: boolean = false;
    private isLoading: boolean = false;
    private isSending: boolean = false;

    private updateMessages: Dispatch<SetStateAction<ChatMessage[]>>;
    private updateAssistantLoadingState: Dispatch<SetStateAction<boolean>>;

    private static instance: ChatManager;

    private constructor(
        assistantId: string | null,
        updateMessages: Dispatch<SetStateAction<ChatMessage[]>>,
        updateAssistantLoadingState: Dispatch<SetStateAction<boolean>>,
    ) {
        this.assistantId = assistantId;
        this.updateMessages = updateMessages;
        this.updateAssistantLoadingState = updateAssistantLoadingState;
    }

    public static getInstance(
        assistantId: string | null,
        updateMessages: Dispatch<SetStateAction<ChatMessage[]>>,
        updateAssistantLoadingState: Dispatch<SetStateAction<boolean>>,
    ): ChatManager {
        if (!ChatManager.instance) {
            this.instance = new ChatManager(assistantId, updateMessages, updateAssistantLoadingState);
        }

        if (assistantId !== this.instance.assistantId) {
            this.instance = new ChatManager(assistantId, updateMessages, updateAssistantLoadingState);
        }

        return this.instance;
    }

    private createAssistant = async () => {
        return "asldkfjasdölkfjasdlöfj";
    };

    private theadMessageToMessageContentText = (threadMessage: ThreadMessage) => {
        const messageContentText = threadMessage.content
            .filter((content): content is MessageContentText => content.type === "text")
            .at(0);

        return messageContentText;
    };

    private updateLoadingState = (isLoading: boolean) => {
        this.isLoading = isLoading;
        this.updateAssistantLoadingState(isLoading);
    };

    init = async (initialMessage: string) => {
        if (!this.assistantId) {
            this.assistantId = await this.createAssistant();
        }

        const threadId = await trpcClient.thread.createThread.mutate({ message: initialMessage });

        this.threadId = threadId;

        const runId = await trpcClient.assistant.runAssistant.mutate({
            assistantId: this.assistantId,
            threadId: threadId,
        });

        this.runId = runId;

        let status = null;

        do {
            const runStatus = await trpcClient.run.getRunStatus.query({
                threadId: threadId,
                runId: runId,
            });

            status = runStatus.status;

            await new Promise((resolve) => setTimeout(resolve, 1_000));
        } while (status !== "completed");

        const initialAssistantMessage = await trpcClient.chat.getLastestAssistantMessage.query({
            threadId: threadId,
        });

        if (!initialAssistantMessage) {
            return;
        }

        const messageContentText = this.theadMessageToMessageContentText(initialAssistantMessage);

        if (!messageContentText) {
            return;
        }

        this.updateMessages([
            {
                role: "assistant",
                content: messageContentText.text.value,
            },
        ]);

        this.isReady = true;
    };

    sendMessage = async (message: string, files: FileType[]) => {
        if (!this.isReady || !this.assistantId || !this.threadId || !this.runId || this.isSending) {
            return;
        }

        this.isSending = true;
        this.updateLoadingState(true);

        const fileDetails = files.map((file) => ({
            name: file.name,
            type: file.type,
            size: file.size,
        }));

        this.updateMessages((prevState) => [
            ...prevState,
            {
                role: "user",
                content: message,
                fileDetails,
            },
        ]);

        await trpcClient.chat.sendMessage.mutate({
            threadId: this.threadId,
            message: message,
            files: files,
        });

        this.runId = await trpcClient.assistant.runAssistant.mutate({
            assistantId: this.assistantId,
            threadId: this.threadId,
        });

        let status = null;

        do {
            const runStatus = await trpcClient.run.getRunStatus.query({
                threadId: this.threadId,
                runId: this.runId,
            });

            status = runStatus.status;

            await new Promise((resolve) => setTimeout(resolve, 1_000));
        } while (status !== "completed");

        const latestAssistantMessage = await trpcClient.chat.getLastestAssistantMessage.query({
            threadId: this.threadId,
        });

        if (!latestAssistantMessage) {
            return;
        }

        const messageContentText = this.theadMessageToMessageContentText(latestAssistantMessage);

        if (!messageContentText) {
            return;
        }

        this.updateLoadingState(false);
        this.updateMessages((prevState) => [
            ...prevState,
            {
                role: "assistant",
                content: messageContentText.text.value,
            },
        ]);

        this.isSending = false;
    };

    getReadyState = () => {
        return this.isReady;
    };

    getLoadingState = () => {
        return this.isLoading;
    };

    getSendingState = () => {
        return this.isSending;
    };
}
