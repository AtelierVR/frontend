'use client';

import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/config';
import { useApi } from '@/lib/api';
import PasswordChangeSection from './PasswordChangeSection';
import TwoFactorAuthSection from './TwoFactorAuthSection';
import EmailSection from './EmailSection';

export default function PasswordPage() {
  const { t } = useTranslation();
  const Api = useApi();
  const [error, setError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  
  // Email states (not used for saving but required for EmailSection)
  const [email, setEmail] = useState<string>('');
  const [confirmEmail, setConfirmEmail] = useState<string>('');
  const [emailFlag] = useState(0);
  const [canSaveFlag] = useState(0);

  const toc = [
    { title: t('settings.security.toc.email'), url: '#email', depth: 2 },
    { title: t('settings.security.toc.password'), url: '#password', depth: 2 },
    { title: t('settings.security.toc.two_factor'), url: '#2fa', depth: 2 },
  ];

  return (
    <DocsPage toc={toc} footer={{ enabled: false }}>
      <DocsTitle>{t('settings.security.title')}</DocsTitle>
      <DocsDescription>
        {t('settings.security.description')}
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
          <EmailSection
            email={email}
            confirmEmail={confirmEmail}
            currentUser={Api?.currentUser || null}
            emailFlag={emailFlag}
            canSaveFlag={canSaveFlag}
            onEmailChange={setEmail}
            onConfirmEmailChange={setConfirmEmail}
            onFlagChange={() => {}}
            isLoading={false}
            setError={setError}
            setSuccess={setSuccessMessage}
          />

          <PasswordChangeSection
            setError={setError}
            setSuccess={setSuccessMessage}
          />

          <TwoFactorAuthSection
            currentUser={Api?.currentUser || null}
            setError={setError}
            setSuccess={setSuccessMessage}
          />
        </div>
      </DocsBody>
    </DocsPage>
  );
}
