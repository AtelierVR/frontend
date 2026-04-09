'use client';

import { useEffect, useState } from 'react';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@iconify/react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useApi, isError } from '@/lib/api';
import type { TableMeta } from '@/lib/api/types';
import { cn } from '@/lib/cn';

const TABLES_PER_PAGE = 50;

function TableCard({ table, onDelete }: { table: TableMeta; onDelete: () => void }) {
    const updated = new Date(table.updated_at).toLocaleString();
    const created = new Date(table.created_at).toLocaleString();
    const Api = useApi();
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        if (!Api) return;
        setDownloading(true);
        const buf = await Api.fetchMyTable(table.key);
        setDownloading(false);
        if (buf instanceof Error) return;
        const blob = new Blob([new Uint8Array(buf)], { type: table.mime || 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = table.key;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className={cn('rounded-lg border border-fd-border', 'bg-fd-accent/10')}>
            <Accordion type="single" collapsible>
                <AccordionItem value="details" className="border-0">
                    <AccordionTrigger className="px-4 hover:no-underline hover:bg-fd-accent/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                'size-10 rounded-full flex items-center justify-center flex-shrink-0',
                                table.key.startsWith('public.')
                                    ? 'bg-fd-primary text-fd-primary-foreground'
                                    : 'bg-fd-muted'
                            )}>
                                <Icon icon={table.key.startsWith('public.') ? 'material-symbols:public' : 'material-symbols:lock-rounded'} className="size-5" />
                            </div>
                            <div className="flex flex-col items-start text-left">
                                <div className="font-mono font-medium text-sm">{table.key}</div>
                                <div className="text-xs text-fd-muted-foreground">Updated {updated}</div>
                            </div>
                        </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-4 mt-2 mb-2">
                        <div className="rounded-md bg-fd-muted/50 p-3 space-y-1.5 text-sm mb-3">
                            <div className="flex justify-between gap-4">
                                <span className="text-fd-muted-foreground">Mime</span>
                                <span className="font-mono text-xs">{table.mime}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-fd-muted-foreground">Hash</span>
                                <span className="font-mono text-xs">{table.hash.slice(0, 16)}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-fd-muted-foreground">Created</span>
                                <span className="text-xs">{created}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                                <span className="text-fd-muted-foreground">Updated</span>
                                <span className="text-xs">{updated}</span>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={handleDownload} disabled={downloading}>
                                <Icon icon="material-symbols:download-rounded" className="size-4 mr-1.5" />
                                Download
                            </Button>
                            <Button size="sm" onClick={onDelete}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                <Icon icon="material-symbols:delete-rounded" className="size-4 mr-1.5" />
                                Delete
                            </Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}

export default function TablesPage() {
    const Api = useApi();
    const [tables, setTables] = useState<TableMeta[] | null>(null);
    const [total, setTotal] = useState(-1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>();
    const [hasLoaded, setHasLoaded] = useState(false);
    const [tableToDelete, setTableToDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const loadPage = async (offset: number) => {
        if (loading || !Api) return;
        setLoading(true);
        setError(undefined);
        try {
            const res = await Api.fetchMyTables(TABLES_PER_PAGE, offset);
            if (isError(res)) { setError(res.message); return; }
            if (total === -1) setTotal(res.total);
            setTables(prev => {
                const existing = new Set((prev ?? []).map(t => t.key));
                const next = res.items.filter(t => !existing.has(t.key));
                return [...(prev ?? []), ...next];
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!hasLoaded) { loadPage(0); setHasLoaded(true); }
    }, [hasLoaded]);

    const handleDelete = async () => {
        if (!tableToDelete || !Api) return;
        setDeleting(true);
        const res = await Api.deleteMyTable(tableToDelete);
        setDeleting(false);
        setTableToDelete(null);
        if (isError(res)) { setError(res.message); return; }
        setTables(prev => (prev ?? []).filter(t => t.key !== tableToDelete));
        setTotal(prev => prev - 1);
    };

    const hasMore = tables !== null && total > tables.length;

    const publicTables = (tables ?? []).filter(t => t.key.startsWith('public.'));
    const privateTables = (tables ?? []).filter(t => !t.key.startsWith('public.'));

    const renderList = (list: TableMeta[]) => (
        <div className="space-y-2">
            {list.map(t => (
                <TableCard key={t.key} table={t} onDelete={() => setTableToDelete(t.key)} />
            ))}
        </div>
    );

    const skeletons = (
        <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border border-fd-border rounded-lg p-4 bg-fd-accent/10">
                    <div className="flex items-center gap-3">
                        <Skeleton className="size-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <DocsPage toc={[]} footer={{ enabled: false }}>
            <DocsTitle>Tables</DocsTitle>
            <DocsDescription>
                Key/value entries stored in your account.
            </DocsDescription>
            <DocsBody>
                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <Icon icon="material-symbols:error-circle-rounded" className="size-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-8">
                    {/* Public tables */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Public</h2>
                            {tables !== null && (
                                <span className="text-sm text-fd-muted-foreground">{publicTables.length}</span>
                            )}
                        </div>
                        {tables === null ? skeletons : publicTables.length === 0 ? (
                            <p className="text-sm text-fd-muted-foreground py-4 text-center">No public tables.</p>
                        ) : renderList(publicTables)}
                    </div>

                    {/* Private tables */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Private</h2>
                            {tables !== null && (
                                <span className="text-sm text-fd-muted-foreground">{privateTables.length}</span>
                            )}
                        </div>
                        {tables === null ? skeletons : privateTables.length === 0 ? (
                            <p className="text-sm text-fd-muted-foreground py-4 text-center">No private tables.</p>
                        ) : renderList(privateTables)}
                    </div>

                    {hasMore && (
                        <div className="flex justify-center pt-2">
                            <Button
                                onClick={() => loadPage(tables!.length)}
                                disabled={loading}
                                variant="outline"
                            >
                                {loading ? 'Loading…' : 'Load more'}
                            </Button>
                        </div>
                    )}
                </div>

                <Dialog open={!!tableToDelete} onOpenChange={open => { if (!open) setTableToDelete(null); }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete table</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete <span className="font-mono">{tableToDelete}</span>? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setTableToDelete(null)} disabled={deleting}>
                                Cancel
                            </Button>
                            <Button onClick={handleDelete} disabled={deleting}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                {deleting ? 'Deleting…' : 'Delete'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </DocsBody>
        </DocsPage>
    );
}
