// Code generated by protoc-gen-tstypes. DO NOT EDIT.

export enum EncryptMode {
    DEFAULT_ENCRYPT_MODE = "DEFAULT_ENCRYPT_MODE",
    ENCRYPT_V2 = "ENCRYPT_V2",
    SIGNCRYPT_V1 = "SIGNCRYPT_V1",
}
export enum AuthStatus {
    AUTH_UNKNOWN = "AUTH_UNKNOWN",
    AUTH_SETUP = "AUTH_SETUP",
    AUTH_UNLOCKED = "AUTH_UNLOCKED",
    AUTH_LOCKED = "AUTH_LOCKED",
}
export enum AuthType {
    UNKNOWN_AUTH = "UNKNOWN_AUTH",
    PASSWORD_AUTH = "PASSWORD_AUTH",
    FIDO2_HMAC_SECRET_AUTH = "FIDO2_HMAC_SECRET_AUTH",
}
export enum ExportType {
    DEFAULT_EXPORT_TYPE = "DEFAULT_EXPORT_TYPE",
    SALTPACK_EXPORT_TYPE = "SALTPACK_EXPORT_TYPE",
    SSH_EXPORT_TYPE = "SSH_EXPORT_TYPE",
}
export enum KeyType {
    UNKNOWN_KEY_TYPE = "UNKNOWN_KEY_TYPE",
    EDX25519 = "EDX25519",
    EDX25519_PUBLIC = "EDX25519_PUBLIC",
    X25519 = "X25519",
    X25519_PUBLIC = "X25519_PUBLIC",
}
export enum SortDirection {
    ASC = "ASC",
    DESC = "DESC",
}
export enum SecretType {
    UNKNOWN_SECRET_TYPE = "UNKNOWN_SECRET_TYPE",
    PASSWORD_SECRET = "PASSWORD_SECRET",
    CONTACT_SECRET = "CONTACT_SECRET",
    CARD_SECRET = "CARD_SECRET",
    NOTE_SECRET = "NOTE_SECRET",
}
export enum Encoding {
    HEX = "HEX",
    BASE62 = "BASE62",
    BASE58 = "BASE58",
    BASE32 = "BASE32",
    BASE16 = "BASE16",
    BASE64 = "BASE64",
    SALTPACK = "SALTPACK",
    BIP39 = "BIP39",
}
export enum UserStatus {
    USER_UNKNOWN = "USER_UNKNOWN",
    USER_OK = "USER_OK",
    USER_RESOURCE_NOT_FOUND = "USER_RESOURCE_NOT_FOUND",
    USER_CONTENT_NOT_FOUND = "USER_CONTENT_NOT_FOUND",
    USER_CONTENT_INVALID = "USER_CONTENT_INVALID",
    USER_CONN_FAILURE = "USER_CONN_FAILURE",
    USER_FAILURE = "USER_FAILURE",
}
export enum WormholeStatus {
    WORMHOLE_DEFAULT = "WORMHOLE_DEFAULT",
    WORMHOLE_STARTING = "WORMHOLE_STARTING",
    WORMHOLE_OFFERING = "WORMHOLE_OFFERING",
    WORMHOLE_ANSWERING = "WORMHOLE_ANSWERING",
    WORMHOLE_HANDSHAKE = "WORMHOLE_HANDSHAKE",
    WORMHOLE_CONNECTED = "WORMHOLE_CONNECTED",
    WORMHOLE_CLOSED = "WORMHOLE_CLOSED",
}
export enum ContentType {
    BINARY_CONTENT = "BINARY_CONTENT",
    UTF8_CONTENT = "UTF8_CONTENT",
}
export enum MessageType {
    MESSAGE_SENT = "MESSAGE_SENT",
    MESSAGE_PENDING = "MESSAGE_PENDING",
    MESSAGE_ACK = "MESSAGE_ACK",
}
export interface RPCError {
    code?: number;
    message?: string;
    details?: string;
}

export interface SignRequest {
    data?: Uint8Array;
    signer?: string;
    // Armored, if true, output will be armored.
    armored?: boolean;
    // Detached, if true, output will be just the signature.
    detached?: boolean;
}

