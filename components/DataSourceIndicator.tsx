'use client';

// Data Source Indicator Component
// Shows whether the app is using live Sugati data or sample data

// Note: This is a client component that receives the data source status as a prop
// The actual config check happens server-side and is passed down

interface DataSourceIndicatorProps {
  isLive?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function DataSourceIndicator({
  isLive = false,
  showLabel = true,
  size = 'sm',
}: DataSourceIndicatorProps) {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]} ${
        isLive ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
      }`}
    >
      <span
        className={`rounded-full ${dotSizeClasses[size]} ${
          isLive ? 'bg-green-500 animate-pulse' : 'bg-amber-500'
        }`}
      />
      {showLabel && <span>{isLive ? 'Connected to Sugati' : 'Sample Data'}</span>}
    </div>
  );
}

// Sync status component for showing last sync time
interface SyncStatusProps {
  lastSyncTime?: Date;
  isLive?: boolean;
}

export function SyncStatus({ lastSyncTime, isLive = false }: SyncStatusProps) {
  if (!isLive) {
    return (
      <span className="text-xs text-gray-400">Using sample data for demonstration</span>
    );
  }

  const timeString = lastSyncTime
    ? lastSyncTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'just now';

  return (
    <span className="text-xs text-gray-500">
      Data synced from Sugati &middot; Last updated: {timeString}
    </span>
  );
}

// Combined header component for data source display
interface DataSourceHeaderProps {
  isLive?: boolean;
  lastSyncTime?: Date;
  className?: string;
}

export function DataSourceHeader({
  isLive = false,
  lastSyncTime,
  className = '',
}: DataSourceHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <DataSourceIndicator isLive={isLive} />
      <SyncStatus lastSyncTime={lastSyncTime} isLive={isLive} />
    </div>
  );
}
