'use client';

import { isError, useApi } from "@/lib/api";
import type { User } from "@/lib/api/types";
import { Icon } from '@iconify/react';
import { useState } from "react";

export function FollowRemoveButton({ user, setUser, type }: { user: User, setUser: (user: User) => void, type: string }) {
    const [unfollowSent, setUnfollowSent] = useState(false);
    const Api = useApi();

    async function send() {
        if (!Api) return;

        setUnfollowSent(true);

        const res = await Api.sendUnfollow(user.id, user.server);
        if (isError(res)) {
            console.error(res.message);
            setUnfollowSent(false);
            return;
        }

        if (user.relations) {
            user.relations.out = null;
        }
        setUser({...user});

        setUnfollowSent(false);
    }

    return (
        <button 
            disabled={unfollowSent}
            key="remove-follow"
            onClick={() => send()}
            className={`
                p-2
                transition-colors
                rounded-lg
                bg-fd-accent/10 hover:bg-fd-accent/50
                flex items-center
                text-sm
                border border-fd-border
                ${unfollowSent ? "cursor-wait opacity-60" : ""}
            `}
        >
            <Icon icon="material-symbols:remove-rounded" className="size-5" />
            {type === "FOLLOW" && <span className="ms-1">Unfollow</span>}
            {type === "REQUEST" && <span className="ms-1">Pending</span>}
        </button>
    );
}
