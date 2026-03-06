'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApi, useConversations, useSocket, isError, type Message } from '@/lib/api';
import { DocsBody, DocsPage } from 'fumadocs-ui/page';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ConversationHeader, MessageBubble, MessageGroup, MessageInput, MessageListSkeleton } from '../components';

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return format(date, 'HH:mm', { locale: fr });
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  
  if (isToday(date)) return "Aujourd'hui";
  if (isYesterday(date)) return 'Hier';
  return format(date, 'd MMMM yyyy', { locale: fr });
}

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;
  const Api = useApi();
  const { conversations, users } = useConversations();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingMessages, setPendingMessages] = useState<Map<string, Message>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [messageContent, setMessageContent] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevMessagesLengthRef = useRef(0);

  const conversation = useMemo(() => 
    conversations.find(c => c.id === conversationId),
    [conversations, conversationId]
  );

  const currentUserIid = Api.currentUser?.alias?.find(a => a.key === 'iid')?.value;

  // Vérifier si on est en bas du scroll
  const isScrolledToBottom = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    return scrollHeight - scrollTop - clientHeight < 100; // tolérance de 100px
  };

  const conversationData = useMemo(() => {
    if (!conversation) return null;
    
    const otherMembers = conversation.members.filter(m => m.user_ref !== currentUserIid);
    let title = conversation.title?.trim() || '';
    let avatar = conversation.avatar;
    
    if (!title && otherMembers.length === 1) {
      const user = users.get(otherMembers[0].user_ref);
      title = user?.display || user?.username || otherMembers[0].user_ref;
      avatar ??= user?.thumbnail || null;
    } else if (!title && otherMembers.length > 1) {
      title = `${otherMembers.length} participants`;
    } else if (!title) {
      title = 'Moi';
    }
    
    return { title, avatar, isGroup: otherMembers.length > 1 };
  }, [conversation, users, currentUserIid]);

  useEffect(() => {
    if (conversation) {
      loadMessages();
    }
  }, [conversation, conversationId]);

  // Gérer le scroll automatique
  useEffect(() => {
    if (loading || messages.length === 0) return;
    
    const wasAtBottom = isScrolledToBottom();
    const isInitialLoad = prevMessagesLengthRef.current === 0;
    const isNewMessage = messages.length > prevMessagesLengthRef.current;
    
    if (isInitialLoad) {
      // Premier chargement : scroll immédiat
      scrollToBottom(false);
    } else if (isNewMessage) {
      // Nouveau message : scroll si c'est le mien ou si j'étais en bas
      const lastMessage = messages[messages.length - 1];
      const isMyMessage = lastMessage?.sender_ref === currentUserIid;
      
      if (isMyMessage || wasAtBottom) {
        setTimeout(() => scrollToBottom(), 50);
      }
    }
    
    prevMessagesLengthRef.current = messages.length;
  }, [messages, loading, currentUserIid]);

  // Scroll automatique pour les messages pending
  useEffect(() => {
    if (pendingMessages.size > 0) {
      scrollToBottom(false);
    }
  }, [pendingMessages.size]);

  // Écouter les nouveaux messages via WebSocket
  useSocket('message:new', (data: Message) => {
    if (data.conversation_id === conversationId) {
      setMessages(prev => {
        // Éviter les doublons
        if (prev.some(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
    }
  });

  const scrollToBottom = (smooth = true) => {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    });
  };

  const loadMessages = async () => {
    setLoading(true);
    setError(undefined);

    try {
      const result = await Api.fetchMessages(conversationId, 100);
      if (isError(result)) {
        setError(result.message);
        return;
      }

      setMessages(result.messages);
      
      // Marquer comme lu
      await Api.markAsRead(conversationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
      // Forcer le scroll après le chargement avec plusieurs tentatives
      setTimeout(() => scrollToBottom(false), 0);
      setTimeout(() => scrollToBottom(false), 50);
      setTimeout(() => scrollToBottom(false), 150);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageContent.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const content = messageContent.trim();
    
    // Créer un message temporaire optimiste
    const tempMessage: Message = {
      id: tempId,
      conversation_id: conversationId,
      sender_ref: currentUserIid || '',
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Ajouter le message en pending
    setPendingMessages(prev => new Map(prev).set(tempId, tempMessage));
    setMessageContent('');
    setError(undefined);

    // Refocus immédiatement
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    try {
      const result = await Api.sendMessage(conversationId, {
        content
      });

      if (isError(result)) {
        setError(result.message);
        // Retirer le message pending en cas d'erreur
        setPendingMessages(prev => {
          const newMap = new Map(prev);
          newMap.delete(tempId);
          return newMap;
        });
        return;
      }

      // Retirer le message pending
      setPendingMessages(prev => {
        const newMap = new Map(prev);
        newMap.delete(tempId);
        return newMap;
      });

      // Ajouter le vrai message si pas déjà ajouté par WebSocket
      setMessages(prev => {
        if (prev.some(m => m.id === result.id)) return prev;
        return [...prev, result];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Retirer le message pending en cas d'erreur
      setPendingMessages(prev => {
        const newMap = new Map(prev);
        newMap.delete(tempId);
        return newMap;
      });
    }
  };

  const groupMessagesByDate = () => {
    const grouped: { [key: string]: Message[] } = {};
    
    // Combiner messages réels et pending
    const allMessages = [...messages, ...Array.from(pendingMessages.values())];
    
    allMessages.forEach(msg => {
      const dateKey = formatDate(msg.created_at);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(msg);
    });
    
    return grouped;
  };

  const shouldGroupMessages = (msg1: Message, msg2: Message) => {
    // Même expéditeur
    if (msg1.sender_ref !== msg2.sender_ref) return false;
    
    // Différence de temps <= 5 minutes
    const time1 = new Date(msg1.created_at).getTime();
    const time2 = new Date(msg2.created_at).getTime();
    const diffMinutes = Math.abs(time2 - time1) / (1000 * 60);
    
    return diffMinutes <= 5;
  };

  const createMessageGroups = (messages: Message[]) => {
    const groups: Message[][] = [];
    let currentGroup: Message[] = [];

    messages.forEach((msg, index) => {
      if (index === 0) {
        currentGroup = [msg];
      } else {
        const prevMsg = messages[index - 1];
        if (shouldGroupMessages(prevMsg, msg)) {
          currentGroup.push(msg);
        } else {
          groups.push(currentGroup);
          currentGroup = [msg];
        }
      }
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  };

  const getUserAvatar = (userRef: string) => {
    const user = users.get(userRef);
    return user?.thumbnail;
  };

  const getUserName = (userRef: string) => {
    if (userRef === currentUserIid) return 'Vous';
    const user = users.get(userRef);
    return user?.display || user?.username || userRef.split('@')[0];
  };

  const getUserInitials = (userRef: string) => {
    const name = getUserName(userRef);
    return name
      .replace(/[^a-zA-Z ]/g, '')
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  };

  if (!conversation && !loading) {
    return (
      <DocsPage toc={[]} footer={{ enabled: false }}>
        <DocsBody>
          <div className="flex flex-col items-center justify-center py-12">
            <Icon icon="material-symbols:error-outline-rounded" className="size-12 text-fd-muted-foreground mb-4" />
            <p className="text-fd-muted-foreground mb-4">Conversation introuvable</p>
            <Button onClick={() => router.push('/messages')} variant="outline">
              <Icon icon="material-symbols:arrow-back-rounded" className="size-4 mr-2" />
              Retour aux messages
            </Button>
          </div>
        </DocsBody>
      </DocsPage>
    );
  }

  return (
    <DocsPage toc={[]} footer={{ enabled: false }}>
      <DocsBody>
        <div className="relative flex flex-col">
          {/* Header - Sticky */}
          <ConversationHeader
            title={conversationData?.title || 'Chargement...'}
            avatar={conversationData?.avatar}
            isGroup={conversationData?.isGroup || false}
            participantCount={conversation?.members.length || 0}
            initials={getUserInitials(conversation?.members[0]?.user_ref || '')}
            onBack={() => router.push('/messages')}
          />

          {error && (
            <Alert variant="destructive" className="my-4">
              <Icon icon="material-symbols:error-circle-rounded" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Messages */}
          <div className="flex-1 my-6">
            <div className="space-y-6">
              {loading ? (
                <MessageListSkeleton />
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-fd-muted-foreground">
                  <Icon icon="material-symbols:chat-bubble-outline-rounded" className="size-12 mb-4 opacity-50" />
                  <p>Aucun message dans cette conversation</p>
                </div>
              ) : (
                Object.entries(groupMessagesByDate()).map(([date, msgs]) => {
                  const messageGroups = createMessageGroups(msgs);
                  
                  return (
                    <div key={date} className="space-y-6">
                      {/* Date separator */}
                      <div className="flex items-center justify-center">
                        <span className="text-xs text-fd-muted-foreground bg-fd-muted px-3 py-1 rounded-full">
                          {date}
                        </span>
                      </div>

                      {/* Message Groups */}
                      <div className="space-y-4">
                        {messageGroups.map((group, groupIndex) => (
                          <MessageGroup
                            key={`group-${date}-${groupIndex}`}
                            messages={group}
                            isOwn={group[0]?.sender_ref === currentUserIid}
                            users={users}
                            currentUserAvatar={Api.currentUser?.thumbnail}
                            currentUserDisplay={Api.currentUser?.display || Api.currentUser?.username}
                            currentUserIid={currentUserIid}
                            getUserName={getUserName}
                            getUserAvatar={getUserAvatar}
                            getUserInitials={getUserInitials}
                            pendingMessages={pendingMessages}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Input - Sticky Bottom */}
          <MessageInput
            value={messageContent}
            onChange={setMessageContent}
            onSubmit={handleSendMessage}
            inputRef={inputRef}
          />
        </div>
      </DocsBody>
    </DocsPage>
  );
}
