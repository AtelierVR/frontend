import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';

interface ConversationHeaderProps {
  title: string;
  avatar?: string | null;
  isGroup: boolean;
  participantCount: number;
  initials: string;
  onBack: () => void;
}

export function ConversationHeader({
  title,
  avatar,
  isGroup,
  participantCount,
  initials,
  onBack
}: ConversationHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-fd-background flex items-center gap-3 py-4 border-b border-fd-border">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={onBack}
        className="shrink-0"
      >
        <Icon icon="material-symbols:arrow-back-rounded" className="size-5" />
      </Button>
      
      <Avatar className="size-10 shrink-0">
        {avatar && <AvatarImage src={avatar} alt={title} />}
        <AvatarFallback className="bg-fd-accent">
          {isGroup ? (
            <Icon icon="material-symbols:group-rounded" className="size-5" />
          ) : (
            <span className="text-xs font-medium">{initials}</span>
          )}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{title}</div>
        <div className="text-xs text-fd-muted-foreground">
          {participantCount} participant{participantCount > 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
