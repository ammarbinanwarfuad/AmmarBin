"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BlogBackButtonProps {
  variant?: "default" | "outline" | "ghost";
  className?: string;
  fullWidth?: boolean;
}

export function BlogBackButton({ 
  variant = "ghost", 
  className = "",
  fullWidth = false 
}: BlogBackButtonProps) {
  const router = useRouter();
  
  return (
    <Button
      variant={variant}
      onClick={() => router.push("/blog")}
      className={fullWidth ? `w-full sm:w-auto ${className}` : className}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {variant === "outline" ? "Back to All Posts" : "Back to Blog"}
    </Button>
  );
}

