import { XIcon } from "lucide-react";
import { FC } from "react";
import { FileIcon } from "./file-icon";

type FileInputProps = {
    name: string;
    type: string;
    handleRemove: () => void;
};

export const FileInput: FC<FileInputProps> = ({ name, type, handleRemove }) => {
    return (
        <div className="flex w-full items-center justify-between space-x-1">
            <div className="flex w-full items-center gap-2">
                <FileIcon type={type} className="h-5 w-5" />

                <p className="line-clamp-1 text-xs text-muted-foreground">{name}</p>
            </div>

            <button
                type="button"
                onClick={handleRemove}
                className="shrink-0 rounded p-1 transition-colors duration-200 hover:bg-gray-200"
            >
                <XIcon className="h-4 w-4 text-muted-foreground" />
            </button>
        </div>
    );
};
