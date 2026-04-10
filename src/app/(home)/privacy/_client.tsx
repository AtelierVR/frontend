'use client';

import { useApi } from '@/lib/api';
import MarkdownPage from '../_components/MarkdownPage';

export default function PrivacyPageClient() {
    const api = useApi();
    const serv = api.server instanceof Error ? '/api/privacy.md' : api.server?.endpoints.privacy ?? null;
    return <MarkdownPage src={serv} fallbackTitle="Politique de confidentialité" />;
}
