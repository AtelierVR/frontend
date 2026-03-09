import { ConfirmationCard } from '@/components/confirmation-card';
import { APP_CONFIG } from '@/lib/api/config';
import { ThemeLogo } from '@/lib/theme-logo';

interface PageProps {
    searchParams: Promise<{ type?: string; token?: string }>;
}

export default async function ConfirmationPage({ searchParams }: PageProps) {
    const { type, token } = await searchParams;

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="flex w-full max-w-md flex-col gap-6">
                <a href="/" className="flex items-center gap-2 self-center font-medium text-fd-foreground">
                    <ThemeLogo />
                    <span className="text-lg">{APP_CONFIG.name}</span>
                </a>
                <ConfirmationCard type={type} token={token} />
            </div>
        </div>
    );
}
