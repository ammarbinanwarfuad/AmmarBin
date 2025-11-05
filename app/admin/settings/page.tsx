"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Save, User, Mail, Globe } from "lucide-react";
import toast from "react-hot-toast";
import { ImageUpload } from "@/components/ImageUpload";
import { useProfile } from "@/lib/hooks/useAdminData";

interface ProfileSettings {
  name: string;
  title: string;
  bio: string;
  aboutContent: string;
  email: string;
  phone: string;
  location: string;
  profileImage: string;
  resumePDF: string;
  heroContent: {
    heading: string;
    subheading: string;
    description: string;
  };
  languages: string[];
  hobbies: string[];
  socialLinks: {
    github: string;
    linkedin: string;
    facebook: string;
    instagram: string;
    twitter: string;
    hashnode: string;
    portfolio: string;
  };
}

export default function AdminSettingsPage() {
  const { status } = useSession();
  const router = useRouter();
  const { profile, isLoading, refresh } = useProfile();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileSettings>({
    name: "",
    title: "",
    bio: "",
    aboutContent: "",
    email: "",
    phone: "",
    location: "",
    profileImage: "",
    resumePDF: "",
    heroContent: {
      heading: "",
      subheading: "",
      description: "",
    },
    languages: [],
    hobbies: [],
    socialLinks: {
      github: "",
      linkedin: "",
      facebook: "",
      instagram: "",
      twitter: "",
      hashnode: "",
      portfolio: "",
    },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        title: profile.title || "",
        bio: profile.bio || "",
        aboutContent: profile.aboutContent || profile.bio || "",
        email: profile.email || "",
        phone: profile.phone || "",
        location: profile.location || "",
        profileImage: profile.profileImage || "",
        resumePDF: profile.resumePDF || "",
        heroContent: {
          heading: profile.heroContent?.heading || profile.name || "",
          subheading: profile.heroContent?.subheading || profile.title || "",
          description: profile.heroContent?.description || profile.bio || "",
        },
        languages: Array.isArray(profile.languages) ? profile.languages : [],
        hobbies: Array.isArray(profile.hobbies) ? profile.hobbies : [],
        socialLinks: {
          github: profile.socialLinks?.github || "",
          linkedin: profile.socialLinks?.linkedin || "",
          facebook: profile.socialLinks?.facebook || "",
          instagram: profile.socialLinks?.instagram || "",
          twitter: profile.socialLinks?.twitter || "",
          hashnode: profile.socialLinks?.hashnode || "",
          portfolio: profile.socialLinks?.portfolio || "",
        },
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Settings saved successfully!");
        refresh();
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Profile Settings</h1>
          </div>
          <p className="text-muted-foreground">Update your portfolio information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Personal Information</CardTitle>
              </div>
              <CardDescription>Basic information about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <Label htmlFor="title">Professional Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Short bio about yourself..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="aboutContent">About Content</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Detailed description for the About page
                </p>
                <Textarea
                  id="aboutContent"
                  value={formData.aboutContent}
                  onChange={(e) => setFormData({ ...formData, aboutContent: e.target.value })}
                  placeholder="Write a detailed description about yourself, your journey, experiences..."
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>

          {/* Hero Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Hero Content</CardTitle>
              </div>
              <CardDescription>Content displayed on the homepage hero section</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="heroHeading">Heading</Label>
                <Input
                  id="heroHeading"
                  value={formData.heroContent.heading}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      heroContent: { ...formData.heroContent, heading: e.target.value },
                    })
                  }
                  placeholder="Hi, I'm Ammar"
                />
              </div>
              <div>
                <Label htmlFor="heroSubheading">Subheading</Label>
                <Input
                  id="heroSubheading"
                  value={formData.heroContent.subheading}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      heroContent: { ...formData.heroContent, subheading: e.target.value },
                    })
                  }
                  placeholder="Software Engineer & Developer"
                />
              </div>
              <div>
                <Label htmlFor="heroDescription">Description</Label>
                <Textarea
                  id="heroDescription"
                  value={formData.heroContent.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      heroContent: { ...formData.heroContent, description: e.target.value },
                    })
                  }
                  placeholder="A brief description that appears in the hero section..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Languages & Hobbies */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Languages & Hobbies</CardTitle>
              </div>
              <CardDescription>Languages you speak and your interests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="languages">Languages</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Separate languages with commas (e.g., English, Bengali, Spanish)
                </p>
                <Input
                  id="languages"
                  value={formData.languages.join(", ")}
                  onChange={(e) => {
                    const languages = e.target.value
                      .split(",")
                      .map((lang) => lang.trim())
                      .filter(Boolean);
                    setFormData({ ...formData, languages });
                  }}
                  placeholder="English, Bengali"
                />
              </div>
              <div>
                <Label htmlFor="hobbies">Hobbies & Interests</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Separate hobbies with commas (e.g., Coding, Reading, Travel)
                </p>
                <Input
                  id="hobbies"
                  value={formData.hobbies.join(", ")}
                  onChange={(e) => {
                    const hobbies = e.target.value
                      .split(",")
                      .map((hobby) => hobby.trim())
                      .filter(Boolean);
                    setFormData({ ...formData, hobbies });
                  }}
                  placeholder="Coding, Reading, Learning New Technologies"
                />
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <CardTitle>Media</CardTitle>
              </div>
              <CardDescription>Profile picture and resume</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Profile Image</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Upload any image format (crop optional)
                </p>
                <ImageUpload
                  value={formData.profileImage}
                  onChange={(value) => setFormData({ ...formData, profileImage: value as string })}
                  folder="profile"
                  accept="*"
                  enableCrop={true}
                  cropAspect={1}
                  maxSize={20}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Or paste URL directly:
                </p>
                <Input
                  value={formData.profileImage}
                  onChange={(e) =>
                    setFormData({ ...formData, profileImage: e.target.value })
                  }
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Resume / Media</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Upload any file (PDF, images, videos, etc.)
                </p>
                <ImageUpload
                  value={formData.resumePDF}
                  onChange={(value) => setFormData({ ...formData, resumePDF: value as string })}
                  folder="resume"
                  accept="*"
                  maxSize={50}
                  enableCrop={false}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Or paste URL directly:
                </p>
                <Input
                  value={formData.resumePDF}
                  onChange={(e) =>
                    setFormData({ ...formData, resumePDF: e.target.value })
                  }
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <CardTitle>Social Links</CardTitle>
              </div>
              <CardDescription>Your social media profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    value={formData.socialLinks.github}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, github: e.target.value },
                      })
                    }
                    placeholder="https://github.com/username"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, linkedin: e.target.value },
                      })
                    }
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={formData.socialLinks.twitter}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, twitter: e.target.value },
                      })
                    }
                    placeholder="https://twitter.com/username"
                  />
                </div>
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={formData.socialLinks.facebook}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, facebook: e.target.value },
                      })
                    }
                    placeholder="https://facebook.com/username"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.socialLinks.instagram}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, instagram: e.target.value },
                      })
                    }
                    placeholder="https://instagram.com/username"
                  />
                </div>
                <div>
                  <Label htmlFor="hashnode">Hashnode</Label>
                  <Input
                    id="hashnode"
                    value={formData.socialLinks.hashnode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, hashnode: e.target.value },
                      })
                    }
                    placeholder="https://hashnode.com/@username"
                  />
                </div>
                <div>
                  <Label htmlFor="portfolio">Portfolio</Label>
                  <Input
                    id="portfolio"
                    value={formData.socialLinks.portfolio}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socialLinks: { ...formData.socialLinks, portfolio: e.target.value },
                      })
                    }
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

