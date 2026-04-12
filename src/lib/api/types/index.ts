export interface ApiError {
    status: number;
    code: number;
    message: string;
    data?: any;
}

export type Response<T> = {
    data: T;
    error: null;
} | {
    data: null;
    error: ApiError;
}

// Presence types
export type PresenceStatus =
    | 'oja'      // cyan - online join all
    | 'ojf'      // bleu - online join friend
    | 'online'   // vert
    | 'busy'     // orange
    | 'dnd'      // red - do not disturb
    | 'stream'   // violet
    | 'offline'; // gris

export interface Presence {
    status: PresenceStatus;
    text: string | null;
}

// Auth types
export interface Auth {
    user: CurrentUser;
    token: string;
    expires: string;
}

export interface Logout {
    success: boolean;
}

export interface UserAlias {
    key: string;
    value: string;
}

export interface UserLink {
    label: string;
    value: string;
}

export interface User {
    id: number;
    server: string;
    username: string;
    display?: string;
    thumbnail?: string;
    banner?: string;
    bio?: string;
    pronoun?: string;
    created_at: number;
    presence?: Presence;
    alias: UserAlias[];
    tags: string[];
    links?: UserLink[];
    followers: number;
    following: number;
    relations?: {
        out: string | null;
        in: string | null;
    } | null;
}

export interface CurrentUser extends User {
    email: string;
    twofa_enabled: boolean;
    email_verified: boolean;
    presence: Presence;
    home: string | null;
    avatar: string | null;
}

export interface RegisterForm {
    username: string;
    display?: string;
    password: string;
}

export interface UpdateUser {
    username?: string;
    display?: string;
    display_name?: string;
    bio?: string;
    email?: string | null;
    pronoun?: string;
    presence?: PresenceStatus;
    presence_status?: string | null;
    tags?: string[];
    links?: UserLink[];
    password?: string;
    current_password?: string;
    home?: string | null;
    avatar?: string | null;
}

export interface MultiResponse {
    limit: number;
    offset: number;
    count: number;
    total: number;
}

export interface IRSession {
    id: string;
    current: boolean;
    expires_at: number;
    created_at: number;
    devices: IRDevice[];
}

export interface IRDevice {
    user_agent: string;
    ip: string;
    last_seen: number;
}

export interface Relation {
    id: string;
    type: 'FOLLOW' | 'REQUEST';
    initiator: string;
    target: string;
    created_at: number;
    updated_at: number;
}

export interface TwoFactorSetup {
    secret: string;
    qr_code: string;
}

export interface TwoFactorResponse {
    success: boolean;
    message: string;
    enabled?: boolean;
}

export interface TwoFactorCheckResponse {
    enabled: boolean;
    message: string;
}

export interface SendVerificationCodeResponse {
    success: boolean;
    message: string;
}

export interface VerificationMethod {
    type: string;
    name: string;
    description?: string;
    enabled: boolean;
    can_send: boolean;
    cooldown?: number;
    send_data?: {
        target: number;
        [key: string]: any;
    };
}

export type VerificationRequiredFunction = (error: ApiError, methods: VerificationMethod[]) => string | null | Promise<string | null>;

export interface RelayDetails {
    id: number;
    runtime: string;
    running: boolean;
    status: RelayStatus | string;
    address: { [protocol: string]: string };
}

export interface RelayStatus {
    instances: number;
    clients: number;
    max_instances: number;
    engine: string;
    version: string;
    protocol: number;
    uptime: number;
    response: number;
    specs: RelaySpecs;
    // is frontend only, used to trigger refresh of specs when they change
    specs_time: Date;
}

export interface RelaySpecs {
    c: {
        u: number;
        c: number;
    };
    m: {
        u: number;
        t: number;
    };
    u: {
        u: number;
        b: number;
    };
    d: {
        u: number;
        b: number;
    };
}

export interface RelayLog {
    timestamp: number;
    level: string;
    message: string;
    tag?: string;
}

export interface RelayInstanceSummary {
    id: string;
    internal_id: number;
    player_count: number;
    flags: number;
    world: string;
    capacity: number;
}

