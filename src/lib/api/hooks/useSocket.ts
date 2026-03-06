'use client';

import { useEffect, useRef } from 'react';
import { useApi } from '../provider';

/**
 * Hook to subscribe to WebSocket events
 * @param eventType - The type of event to listen for (e.g., 'message:new', 'conversation:created') or a RegExp pattern
 * @param callback - Function to call when the event is received
 * @param enabled - Whether the subscription is active (default: true)
 * 
 * @example
 * ```tsx
 * // Listen to exact event type
 * useSocket('message:new', (message) => {
 *   console.log('New message:', message);
 * });
 * 
 * // Listen to multiple event types with regex
 * useSocket(/^message:/, (data) => {
 *   console.log('Any message event:', data);
 * });
 * ```
 */
export function useSocket(
    eventType: string | RegExp,
    callback: (data: any) => void,
    enabled: boolean = true
) {
    const api = useApi();
    const callbackRef = useRef(callback);

    // Keep callback ref up to date without triggering re-subscription
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!enabled) return;

        // Use a stable wrapper that calls the latest callback
        const stableCallback = (data: any) => callbackRef.current(data);

        // Subscribe to the event (string or regex)
        const unsubscribe = eventType instanceof RegExp
            ? api.onSocketEventRegex(eventType, stableCallback)
            : api.onSocketEvent(eventType, stableCallback);

        // Cleanup on unmount or when dependencies change
        return unsubscribe;
    }, [eventType, enabled, api]);
}
