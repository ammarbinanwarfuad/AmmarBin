import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WifiOff } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { OfflineActions } from './OfflineActions';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <WifiOff className="h-16 w-16 text-muted-foreground mx-auto" />
            </div>
            <CardTitle className="text-3xl">You&apos;re Offline</CardTitle>
            <CardDescription className="text-lg">
              It looks like you&apos;ve lost your internet connection. Please check your network and try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>While you&apos;re offline, you can:</p>
              <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
                <li>View previously visited pages</li>
                <li>Browse cached content</li>
                <li>Read saved blog posts</li>
              </ul>
            </div>
            <OfflineActions />
            <div className="pt-6 border-t">
              <p className="text-xs text-muted-foreground">
                This page is available offline. Once you reconnect, refresh to see the latest content.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

