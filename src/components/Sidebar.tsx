import GlobalStatsInputs from './GlobalStatsInputs';

export default function Sidebar() {
  return (
    <aside className="hidden xl:flex w-64 flex-shrink-0 bg-black/20 border-r border-surface-card flex-col p-6 space-y-8 overflow-y-auto">
      <GlobalStatsInputs idPrefix="sidebar" />
    </aside>
  );
}
