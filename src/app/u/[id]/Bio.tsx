'use client';

import { cn } from '@/lib/cn';
import { useApi } from '@/lib/api';
import { useState } from 'react';
import type { User } from '@/lib/api/types';
import { getSIDById } from '@/lib/api/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

export default function Bio({ user }: { user: User | null }) {
    const [hover, setHover] = useState(false);
    const Api = useApi();
    const isSame = Api && Api.currentUser && user && getSIDById(Api.currentUser.id, Api.currentUser.server) === getSIDById(user.id, user.server);

    // Custom components for markdown
    const components = {
        pre: ({ children, ...props }: any) => <Pre>{children}</Pre>,
        code: ({ inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            return <div className="my-4">
                {!inline && match ? (
                    <DynamicCodeBlock lang={match[1]} code={String(children).replace(/\n$/, '')} />
                ) : <CodeBlock inline className={className} {...props}>{children}</CodeBlock>}
            </div>
        },
    };

    return (
        <Card
            onMouseOver={() => setHover(true)}
            onMouseOut={() => setHover(false)}
            className="relative"
        >
            <CardHeader className="pb-3 absolute top-0 right-0 flex items-center justify-center gap-2">
                {isSame && (
                    <Link href="/settings/profile#bio">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("size-6", !hover && "opacity-0", "transition-opacity")}
                        >
                            <Icon icon="material-symbols:edit-rounded" className="size-4" />
                        </Button>
                    </Link>
                )}
            </CardHeader>
            <CardContent className="pt-6">
                {!user && (
                    <div className="space-y-2">
                        {[35, 50, 25].map((k, i) => (
                            <div
                                key={i}
                                style={{ inlineSize: `${k}%` }}
                                className={cn(
                                    "bg-fd-muted",
                                    "animate-pulse rounded-sm",
                                    "h-3"
                                )}
                            />
                        ))}
                    </div>
                )}

                {user?.bio && (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkBreaks]}
                            components={components}
                        >
                            {user.bio.replace(/^( +)/gm, (match) => '\u00A0'.repeat(match.length))}
                        </ReactMarkdown>
                    </div>
                )}

                {user && !user.bio && (
                    <p className="text-sm text-fd-muted-foreground italic">No bio yet</p>
                )}
            </CardContent>
        </Card>
    );
}
