'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { useApi } from '@/lib/api';
import { fetchApi, isResponseError } from '@/lib/api/utils';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/lib/api/hooks/useSocket';
import { LogsViewer } from '../LogsViewer';

interface LogEntry {
  timestamp: number;
  level: 'log' | 'error' | 'warn' | 'info' | 'debug';
  message: string;
}

interface LogsResponse {
  logs: LogEntry[];
  total: number;
}

export default function LogsPage() {
  const Api = useApi();
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastTimestamp, setLastTimestamp] = useState<number>(0);
  const [liveMode] = useState(true); // Always in live mode when WebSocket is connected
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to live logs via WebSocket
  useSocket('server_logs', (data: LogEntry) => {
    setLogs(prev => {
      const newLogs = [...prev, data];
      // Keep only last 1000 logs in memory
      if (newLogs.length > 1000)
        return newLogs.slice(-1000);
      return newLogs;
    });
    if (data.timestamp > lastTimestamp)
      setLastTimestamp(data.timestamp);
  }, true); // Always enabled, server will validate permissions

  const loadLogs = useCallback(async (incremental = false) => {
    if (!Api) return;

    if (!incremental) {
      setLoading(true);
    }
    setError(undefined);

    try {
      // Use 'after' parameter for incremental updates
      const url = incremental && lastTimestamp > 0
        ? `/api/server/logs?limit=500&after=${lastTimestamp}`
        : '/api/server/logs?limit=500';

      const res = await fetchApi<LogsResponse>(url);

      if (isResponseError(res)) {
        // Check if it's an unauthorized error (status 403 or code for unauthorized)
        if (res.error.status === 403) {
          setError('You need admin access to view logs');
          router.push('/settings');
          return;
        }
        setError(res.error.message);
        return;
      }

      if (incremental && res.data.logs.length > 0) {
        // Append new logs
        setLogs(prev => [...prev, ...res.data.logs]);
      } else if (!incremental) {
        // Full reload: replace all logs
        setLogs(res.data.logs);
      }

      // Update last timestamp if we have logs
      if (res.data.logs.length > 0) {
        const maxTimestamp = Math.max(...res.data.logs.map(l => l.timestamp));
        setLastTimestamp(maxTimestamp);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, [Api, router, lastTimestamp]);

  useEffect(() => {
    loadLogs(false);
  }, [Api, router]);

  // Auto-refresh is handled by WebSocket, no polling needed in live mode
  // Keep the useEffect structure for potential future fallback
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Check if user is admin
  useEffect(() => {
    if (!Api?.currentUser) return;

    const isAdmin = Api.currentUser?.tags?.includes('sys:admin') ?? false;
    if (!isAdmin) {
      setError('You need admin access to view logs');
      router.push('/settings');
    }
  }, [Api?.currentUser, router]);

  const handleRefresh = useCallback(() => {
    setLastTimestamp(0);
    setLoading(true);
    loadLogs(false);
  }, [loadLogs]);

  return (
    <DocsPage toc={[]} footer={{ enabled: false }}>
      <DocsTitle>Server Logs</DocsTitle>
      <DocsDescription>
        View real-time server logs. Requires administrator access.
      </DocsDescription>
      <DocsBody>
        <LogsViewer 
          logs={logs} 
          loading={loading} 
          error={error} 
          liveMode={liveMode}
          onRefresh={handleRefresh}
          className="h-full"
        />
      </DocsBody>
    </DocsPage>
  );
}
