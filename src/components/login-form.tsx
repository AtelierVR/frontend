'use client';

import { useState, useRef } from 'react';
import { useApi, isError } from '@/lib/api';
import type { VerificationMethod, ApiError } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/config';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/cn';
import { VerificationModal } from './verification-modal';

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    const { t } = useTranslation();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationMethods, setVerificationMethods] = useState<VerificationMethod[]>([]);
    const [verificationError, setVerificationError] = useState<ApiError | null>(null);
    const verificationResolveRef = useRef<((code: string | null) => void) | null>(null);
    const api = useApi();
    const router = useRouter();

    const handleVerificationRequired = async (error: ApiError, methods: VerificationMethod[]): Promise<string | null> => {
        setVerificationMethods(methods);
        setVerificationError(error);
        setShowVerificationModal(true);
        setLoading(false);

        // Retourne une promise qui se résout quand l'utilisateur soumet le code de vérification
        return new Promise((resolve) => {
            verificationResolveRef.current = resolve;
        });
    };

    const handleVerificationSuccess = async (code: string) => {
        setShowVerificationModal(false);
        setLoading(true);

        try {
            const result = await api.fetchLogin(identifier, password, code);

            if (isError(result)) {
                setError(result.message);
                // Résout la promise avec null pour indiquer un échec
                verificationResolveRef.current?.(null);
            } else {
                // Résout la promise avec le code
                verificationResolveRef.current?.(code);
                router.push('/');
            }
        } catch (err) {
            setError(t('auth.login.error_occurred'));
            verificationResolveRef.current?.(null);
        } finally {
            verificationResolveRef.current = null;
            setLoading(false);
        }
    };

    const handleVerificationClose = () => {
        setShowVerificationModal(false);
        setLoading(false);
        verificationResolveRef.current?.(null);
        verificationResolveRef.current = null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await api.fetchLogin(identifier, password, undefined, handleVerificationRequired);

            if (isError(result)) {
                setError(result.message);
            } else {
                router.push('/');
            }
        } catch (err) {
            setError(t('auth.login.error_occurred'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card className="border-fd-border/50 shadow-lg">
                <CardHeader className="text-center pb-10">
                    <CardTitle className="text-xl font-semibold">{t('auth.login.title')}</CardTitle>
                    <CardDescription className="text-fd-muted-foreground/80">
                        {t('auth.login.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                    <form onSubmit={handleSubmit}>
                        <FieldGroup className="gap-3">
                            {error && (
                                <Alert variant="destructive" className='mb-4'>
                                    <Icon icon="material-symbols:error-circle-rounded" />
                                    <AlertTitle>{t('auth.login.failed')}</AlertTitle>
                                    <AlertDescription>
                                        {error}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Field>
                                <div className="flex items-center justify-between">
                                    <FieldLabel htmlFor="identifier">{t('auth.login.username_email')}</FieldLabel>
                                </div>
                                <Input
                                    id="identifier"
                                    type="text"
                                    placeholder="m@example.com"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    required
                                />
                            </Field>

                            <Field>
                                <div className="flex items-center justify-between">
                                    <FieldLabel htmlFor="password">{t('auth.login.password')}</FieldLabel>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-fd-muted-foreground underline-offset-4 hover:underline"
                                    >
                                        {t('auth.login.forgot_password')}
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </Field>

                            <Field className="mt-6">
                                <Button
                                    color="primary"
                                    type="submit"
                                    disabled={loading}
                                    className="w-full"
                                >
                                    {loading ? t('auth.login.signing_in') : t('auth.login.sign_in')}
                                </Button>
                                <FieldDescription className="text-center">
                                    {t('auth.login.no_account')}{' '}
                                    <Link href="/register" className="text-fd-foreground underline-offset-4 hover:underline">
                                        {t('auth.login.sign_up')}
                                    </Link>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>

            <FieldDescription className="text-center text-xs text-fd-muted-foreground/70">
                {t('auth.login.terms_text')}{' '}
                <Link href="/terms" className="underline hover:text-fd-foreground">
                    {t('auth.login.terms_of_service')}
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="underline hover:text-fd-foreground">
                    {t('auth.login.privacy_policy')}
                </Link>
                .
            </FieldDescription>

            <VerificationModal
                isOpen={showVerificationModal}
                onClose={handleVerificationClose}
                onSuccess={handleVerificationSuccess}
                methods={verificationMethods}
                username={identifier}
                title="Verify your identity"
            />
        </div>
    );
}
