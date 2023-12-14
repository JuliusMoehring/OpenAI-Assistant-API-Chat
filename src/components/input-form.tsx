"use client";

import { LoadingCircle } from "@/app/icons";
import { cn } from "@/lib/shadcn/utils";
import { useChat } from "@/providers/ChatProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, SendHorizonalIcon } from "lucide-react";
import { ChangeEvent, FC, useEffect } from "react";
import { Control, useFieldArray, useForm } from "react-hook-form";
import Textarea from "react-textarea-autosize";
import { z } from "zod";
import { FileInput } from "./file-input";
import { Button, buttonVariants } from "./ui/button";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { useToast } from "./ui/use-toast";

const InputFormSchema = z.object({
    prompt: z.string().min(1),
    files: z
        .array(
            z.object({
                file: z.instanceof(File),
            }),
        )
        .default([]),
});

type InputFormType = z.infer<typeof InputFormSchema>;

export const InputForm: FC = () => {
    const { toast } = useToast();
    const { isReady, isFetchingAssistantMessage, chatManager } = useChat();

    const form = useForm({
        resolver: zodResolver(InputFormSchema),
        defaultValues: {
            prompt: "",
            files: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control as unknown as Control<InputFormType, any>,
        name: "files",
    });

    const handleSelectFiles = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;

        if (!files) {
            return;
        }

        const fileArray = Array.from(files);

        fileArray.forEach((file) => {
            append({
                file,
            });
        });
    };

    const onSubmit = async (values: InputFormType) => {
        if (!isReady || !chatManager) {
            return;
        }

        const message = values.prompt.trim();
        const files = values.files.map(({ file }) => file);

        try {
            form.reset();

            await chatManager.sendMessage(message, files);
        } catch (error) {
            if (error instanceof Error) {
                return toast({
                    title: "Error",
                    description: error.message,
                });
            }

            toast({
                title: "Error",
                description: "An unknown error occurred",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        const submitFormKeyBind = (event: KeyboardEvent) => {
            if (event.key === "Enter" && event.metaKey) {
                form.handleSubmit(onSubmit)();
            }
        };

        document.addEventListener("keydown", submitFormKeyBind);

        return () => {
            document.removeEventListener("keydown", submitFormKeyBind);
        };
    }, []);

    const canInput = isReady && !isFetchingAssistantMessage;

    return (
        <div className="fixed bottom-0 flex w-full flex-col items-center space-y-3 bg-gradient-to-b from-transparent via-gray-100 to-gray-100 p-5 pb-3 sm:px-0">
            <div className="flex w-full max-w-screen-md flex-col items-stretch">
                <div className="mb-4 flex w-full max-w-screen-md flex-col gap-1">
                    {fields.map(({ id, file }, index) => (
                        <FileInput key={id} name={file.name} type={file.type} handleRemove={() => remove(index)} />
                    ))}
                </div>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex w-full items-end gap-4 rounded-xl border border-gray-200 bg-white p-4"
                    >
                        <label
                            htmlFor="file-upload"
                            className={cn(
                                buttonVariants({ size: "icon" }),
                                "shrink-0",
                                isReady ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-200",
                            )}
                        >
                            <input
                                type="file"
                                id="file-upload"
                                style={{ display: "none" }}
                                multiple
                                accept=".c,.cpp,.csv,.docx,.html,.java,.json,.md,.pdf,.pptx,.txt,.tex,image/jpeg,image/png"
                                onChange={handleSelectFiles}
                                disabled={!canInput}
                            />
                            <PlusIcon className="h-4 w-4" />
                        </label>

                        <FormField
                            control={form.control}
                            name="prompt"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormControl>
                                        <Textarea
                                            placeholder="Send a message"
                                            className="w-full resize-none focus:outline-none"
                                            tabIndex={0}
                                            rows={1}
                                            autoFocus
                                            spellCheck={false}
                                            maxRows={5}
                                            {...field}
                                            disabled={!isReady}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <Button
                            size="icon"
                            className={cn(
                                "shrink-0 justify-center",
                                isReady ? "bg-green-500 hover:bg-green-600" : "bg-gray-200",
                            )}
                            disabled={!canInput}
                        >
                            {isFetchingAssistantMessage ? <LoadingCircle /> : <SendHorizonalIcon className="h-4 w-4" />}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
};
