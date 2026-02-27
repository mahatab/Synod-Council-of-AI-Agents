import { useState, useEffect } from 'react';
import { Folder } from 'lucide-react';
import Button from '../common/Button';
import { useSettingsStore } from '../../stores/settingsStore';
import { getDefaultSessionsPath } from '../../lib/tauri';

export default function SessionSettings() {
  const { settings, updateSettings } = useSettingsStore();
  const [defaultPath, setDefaultPath] = useState('');

  useEffect(() => {
    getDefaultSessionsPath().then(setDefaultPath);
  }, []);

  const handleBrowse = async () => {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Choose Session Save Location',
      });
      if (selected && typeof selected === 'string') {
        updateSettings({ sessionSavePath: selected });
      }
    } catch (e) {
      console.error('Failed to open directory picker:', e);
    }
  };

  const handleResetToDefault = () => {
    updateSettings({ sessionSavePath: null });
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
        Session Storage
      </h3>
      <p className="text-xs text-[var(--color-text-tertiary)] mb-3">
        Where conversation sessions are saved on disk
      </p>

      <div className="p-3 rounded-[var(--radius-md)] border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)]">
        <div className="flex items-center gap-2 mb-2">
          <Folder size={14} className="text-[var(--color-text-tertiary)]" />
          <span className="text-xs text-[var(--color-text-secondary)]">
            {settings.sessionSavePath ? 'Custom Location' : 'Default Location'}
          </span>
        </div>
        <p className="text-xs font-mono text-[var(--color-text-primary)] mb-3 break-all">
          {settings.sessionSavePath || defaultPath}
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={handleBrowse}>
            Browse...
          </Button>
          {settings.sessionSavePath && (
            <Button size="sm" variant="ghost" onClick={handleResetToDefault}>
              Reset to Default
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
