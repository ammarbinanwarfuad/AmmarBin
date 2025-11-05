import Image from "next/image";

interface ProfileData {
  name: string;
  title: string;
  bio: string;
  profileImage: string;
  email: string;
  location: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  heroContent: {
    heading: string;
    subheading: string;
    description: string;
  };
}

interface HeroContentProps {
  profile: ProfileData;
}

export function HeroContent({ profile }: HeroContentProps) {
  return (
    <>
      {/* Profile Image - Critical for LCP, optimized with Cloudinary transformations */}
      <div className="flex justify-center mb-8">
        <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-border">
          <Image
            src={
              profile?.profileImage 
                ? profile.profileImage.includes('/upload/') 
                  ? profile.profileImage.replace('/upload/', '/upload/c_fill,w_384,h_384,f_avif,q_70,dpr_2/')
                  : profile.profileImage
                : "https://res.cloudinary.com/ammarbin/image/upload/c_fill,w_384,h_384,f_avif,q_70,dpr_2/v1762075570/profile/fshoacntppx9mgjwvlca.jpg"
            }
            alt={profile?.name || "Ammar Bin Anwar Fuad"}
            fill
            className="object-cover"
            priority
            fetchPriority="high"
            sizes="(max-width: 640px) 192px, 192px"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQEDAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            loading="eager"
            quality={65}
          />
        </div>
      </div>

      {/* Name - Critical content, no animation delay */}
      <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-4">
        {profile?.name || "Ammar Bin Anwar Fuad"}
      </h1>

      {/* Title - Critical content, no animation delay */}
      <p className="text-xl sm:text-2xl text-muted-foreground mb-6">
        {profile?.title || "Software Engineer & Developer"}
      </p>

      {/* Description - Critical content, no animation delay */}
      <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
        {profile?.heroContent?.description ||
          profile?.bio ||
          "A tech enthusiast studying Computer Science and Engineering at Green University of Bangladesh"}
      </p>
    </>
  );
}

