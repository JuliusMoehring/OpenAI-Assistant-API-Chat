import { useChat } from "@/providers/ChatProvider";
import { FC } from "react";
import { AssistantMessage, AssistantMessageLoadingSkeleton } from "./message/assistant-message";
import { UserMessage } from "./message/user-message";

export const Feed: FC = () => {
    const { messages, isFetchingAssistantMessage } = useChat();
    return (
        <div className="flex flex-col gap-1">
            {messages.map((message) => {
                if (message.role === "assistant") {
                    return <AssistantMessage key={message.content} content={message.content} />;
                }

                if (message.role === "user") {
                    return <UserMessage key={message.content} content={message.content} fileDetails={[]} />;
                }

                return null;
            })}

            {isFetchingAssistantMessage && <AssistantMessageLoadingSkeleton />}
        </div>
    );
};
