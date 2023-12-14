import { cn } from "@/lib/shadcn/utils";
import { FileImageIcon, FileTextIcon } from "lucide-react";
import { ComponentPropsWithoutRef, FC } from "react";

type FileIconProps = ComponentPropsWithoutRef<"svg"> & {
    type: string;
};

export const FileIcon: FC<FileIconProps> = ({ type, className, ...rest }) => {
    if (type.startsWith("image")) {
        return <FileImageIcon className={cn("h-3 w-3 shrink-0", className)} {...rest} />;
    }

    return <FileTextIcon className={cn("h-3 w-3 shrink-0", className)} {...rest} />;
};
