'use client';

import { useState, useEffect } from 'react';
import { useAvatar } from '../AvatarContext';
import { useApi, isError } from '@/lib/api';
import {
    InputGroup,
    InputGroupInput,
    InputGroupTextarea,
} from '@/components/ui/input-group';
import ImageUploader from '@/components/ui/image-uploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icon } from '@iconify/react';

export default function AvatarEditPage() {
    const { avatar, canEdit, refresh } = useAvatar();
    const Api = useApi();

    const thumbnailFlag = 1 << 1;
    const titleFlag = 1 << 2;
    const descriptionFlag = 1 << 3;
    const releaseFlag = 1 << 4;
    const tagsFlag = 1 << 5;
    const loadingFlag = 1;

    const [canSaveFlag, setCanSaveFlag] = useState(0);
    const [title, setTitle] = useState<string | undefined>();
    const [description, setDescription] = useState<string | undefined>();
    const [release, setRelease] = useState<string | undefined>();
    const [thumbnail, setThumbnail] = useState<string | null | undefined>();
    const [tags, setTags] = useState<string[] | undefined>();

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        setTitle(undefined);
        setDescription(undefined);
        setRelease(undefined);
        setThumbnail(undefined);
        setTags(undefined);
        setCanSaveFlag(0);
    }, [avatar?.id]);

    if (!canEdit) {
        return (
            <Alert variant="destructive">
                <Icon icon="material-symbols:block-rounded" className="h-4 w-4" />
                <AlertDescription>You don&apos;t have permission to edit this avatar.</AlertDescription>
            </Alert>
        );
    }

    if (!avatar) return null;

    const isSaving = (canSaveFlag & loadingFlag) !== 0;
    const canSave = canSaveFlag > 0 && !isSaving;

    const handleSave = async () => {
        if (!Api || !avatar || !canSave) return;
        setCanSaveFlag(f => f | loadingFlag);
        setError(null);
        setSuccess(false);
        try {
            const res = await Api.updateAvatar(avatar.id, avatar.server, {
                title: title?.trim() || undefined,
                description: description !== undefined ? (description.trim() || null) : undefined,
                release: release !== undefined && release !== '' ? Number(release) : undefined,
                tags: tags,
            });
            if (isError(res)) {
                setError(res.message);
                setCanSaveFlag(f => f & ~loadingFlag);
                return;
            }

            if (thumbnail) {
                const file = await fetch(thumbnail).then(r => r.blob());
                const tRes = await Api.uploadAvatarThumbnail(avatar.id, avatar.server, file);
                if (isError(tRes)) {
                    setError(tRes.message);
                    setCanSaveFlag(f => f & ~loadingFlag);
                    return;
                }
                setThumbnail(undefined);
            }

            setTitle(undefined);
            setDescription(undefined);
            setRelease(undefined);
            setTags(undefined);
            setCanSaveFlag(0);
            setSuccess(true);
            refresh();
            setTimeout(() => setSuccess(false), 3000);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An error occurred');
            setCanSaveFlag(f => f & ~loadingFlag);
        }
    };

    return (
        <div className="space-y-8">
            {error && (
                <Alert variant="destructive">
                    <Icon icon="material-symbols:error-circle-rounded" className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {success && (
                <Alert>
                    <Icon icon="material-symbols:check-circle-rounded" className="h-4 w-4" />
                    <AlertDescription>Changes saved successfully.</AlertDescription>
                </Alert>
            )}

            {/* Title */}
            <section id="title" className="space-y-2">
                <h2 className="text-lg font-semibold">Title</h2>
                <InputGroup>
                    <InputGroupInput
                        id="avatar-title"
                        value={title === undefined ? (avatar.title || '') : title}
                        onChange={e => {
                            setTitle(e.target.value);
                            setCanSaveFlag(f => f | titleFlag);
                        }}
                        placeholder={avatar.title || 'Avatar title'}
                        maxLength={128}
                    />
                </InputGroup>
            </section>

            {/* Thumbnail */}
            <section id="thumbnail" className="space-y-2">
                <h2 className="text-lg font-semibold">Thumbnail</h2>
                <p className="text-sm text-fd-muted-foreground">Image shown at the top of the avatar page.</p>
                <ImageUploader
                    id="avatar-thumbnail-file"
                    value={thumbnail}
                    src={avatar.thumbnail || ''}
                    alt={avatar.title}
                    onChange={val => {
                        setThumbnail(val);
                        setCanSaveFlag(f => f | thumbnailFlag);
                    }}
                    onFlagChange={setCanSaveFlag}
                    flag={thumbnailFlag}
                    currentFlag={canSaveFlag}
                    width={1024}
                    height={768}
                    className="w-full max-w-sm"
                />
                <span className="text-sm text-fd-muted-foreground">1024×768px — 4:3</span>
            </section>

            {/* Description */}
            <section id="description" className="space-y-2">
                <h2 className="text-lg font-semibold">Description</h2>
                <InputGroup>
                    <InputGroupTextarea
                        id="avatar-description"
                        value={description === undefined ? (avatar.description || '') : description}
                        onChange={e => {
                            setDescription(e.target.value);
                            setCanSaveFlag(f => f | descriptionFlag);
                        }}
                        placeholder="Describe your avatar..."
                        rows={6}
                    />
                </InputGroup>
            </section>

            {/* Release */}
            <section id="release" className="space-y-2">
                <h2 className="text-lg font-semibold">Release Version</h2>
                <p className="text-sm text-fd-muted-foreground">Recommended release version index. Use -1 for automatic (latest).</p>
                <InputGroup>
                    <InputGroupInput
                        id="avatar-release"
                        type="number"
                        value={release === undefined ? (avatar.release != null ? String(avatar.release) : '-1') : release}
                        onChange={e => {
                            setRelease(e.target.value);
                            setCanSaveFlag(f => f | releaseFlag);
                        }}
                        placeholder="-1"
                    />
                </InputGroup>
            </section>

            {/* Tags */}
            <section id="tags" className="space-y-2">
                <h2 className="text-lg font-semibold">Tags</h2>
                <p className="text-sm text-fd-muted-foreground">User-defined tags for this avatar. Only <code className="text-xs">usr:</code> tags can be set.</p>

                <div className="space-y-2 pt-2">
                    {(() => {
                        const currentTags = (tags ?? avatar.tags ?? []).filter(t => t.startsWith('usr:'));
                        const TAG_EDIT_REGEX = /^usr:([a-z_]+)?$/;

                        const handleChange = (index: number, value: string) => {
                            if (!TAG_EDIT_REGEX.test(value)) return;
                            const next = [...currentTags];
                            next[index] = value;
                            setTags(next);
                            setCanSaveFlag(f => f | tagsFlag);
                        };
                        const handleRemove = (index: number) => {
                            const next = currentTags.filter((_, i) => i !== index);
                            setTags(next);
                            setCanSaveFlag(f => f | tagsFlag);
                        };
                        const handleAdd = () => {
                            setTags([...currentTags, 'usr:']);
                            setCanSaveFlag(f => f | tagsFlag);
                        };

                        return (
                            <>
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
                            </>
                        );
                    })()}
                </div>
            </section>

            {/* Save */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={!canSave}>
                    {isSaving && <Icon icon="material-symbols:sync-rounded" className="size-4 mr-2 animate-spin" />}
                    Save changes
                </Button>
            </div>
        </div>
    );
}
