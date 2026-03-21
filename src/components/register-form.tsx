'use client';

import { useState } from 'react';
import { useApi, isError } from '@/lib/api';
import type { ApiError } from '@/lib/api';
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
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/cn';

export function RegisterForm({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    const { t } = useTranslation();
    const [username, setUsername] = useState('');
    const [display, setDisplay] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const api = useApi();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError(t('auth.register.password_mismatch'));
            return;
        }

        setLoading(true);

        try {
            const result = await api.fetchRegister({
                username,
                display: display || undefined,
                password,
            });

            if (isError(result)) {
                setError(result.message);
            } else {
                router.push('/');
            }
        } catch (err) {
            setError(t('auth.register.error_occurred'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card className="border-fd-border/50 shadow-lg">
                <CardHeader className="text-center pb-10">
                    <CardTitle className="text-xl font-semibold">{t('auth.register.title')}</CardTitle>
                    <CardDescription className="text-fd-muted-foreground/80">
                        {t('auth.register.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                    <form onSubmit={handleSubmit}>
                        <FieldGroup className="gap-3">
                            {error && (
                                <Alert variant="destructive" className='mb-4'>
                                    <Icon icon="material-symbols:error-circle-rounded" />
                                    <AlertTitle>{t('auth.register.failed')}</AlertTitle>
                                    <AlertDescription>
                                        {error}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Field>
                                <FieldLabel htmlFor="username">
                                    {t('auth.register.username')}
                                    <span className="text-red-500">*</span>
                                </FieldLabel>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="display">{t('auth.register.display_name')}</FieldLabel>
                                <Input
                                    id="display"
                                    type="text"
                                    placeholder="Display Name"
                                    value={display}
                                    onChange={(e) => setDisplay(e.target.value)}
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="password">
                                    {t('auth.register.password')}
                                    <span className="text-red-500">*</span>
                                </FieldLabel>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="confirmPassword">
                                    {t('auth.register.confirm_password')}
                                    <span className="text-red-500">*</span>
                                </FieldLabel>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                                    {loading ? t('auth.register.creating_account') : t('auth.register.create_account')}
                                </Button>
                                <FieldDescription className="text-center">
                                    {t('auth.register.already_have_account')}{' '}
                                    <Link href="/login" className="text-fd-foreground underline-offset-4 hover:underline">
                                        {t('auth.register.sign_in')}
                                    </Link>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>

            <FieldDescription className="text-center text-xs text-fd-muted-foreground/70">
                {t('auth.register.terms_text')}{' '}
                <Link href="/terms" className="underline hover:text-fd-foreground">
                    {t('auth.register.terms_of_service')}
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="underline hover:text-fd-foreground">
                    {t('auth.register.privacy_policy')}
                </Link>
                .
            </FieldDescription>
        </div>
    );
}
