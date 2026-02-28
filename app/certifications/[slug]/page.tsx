import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getCertifications } from "@/lib/server/data";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Award,
  Calendar,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ArrowLeft,
  Shield,
  Building,
  Hash,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

export const revalidate = 3600; // 1 hour

interface Certificate {
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
}

// Generate URL-friendly slug from certificate title and ID to ensure uniqueness
const generateSlug = (title: string, id: string): string => {
  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  // Take last 8 characters of ID for uniqueness
  const uniqueId = id.slice(-8);
  return `${titleSlug}-${uniqueId}`;
};

const isExpired = (expiryDate?: string): boolean => {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
};

// Generate static paths for all certificates
export async function generateStaticParams() {
  const { certificates } = await getCertifications();
  
  return certificates.map((cert) => {
    const certificate = cert as unknown as Certificate;
    return {
      slug: generateSlug(certificate.title, certificate._id),
    };
  });
}

interface PageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { certificates } = await getCertifications();
  
  const certificate = certificates.find((cert) => {
    const c = cert as unknown as Certificate;
    return generateSlug(c.title, c._id) === slug;
  }) as unknown as Certificate | undefined;

  if (!certificate) {
    return {
      title: 'Certificate Not Found',
    };
  }

  return {
    title: `${certificate.title} - Certification`,
    description: certificate.description || `${certificate.title} certification from ${certificate.issuer}`,
  };
}

export default async function CertificateDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { certificates } = await getCertifications();
  
  // Find the certificate by slug
  const certificate = certificates.find((cert) => {
    const c = cert as unknown as Certificate;
    return generateSlug(c.title, c._id) === slug;
  }) as unknown as Certificate | undefined;

  if (!certificate) {
    notFound();
  }

  // Get other certificates (excluding current one)
  const otherCertificates = certificates
    .filter((cert) => (cert as unknown as Certificate)._id !== certificate._id)
    .slice(0, 3)
    .map(cert => cert as unknown as Certificate);

  const expired = isExpired(certificate.expiryDate);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 px-3 sm:px-4 md:px-6 py-8 md:py-16 lg:py-20 mt-16 md:mt-20">
        <div className="mx-auto max-w-6xl">
          {/* Back Button */}
          <Button
            asChild
            variant="ghost"
            className="mb-6 -ml-2 gap-2 hover:gap-3 transition-all"
          >
            <Link href="/certifications">
              <ArrowLeft className="h-4 w-4" />
              Back to Certifications
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content - Left Side (2/3 width on large screens) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Certificate Header */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-semibold">
                    {certificate.category}
                  </span>
                  {expired ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 rounded-full">
                      <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                      <span className="text-xs sm:text-sm font-medium text-red-600 dark:text-red-400">Expired</span>
                    </div>
                  ) : certificate.expiryDate ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                      <span className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">Lifetime Validity</span>
                    </div>
                  )}
                  {certificate.featured && (
                    <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-700 dark:text-yellow-400 rounded-full text-xs sm:text-sm font-semibold">
                      ⭐ Featured
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  {certificate.title}
                </h1>
                <div className="flex items-center gap-2 text-base sm:text-lg md:text-xl text-muted-foreground">
                  <Building className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                  <span className="font-medium">{certificate.issuer}</span>
                </div>
              </div>

              {/* Certificate Image */}
              {certificate.certificateImage && (
                <Card className="overflow-hidden border-2 shadow-lg">
                  <CardContent className="p-0">
                    <div className="relative w-full aspect-[4/3] sm:aspect-video lg:aspect-[16/10] bg-gradient-to-br from-muted to-muted/50">
                      <Image
                        src={certificate.certificateImage}
                        alt={`${certificate.title} - Certificate`}
                        fill
                        className="object-contain p-2 sm:p-4"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 800px"
                        priority
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              {certificate.description && (
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      About This Certificate
                    </h2>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                      {certificate.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Skills */}
              {certificate.skills && certificate.skills.length > 0 && (
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Skills Covered
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {certificate.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground rounded-lg text-xs sm:text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - Right Side (1/3 width on large screens) */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
              {/* Certificate Details */}
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">Certificate Details</h2>
                
                {/* Issue Date */}
                <Card className="border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 bg-blue-500/10 rounded-lg shrink-0">
                        <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-1 font-medium">Issue Date</p>
                        <p className="text-sm sm:text-base lg:text-lg font-semibold text-foreground">
                          {format(new Date(certificate.issueDate), "MMMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Expiry Date */}
                {certificate.expiryDate && (
                  <Card className={`border-2 transition-colors ${expired ? 'border-red-200 dark:border-red-900' : 'border-green-200 dark:border-green-900'}`}>
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`p-2.5 sm:p-3 rounded-lg shrink-0 ${expired ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                          <Clock className={`h-5 w-5 sm:h-6 sm:w-6 ${expired ? 'text-red-600' : 'text-green-600'}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm text-muted-foreground mb-1 font-medium">
                            {expired ? 'Expired On' : 'Expires On'}
                          </p>
                          <p className="text-sm sm:text-base lg:text-lg font-semibold text-foreground">
                            {format(new Date(certificate.expiryDate), "MMMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Credential ID */}
                {certificate.credentialId && (
                  <Card className="border-2 hover:border-primary/50 transition-colors">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="p-2.5 sm:p-3 bg-purple-500/10 rounded-lg shrink-0">
                          <Hash className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-muted-foreground mb-1 font-medium">Credential ID</p>
                          <p className="text-xs sm:text-sm font-mono font-semibold text-foreground break-all">
                            {certificate.credentialId}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Verification */}
                {certificate.verificationUrl && (
                  <Card className="border-2 border-green-200 dark:border-green-900 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20">
                    <CardContent className="p-4 sm:p-5">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="p-2.5 sm:p-3 bg-green-500/10 rounded-lg shrink-0">
                            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm text-muted-foreground font-medium">Verification Available</p>
                            <p className="text-xs text-muted-foreground mt-1">Click below to verify authenticity</p>
                          </div>
                        </div>
                        <Button
                          asChild
                          variant="default"
                          className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                          size="lg"
                        >
                          <a
                            href={certificate.verificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Verify Certificate
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* Other Certifications */}
          {otherCertificates.length > 0 && (
            <div className="mt-12 pt-12 border-t border-border">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Explore More Certifications
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Browse other certificates from my collection
                  </p>
                </div>
                <Button asChild variant="default" className="gap-2 shrink-0">
                  <Link href="/certifications">
                    <Award className="h-4 w-4" />
                    View All Certifications
                  </Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {otherCertificates.map((cert) => (
                  <Card key={cert._id} className="h-full hover:shadow-lg transition-shadow overflow-hidden group">
                    {cert.certificateImage && (
                      <div className="relative h-32 bg-muted overflow-hidden">
                        <Image
                          src={cert.certificateImage}
                          alt={cert.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                        {cert.category}
                      </span>
                      <h3 className="font-semibold text-foreground mt-3 mb-1 line-clamp-2">
                        {cert.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {cert.issuer}
                      </p>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                      >
                        <Link href={`/certifications/${generateSlug(cert.title, cert._id)}`}>
                          View Details
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
