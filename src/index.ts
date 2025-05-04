import type { Channel } from "./models/Channel.js";
import type { Message } from "./models/Message.js";
import type { ServerMember } from "./models/ServerMember.js";
import type { User } from "./models/User.js";

export type AllowedPartial = User | Channel | ServerMember | Message;
// TODO: Implement partial models
export type Partialize<
  PartialType extends AllowedPartial,
  NulledKeys extends keyof PartialType | null = null,
  NullableKeys extends keyof PartialType | null = null,
  OverridableKeys extends keyof PartialType | "" = "",
> = {
  [K in keyof Omit<PartialType, OverridableKeys>]: K extends "partial"
    ? true
    : K extends NulledKeys
      ? null
      : K extends NullableKeys
        ? PartialType[K] | null
        : PartialType[K];
};

export * as API from "revolt-api";

// Collections
export { BotCollection } from "./collections/BotCollection.js";
export { ChannelCollection, ChannelCollectionInServer } from "./collections/ChannelCollection.js";
export { ChannelUnreadCollection } from "./collections/ChannelUnreadCollection.js";
export { ChannelWebhookCollection } from "./collections/ChannelWebhookCollection.js";
export { EmojiCollection } from "./collections/EmojiCollection.js";
export { MessageCollection } from "./collections/MessageCollection.js";
export { PermissionOverrideCollection } from "./collections/PermissionOverrideCollection.js";
export { RoleCollection } from "./collections/RoleCollection.js";
export { ServerCategoryCollection } from "./collections/ServerCategoryCollection.js";
export { ServerCollection } from "./collections/ServerCollection.js";
export { ServerMemberCollection } from "./collections/ServerMemberCollection.js";
export { UserCollection } from "./collections/UserCollection.js";

// Errors
export { ErrorCodes, Messages } from "./errors/ErrorCodes.js";
export { RevoltAPIError } from "./errors/RevoltAPIError.js";
export { RJSError } from "./errors/RJSError.js";

// Events
export { handleEvent } from "./events/v1.js";
export { ConnectionState, EventClient } from "./events/EventClient.js";

// Models
export { OwnedBot, PublicBot } from "./models/Bot.js";
export { Channel, TextBasedChannel } from "./models/Channel.js";
export { ChannelUnread } from "./models/ChannelUnread.js";
export { ChannelWebhook } from "./models/ChannelWebhook.js";
export { ClientUser } from "./models/ClientUser.js";
export { DMChannel } from "./models/DMChannel.js";
export { Emoji } from "./models/Emoji.js";
export { AutumnFile } from "./models/File.js";
export { Group } from "./models/GroupChannel.js";
export { GroupInvite, GroupFullInvite, ServerInvite, ServerFullInvite } from "./models/Invite.js";
export { Message } from "./models/Message.js";
export { ImageEmbed, VideoEmbed, TextEmbed, UnknownEmbed, WebsiteEmbed } from "./models/MessageEmbed.js";
export { MessageReactions } from "./models/MessageReactions.js";
export { Role } from "./models/Role.js";
export { Server } from "./models/Server.js";
export { Category } from "./models/ServerCategory.js";
export { TextChannel, VoiceChannel } from "./models/ServerChannel.js";
export { ServerMember } from "./models/ServerMember.js";
export { SyncSettings } from "./models/SyncSettings.js";
export { User } from "./models/User.js";
export { UserProfile } from "./models/UserProfile.js";

// Permissions
export { BitField } from "./utils/BitField.js";
export type { RecursiveReadonlyArray, BitFieldResolvable } from "./utils/BitField.js";
export { PermissionsBitField } from "./permissions/PermissionsBitField.js";
export { PermissionOverrides } from "./permissions/PermissionOverrides.js";
export {
  Permission,
  UserPermission,
  U32_MAX,
  DEFAULT_PERMISSION,
  DEFAULT_PERMISSION_SAVED_MESSAGES,
  DEFAULT_PERMISSION_DIRECT_MESSAGE,
  DEFAULT_PERMISSION_SERVER,
  DEFAULT_PERMISSION_VIEW_ONLY,
} from "./permissions/index.js";

// Regex
export { RE_CHANNELS, RE_MENTIONS, RE_SPOILER } from "./regex.js";

// Client
export { Client } from "./Client.js";
