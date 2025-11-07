import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ImageUpload } from "@/components/ImageUpload";
import toast from "react-hot-toast";

// Mock dependencies
jest.mock("react-hot-toast");
jest.mock("next/dynamic", () => ({
  __esModule: true,
  default: (loader: any) => {
    const DynamicComponent = (...args: any[]) => {
      const Component = loader();
      return Component.default(...args);
    };
    DynamicComponent.displayName = "DynamicComponent";
    return DynamicComponent;
  },
}));

// Mock ImageCropModal
jest.mock("@/components/ImageCropModal", () => ({
  ImageCropModal: ({
    onCropComplete,
    onClose,
  }: {
    onCropComplete: (img: string) => void;
    onClose: () => void;
  }) => (
    <div data-testid="crop-modal">
      <button onClick={() => onCropComplete("cropped-image-data")}>
        Apply Crop
      </button>
      <button onClick={onClose}>Cancel</button>
    </div>
  ),
}));

// Mock Next.js Image
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="uploaded-image" />
  ),
}));

// Mock fetch
global.fetch = jest.fn();

describe("ImageUpload Component", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ url: "https://cloudinary.com/uploaded-image.jpg" }),
    });
  });

  describe("Rendering", () => {
    it("should render upload area", () => {
      render(<ImageUpload onChange={mockOnChange} />);

      expect(screen.getByText(/Click to upload or drag and drop/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/upload image/i)).toBeInTheDocument();
    });

    it("should show file size limit in description", () => {
      render(<ImageUpload onChange={mockOnChange} maxSize={5} />);

      expect(screen.getByText(/up to 5MB/i)).toBeInTheDocument();
    });

    it("should show max files count for multiple uploads", () => {
      render(<ImageUpload onChange={mockOnChange} multiple maxFiles={10} />);

      expect(screen.getByText(/Maximum 10 files/i)).toBeInTheDocument();
    });

    it("should show PDF description when accept is .pdf", () => {
      render(<ImageUpload onChange={mockOnChange} accept=".pdf" />);

      expect(screen.getByText(/PDF files/i)).toBeInTheDocument();
    });
  });

  describe("Single File Upload", () => {
    it("should upload single image successfully", async () => {
      render(<ImageUpload onChange={mockOnChange} />);

      const file = new File(["dummy content"], "test.png", {
        type: "image/png",
      });
      const input = screen.getByLabelText(/upload image/i) as HTMLInputElement;

      Object.defineProperty(input, "files", {
        value: [file],
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          "https://cloudinary.com/uploaded-image.jpg"
        );
      });
    });

    it("should show uploaded image preview", async () => {
      render(
        <ImageUpload
          onChange={mockOnChange}
          value="https://cloudinary.com/existing.jpg"
        />
      );

      expect(screen.getByTestId("uploaded-image")).toHaveAttribute(
        "src",
        "https://cloudinary.com/existing.jpg"
      );
    });

    it("should allow removing uploaded image", async () => {
      render(
        <ImageUpload
          onChange={mockOnChange}
          value="https://cloudinary.com/existing.jpg"
        />
      );

      const removeButton = screen.getByRole("button");
      fireEvent.click(removeButton);

      expect(mockOnChange).toHaveBeenCalledWith("");
    });
  });

  describe("Multiple File Upload", () => {
    it("should upload multiple images", async () => {
      render(<ImageUpload onChange={mockOnChange} multiple />);

      const file1 = new File(["content1"], "test1.png", { type: "image/png" });
      const file2 = new File(["content2"], "test2.png", { type: "image/png" });
      const input = screen.getByLabelText(/upload image/i) as HTMLInputElement;

      Object.defineProperty(input, "files", {
        value: [file1, file2],
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([
          "https://cloudinary.com/uploaded-image.jpg",
          "https://cloudinary.com/uploaded-image.jpg",
        ]);
      });
    });

    it("should show image count", () => {
      render(
        <ImageUpload
          onChange={mockOnChange}
          multiple
          value={["image1.jpg", "image2.jpg"]}
          maxFiles={5}
        />
      );

      expect(screen.getByText("2 / 5 images")).toBeInTheDocument();
    });

    it("should enforce max files limit", async () => {
      render(
        <ImageUpload
          onChange={mockOnChange}
          multiple
          maxFiles={2}
          value={["image1.jpg", "image2.jpg"]}
        />
      );

      const file = new File(["content"], "test.png", { type: "image/png" });
      const input = screen.getByLabelText(/upload image/i) as HTMLInputElement;

      Object.defineProperty(input, "files", {
        value: [file],
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Maximum 2 files allowed");
      });
    });
  });

  describe("File Validation", () => {
    it("should reject files that are too large", async () => {
      render(<ImageUpload onChange={mockOnChange} maxSize={1} />);

      const largeFile = new File(["x".repeat(2 * 1024 * 1024)], "large.png", {
        type: "image/png",
      });
      const input = screen.getByLabelText(/upload image/i) as HTMLInputElement;

      Object.defineProperty(input, "files", {
        value: [largeFile],
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining("too large")
        );
      });
    });

    it("should reject non-image files when accept is image/*", async () => {
      render(<ImageUpload onChange={mockOnChange} accept="image/*" />);

      const pdfFile = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });
      const input = screen.getByLabelText(/upload image/i) as HTMLInputElement;

      Object.defineProperty(input, "files", {
        value: [pdfFile],
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining("not an image")
        );
      });
    });

    it("should accept PDF files when accept includes .pdf", async () => {
      render(<ImageUpload onChange={mockOnChange} accept=".pdf" />);

      const pdfFile = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });
      const input = screen.getByLabelText(/upload pdf/i) as HTMLInputElement;

      Object.defineProperty(input, "files", {
        value: [pdfFile],
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe("Image Cropping", () => {
    it("should show crop modal when enableCrop is true", async () => {
      render(<ImageUpload onChange={mockOnChange} enableCrop />);

      const file = new File(["content"], "test.png", { type: "image/png" });
      const input = screen.getByLabelText(/upload image/i) as HTMLInputElement;

      Object.defineProperty(input, "files", {
        value: [file],
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByTestId("crop-modal")).toBeInTheDocument();
      });
    });

    it("should skip crop modal when enableCrop is false", async () => {
      render(<ImageUpload onChange={mockOnChange} enableCrop={false} />);

      const file = new File(["content"], "test.png", { type: "image/png" });
      const input = screen.getByLabelText(/upload image/i) as HTMLInputElement;

      Object.defineProperty(input, "files", {
        value: [file],
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.queryByTestId("crop-modal")).not.toBeInTheDocument();
      });
    });

    it("should upload cropped image when crop is applied", async () => {
      render(<ImageUpload onChange={mockOnChange} enableCrop />);

      const file = new File(["content"], "test.png", { type: "image/png" });
      const input = screen.getByLabelText(/upload image/i) as HTMLInputElement;

      Object.defineProperty(input, "files", {
        value: [file],
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByTestId("crop-modal")).toBeInTheDocument();
      });

      const applyCropButton = screen.getByText("Apply Crop");
      fireEvent.click(applyCropButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
        expect(mockOnChange).toHaveBeenCalled();
      });
    });

    it("should close crop modal on cancel", async () => {
      render(<ImageUpload onChange={mockOnChange} enableCrop />);

      const file = new File(["content"], "test.png", { type: "image/png" });
      const input = screen.getByLabelText(/upload image/i) as HTMLInputElement;

      Object.defineProperty(input, "files", {
        value: [file],
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByTestId("crop-modal")).toBeInTheDocument();
      });

      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByTestId("crop-modal")).not.toBeInTheDocument();
      });
    });
  });

  describe("Drag and Drop", () => {
    it("should handle drag enter", () => {
      render(<ImageUpload onChange={mockOnChange} />);

      const dropzone = screen.getByText(/Click to upload/i).closest("div");
      fireEvent.dragEnter(dropzone!);

      expect(dropzone).toHaveClass("border-primary");
    });

    it("should handle drag leave", () => {
      render(<ImageUpload onChange={mockOnChange} />);

      const dropzone = screen.getByText(/Click to upload/i).closest("div");
      fireEvent.dragEnter(dropzone!);
      fireEvent.dragLeave(dropzone!);

      expect(dropzone).not.toHaveClass("border-primary");
    });

    it("should handle file drop", async () => {
      render(<ImageUpload onChange={mockOnChange} />);

      const file = new File(["content"], "test.png", { type: "image/png" });
      const dropzone = screen.getByText(/Click to upload/i).closest("div");

      fireEvent.drop(dropzone!, {
        dataTransfer: { files: [file] },
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe("Loading States", () => {
    it("should show loading state during upload", async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ url: "uploaded.jpg" }),
                }),
              100
            )
          )
      );

      render(<ImageUpload onChange={mockOnChange} enableCrop={false} />);

      const file = new File(["content"], "test.png", { type: "image/png" });
      const input = screen.getByLabelText(/upload image/i) as HTMLInputElement;

      Object.defineProperty(input, "files", {
        value: [file],
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByText(/Uploading to Cloudinary/i)).toBeInTheDocument();
      });
    });

    it("should disable upload when disabled prop is true", () => {
      render(<ImageUpload onChange={mockOnChange} disabled />);

      const input = screen.getByLabelText(/upload image/i) as HTMLInputElement;
      expect(input).toBeDisabled();
    });
  });

  describe("Error Handling", () => {
    it("should show error toast when upload fails", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      render(<ImageUpload onChange={mockOnChange} enableCrop={false} />);

      const file = new File(["content"], "test.png", { type: "image/png" });
      const input = screen.getByLabelText(/upload image/i) as HTMLInputElement;

      Object.defineProperty(input, "files", {
        value: [file],
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to upload file");
      });
    });
  });
});
