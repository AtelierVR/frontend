'use client';

import { redirect } from 'next/navigation';
import { getPageTree } from './source';
import { useApi } from '@/lib/api';
import { useEffect } from 'react';

export default function SettingsPage() {
    const Api = useApi();
    const pageTree = getPageTree(Api.currentUser);
    
    useEffect(() => {
        const firstPage = pageTree.children.find(page => page.type === 'page');
        if (firstPage && firstPage.type === 'page') {
            redirect(firstPage.url);
        }
    }, [pageTree]);

    return null;
}
