import { useState, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  text: string;
  imageSrc?: string;
  children: ReactNode;
}

export function Tooltip({ text, imageSrc, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left + rect.width / 2,
      });
      setIsVisible(true);
    }
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && createPortal(
        <div 
          className="fixed z-[9999] px-3 py-2 bg-surface-card text-white rounded text-sm whitespace-nowrap flex items-center gap-2 shadow-xl pointer-events-none border border-surface-border"
          style={{
            top: coords.top - 8,
            left: coords.left,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {imageSrc && (
            <img
              src={imageSrc}
              alt=""
              className="size-6 object-cover rounded-sm"
            />
          )}
          <span>{text}</span>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-surface-card" />
        </div>,
        document.body
      )}
    </div>
  );
}
