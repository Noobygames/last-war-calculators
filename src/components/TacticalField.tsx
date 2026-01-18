import { useEffect, useRef } from 'react';
import SquadSlot from './SquadSlot';
import { useSquad } from '../context/SquadContext'; 

export default function TacticalField() {
  const { currentSquad } = useSquad();
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fitTacticalField = () => {
      const field = fieldRef.current;
      if (!field) return;
      const main = field.parentElement;
      if (!main) return;
      
      const style = window.getComputedStyle(main);
      const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      
      const availableW = main.clientWidth - paddingX;
      const availableH = main.clientHeight - paddingY;
      
      field.style.transform = "scale(1)";
      const fieldW = field.offsetWidth;
      const fieldH = field.offsetHeight;
      
      let scale = Math.min(availableW / fieldW, availableH / fieldH);
      scale = Math.min(scale, 1);
      
      if (window.innerWidth < 768) {
        field.style.transform = "scale(1)";
      } else {
        field.style.transform = `scale(${scale})`;
        field.style.transformOrigin = "center center";
      }
    };

    window.addEventListener("resize", fitTacticalField);
    setTimeout(fitTacticalField, 100);
    return () => window.removeEventListener("resize", fitTacticalField);
  }, []);

  const renderSlot = (idx: number, classNameOverride: string) => (
    <div className={classNameOverride} key={idx}>
      <SquadSlot 
        slotIdx={idx}
      />
    </div>
  );

  return (
    <div id="tactical-field" ref={fieldRef} className="grid grid-cols-12 gap-1 md:gap-8 w-full max-w-5xl mx-auto">
      {renderSlot(2, "col-span-4")}
      {renderSlot(3, "col-span-4")}
      {renderSlot(4, "col-span-4")}
      
      {/* Front Row */}
      {renderSlot(0, "col-start-3 col-span-4")}
      {renderSlot(1, "col-span-4")}
    </div>
  );
}