export interface SignResponse {
    // Data is signed output.
    data?: Uint8Array;
    kid?: string;
}

export interface SignFileInput {
    // In is input file path. 
    in?: string;
    // Out file path (or sig if detached).
    out?: string;
    signer?: string;
    // Armored, if true, output will be armored.
    armored?: boolean;
    // Detached, if true, output will be just the signature.
    detached?: boolean;
}

export interface SignFileOutput {
    kid?: string;
    bytes?: number;
    total?: number;
}

export interface VerifyRequest {
    // Data is verified output.
    data?: Uint8Array;
    // Armored, if true, output will be armored.
    armored?: boolean;
    // Detached signature.
    detached?: boolean;
}

export interface VerifyResponse {
    // Data (if out is not specified in request).
    data?: Uint8Array;
    signer?: Key;
}

export interface VerifyDetachedRequest {
    // Data to verify.
    data?: Uint8Array;
    sig?: Uint8Array;
    // Armored, if true, sig is armored.
    armored?: boolean;
}

export interface VerifyDetachedResponse {
    signer?: Key;
}

export interface VerifyInput {
    // Data to verify.
    data?: Uint8Array;
}

export interface VerifyOutput {
    // Data, verified. If empty, is EOF.
    data?: Uint8Array;
    signer?: Key;
}

export interface VerifyFileInput {
    // In is input file path.  
    in?: string;
    // Out is output file path.
    out?: string;
    // Armored, if true, sig is armored.
    armored?: boolean;
}

export interface VerifyFileOutput {
    signer?: Key;
    out?: string;
}

export interface VerifyDetachedFileInput {
    // In is input file path.  
    in?: string;
    // Signature (detached).
    sig?: Uint8Array;
    // Armored, if true, sig is armored.
    armored?: boolean;
}

export interface VerifyDetachedInput {
    // Data to verify.
    data?: Uint8Array;
    // Signature (detached).
    sig?: Uint8Array;
    // Armored, if true, sig is armored.
    armored?: boolean;
}

export interface Statement {
    // Sig is the signature bytes.
    sig?: Uint8Array;
    // Data that was signed.
    data?: Uint8Array;
    // KID is the key that signed.
    kid?: string;
    // Seq in a sigchain (1 is root).
    seq?: number;
    // Prev is a hash of the previous item in the sigchain.
    prev?: Uint8Array;
    // Revoke refers to a previous signed seq to revoke.
    revoke?: number;
    // Timestamp ...
    timestamp?: number;
    // Type (optional).
    type?: string;
}

export interface SigchainRequest {
    kid?: string;
}

export interface SigchainResponse {
    key?: Key;
    statements?: Array<Statement>;
}

export interface StatementRequest {
    kid?: string;
    seq?: number;
}

export interface StatementResponse {
    statement?: Statement;
}

export interface StatementCreateRequest {
    data?: Uint8Array;
    kid?: string;
    // Local, if true, won't save to the current key server.
    local?: boolean;
}

export interface StatementCreateResponse {
    statement?: Statement;
}

export interface StatementRevokeRequest {
    // Seq to revoke.
    seq?: number;
    kid?: string;
    // Local, if true, won't save to the current key server.
    local?: boolean;
}

export interface StatementRevokeResponse {
    statement?: Statement;
}

export interface SignInput {
    data?: Uint8Array;
    // In is input file path (if data is not specified).  
    in?: string;
    // Out is output file path (required if in specified).
    out?: string;
    signer?: string;
    // Armored, if true, output will be armored.
    armored?: boolean;
    // Detached, if true, output will be just the signature.
    detached?: boolean;
}

export interface SignOutput {
    // Data, signed.
    data?: Uint8Array;
    kid?: string;
}

export interface EncryptRequest {
    // Data to encrypt.
    data?: Uint8Array;
    // Armored, if true will return armored string output.
    armored?: boolean;
    // Recipients to encrypt to.
    recipients?: Array<string>;
    // Sender, or empty, if anonymous.
    sender?: string;
    // Mode is the encryption mode.
    mode?: EncryptMode;
}

export interface EncryptResponse {
    data?: Uint8Array;
}

