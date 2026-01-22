import { useState } from "react";
import { createPortal } from "react-dom";

interface DamageReductionInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DamageReductionInfoModal({ isOpen, onClose }: DamageReductionInfoModalProps) {
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-surface-main border border-surface-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-appear" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-surface-card flex justify-between items-center bg-surface-dark">
          <h3 className="text-lg font-black text-white uppercase italic tracking-wider">Damage Reduction Info</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] text-gray-300 text-sm leading-relaxed">
          <div 
            className="w-full aspect-video bg-black/40 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden relative cursor-zoom-in group"
            onClick={() => setIsImageFullscreen(true)}
          >
            <img src="img/explanations/DamageReduction.png" className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" alt="Damage Reduction Explanation" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm transition-opacity font-bold uppercase tracking-wider">Click to enlarge</span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase tracking-wider border-b border-white/10 pb-2">About Damage Reduction</h4>
            <p>
              Damage Reduction is split into <strong>4 distinct groups</strong>. Each of these groups has a hard <strong>cap of 75%</strong>.
            </p>
            <p>
              Each DR source inside the same group is <strong>additive</strong>. So if you have 2x 10% in Group 1, you end up with <strong>20%</strong> in that group.
            </p>
            <p>
              The DR groups are <strong>multiplicative</strong> with each other. This means the damage is reduced by the first group, and the remaining damage is then reduced by the next group.
            </p>
            <div className="bg-black/40 p-3 rounded-lg border border-white/5 font-mono text-xs text-center text-primary-soft">
                Incoming Damage = Damage * (1 - DR1) * (1 - DR2) * (1 - DR3) * (1 - DR4)
            </div>
            <p>
              <strong>Group 1</strong> is the only group where we currently can really reach the cap. Therefore, everyone's goal should be to <strong>reach the Cap of Group 1</strong>.
            </p>
          </div>
        </div>
      </div>

      {isImageFullscreen && createPortal(
        <div 
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-appear"
            onClick={() => setIsImageFullscreen(false)}
        >
            <img 
                src="img/explanations/DamageReduction.png" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                alt="Damage Reduction Explanation Fullscreen"
            />
            <button 
                className="absolute top-4 right-4 text-white/50 hover:text-white p-2 bg-black/20 rounded-full backdrop-blur-sm"
                onClick={() => setIsImageFullscreen(false)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>,
        document.body
      )}
    </div>,
    document.body,
  );
}
