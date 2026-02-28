"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RefreshCw, Home } from "lucide-react";

export function OfflineActions() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <Button
        onClick={() => window.location.reload()}
        size="lg"
        className="gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
      <Button asChild size="lg" variant="outline">
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          Go Home
        </Link>
      </Button>
    </div>
  );
}
