'use client';

import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import type { VerificationMethod } from '@/lib/api';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldLabel,
    FieldDescription,
} from '@/components/ui/field';
import { cn } from '@/lib/cn';
import { useApi } from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from './ui/item';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface VerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (code: string) => void;
    methods: VerificationMethod[];
    title?: string;
    username?: string;
}

export function VerificationModal({
    isOpen,
    onClose,
    onSuccess,
    methods,
    title = 'Two-Factor Verification',
    username,
}: VerificationModalProps) {
    const api = useApi();
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedMethod, setSelectedMethod] = useState<VerificationMethod | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [resendCooldown, setResendCooldown] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Focus the input when modal opens
    useEffect(() => {
        if (!isOpen || !inputRef.current) return;
        setTimeout(() => inputRef.current?.focus(), 100);
    }, [isOpen, selectedMethod]);

    // Auto-select the first enabled method when modal opens
    useEffect(() => {
        if (!isOpen || methods.length <= 0) return;
        const enabledMethods = methods.filter((m) => true);
        if (enabledMethods.length <= 0) return;
        setSelectedMethod(enabledMethods[0]);
    }, [isOpen, methods]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const id = setInterval(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000);
        return () => clearInterval(id);
    }, [resendCooldown]);

    // Reset state when modal closes
    useEffect(() => {
        if (isOpen) return;
        setSelectedMethod(null);
        setVerificationCode('');
        setLoading(false);
        setError(null);
        setResendCooldown(0);
    }, [isOpen]);

    // Send new verification code
    const sendVerificationCode = async () => {
        setLoading(true);
        setError(null);

        let current = selectedMethod;
        if (!current || !current.can_send) return;

        try {
            const result = await api.sendVerificationCode(current.type);

            if ('status' in result) {
                setError(result.message);
            } else {
                setResendCooldown(current.cooldown || 5);
            }
        } catch (err) {
            setError('Failed to send verification code');
        }

        setLoading(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSuccess(verificationCode.trim());
    };

    const enabledMethods = methods.filter((m) => m.enabled);
    const showMethodSelector = enabledMethods.length > 1;

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="p-0 gap-0 border-0 w-auto" showCloseButton={false}>
                <Card className="border-0 shadow-none">
                    <CardHeader>
                        <CardTitle className='mb-2'>
                            {title}
                        </CardTitle>
                        <CardDescription>
                            {selectedMethod?.description || `Enter the verification code for ${username}.`}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <Icon icon="material-symbols:error-circle-rounded" />
                                    <AlertTitle>Verification Failed</AlertTitle>
                                    <AlertDescription>
                                        {error}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {showMethodSelector && (
                                <Field>
                                    <FieldLabel>Choose verification method</FieldLabel>
                                    <Select
                                        value={selectedMethod?.type}
                                        onValueChange={(value) => {
                                            const method = enabledMethods.find(m => m.type === value);
                                            setSelectedMethod(method || null);
                                            setVerificationCode('');
                                            setError(null);
                                        }}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {enabledMethods.map(m => <SelectItem
                                                value={m.type}
                                                key={m.type}
                                            >
                                                {m.name}
                                            </SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}

                            {selectedMethod && (
                                <Field>
                                    <div className="flex items-center justify-between">
                                        <FieldLabel htmlFor="otp-verification">
                                            Verification code
                                        </FieldLabel>
                                        {selectedMethod.can_send && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={sendVerificationCode}
                                                disabled={loading || resendCooldown > 0}
                                            >
                                                <Icon icon="material-symbols:refresh-rounded" className="h-3 w-3" />
                                                {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
                                            </Button>
                                        )}
                                    </div>

                                    <div className="flex justify-center">
                                        <InputOTP
                                            ref={inputRef as any}
                                            value={verificationCode}
                                            onChange={setVerificationCode}
                                            maxLength={6}
                                            disabled={loading}
                                            id="otp-verification"
                                        >
                                            <InputOTPGroup>
                                                <InputOTPSlot index={0} className="h-12 w-11 text-xl" />
                                                <InputOTPSlot index={1} className="h-12 w-11 text-xl" />
                                                <InputOTPSlot index={2} className="h-12 w-11 text-xl" />
                                            </InputOTPGroup>
                                            <InputOTPSeparator />
                                            <InputOTPGroup>
                                                <InputOTPSlot index={3} className="h-12 w-11 text-xl" />
                                                <InputOTPSlot index={4} className="h-12 w-11 text-xl" />
                                                <InputOTPSlot index={5} className="h-12 w-11 text-xl" />
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </div>
                                </Field>
                            )}
                        </form>
                    </CardContent>

                    <CardFooter className="flex-col gap-2">
                        <Button
                            type="submit"
                            color="primary"
                            onClick={handleSubmit}
                            disabled={loading || verificationCode.trim().length !== 6}
                            className="w-full"
                        >
                            {loading ? 'Verifying...' : 'Verify'}
                        </Button>
                        <div className="text-sm text-fd-muted-foreground">
                            Having trouble signing in?{' '}
                            <a href="#" className="hover:text-fd-primary underline underline-offset-4 transition-colors">
                                Contact support
                            </a>
                        </div>
                    </CardFooter>
                </Card>
            </DialogContent>
        </Dialog>
    );
}
