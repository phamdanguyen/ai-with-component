/**
 * Material Design 3 Ripple Effect Hook
 * Version: 1.0.0
 * Created: 2025-11-26
 *
 * Usage:
 *   import { useRipple } from './hooks/useRipple';
 *
 *   function MyButton({ children }) {
 *     const { ripples, createRipple, Ripples } = useRipple();
 *     return (
 *       <button onClick={createRipple}>
 *         {children}
 *         <Ripples />
 *       </button>
 *     );
 *   }
 */

import { useState, useCallback } from 'react';

/**
 * Configuration for ripple effect
 */
const RIPPLE_CONFIG = {
  duration: 400, // ms
  color: 'currentColor',
  opacity: 0.2,
};

/**
 * Hook to create Material Design 3 ripple effect
 *
 * @param {Object} config - Optional configuration
 * @param {number} config.duration - Animation duration in ms
 * @param {string} config.color - Ripple color
 * @param {number} config.opacity - Ripple opacity
 * @returns {Object} Ripple utilities
 */
export function useRipple(config = {}) {
  const [ripples, setRipples] = useState([]);

  const { duration, color, opacity } = { ...RIPPLE_CONFIG, ...config };

  /**
   * Create a new ripple at click position
   */
  const createRipple = useCallback((event) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();

    // Calculate ripple position and size
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;

    const id = Date.now();
    const newRipple = {
      id,
      x: x - size / 2,
      y: y - size / 2,
      size,
    };

    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, duration);
  }, [duration]);

  /**
   * Ripple component to render inside button
   */
  const Ripples = useCallback(() => {
    return (
      <>
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="bubble-ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              background: color,
              opacity: opacity,
              animationDuration: `${duration}ms`,
            }}
          />
        ))}
      </>
    );
  }, [ripples, color, opacity, duration]);

  /**
   * Clear all ripples
   */
  const clearRipples = useCallback(() => {
    setRipples([]);
  }, []);

  return {
    ripples,
    createRipple,
    clearRipples,
    Ripples,
  };
}

/**
 * Standalone Ripple component for class-based usage
 */
export function Ripple({ x, y, size, color = 'currentColor', duration = 400 }) {
  return (
    <span
      className="bubble-ripple"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        background: color,
        animationDuration: `${duration}ms`,
      }}
    />
  );
}

/**
 * Higher-order component to add ripple effect
 */
export function withRipple(WrappedComponent) {
  return function RippleWrapper(props) {
    const { createRipple, Ripples } = useRipple();

    return (
      <WrappedComponent
        {...props}
        onMouseDown={(e) => {
          createRipple(e);
          props.onMouseDown?.(e);
        }}
        rippleComponent={<Ripples />}
      />
    );
  };
}

export default useRipple;
