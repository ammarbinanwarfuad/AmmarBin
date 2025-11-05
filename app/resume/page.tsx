import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { getProfile } from "@/lib/server/data";
import { PDFViewer } from "@/components/PDFViewer";
import Link from "next/link";

export const dynamic = 'force-dynamic'; // No caching

export default async function ResumePage() {
  const profile = await getProfile();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                  Resume
                </h1>
                <p className="text-lg text-muted-foreground">
                  Download my resume or view it online
                </p>
              </div>
              {profile?.resumePDF && (
                <a href={`/api/resume/download?url=${encodeURIComponent(profile.resumePDF)}&name=${encodeURIComponent((profile.name || 'Resume') + '.pdf')}`}>
                  <Button className="gap-2">
                    <Download className="h-4 w-4" /> Download PDF
                  </Button>
                </a>
              )}
            </div>

            {profile?.resumePDF ? (
              <PDFViewer url={profile.resumePDF} />
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-6">
                  Resume PDF not available yet.
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/about">
                    <Button variant="outline" className="gap-2">
                      View About Page
                    </Button>
                  </Link>
                  <Link href="/experience">
                    <Button variant="outline" className="gap-2">
                      View Experience
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
