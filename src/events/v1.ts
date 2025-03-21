import type {
  Channel as ApiChannel,
  Emoji as ApiEmoji,
  Error,
  FieldsChannel,
  FieldsMember,
  FieldsServer,
  FieldsUser,
  Member,
  MemberCompositeKey,
  Message as ApiMessage,
  RelationshipStatus,
  Role,
  Server as ApiServer,
  User as ApiUser,
} from "revolt-api";

import { Client, Relationship, Server, Channel, Message, Group, TextBasedChannel } from "..";

/**
 * Version 1 of the events protocol
 */
export type ProtocolV1 = {
  client: ClientMessage;
  server: ServerMessage;
};

/**
 * Messages sent to the server
 */
type ClientMessage =
  | { type: "Authenticate"; token: string }
  | {
      type: "BeginTyping";
      channel: string;
    }
  | {
      type: "EndTyping";
      channel: string;
    }
  | {
      type: "Ping";
      data: number;
    }
  | {
      type: "Pong";
      data: number;
    };

export enum ServerEventType {
  Error = "Error",
  Bulk = "Bulk",
  Authenticated = "Authenticated",
  Ready = "Ready",
  Ping = "Ping",
  Pong = "Pong",
  Message = "Message",
  MessageUpdate = "MessageUpdate",
  MessageAppend = "MessageAppend",
  MessageDelete = "MessageDelete",
  MessageReact = "MessageReact",
  MessageUnreact = "MessageUnreact",
  MessageRemoveReaction = "MessageRemoveReaction",
  ChannelCreate = "ChannelCreate",
  ChannelUpdate = "ChannelUpdate",
  ChannelDelete = "ChannelDelete",
  ChannelGroupJoin = "ChannelGroupJoin",
  ChannelGroupLeave = "ChannelGroupLeave",
  ChannelStartTyping = "ChannelStartTyping",
  ChannelStopTyping = "ChannelStopTyping",
  ChannelAck = "ChannelAck",
  ServerCreate = "ServerCreate",
  ServerUpdate = "ServerUpdate",
  ServerDelete = "ServerDelete",
  ServerMemberUpdate = "ServerMemberUpdate",
  ServerMemberJoin = "ServerMemberJoin",
  ServerMemberLeave = "ServerMemberLeave",
  ServerRoleUpdate = "ServerRoleUpdate",
  ServerRoleDelete = "ServerRoleDelete",
  UserUpdate = "UserUpdate",
  UserRelationship = "UserRelationship",
  UserPresence = "UserPresence",
  UserSettingsUpdate = "UserSettingsUpdate",
  UserPlatformWipe = "UserPlatformWipe",
  EmojiCreate = "EmojiCreate",
  EmojiDelete = "EmojiDelete",
  Auth = "Auth",
}

/**
 * Messages sent from the server
 */
type ServerMessage =
  | { type: "Error"; data: Error }
  | { type: "Bulk"; v: ServerMessage[] }
  | { type: "Authenticated" }
  | ({ type: "Ready" } & ReadyData)
  | { type: "Ping"; data: number }
  | { type: "Pong"; data: number }
  | ({ type: "Message" } & ApiMessage)
  | {
      type: "MessageUpdate";
      id: string;
      channel: string;
      data: Partial<ApiMessage>;
    }
  | {
      type: "MessageAppend";
      id: string;
      channel: string;
      append: Pick<Partial<ApiMessage>, "embeds">;
    }
  | { type: "MessageDelete"; id: string; channel: string }
  | {
      type: "MessageReact";
      id: string;
      channel_id: string;
      user_id: string;
      emoji_id: string;
    }
  | {
      type: "MessageUnreact";
      id: string;
      channel_id: string;
      user_id: string;
      emoji_id: string;
    }
  | {
      type: "MessageRemoveReaction";
      id: string;
      channel_id: string;
      emoji_id: string;
    }
  | { type: "BulkMessageDelete"; channel: string; ids: string[] }
  | ({ type: "ChannelCreate" } & ApiChannel)
  | {
      type: "ChannelUpdate";
      id: string;
      data: Partial<ApiChannel>;
      clear?: FieldsChannel[];
    }
  | { type: "ChannelDelete"; id: string }
  | { type: "ChannelGroupJoin"; id: string; user: string }
  | { type: "ChannelGroupLeave"; id: string; user: string }
  | { type: "ChannelStartTyping"; id: string; user: string }
  | { type: "ChannelStopTyping"; id: string; user: string }
  | { type: "ChannelAck"; id: string; user: string; message_id: string }
  | {
      type: "ServerCreate";
      id: string;
      server: ApiServer;
      channels: ApiChannel[];
    }
  | {
      type: "ServerUpdate";
      id: string;
      data: Partial<ApiServer>;
      clear?: FieldsServer[];
    }
  | { type: "ServerDelete"; id: string }
  | {
      type: "ServerMemberUpdate";
      id: MemberCompositeKey;
      data: Partial<Member>;
      clear?: FieldsMember[];
    }
  | { type: "ServerMemberJoin"; id: string; user: string }
  | { type: "ServerMemberLeave"; id: string; user: string }
  | {
      type: "ServerRoleUpdate";
      id: string;
      role_id: string;
      data: Partial<Role>;
    }
  | { type: "ServerRoleDelete"; id: string; role_id: string }
  | {
      type: "UserUpdate";
      id: string;
      data: Partial<ApiUser>;
      clear?: FieldsUser[];
    }
  | { type: "UserRelationship"; user: ApiUser; status: RelationshipStatus }
  | { type: "UserPresence"; id: string; online: boolean }
  | {
      type: "UserSettingsUpdate";
      id: string;
      update: { [key: string]: [number, string] };
    }
  | { type: "UserPlatformWipe"; user_id: string; flags: number }
  | ({ type: "EmojiCreate" } & ApiEmoji)
  | { type: "EmojiDelete"; id: string }
  | ({
      type: "Auth";
    } & (
      | {
          event_type: "DeleteSession";
          user_id: string;
          session_id: string;
        }
      | {
          event_type: "DeleteAllSessions";
          user_id: string;
          exclude_session_id: string;
        }
    ));

