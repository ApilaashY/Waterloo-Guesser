import { useState, useCallback } from 'react';
import { ImageState } from '../types/image';
import { ImageService } from '../services/imageService';

export const useImageState = () => {
  const [imageState, setImageState] = useState<ImageState>({
    currentImageSrc: null,
    currentImageName: null,
    imageKey: null,
    imageLoaded: false,
    isPreviewVisible: false,
    previewSrc: null
  });

  const updateImageState = useCallback((updates: Partial<ImageState>) => {
    setImageState(prev => ({ ...prev, ...updates }));
  }, []);

  const loadNewImage = useCallback(async () => {
    try {
      updateImageState({ imageLoaded: false });
      
      const imageData = await ImageService.getRandomImage();
      const imageKey = Date.now().toString();

      updateImageState({
        currentImageSrc: imageData.src,
        currentImageName: imageData.name,
        imageKey,
        imageLoaded: true
      });

      return imageData;
    } catch (error) {
      console.error('Failed to load image:', error);
      throw error;
    }
  }, [updateImageState]);

  const preloadImage = useCallback(async (src: string): Promise<void> => {
    return ImageService.preloadImage(src);
  }, []);

  const showPreview = useCallback((src: string) => {
    updateImageState({
      isPreviewVisible: true,
      previewSrc: src
    });
  }, [updateImageState]);

  const hidePreview = useCallback(() => {
    updateImageState({
      isPreviewVisible: false,
      previewSrc: null
    });
  }, [updateImageState]);

  const resetImageState = useCallback(() => {
    setImageState({
      currentImageSrc: null,
      currentImageName: null,
      imageKey: null,
      imageLoaded: false,
      isPreviewVisible: false,
      previewSrc: null
    });
  }, []);

  return {
    imageState,
    updateImageState,
    loadNewImage,
    preloadImage,
    showPreview,
    hidePreview,
    resetImageState
  };
};
