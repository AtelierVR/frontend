import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/cn';

interface ErrorAlertProps {
    message: string;
    title?: string;
    className?: string;
}

export function ErrorAlert({ message, title, className }: ErrorAlertProps) {
    return (
        <Alert variant="destructive" className={cn(className)}>
            <Icon icon="material-symbols:error-circle-rounded" className="h-4 w-4" />
            {title && <AlertTitle>{title}</AlertTitle>}
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
}

interface SuccessAlertProps {
    message: string;
    className?: string;
}

export function SuccessAlert({ message, className }: SuccessAlertProps) {
    return (
        <Alert className={cn(className)}>
            <Icon icon="material-symbols:check-circle-rounded" className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
}
