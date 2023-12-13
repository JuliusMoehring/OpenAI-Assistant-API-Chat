import { DocumentIcon } from "@/app/icons";
import { ImageIcon, XIcon } from "lucide-react";
import { FC } from "react";

type FileInputProps = {
  name: string;
  type: string;
  handleRemove: () => void;
};

export const FileInput: FC<FileInputProps> = ({ name, type, handleRemove }) => {
  return (
    <div className="flex items-center space-x-1">
      {type.startsWith("image") ? (
        <ImageIcon className="h-3 w-3" />
      ) : (
        <DocumentIcon className="h-3 w-3" />
      )}

      <span className="text-xs text-gray-500">{name}</span>

      <button
        type="button"
        onClick={handleRemove}
        className="rounded p-1 transition-colors duration-200 hover:bg-gray-200"
      >
        <XIcon className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  );
};