export interface EncryptFileInput {
    // In is input file path. 
    in?: string;
    // Out is output file path.
    out?: string;
    // Armored, if true will return armored string output.
    armored?: boolean;
    // Recipients to encrypt to.
    recipients?: Array<string>;
    // Sender, or empty, if anonymous.
    sender?: string;
    // Mode is the encryption mode.
    mode?: EncryptMode;
}

export interface EncryptFileOutput {
    bytes?: number;
    total?: number;
}

export interface EncryptInput {
    // Data to encrypt. Send empty byte slice as last message.
    data?: Uint8Array;
    // Armored, if true will return armored string output.
    armored?: boolean;
    // Recipients to encrypt to.
    recipients?: Array<string>;
    // Sender, or empty, if anonymous.
    sender?: string;
    // Mode is the encryption mode.
    mode?: EncryptMode;
}

export interface EncryptOutput {
    // Data, encrypted.
    data?: Uint8Array;
}

export interface DecryptRequest {
    // Data to decrypt.
    data?: Uint8Array;
    // Armored, if true, expects data to be armored.
    armored?: boolean;
    // Mode is the encryption mode.
    mode?: EncryptMode;
}

export interface DecryptResponse {
    // Data decrypted.
    data?: Uint8Array;
    // Sender (if not anonymous)
    sender?: Key;
}

export interface DecryptFileInput {
    // In is the input encrypted file path. 
    in?: string;
    // Out is the output decrypted file path.
    out?: string;
    // Armored, if true, expects file to be armored.
    armored?: boolean;
    // Mode is the encryption mode.
    mode?: EncryptMode;
}

export interface DecryptFileOutput {
    sender?: Key;
    out?: string;
    bytes?: number;
    total?: number;
}

export interface DecryptInput {
    // Data, encrypted.
    data?: Uint8Array;
}

export interface DecryptOutput {
    // Data, decrypted. If empty, is EOF.
    data?: Uint8Array;
    sender?: Key;
}

export interface RuntimeStatusRequest {
}

export interface RuntimeStatusResponse {
    // Version of running service.
    version?: string;
    // AppName app name.
    appName?: string;
    // Exe is the service executable path.
    exe?: string;
    // AuthStatus is status of auth.
    authStatus?: AuthStatus;
    // FIDO2 available.
    fido2?: boolean;
}

export interface AuthSetupRequest {
    // Secret for auth depending on auth type, e.g. password, pin, etc.
    secret?: string;
    // Type for auth.
    type?: AuthType;
}

export interface AuthSetupResponse {
}

export interface AuthUnlockRequest {
    // Secret for auth depending on auth type, e.g. password, pin, etc.
    secret?: string;
    // Type for auth.
    type?: AuthType;
    // Client name.
    client?: string;
}

export interface AuthUnlockResponse {
    // AuthToken to use for requests.
    authToken?: string;
}

export interface AuthProvisionRequest {
    // Secret for auth depending on auth type, e.g. password, pin, etc.
    secret?: string;
    // Type for auth.
    type?: AuthType;
    // Setup phase for auth (for FIDO2 make credential step).
    setup?: boolean;
}

export interface AuthProvisionResponse {
    provision?: AuthProvision;
}

export interface AuthDeprovisionRequest {
    id?: string;
}

export interface AuthDeprovisionResponse {
}

export interface AuthProvision {
    id?: string;
    type?: AuthType;
    createdAt?: number;
    // For FIDO2
    // AAGUID is a device "identifier" (only unique across batches for privacy reasons).
    aaguid?: string;
    noPin?: boolean;
}

export interface AuthProvisionsRequest {
}

export interface AuthProvisionsResponse {
    provisions?: Array<AuthProvision>;
}

export interface AuthLockRequest {
}

export interface AuthLockResponse {
}

export interface KeyGenerateRequest {
    type?: KeyType;
}

export interface KeyGenerateResponse {
    kid?: string;
}

export interface UserServiceRequest {
    // KID to use, or if empty the current key.
    kid?: string;
    // Service such as twitter, github.
    service?: string;
}

export interface UserServiceResponse {
    // Service such as twitter, github.
    service?: string;
}