export interface RelayInstancesResult {
    total: number;
    limit: number;
    offset: number;
    instances: RelayInstanceSummary[];
}

export interface RelayClientDetail {
    id: string;
    address: string;
    platform: string;
    engine: string;
    user: string | null;
}

export interface RelayClientsResult {
    total: number;
    limit: number;
    offset: number;
    clients: RelayClientDetail[];
}

export interface RelayPlayerDetail {
    id: string;
    client_id: string;
    display: string;
    flags: number;
}

export interface RelayPlayersResult {
    total: number;
    limit: number;
    offset: number;
    players: RelayPlayerDetail[];
}

export interface Conversation {
    id: string;
    server: string;
    title: string | null;
    thumbnail: string | null;
    created_at: number;
    updated_at: number;
    last_message: number | null;
    members: {
        id: string;
        reference: string;
        last_read_at: number | null;
        joined_at: number;
    }[];
}

export interface Message {
    id: string;
    conversation_id: string;
    author: string;
    content: string;
    created_at: number;
    read_at?: number;
}

export interface CreateConversationData {
    participants: string[];
}

export interface SendMessageData {
    content: string;
}

export interface ConversationsResponse extends MultiResponse {
    conversations: Conversation[];
}

export interface MessagesResponse extends MultiResponse {
    messages: Message[];
}

export interface SearchUsersResponse extends MultiResponse {
    items: User[];
}

export interface World {
    id: number;
    name: string | null;
    server: string;
    title: string;
    description: string | null;
    thumbnail: string | null;
    tags: string[];
    capacity: number;
    /** Recommended asset version. -1 means none uploaded. */
    release: number;
    /** NoxIdentifier string of the owner */
    owner: string;
    /** NoxIdentifier strings of contributors */
    contributors: string[];
    alias: UserAlias[];
}

export interface WorldAsset {
    id: number;
    version: number;
    engine: string;
    platform: string;
    is_empty: boolean;
    url: string | null;
    hash: string | null;
    size: number | null;
    mods: string[];
    features: string[];
    /** NoxIdentifier of the uploader, or null */
    uploader: string | null;
}

export interface UpdateWorld {
    name?: string | null;
    title?: string;
    description?: string | null;
    capacity?: number;
    release?: number | null;
    contributors?: string[];
    tags?: string[];
}

export interface WorldsResponse extends MultiResponse {
    items: World[];
}

export interface WorldAssetsResponse extends MultiResponse {
    items: WorldAsset[];
}

export interface Avatar {
    id: number;
    server: string;
    /** Short unique name [a-z0-9-_.]{3,8} or null */
    name: string | null;
    title: string;
    description: string | null;
    thumbnail: string | null;
    tags: string[];
    /** Recommended asset version. -1 means none uploaded. */
    release: number;
    /** NoxIdentifier string of the owner */
    owner: string;
    /** NoxIdentifier strings of contributors */
    contributors: string[];
    alias: UserAlias[];
}

export interface AvatarAsset {
    id: number;
    version: number;
    engine: string;
    platform: string;
    is_empty: boolean;
    url: string | null;
    hash: string | null;
    size: number | null;
    features: string[];
    /** NoxIdentifier of the uploader, or null */
    uploader: string | null;
}

export interface UpdateAvatar {
    name?: string | null;
    title?: string;
    description?: string | null;
    release?: number | null;
    tags?: string[];
    contributors?: string[];
}

export interface AvatarsResponse extends MultiResponse {
    items: Avatar[];
}

export interface AvatarAssetsResponse extends MultiResponse {
    items: AvatarAsset[];
}

export interface TableMeta {
    key: string;
    mime: string;
    hash: string;
    created_at: number;
    updated_at: number;
}

export interface TableListResponse {
    items: TableMeta[];
    limit: number;
    offset: number;
    total: number;
}

export interface PublicTableMeta {
    key: string;
    mime: string;
    hash: string;
    updated_at: number;
}

export interface PublicTableListResponse {
    items: PublicTableMeta[];
    limit: number;
    offset: number;
    total: number;
}
