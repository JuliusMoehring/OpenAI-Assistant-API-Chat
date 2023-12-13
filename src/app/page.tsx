"use client";

import { Chat } from "@/components/chat";
import { ChatProvider } from "@/providers/ChatProvider";
import { NextPage } from "next";

const Root: NextPage = () => {
    return (
        <div>
            <ChatProvider>
                <Chat />
            </ChatProvider>
        </div>
    );
};

export default Root;
