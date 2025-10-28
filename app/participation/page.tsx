"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Calendar, MapPin, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useParticipations } from "@/lib/hooks/usePublicData";

interface Participation {
  _id: string;
  programName: string;
  organization: string;
  role: string;
  startDate: Date;
  endDate: Date;
  location: string;
  description: string;
  impact: string;
  images: string[];
}

export default function ParticipationPage() {
  // Use SWR for data fetching - automatic caching, revalidation, and error handling
  const { participations, isLoading } = useParticipations();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Notable Participation
            </h1>
            <p className="text-lg text-muted-foreground mb-12">
              Community involvement and volunteer work
            </p>

            {isLoading ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Loading participation data...</p>
              </Card>
            ) : participations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {participations.map((participation: Participation, index: number) => (
                  <motion.div
                    key={participation._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="p-6 h-full">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="shrink-0">
                          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                            <Users className="h-5 w-5 text-accent-foreground" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-foreground mb-1">
                            {participation.programName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {participation.organization}
                          </p>
                        </div>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-foreground mb-2">
                          Role: {participation.role}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {formatDate(participation.startDate)} -{" "}
                              {formatDate(participation.endDate)}
                            </span>
                          </div>
                          {participation.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{participation.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {participation.description && (
                        <p className="text-sm text-foreground/80 mb-3">
                          {participation.description}
                        </p>
                      )}
                      {participation.impact && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-sm font-semibold text-foreground mb-1">
                            Impact:
                          </p>
                          <p className="text-sm text-foreground/80">
                            {participation.impact}
                          </p>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  No participation data available yet.
                </p>
              </Card>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

