import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ChatView from '../chat/ChatView';
import SettingsModal from '../settings/SettingsModal';

export default function MainLayout() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="flex h-screen bg-[var(--color-bg-primary)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenSettings={() => setShowSettings(true)} />
        <div className="flex-1 min-h-0">
          <ChatView />
        </div>
      </div>
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}
