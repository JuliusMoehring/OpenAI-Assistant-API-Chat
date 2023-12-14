import { Bot } from "lucide-react";
import { FC, PropsWithChildren } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Skeleton } from "../ui/skeleton";

const AssistantMessageContainer: FC<PropsWithChildren> = ({ children }) => {
    return (
        <div className="flex w-full items-center justify-center border-b px-4 py-8">
            <div className="flex w-full max-w-screen-md items-start space-x-4">
                <div className="shrink-0 overflow-hidden rounded bg-green-500 p-1.5 text-white">
                    <Bot className="h-6 w-6" />
                </div>

                <div className="flex w-full flex-col">{children}</div>
            </div>
        </div>
    );
};

type AssistantMessageProps = {
    content: string;
};

export const AssistantMessage: FC<AssistantMessageProps> = ({ content }) => {
    return (
        <AssistantMessageContainer>
            <ReactMarkdown
                className="prose mt-1 break-words text-foreground prose-p:leading-relaxed"
                remarkPlugins={[remarkGfm]}
                components={{
                    a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                }}
            >
                {content}
            </ReactMarkdown>
        </AssistantMessageContainer>
    );
};

export const AssistantMessageLoadingSkeleton: FC = () => {
    return (
        <AssistantMessageContainer>
            <Skeleton className="h-7 w-1/2" />
        </AssistantMessageContainer>
    );
};
