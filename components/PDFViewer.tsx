"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Loader2,
  Download,
  ExternalLink,
} from "lucide-react";

interface PDFViewerProps {
  url: string;
}

export function PDFViewer({ url }: PDFViewerProps) {
  const [scale, setScale] = useState<number>(100);
  const [loading, setLoading] = useState<boolean>(true);

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 20, 200));
  };

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 20, 50));
  };

  const handleFitWidth = () => {
    setScale(100);
  };

  const handleDownload = () => {
    // Create a temporary link to trigger a single, user-initiated download
    const link = document.createElement("a");
    link.href = url;
    link.download = "resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
  };

  // Use Google Docs Viewer to render multi-page PDFs inline without auto-downloads
  const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="p-4 sticky top-20 z-10 bg-background/95 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={scale <= 50}
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[80px] text-center">
              {scale}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={scale >= 200}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFitWidth}
              title="Fit to Width"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              title="Download PDF"
            >
              <Download className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Download</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(url, "_blank")}
              title="Open in New Tab"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Open</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* PDF Display */}
      <Card className="p-4 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading PDF...</span>
          </div>
        )}
        <div className="relative w-full" style={{ minHeight: "800px" }}>
          <iframe
            src={googleDocsViewerUrl}
            className="w-full border-0 rounded-lg shadow-lg"
            style={{
              height: "calc(100vh - 250px)",
              minHeight: "800px",
              transform: `scale(${scale / 100})`,
              transformOrigin: "top center",
              transition: "transform 0.3s ease",
            }}
            title="Resume PDF"
            onLoad={handleLoad}
            onError={handleError}
          />
        </div>

      </Card>
    </div>
  );
}
