import { FC } from "react";

import { InputForm } from "./input-form";
import { LinkBar } from "./link-bar";
import { MessageList } from "./message-list";

export const Chat: FC = () => {
  return (
    <main className="h-screen bg-space-grey-light">
      <LinkBar />

      <MessageList />

      <InputForm />
    </main>
  );
};
