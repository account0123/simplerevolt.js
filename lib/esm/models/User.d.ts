import { Client } from "..";
import { User as ApiUser, DataEditUser, RelationshipStatus, UserStatus } from "revolt-api";
import { Base } from "./Base";
export declare enum UserFlags {
    Suspended = 1,
    Deleted = 2,
    Banned = 4,
    Spam = 8
}
export declare enum UserBadges {
    Developer = 1,
    Translator = 2,
    Supporter = 4,
    ResponsibleDisclosure = 8,
    Founder = 16,
    PlatformModeration = 32,
    ActiveSupporter = 64,
    Paw = 128,
    EarlyAdopter = 256,
    ReservedRelevantJokeBadge1 = 512,
    ReservedRelevantJokeBadge2 = 1024
}
export declare enum Relationship {
    None = "None",
    User = "User",
    Friend = "Friend",
    Outgoing = "Outgoing",
    Incoming = "Incoming",
    Blocked = "Blocked",
    BlockedOther = "BlockedOther"
}
export declare class User extends Base {
    readonly id: string;
    displayName: string;
    discriminator: string;
    flags: number;
    badges: number;
    username: string;
    readonly isOnline: boolean;
    privileged: boolean;
    readonly ownerId: string | null;
    status: UserStatus | null;
    readonly relationship: RelationshipStatus;
    constructor(client: Client, data: ApiUser);
    /**
     * Edits the user
     */
    edit(data: DataEditUser): Promise<{
        channel_type: "SavedMessages";
        _id: string;
        user: string;
    } | {
        channel_type: "DirectMessage";
        _id: string;
        active: boolean;
        recipients: string[];
        last_message_id?: string | null;
    } | {
        channel_type: "Group";
        _id: string;
        name: string;
        owner: string;
        description?: string | null;
        recipients: string[];
        icon?: import("revolt-api/dist/schema").components["schemas"]["File"] | null;
        last_message_id?: string | null;
        permissions?: number | null;
        nsfw?: boolean;
    } | {
        channel_type: "TextChannel";
        _id: string;
        server: string;
        name: string;
        description?: string | null;
        icon?: import("revolt-api/dist/schema").components["schemas"]["File"] | null;
        last_message_id?: string | null;
        default_permissions?: import("revolt-api/dist/schema").components["schemas"]["OverrideField"] | null;
        role_permissions?: {
            [key: string]: import("revolt-api/dist/schema").components["schemas"]["OverrideField"];
        };
        nsfw?: boolean;
    } | {
        channel_type: "VoiceChannel";
        _id: string;
        server: string;
        name: string;
        description?: string | null;
        icon?: import("revolt-api/dist/schema").components["schemas"]["File"] | null;
        default_permissions?: import("revolt-api/dist/schema").components["schemas"]["OverrideField"] | null;
        role_permissions?: {
            [key: string]: import("revolt-api/dist/schema").components["schemas"]["OverrideField"];
        };
        nsfw?: boolean;
    } | {
        _id: string;
        username: string;
        discriminator: string;
        display_name?: string | null;
        avatar?: import("revolt-api/dist/schema").components["schemas"]["File"] | null;
        relations?: import("revolt-api/dist/schema").components["schemas"]["Relationship"][];
        badges?: number;
        status?: import("revolt-api/dist/schema").components["schemas"]["UserStatus"] | null;
        flags?: number;
        privileged?: boolean;
        bot?: import("revolt-api/dist/schema").components["schemas"]["BotInformation"] | null;
        relationship: import("revolt-api/dist/schema").components["schemas"]["RelationshipStatus"];
        online: boolean;
    } | {
        user: import("revolt-api/dist/schema").components["schemas"]["User"];
        _id: string;
        owner: string;
        token: string;
        public: boolean;
        analytics?: boolean;
        discoverable?: boolean;
        interactions_url?: string;
        terms_of_service_url?: string;
        privacy_policy_url?: string;
        flags?: number;
    } | {
        _id: string;
        owner: string;
        name: string;
        description?: string | null;
        channels: string[];
        categories?: import("revolt-api/dist/schema").components["schemas"]["Category"][] | null;
        system_messages?: import("revolt-api/dist/schema").components["schemas"]["SystemMessageChannels"] | null;
        roles?: {
            [key: string]: import("revolt-api/dist/schema").components["schemas"]["Role"];
        };
        default_permissions: number;
        icon?: import("revolt-api/dist/schema").components["schemas"]["File"] | null;
        banner?: import("revolt-api/dist/schema").components["schemas"]["File"] | null;
        flags?: number;
        nsfw?: boolean;
        analytics?: boolean;
        discoverable?: boolean;
    }>;
    get bot(): boolean;
    /**
     * Permissions against this user
     */
    get permission(): number;
    toString(): string;
    update(data: Partial<ApiUser>): this;
}
//# sourceMappingURL=User.d.ts.map