'use client';

import { isError, useApi } from "@/lib/api";
import type { User } from "@/lib/api/types";
import { Plus } from "lucide-react";
import { useState } from "react";

export function FollowAddButton({ user, setUser }: { user: User, setUser: (user: User) => void }) {
    const [followSent, setFollowSent] = useState(false);
    const Api = useApi();

    async function send() {
        if (!Api) return;

        setFollowSent(true);

        const res = await Api.sendFollow(user.id, user.server);
        if (isError(res)) {
            console.error(res.message);
            setFollowSent(false);
            return;
        }

        if (user.relations) {
            user.relations.out = res.type;
        }
        setUser({...user});

        setFollowSent(false);
    }

    return (
        <button 
            disabled={followSent}
            key="add-follow"
            onClick={() => send()}
            className={`
                p-2
                transition-colors
                rounded-lg
                bg-fd-accent/10 hover:bg-fd-accent/50
                flex items-center
                border border-fd-border
                text-sm
                ${followSent ? "cursor-wait opacity-60" : ""}
            `}
        >
            <Plus className="size-5" />
            <span className="ms-1">Follow</span>
        </button>
    );
}
