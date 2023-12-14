import { FileDetailsType, useChat } from "@/providers/ChatProvider";
import { Bot, User } from "lucide-react";
import { FC } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileIcon } from "./file-icon";
import { Skeleton } from "./ui/skeleton";

type AssistantMessageProps = {
    content: string;
};

const AssistantMessage: FC<AssistantMessageProps> = ({ content }) => {
    return (
        <div className={"flex w-full items-center justify-center border-b border-gray-200 bg-gray-100 py-8"}>
            <div className="flex w-full max-w-screen-md items-start space-x-4 px-5 sm:px-0">
                <div className="bg-green-500 p-1.5 text-white">
                    <Bot width={20} />
                </div>

                <div className="flex w-full flex-col">
                    <ReactMarkdown
                        className="prose mt-1 break-words prose-p:leading-relaxed"
                        remarkPlugins={[remarkGfm]}
                        components={{
                            a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

const AssistantMessageLoadingSkeleton: FC = () => {
    return (
        <div className={"flex w-full items-center justify-center border-b border-gray-200 bg-gray-100 py-8"}>
            <div className="flex w-full max-w-screen-md items-start space-x-4 px-5 sm:px-0">
                <div className="bg-green-500 p-1.5 text-white">
                    <Bot width={20} />
                </div>

                <div className="flex w-full flex-col">
                    <Skeleton className="h-7 w-1/2" />
                </div>
            </div>
        </div>
    );
};

type UserMessageProps = {
    content: string;
    fileDetails: FileDetailsType[];
};

const UserMessage: FC<UserMessageProps> = ({ content, fileDetails }) => {
    return (
        <div className="flex w-full items-center justify-center border-b border-gray-200 bg-white py-8">
            <div className="flex w-full max-w-screen-md items-start space-x-4 px-5 sm:px-0">
                <div className="bg-black p-1.5 text-white">
                    <User width={20} />
                </div>
                <div className="flex w-full flex-col">
                    <ReactMarkdown
                        className="prose mt-1 break-words prose-p:leading-relaxed"
                        remarkPlugins={[remarkGfm]}
                        components={{
                            a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                        }}
                    >
                        {content}
                    </ReactMarkdown>

                    <div className="mt-2 grid grid-cols-4 gap-2">
                        {fileDetails.map((file) => (
                            <div key={file.name} className="flex items-center space-x-1">
                                <FileIcon type={file.type} />

                                <span className="block w-28 truncate text-xs text-gray-500">{file.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const MessageList: FC = () => {
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
