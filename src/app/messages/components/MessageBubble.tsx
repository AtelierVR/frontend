import { type Message, type User } from '@/lib/api';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/cn';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return format(date, 'HH:mm', { locale: fr });
}

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
    isPending?: boolean;
    users: Map<string, User>;
    currentUserAvatar?: string;
    currentUserDisplay?: string;
    getUserName: (userRef: string) => string;
    getUserAvatar: (userRef: string) => string | undefined;
    getUserInitials: (userRef: string) => string;
    isFirstInGroup?: boolean;
    isLastInGroup?: boolean;
}

export function MessageBubble({
    message,
    isOwn,
    isPending = false,
    users,
    currentUserAvatar,
    currentUserDisplay,
    getUserName,
    getUserAvatar,
    getUserInitials,
    isFirstInGroup = true,
    isLastInGroup = true
}: MessageBubbleProps) {
    const showAvatar = isLastInGroup;
    const showName = !isOwn && isFirstInGroup;

    return (
        <div className={cn("flex gap-3 group", isOwn ? "justify-end" : "justify-start", isPending && "opacity-50")}>
            {!isOwn && (
                <div className="flex flex-col justify-center items-center gap-1 shrink-0">
                    {showAvatar ? (
                        <>
                            <Avatar className="size-8">
                                <AvatarImage src={getUserAvatar(message.sender_ref)} alt={getUserName(message.sender_ref)} />
                                <AvatarFallback className="text-xs bg-fd-accent">
                                    {getUserInitials(message.sender_ref)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-[10px] text-fd-muted-foreground flex items-center gap-0.5">
                                {formatTime(message.created_at)}
                                {isPending && <span className="text-[8px]">•••</span>}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-fd-muted-foreground size-8 flex items-center gap-0.5">
                                {formatTime(message.created_at)}
                                {isPending && <span className="text-[8px]">•••</span>}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className={cn("max-w-[70%] space-y-0.5", isOwn && "items-end")}>
                {showName && (
                    <div className="text-xs text-fd-muted-foreground px-2.5">
                        {getUserName(message.sender_ref)}
                    </div>
                )}
                <div
                    className={cn(
                        "rounded-2xl p-3",
                        isOwn
                            ? "bg-fd-primary text-fd-primary-foreground"
                            : "bg-fd-muted",
                        // Coins arrondis conditionnels
                        isOwn && isFirstInGroup && "rounded-br-sm",
                        !isOwn && isFirstInGroup && "rounded-bl-sm",
                        isOwn && !isFirstInGroup && !isLastInGroup && "rounded-tr-md rounded-br-md",
                        !isOwn && !isFirstInGroup && !isLastInGroup && "rounded-tl-md rounded-bl-md",
                        isOwn && isLastInGroup && !isFirstInGroup && "rounded-tr-sm",
                        !isOwn && isLastInGroup && !isFirstInGroup && "rounded-tl-sm"
                    )}
                >
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed mb-0 mt-0">
                        {message.content}
                    </p>
                </div>
            </div>

            {isOwn && (
                <div className="flex flex-col justify-center items-center gap-1 shrink-0">
                    {showAvatar ? (
                        <>
                            <Avatar className="size-8">
                                <AvatarImage
                                    src={currentUserAvatar}
                                    alt={currentUserDisplay}
                                />
                                <AvatarFallback className="text-xs bg-fd-primary/10">
                                    {getUserInitials(message.sender_ref)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-[10px] text-fd-muted-foreground flex items-center gap-0.5">
                                {formatTime(message.created_at)}
                                {isPending && <span className="text-[8px]">•••</span>}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-fd-muted-foreground size-8 flex items-center gap-0.5">
                                {formatTime(message.created_at)}
                                {isPending && <span className="text-[8px]">•••</span>}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
