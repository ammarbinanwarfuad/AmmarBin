import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Search } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <div className="mx-auto mb-4 text-6xl font-bold text-muted-foreground">
              404
            </div>
            <CardTitle className="text-3xl">Page Not Found</CardTitle>
            <CardDescription className="text-lg">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/blog">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Blog
                </Link>
              </Button>
            </div>
            <div className="pt-6 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                Popular pages:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/about">About</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/projects">Projects</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/skills">Skills</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/contact">Contact</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

