'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { EditorContributorRow } from '@/components/editor-contributor-row';

interface ContributorEditorProps {
    contributors: string[];
    isOwner: boolean;
    onAdd: (sid: string) => void;
    onRemove: (sid: string) => void;
}

export function ContributorEditor({ contributors, isOwner, onAdd, onRemove }: ContributorEditorProps) {
    const [newContributor, setNewContributor] = useState('');

    const handleAdd = () => {
        const sid = newContributor.trim();
        if (!sid || contributors.includes(sid)) return;
        onAdd(sid);
        setNewContributor('');
    };

    return (
        <div className="space-y-2 pt-2">
            {contributors.length === 0 && (
                <div className="text-sm text-fd-muted-foreground text-center py-4 border border-dashed border-fd-border rounded-lg">
                    No contributors yet.
                </div>
            )}
            {contributors.length > 0 && (
                <div className="border border-fd-border rounded-lg overflow-hidden divide-y divide-fd-border">
                    {contributors.map(sid => (
                        <EditorContributorRow
                            key={sid}
                            sid={sid}
                            onRemove={isOwner ? () => onRemove(sid) : undefined}
                        />
                    ))}
                </div>
            )}
            {isOwner && (
                <div className="flex items-center gap-2 pt-1">
                    <InputGroup className="flex-1">
                        <InputGroupInput
                            value={newContributor}
                            onChange={e => setNewContributor(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAdd()}
                            placeholder="42@nox.example"
                        />
                    </InputGroup>
                    <Button variant="ghost" size="sm" onClick={handleAdd} disabled={!newContributor.trim()} className="h-9">
                        <Icon icon="material-symbols:add-rounded" className="size-4" />
                        Add
                    </Button>
                </div>
            )}
        </div>
    );
}
