'use client';

import { useState, useEffect } from 'react';
import { useWorld } from '../WorldContext';
import { useApi, isError } from '@/lib/api';
import { getSIDById } from '@/lib/api/utils';
import {
    InputGroup,
    InputGroupInput,
    InputGroupTextarea,
    InputGroupAddon,
    InputGroupText,
} from '@/components/ui/input-group';
import ImageUploader from '@/components/ui/image-uploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icon } from '@iconify/react';
import type { User } from '@/lib/api/types';
import Link from 'next/link';
import { cn } from '@/lib/cn';

function parseSid(sid: string): { id: number | string; server?: string } {
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

function ContributorRow({ sid, onRemove }: { sid: string; onRemove?: () => void }) {
    const Api = useApi();
    const [user, setUser] = useState<User | null | undefined>(undefined);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (!Api) return;
        const { id, server } = parseSid(sid);
        Api.getOrFetchUser(id, server).then(res => setUser(isError(res) ? null : res));
    }, [sid, Api]);

    const bare = sid.startsWith('u:') ? sid.slice(2) : sid;
    const displayName = user ? (user.display || user.username) : null;
    const subLabel = user ? `${user.username}@${user.server}` : bare;

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-fd-card hover:bg-fd-muted/50 transition-colors">
            {/* Avatar */}
            <div className={cn('size-6 rounded-full overflow-hidden flex-shrink-0 bg-fd-muted', user === undefined && 'animate-pulse')}>
                {user !== undefined && (!imageError && user?.thumbnail ? (
                    <img src={user.thumbnail} alt={displayName || bare} className="size-6 object-cover" onError={() => setImageError(true)} />
                ) : (
                    <div className="size-6 rounded-full bg-fd-primary/20 flex items-center justify-center">
                        <Icon icon="material-symbols:person-rounded" className="size-3.5 text-fd-muted-foreground" />
                    </div>
                ))}
            </div>
            {/* Name */}
            <Link href={`/u/${bare}`} className="flex-1 min-w-0 flex items-center gap-2 text-sm group">
                <span className="font-medium truncate">{displayName ?? bare}</span>
                {displayName && <span className="text-xs text-fd-muted-foreground font-mono truncate">{subLabel}</span>}
            </Link>
            {onRemove && (
                <Button variant="ghost" size="sm" onClick={onRemove} className="h-6 w-6 p-0 hover:bg-fd-muted flex-shrink-0">
                    <Icon icon="material-symbols:close-rounded" className="size-3.5" />
                </Button>
            )}
        </div>
    );
}

