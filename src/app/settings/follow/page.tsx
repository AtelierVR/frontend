'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { useApi, isError } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/config';
import ActionButton from '../ActionButton';
import { TAG_UPLOAD_REGEX } from '../account/page';

const FOLLOW_TAGS = [
  'usr:manual_follow_validation',
  'usr:auto_reject_follow',
  'usr:hide_followers',
  'usr:hide_following',
] as const;

type FollowTag = typeof FOLLOW_TAGS[number];

function hasTag(tags: string[], tag: string) {
  return tags.includes(tag);
}

function setTag(tags: string[], tag: string, enabled: boolean): string[] {
  if (enabled) return tags.includes(tag) ? tags : [...tags, tag];
  return tags.filter(t => t !== tag);
}

export default function FollowSettingsPage() {
  const { t } = useTranslation();
  const Api = useApi();

  const loadingFlag = 1;
  const changedFlag = 1 << 1;

  const [canSaveFlag, setCanSaveFlag] = useState(0);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (Api?.currentUser) {
      setTags(Api.currentUser.tags ?? []);
      setCanSaveFlag(0);
    }
  }, [Api?.currentUser]);

  const toggle = (tag: FollowTag, enabled: boolean) => {
    setTags(prev => setTag(prev, tag, enabled));
    setCanSaveFlag(changedFlag);
  };

  const handleSave = async () => {
    if (!Api || canSaveFlag === 0 || (canSaveFlag & loadingFlag) !== 0) return;

    setCanSaveFlag(f => f | loadingFlag);
    setError(undefined);
    setSuccess(undefined);

    try {
      const res = await Api.updateUser({ tags: tags.filter(t => TAG_UPLOAD_REGEX.test(t)) });
      if (isError(res)) {
        setError(res.message);
        setCanSaveFlag(f => f & ~loadingFlag);
        return;
      }
      setCanSaveFlag(0);
      setSuccess(t('settings.follow.saved_success'));
      setTimeout(() => setSuccess(undefined), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settings.follow.save_failed'));
      setCanSaveFlag(f => f & ~loadingFlag);
    }
  };

  const isLoading = (canSaveFlag & loadingFlag) !== 0;
  const hasChanges = (canSaveFlag & changedFlag) !== 0;

  const toc = [
    { title: t('settings.follow.policy.title'), url: '#policy', depth: 2 },
    { title: t('settings.follow.privacy.title'), url: '#privacy', depth: 2 },
  ];

  return (
    <DocsPage toc={toc} footer={{ enabled: false }}>
      <DocsTitle className="flex items-center justify-between">
        <span>{t('settings.follow.title')}</span>
        <ActionButton
          variant="save"
          onClick={handleSave}
          disabled={!hasChanges}
          isLoading={isLoading}
        />
      </DocsTitle>
      <DocsDescription>{t('settings.follow.description')}</DocsDescription>
      <DocsBody>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-100">
            <CheckCircle2 />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          {/* Follow Policy */}
          <section id="policy">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">{t('settings.follow.policy.title')}</h2>
              <p className="text-sm text-fd-muted-foreground">{t('settings.follow.policy.description')}</p>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{t('settings.follow.policy.manual_approval')}</p>
                    <p className="text-xs text-fd-muted-foreground">{t('settings.follow.policy.manual_approval_desc')}</p>
                  </div>
                  <Switch
                    checked={hasTag(tags, 'usr:manual_follow_validation')}
                    onCheckedChange={(v) => toggle('usr:manual_follow_validation', v)}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{t('settings.follow.policy.auto_reject')}</p>
                    <p className="text-xs text-fd-muted-foreground">{t('settings.follow.policy.auto_reject_desc')}</p>
                  </div>
                  <Switch
                    checked={hasTag(tags, 'usr:auto_reject_follow')}
                    onCheckedChange={(v) => toggle('usr:auto_reject_follow', v)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Privacy */}
          <section id="privacy">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">{t('settings.follow.privacy.title')}</h2>
              <p className="text-sm text-fd-muted-foreground">{t('settings.follow.privacy.description')}</p>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{t('settings.follow.privacy.hide_followers')}</p>
                    <p className="text-xs text-fd-muted-foreground">{t('settings.follow.privacy.hide_followers_desc')}</p>
                  </div>
                  <Switch
                    checked={hasTag(tags, 'usr:hide_followers')}
                    onCheckedChange={(v) => toggle('usr:hide_followers', v)}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{t('settings.follow.privacy.hide_following')}</p>
                    <p className="text-xs text-fd-muted-foreground">{t('settings.follow.privacy.hide_following_desc')}</p>
                  </div>
                  <Switch
                    checked={hasTag(tags, 'usr:hide_following')}
                    onCheckedChange={(v) => toggle('usr:hide_following', v)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </DocsBody>
    </DocsPage>
  );
}
