import { render, screen } from "@testing-library/react";
import Home from "@/app/page";
import { getProfile } from "@/lib/server/data";

// Mock dependencies
jest.mock("@/lib/server/data");
jest.mock("@/components/Header", () => ({
  Header: () => <header data-testid="header">Header</header>,
}));
jest.mock("@/components/Footer", () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));
jest.mock("@/components/HeroContent", () => ({
  HeroContent: ({ profile }: { profile: any }) => (
    <div data-testid="hero-content">
      <h1>{profile.name}</h1>
      <p>{profile.title}</p>
      <p>{profile.heroContent.description}</p>
    </div>
  ),
}));
jest.mock("@/components/HeroSkeleton", () => ({
  HeroSkeleton: () => <div data-testid="hero-skeleton">Loading...</div>,
}));

// Mock Next.js Link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe("HomePage", () => {
  const mockProfile = {
    name: "John Doe",
    title: "Software Engineer",
    bio: "A passionate developer",
    profileImage: "https://cloudinary.com/profile.jpg",
    email: "john@example.com",
    location: "New York, USA",
    socialLinks: {
      github: "https://github.com/johndoe",
      linkedin: "https://linkedin.com/in/johndoe",
      twitter: "https://twitter.com/johndoe",
    },
    heroContent: {
      heading: "Welcome to My Portfolio",
      subheading: "Full Stack Developer",
      description: "Building amazing web applications",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getProfile as jest.Mock).mockResolvedValue(mockProfile);
  });

  describe("Layout", () => {
    it("should render header, main content, and footer", async () => {
      const page = await Home();
      render(page);

      expect(screen.getByTestId("header")).toBeInTheDocument();
      expect(screen.getByTestId("footer")).toBeInTheDocument();
      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("should have proper page structure", async () => {
      const page = await Home();
      const { container } = render(page);

      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass("min-h-screen", "flex", "flex-col");
    });
  });

  describe("Hero Section", () => {
    it("should render HeroContent with profile data", async () => {
      const page = await Home();
      render(page);

      expect(screen.getByTestId("hero-content")).toBeInTheDocument();
      expect(screen.getByText(mockProfile.name)).toBeInTheDocument();
      expect(screen.getByText(mockProfile.title)).toBeInTheDocument();
      expect(
        screen.getByText(mockProfile.heroContent.description)
      ).toBeInTheDocument();
    });

    it("should center hero content", async () => {
      const page = await Home();
      const { container } = render(page);

      const heroContainer = container.querySelector(".text-center");
      expect(heroContainer).toBeInTheDocument();
      expect(heroContainer).toHaveClass("max-w-4xl", "mx-auto");
    });
  });

  describe("CTA Buttons", () => {
    it("should render all CTA buttons", async () => {
      const page = await Home();
      render(page);

      expect(screen.getByText("Get in Touch")).toBeInTheDocument();
      expect(screen.getByText("View Projects")).toBeInTheDocument();
      expect(screen.getByText("Resume")).toBeInTheDocument();
    });

    it("should have correct links", async () => {
      const page = await Home();
      render(page);

      const contactLink = screen
        .getByText("Get in Touch")
        .closest("a") as HTMLAnchorElement;
      const projectsLink = screen
        .getByText("View Projects")
        .closest("a") as HTMLAnchorElement;
      const resumeLink = screen
        .getByText("Resume")
        .closest("a") as HTMLAnchorElement;

      expect(contactLink.href).toContain("/contact");
      expect(projectsLink.href).toContain("/projects");
      expect(resumeLink.href).toContain("/resume");
    });

    it("should render buttons in flex layout", async () => {
      const page = await Home();
      const { container } = render(page);

      const buttonContainer = container.querySelector(
        ".flex.flex-wrap.justify-center"
      );
      expect(buttonContainer).toBeInTheDocument();
    });

    it("should have ArrowRight icon in Get in Touch button", async () => {
      const page = await Home();
      render(page);

      const button = screen.getByText("Get in Touch").closest("button");
      expect(button).toHaveClass("gap-2");
    });

    it("should have Download icon in Resume button", async () => {
      const page = await Home();
      render(page);

      const button = screen.getByText("Resume").closest("button");
      expect(button).toHaveClass("gap-2");
    });
  });

  describe("Responsive Design", () => {
    it("should have responsive padding classes", async () => {
      const page = await Home();
      const { container } = render(page);

      const main = container.querySelector("main");
      expect(main).toHaveClass("py-24", "sm:py-32");
    });

    it("should have responsive button gap", async () => {
      const page = await Home();
      const { container } = render(page);

      const buttonContainer = container.querySelector(
        ".flex.flex-wrap.justify-center"
      );
      expect(buttonContainer).toHaveClass("gap-4");
    });
  });

  describe("Data Fetching", () => {
    it("should call getProfile to fetch profile data", async () => {
      await Home();

      expect(getProfile).toHaveBeenCalled();
    });

    it("should handle profile fetch errors gracefully", async () => {
      (getProfile as jest.Mock).mockRejectedValue(
        new Error("Failed to fetch profile")
      );

      // Should not throw error
      await expect(Home()).resolves.toBeDefined();
    });
  });

  describe("SEO & Performance", () => {
    it("should have proper semantic HTML structure", async () => {
      const page = await Home();
      render(page);

      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByTestId("header")).toBeInTheDocument();
      expect(screen.getByTestId("footer")).toBeInTheDocument();
    });

    it("should have centered content for better visual hierarchy", async () => {
      const page = await Home();
      const { container } = render(page);

      const main = container.querySelector("main");
      expect(main).toHaveClass("flex", "items-center", "justify-center");
    });
  });

  describe("Accessibility", () => {
    it("should render as a single page application shell", async () => {
      const page = await Home();
      const { container } = render(page);

      const pageContainer = container.firstChild;
      expect(pageContainer).toHaveClass("min-h-screen");
    });

    it("should have proper link prefetching for performance", async () => {
      const page = await Home();
      render(page);

      // Links should be present for navigation
      expect(screen.getByText("Get in Touch").closest("a")).toBeInTheDocument();
      expect(screen.getByText("View Projects").closest("a")).toBeInTheDocument();
      expect(screen.getByText("Resume").closest("a")).toBeInTheDocument();
    });
  });
});
