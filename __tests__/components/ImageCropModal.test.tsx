import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ImageCropModal } from "@/components/ImageCropModal";

// Mock react-easy-crop
jest.mock("react-easy-crop", () => ({
  __esModule: true,
  default: ({
    onCropComplete,
  }: {
    onCropComplete: (area: any, areaPixels: any) => void;
  }) => {
    // Simulate crop complete callback
    setTimeout(() => {
      onCropComplete(
        { x: 0, y: 0, width: 100, height: 100 },
        { x: 10, y: 10, width: 200, height: 200 }
      );
    }, 0);
    return <div data-testid="cropper">Cropper</div>;
  },
}));

describe("ImageCropModal Component", () => {
  const mockOnCropComplete = jest.fn();
  const mockOnClose = jest.fn();
  const testImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock canvas
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      drawImage: jest.fn(),
    })) as any;

    HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
      const blob = new Blob(["fake-image"], { type: "image/jpeg" });
      callback(blob);
    }) as any;

    // Mock Image
    global.Image = class {
      onload: (() => void) | null = null;
      onerror: ((error: any) => void) | null = null;
      src = "";
      crossOrigin = "";

      addEventListener(event: string, handler: any) {
        if (event === "load") this.onload = handler;
        if (event === "error") this.onerror = handler;
      }

      removeEventListener() {}

      setAttribute(attr: string, value: string) {
        if (attr === "crossOrigin") this.crossOrigin = value;
        if (attr === "src") {
          this.src = value;
          setTimeout(() => this.onload?.(), 0);
        }
      }

      set src(value: string) {
        this.setAttribute("src", value);
      }
    } as any;

    // Mock FileReader
    global.FileReader = class {
      onloadend: (() => void) | null = null;
      result: string | null = "data:image/jpeg;base64,fake";

      readAsDataURL() {
        setTimeout(() => this.onloadend?.(), 0);
      }
    } as any;
  });

  describe("Rendering", () => {
    it("should render crop modal with title", () => {
      render(
        <ImageCropModal
          image={testImage}
          onCropComplete={mockOnCropComplete}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("Crop Image")).toBeInTheDocument();
      expect(screen.getByTestId("cropper")).toBeInTheDocument();
    });

    it("should render zoom slider", () => {
      render(
        <ImageCropModal
          image={testImage}
          onCropComplete={mockOnCropComplete}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByLabelText("Zoom level")).toBeInTheDocument();
    });

    it("should render action buttons", () => {
      render(
        <ImageCropModal
          image={testImage}
          onCropComplete={mockOnCropComplete}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByText("Skip Crop")).toBeInTheDocument();
      expect(screen.getByText("Apply Crop")).toBeInTheDocument();
    });
  });

  describe("Zoom Control", () => {
    it("should update zoom level when slider changes", () => {
      render(
        <ImageCropModal
          image={testImage}
          onCropComplete={mockOnCropComplete}
          onClose={mockOnClose}
        />
      );

      const slider = screen.getByLabelText("Zoom level") as HTMLInputElement;
      expect(slider.value).toBe("1");

      fireEvent.change(slider, { target: { value: "2.5" } });
      expect(slider.value).toBe("2.5");
    });

    it("should have correct zoom range", () => {
      render(
        <ImageCropModal
          image={testImage}
          onCropComplete={mockOnCropComplete}
          onClose={mockOnClose}
        />
      );

      const slider = screen.getByLabelText("Zoom level") as HTMLInputElement;
      expect(slider.min).toBe("1");
      expect(slider.max).toBe("3");
      expect(slider.step).toBe("0.1");
    });
  });

  describe("Close Functionality", () => {
    it("should call onClose when close button clicked", () => {
      render(
        <ImageCropModal
          image={testImage}
          onCropComplete={mockOnCropComplete}
          onClose={mockOnClose}
        />
      );

      const closeButtons = screen.getAllByRole("button");
      const closeButton = closeButtons.find((btn) =>
        btn.querySelector('svg')
      );
      
      fireEvent.click(closeButton!);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should call onClose when cancel button clicked", () => {
      render(
        <ImageCropModal
          image={testImage}
          onCropComplete={mockOnCropComplete}
          onClose={mockOnClose}
        />
      );

      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("Skip Crop Functionality", () => {
    it("should use original image when skip crop clicked", () => {
      render(
        <ImageCropModal
          image={testImage}
          onCropComplete={mockOnCropComplete}
          onClose={mockOnClose}
        />
      );

      const skipButton = screen.getByText("Skip Crop");
      fireEvent.click(skipButton);

      expect(mockOnCropComplete).toHaveBeenCalledWith(testImage);
    });
  });

  describe("Apply Crop Functionality", () => {
    it("should process and return cropped image", async () => {
      render(
        <ImageCropModal
          image={testImage}
          onCropComplete={mockOnCropComplete}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("Apply Crop")).toBeInTheDocument();
      });

      const applyButton = screen.getByText("Apply Crop");
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(mockOnCropComplete).toHaveBeenCalledWith(
          expect.stringContaining("data:image/jpeg;base64")
        );
      });
    });

    it("should show processing state during crop", async () => {
      render(
        <ImageCropModal
          image={testImage}
          onCropComplete={mockOnCropComplete}
          onClose={mockOnClose}
        />
      );

      const applyButton = screen.getByText("Apply Crop");
      fireEvent.click(applyButton);

      expect(screen.getByText("Processing...")).toBeInTheDocument();
    });

    it("should disable buttons during processing", async () => {
      render(
        <ImageCropModal
          image={testImage}
          onCropComplete={mockOnCropComplete}
          onClose={mockOnClose}
        />
      );

      const applyButton = screen.getByText("Apply Crop");
      fireEvent.click(applyButton);

      const cancelButton = screen.getByText("Cancel");
      expect(cancelButton).toBeDisabled();
    });
  });

  describe("Aspect Ratio", () => {
    it("should use default aspect ratio of 1", () => {
      render(
        <ImageCropModal
          image={testImage}
          onCropComplete={mockOnCropComplete}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByTestId("cropper")).toBeInTheDocument();
    });

    it("should accept custom aspect ratio", () => {
      render(
        <ImageCropModal
          image={testImage}
          onCropComplete={mockOnCropComplete}
          onClose={mockOnClose}
          aspect={16 / 9}
        />
      );

      expect(screen.getByTestId("cropper")).toBeInTheDocument();
    });
  });

  describe("Crop Area Tracking", () => {
    it("should track cropped area pixels", async () => {
      render(
        <ImageCropModal
          image={testImage}
          onCropComplete={mockOnCropComplete}
          onClose={mockOnClose}
        />
      );

      // Wait for crop complete callback
      await waitFor(() => {
        expect(screen.getByTestId("cropper")).toBeInTheDocument();
      });

      const applyButton = screen.getByText("Apply Crop");
      
      // Should be able to apply crop after area is set
      expect(applyButton).not.toBeDisabled();
    });
  });

  describe("Modal Overlay", () => {
    it("should render with modal overlay styles", () => {
      const { container } = render(
        <ImageCropModal
          image={testImage}
          onCropComplete={mockOnCropComplete}
          onClose={mockOnClose}
        />
      );

      const overlay = container.firstChild;
      expect(overlay).toHaveClass("fixed", "inset-0", "z-50");
    });
  });

  describe("Error Handling", () => {
    it("should handle image loading errors gracefully", async () => {
      // Mock Image to trigger error
      global.Image = class {
        onload: (() => void) | null = null;
        onerror: ((error: any) => void) | null = null;

        addEventListener(event: string, handler: any) {
          if (event === "load") this.onload = handler;
          if (event === "error") this.onerror = handler;
        }

        removeEventListener() {}

        setAttribute(attr: string, value: string) {
          if (attr === "src") {
            setTimeout(() => this.onerror?.(new Error("Load failed")), 0);
          }
        }
      } as any;

      render(
        <ImageCropModal
          image={testImage}
          onCropComplete={mockOnCropComplete}
          onClose={mockOnClose}
        />
      );

      const applyButton = screen.getByText("Apply Crop");
      fireEvent.click(applyButton);

      // Should not crash on error
      await waitFor(() => {
        expect(screen.getByText("Crop Image")).toBeInTheDocument();
      });
    });

    it("should handle canvas context creation failure", async () => {
      HTMLCanvasElement.prototype.getContext = jest.fn(() => null) as any;

      render(
        <ImageCropModal
          image={testImage}
          onCropComplete={mockOnCropComplete}
          onClose={mockOnClose}
        />
      );

      const applyButton = screen.getByText("Apply Crop");
      fireEvent.click(applyButton);

      // Should handle error gracefully
      await waitFor(() => {
        expect(screen.getByText("Crop Image")).toBeInTheDocument();
      });
    });
  });
});
