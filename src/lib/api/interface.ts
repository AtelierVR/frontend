import type {
    User,
    CurrentUser,
    RegisterForm,
    UpdateUser,
    ApiError,
    SendVerificationCodeResponse,
    IRSession,
    MultiResponse,
    RelayDetails,
    RelayLog,
    RelayInstancesResult,
    RelayClientsResult,
    RelayPlayersResult,
    VerificationMethod,
} from './types';

type VerificationCallback = (error: ApiError, methods: VerificationMethod[]) => Promise<string | null>;

export interface ApiInterface {
    currentUser: CurrentUser | null;

    // User methods
    fetchCurrentUser: () => Promise<CurrentUser | ApiError>;
    fetchUser: (id: number | string, server?: string) => Promise<User | ApiError>;
    getOrFetchUser: (id: number | string, server?: string) => Promise<User | ApiError>;
    updateUser: (data: UpdateUser, factor_code?: string, onVerificationRequired?: VerificationCallback) => Promise<CurrentUser | ApiError>;
    uploadUserThumbnail: (file: Blob) => Promise<URL | ApiError>;
    uploadUserBanner: (file: Blob) => Promise<URL | ApiError>;

    // Auth methods
    fetchLogin: (identifier: string | number, password: string, factor_code?: string, onVerificationRequired?: VerificationCallback) => Promise<CurrentUser | ApiError>;
    fetchLogout: () => Promise<boolean | ApiError>;
    fetchRegister: (data: RegisterForm) => Promise<CurrentUser | ApiError>;

    // Verification methods
    sendVerificationCode: (type: string) => Promise<SendVerificationCodeResponse | ApiError>;

    // Session methods
    fetchMySessions: (limit?: number, offset?: number) => Promise<MultiResponse & { sessions: IRSession[] } | ApiError>;
    fetchCurrentSession: () => Promise<IRSession | ApiError>;
    deleteMySession: (id: string) => Promise<{ success: boolean, logout: boolean } | ApiError>;
    deleteMySessions: () => Promise<{ success: boolean, logout: boolean } | ApiError>;

    // Follow methods
    fetchMyFollowers: (limit?: number, offset?: number) => Promise<MultiResponse & { followers: Array<{ user: string, at: number }> } | ApiError>;
    fetchMyFollowing: (limit?: number, offset?: number) => Promise<MultiResponse & { following: Array<{ user: string, at: number }> } | ApiError>;
    sendFollow: (id: number | string, server?: string) => Promise<import('./types').Relation | ApiError>;
    sendUnfollow: (id: number | string, server?: string) => Promise<boolean | ApiError>;
    sendFollowRequestResponse: (type: 'accept' | 'reject', id: number | string, server?: string) => Promise<boolean | ApiError>;

    // Relay methods
    fetchRelays: () => Promise<RelayDetails[] | ApiError>;
    fetchRelay: (id: number) => Promise<RelayDetails | ApiError>;
    fetchRelayLogs: (id: number, since?: number, limit?: number) => Promise<RelayLog[] | ApiError>;
    sendRelayCommand: (id: number, command: string) => Promise<{ success: boolean } | ApiError>;
    fetchRelayInstances: (id: number, limit?: number, offset?: number) => Promise<RelayInstancesResult | ApiError>;
    fetchRelayClients: (id: number, limit?: number, offset?: number) => Promise<RelayClientsResult | ApiError>;
    fetchInstancePlayers: (id: number, iid: string) => Promise<RelayPlayersResult | ApiError>;
    createRelay: (data: { name: string; host: string; port: number }) => Promise<RelayDetails | ApiError>;
    updateRelay: (id: number, data: Partial<{ name: string; host: string; port: number; enabled: boolean }>) => Promise<RelayDetails | ApiError>;
    deleteRelay: (id: number) => Promise<{ success: boolean } | ApiError>;
    stopRelay: (id: number) => Promise<{ success: boolean } | ApiError>;
    restartRelay: (id: number) => Promise<{ success: boolean } | ApiError>;

    // WebSocket methods
    onSocketEvent: (eventType: string, callback: (data: any) => void) => () => void;
    onSocketEventRegex: (pattern: RegExp, callback: (data: any) => void) => () => void;
}
