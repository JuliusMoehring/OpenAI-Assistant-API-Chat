import { FC } from "react";

import { InputForm } from "./input-form";
import { LinkBar } from "./link-bar";
import { MessageList } from "./message-list";

export const Chat: FC = () => {
  return (
    <main className="flex flex-col items-center justify-between bg-space-grey-light pb-40">
      <LinkBar />
      <MessageList />

      <InputForm />
    </main>
  );
};
