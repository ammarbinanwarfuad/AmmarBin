import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, ArrowLeft } from "lucide-react";

export default function CertificateNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              <Award className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Certificate Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The certificate you&apos;re looking for doesn&apos;t exist or may have been removed.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="default">
              <Link href="/certifications">
                <ArrowLeft className="h-4 w-4 mr-2" />
                View All Certifications
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
