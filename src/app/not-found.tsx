'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/config';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
import { HomeLayout } from '@/components/layout/home';
import { baseOptions } from '@/lib/layout.shared';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export default function NotFound() {
    const { t } = useTranslation();
    return (
        <HomeLayout {...baseOptions()}>
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Icon icon="material-symbols:help-rounded" />
                        </EmptyMedia>
                        <EmptyTitle>{t('not_found.title')}</EmptyTitle>
                        <EmptyDescription>
                            {t('not_found.description')}
                        </EmptyDescription>
                    </EmptyHeader>

                    <EmptyContent>
                        <div className="flex justify-center w-full">
                            <Link
                                href="/"
                                className={cn(buttonVariants({
                                    variant: 'primary',
                                }))}
                            >
                                {t('not_found.go_home')}
                            </Link>
                        </div>
                    </EmptyContent>
                </Empty>
            </div>
        </HomeLayout>
    );
}
