'use client';

import { useRef, useState } from 'react';
import { useApi, isError } from '@/lib/api';
import type { VerificationMethod, ApiError } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export function useLoginVerification(identifier: string, password: string) {
    const { t } = useTranslation();
    const api = useApi();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [methods, setMethods] = useState<VerificationMethod[]>([]);
    const [verificationError, setVerificationError] = useState<ApiError | null>(null);
    const resolveRef = useRef<((code: string | null) => void) | null>(null);

    const handleVerificationRequired = async (err: ApiError, m: VerificationMethod[]): Promise<string | null> => {
        setMethods(m);
        setVerificationError(err);
        setShowModal(true);
        setLoading(false);
        return new Promise(resolve => { resolveRef.current = resolve; });
    };

    const handleVerificationSuccess = async (code: string) => {
        setShowModal(false);
        setLoading(true);
        try {
            const result = await api.fetchLogin(identifier, password, code);
            if (isError(result)) { setError(result.message); resolveRef.current?.(null); }
            else { resolveRef.current?.(code); router.push('/'); }
        } catch { setError(t('auth.login.error_occurred')); resolveRef.current?.(null); }
        finally { resolveRef.current = null; setLoading(false); }
    };

    const handleVerificationClose = () => {
        setShowModal(false);
        setLoading(false);
        resolveRef.current?.(null);
        resolveRef.current = null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await api.fetchLogin(identifier, password, undefined, handleVerificationRequired);
            if (isError(result)) setError(result.message);
            else router.push('/');
        } catch { setError(t('auth.login.error_occurred')); }
        finally { setLoading(false); }
    };

    return { loading, error, showModal, methods, verificationError, handleVerificationSuccess, handleVerificationClose, handleSubmit };
}
