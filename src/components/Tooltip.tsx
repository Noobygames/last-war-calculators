import { useState, useRef, type ReactNode, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  text: string;
  imageSrc?: string;
  children: ReactNode;
}

export function Tooltip({ text, imageSrc, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const margin = 8;

      // Position tooltip above the trigger
      const top = triggerRect.top - tooltipRect.height - margin;

      // Center horizontally by default
      let left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;

      // Adjust if it goes off the right edge
      if (left + tooltipRect.width > windowWidth - margin) {
        left = windowWidth - tooltipRect.width - margin;
      }

      // Adjust if it goes off the left edge
      if (left < margin) {
        left = margin;
      }

      setTooltipStyle({
        top: `${top}px`,
        left: `${left}px`,
      });

      // Position the arrow to point to the center of the trigger
      const triggerCenter = triggerRect.left + triggerRect.width / 2;
      const arrowLeft = triggerCenter - left;

      setArrowStyle({
        left: `${arrowLeft}px`,
      });
    }
  }, [isVisible, text]);

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && text && createPortal(
        <div
          ref={tooltipRef}
          className="fixed z-[9999] px-3 py-2 bg-surface-card text-white rounded text-sm whitespace-nowrap flex items-center gap-2 shadow-xl pointer-events-none border border-surface-border animate-appear"
          style={tooltipStyle}
        >
          {imageSrc && (
            <img
              src={imageSrc}
              alt=""
              className="size-6 object-cover rounded-sm"
            />
          )}
          <span>{text}</span>
          <div
            className="absolute top-full -translate-x-1/2 border-[6px] border-transparent border-t-surface-card"
            style={arrowStyle}
          />
        </div>,
        document.body
      )}
    </div>
  );
}
