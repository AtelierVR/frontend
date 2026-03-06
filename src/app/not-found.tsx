import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
import { HomeLayout } from '@/components/layout/home';
import { baseOptions } from '@/lib/layout.shared';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export default function NotFound() {
    return (
        <HomeLayout {...baseOptions()}>
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Icon icon="material-symbols:help-rounded" />
                        </EmptyMedia>
                        <EmptyTitle>Page Not Found</EmptyTitle>
                        <EmptyDescription>
                            The page you're looking for doesn't exist or has been moved.
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
                                Go Home
                            </Link>
                        </div>
                    </EmptyContent>
                </Empty>
            </div>
        </HomeLayout>
    );
}
