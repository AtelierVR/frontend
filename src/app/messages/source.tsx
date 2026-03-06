'use client';

import type { Root } from 'fumadocs-core/page-tree';
import { Icon } from '@iconify/react';
import type { Conversation, CurrentUser } from '@/lib/api';
import { useConversations } from '@/lib/api/hooks';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/cn';

export const usePageTree = (currentUser: CurrentUser | null): Root => {
    const { conversations, users } = useConversations();

    function getConversationData(conv: Conversation) {
        const cu = currentUser?.alias?.find(a => a.key === 'iid')?.value;
        const om = conv.members.filter(m => m.user_ref !== cu);
        
        let title = conv.title?.trim() || '';
        let avatar = conv.avatar;
        const isGroup = om.length > 1;
        
        if (!title) {
            if (om.length === 0) {
                title = currentUser?.display || currentUser?.username || 'Unknown';
                avatar = currentUser?.thumbnail;
            } else if (om.length === 1) {
                const user = users.get(om[0].user_ref);
                title = user?.display || user?.username || om[0].user_ref;
                avatar = user?.thumbnail;
            } else {
                title = om.slice(0, 3).map(m => {
                    const user = users.get(m.user_ref);
                    return user?.display || user?.username || m.user_ref;
                }).join(', ') + (om.length > 3 ? ` +${om.length - 3}` : '');
            }
        }
        
        const initials = title
            .replace(/[^a-zA-Z ]/g, '')
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || '??';
        
        return { title, avatar, initials, isGroup };
    }

    return {
        name: 'Messages',
        children: [
            {
                type: 'separator',
                name: 'Conversations',
            },
            {
                type: 'page',
                name: 'All Messages',
                url: '/messages',
                icon: <Icon icon="material-symbols:inbox-rounded" />,
            },
            ...conversations.map(conv => {
                const { title, avatar, initials, isGroup } = getConversationData(conv);
                return {
                    type: 'page' as const,
                    name: title,
                    url: `/messages/${conv.id}`,
                    icon: (
                        <Avatar className="size-4">
                            {avatar && <AvatarImage src={avatar} alt={title} />}
                            <AvatarFallback className={cn(
                                "text-[0.5rem] font-semibold",
                                isGroup ? "bg-fd-primary/10 text-fd-primary" : "bg-fd-accent"
                            )}>
                                {isGroup ? (
                                    <Icon icon="material-symbols:group-rounded" className="size-3" />
                                ) : (
                                    initials
                                )}
                            </AvatarFallback>
                        </Avatar>
                    ),
                };
            }),
        ]
    };
};

