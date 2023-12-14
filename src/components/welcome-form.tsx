import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, FC } from "react";
import { z } from "zod";

import { cn } from "@/lib/shadcn/utils";
import { FileSchema } from "@/providers/ChatProvider";
import { PlusIcon } from "lucide-react";
import { Control, useFieldArray, useForm } from "react-hook-form";
import { FileInput } from "./file-input";
import { AlertDialog, AlertDialogAction, AlertDialogContent } from "./ui/alert-dialog";
import { buttonVariants } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";

const MODELS = {
    GPT_3_5: "gpt-3.5-turbo-1106",
    GPT_4: "gpt-4-1106-preview",
} as const;

type ModelType = (typeof MODELS)[keyof typeof MODELS];

const ModelToNameMap: Record<ModelType, string> = {
    [MODELS.GPT_3_5]: "GPT-3.5 Turbo",
    [MODELS.GPT_4]: "GPT-4",
};

const CreateAssistantFormSchema = z.object({
    name: z.string().min(1, "Assistant name is required"),
    description: z.string().optional(),
    model: z.enum([MODELS.GPT_3_5, MODELS.GPT_4]),
    files: z.array(FileSchema).default([]),
});

type CreateAssistantFormType = z.infer<typeof CreateAssistantFormSchema>;

export const WelcomeForm: FC = () => {
    const form = useForm({
        resolver: zodResolver(CreateAssistantFormSchema),
        defaultValues: {
            name: "",
            description: "",
            model: MODELS.GPT_3_5,
            files: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control as unknown as Control<CreateAssistantFormType, any>,
        name: "files",
    });

    const handleSelectFiles = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;

        if (!files) {
            return;
        }

        const fileArray = Array.from(files);

        for (const file of fileArray) {
            const name = file.name;
            const type = file.type;
            const content = await file.text();
            const size = file.size;

            append({
                name,
                type,
                content,
                size,
            });
        }
    };

    const onSubmit = async (values: CreateAssistantFormType) => {
        console.log(values);
    };

    return (
        <AlertDialog open>
            <AlertDialogContent>
                <h1 className="text-lg font-semibold text-black">Welcome to Agent42!</h1>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>

                                        <FormControl>
                                            <Input placeholder="Assistant name" {...field} />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>

                                        <FormControl>
                                            <Textarea
                                                placeholder="Assistant description"
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="model"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Model</FormLabel>

                                        <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                                            <FormControl>
                                                <SelectTrigger className="w-60">
                                                    <SelectValue placeholder="Select a model" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent>
                                                {Object.entries(MODELS).map(([key, value]) => (
                                                    <SelectItem key={key} value={value}>
                                                        {ModelToNameMap[value]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="files"
                                render={() => (
                                    <FormItem>
                                        <FormLabel className="block w-full">Knowledge</FormLabel>

                                        <div>
                                            <input
                                                type="file"
                                                id="file-upload"
                                                style={{ display: "none" }}
                                                multiple
                                                accept=".c,.cpp,.csv,.docx,.html,.java,.json,.md,.pdf,.pptx,.txt,.tex,image/jpeg,image/png"
                                                onChange={handleSelectFiles}
                                            />
                                            <label
                                                htmlFor="file-upload"
                                                className={cn(buttonVariants({ variant: "outline" }), "shrink-0")}
                                            >
                                                <PlusIcon className="mr-2 h-4 w-4" />
                                                Upload Files
                                            </label>

                                            <div className="mt-4 space-y-2">
                                                {fields.map(({ id, name, type }, index) => (
                                                    <FileInput
                                                        key={id}
                                                        name={name}
                                                        type={type}
                                                        handleRemove={() => remove(index)}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <AlertDialogAction type="submit" className="mt-8 w-full">
                            Start
                        </AlertDialogAction>
                    </form>
                </Form>
            </AlertDialogContent>
        </AlertDialog>
    );
};
