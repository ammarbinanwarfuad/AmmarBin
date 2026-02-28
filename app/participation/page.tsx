import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ParticipationListClient } from "./ParticipationListClient";

export default function ParticipationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl">
          <ParticipationListClient />
        </div>
      </main>
      <Footer />
    </div>
  );
}
