import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface FormCardProps extends React.ComponentProps<'div'> {
    title: string;
    description: string;
    footer?: ReactNode;
    children: ReactNode;
}

export function FormCard({ title, description, footer, children, className, ...props }: FormCardProps) {
    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card className="border-fd-border/50 shadow-lg">
                <CardHeader className="text-center pb-10">
                    <CardTitle className="text-xl font-semibold">{title}</CardTitle>
                    <CardDescription className="text-fd-muted-foreground/80">{description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                    {children}
                </CardContent>
            </Card>
            {footer}
        </div>
    );
}
