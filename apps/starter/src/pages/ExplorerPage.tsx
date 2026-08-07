type ExplorerPageProps = {
  title?: string;
};

export function ExplorerPage({ title = 'Explorer' }: ExplorerPageProps) {
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ margin: '0 0 8px', fontSize: 18 }}>{title}</h1>
      <p style={{ margin: '0 0 16px', color: 'var(--vscode-text-secondary)' }}>
        Browse project files and search across the workspace.
      </p>
      <div
        style={{
          padding: 16,
          borderRadius: 8,
          background: 'var(--vscode-sidebar-bg)',
          border: '1px solid var(--vscode-border)',
        }}
      >
        Select Files or Search in the sidebar to open a tab for that view.
      </div>
    </div>
  );
}
