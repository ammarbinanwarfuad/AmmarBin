"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { LazyMotionDiv } from "@/components/LazyMotion";
import { CertificationsGrid } from "./CertificationsGrid";

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

interface CertificationsGridWithFilterProps {
  certificates: Certificate[];
  stats: Stats;
  categories: string[];
}

// Client wrapper for search and filter functionality
export function CertificationsGridWithFilter({ 
  certificates: initialCertificates, 
  stats, 
  categories 
}: CertificationsGridWithFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Client-side filtering
  const filteredCertificates = useMemo(() => 
    initialCertificates.filter((cert) => {
      const matchesCategory = selectedCategory === "all" || cert.category === selectedCategory;
      const matchesSearch = !searchTerm || 
        cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesSearch;
    }),
    [initialCertificates, selectedCategory, searchTerm]
  );

  return (
    <>
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

      {/* Certifications Grid */}
      <CertificationsGrid 
        certificates={filteredCertificates} 
        stats={stats} 
      />
    </>
  );
}