export interface UserSignRequest {
    // KID to use, or if empty the current key.
    kid?: string;
    // Service such as twitter, github.
    service?: string;
    // Name is username on the service.
    name?: string;
}

export interface UserSignResponse {
    // Message is signed message.
    message?: string;
    // Name in request.
    name?: string;
}

export interface UserAddRequest {
    // KID to use, or if empty the current key.
    kid?: string;
    // Service such as twitter, github.
    service?: string;
    // Name is username on the service.
    name?: string;
    // URL is location of signed message on the service.
    url?: string;
    // Local, if true, won't save to the current key server.
    local?: boolean;
}

export interface UserAddResponse {
    user?: User;
    statement?: Statement;
}

export interface KeyExportRequest {
    kid?: string;
    password?: string;
    type?: ExportType;
    public?: boolean;
    noPassword?: boolean;
}

export interface KeyExportResponse {
    export?: Uint8Array;
}

export interface KeyImportRequest {
    in?: Uint8Array;
    password?: string;
}

export interface KeyImportResponse {
    kid?: string;
}

export interface KeyRemoveRequest {
    // KID of key to remove.
    kid?: string;
}

export interface KeyRemoveResponse {
}

export interface Key {
    // ID identifier.
    id?: string;
    // Type of key.
    type?: KeyType;
    // User associated with this key.
    user?: User;
    // Saved if saved locally.
    saved?: boolean;
    // SigchainLength is length of sigchain (if any).
    sigchainLength?: number;
    sigchainUpdatedAt?: number;
}

export interface KeyRequest {
    identity?: string;
    update?: boolean;
}

export interface KeyResponse {
    key?: Key;
}

export interface KeysRequest {
    query?: string;
    types?: Array<KeyType>;
    sortField?: string;
    sortDirection?: SortDirection;
}

export interface KeysResponse {
    keys?: Array<Key>;
    sortField?: string;
    sortDirection?: SortDirection;
}

export interface Secret {
    id?: string;
    name?: string;
    type?: SecretType;
    username?: string;
    password?: string;
    url?: string;
    notes?: string;
    createdAt?: number;
    updatedAt?: number;
}

export interface SecretRequest {
    id?: string;
}

export interface SecretResponse {
    secret?: Secret;
}

export interface SecretSaveRequest {
    secret?: Secret;
}

export interface SecretSaveResponse {
    secret?: Secret;
}

export interface SecretRemoveRequest {
    id?: string;
}

export interface SecretRemoveResponse {
}

export interface SecretsRequest {
    query?: string;
    sortField?: string;
    sortDirection?: SortDirection;
}

export interface SecretsResponse {
    secrets?: Array<Secret>;
    sortField?: string;
    sortDirection?: SortDirection;
}

export interface ItemRequest {
    id?: string;
}

export interface ItemResponse {
    item?: Item;
}

export interface ItemsRequest {
    query?: string;
}

export interface ItemsResponse {
    items?: Array<Item>;
}

export interface Item {
    id?: string;
    type?: string;
}

export interface RandRequest {
    numBytes?: number;
    encoding?: Encoding;
}

export interface RandResponse {
    data?: string;
}

export interface RandPasswordRequest {
    length?: number;
}

export interface RandPasswordResponse {
    password?: string;
}

export interface PullRequest {
    identity?: string;
}

export interface PullResponse {
    kids?: Array<string>;
}

export interface PushRequest {
    identity?: string;
    remoteCheck?: boolean;
}

export interface PushResponse {
    kid?: string;
    urls?: Array<string>;
}

export interface Collection {
    path?: string;
}

export interface CollectionsRequest {
    path?: string;
}

export interface CollectionsResponse {
    collections?: Array<Collection>;
}

export interface Document {
    path?: string;
    value?: string;
    createdAt?: number;
    updatedAt?: number;
}

export interface DocumentsRequest {
    path?: string;
    prefix?: string;
}

export interface DocumentsResponse {
    documents?: Array<Document>;
}

export interface DocumentDeleteRequest {
    path?: string;
}

export interface DocumentDeleteResponse {
}

