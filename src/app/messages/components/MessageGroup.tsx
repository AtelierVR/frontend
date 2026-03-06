import { type Message, type User } from '@/lib/api';
import { MessageBubble } from './MessageBubble';

interface MessageGroupProps {
  messages: Message[];
  isOwn: boolean;
  users: Map<string, User>;
  currentUserAvatar?: string;
  currentUserDisplay?: string;
  currentUserIid?: string;
  getUserName: (userRef: string) => string;
  getUserAvatar: (userRef: string) => string | undefined;
  getUserInitials: (userRef: string) => string;
  pendingMessages: Map<string, Message>;
}

export function MessageGroup({
  messages,
  isOwn,
  users,
  currentUserAvatar,
  currentUserDisplay,
  currentUserIid,
  getUserName,
  getUserAvatar,
  getUserInitials,
  pendingMessages
}: MessageGroupProps) {
  if (messages.length === 0) return null;

  return (
    <div className="space-y-1">
      {messages.map((msg, index) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isOwn={isOwn}
          isPending={pendingMessages.has(msg.id)}
          users={users}
          currentUserAvatar={currentUserAvatar}
          currentUserDisplay={currentUserDisplay}
          getUserName={getUserName}
          getUserAvatar={getUserAvatar}
          getUserInitials={getUserInitials}
          isFirstInGroup={index === 0}
          isLastInGroup={index === messages.length - 1}
        />
      ))}
    </div>
  );
}
