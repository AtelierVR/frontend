'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@iconify/react';
import { useApi, isError, RelayLog, RelayDetails } from '@/lib/api';
import { useSocket } from '@/lib/api/hooks/useSocket';
import { LogsViewer } from '../../../LogsViewer';

interface RelayLogEvent {
    relayId: number;
    timestamp: number;
    level: string;
    message: string;
    tag?: string;
}

export default function RelayLogsPage() {
    const params = useParams();
    const Api = useApi();
    const [relay, setRelay] = useState<RelayDetails | null>(null);
    const [logs, setLogs] = useState<RelayLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>();
    const [liveMode] = useState(true); // Always in live mode when WebSocket is connected

    const relayId = Number(params.id);

    // Subscribe to real-time relay logs
    useSocket('relay_logs', (data: RelayLogEvent) => {
        // Only process logs for this specific relay
        if (data.relayId !== relayId) return;

        setLogs(prev => {
            const newLog: RelayLog = {
                timestamp: data.timestamp,
                level: data.level,
                message: data.message,
                tag: data.tag
            };
            const newLogs = [...prev, newLog];
            // Keep last 1000 logs
            return newLogs.slice(-1000);
        });
    }, true);

    const fetchLogs = useCallback(async () => {
        if (!Api || !relayId) return;

        try {
            setError(undefined);

            // Check if relay is connected
            const relayRes = await Api.fetchRelay(relayId);
            if (isError(relayRes)) {
                setError(relayRes.message);
                setLoading(false);
                return;
            }

            setRelay(relayRes);

            if (!relayRes.running) {
                setError('Relay is not connected');
                setLoading(false);
                return;
            }

            // Fetch initial logs (last 100)
            const res = await Api.fetchRelayLogs(relayId, undefined, 100);
            if (isError(res)) {
                setError(res.message);
                return;
            }

            setLogs(res);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load logs');
        } finally {
            setLoading(false);
        }
    }, [Api, relayId]);

    const handleRefresh = useCallback(() => {
        setLoading(true);
        fetchLogs();
    }, [fetchLogs]);

    const handleCommand = useCallback(async (command: string) => {
        if (!Api || !relayId) return;

        try {
            const res = await Api.sendRelayCommand(relayId, command);
            if (isError(res)) {
                setError(res.message);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send command');
        }
    }, [Api, relayId]);

    // Initial fetch
    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    if (loading && logs.length === 0)
        return <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
        </div>;

    if (!relay?.running && logs.length === 0)
        return <div className="flex flex-col items-center justify-center py-12 text-fd-muted-foreground">
            <Icon icon="material-symbols:description-rounded" className="size-12 mb-4 opacity-50" />
            <p>Relay is not connected</p>
            <p className="text-sm">Connect the relay to view logs</p>
        </div>;

    return <LogsViewer
        logs={logs}
        loading={loading}
        error={error}
        liveMode={liveMode}
        onRefresh={handleRefresh}
        isInputable={true}
        onInput={handleCommand}
        className="h-full"
    />;
}
