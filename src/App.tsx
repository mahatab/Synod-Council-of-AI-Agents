import { useEffect, useState } from 'react';
import MainLayout from './components/layout/MainLayout';
import SetupWizard from './components/setup/SetupWizard';
import { useSettingsStore } from './stores/settingsStore';

export default function App() {
  const { settings, loaded, loadSettings } = useSettingsStore();
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Watch for setup completion
  useEffect(() => {
    if (loaded && settings.setupCompleted) {
      setShowApp(true);
    }
  }, [loaded, settings.setupCompleted]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-bg-primary)]">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)] thinking-dot"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!showApp && !settings.setupCompleted) {
    return <SetupWizard />;
  }

  return <MainLayout />;
}
