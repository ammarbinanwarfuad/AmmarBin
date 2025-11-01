"use client";

import { useState } from "react";
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { MessageCard } from "@/components/admin/MessageCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Mail, Trash2, Eye, CheckSquare, Square } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { mutate } from 'swr';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Message {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface MessagesData {
  messages: Message[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function MessagesClient({ initialData }: { initialData: MessagesData }) {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, error, mutate: mutateSWR } = useSWR(
    `/api/contact?page=${currentPage}&limit=25`,
    fetcher,
    {
      fallbackData: initialData,
      refreshInterval: 0,
    }
  );
  const messages = data?.messages || [];
  const pagination = data?.pagination || {};
  const refresh = () => mutateSWR();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());

  // Session redirect handled by server component

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Message deleted successfully!");
        setSelectedMessage(null);
        setSelectedMessages((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        mutate('/api/contact');
      } else {
        toast.error("Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("An error occurred");
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMessages((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedMessages.size === messages.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(messages.map((m: Message) => m._id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMessages.size === 0) return;
    try {
      const response = await fetch("/api/contact/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedMessages) }),
      });
      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.deletedCount} message(s) deleted successfully!`);
        const wasSelectedMessageDeleted = selectedMessage && selectedMessages.has(selectedMessage._id);
        setSelectedMessages(new Set());
        if (wasSelectedMessageDeleted) {
          setSelectedMessage(null);
        }
        mutate('/api/contact');
      } else {
        toast.error("Failed to delete messages");
      }
    } catch (error) {
      console.error("Error bulk deleting messages:", error);
      toast.error("An error occurred");
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });

      if (response.ok) {
        mutate('/api/contact');
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const unreadCount = messages.filter((m: Message) => !m.read).length;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Contact Messages</h1>
            <p className="text-muted-foreground mt-2">
              {unreadCount > 0 && (
                <span className="text-primary font-medium">{unreadCount} unread • </span>
              )}
              {messages.length} total messages
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedMessages.size > 0 && (
              <>
                <span className="flex items-center text-sm text-muted-foreground">
                  {selectedMessages.size} selected
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete Selected ({selectedMessages.size})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Selected Messages</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedMessages.size} message(s)? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleBulkDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            <Button
              variant="outline"
              onClick={handleSelectAll}
              className="gap-2"
            >
              {selectedMessages.size === messages.length && messages.length > 0 ? (
                <>
                  <Square className="h-4 w-4" /> Deselect All
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4" /> Select All
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1 overflow-auto space-y-3" style={{ maxHeight: '600px' }}>
            {messages.length > 0 ? (
              messages.map((message: Message) => (
                <MessageCard
                  key={message._id}
                  message={message}
                  isSelected={selectedMessage?._id === message._id}
                  isChecked={selectedMessages.has(message._id)}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (!message.read) markAsRead(message._id);
                  }}
                  onToggleSelect={(e) => handleToggleSelect(message._id, e)}
                />
              ))
            ) : !isLoading ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {error ? "Unable to load messages" : "No messages yet"}
                  </p>
                  {error && (
                    <Button
                      onClick={() => refresh()}
                      variant="outline"
                      size="sm"
                      className="mt-4"
                    >
                      Try Again
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedMessage.subject}</CardTitle>
                        <CardDescription className="mt-2">
                          From: {selectedMessage.name} ({selectedMessage.email})
                        </CardDescription>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(selectedMessage.createdAt), "MMMM dd, yyyy 'at' HH:mm")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          asChild
                        >
                          <a href={`mailto:${selectedMessage.email}`} aria-label="Reply via email">
                            <Mail className="h-4 w-4" />
                          </a>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Message</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this message from &ldquo;{selectedMessage.name}&rdquo;?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(selectedMessage._id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-secondary/50 p-4 rounded-lg">
                      <p className="whitespace-pre-line text-sm">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-32">
                  <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select a message to view</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === pagination.pages}
              onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

