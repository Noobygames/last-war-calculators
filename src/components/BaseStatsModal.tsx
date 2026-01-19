import GlobalStatsInputs from './GlobalStatsInputs';

interface BaseStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BaseStatsModal({ isOpen, onClose }: BaseStatsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-surface-main border border-surface-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-appear" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-surface-card flex justify-between items-center bg-surface-dark">
          <h3 className="text-lg font-black text-white uppercase italic tracking-wider">Base Stats</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          <GlobalStatsInputs idPrefix="modal" />
        </div>
      </div>
    </div>
  );
}