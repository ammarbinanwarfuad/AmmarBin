import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getCertifications } from "@/lib/server/data";
import { CertificationsGridWithFilter } from "@/components/CertificationsGridWithFilter";

export const dynamic = 'force-dynamic'; // No caching

export default async function CertificationsPage() {
  const { certificates, stats } = await getCertifications();
  
  // Extract unique categories
  const categories = Array.from(
    new Set(certificates.map((cert) => cert.category as string).filter(Boolean))
  ).sort() as string[];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Certifications & Credentials
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional certifications and credentials earned throughout my career
            </p>
          </div>

          <CertificationsGridWithFilter
            certificates={certificates as Array<{
              _id: string;
              title: string;
              issuer: string;
              category: string;
              issueDate: string;
              expiryDate?: string;
              credentialId?: string;
              verificationUrl?: string;
              certificateImage?: string;
              skills?: string[];
              description?: string;
              featured: boolean;
            }>}
            stats={stats}
            categories={categories}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
