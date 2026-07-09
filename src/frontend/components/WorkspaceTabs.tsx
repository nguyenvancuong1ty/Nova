interface WorkspaceTabsProps {
  tabs: readonly string[];
  activeTab: string;
  onChange: (tab: string) => void;
}

export function WorkspaceTabs({
  tabs,
  activeTab,
  onChange,
}: WorkspaceTabsProps) {
  return (
    <div className="workspace-tabs" role="tablist" aria-label="Nhóm cấu hình">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={tab === activeTab}
          className={tab === activeTab ? "workspace-tab is-active" : "workspace-tab"}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
