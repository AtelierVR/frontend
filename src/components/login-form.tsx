'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/config';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { FormCard } from '@/components/ui/form-card';
import { ErrorAlert } from '@/components/ui/status-alert';
import { VerificationModal } from './verification-modal';
import { useLoginVerification } from './login-form-hook';
import Link from 'next/link';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
    const { t } = useTranslation();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const { loading, error, showModal, methods, handleVerificationSuccess, handleVerificationClose, handleSubmit } =
        useLoginVerification(identifier, password);

    const footer = (
        <FieldDescription className="text-center text-xs text-fd-muted-foreground/70">
            {t('auth.login.terms_text')}{' '}
            <Link href="/terms" className="underline hover:text-fd-foreground">{t('auth.login.terms_of_service')}</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline hover:text-fd-foreground">{t('auth.login.privacy_policy')}</Link>.
        </FieldDescription>
    );

    return (
        <FormCard title={t('auth.login.title')} description={t('auth.login.description')} footer={footer} className={className} {...props}>
            <form onSubmit={handleSubmit}>
                <FieldGroup className="gap-3">
                    {error && <ErrorAlert message={error} title={t('auth.login.failed')} className="mb-4" />}
                    <Field>
                        <FieldLabel htmlFor="identifier">{t('auth.login.username_email')}</FieldLabel>
                        <Input id="identifier" type="text" placeholder="m@example.com" value={identifier} onChange={e => setIdentifier(e.target.value)} required />
                    </Field>
                    <Field>
                        <div className="flex items-center justify-between">
                            <FieldLabel htmlFor="password">{t('auth.login.password')}</FieldLabel>
                            <Link href="/forgot-password" className="text-sm text-fd-muted-foreground underline-offset-4 hover:underline">
                                {t('auth.login.forgot_password')}
                            </Link>
                        </div>
                        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </Field>
                    <Field className="mt-6">
                        <Button color="primary" type="submit" disabled={loading} className="w-full">
                            {loading ? t('auth.login.signing_in') : t('auth.login.sign_in')}
                        </Button>
                        <FieldDescription className="text-center">
                            {t('auth.login.no_account')}{' '}
                            <Link href="/register" className="text-fd-foreground underline-offset-4 hover:underline">{t('auth.login.sign_up')}</Link>
                        </FieldDescription>
                    </Field>
                </FieldGroup>
            </form>
            <VerificationModal isOpen={showModal} onClose={handleVerificationClose} onSuccess={handleVerificationSuccess} methods={methods} username={identifier} title="Verify your identity" />
        </FormCard>
    );
}
