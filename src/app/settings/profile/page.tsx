'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icon } from '@iconify/react';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { useApi, isError } from '@/lib/api';
import { type PresenceStatus } from '@/components/ui/presence-icon';
import { type UserLink } from '@/lib/api/types';
import ActionButton from '../ActionButton';
import DisplaySection from './DisplaySection';
import PronounSection from './PronounSection';
import PresenceSection from './PresenceSection';
import BioSection from './BioSection';
import ProfileImagesSection from './ProfileImagesSection';
import CountriesSection from './CountriesSection';
import LanguagesSection from './LanguagesSection';
import LinksSection from './LinksSection';
import { TAG_UPLOAD_REGEX } from '../account/page';

export default function ProfilePage() {
  const Api = useApi();

  // Flag system constants
  const loadingFlag = 1;
  const thumbnailFlag = 1 << 1;
  const displayFlag = 1 << 2;
  const bannerFlag = 1 << 3;
  const bioFlag = 1 << 4;
  const pronounFlag = 1 << 5;
  const presenceFlag = 1 << 6;
  const statusFlag = 1 << 7;
  const tagsFlag = 1 << 8;
  const linksFlag = 1 << 9;

  const [canSaveFlag, setCanSaveFlag] = useState(0);
  const [error, setError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();

  // Form state (undefined = not modified)
  const [display, setDisplay] = useState<string | undefined>();
  const [thumbnail, setThumbnail] = useState<string | null | undefined>();
  const [banner, setBanner] = useState<string | null | undefined>();
  const [bio, setBio] = useState<string | null | undefined>();
  const [pronoun, setPronoun] = useState<string | null | undefined>();
  const [presence, setPresence] = useState<PresenceStatus | undefined>();
  const [presenceStatus, setPresenceStatus] = useState<string | undefined>();
  const [tags, setTags] = useState<string[] | undefined>();
  const [links, setLinks] = useState<UserLink[] | undefined>();

  // Reset form state when currentUser changes
  useEffect(() => {
    setDisplay(undefined);
    setThumbnail(undefined);
    setBanner(undefined);
    setBio(undefined);
    setPronoun(undefined);
    setPresence(undefined);
    setPresenceStatus(undefined);
    setTags(undefined);
    setLinks(undefined);
    setCanSaveFlag(0);
  }, [Api?.currentUser]);

  const handleSave = async () => {
    if (canSaveFlag === 0 || (canSaveFlag & loadingFlag) === loadingFlag || !Api) return;

    setCanSaveFlag(canSaveFlag | loadingFlag);
    setError(undefined);
    setSuccessMessage(undefined);

    try {
      // Update user profile fields
      const res = await Api.updateUser({
        display: display,
        bio: bio || undefined,
        pronoun: pronoun || undefined,
        presence: presence,
        presence_status: presenceStatus || undefined,
        tags: tags?.filter(tag => TAG_UPLOAD_REGEX.test(tag)),
        links: links,
      });

      if (isError(res)) {
        setError(res.message);
        setCanSaveFlag(canSaveFlag & ~loadingFlag);
        return;
      }

      setDisplay(undefined);
      setBio(undefined);
      setPronoun(undefined);
      setPresence(undefined);
      setPresenceStatus(undefined);
      setTags(undefined);
      setLinks(undefined);
      setCanSaveFlag(canSaveFlag & ~(displayFlag | bioFlag | pronounFlag | presenceFlag | statusFlag | tagsFlag | linksFlag));

      // Upload thumbnail
      if (thumbnail) {
        const file = await fetch(thumbnail).then(r => r.blob());
        const res = await Api.uploadUserThumbnail(file);

        if (isError(res)) {
          setError(res.message);
          setCanSaveFlag(canSaveFlag & ~loadingFlag);
          return;
        }

        setThumbnail(undefined);
        setCanSaveFlag(canSaveFlag & ~thumbnailFlag);
      }

      // Upload banner
      if (banner) {
        const file = await fetch(banner).then(r => r.blob());
        const res = await Api.uploadUserBanner(file);
        if (isError(res)) {
          setError(res.message);
          setCanSaveFlag(canSaveFlag & ~loadingFlag);
          return;
        }
        setBanner(undefined);
        setCanSaveFlag(canSaveFlag & ~bannerFlag);
      }

      setError(undefined);
      setCanSaveFlag(0);
      setSuccessMessage('Profile saved successfully!');

      setTimeout(() => setSuccessMessage(undefined), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
      setCanSaveFlag(canSaveFlag & ~loadingFlag);
    }
  };

  const isLoading = (canSaveFlag & loadingFlag) === loadingFlag;
  const hasChanges = canSaveFlag > 0 && !isLoading;

  const toc = [
    { title: 'Basic Information', url: '#basic-information', depth: 2 },
    { title: 'Links', url: '#links', depth: 2 },
    { title: 'Countries', url: '#countries', depth: 2 },
    { title: 'Languages', url: '#languages', depth: 2 },
    { title: 'Profile Images', url: '#profile-images', depth: 2 },
  ];

  return (
    <DocsPage toc={toc} footer={{ enabled: false }}>
      <DocsTitle className="flex items-center justify-between">
        <span>Public Profile</span>
        <ActionButton
          variant="save"
          onClick={handleSave}
          disabled={!hasChanges}
          isLoading={isLoading}
        />
      </DocsTitle>
      <DocsDescription>
        Your display name is what others see when they visit your profile and in the app.
      </DocsDescription>
      <DocsBody>
        {/* Messages */}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <Icon icon="material-symbols:error-circle-rounded" className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30 text-green-700 dark:text-green-400">
            <Icon icon="material-symbols:check-circle-rounded" className="size-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left column: Form fields */}
          <div className="space-y-8 flex-1">
            <DisplaySection
              display={display}
              currentUser={Api?.currentUser || null}
              displayFlag={displayFlag}
              canSaveFlag={canSaveFlag}
              onDisplayChange={setDisplay}
              onFlagChange={setCanSaveFlag}
            />

            <PronounSection
              pronoun={pronoun}
              currentUser={Api?.currentUser || null}
              pronounFlag={pronounFlag}
              canSaveFlag={canSaveFlag}
              onPronounChange={setPronoun}
              onFlagChange={setCanSaveFlag}
            />

            <PresenceSection
              presence={presence}
              presenceStatus={presenceStatus}
              currentUser={Api?.currentUser || null}
              presenceFlag={presenceFlag}
              statusFlag={statusFlag}
              canSaveFlag={canSaveFlag}
              onPresenceChange={setPresence}
              onStatusChange={setPresenceStatus}
              onFlagChange={setCanSaveFlag}
            />

            <BioSection
              bio={bio}
              currentUser={Api?.currentUser || null}
              bioFlag={bioFlag}
              canSaveFlag={canSaveFlag}
              onBioChange={setBio}
              onFlagChange={setCanSaveFlag}
            />

            <LinksSection
              links={links}
              currentUser={Api?.currentUser || null}
              linksFlag={linksFlag}
              canSaveFlag={canSaveFlag}
              onLinksChange={setLinks}
              onFlagChange={setCanSaveFlag}
            />

            <CountriesSection
              tags={tags}
              currentUser={Api?.currentUser || null}
              tagsFlag={tagsFlag}
              canSaveFlag={canSaveFlag}
              onTagsChange={setTags}
              onFlagChange={setCanSaveFlag}
            />

            <LanguagesSection
              tags={tags}
              currentUser={Api?.currentUser || null}
              tagsFlag={tagsFlag}
              canSaveFlag={canSaveFlag}
              onTagsChange={setTags}
              onFlagChange={setCanSaveFlag}
            />
          </div>

          {/* Right column: Images */}
          <ProfileImagesSection
            thumbnail={thumbnail}
            banner={banner}
            currentUser={Api?.currentUser || null}
            thumbnailFlag={thumbnailFlag}
            bannerFlag={bannerFlag}
            canSaveFlag={canSaveFlag}
            onThumbnailChange={setThumbnail}
            onBannerChange={setBanner}
            onFlagChange={setCanSaveFlag}
          />
        </div>
      </DocsBody>
    </DocsPage>
  );
}
