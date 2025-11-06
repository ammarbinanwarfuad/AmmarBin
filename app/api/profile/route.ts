import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Profile from "@/models/Profile";
import { addTimingHeaders, measureTime } from "@/lib/server-timing";
import { invalidateCacheAfterUpdate } from "@/lib/cache-invalidation";
import { unstable_cache } from "next/cache";

export async function GET() {
  const startTime = Date.now();
  let dbTime = 0;
  
  try {
    // Use unstable_cache for server-side caching (15 minutes TTL - profile changes rarely)
    const getCachedProfile = unstable_cache(
      async () => {
    const { result: dbResult, duration: dbDuration } = await measureTime('DB Connection', async () => {
      await connectDB();
      return await Profile.findOne().lean();
    });
    
    dbTime = dbDuration;
    let profile = dbResult;

    if (!profile) {
      // Create default profile if none exists
      profile = await Profile.create({
        name: "Ammar Bin Anwar Fuad",
        title: "Software Engineer & Developer",
        bio: "A tech enthusiast studying Computer Science and Engineering",
        email: "ammarbinanwarfuad@gmail.com",
        location: "Dhaka, Bangladesh",
        socialLinks: {
          github: "https://github.com/ammarbinanwarfuad",
          linkedin: "https://linkedin.com/in/ammarbinanwarfuad",
        },
        heroContent: {
          heading: "Hi, I'm Ammar",
          subheading: "Software Engineer & Developer",
          description:
            "A tech enthusiast studying Computer Science and Engineering at Green University of Bangladesh",
        },
        aboutContent:
          "I am a passionate software developer with experience in full-stack development.",
        languages: ["English", "Bengali"],
        hobbies: ["Coding", "Reading", "Technology"],
      });
    }

        return { profile, dbTime };
      },
      ['profile:main'],
      {
        tags: ['profile'],
        revalidate: 900, // 15 minutes
      }
    );

    const { profile, dbTime: cachedDbTime } = await getCachedProfile();
    dbTime = cachedDbTime || 0;

    const totalTime = Date.now() - startTime;
    const response = NextResponse.json(
      { profile },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          "CDN-Cache-Control": "public, s-maxage=60",
        },
      }
    );
    
    // Add timing headers for diagnostics
    return addTimingHeaders(response, {
      total: totalTime,
      db: dbTime,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/lib/auth");
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();

    // Ensure all fields are properly handled
    const updateData = {
      name: data.name,
      title: data.title,
      bio: data.bio,
      email: data.email,
      phone: data.phone || "",
      location: data.location || "",
      profileImage: data.profileImage || "",
      resumePDF: data.resumePDF || "",
      socialLinks: {
        github: data.socialLinks?.github || "",
        linkedin: data.socialLinks?.linkedin || "",
        facebook: data.socialLinks?.facebook || "",
        instagram: data.socialLinks?.instagram || "",
        twitter: data.socialLinks?.twitter || "",
        hashnode: data.socialLinks?.hashnode || "",
        portfolio: data.socialLinks?.portfolio || "",
      },
      heroContent: data.heroContent || {
        heading: data.heroContent?.heading || data.name || "",
        subheading: data.heroContent?.subheading || data.title || "",
        description: data.heroContent?.description || data.bio || "",
      },
      aboutContent: data.aboutContent || data.bio || "",
      languages: Array.isArray(data.languages) ? data.languages : [],
      hobbies: Array.isArray(data.hobbies) ? data.hobbies : [],
    };

    const profile = await Profile.findOneAndUpdate({}, updateData, {
      new: true,
      upsert: true,
    });

    // Invalidate cache (non-blocking, fire-and-forget)
    invalidateCacheAfterUpdate('profile');

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

