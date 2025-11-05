"use client";

import { useState } from "react";
import { LazyMotionDiv } from "@/components/LazyMotion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Award,
  Calendar,
  ExternalLink,
  Download,
  Search,
  Filter,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

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

interface Stats {
  total: number;
  active: number;
  expired: number;
  categories: { _id: string; count: number }[];
}

interface CertificationsGridProps {
  certificates: Certificate[];
  stats: Stats;
  categories: string[];
}

const categoryColors: string[] = [
  "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  "bg-green-500/10 text-green-600 dark:text-green-400",
  "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  "bg-red-500/10 text-red-600 dark:text-red-400",
  "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
];

const getCategoryColor = (category: string, index: number) => {
  return categoryColors[index % categoryColors.length];
};

export function CertificationsGrid({ certificates: initialCertificates, stats, categories }: CertificationsGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Client-side filtering
  const filteredCertificates = initialCertificates.filter((cert) => {
    const matchesCategory = selectedCategory === "all" || cert.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <>
      {/* Stats Section */}
      {stats && (
        <LazyMotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Certificates
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.active}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Categories
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.categories.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </LazyMotionDiv>
      )}

      {/* Search and Filter Section */}
      <LazyMotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8 space-y-4"
      >
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search certifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
            className="whitespace-nowrap"
          >
            All
            <span className="ml-2 text-xs opacity-70">
              ({stats.total})
            </span>
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
              <span className="ml-2 text-xs opacity-70">
                ({stats.categories.find((c) => c._id === category)?.count || 0})
              </span>
            </Button>
          ))}
        </div>
      </LazyMotionDiv>

      {/* Certificates Grid */}
      {filteredCertificates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No certifications found matching your criteria
            </p>
          </CardContent>
        </Card>
      ) : (
        <LazyMotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCertificates.map((cert, index) => (
            <LazyMotionDiv
              key={cert._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group">
                {/* Certificate Image */}
                {cert.certificateImage && (
                  <div className="relative h-48 bg-muted overflow-hidden">
                    <Image
                      src={cert.certificateImage}
                      alt={cert.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQEDAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                    {cert.featured && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium">
                        Featured
                      </div>
                    )}
                  </div>
                )}

                <CardContent className="p-6 space-y-4">
                  {/* Category Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        getCategoryColor(cert.category, index)
                      }`}
                    >
                      {cert.category}
                    </span>
                    {isExpired(cert.expiryDate) ? (
                      <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                        <XCircle className="h-4 w-4" />
                        <span className="text-xs">Expired</span>
                      </div>
                    ) : cert.expiryDate ? (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-xs">Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-xs">Lifetime</span>
                      </div>
                    )}
                  </div>

                  {/* Title and Issuer */}
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-2">
                      {cert.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {cert.issuer}
                    </p>
                  </div>

                  {/* Description */}
                  {cert.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {cert.description}
                    </p>
                  )}

                  {/* Skills */}
                  {cert.skills && cert.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {cert.skills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {cert.skills.length > 3 && (
                        <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                          +{cert.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Date Info */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(cert.issueDate), "MMM yyyy")}
                      {cert.expiryDate &&
                        !isExpired(cert.expiryDate) &&
                        ` - ${format(new Date(cert.expiryDate), "MMM yyyy")}`}
                    </span>
                  </div>

                  {/* Credential ID */}
                  {cert.credentialId && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">ID:</span> {cert.credentialId}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {cert.verificationUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(cert.verificationUrl, "_blank")}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Verify
                      </Button>
                    )}
                    {cert.certificateImage && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(cert.certificateImage, "_blank")}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </LazyMotionDiv>
          ))}
        </LazyMotionDiv>
      )}
    </>
  );
}

