import { FC } from "react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./ui/alert-dialog";

export const InvalidAssistantDialog: FC = () => {
    return (
        <AlertDialog open>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Assistant not found</AlertDialogTitle>
                </AlertDialogHeader>

                <AlertDialogDescription>
                    The assistant you are trying to access does not exist. Please check the URL and try again.
                </AlertDialogDescription>
            </AlertDialogContent>
        </AlertDialog>
    );
};
