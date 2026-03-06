export type PresenceStatus = 
  | 'oja'      // cyan - online join all
  | 'ojf'      // blue - online join friend
  | 'online'   // green
  | 'busy'     // orange
  | 'dnd'      // red - do not disturb
  | 'stream'   // violet
  | 'offline'; // gray

interface PresenceConfig {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  showLocationToAll: boolean;
  showLocationToFollowings: boolean;
  showStatus: boolean;
}

export const PRESENCE_CONFIG: Record<PresenceStatus, PresenceConfig> = {
  oja: {
    label: 'Online (Join All)',
    description: 'Your location is visible to everyone. Anyone can join you.',
    color: '#06b6d4',
    bgColor: '#06b6d4',
    showLocationToAll: true,
    showLocationToFollowings: true,
    showStatus: true
  },
  ojf: {
    label: 'Online (Join Friend)',
    description: 'Your location is visible to friends only. They can join you.',
    color: '#3b82f6',
    bgColor: '#3b82f6',
    showLocationToAll: false,
    showLocationToFollowings: true,
    showStatus: true
  },
  online: {
    label: 'Online',
    description: 'Your location is visible to friends. Your status is visible.',
    color: '#22c55e',
    bgColor: '#22c55e',
    showLocationToAll: false,
    showLocationToFollowings: true,
    showStatus: true
  },
  busy: {
    label: 'Busy',
    description: 'Your location is hidden. Your status is visible.',
    color: '#f97316',
    bgColor: '#f97316',
    showLocationToAll: false,
    showLocationToFollowings: false,
    showStatus: true
  },
  dnd: {
    label: 'Do Not Disturb',
    description: 'Do not disturb. Notifications silenced.',
    color: '#ef4444',
    bgColor: '#ef4444',
    showLocationToAll: false,
    showLocationToFollowings: false,
    showStatus: true
  },
  stream: {
    label: 'Streaming',
    description: 'You are streaming. Your location is hidden.',
    color: '#8b5cf6',
    bgColor: '#8b5cf6',
    showLocationToAll: false,
    showLocationToFollowings: false,
    showStatus: true
  },
  offline: {
    label: 'Offline',
    description: 'You appear offline. Location and status hidden.',
    color: '#6b7280',
    bgColor: '#6b7280',
    showLocationToAll: false,
    showLocationToFollowings: false,
    showStatus: false
  }
};

export function PresenceIcon({ 
  status, 
  size = 20, 
  color 
}: { 
  status: PresenceStatus; 
  size?: number; 
  color?: string;
}) {
  const strokeWidth = size > 14 ? 2.5 : 2;
  const config = PRESENCE_CONFIG[status];
  const fillColor = color || config.bgColor;
  const id = `presence-mask-${status}-${Math.random().toString(36).substring(2, 9)}`;

  switch (status) {
    case 'oja':
      // Cercle avec enveloppe (juste le rabat qui ferme) - découpé
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <mask id={id}>
            <circle cx="12" cy="12" r="10" fill="white" />
            <path d="M6 10l6 4 6-4" stroke="black" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </mask>
          <circle cx="12" cy="12" r="10" fill={fillColor} mask={`url(#${id})`} />
        </svg>
      );
    case 'ojf':
      // Cercle avec check - découpé
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <mask id={id}>
            <circle cx="12" cy="12" r="10" fill="white" />
            <path d="M7 12.5l3 3 7-7" stroke="black" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          </mask>
          <circle cx="12" cy="12" r="10" fill={fillColor} mask={`url(#${id})`} />
        </svg>
      );
    case 'online':
      // Cercle plein simple
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill={fillColor} />
        </svg>
      );
    case 'busy':
      // Cercle avec aiguilles d'horloge - découpé
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <mask id={id}>
            <circle cx="12" cy="12" r="10" fill="white" />
            <path d="M12 7v5l3 2" stroke="black" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          </mask>
          <circle cx="12" cy="12" r="10" fill={fillColor} mask={`url(#${id})`} />
        </svg>
      );
    case 'stream':
      // Play/lecture - découpé
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <mask id={id}>
            <circle cx="12" cy="12" r="10" fill="white" />
            <path d="M9 6l9 6-9 6V6z" fill="black" />
          </mask>
          <circle cx="12" cy="12" r="10" fill={fillColor} mask={`url(#${id})`} />
        </svg>
      );
    case 'dnd':
      // Moins/barre - découpé
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <mask id={id}>
            <circle cx="12" cy="12" r="10" fill="white" />
            <line x1="7" y1="12" x2="17" y2="12" stroke="black" strokeWidth={strokeWidth + 0.5} strokeLinecap="round" />
          </mask>
          <circle cx="12" cy="12" r="10" fill={fillColor} mask={`url(#${id})`} />
        </svg>
      );
    case 'offline':
    default:
      // Cercle plein simple
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill={fillColor} />
        </svg>
      );
  }
}
