import { FC } from "react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./ui/alert-dialog";

export const UnauthorizedDialog: FC = () => {
    return (
        <AlertDialog open>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>You are not authorized to use this assistant</AlertDialogTitle>
                </AlertDialogHeader>

                <AlertDialogDescription>
                    You are not authorized to use this assistant. Please contact the assistant owner to request access.
                </AlertDialogDescription>
            </AlertDialogContent>
        </AlertDialog>
    );
};
