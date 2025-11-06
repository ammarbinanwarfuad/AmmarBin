import Link from "next/link";
import { LazyMotionDiv } from "@/components/LazyMotion";
import { Button } from "@/components/ui/button";
import { Download, MapPin, Languages, Heart } from "lucide-react";

interface ProfileData {
  name: string;
  title: string;
  bio: string;
  profileImage: string;
  email: string;
  location: string;
  aboutContent: string;
  languages: string[];
  hobbies: string[];
  resumePDF?: string;
}

interface AboutContentProps {
  profile: ProfileData;
}

// SSR AboutContent component (for public pages)
export function AboutContent({ profile }: AboutContentProps) {
  return (
    <LazyMotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="md:col-span-2 space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {profile?.name || "Ammar Bin Anwar Fuad"}
        </h2>
        <p className="text-lg text-muted-foreground mb-4">
          {profile?.title || "Software Engineer & Developer"}
        </p>
        <p className="text-base text-foreground/90 leading-relaxed">
          {profile?.aboutContent ||
            "I currently live in Dhaka, Bangladesh and work remotely as a Staff Engineer at Voyage Mobile Inc, while being a 4th year undergraduate student at Green University of Bangladesh."}
        </p>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground">
        <MapPin className="h-5 w-5" />
        <span>{profile?.location || "Dhaka, Bangladesh"}</span>
      </div>

      {profile?.languages && profile.languages.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Languages className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Languages</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.languages.map((lang) => (
              <span
                key={lang}
                className="px-3 py-1 bg-accent text-accent-foreground rounded-md text-sm"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile?.hobbies && profile.hobbies.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">
              Interests & Hobbies
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.hobbies.map((hobby) => (
              <span
                key={hobby}
                className="px-3 py-1 bg-accent text-accent-foreground rounded-md text-sm"
              >
                {hobby}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4">
        {profile?.resumePDF ? (
          <a href={`/api/resume/download?url=${encodeURIComponent(profile.resumePDF)}&name=${encodeURIComponent('Resume.pdf')}`}>
            <Button className="gap-2">
              <Download className="h-4 w-4" /> Download Resume
            </Button>
          </a>
        ) : (
          <Link href="/resume">
            <Button className="gap-2">
              <Download className="h-4 w-4" /> Download Resume
            </Button>
          </Link>
        )}
      </div>
    </LazyMotionDiv>
  );
}
