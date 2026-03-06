'use client';

import { isError, useApi } from "@/lib/api";
import type { User } from "@/lib/api/types";
import { Minus, Check } from "lucide-react";
import { useState } from "react";

export function FollowRequestButton({ user, setUser }: { user: User, setUser: (user: User) => void }) {
    const [isResponseSent, setResponseSent] = useState<string>("none");
    const Api = useApi();

    async function response(type: "accept" | "reject") {
        if (!Api) return;
        
        try {
            setResponseSent(type);
            const res = await Api.sendFollowRequestResponse(type, user.id, user.server);
            if (isError(res)) {
                console.error(res.message);
                setResponseSent("none");
                return;
            }
            
            if (user.relations) {
                user.relations.in = type === "accept" ? "FOLLOW" : null;
            }
            setUser({...user});
            setResponseSent("none");
        } catch (e) {
            console.error(e);
            setResponseSent("none");
        }
    }

    return (
        <div className="
            flex
            transition-colors
            rounded-lg
            bg-fd-accent/10
            items-center
            border border-fd-border
            overflow-hidden
            text-sm
        ">
            <button
                disabled={isResponseSent !== "none"}
                key="accept-follow"
                onClick={() => response("accept")}
                className={`
                    p-2
                    transition-colors
                    flex items-center
                    ${isResponseSent !== "none"
                        ? "bg-fd-accent/30"
                        : "hover:bg-fd-accent/50"
                    }
                    text-sm
                `}
            >
                <Check className="size-5" />
                <span className="ms-1">Accept</span>
            </button>
            <button
                disabled={isResponseSent !== "none"}
                key="reject-follow"
                onClick={() => response("reject")}
                className={`
                    p-2
                    transition-colors
                    ${isResponseSent !== "none"
                        ? "bg-fd-accent/30"
                        : "hover:bg-fd-accent/50"
                    }
                    flex items-center
                `}
            >
                <Minus className="size-5" />
                <span className="ms-1">Reject</span>
            </button>
        </div>
    );
}
