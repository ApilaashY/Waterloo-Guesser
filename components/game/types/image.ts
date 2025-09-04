export interface ImageState {
  currentImageSrc: string | null;
  currentImageName: string | null;
  imageKey: string | null;
  imageLoaded: boolean;
  isPreviewVisible: boolean;
  previewSrc: string | null;
}

export interface ImageLoadingState {
  imageIDs: string[];
  state: ImageState;
  naturalSize: { w: number; h: number } | null;
}

export interface ImagePreviewState {
  previewHover: boolean;
  previewZoom: number;
  pan: { x: number; y: number };
  dragging: boolean;
}

export interface ValidationBody {
  xCoor: number | null;
  yCoor: number | null;
  id?: string;
  correctX?: number;
  correctY?: number;
}