export interface User {
    id?: string;
    name?: string;
    kid?: string;
    seq?: number;
    service?: string;
    url?: string;
    status?: UserStatus;
    verifiedAt?: number;
    timestamp?: number;
    err?: string;
}

export interface UserRequest {
    kid?: string;
    local?: boolean;
}

export interface UserResponse {
    user?: User;
}

export interface UserSearchRequest {
    query?: string;
    limit?: number;
    local?: boolean;
}

export interface UserSearchResponse {
    users?: Array<User>;
}

export interface SearchRequest {
    query?: string;
}

export interface SearchResponse {
    keys?: Array<Key>;
}

export interface WormholeInput {
    sender?: string;
    recipient?: string;
    invite?: string;
    id?: string;
    data?: Uint8Array;
    type?: ContentType;
}

export interface WormholeOutput {
    message?: Message;
    status?: WormholeStatus;
}

export interface Message {
    id?: string;
    sender?: Key;
    recipient?: Key;
    type?: MessageType;
    content?: Content;
    createdAt?: number;
    timeDisplay?: string;
    dateDisplay?: string;
}

export interface Content {
    data?: Uint8Array;
    type?: ContentType;
}

export interface MessagePrepareRequest {
    sender?: string;
    recipient?: string;
    text?: string;
}

export interface MessagePrepareResponse {
    message?: Message;
}

export interface MessageCreateRequest {
    sender?: string;
    recipient?: string;
    text?: string;
}

export interface MessageCreateResponse {
    message?: Message;
}

export interface MessagesRequest {
    sender?: string;
    recipient?: string;
}

export interface MessagesResponse {
    messages?: Array<Message>;
}

export interface AdminSignURLRequest {
    signer?: string;
    method?: string;
    url?: string;
}

export interface AdminSignURLResponse {
    auth?: string;
    url?: string;
    curl?: string;
}

export interface AdminCheckRequest {
    signer?: string;
    kid?: string;
}

export interface AdminCheckResponse {
}

export interface GitImportRequest {
    url?: string;
    keyPath?: string;
}

export interface GitImportResponse {
}

export interface GitCloneRequest {
    url?: string;
    keyPath?: string;
}

export interface GitCloneResponse {
}

export interface BackupRequest {
}

export interface BackupResponse {
    path?: string;
}

export interface RestoreRequest {
    path?: string;
}

export interface RestoreResponse {
}

