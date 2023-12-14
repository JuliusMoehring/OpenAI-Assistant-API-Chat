import { FC } from "react";

import { InputForm } from "./input-form";
import { MessageList } from "./message-list";

export const Chat: FC = () => {
    return (
        <>
            <MessageList />

            <InputForm />
        </>
    );
};
