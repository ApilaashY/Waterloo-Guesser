import { useState, useCallback } from 'react';
import { PerformanceTracking } from '../types/game';

export const usePerformanceTracking = () => {
  const [performanceState, setPerformanceState] = useState<PerformanceTracking>({
    imageLoadedAt: null,
    firstMapClickRecorded: false,
    firstSubmitRecorded: false
  });

  const updatePerformanceState = useCallback((updates: Partial<PerformanceTracking>) => {
    setPerformanceState(prev => ({ ...prev, ...updates }));
  }, []);

  const recordImageLoaded = useCallback(() => {
    updatePerformanceState({ imageLoadedAt: Date.now() });
  }, [updatePerformanceState]);

  const recordFirstMapClick = useCallback(() => {
    if (!performanceState.firstMapClickRecorded) {
      updatePerformanceState({ firstMapClickRecorded: true });
      
      // Calculate time since image loaded
      if (performanceState.imageLoadedAt) {
        const timeToFirstClick = Date.now() - performanceState.imageLoadedAt;
        console.log(`Time to first map click: ${timeToFirstClick}ms`);
      }
    }
  }, [performanceState.firstMapClickRecorded, performanceState.imageLoadedAt, updatePerformanceState]);

  const recordFirstSubmit = useCallback(() => {
    if (!performanceState.firstSubmitRecorded) {
      updatePerformanceState({ firstSubmitRecorded: true });
      
      // Calculate time since image loaded
      if (performanceState.imageLoadedAt) {
        const timeToFirstSubmit = Date.now() - performanceState.imageLoadedAt;
        console.log(`Time to first submit: ${timeToFirstSubmit}ms`);
      }
    }
  }, [performanceState.firstSubmitRecorded, performanceState.imageLoadedAt, updatePerformanceState]);

  const resetPerformanceTracking = useCallback(() => {
    setPerformanceState({
      imageLoadedAt: null,
      firstMapClickRecorded: false,
      firstSubmitRecorded: false
    });
  }, []);

  return {
    performanceState,
    updatePerformanceState,
    recordImageLoaded,
    recordFirstMapClick,
    recordFirstSubmit,
    resetPerformanceTracking
  };
};
