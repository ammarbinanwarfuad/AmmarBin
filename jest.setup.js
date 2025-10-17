// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom"; // Add global TextEncoder/TextDecoder for Node environment
if (typeof TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: "/",
      query: {},
      asPath: "/",
    };
  },
  usePathname() {
    return "/";
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: "unauthenticated",
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}));

// Mock next-auth server functions
jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(),
  getServerSession: jest.fn(),
}));

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    section: ({ children, ...props }) => (
      <section {...props}>{children}</section>
    ),
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    a: ({ children, ...props }) => <a {...props}>{children}</a>,
  },
  AnimatePresence: ({ children }) => children,
  LazyMotion: ({ children }) => children,
  domAnimation: {},
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Menu: (props) => <svg data-testid="menu-icon" {...props} />,
  X: (props) => <svg data-testid="x-icon" {...props} />,
  Moon: (props) => <svg data-testid="moon-icon" {...props} />,
  Sun: (props) => <svg data-testid="sun-icon" {...props} />,
  Send: (props) => <svg data-testid="send-icon" {...props} />,
  Mail: (props) => <svg data-testid="mail-icon" {...props} />,
  Phone: (props) => <svg data-testid="phone-icon" {...props} />,
  Github: (props) => <svg data-testid="github-icon" {...props} />,
  Linkedin: (props) => <svg data-testid="linkedin-icon" {...props} />,
  Twitter: (props) => <svg data-testid="twitter-icon" {...props} />,
  ExternalLink: (props) => <svg data-testid="external-link-icon" {...props} />,
  Upload: (props) => <svg data-testid="upload-icon" {...props} />,
  Loader2: (props) => <svg data-testid="loader2-icon" {...props} />,
  ZoomIn: (props) => <svg data-testid="zoom-in-icon" {...props} />,
  ZoomOut: (props) => <svg data-testid="zoom-out-icon" {...props} />,
  Calendar: (props) => <svg data-testid="calendar-icon" {...props} />,
  Clock: (props) => <svg data-testid="clock-icon" {...props} />,
  MapPin: (props) => <svg data-testid="map-pin-icon" {...props} />,
  Building: (props) => <svg data-testid="building-icon" {...props} />,
  GraduationCap: (props) => (
    <svg data-testid="graduation-cap-icon" {...props} />
  ),
  Award: (props) => <svg data-testid="award-icon" {...props} />,
  Code: (props) => <svg data-testid="code-icon" {...props} />,
  FileText: (props) => <svg data-testid="file-text-icon" {...props} />,
  Tag: (props) => <svg data-testid="tag-icon" {...props} />,
  Briefcase: (props) => <svg data-testid="briefcase-icon" {...props} />,
  Users: (props) => <svg data-testid="users-icon" {...props} />,
  Star: (props) => <svg data-testid="star-icon" {...props} />,
  Download: (props) => <svg data-testid="download-icon" {...props} />,
  Eye: (props) => <svg data-testid="eye-icon" {...props} />,
  EyeOff: (props) => <svg data-testid="eye-off-icon" {...props} />,
  Heart: (props) => <svg data-testid="heart-icon" {...props} />,
  MessageCircle: (props) => (
    <svg data-testid="message-circle-icon" {...props} />
  ),
  CheckCircle2: (props) => <svg data-testid="check-circle2-icon" {...props} />,
  XCircle: (props) => <svg data-testid="x-circle-icon" {...props} />,
  Share2: (props) => <svg data-testid="share2-icon" {...props} />,
  ArrowRight: (props) => <svg data-testid="arrow-right-icon" {...props} />,
  ChevronRight: (props) => <svg data-testid="chevron-right-icon" {...props} />,
  ChevronLeft: (props) => <svg data-testid="chevron-left-icon" {...props} />,
  Search: (props) => <svg data-testid="search-icon" {...props} />,
  Filter: (props) => <svg data-testid="filter-icon" {...props} />,
  Plus: (props) => <svg data-testid="plus-icon" {...props} />,
  Minus: (props) => <svg data-testid="minus-icon" {...props} />,
  Edit: (props) => <svg data-testid="edit-icon" {...props} />,
  Trash: (props) => <svg data-testid="trash-icon" {...props} />,
  Check: (props) => <svg data-testid="check-icon" {...props} />,
  AlertCircle: (props) => <svg data-testid="alert-circle-icon" {...props} />,
  Info: (props) => <svg data-testid="info-icon" {...props} />,
  Settings: (props) => <svg data-testid="settings-icon" {...props} />,
  LogOut: (props) => <svg data-testid="log-out-icon" {...props} />,
  Image: (props) => <svg data-testid="image-icon" {...props} />,
  Folder: (props) => <svg data-testid="folder-icon" {...props} />,
  File: (props) => <svg data-testid="file-icon" {...props} />,
}));

// Mock global Request and Response for Next.js API routes
if (typeof Request === "undefined") {
  global.Request = class Request {
    constructor(input, init = {}) {
      this.url = typeof input === "string" ? input : input.url;
      this.method = init.method || "GET";
      this.headers = new Headers(init.headers || {});
      this.body = init.body;
      this._bodyInit = init.body;
    }

    async json() {
      if (typeof this._bodyInit === "string") {
        return JSON.parse(this._bodyInit);
      }
      return this._bodyInit;
    }

    async text() {
      if (typeof this._bodyInit === "string") {
        return this._bodyInit;
      }
      return JSON.stringify(this._bodyInit);
    }
  };
}

if (typeof Response === "undefined") {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || "";
      this.headers = new Headers(init.headers || {});
    }

    async json() {
      return typeof this.body === "string" ? JSON.parse(this.body) : this.body;
    }

    async text() {
      return typeof this.body === "string"
        ? this.body
        : JSON.stringify(this.body);
    }
  };
}

// Suppress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
