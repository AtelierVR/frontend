'use client';

import { useSocket } from '@/lib/api';
import { useCallback, useState } from 'react';

/**
 * Example component demonstrating useSocket hook usage
 */
export function WebSocketExample() {
    const [messages, setMessages] = useState<any[]>([]);
    const [isListening, setIsListening] = useState(true);

    // Using useCallback to avoid unnecessary re-renders
    const handleNewMessage = useCallback((message: any) => {
        console.log('Received message:', message);
        setMessages(prev => [...prev, message]);
    }, []);

    const handleConversationCreated = useCallback((conversation: any) => {
        console.log('New conversation:', conversation);
    }, []);

    // Subscribe to message:new events
    useSocket('message:new', handleNewMessage, isListening);

    // Subscribe to conversation:created events
    useSocket('conversation:created', handleConversationCreated, isListening);

    return (
        <div className="p-4">
            <div className="mb-4">
                <button
                    onClick={() => setIsListening(!isListening)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    {isListening ? 'Stop' : 'Start'} Listening
                </button>
            </div>

            <div className="space-y-2">
                <h2 className="text-xl font-bold">
                    Messages ({messages.length})
                </h2>
                <div className="space-y-1">
                    {messages.map((message, idx) => (
                        <div
                            key={idx}
                            className="p-2 bg-gray-100 dark:bg-gray-800 rounded"
                        >
                            <pre className="text-sm">
                                {JSON.stringify(message, null, 2)}
                            </pre>
                        </div>
                    ))}
                </div>
            </div>

            {isListening && (
                <div className="mt-4 text-sm text-green-600 dark:text-green-400">
                    ✓ Listening for WebSocket events
                </div>
            )}
        </div>
    );
}
