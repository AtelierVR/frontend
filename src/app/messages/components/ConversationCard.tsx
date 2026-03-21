import { type Conversation, type User } from '@/lib/api';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/cn';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/config';

interface ConversationCardProps {
  conversation: Conversation;
  users: Map<string, User>;
  currentUserIid: string | undefined;
  onSelect: () => void;
}

export function ConversationCard({ 
  conversation, 
  users, 
  currentUserIid, 
  onSelect 
}: ConversationCardProps) {
  const { t } = useTranslation();

  const formatTime = (timestamp: number | string): string => {
    const date = new Date(timestamp);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return t('messages.yesterday');
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const otherMembers = conversation.members.filter(m => m.reference !== currentUserIid);
  
  let title = conversation.title?.trim() || '';
  let avatar = conversation.thumbnail;
  let initials = '';
  const isGroup = otherMembers.length > 1;
  
  if (!title) {
    if (otherMembers.length === 0) {
      title = t('messages.me');
      initials = 'M';
    } else if (otherMembers.length === 1) {
      const user = users.get(otherMembers[0].reference);
      title = user?.display || user?.username || otherMembers[0].reference;
      avatar = user?.thumbnail ?? null;
      initials = (user?.display || user?.username || 'U')
        .replace(/[^a-zA-Z ]/g, '')
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    } else {
      title = `${otherMembers.length} participants`;
      initials = `${otherMembers.length}`;
    }
  } else {
    initials = title
      .replace(/[^a-zA-Z ]/g, '')
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  const lastActivity = conversation.last_message ?? conversation.updated_at;
  const hasUnread = conversation.members.some(m =>
    m.reference === currentUserIid &&
    m.last_read_at !== null &&
    conversation.last_message !== null &&
    m.last_read_at < (conversation.last_message as number)
  );

  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-fd-accent/50 transition-colors text-left border border-transparent hover:border-fd-border"
    >
      <div className="relative shrink-0">
        <Avatar className="size-12">
          {avatar && <AvatarImage src={avatar} alt={title} />}
          <AvatarFallback className="bg-fd-accent">
            {isGroup ? (
              <Icon icon="material-symbols:group-rounded" className="size-6" />
            ) : (
              <span className="text-xs font-medium">{initials || '?'}</span>
            )}
          </AvatarFallback>
        </Avatar>
        {hasUnread && (
          <div className="absolute -top-1 -right-1 size-3 rounded-full bg-fd-primary border-2 border-fd-background" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <span className={cn(
            "font-medium truncate",
            hasUnread && "text-fd-primary"
          )}>
            {title}
          </span>
          {lastActivity && (
            <span className="text-xs text-fd-muted-foreground shrink-0">
              {formatTime(lastActivity)}
            </span>
          )}
        </div>
        

      </div>
    </button>
  );
}
