import { useEffect, useCallback } from 'react';

/**
 * Hook to handle mobile viewport height issues
 * Mobile browsers have dynamic toolbars that change viewport height
 * This sets a CSS custom property --vh that can be used instead of vh units
 * 
 * Usage in CSS/Tailwind:
 * height: calc(var(--vh, 1vh) * 100);
 */
export const useViewportHeight = () => {
  const setVH = useCallback(() => {
    // Calculate the actual viewport height
    const vh = window.innerHeight * 0.01;
    // Set the CSS custom property
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // Also set the full height for convenience
    document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
  }, []);

  useEffect(() => {
    // Set on mount
    setVH();

    // Update on resize
    window.addEventListener('resize', setVH);
    
    // Update on orientation change (mobile)
    window.addEventListener('orientationchange', () => {
      // Delay to let the browser settle
      setTimeout(setVH, 100);
    });

    // Update when keyboard appears/disappears on mobile
    if ('visualViewport' in window && window.visualViewport) {
      window.visualViewport.addEventListener('resize', setVH);
    }

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
      
      if ('visualViewport' in window && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', setVH);
      }
    };
  }, [setVH]);
};

export default useViewportHeight;
