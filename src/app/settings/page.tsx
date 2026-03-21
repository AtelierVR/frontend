'use client';

import { redirect } from 'next/navigation';
import { getPageTree } from './source';
import { useApi } from '@/lib/api';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/config';

export default function SettingsPage() {
    const Api = useApi();
    const { t } = useTranslation();
    const pageTree = getPageTree(Api.currentUser, t);
    
    useEffect(() => {
        const firstPage = pageTree.children.find(page => page.type === 'page');
        if (firstPage && firstPage.type === 'page') {
            redirect(firstPage.url);
        }
    }, [pageTree]);

    return null;
}
