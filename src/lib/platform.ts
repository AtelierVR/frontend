export const PLATFORM_ICONS: Record<string, { icon: string; label: string; color: string }> = {
    windows: { icon: 'mdi:microsoft-windows', label: 'Windows', color: '#0079D5' },
    linux: { icon: 'mdi:linux', label: 'Linux', color: '#F7C530' },
    macos: { icon: 'simple-icons:macos', label: 'macOS', color: '#A2AAAD' },
    android: { icon: 'mdi:android', label: 'Android', color: '#2FD77F' },
    ios: { icon: 'mdi:apple-ios', label: 'iOS', color: '#A2AAAD' },
    visionos: { icon: 'tabler:device-vision-pro', label: 'visionOS', color: '#BA50B1' },
};

export function formatSize(bytes: number): string {
    if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(2)} Go`;
    if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} Mo`;
    if (bytes >= 1_000) return `${Math.round(bytes / 1_000)} ko`;
    return `${bytes} o`;
}

export function parseSid(sid: string): { id: number | string; server?: string } {
    const bare = sid.startsWith('u:') ? sid.slice(2) : sid;
    const atIdx = bare.lastIndexOf('@');
    if (atIdx === -1) return { id: bare };
    const id = bare.slice(0, atIdx);
    const server = bare.slice(atIdx + 1);
    return {
        id: isNaN(parseInt(id, 10)) ? id : parseInt(id, 10),
        server: server === '::' ? undefined : server || undefined,
    };
}

export function sidToUserHref(sid: string): string {
    const bare = sid.startsWith('u:') ? sid.slice(2) : sid;
    return `/u/${bare}`;
}
