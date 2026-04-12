import { HomeLayout } from '@/components/layout/home';
import { baseOptions } from '@/lib/layout.shared';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icon } from '@iconify/react';

export function AvatarLayoutError({ message }: { message: string }) {
    return <HomeLayout {...baseOptions()}>
        <div className="container max-w-6xl mx-auto py-8 px-4">
            <Alert variant="destructive">
                <Icon icon="material-symbols:error-circle-rounded" className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
            </Alert>
        </div>
    </HomeLayout>;
}
