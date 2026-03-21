'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { useApi, isError } from '@/lib/api';
import ActionButton from '../ActionButton';
import UsernameSection from './UsernameSection';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/config';
import TagsSection from './TagsSection';

export const TAG_EDIT_REGEX = /^usr:([a-z_]+)?$/;
export const TAG_UPLOAD_REGEX = /^usr:([a-z_])([a-z_]+)?$/;

export default function AccountPage() {
  const { t } = useTranslation();
  const Api = useApi();

  // Flag system constants
  const loadingFlag = 1;
  const usernameFlag = 1 << 1;
  const tagsFlag = 1 << 2;

  const [canSaveFlag, setCanSaveFlag] = useState(0);
  const [error, setError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();

  // Form state (undefined = not modified)
  const [username, setUsername] = useState<string | undefined>();
  const [tags, setTags] = useState<string[] | null>();

  // Reset form state when currentUser changes
  useEffect(() => {
    setUsername(undefined);
    setTags(undefined);
    setCanSaveFlag(0);
  }, [Api?.currentUser]);

  const handleSave = async () => {
    if (canSaveFlag === 0 || (canSaveFlag & loadingFlag) === loadingFlag || !Api) return;

    setCanSaveFlag(canSaveFlag | loadingFlag);
    setError(undefined);
    setSuccessMessage(undefined);

    try {
      const updateData: any = {};

      if (username !== undefined && username.trim() !== Api?.currentUser?.username) {
        updateData.username = username;
      }

      if (tags) {
        updateData.tags = tags.filter(tag => TAG_UPLOAD_REGEX.test(tag));
      }

      const res = await Api.updateUser(updateData);

      if (isError(res)) {
        setError(res.message);
        setCanSaveFlag(canSaveFlag & ~loadingFlag);
        return;
      }

      setUsername(undefined);
      setTags(undefined);
      setError(undefined);
      setCanSaveFlag(0);
      setSuccessMessage(t('settings.account.updated_success'));

      setTimeout(() => setSuccessMessage(undefined), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settings.account.update_failed'));
      setCanSaveFlag(canSaveFlag & ~loadingFlag);
    }
  };

  const isLoading = (canSaveFlag & loadingFlag) === loadingFlag;
  const hasChanges = canSaveFlag > 0 && !isLoading;

  const toc = [
    { title: t('settings.account.toc.username'), url: '#username', depth: 2 },
    { title: t('settings.account.toc.tags'), url: '#tags', depth: 2 },
  ];

  return (
    <DocsPage toc={toc} footer={{ enabled: false }}>
      <DocsTitle className="flex items-center justify-between">
        <span>{t('settings.account.title')}</span>
        <ActionButton
          variant="save"
          onClick={handleSave}
          disabled={!hasChanges}
          isLoading={isLoading}
        />
      </DocsTitle>
      <DocsDescription>
        {t('settings.account.description')}
      </DocsDescription>
      <DocsBody>
        {/* Messages */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {successMessage && (
          <Alert className="mb-6 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30 text-green-700 dark:text-green-400">
            <CheckCircle2 />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          <UsernameSection
            username={username}
            currentUser={Api?.currentUser || null}
            usernameFlag={usernameFlag}
            canSaveFlag={canSaveFlag}
            onUsernameChange={setUsername}
            onFlagChange={setCanSaveFlag}
          />

          <TagsSection
            tags={tags}
            currentUser={Api?.currentUser || null}
            tagsFlag={tagsFlag}
            canSaveFlag={canSaveFlag}
            onTagsChange={setTags}
            onFlagChange={setCanSaveFlag}
          />
        </div>
      </DocsBody>
    </DocsPage>
  );
}
