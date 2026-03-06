'use client';

import { useState, useRef } from 'react';
import { useApi, isError } from '@/lib/api';
import type { VerificationMethod, ApiError } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
            setError('An error occurred. Please try again.');
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
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card className="border-fd-border/50 shadow-lg">
                <CardHeader className="text-center pb-10">
                    <CardTitle className="text-xl font-semibold">Welcome back</CardTitle>
                    <CardDescription className="text-fd-muted-foreground/80">
                        Login to your account to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                    <form onSubmit={handleSubmit}>
                        <FieldGroup className="gap-3">
                            {error && (
                                <Alert variant="destructive" className='mb-4'>
                                    <Icon icon="material-symbols:error-circle-rounded" />
                                    <AlertTitle>Login Failed</AlertTitle>
                                    <AlertDescription>
                                        {error}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Field>
                                <div className="flex items-center justify-between">
                                    <FieldLabel htmlFor="identifier">Username / Email</FieldLabel>
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
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-fd-muted-foreground underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
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
                                    {loading ? 'Signing in...' : 'Login'}
                                </Button>
                                <FieldDescription className="text-center">
                                    Don&apos;t have an account?{' '}
                                    <Link href="/register" className="text-fd-foreground underline-offset-4 hover:underline">
                                        Sign up
                                    </Link>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>

            <FieldDescription className="text-center text-xs text-fd-muted-foreground/70">
                By clicking continue, you agree to our{' '}
                <Link href="/terms" className="underline hover:text-fd-foreground">
                    Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="underline hover:text-fd-foreground">
                    Privacy Policy
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
