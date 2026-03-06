import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

export function MessageListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className={cn("flex gap-3", i % 2 === 0 ? "justify-start" : "justify-end")}>
          {i % 2 === 0 && <Skeleton className="size-8 rounded-full shrink-0" />}
          <div className="space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-16 w-64" />
          </div>
          {i % 2 === 1 && <Skeleton className="size-8 rounded-full shrink-0" />}
        </div>
      ))}
    </div>
  );
}

export function ConversationListSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4">
          <Skeleton className="size-12 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}
