'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import type { Avatar } from '@/lib/api/types';
import { useAvatar } from './AvatarContext';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

export default function AvatarDescription({ avatar }: { avatar: Avatar | null }) {
    const [hover, setHover] = useState(false);
    const { canEdit } = useAvatar();

    const components = {
        pre: ({ children, ...props }: any) => <Pre>{children}</Pre>,
        code: ({ inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            return <div className="my-4">
                {!inline && match
                    ? <DynamicCodeBlock lang={match[1]} code={String(children).replace(/\n$/, '')} />
                    : <CodeBlock inline className={className} {...props}>{children}</CodeBlock>}
            </div>;
        },
    };

    return (
        <Card
            onMouseOver={() => setHover(true)}
            onMouseOut={() => setHover(false)}
            className="relative"
        >
            <CardHeader className="pb-3 absolute top-0 right-0 flex items-center justify-center gap-2">
                {canEdit && avatar && (
                    <Link href={`/a/${avatar.id}@${avatar.server}/edit#description`}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn('size-6', !hover && 'opacity-0', 'transition-opacity')}
                        >
                            <Icon icon="material-symbols:edit-rounded" className="size-4" />
                        </Button>
                    </Link>
                )}
            </CardHeader>
            <CardContent className="pt-6">
                {!avatar && (
                    <div className="space-y-2">
                        {[35, 50, 25].map((k, i) => (
                            <div
                                key={i}
                                style={{ inlineSize: `${k}%` }}
                                className={cn('bg-fd-muted', 'animate-pulse rounded-sm', 'h-3')}
                            />
                        ))}
                    </div>
                )}

                {avatar?.description && (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkBreaks]}
                            components={components}
                        >
                            {avatar.description.replace(/^( +)/gm, (match) => '\u00A0'.repeat(match.length))}
                        </ReactMarkdown>
                    </div>
                )}

                {avatar && !avatar.description && (
                    <p className="text-sm text-fd-muted-foreground italic">No description provided.</p>
                )}
            </CardContent>
        </Card>
    );
}
