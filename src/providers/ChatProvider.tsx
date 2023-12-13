import { trpc } from "@/lib/trpc/client";
import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useState,
} from "react";
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
  sendMessage: (message: string, files: FileType[]) => Promise<void>;
};

const ChatContext = createContext<ChatContextType>({
  messages: [],
  sendMessage: () => Promise.resolve(),
});

export const ChatProvider: FC<PropsWithChildren> = ({ children }) => {
  const [progress, setProgress] = useState(0);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [assistantResponseReceived, setAssistantResponseReceived] =
    useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const addMessageMutation = trpc.message.addMessage.useMutation();
  const getMessagesQuery = trpc.message.getMessages.useMutation();
  const createThreatMutation = trpc.thread.createThread.useMutation();
  const createAssistantMutation = trpc.assistant.createAssistant.useMutation();
  const runAssistantMutation = trpc.assistant.runAssistant.useMutation();
  const uploadFileMutation = trpc.file.uploadFile.useMutation();

  const runStatusQuery = trpc.run.getRunStatus.useQuery(
    {
      threadId: threadId!,
      runId: runId!,
    },
    {
      enabled: !!threadId && !!runId,
    },
  );

  const sendMessage = async (message: string, files: FileType[]) => {
    setProgress(0);
    setIsSending(true);

    setMessages((prevState) => [
      ...prevState,
      {
        role: "user",
        content: message,
        fileDetails: files.map((file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
        })),
      },
    ]);

    try {
      if (!threadId || !assistantId) {
        throw new Error("ThreadId or AssistantId is null");
      }

      let chatFileIds: string[] = [];

      const hasFiles = files.length > 0;

      if (hasFiles) {
        setStatusMessage("Starting upload...");

        const fileIds = await Promise.all(
          files.map(async (file) => {
            return uploadFileMutation.mutateAsync({
              file,
            });
          }),
        );

        if (fileIds.map(String).includes("null")) {
          throw new Error("One or more file IDs are null");
        }

        chatFileIds = fileIds;

        setStatusMessage("Upload complete..");
      }

      console.log("File IDs during Chat:", chatFileIds);

      await addMessageMutation.mutateAsync({
        threadId,
        message,
        fileIds: chatFileIds,
      });

      console.log("User message submitted. Running assistant...");

      const runId = await runAssistantMutation.mutateAsync({
        assistantId,
        threadId,
      });

      setRunId(runId);
      console.log("Assistant run successfully. Fetching assistant response...");

      if (!runId) {
        throw new Error("RunId is null");
      }

      const response = await getMessagesQuery.mutateAsync({
        threadId,
      });

      setMessages((prevState) => [
        ...prevState,
        {
          role: "assistant",
          content: response,
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
      }

      console.error("Error in sending message:", error);
    } finally {
      setProgress(0);
      setIsSending(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
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
