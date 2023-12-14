import { FC } from "react";

import { useChat } from "@/providers/ChatProvider";
import { InitializeChat } from "./initialize-chat";
import { InputForm } from "./input-form";
import { MessageList } from "./message-list";

export const Chat: FC = () => {
    const { isReady } = useChat();

    if (!isReady) {
        return <InitializeChat />;
    }

    return (
        <>
            <MessageList />

            <InputForm />
        </>
    );
};
