"use client";

import { useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LazyMotionDiv } from "@/components/LazyMotion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Briefcase, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Experience {
  _id: string;
  company: string;
  companyLogo?: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  location: string;
  description: string;
  responsibilities: string[];
  skills: string[];
}

interface Participation {
  _id: string;
  title: string;
  organization: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  location: string;
  description: string;
  impact: string;
  images: string[];
}

interface ExperienceTabsClientProps {
  experiences: Experience[];
  participations: Participation[];
}

// Client component for tab interactivity
export function ExperienceTabsClient({ experiences, participations }: ExperienceTabsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const [, startTransition] = useTransition();
  
  const [activeTab, setActiveTab] = useState<"experience" | "participation">(
    tabParam === "participation" ? "participation" : "experience"
  );

  // Update URL when tab changes - use transition for non-blocking update
  const handleTabChange = (tab: "experience" | "participation") => {
    setActiveTab(tab);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <>
      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8 border-b border-border">
        <Button
          variant="ghost"
          className={`rounded-none border-b-2 ${
            activeTab === "experience"
              ? "border-primary text-primary"
              : "border-transparent"
          }`}
          onClick={() => handleTabChange("experience")}
        >
          <Briefcase className="h-4 w-4 mr-2" />
          Work Experience ({experiences.length})
        </Button>
        <Button
          variant="ghost"
          className={`rounded-none border-b-2 ${
            activeTab === "participation"
              ? "border-primary text-primary"
              : "border-transparent"
          }`}
          onClick={() => handleTabChange("participation")}
        >
          <Users className="h-4 w-4 mr-2" />
          Participation & Activities ({participations.length})
        </Button>
      </div>

      {/* Work Experience Section */}
      {activeTab === "experience" && (
        <div className="space-y-8">
          {experiences.length > 0 ? (
            experiences.map((exp, index) => (
              <LazyMotionDiv
                key={exp._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {exp.role}
                      </h3>
                      <p className="text-lg text-muted-foreground mb-2">
                        {exp.company}
                      </p>
                      <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(exp.startDate)} -{" "}
                            {exp.current ? "Present" : formatDate(exp.endDate!)}
                          </span>
                        </div>
                        {exp.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{exp.location}</span>
                          </div>
                        )}
                      </div>
                      {exp.description && (
                        <p className="text-foreground/90 mb-4">
                          {exp.description}
                        </p>
                      )}
                      {exp.responsibilities && exp.responsibilities.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-foreground mb-2">
                            Key Responsibilities:
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-foreground/80">
                            {exp.responsibilities.map((resp, i) => (
                              <li key={i}>{resp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {exp.skills && exp.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {exp.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-3 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </LazyMotionDiv>
            ))
          ) : (
            <Card className="p-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No work experience added yet.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Participation Section */}
      {activeTab === "participation" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {participations.length > 0 ? (
            participations.map((participation, index) => (
              <LazyMotionDiv
                key={participation._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-1">
                        {participation.title}
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
                          {participation.current
                            ? "Present"
                            : participation.endDate
                            ? formatDate(participation.endDate)
                            : "N/A"}
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
                      <p className="text-sm font-semibold text-foreground mb-2">
                        Impact:
                      </p>
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium">
                        {participation.impact}
                      </span>
                    </div>
                  )}
                </Card>
              </LazyMotionDiv>
            ))
          ) : (
            <Card className="p-12 text-center col-span-2">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No participation activities added yet.
              </p>
            </Card>
          )}
        </div>
      )}
    </>
  );
}

