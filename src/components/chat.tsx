"use client";

import { FC } from "react";

import { useChat } from "@/providers/ChatProvider";
import { InitializeChat } from "./initialize-chat";

import dynamic from "next/dynamic";
import { Feed } from "./feed";

const InputForm = dynamic(() => import("./input-form"), {
    ssr: false,
});

export const Chat: FC = () => {
    const { isReady } = useChat();

    if (!isReady) {
        return <InitializeChat />;
    }

    return (
        <>
            <Feed />

            <InputForm />
        </>
    );
};
