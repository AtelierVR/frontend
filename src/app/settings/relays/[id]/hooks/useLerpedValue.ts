import { useEffect, useState, useRef } from 'react';

/**
 * Hook pour animer une valeur avec interpolation linéaire
 */
export function useLerpedValue(targetValue: number, duration: number = 500): number {
  const [currentValue, setCurrentValue] = useState(targetValue);
  const startValueRef = useRef(targetValue);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Si la valeur cible n'a pas changé, ne rien faire
    if (targetValue === currentValue && startTimeRef.current === null) return;

    // Initialiser l'animation
    startValueRef.current = currentValue;
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      if (startTimeRef.current === null) return;

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Interpolation linéaire
      const newValue = startValueRef.current + (targetValue - startValueRef.current) * progress;
      setCurrentValue(newValue);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        startTimeRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [targetValue, duration, currentValue]);

  return currentValue;
}

/**
 * Hook pour animer un tableau de nombres simples
 */
export function useLerpedSimpleArray(targetArray: number[] | undefined, duration: number = 500): number[] {
  const [currentArray, setCurrentArray] = useState<number[]>(targetArray || []);
  const startArrayRef = useRef<number[]>(targetArray || []);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!targetArray) return;

    // Initialiser l'animation
    startArrayRef.current = currentArray.length === targetArray.length ? currentArray : targetArray;
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      if (startTimeRef.current === null || !targetArray) return;

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Interpoler chaque nombre du tableau
      const newArray = targetArray.map((target, i) => {
        const start = startArrayRef.current[i] || target;
        return start + (target - start) * progress;
      });

      setCurrentArray(newArray);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        startTimeRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [targetArray, duration]);

  return currentArray;
}
