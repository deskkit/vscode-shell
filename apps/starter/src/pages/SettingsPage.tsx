type SettingsPageProps = {
  title?: string;
};

export function SettingsPage({ title = 'Settings' }: SettingsPageProps) {
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ margin: '0 0 8px', fontSize: 18 }}>{title}</h1>
      <p style={{ margin: '0 0 16px', color: 'var(--vscode-text-secondary)' }}>
        Configure preferences for the starter desktop shell.
      </p>
      <div
        style={{
          padding: 16,
          borderRadius: 8,
          background: 'var(--vscode-sidebar-bg)',
          border: '1px solid var(--vscode-border)',
        }}
      >
        Use the nested Preferences group to open General or Appearance tabs.
      </div>
    </div>
  );
}
