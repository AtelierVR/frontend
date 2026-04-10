'use client';

import { useApi } from '@/lib/api';
import MarkdownPage from '../_components/MarkdownPage';

export default function TermsPageClient() {
    const api = useApi();
    const serv = api.server instanceof Error ? '/api/terms.md' : api.server?.endpoints.terms ?? null;
    return <MarkdownPage src={serv} fallbackTitle="Conditions générales d'utilisation" />;
}