/**
 * Initial synchronisation packet
 */
type ReadyData = {
  users: ApiUser[];
  servers: ApiServer[];
  channels: ApiChannel[];
  members: Member[];
  emojis: ApiEmoji[];
};

/**
 * Handle an event for the Client
 * @param client Client
 * @param event Event
 * @param setReady Signal state change
 */
export async function handleEvent(client: Client, event: ServerMessage, setReady: (value: boolean) => void) {
  if (client.options.debug) {
    console.debug("[S->C]", event);
  }

  switch (event.type) {
    case "Bulk": {
      for (const item of event.v) {
        handleEvent(client, item, setReady);
      }
      break;
    }
    case "Ready": {
      for (const user of event.users) {
        const u = client.users.create(user);

        if (u.relationship == Relationship.User) {
          client.user = u;
        }
      }

      for (const server of event.servers) {
        client.servers.create(server);
      }

      for (const member of event.members) {
        const server = client.servers.resolve(member._id.server);
        server && server.members.create(member);
      }

      for (const channel of event.channels) {
        client.channels.create(channel);
      }

      for (const emoji of event.emojis) {
        client.emojis.create(emoji);
      }

      if (client.options.syncUnreads) {
        await client.channelUnreads.sync();
      }

      setReady(true);
      client.emit("ready");

      break;
    }
    case "Message": {
      if (!client.messages.cache.has(event._id)) {
        if (event.member) {
          const server = client.servers.resolve(event.member._id.server);
          server && server.members.create(event.member);
        }

        if (event.user) {
          client.users.create(event.user);
        }

        // Prevents double creation
        delete event.member;
        delete event.user;

        client.messages.create(event, true);

        const channel = client.channels.resolve(event.channel);
        if (channel) {
          channel.lastMessageId = event._id;
        }
      }
      break;
    }
    case "MessageUpdate": {
      const message = client.messages.cache.get(event.id);
      if (message) {
        const previousMessage = message.clone();
        const editedMessage = message.update(event.data);

        client.emit("messageUpdate", editedMessage, previousMessage);
      }
      break;
    }
    case "MessageAppend": {
      const message = client.messages.cache.get(event.id);
      if (message) {
        const previousMessage = message.clone();
        if (event.append.embeds) message.addEmbeds(...event.append.embeds);

        client.emit("messageUpdate", message, previousMessage);
      }
      break;
    }
    case "MessageDelete": {
      const message = client.messages._remove(event.id);
      message && client.emit("messageDelete", message);
      break;
    }
    case "BulkMessageDelete": {
      client.emit(
        "messageDeleteBulk",
        event.ids.map((id) => client.messages._remove(id)).filter((x) => x) as Message[],
        client.channels.cache.get(event.channel),
      );
      break;
    }
    case "MessageReact": {
      const message = client.messages.cache.get(event.id);
      if (message) {
        const reactions = message.reactions;
        const set = reactions.get(event.emoji_id);
        if (set) {
          if (set.has(event.user_id)) return;
          set.add(event.user_id);
        } else {
          reactions.set(event.emoji_id, new Set([event.user_id]));
        }

        client.emit("messageReactionAdd", message, event.user_id, event.emoji_id);
      }
      break;
    }
    case "MessageUnreact": {
      const message = client.messages.cache.get(event.id);
      if (message) {
        const set = message.reactions.get(event.emoji_id);
        if (set?.has(event.user_id)) {
          set.delete(event.user_id);
        }

        client.emit("messageReactionRemove", message, event.user_id, event.emoji_id);
      }
      break;
    }
    case "MessageRemoveReaction": {
      const message = client.messages.cache.get(event.id);
      if (message) {
        const reactions = message.reactions;
        if (reactions.has(event.emoji_id)) {
          reactions.delete(event.emoji_id);
        }

        client.emit("messageReactionRemoveEmoji", message, event.emoji_id);
      }
      break;
    }
    case "ChannelCreate": {
      if (!client.channels.cache.has(event._id)) {
        client.channels._add(Channel.from(client, event));
      }
      break;
    }
    case "ChannelUpdate": {
      const channel = client.channels.cache.get(event.id);
      if (channel) {
        const previousChannel = channel.clone();

        let changes: Record<string, any> = Object.assign({}, event.data);
        if (event.clear) {
          for (const remove of event.clear) {
            switch (remove) {
              case "Description":
                changes["description"] = null;
                break;
              case "DefaultPermissions":
                changes["defaultPermissions"] = null;
                break;
              case "Icon":
                changes["icon"] = null;
                break;
            }
          }
        }

        client.channels.updateItem(event.id, changes);
        client.emit("channelUpdate", channel, previousChannel);
      }
      break;
    }
    case "ChannelDelete": {
      const channel = client.channels._remove(event.id);
      channel && client.emit("channelDelete", channel);
      break;
    }
    case "ChannelGroupJoin": {
      const channel = client.channels.resolve(event.id) as Group;
      if (channel) {
        if (!channel.recipientIds.has(event.user)) {
          channel.recipientIds.add(event.user);
        }

        client.emit("channelGroupJoin", channel, await client.users.fetch(event.user));
      }
      break;
    }
    case "ChannelGroupLeave": {
      const channel = client.channels.resolve(event.id) as Group;
      if (channel) {
        if (channel.recipientIds.has(event.user)) {
          channel.recipientIds.delete(event.user);
        }

        client.emit("channelGroupLeave", channel, client.users.resolve(event.user)!);
      }
      break;
    }
    case "ChannelStartTyping": {
      const channel = client.channels.resolve(event.id) as TextBasedChannel;
      if (channel) {
        if (!channel.typingIds.has(event.user)) {
          channel.typingIds.add(event.user);
        }
        const user = client.users.resolve(event.user);
        user && client.emit("channelStartTyping", channel, user);
      }
      break;
    }
    case "ChannelStopTyping": {
      const channel = client.channels.resolve(event.id) as TextBasedChannel;
      if (channel) {
        if (channel.typingIds.has(event.user)) {
          channel.typingIds.delete(event.user);
        }

        client.emit("channelStopTyping", channel, client.users.resolve(event.user)!);
      }
      break;
    }
    case "ChannelAck": {
      const channel = client.channels.resolve(event.id);
      if (channel) {
        client.emit("channelAcknowledged", channel, event.message_id);
      }
      break;
    }
    case "ServerCreate": {
      if (!client.servers.cache.has(event.server._id)) {
        client.servers._add(new Server(client, event.server));
        for (const channel of event.channels) {
          client.channels._add(new Channel(client, channel));
        }
      }
      break;
    }
    case "ServerUpdate": {
      const server = client.servers.resolve(event.id);
      if (server) {
        const previousServer = server.clone();

        const changes = event.data;

        if (event.clear) {
          for (const remove of event.clear) {
            switch (remove) {
              case "Banner":
                changes["banner"] = null;
                break;
              case "Categories":
                changes["categories"] = null;
                break;
              case "SystemMessages":
                changes["system_messages"] = null;
                break;
              case "Description":
                changes["description"] = null;
                break;
              case "Icon":
                changes["icon"] = null;
                break;
            }
          }
        }

        const updatedServer = server.update(changes);
        client.emit("serverUpdate", updatedServer, previousServer);
      }
      break;
    }
    case "ServerDelete": {
      client.servers._remove(event.id);
      // emit?
      break;
    }
    case "ServerRoleUpdate": {
      const server = client.servers.resolve(event.id);
      if (server) {
        const role = server.roles.cache.get(event.role_id);
        if (role) {
          const updatedRole = role.update(event.data);
          client.emit("serverRoleUpdate", server, event.role_id, updatedRole);
        }
      }
      break;
    }
    case "ServerRoleDelete": {
      const server = client.servers.resolve(event.id);
      if (server) {
        const role = server.roles._remove(event.role_id);
        role && client.emit("serverRoleDelete", server, event.role_id, role);
      }
      break;
    }
    case "ServerMemberJoin": {
      const server = client.servers.resolve(event.id);
      const userId = event.user;

      if (server && !server?.members.cache.has(userId)) {
        await client.users.fetch(userId);
        client.emit(
          "serverMemberJoin",
          server.members.create({
            _id: {
              server: event.id,
              user: userId,
            },
            joined_at: new Date().toUTCString(),
          }),
        );
      }
      break;
    }
    case "ServerMemberUpdate": {
      const { user: userId, server: serverId } = event.id;
      const server = client.servers.resolve(serverId);
      const member = server?.members.resolve(userId);
      if (member) {
        const previousMember = member.clone();

        const changes = event.data;

        if (event.clear) {
          for (const remove of event.clear) {
            switch (remove) {
              case "Nickname":
                changes["nickname"] = null;
                break;
              case "Avatar":
                changes["avatar"] = null;
                break;
              case "Roles":
                changes["roles"] = [];
                break;
              case "Timeout":
                changes["timeout"] = null;
                break;
            }
          }
        }

        const updatedMember = member.update(changes);

        client.emit("serverMemberUpdate", updatedMember, previousMember);
      }
      break;
    }
    case "ServerMemberLeave": {
      if (event.user == client.user!.id) {
        handleEvent(
          client,
          {
            type: "ServerDelete",
            id: event.id,
          },
          setReady,
        );

        return;
      }

      const server = client.servers.resolve(event.id);
      const userId = event.user;
      const member = server?.members.resolve(userId);
      if (member) {
        client.emit("serverMemberLeave", member);
        server?.members._remove(userId);
      }
      break;
    }
    case "UserUpdate": {
      const user = client.users.resolve(event.id);
      if (user) {
        const previousUser = user.clone();
        const changes = event.data;

        if (event.clear) {
          for (const remove of event.clear) {
            switch (remove) {
              case "Avatar":
                changes["avatar"] = null;
                break;
              case "StatusPresence":
                changes["status"] = {
                  ...(previousUser.status ?? {}),
                  ...(changes["status"] ?? {}),
                  presence: null,
                };
                break;
              case "StatusText":
                changes["status"] = {
                  ...(previousUser.status ?? {}),
                  ...(changes["status"] ?? {}),
                  text: null,
                };
                break;
            }
          }
        }

        client.emit("userUpdate", user.update(changes), previousUser);
      }
      break;
    }
    case "UserRelationship": {
      handleEvent(
        client,
        {
          type: "UserUpdate",
          id: event.user._id,
          data: {
            relationship: event.user.relationship!,
          },
        },
        setReady,
      );
      break;
    }
    case "UserPresence": {
      handleEvent(
        client,
        {
          type: "UserUpdate",
          id: event.id,
          data: {
            online: event.online,
          },
        },
        setReady,
      );
      break;
    }
    case "UserSettingsUpdate": {
      client.emit("userSettingsUpdate", event.id, event.update);
      break;
    }
    case "UserPlatformWipe": {
      handleEvent(
        client,
        {
          type: "BulkMessageDelete",
          channel: "0",
          ids: client.messages.cache
            .filter((message) => message.user?.id == event.user_id)
            .map((message) => message.id),
        },
        setReady,
      );

      handleEvent(
        client,
        {
          type: "UserUpdate",
          id: event.user_id,
          data: {
            username: `Deleted User`,
            online: false,
            flags: event.flags,
            badges: 0,
            relationship: "None",
          },
          clear: ["Avatar", "StatusPresence", "StatusText"],
        },
        setReady,
      );

      break;
    }
    case "EmojiCreate": {
      if (!client.emojis.cache.has(event._id)) {
        client.emojis.create(event);
        // emit?
      }
      break;
    }
    case "EmojiDelete": {
      if (client.emojis.resolve(event.id)) {
        const emoji = client.emojis._remove(event.id);
        emoji && client.emit("emojiDelete", emoji);
      }
      break;
    }
    case "Auth": {
      // TODO: implement DeleteSession and DeleteAllSessions
      break;
    }
  }
}
