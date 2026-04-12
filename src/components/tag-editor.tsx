'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@iconify/react';

const TAG_EDIT_REGEX = /^usr:([a-z_]+)?$/;
export const TAG_UPLOAD_REGEX = /^usr:([a-z_])([a-z_]+)?$/;

interface TagEditorProps {
    tags: string[];
    onChange: (tags: string[]) => void;
}

export function TagEditor({ tags, onChange }: TagEditorProps) {
    const currentTags = tags.filter(t => t.startsWith('usr:'));

    const handleChange = (index: number, value: string) => {
        if (!TAG_EDIT_REGEX.test(value)) return;
        const next = [...currentTags];
        next[index] = value;
        onChange(next);
    };

    const handleRemove = (index: number) => {
        onChange(currentTags.filter((_, i) => i !== index));
    };

    const handleAdd = () => {
        onChange([...currentTags, 'usr:']);
    };

    return (
        <div className="space-y-2 pt-2">
            {currentTags.length === 0 && (
                <div className="text-sm text-fd-muted-foreground text-center py-4 border border-dashed border-fd-border rounded-lg">
                    No tags yet.
                </div>
            )}
            {currentTags.length > 0 && (
                <div className="border border-fd-border rounded-lg overflow-hidden divide-y divide-fd-border">
                    {currentTags.map((tag, index) => (
                        <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-fd-card hover:bg-fd-muted/50 transition-colors">
                            <Input
                                value={tag}
                                onChange={e => handleChange(index, e.target.value)}
                                className="flex-1 h-7 border-0 bg-transparent focus-visible:ring-0 px-0 text-sm shadow-none"
                            />
                            <Button variant="ghost" size="sm" onClick={() => handleRemove(index)} className="h-6 w-6 p-0 hover:bg-fd-muted">
                                <Icon icon="material-symbols:close-rounded" className="size-3.5" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex items-center justify-center pt-2">
                <Button onClick={handleAdd} variant="ghost" size="sm" className="w-3/4 h-8 hover:bg-fd-muted">
                    <Icon icon="material-symbols:add-rounded" className="size-4" />
                </Button>
            </div>
        </div>
    );
}
