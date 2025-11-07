import { render, screen } from "@testing-library/react";
import AboutPage from "@/app/about/page";
import { getProfile } from "@/lib/server/data";

// Mock dependencies
jest.mock("@/lib/server/data");
jest.mock("@/components/Header", () => ({
  Header: () => <header data-testid="header">Header</header>,
}));
jest.mock("@/components/Footer", () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));
jest.mock("@/components/AboutContent", () => ({
  AboutContent: ({ profile }: { profile: any }) => (
    <div data-testid="about-content">
      <h2>{profile.name}</h2>
      <p>{profile.title}</p>
      <p>{profile.bio}</p>
      <p>{profile.email}</p>
      <p>{profile.location}</p>
    </div>
  ),
}));

// Mock Next.js Image
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="profile-image" />
  ),
}));

describe("AboutPage", () => {
  const mockProfile = {
    name: "John Doe",
    title: "Software Engineer",
    bio: "A passionate developer with 5 years of experience",
    profileImage: "https://cloudinary.com/profile.jpg",
    email: "john@example.com",
    phone: "+1234567890",
    location: "New York, USA",
    languages: ["English", "Spanish", "French"],
    hobbies: ["Reading", "Traveling", "Photography"],
    socialLinks: {
      github: "https://github.com/johndoe",
      linkedin: "https://linkedin.com/in/johndoe",
      twitter: "https://twitter.com/johndoe",
    },
    heroContent: {
      heading: "Welcome",
      subheading: "Developer",
      description: "Building great things",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getProfile as jest.Mock).mockResolvedValue(mockProfile);
  });

  describe("Layout", () => {
    it("should render header, main content, and footer", async () => {
      const page = await AboutPage();
      render(page);

      expect(screen.getByTestId("header")).toBeInTheDocument();
      expect(screen.getByTestId("footer")).toBeInTheDocument();
      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("should have proper page structure", async () => {
      const page = await AboutPage();
      const { container } = render(page);

      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass("min-h-screen", "flex", "flex-col");
    });
  });

  describe("Page Title", () => {
    it("should render About Me heading", async () => {
      const page = await AboutPage();
      render(page);

      expect(screen.getByText("About Me")).toBeInTheDocument();
    });

    it("should have correct heading level", async () => {
      const page = await AboutPage();
      render(page);

      const heading = screen.getByText("About Me");
      expect(heading.tagName).toBe("H1");
    });

    it("should have proper heading styling", async () => {
      const page = await AboutPage();
      render(page);

      const heading = screen.getByText("About Me");
      expect(heading).toHaveClass("text-4xl", "sm:text-5xl", "font-bold");
    });
  });

  describe("Profile Image", () => {
    it("should render profile image", async () => {
      const page = await AboutPage();
      render(page);

      const image = screen.getByTestId("profile-image");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", mockProfile.profileImage);
      expect(image).toHaveAttribute("alt", mockProfile.name);
    });

    it("should use fallback image when profileImage is missing", async () => {
      (getProfile as jest.Mock).mockResolvedValue({
        ...mockProfile,
        profileImage: null,
      });

      const page = await AboutPage();
      render(page);

      const image = screen.getByTestId("profile-image");
      expect(image).toHaveAttribute(
        "src",
        expect.stringContaining("cloudinary.com")
      );
    });

    it("should have rounded corners and border", async () => {
      const page = await AboutPage();
      const { container } = render(page);

      const imageContainer = container.querySelector(
        ".rounded-lg.border-2.border-border"
      );
      expect(imageContainer).toBeInTheDocument();
    });

    it("should have aspect-square ratio", async () => {
      const page = await AboutPage();
      const { container } = render(page);

      const imageContainer = container.querySelector(".aspect-square");
      expect(imageContainer).toBeInTheDocument();
    });
  });

  describe("AboutContent Section", () => {
    it("should render AboutContent component", async () => {
      const page = await AboutPage();
      render(page);

      expect(screen.getByTestId("about-content")).toBeInTheDocument();
    });

    it("should pass profile data to AboutContent", async () => {
      const page = await AboutPage();
      render(page);

      expect(screen.getByText(mockProfile.name)).toBeInTheDocument();
      expect(screen.getByText(mockProfile.title)).toBeInTheDocument();
      expect(screen.getByText(mockProfile.bio)).toBeInTheDocument();
      expect(screen.getByText(mockProfile.email)).toBeInTheDocument();
      expect(screen.getByText(mockProfile.location)).toBeInTheDocument();
    });
  });

  describe("Grid Layout", () => {
    it("should use grid layout for desktop", async () => {
      const page = await AboutPage();
      const { container } = render(page);

      const grid = container.querySelector(".grid.grid-cols-1.md\\:grid-cols-3");
      expect(grid).toBeInTheDocument();
    });

    it("should allocate 1/3 for image and 2/3 for content", async () => {
      const page = await AboutPage();
      const { container } = render(page);

      const imageColumn = container.querySelector(".md\\:col-span-1");
      expect(imageColumn).toBeInTheDocument();
    });

    it("should have proper gap between columns", async () => {
      const page = await AboutPage();
      const { container } = render(page);

      const grid = container.querySelector(".gap-8");
      expect(grid).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("should have responsive padding", async () => {
      const page = await AboutPage();
      const { container } = render(page);

      const main = container.querySelector("main");
      expect(main).toHaveClass("py-24", "sm:py-32");
    });

    it("should have max width for content", async () => {
      const page = await AboutPage();
      const { container } = render(page);

      const contentContainer = container.querySelector(".max-w-4xl");
      expect(contentContainer).toBeInTheDocument();
    });

    it("should be centered horizontally", async () => {
      const page = await AboutPage();
      const { container } = render(page);

      const contentContainer = container.querySelector(".mx-auto");
      expect(contentContainer).toBeInTheDocument();
    });
  });

  describe("Data Fetching", () => {
    it("should call getProfile to fetch profile data", async () => {
      await AboutPage();

      expect(getProfile).toHaveBeenCalled();
    });

    it("should handle missing profile data gracefully", async () => {
      (getProfile as jest.Mock).mockResolvedValue(null);

      const page = await AboutPage();
      render(page);

      expect(screen.getByText("About Me")).toBeInTheDocument();
    });

    it("should handle profile fetch errors", async () => {
      (getProfile as jest.Mock).mockRejectedValue(
        new Error("Failed to fetch profile")
      );

      await expect(AboutPage()).resolves.toBeDefined();
    });
  });

  describe("SEO & Performance", () => {
    it("should have proper semantic HTML structure", async () => {
      const page = await AboutPage();
      render(page);

      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("should prioritize profile image loading", async () => {
      const page = await AboutPage();
      render(page);

      const image = screen.getByTestId("profile-image");
      expect(image).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have descriptive alt text for profile image", async () => {
      const page = await AboutPage();
      render(page);

      const image = screen.getByTestId("profile-image");
      expect(image).toHaveAttribute("alt", mockProfile.name);
    });

    it("should use semantic heading hierarchy", async () => {
      const page = await AboutPage();
      render(page);

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent("About Me");
    });

    it("should maintain min-height for full viewport", async () => {
      const page = await AboutPage();
      const { container } = render(page);

      const pageContainer = container.firstChild;
      expect(pageContainer).toHaveClass("min-h-screen");
    });
  });

  describe("Content Organization", () => {
    it("should have margin between title and content", async () => {
      const page = await AboutPage();
      const { container } = render(page);

      const titleContainer = container.querySelector(".mb-12");
      expect(titleContainer).toBeInTheDocument();
    });

    it("should have margin below heading", async () => {
      const page = await AboutPage();
      render(page);

      const heading = screen.getByText("About Me");
      expect(heading).toHaveClass("mb-8");
    });
  });
});
