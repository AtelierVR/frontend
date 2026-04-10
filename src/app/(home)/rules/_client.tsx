'use client';

import { useApi } from '@/lib/api';
import MarkdownPage from '../_components/MarkdownPage';

export default function RulesPageClient() {
    const api = useApi();
    const serv = api.server instanceof Error ? '/api/rules.md' : api.server?.endpoints.rules ?? null;
    return <MarkdownPage src={serv} fallbackTitle="Règlement de la communauté" />;
}
