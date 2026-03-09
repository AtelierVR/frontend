'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { fetchApi } from '@/lib/api';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';

interface ConfirmationCardProps {
    type?: string;
    token?: string;
}

type Status = 'loading' | 'success' | 'error' | 'invalid';

export function ConfirmationCard({ type, token }: ConfirmationCardProps) {
    const [status, setStatus] = useState<Status>('loading');
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!type || !token) {
            setStatus('invalid');
            setMessage('Missing confirmation type or token.');
            return;
        }

        const url = new URL(`/api/${type}/confirmation`, window.location.origin);
        url.searchParams.set('token', token);

        fetchApi<{ message?: string }>(url.pathname + url.search)
            .then((res) => {
                if (res.error) {
                    setStatus('error');
                    setMessage(res.error.message);
                } else {
                    setStatus('success');
                    setMessage(res.data?.message || 'Your confirmation was successful.');
                }
            })
            .catch(() => {
                setStatus('error');
                setMessage('An error occurred. Please try again.');
            });
    }, [type, token]);

    const icons: Record<Status, string> = {
        loading: 'lucide:loader-circle',
        success: 'lucide:circle-check',
        error: 'lucide:circle-x',
        invalid: 'lucide:triangle-alert',
    };

    const titles: Record<Status, string> = {
        loading: 'Confirming…',
        success: 'Confirmed!',
        error: 'Confirmation failed',
        invalid: 'Invalid link',
    };

    const iconColors: Record<Status, string> = {
        loading: 'text-fd-muted-foreground animate-spin',
        success: 'text-green-500',
        error: 'text-red-500',
        invalid: 'text-yellow-500',
    };

    return (
        <Card className="w-full shadow-sm">
            <CardHeader className="items-center text-center gap-3">
                <Icon
                    icon={icons[status]}
                    className={`w-12 h-12 ${iconColors[status]}`}
                />
                <div className="space-y-1">
                    <CardTitle>{titles[status]}</CardTitle>
                    {message && (
                        <CardDescription className="text-sm">
                            {message}
                        </CardDescription>
                    )}
                </div>
            </CardHeader>
            {status !== 'loading' && (
                <CardContent className="flex justify-center pb-6">
                    <a href="/" className={buttonVariants({ variant: 'outline' })}>
                        Back to home
                    </a>
                </CardContent>
            )}
        </Card>
    );
}
