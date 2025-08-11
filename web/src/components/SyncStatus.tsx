import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export default function SyncStatus({ lastSync }: { lastSync: string | null }) {
  const online = useOnlineStatus();
  return (
    <div className="flex items-center gap-3 text-sm">
      <span
        className={`inline-block h-2.5 w-2.5 rounded-full ${online ? 'bg-green-500' : 'bg-red-500'}`}
        title={online ? 'Online' : 'Offline'}
      />
      <span className="font-medium">{online ? 'Online' : 'Offline'}</span>
      <span className="text-gray-500">
        {lastSync ? `Last sync: ${new Date(lastSync).toLocaleString()}` : 'Never synced'}
      </span>
    </div>
  );
}
