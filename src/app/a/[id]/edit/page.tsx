'use client';

import { useState, useEffect } from 'react';
import { useAvatar } from '../AvatarContext';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icon } from '@iconify/react';
import { EditorContributorRow } from '@/components/editor-contributor-row';
import { TagEditor } from '@/components/tag-editor';

export default function AvatarEditPage() {
    const { avatar, canEdit, refresh } = useAvatar();
    const Api = useApi();

    const thumbnailFlag = 1 << 1;
    const titleFlag = 1 << 2;
    const descriptionFlag = 1 << 3;
    const releaseFlag = 1 << 4;
    const tagsFlag = 1 << 5;
    const contributorsFlag = 1 << 6;
    const nameFlag = 1 << 7;
    const loadingFlag = 1;

    const normalizeRef = (s: string) => s.startsWith('u:') ? s.slice(2) : s;
    const isOwner = Api?.currentUser && avatar
        ? normalizeRef(avatar.owner) === getSIDById(Api.currentUser.id, Api.currentUser.server)
        : false;

    const [canSaveFlag, setCanSaveFlag] = useState(0);
    const [name, setName] = useState<string | undefined>();
    const [title, setTitle] = useState<string | undefined>();
    const [description, setDescription] = useState<string | undefined>();
    const [release, setRelease] = useState<string | undefined>();
    const [thumbnail, setThumbnail] = useState<string | null | undefined>();
    const [contributors, setContributors] = useState<string[] | undefined>();
    const [newContributor, setNewContributor] = useState('');
    const [tags, setTags] = useState<string[] | undefined>();

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        setName(undefined);
        setTitle(undefined);
        setDescription(undefined);
        setRelease(undefined);
        setThumbnail(undefined);
        setContributors(undefined);
        setNewContributor('');
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

    const currentContributors = contributors ?? avatar.contributors;

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
        if (!Api || !avatar || !canSave) return;
        setCanSaveFlag(f => f | loadingFlag);
        setError(null);
        setSuccess(false);
        try {
            const res = await Api.updateAvatar(avatar.id, avatar.server, {
                name: name !== undefined ? (name.trim() || null) : undefined,
                title: title?.trim() || undefined,
                description: description !== undefined ? (description.trim() || null) : undefined,
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
                const tRes = await Api.uploadAvatarThumbnail(avatar.id, avatar.server, file);
                if (isError(tRes)) {
                    setError(tRes.message);
                    setCanSaveFlag(f => f & ~loadingFlag);
                    return;
                }
                setThumbnail(undefined);
            }

            setName(undefined);
            setTitle(undefined);
            setDescription(undefined);
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

            {/* Name */}
            <section id="name" className="space-y-2">
                <h2 className="text-lg font-semibold">Short Name</h2>
                <p className="text-sm text-fd-muted-foreground">Unique identifier used in URLs. 3–8 characters: lowercase letters, digits, hyphens, underscores, or dots.</p>
                <InputGroup>
                    <InputGroupInput
                        id="avatar-name"
                        value={name === undefined ? (avatar.name ?? '') : name}
                        onChange={e => {
                            setName(e.target.value);
                            setCanSaveFlag(f => f | nameFlag);
                        }}
                        placeholder={avatar.name ?? 'shortname'}
                        maxLength={8}
                        pattern="[a-z0-9\-_.]{3,8}"
                    />
                    <InputGroupAddon align="inline-end">
                        <InputGroupText className="text-xs tabular-nums">
                            {(name === undefined ? avatar.name : name)?.length ?? 0}/8
                        </InputGroupText>
                    </InputGroupAddon>
                </InputGroup>
            </section>

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
                <TagEditor
                    tags={tags ?? avatar.tags ?? []}
                    onChange={next => {
                        setTags(next);
                        setCanSaveFlag(f => f | tagsFlag);
                    }}
                />
            </section>

            {/* Contributors */}
            <section id="contributors" className="space-y-2">
                <h2 className="text-lg font-semibold">Contributors</h2>
                <p className="text-sm text-fd-muted-foreground">
                    {isOwner
                        ? 'People who can edit this avatar. Enter their NoxIdentifier (e.g. 42@nox.example) to add them.'
                        : 'People who can edit this avatar.'}
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
                                <EditorContributorRow
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
                                    id="avatar-contributor-add"
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
                    {isSaving && <Icon icon="material-symbols:sync-rounded" className="size-4 mr-2 animate-spin" />}
                    Save changes
                </Button>
            </div>
        </div>
    );
}
