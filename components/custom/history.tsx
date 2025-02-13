"use client";

import Link from "next/link";
import { Chat } from "@/db/schema";
import { User } from "next-auth";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

import { fetcher } from "@/lib/utils";

import { DeleteIcon, HistoryIcon, PlusIcon } from "./icons";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

export const History = ({ user }: { user: User | undefined }) => {
  const { id } = useParams();
  const pathname = usePathname();
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const {
    data: history,
    isLoading,
    mutate,
  } = useSWR<Array<Chat>>(user ? "/api/history" : null, fetcher, {
    fallbackData: [],
  });

  useEffect(() => {
    mutate();
  }, [pathname, mutate]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    const deletePromise = fetch(`/api/chat?id=${deleteId}`, {
      method: "DELETE",
    });

    toast.promise(deletePromise, {
      loading: "Deleting chat...",
      success: () => {
        mutate((history) => {
          if (history) {
            return history.filter((h) => h.id !== id);
          }
        });
        return "Chat deleted successfully";
      },
      error: "Failed to delete chat",
    });

    setShowDeleteDialog(false);
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-accent/50 transition-colors"
          >
            <HistoryIcon />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-lg font-medium">History</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto history-scrollbar">
              <div className="flex flex-col gap-1 p-2">
                <Link href="/" className="w-full">
                  <Button
                    variant="ghost"
                    className="flex flex-row items-center gap-2 w-full justify-start hover:bg-accent/50 transition-colors rounded-lg p-3"
                  >
                    <PlusIcon />
                    <span>New Chat</span>
                  </Button>
                </Link>
                {history.map((chat) => (
                  <div
                    key={chat.id}
                    className="group history-item"
                  >
                    <Link href={`/chat/${chat.id}`} className="flex-1">
                      <Button
                        variant="ghost"
                        className="history-button w-full"
                      >
                        {(chat.messages[0]?.content as string)?.slice(0, 30) ||
                          "New Chat"}
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="history-delete-button"
                      onClick={() => {
                        setDeleteId(chat.id);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <DeleteIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
