import { type Conversation, type User } from '@/lib/api';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/cn';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  
  if (isToday(date)) {
    return format(date, 'HH:mm', { locale: fr });
  } else if (isYesterday(date)) {
    return 'Hier';
  } else {
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  }
}

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
  const otherMembers = conversation.members.filter(m => m.user_ref !== currentUserIid);
  
  let title = conversation.title?.trim() || '';
  let avatar = conversation.avatar;
  let initials = '';
  const isGroup = otherMembers.length > 1;
  
  if (!title) {
    if (otherMembers.length === 0) {
      title = 'Moi';
      initials = 'M';
    } else if (otherMembers.length === 1) {
      const user = users.get(otherMembers[0].user_ref);
      title = user?.display || user?.username || otherMembers[0].user_ref;
      avatar = user?.thumbnail;
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

  const lastMessage = conversation.messages?.[conversation.messages.length - 1];
  const hasUnread = conversation.members.some(m => 
    m.user_ref === currentUserIid && m.last_read_at && lastMessage && 
    new Date(m.last_read_at) < new Date(lastMessage.created_at)
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
          {lastMessage && (
            <span className="text-xs text-fd-muted-foreground shrink-0">
              {formatTime(lastMessage.created_at)}
            </span>
          )}
        </div>
        
        {lastMessage && (
          <p className={cn(
            "text-sm text-fd-muted-foreground truncate",
            hasUnread && "font-medium text-fd-foreground"
          )}>
            {lastMessage.content}
          </p>
        )}
      </div>
    </button>
  );
}
