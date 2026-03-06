'use client';

import { useState } from 'react';
import { useApi, isError } from '@/lib/api';
import type { ApiError } from '@/lib/api';
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
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/cn';

export function RegisterForm({
    className,
    ...props
}: React.ComponentProps<'div'>) {
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
            setError('Passwords do not match.');
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
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card className="border-fd-border/50 shadow-lg">
                <CardHeader className="text-center pb-10">
                    <CardTitle className="text-xl font-semibold">Create an account</CardTitle>
                    <CardDescription className="text-fd-muted-foreground/80">
                        Enter your information to create your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                    <form onSubmit={handleSubmit}>
                        <FieldGroup className="gap-3">
                            {error && (
                                <Alert variant="destructive" className='mb-4'>
                                    <Icon icon="material-symbols:error-circle-rounded" />
                                    <AlertTitle>Registration Failed</AlertTitle>
                                    <AlertDescription>
                                        {error}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Field>
                                <FieldLabel htmlFor="username">
                                    Username
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
                                <FieldLabel htmlFor="display">Display Name</FieldLabel>
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
                                    Password
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
                                    Confirm Password
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
                                    {loading ? 'Creating account...' : 'Create account'}
                                </Button>
                                <FieldDescription className="text-center">
                                    Already have an account?{' '}
                                    <Link href="/login" className="text-fd-foreground underline-offset-4 hover:underline">
                                        Sign in
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
        </div>
    );
}
