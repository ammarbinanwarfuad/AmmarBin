/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { GET, PUT } from "@/app/api/profile/route";
import { connectDB } from "@/lib/db";
import Profile from "@/models/Profile";
import { getServerSession } from "next-auth";

// Mock dependencies
jest.mock("@/lib/db");
jest.mock("@/models/Profile");
jest.mock("next-auth");
jest.mock("@/lib/cache-invalidation", () => ({
  invalidateCacheAfterUpdate: jest.fn(),
}));
jest.mock("next/cache", () => ({
  unstable_cache: (fn: any) => fn,
}));
jest.mock("@/lib/server-timing", () => ({
  measureTime: jest.fn(async (_name: string, fn: any) => {
    const result = await fn();
    return { result, duration: 50 };
  }),
  addTimingHeaders: jest.fn((response: any) => response),
}));

describe("Profile API", () => {
  const mockProfile = {
    _id: "profile123",
    name: "Ammar Bin Anwar Fuad",
    title: "Software Engineer & Developer",
    bio: "A tech enthusiast studying Computer Science and Engineering",
    email: "ammarbinanwarfuad@gmail.com",
    phone: "+8801234567890",
    location: "Dhaka, Bangladesh",
    profileImage: "https://cloudinary.com/profile.jpg",
    resumePDF: "https://cloudinary.com/resume.pdf",
    socialLinks: {
      github: "https://github.com/ammarbinanwarfuad",
      linkedin: "https://linkedin.com/in/ammarbinanwarfuad",
      facebook: "https://facebook.com/ammarbinanwarfuad",
      instagram: "https://instagram.com/ammarbinanwarfuad",
      twitter: "https://twitter.com/ammarbinanwarfuad",
      hashnode: "https://hashnode.com/@ammarbinanwarfuad",
      portfolio: "https://ammarbinanwarfuad.com",
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
  };

  const mockSession = {
    user: {
      email: "admin@example.com",
      name: "Admin User",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/profile", () => {
    it("should return existing profile", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Profile.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockProfile),
      });

      const response = await GET();
      const data = await response.json();

      expect(connectDB).toHaveBeenCalled();
      expect(Profile.findOne).toHaveBeenCalled();
      expect(data.profile).toMatchObject({
        name: mockProfile.name,
        title: mockProfile.title,
        email: mockProfile.email,
      });
      expect(response.headers.get("Cache-Control")).toContain("public");
    });

    it("should create default profile if none exists", async () => {
      const defaultProfile = {
        name: "Ammar Bin Anwar Fuad",
        title: "Software Engineer & Developer",
        bio: "A tech enthusiast studying Computer Science and Engineering",
        email: "ammarbinanwarfuad@gmail.com",
      };

      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Profile.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });
      (Profile.create as jest.Mock).mockResolvedValue(defaultProfile);

      const response = await GET();
      const data = await response.json();

      expect(Profile.create).toHaveBeenCalled();
      expect(data.profile).toMatchObject({
        name: defaultProfile.name,
        title: defaultProfile.title,
      });
    });

    it("should return profile with all social links", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Profile.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockProfile),
      });

      const response = await GET();
      const data = await response.json();

      expect(data.profile.socialLinks).toBeDefined();
      expect(data.profile.socialLinks.github).toBe(mockProfile.socialLinks.github);
      expect(data.profile.socialLinks.linkedin).toBe(mockProfile.socialLinks.linkedin);
    });

    it("should return profile with hero content", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Profile.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockProfile),
      });

      const response = await GET();
      const data = await response.json();

      expect(data.profile.heroContent).toBeDefined();
      expect(data.profile.heroContent.heading).toBe(mockProfile.heroContent.heading);
      expect(data.profile.heroContent.subheading).toBe(
        mockProfile.heroContent.subheading
      );
    });

    it("should return profile with languages and hobbies", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Profile.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockProfile),
      });

      const response = await GET();
      const data = await response.json();

      expect(data.profile.languages).toEqual(mockProfile.languages);
      expect(data.profile.hobbies).toEqual(mockProfile.hobbies);
    });

    it("should include cache control headers", async () => {
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Profile.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockProfile),
      });

      const response = await GET();

      expect(response.headers.get("Cache-Control")).toContain("public");
      expect(response.headers.get("Cache-Control")).toContain("s-maxage");
    });

    it("should handle database errors gracefully", async () => {
      (connectDB as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to fetch profile");
    });
  });

  describe("PUT /api/profile", () => {
    it("should update profile with valid data when authenticated", async () => {
      const updateData = {
        name: "Updated Name",
        title: "Updated Title",
        bio: "Updated bio",
        email: "updated@example.com",
        phone: "+8801111111111",
        location: "Updated Location",
        socialLinks: {
          github: "https://github.com/updated",
          linkedin: "https://linkedin.com/in/updated",
        },
        heroContent: {
          heading: "Updated Heading",
          subheading: "Updated Subheading",
          description: "Updated Description",
        },
        languages: ["English", "Spanish"],
        hobbies: ["Gaming", "Music"],
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Profile.findOneAndUpdate as jest.Mock).mockResolvedValue({
        ...mockProfile,
        ...updateData,
      });

      const request = new NextRequest("http://localhost/api/profile", {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(connectDB).toHaveBeenCalled();
      expect(Profile.findOneAndUpdate).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          name: updateData.name,
          title: updateData.title,
          bio: updateData.bio,
        }),
        { new: true, upsert: true }
      );
      expect(data.profile.name).toBe(updateData.name);
    });

    it("should reject unauthenticated requests", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost/api/profile", {
        method: "PUT",
        body: JSON.stringify({ name: "Test" }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(Profile.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("should handle partial updates (only some fields)", async () => {
      const partialUpdate = {
        name: "New Name",
        title: "New Title",
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Profile.findOneAndUpdate as jest.Mock).mockResolvedValue({
        ...mockProfile,
        ...partialUpdate,
      });

      const request = new NextRequest("http://localhost/api/profile", {
        method: "PUT",
        body: JSON.stringify(partialUpdate),
      });

      const response = await PUT(request);

      expect(response.status).toBe(200);
      expect(Profile.findOneAndUpdate).toHaveBeenCalled();
    });

    it("should handle empty optional fields", async () => {
      const updateData = {
        name: "Test Name",
        title: "Test Title",
        bio: "Test bio",
        email: "test@example.com",
        // phone, location, profileImage, resumePDF omitted
        socialLinks: {},
        languages: [],
        hobbies: [],
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Profile.findOneAndUpdate as jest.Mock).mockResolvedValue(updateData);

      const request = new NextRequest("http://localhost/api/profile", {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Profile.findOneAndUpdate).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          phone: "",
          location: "",
          profileImage: "",
          resumePDF: "",
        }),
        { new: true, upsert: true }
      );
    });

    it("should upsert profile if none exists", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Profile.findOneAndUpdate as jest.Mock).mockResolvedValue(mockProfile);

      const request = new NextRequest("http://localhost/api/profile", {
        method: "PUT",
        body: JSON.stringify({ name: "New Profile" }),
      });

      const response = await PUT(request);

      expect(Profile.findOneAndUpdate).toHaveBeenCalledWith(
        {},
        expect.any(Object),
        expect.objectContaining({ upsert: true })
      );
    });

    it("should handle social links update", async () => {
      const updateData = {
        name: "Test",
        title: "Test",
        bio: "Test",
        email: "test@example.com",
        socialLinks: {
          github: "https://github.com/newuser",
          linkedin: "https://linkedin.com/in/newuser",
          facebook: "https://facebook.com/newuser",
          instagram: "https://instagram.com/newuser",
          twitter: "https://twitter.com/newuser",
          hashnode: "https://hashnode.com/@newuser",
          portfolio: "https://newuser.com",
        },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Profile.findOneAndUpdate as jest.Mock).mockResolvedValue(updateData);

      const request = new NextRequest("http://localhost/api/profile", {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);

      expect(Profile.findOneAndUpdate).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          socialLinks: updateData.socialLinks,
        }),
        { new: true, upsert: true }
      );
    });

    it("should handle hero content update", async () => {
      const updateData = {
        name: "Test",
        title: "Test",
        bio: "Test",
        email: "test@example.com",
        heroContent: {
          heading: "New Hero Heading",
          subheading: "New Hero Subheading",
          description: "New Hero Description",
        },
      };

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Profile.findOneAndUpdate as jest.Mock).mockResolvedValue(updateData);

      const request = new NextRequest("http://localhost/api/profile", {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request);

      expect(Profile.findOneAndUpdate).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          heroContent: updateData.heroContent,
        }),
        { new: true, upsert: true }
      );
    });

    it("should invalidate cache after update", async () => {
      const { invalidateCacheAfterUpdate } = require("@/lib/cache-invalidation");

      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockResolvedValue(undefined);
      (Profile.findOneAndUpdate as jest.Mock).mockResolvedValue(mockProfile);

      const request = new NextRequest("http://localhost/api/profile", {
        method: "PUT",
        body: JSON.stringify({ name: "Test" }),
      });

      await PUT(request);

      expect(invalidateCacheAfterUpdate).toHaveBeenCalledWith("profile");
    });

    it("should handle database errors during update", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);
      (connectDB as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      );

      const request = new NextRequest("http://localhost/api/profile", {
        method: "PUT",
        body: JSON.stringify({ name: "Test" }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to update profile");
    });
  });
});
