import { FileDetailsType } from "@/providers/ChatProvider";
import { User } from "lucide-react";
import { FC } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileIcon } from "../file-icon";

type UserMessageProps = {
    content: string;
    fileDetails: FileDetailsType[];
};

export const UserMessage: FC<UserMessageProps> = ({ content, fileDetails }) => {
    return (
        <div className="flex w-full items-center justify-center border-b px-4 py-8">
            <div className="flex w-full max-w-screen-md items-start space-x-4">
                <div className="shrink-0 overflow-hidden rounded bg-foreground p-1.5 text-background">
                    <User className="h-6 w-6" />
                </div>
                <div className="flex w-full flex-col">
                    <ReactMarkdown
                        className="prose mt-1 break-words text-foreground prose-p:leading-relaxed"
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
