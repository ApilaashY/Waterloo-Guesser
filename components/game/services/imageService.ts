import { ImageState } from '../types/image';

export interface ImageRequest {
  previousCodes: string[];
}

export interface ImageResponse {
  image: string;
  id: string;
  correctX?: number;
  correct_x?: number;
  xCoor?: number;
  x?: number;
  correctY?: number;
  correct_y?: number;
  yCoor?: number;
  y?: number;
}

export class ImageService {
  private static instance: ImageService;
  private preloadedNext: ImageResponse | null = null;
  private requestingImage: boolean = false;
  private imageCache: Map<string, string> = new Map();

  public static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  public static async getRandomImage(): Promise<{ src: string; name: string }> {
    try {
      const response = await fetch('/api/getPhoto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previousCodes: [] })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return {
        src: data.image || data.imagePath,
        name: data.imageName || data.id || 'Unknown Location'
      };
    } catch (error) {
      console.error('Failed to fetch random image:', error);
      throw error;
    }
  }

  public static async preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }

  public async fetchImage(previousCodes: string[]): Promise<ImageResponse> {
    // If we have a preloaded image ready, use it immediately
    if (this.preloadedNext) {
      const json = this.preloadedNext;
      this.preloadedNext = null;
      // Start preloading the next one
      this.preloadNextImage(previousCodes);
      return json;
    }

    if (this.requestingImage) {
      throw new Error('Image request already in progress');
    }

    this.requestingImage = true;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_LINK}/api/getPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ previousCodes }),
      });
      
      const json = await response.json();
      this.requestingImage = false;
      
      // Preload next image in the background
      this.preloadNextImage([...previousCodes, json.id]);
      return json;
    } catch (error) {
      this.requestingImage = false;
      throw error;
    }
  }

  public processImageResponse(json: ImageResponse): ImageState {
    const correctX = json.correctX ?? json.correct_x ?? json.xCoor ?? json.x ?? null;
    const correctY = json.correctY ?? json.correct_y ?? json.yCoor ?? json.y ?? null;
    
    return {
      currentImageSrc: json.image,
      currentImageName: json.id,
      imageKey: json.id,
      imageLoaded: true,
      isPreviewVisible: false,
      previewSrc: null
    };
  }

  private async preloadNextImage(previousCodes: string[]): Promise<void> {
    // don't start another preload if one is already pending
    if (this.preloadedNext || this.requestingImage) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_LINK}/api/getPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ previousCodes }),
      });
      
      const json = await response.json();
      // store the raw response for later use
      this.preloadedNext = json;
      
      // also start loading the image bytes so subsequent render is instant
      if (json?.image) {
        const img = new Image();
        img.src = json.image;
      }
    } catch (error) {
      this.preloadedNext = null;
    }
  }

  public cacheImage(key: string, imageSrc: string): void {
    this.imageCache.set(key, imageSrc);
  }

  public getCachedImage(key: string): string | undefined {
    return this.imageCache.get(key);
  }

  public clearCache(): void {
    this.preloadedNext = null;
    this.requestingImage = false;
    this.imageCache.clear();
  }

  public getImageNaturalSize(imageSrc: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageSrc;
    });
  }
}
