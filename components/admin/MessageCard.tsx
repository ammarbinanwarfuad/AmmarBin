import { memo } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare, CheckSquare, Square } from "lucide-react";
import { format } from "date-fns";

interface Message {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface MessageCardProps {
  message: Message;
  isSelected: boolean;
  isChecked: boolean;
  onClick: () => void;
  onToggleSelect: (e: React.MouseEvent) => void;
}

// ✅ OPTIMIZED: Memoized component to prevent unnecessary re-renders
export const MessageCard = memo(function MessageCard({
  message,
  isSelected,
  isChecked,
  onClick,
  onToggleSelect,
}: MessageCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition-all ${
        isSelected
          ? "border-primary"
          : message.read
          ? "opacity-70"
          : "border-l-4 border-l-primary"
      } ${isChecked ? "ring-2 ring-primary" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={onToggleSelect}
              className="mt-1 flex-shrink-0"
            >
              {isChecked ? (
                <CheckSquare className="h-4 w-4 text-primary" />
              ) : (
                <Square className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              )}
            </button>
            <div
              className={`p-2 rounded-lg ${
                message.read ? "bg-secondary" : "bg-primary/10"
              }`}
            >
              <MessageSquare
                className={`h-4 w-4 ${
                  message.read ? "text-muted-foreground" : "text-primary"
                }`}
              />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">
                {message.name}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {message.subject}
              </CardDescription>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(message.createdAt), "MMM dd, yyyy")}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}, 
// Custom comparison function for better memoization
(prevProps, nextProps) => {
  return (
    prevProps.message._id === nextProps.message._id &&
    prevProps.message.read === nextProps.message.read &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isChecked === nextProps.isChecked
  );
});