export interface KeysService {
    KeyGenerate: (r:KeyGenerateRequest) => KeyGenerateResponse;
    Keys: (r:KeysRequest) => KeysResponse;
    Key: (r:KeyRequest) => KeyResponse;
    KeyImport: (r:KeyImportRequest) => KeyImportResponse;
    KeyExport: (r:KeyExportRequest) => KeyExportResponse;
    KeyRemove: (r:KeyRemoveRequest) => KeyRemoveResponse;
    Sign: (r:SignRequest) => SignResponse;
    SignFile: (r:() => {value: SignFileInput, done: boolean}, cb:(a:{value: SignFileOutput, done: boolean}) => void) => void;
    SignStream: (r:() => {value: SignInput, done: boolean}, cb:(a:{value: SignOutput, done: boolean}) => void) => void;
    Verify: (r:VerifyRequest) => VerifyResponse;
    VerifyFile: (r:() => {value: VerifyFileInput, done: boolean}, cb:(a:{value: VerifyFileOutput, done: boolean}) => void) => void;
    VerifyStream: (r:() => {value: VerifyInput, done: boolean}, cb:(a:{value: VerifyOutput, done: boolean}) => void) => void;
    VerifyArmoredStream: (r:() => {value: VerifyInput, done: boolean}, cb:(a:{value: VerifyOutput, done: boolean}) => void) => void;
    VerifyDetached: (r:VerifyDetachedRequest) => VerifyDetachedResponse;
    VerifyDetachedFile: (r:() => {value: VerifyDetachedFileInput, done: boolean}) => VerifyDetachedResponse;
    VerifyDetachedStream: (r:() => {value: VerifyDetachedInput, done: boolean}) => VerifyDetachedResponse;
    Encrypt: (r:EncryptRequest) => EncryptResponse;
    EncryptStream: (r:() => {value: EncryptInput, done: boolean}, cb:(a:{value: EncryptOutput, done: boolean}) => void) => void;
    EncryptFile: (r:() => {value: EncryptFileInput, done: boolean}, cb:(a:{value: EncryptFileOutput, done: boolean}) => void) => void;
    Decrypt: (r:DecryptRequest) => DecryptResponse;
    DecryptFile: (r:() => {value: DecryptFileInput, done: boolean}, cb:(a:{value: DecryptFileOutput, done: boolean}) => void) => void;
    DecryptStream: (r:() => {value: DecryptInput, done: boolean}, cb:(a:{value: DecryptOutput, done: boolean}) => void) => void;
    DecryptArmoredStream: (r:() => {value: DecryptInput, done: boolean}, cb:(a:{value: DecryptOutput, done: boolean}) => void) => void;
    SigncryptOpenStream: (r:() => {value: DecryptInput, done: boolean}, cb:(a:{value: DecryptOutput, done: boolean}) => void) => void;
    SigncryptOpenArmoredStream: (r:() => {value: DecryptInput, done: boolean}, cb:(a:{value: DecryptOutput, done: boolean}) => void) => void;
    Sigchain: (r:SigchainRequest) => SigchainResponse;
    Statement: (r:StatementRequest) => StatementResponse;
    StatementCreate: (r:StatementCreateRequest) => StatementCreateResponse;
    StatementRevoke: (r:StatementRevokeRequest) => StatementRevokeResponse;
    User: (r:UserRequest) => UserResponse;
    UserSearch: (r:UserSearchRequest) => UserSearchResponse;
    UserService: (r:UserServiceRequest) => UserServiceResponse;
    UserSign: (r:UserSignRequest) => UserSignResponse;
    UserAdd: (r:UserAddRequest) => UserAddResponse;
    Search: (r:SearchRequest) => SearchResponse;
    Secret: (r:SecretRequest) => SecretResponse;
    SecretSave: (r:SecretSaveRequest) => SecretSaveResponse;
    SecretRemove: (r:SecretRemoveRequest) => SecretRemoveResponse;
    Secrets: (r:SecretsRequest) => SecretsResponse;
    Item: (r:ItemRequest) => ItemResponse;
    Items: (r:ItemsRequest) => ItemsResponse;
    Pull: (r:PullRequest) => PullResponse;
    Push: (r:PushRequest) => PushResponse;
    Wormhole: (r:() => {value: WormholeInput, done: boolean}, cb:(a:{value: WormholeOutput, done: boolean}) => void) => void;
    AuthSetup: (r:AuthSetupRequest) => AuthSetupResponse;
    AuthUnlock: (r:AuthUnlockRequest) => AuthUnlockResponse;
    AuthLock: (r:AuthLockRequest) => AuthLockResponse;
    RuntimeStatus: (r:RuntimeStatusRequest) => RuntimeStatusResponse;
    Rand: (r:RandRequest) => RandResponse;
    RandPassword: (r:RandPasswordRequest) => RandPasswordResponse;
    Restore: (r:RestoreRequest) => RestoreResponse;
    AuthProvision: (r:AuthProvisionRequest) => AuthProvisionResponse;
    AuthDeprovision: (r:AuthDeprovisionRequest) => AuthDeprovisionResponse;
    AuthProvisions: (r:AuthProvisionsRequest) => AuthProvisionsResponse;
    Backup: (r:BackupRequest) => BackupResponse;
    Collections: (r:CollectionsRequest) => CollectionsResponse;
    Documents: (r:DocumentsRequest) => DocumentsResponse;
    DocumentDelete: (r:DocumentDeleteRequest) => DocumentDeleteResponse;
    AdminSignURL: (r:AdminSignURLRequest) => AdminSignURLResponse;
    AdminCheck: (r:AdminCheckRequest) => AdminCheckResponse;
    MessagePrepare: (r:MessagePrepareRequest) => MessagePrepareResponse;
    MessageCreate: (r:MessageCreateRequest) => MessageCreateResponse;
    Messages: (r:MessagesRequest) => MessagesResponse;
}
