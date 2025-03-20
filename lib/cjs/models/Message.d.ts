import { Client, MessageEmbed, User } from "..";
import { Message as ApiMessage, Embed } from "revolt-api";
import { Base } from "./Base";
import { ServerMember } from "./ServerMember";
export declare class Message extends Base {
    readonly id: string;
    content: string | null;
    readonly channelId: string;
    editedAt: Date | null;
    embeds: MessageEmbed[] | null;
    readonly member: ServerMember | null | undefined;
    pinned: boolean;
    readonly reactions: Map<string, Set<string>>;
    readonly userId: string | null;
    readonly user: User | null;
    constructor(client: Client, data: ApiMessage);
    addEmbeds(...embeds: Embed[]): void;
    get channel(): import("./Channel").Channel | null;
    get server(): import("./Server").Server | null;
    update(data: Partial<ApiMessage>): this;
}
/**
 * [Message Flags](https://docs.rs/revolt-models/latest/revolt_models/v0/enum.MessageFlags.html)
 */
export declare enum MessageFlags {
    SupressNotifications = 1
}
//# sourceMappingURL=Message.d.ts.map