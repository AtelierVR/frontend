import { cn } from '@/lib/cn';

interface TagPlaceholder {
    text?: string;
    color?: [number, number, number];
    icon?: React.ReactNode;
}

export function getTagConfig(tag: string): TagPlaceholder | null {
    if (tag.match(/^dft:/) || tag.match(/^sys:/)) return null;
    const displayName = tag.includes(':')
        ? tag.split(':', 2)[1].split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : tag;
    return { text: displayName, color: undefined };
}

export function TagList({ list }: { list: string[] | null }) {
    return (
        <div className="flex flex-wrap gap-2 items-center justify-center">
            {list?.map((tag, i) => <TagItem key={i} tag={tag} />)}
            {list?.length === 0 && (
                <div className="text-fd-muted-foreground text-sm">No tags</div>
            )}
            {!list && [75, 60, 80].map((k, i) => (
                <div key={i} style={{ inlineSize: `${k}px` }} className={cn('bg-fd-muted animate-pulse rounded-full h-8')} />
            ))}
        </div>
    );
}

export function TagItem({ tag }: { tag: string }) {
    const config = getTagConfig(tag);
    if (config === null) return null;

    const colorSaturation = (color: [number, number, number], s: number) =>
        color.map(v => Math.round(v * s));

    const customStyles = config.color ? {
        backgroundColor: `rgb(${config.color.join(', ')})`,
        borderColor: `rgb(${colorSaturation(config.color, 0.7).join(', ')})`,
        color: config.color[0] * 0.299 + config.color[1] * 0.587 + config.color[2] * 0.114 > 128 ? '#000000' : '#ffffff',
    } : {};

    return (
        <div
            style={customStyles}
            className={cn(
                'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border transition-colors',
                config.color ? undefined : 'bg-fd-secondary text-fd-secondary-foreground border-fd-border',
            )}
        >
            {config.icon && <span className="flex-shrink-0">{config.icon}</span>}
            <span className="font-medium">{config.text || tag}</span>
        </div>
    );
}
