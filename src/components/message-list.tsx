// MessageList.js
import { FileDetail } from "@/hooks/useChatState";
import { ChatMessage, useChat } from "@/providers/ChatProvider";
import clsx from "clsx";
import { Bot, User } from "lucide-react";
import { FC } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DocumentIcon, ImageIcon } from "../app/icons";

type MessageProps = {
    message: ChatMessage;
    progress: number;
    isFirstMessage: boolean;
    fileDetails: FileDetail[];
};

export const Message: FC<MessageProps> = ({ message, progress, isFirstMessage, fileDetails }) => {
    return (
        <div
            className={clsx(
                "flex w-full items-center justify-center border-b border-gray-200 py-8",
                message.role === "user" ? "bg-white" : "bg-gray-100",
            )}
        >
            <div className="flex w-full max-w-screen-md items-start space-x-4 px-5 sm:px-0">
                <div className={clsx("p-1.5 text-white", message.role === "assistant" ? "bg-green-500" : "bg-black")}>
                    {message.role === "user" ? <User width={20} /> : <Bot width={20} />}
                </div>
                {message.role === "assistant" ? (
                    <>
                        <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
                            <div
                                className={clsx("h-full bg-green-500", isFirstMessage ? "animate-spin-slow" : "")}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <div className="flex w-full items-center justify-center text-xs text-green-500">
                            {message.content}
                        </div>
                    </>
                ) : (
                    <div className="flex w-full flex-col">
                        <ReactMarkdown
                            className="prose mt-1 break-words prose-p:leading-relaxed"
                            remarkPlugins={[remarkGfm]}
                            components={{
                                a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                        <div className="mt-2 grid grid-cols-4 gap-2">
                            {fileDetails &&
                                fileDetails.map((file) => (
                                    <div key={file.name} className="flex items-center space-x-1">
                                        {file.type.startsWith("image") ? (
                                            <ImageIcon className="h-3 w-3" />
                                        ) : (
                                            <DocumentIcon className="h-3 w-3" />
                                        )}
                                        <span className="block w-28 truncate text-xs text-gray-500">{file.name}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const MessageList: FC = () => {
    const { messages } = useChat();

    return (
        <>
            {messages.map((message, i) => (
                <Message key={i} message={message} progress={0} isFirstMessage={false} fileDetails={[]} />
            ))}
        </>
    );
};
