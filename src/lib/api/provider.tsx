'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AuthService, UserService, VerificationService, SessionService, FollowService, RelayService, MessageService, TotpService, WorldService } from './services';
import { getSIDById, isError } from './utils';
import { resolveApiConfig } from './config';
import type { ApiInterface } from './interface';
import type { User, CurrentUser, UpdateUser, ApiError } from './types';

const ApiContext = createContext<ApiInterface | null>(null);

export function ApiProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [users, setUsers] = useState(new Map<string, User>());
    const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
    const socketListenersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());
    const regexListenersRef = useRef<Array<{ pattern: RegExp; callback: (data: any) => void }>>([]);

    // Initialize services
    const authService = new AuthService();
    const userService = new UserService();
    const verificationService = new VerificationService();
    const sessionService = new SessionService();
    const followService = new FollowService();
    const relayService = new RelayService();
    const messageService = new MessageService();
    const totpService = new TotpService();
    const worldService = new WorldService();

    // User methods
    const fetchCurrentUser = async () => {
        const result = await userService.fetchCurrentUser();
        if (isError(result)) return result;

        setCurrentUser(result);
        setUsers(new Map(users.set(getSIDById(result.id, result.server), result)));
        return result;
    };

    const fetchUser = async (id: number | string, server?: string) => {
        const result = await userService.fetchUser(id, server);
        if (isError(result)) return result;

        setUsers(new Map(users.set(getSIDById(id, server), result)));
        return result;
    };

    const getOrFetchUser = async (id: number | string, server?: string) => {
        const sid = getSIDById(id, server);
        if (users.has(sid))
            return users.get(sid) || { status: 404, code: 404, message: 'User not found.' };
        return await fetchUser(id, server);
    };

    const updateUser = async (data: UpdateUser, factor_code?: string, onVerificationRequired?: (error: any, methods: any[]) => Promise<string | null>) => {
        if (Object.keys(data).length === 0)
            return (currentUser ?? { status: 400, code: 400, message: 'No data to update.' }) as CurrentUser | ApiError;
        const result = await userService.updateUser(data, factor_code, onVerificationRequired);
        if (isError(result)) return result;

        setCurrentUser(result);
        setUsers(new Map(users.set(getSIDById(result.id, result.server), result)));
        return result;
    };

    const uploadUserThumbnail = async (file: Blob) => {
        const result = await userService.uploadThumbnail(file);
        if (isError(result)) return result;

        const me = await userService.fetchCurrentUser();
        if (!isError(me)) {
            setCurrentUser(me);
            setUsers(new Map(users.set(getSIDById(me.id, me.server), me)));
        }
        return result.url;
    };

    const uploadUserBanner = async (file: Blob) => {
        const result = await userService.uploadBanner(file);
        if (isError(result)) return result;

        const me = await userService.fetchCurrentUser();
        if (!isError(me)) {
            setCurrentUser(me);
            setUsers(new Map(users.set(getSIDById(me.id, me.server), me)));
        }
        return result.url;
    };

    // Auth methods
    const fetchLogin = async (identifier: string | number, password: string, factor_code?: string, onVerificationRequired?: (error: any, methods: any[]) => Promise<string | null>) => {
        const result = await authService.login(identifier, password, factor_code, onVerificationRequired);
        if (isError(result)) return result;

        setCurrentUser(result);
        setUsers(new Map(users.set(getSIDById(result.id, result.server), result)));
        return result;
    };

    const fetchLogout = async () => {
        const result = await authService.logout();
        if (isError(result)) return result;

        setCurrentUser(null);
        setUsers(new Map());
        return result;
    };

    const fetchRegister = async (data: any) => {
        const result = await authService.register(data);
        if (isError(result)) return result;

        setCurrentUser(result);
        setUsers(new Map(users.set(getSIDById(result.id, result.server), result)));
        return result;
    };

    // Verification methods
    const sendVerificationCode = async (type: string, data: Record<string, any>) => {
        return await verificationService.sendVerificationCode(type, data);
    }

    const resendEmailVerification = async () => {
        return await verificationService.resendEmailVerification();
    }

    // Session methods
    const fetchMySessions = async (limit?: number, offset?: number) => {
        return await sessionService.fetchMySessions(limit, offset);
    };

    const fetchCurrentSession = async () => {
        return await sessionService.fetchCurrentSession();
    };

    const deleteMySession = async (id: string) => {
        return await sessionService.deleteMySession(id);
    };

    const deleteMySessions = async () => {
        return await sessionService.deleteMySessions();
    };

    // Follow methods
    const fetchMyFollowers = async (limit?: number, offset?: number) => {
        return await followService.fetchMyFollowers(limit, offset);
    };

    const fetchMyFollowing = async (limit?: number, offset?: number) => {
        return await followService.fetchMyFollowing(limit, offset);
    };

    const sendFollow = async (id: number | string, server?: string) => {
        return await followService.sendFollow(id, server);
    };

    const sendUnfollow = async (id: number | string, server?: string) => {
        return await followService.sendUnfollow(id, server);
    };

    const sendFollowRequestResponse = async (type: 'accept' | 'reject', id: number | string, server?: string) => {
        return await followService.sendFollowRequestResponse(type, id, server);
    };

    // Relay methods
    const fetchRelays = async () => {
        return await relayService.fetchRelays();
    };

    const fetchRelay = async (id: number) => {
        return await relayService.fetchRelay(id);
    };

    const fetchRelayLogs = async (id: number, since?: number, limit?: number) => {
        return await relayService.fetchRelayLogs(id, since, limit);
    };

    const sendRelayCommand = async (id: number, command: string) => {
        return await relayService.sendRelayCommand(id, command);
    };

    const fetchRelayInstances = async (id: number, limit?: number, offset?: number) => {
        return await relayService.fetchRelayInstances(id, limit, offset);
    };

    const fetchRelayClients = async (id: number, limit?: number, offset?: number) => {
        return await relayService.fetchRelayClients(id, limit, offset);
    };

    const fetchInstancePlayers = async (id: number, iid: string) => {
        return await relayService.fetchInstancePlayers(id, iid);
    };

    const createRelay = async (data: { name: string; host: string; port: number }) => {
        return await relayService.createRelay(data);
    };

    const updateRelay = async (id: number, data: Partial<{ name: string; host: string; port: number; enabled: boolean }>) => {
        return await relayService.updateRelay(id, data);
    };

    const deleteRelay = async (id: number) => {
        return await relayService.deleteRelay(id);
    };

    const stopRelay = async (id: number) => {
        return await relayService.stopRelay(id);
    };

    const restartRelay = async (id: number) => {
        return await relayService.restartRelay(id);
    };

    // WebSocket initialization
    useEffect(() => {
        if (!currentUser) {
            fetchCurrentUser();
        } else if (!webSocket) {
            resolveApiConfig().then(config => {
                let ws = new WebSocket(config.wsUrl);

                ws.onopen = () => {
                    console.log("WebSocket connected");
                    setWebSocket(ws);
                };

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        let eventType = data.type;

                        // Handle event:xxx messages from subscription system
                        if (eventType.startsWith('event:')) {
                            eventType = eventType.substring(6); // Remove 'event:' prefix
                        }

                        // Notifier tous les listeners pour ce type d'événement exact
                        const listeners = socketListenersRef.current.get(eventType);
                        if (listeners) {
                            listeners.forEach(listener => listener(data.data || data));
                        }

                        // Notifier tous les listeners avec regex qui matchent
                        regexListenersRef.current.forEach(({ pattern, callback }) => {
                            if (pattern.test(eventType)) {
                                callback(data.data || data);
                            }
                        });
                    } catch (error) {
                        console.error('Failed to parse WebSocket message:', error);
                    }
                };

                ws.onclose = () => {
                    console.log("WebSocket disconnected");
                    setWebSocket(null);
                };

                ws.onerror = (error) => {
                    console.error("WebSocket error:", error);
                };
            });
        }

        return () => {
            if (webSocket) {
                webSocket.close();
            }
        };
    }, [currentUser, webSocket]);

    // Socket event subscription method
    const onSocketEvent = useCallback((eventType: string, callback: (data: any) => void) => {
        const listeners = socketListenersRef.current.get(eventType) || new Set();
        const isFirstListener = listeners.size === 0;

        listeners.add(callback);
        socketListenersRef.current.set(eventType, listeners);

        // Send subscribe message to server if this is the first listener for this event
        if (isFirstListener && webSocket && webSocket.readyState === WebSocket.OPEN) {
            webSocket.send(JSON.stringify({
                type: 'subscribe',
                id: `sub-${eventType}-${Date.now()}`,
                data: { events: [eventType] }
            }));
        }

        // Return cleanup function
        return () => {
            const listeners = socketListenersRef.current.get(eventType);
            if (listeners) {
                listeners.delete(callback);

                // Send unsubscribe message if no more listeners for this event
                if (listeners.size === 0) {
                    socketListenersRef.current.delete(eventType);

                    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
                        webSocket.send(JSON.stringify({
                            type: 'unsubscribe',
                            id: `unsub-${eventType}-${Date.now()}`,
                            data: { events: [eventType] }
                        }));
                    }
                }
            }
        };
    }, [webSocket]);

    // Socket event subscription method with regex support
    const onSocketEventRegex = useCallback((pattern: RegExp, callback: (data: any) => void) => {
        const listener = { pattern, callback };
        regexListenersRef.current.push(listener);

        // Return cleanup function
        return () => {
            regexListenersRef.current = regexListenersRef.current.filter(l => l !== listener);
        };
    }, []);

    const apiValue: ApiInterface = {
        currentUser,

        // User methods
        fetchCurrentUser,
        fetchUser,
        getOrFetchUser,
        updateUser,
        uploadUserThumbnail,
        uploadUserBanner,

        // Auth methods
        fetchLogin,
        fetchLogout,
        fetchRegister,

        // Verification methods
        sendVerificationCode,
        resendEmailVerification,

        // Session methods
        fetchMySessions,
        fetchCurrentSession,
        deleteMySession,
        deleteMySessions,

        // Follow methods
        fetchMyFollowers,
        fetchMyFollowing,
        sendFollow,
        sendUnfollow,
        sendFollowRequestResponse,

        // Relay methods
        fetchRelays,
        fetchRelay,
        fetchRelayLogs,
        sendRelayCommand,
        fetchRelayInstances,
        fetchRelayClients,
        fetchInstancePlayers,
        createRelay,
        updateRelay,
        deleteRelay,
        stopRelay,
        restartRelay,

        // TOTP / 2FA methods
        setupTotp: () => totpService.setup(),
        enableTotp: (secret, token) => totpService.enable(secret, token),
        disableTotp: (factor_code, onVerificationRequired) => totpService.disable(factor_code, onVerificationRequired),

        fetchConversations: messageService.fetchConversations,
        fetchConversation: messageService.fetchConversation,
        createConversation: messageService.createConversation,
        sendMessage: messageService.sendMessage,
        fetchMessages: messageService.fetchMessages,
        markAsRead: messageService.markAsRead,

        // World methods
        fetchWorld: (id, server) => worldService.fetchWorld(id, server),
        fetchWorlds: (limit, offset) => worldService.fetchWorlds(limit, offset),
        fetchWorldAssets: (id, server, version) => worldService.fetchWorldAssets(id, server, version),

        // WebSocket methods
        onSocketEvent,
        onSocketEventRegex,
    };

    return (
        <ApiContext.Provider value={apiValue}>
            {children}
        </ApiContext.Provider>
    );
}

export function useApi(): ApiInterface {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error('useApi must be used within an ApiProvider');
    }
    return context;
}