export default function WorldEditPage() {
    const { world, canEdit, refresh } = useWorld();
    const Api = useApi();

    const thumbnailFlag = 1 << 1;
    const titleFlag = 1 << 2;
    const descriptionFlag = 1 << 3;
    const capacityFlag = 1 << 4;
    const releaseFlag = 1 << 5;
    const contributorsFlag = 1 << 6;
    const tagsFlag = 1 << 7;
    const loadingFlag = 1;

    const normalizeRef = (s: string) => s.startsWith('u:') ? s.slice(2) : s;
    const isOwner = Api?.currentUser && world
        ? normalizeRef(world.owner) === getSIDById(Api.currentUser.id, Api.currentUser.server)
        : false;

    const [canSaveFlag, setCanSaveFlag] = useState(0);
    const [title, setTitle] = useState<string | undefined>();
    const [description, setDescription] = useState<string | undefined>();
    const [capacity, setCapacity] = useState<string | undefined>();
    const [release, setRelease] = useState<string | undefined>();
    const [thumbnail, setThumbnail] = useState<string | null | undefined>();
    const [contributors, setContributors] = useState<string[] | undefined>();
    const [newContributor, setNewContributor] = useState('');
    const [tags, setTags] = useState<string[] | undefined>();

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        setTitle(undefined);
        setDescription(undefined);
        setCapacity(undefined);
        setRelease(undefined);
        setThumbnail(undefined);
        setContributors(undefined);
        setNewContributor('');
        setTags(undefined);
        setCanSaveFlag(0);
    }, [world?.id]);

    if (!canEdit) {
        return (
            <Alert variant="destructive">
                <Icon icon="material-symbols:block-rounded" className="h-4 w-4" />
                <AlertDescription>You don&apos;t have permission to edit this world.</AlertDescription>
            </Alert>
        );
    }

    if (!world) return null;

    const isSaving = (canSaveFlag & loadingFlag) !== 0;
    const canSave = canSaveFlag > 0 && !isSaving;

    const currentContributors = contributors ?? world.contributors;

    const addContributor = () => {
        const sid = newContributor.trim();
        if (!sid || currentContributors.includes(sid)) return;
        const next = [...currentContributors, sid];
        setContributors(next);
        setNewContributor('');
        setCanSaveFlag(f => f | contributorsFlag);
    };

    const removeContributor = (sid: string) => {
        const next = currentContributors.filter(c => c !== sid);
        setContributors(next);
        setCanSaveFlag(f => f | contributorsFlag);
    };

    const handleSave = async () => {
        if (!Api || !world || !canSave) return;
        setCanSaveFlag(f => f | loadingFlag);
        setError(null);
        setSuccess(false);
        try {
            const res = await Api.updateWorld(world.id, world.server, {
                title: title?.trim() || undefined,
                description: description !== undefined ? (description.trim() || null) : undefined,
                capacity: capacity !== undefined && capacity !== '' ? Number(capacity) : undefined,
                release: release !== undefined && release !== '' ? Number(release) : undefined,
                contributors: contributors,
                tags: tags,
            });
            if (isError(res)) {
                setError(res.message);
                setCanSaveFlag(f => f & ~loadingFlag);
                return;
            }

            if (thumbnail) {
                const file = await fetch(thumbnail).then(r => r.blob());
                const tRes = await Api.uploadWorldThumbnail(world.id, world.server, file);
                if (isError(tRes)) {
                    setError(tRes.message);
                    setCanSaveFlag(f => f & ~loadingFlag);
                    return;
                }
                setThumbnail(undefined);
            }

            setTitle(undefined);
            setDescription(undefined);
            setCapacity(undefined);
            setRelease(undefined);
            setContributors(undefined);
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
                        id="world-title"
                        value={title === undefined ? (world.title || '') : title}
                        onChange={e => {
                            setTitle(e.target.value);
                            setCanSaveFlag(f => f | titleFlag);
                        }}
                        placeholder={world.title || 'World title'}
                        maxLength={128}
                    />
                    <InputGroupAddon align="inline-end">
                        <InputGroupText className="text-xs tabular-nums">
                            {(title === undefined ? world.title : title)?.length || 0}/128
                        </InputGroupText>
                    </InputGroupAddon>
                </InputGroup>
            </section>

            {/* Thumbnail */}
            <section id="thumbnail" className="space-y-2">
                <h2 className="text-lg font-semibold">Thumbnail</h2>
                <p className="text-sm text-fd-muted-foreground">Banner image shown at the top of the world page.</p>
                <ImageUploader
                    id="world-thumbnail-file"
                    value={thumbnail}
                    src={world.thumbnail || ''}
                    alt={world.title}
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
                        id="world-description"
                        value={description === undefined ? (world.description || '') : description}
                        onChange={e => {
                            setDescription(e.target.value);
                            setCanSaveFlag(f => f | descriptionFlag);
                        }}
                        placeholder="Describe your world..."
                        rows={6}
                    />
                </InputGroup>
            </section>

            {/* Capacity */}
            <section id="capacity" className="space-y-2">
                <h2 className="text-lg font-semibold">Capacity</h2>
                <p className="text-sm text-fd-muted-foreground">Maximum number of simultaneous players. Zero for unlimited.</p>
                <InputGroup>
                    <InputGroupInput
                        id="world-capacity"
                        type="number"
                        value={capacity === undefined ? (world.capacity != null ? String(world.capacity) : '') : capacity}
                        onChange={e => {
                            setCapacity(e.target.value);
                            setCanSaveFlag(f => f | capacityFlag);
                        }}
                        placeholder="Unlimited"
                        min={0}
                    />
                </InputGroup>
            </section>

            {/* Release */}
            <section id="release" className="space-y-2">
                <h2 className="text-lg font-semibold">Release Version</h2>
                <p className="text-sm text-fd-muted-foreground">Recommended release version index. Use -1 for automatic (latest).</p>
                <InputGroup>
                    <InputGroupInput
                        id="world-release"
                        type="number"
                        value={release === undefined ? (world.release != null ? String(world.release) : '-1') : release}
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
                <p className="text-sm text-fd-muted-foreground">User-defined tags for this world. Only <code className="text-xs">usr:</code> tags can be set.</p>

                <div className="space-y-2 pt-2">
                    {(() => {
                        const currentTags = (tags ?? world.tags ?? []).filter(t => t.startsWith('usr:'));
                        const TAG_EDIT_REGEX = /^usr:([a-z_]+)?$/;
                        const TAG_UPLOAD_REGEX = /^usr:([a-z_])([a-z_]+)?$/;

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

            {/* Contributors */}
            <section id="contributors" className="space-y-2">
                <h2 className="text-lg font-semibold">Contributors</h2>
                <p className="text-sm text-fd-muted-foreground">
                    {isOwner
                        ? 'People who can edit this world. Enter their NoxIdentifier (e.g. 42@nox.example) to add them.'
                        : 'People who can edit this world.'}
                </p>

                <div className="space-y-2 pt-2">
                    {currentContributors.length === 0 && (
                        <div className="text-sm text-fd-muted-foreground text-center py-4 border border-dashed border-fd-border rounded-lg">
                            No contributors yet.
                        </div>
                    )}

                    {currentContributors.length > 0 && (
                        <div className="border border-fd-border rounded-lg overflow-hidden divide-y divide-fd-border">
                            {currentContributors.map(sid => (
                                <ContributorRow
                                    key={sid}
                                    sid={sid}
                                    onRemove={isOwner ? () => removeContributor(sid) : undefined}
                                />
                            ))}
                        </div>
                    )}

                    {isOwner && (
                        <div className="flex items-center gap-2 pt-1">
                            <InputGroup className="flex-1">
                                <InputGroupInput
                                    id="world-contributor-add"
                                    value={newContributor}
                                    onChange={e => setNewContributor(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addContributor()}
                                    placeholder="42@nox.example"
                                />
                            </InputGroup>
                            <Button variant="ghost" size="sm" onClick={addContributor} disabled={!newContributor.trim()} className="h-9">
                                <Icon icon="material-symbols:add-rounded" className="size-4" />
                                Add
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {/* Save */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={!canSave}>
                    {isSaving
                        ? <><Icon icon="material-symbols:progress-activity" className="size-4 mr-2 animate-spin" />Saving...</>
                        : <><Icon icon="material-symbols:save-rounded" className="size-4 mr-2" />Save Changes</>
                    }
                </Button>
            </div>
        </div>
    );
}
