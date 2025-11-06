import { LazyMotionDiv } from "@/components/LazyMotion";
import { Card } from "@/components/ui/card";
import { Calendar, MapPin, GraduationCap, Award } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Education {
  _id: string;
  institution: string;
  institutionLogo?: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  current?: boolean;
  location?: string;
  grade?: string;
  description?: string;
  achievements?: string[];
}

interface EducationListProps {
  education: Education[];
}

// SSR EducationList component (for public pages)
export function EducationList({ education }: EducationListProps) {
  if (education.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">
          No education information available.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {education.map((edu, index) => (
        <LazyMotionDiv
          key={edu._id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-accent-foreground" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {edu.degree}
                  {edu.field && ` - ${edu.field}`}
                </h3>
                <p className="text-lg text-muted-foreground mb-2">
                  {edu.institution}
                </p>
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(edu.startDate)} - {edu.current ? "Present" : edu.endDate ? formatDate(edu.endDate) : "Present"}
                    </span>
                  </div>
                  {edu.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{edu.location}</span>
                    </div>
                  )}
                  {edu.grade && (
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      <span>GPA: {edu.grade}</span>
                    </div>
                  )}
                </div>
                {edu.description && (
                  <p className="text-foreground/90 mb-4">
                    {edu.description}
                  </p>
                )}
                {edu.achievements && edu.achievements.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Achievements:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-foreground/80">
                      {edu.achievements.map((achievement, i) => (
                        <li key={i}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </LazyMotionDiv>
      ))}
    </div>
  );
}
