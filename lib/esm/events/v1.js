import { Relationship, Server, Channel } from "..";
export var ServerEventType;
(function (ServerEventType) {
    ServerEventType["Error"] = "Error";
    ServerEventType["Bulk"] = "Bulk";
    ServerEventType["Authenticated"] = "Authenticated";
    ServerEventType["Ready"] = "Ready";
    ServerEventType["Ping"] = "Ping";
    ServerEventType["Pong"] = "Pong";
    ServerEventType["Message"] = "Message";
    ServerEventType["MessageUpdate"] = "MessageUpdate";
    ServerEventType["MessageAppend"] = "MessageAppend";
    ServerEventType["MessageDelete"] = "MessageDelete";
    ServerEventType["MessageReact"] = "MessageReact";
    ServerEventType["MessageUnreact"] = "MessageUnreact";
    ServerEventType["MessageRemoveReaction"] = "MessageRemoveReaction";
    ServerEventType["ChannelCreate"] = "ChannelCreate";
    ServerEventType["ChannelUpdate"] = "ChannelUpdate";
    ServerEventType["ChannelDelete"] = "ChannelDelete";
    ServerEventType["ChannelGroupJoin"] = "ChannelGroupJoin";
    ServerEventType["ChannelGroupLeave"] = "ChannelGroupLeave";
    ServerEventType["ChannelStartTyping"] = "ChannelStartTyping";
    ServerEventType["ChannelStopTyping"] = "ChannelStopTyping";
    ServerEventType["ChannelAck"] = "ChannelAck";
    ServerEventType["ServerCreate"] = "ServerCreate";
    ServerEventType["ServerUpdate"] = "ServerUpdate";
    ServerEventType["ServerDelete"] = "ServerDelete";
    ServerEventType["ServerMemberUpdate"] = "ServerMemberUpdate";
    ServerEventType["ServerMemberJoin"] = "ServerMemberJoin";
    ServerEventType["ServerMemberLeave"] = "ServerMemberLeave";
    ServerEventType["ServerRoleUpdate"] = "ServerRoleUpdate";
    ServerEventType["ServerRoleDelete"] = "ServerRoleDelete";
    ServerEventType["UserUpdate"] = "UserUpdate";
    ServerEventType["UserRelationship"] = "UserRelationship";
    ServerEventType["UserPresence"] = "UserPresence";
    ServerEventType["UserSettingsUpdate"] = "UserSettingsUpdate";
    ServerEventType["UserPlatformWipe"] = "UserPlatformWipe";
    ServerEventType["EmojiCreate"] = "EmojiCreate";
    ServerEventType["EmojiDelete"] = "EmojiDelete";
    ServerEventType["Auth"] = "Auth";
})(ServerEventType || (ServerEventType = {}));
/**
 * Handle an event for the Client
 * @param client Client
 * @param event Event
 * @param setReady Signal state change
 */
export async function handleEvent(client, event, setReady) {
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
                const u = client.users._add(user);
                if (u.relationship == Relationship.User) {
                    client.user = u;
                }
            }
            for (const server of event.servers) {
                client.servers._add(server);
            }
            for (const member of event.members) {
                member.server?.members._add(member);
            }
            for (const channel of event.channels) {
                client.channels._add(channel);
            }
            for (const emoji of event.emojis) {
                client.emojis._add(emoji);
            }
            if (client.options.syncUnreads) {
                await client.channelUnreads.sync();
            }
            setReady(true);
            client.emit("ready");
            break;
        }
        case "Message": {
            if (!client.messages.cache.has(event.id)) {
                if (event.member) {
                    event.member.server?.members._add(event.member);
                }
                if (event.user) {
                    client.users._add(event.user);
                }
                client.messages._add(event);
                const channel = client.channels.cache.get(event.channelId);
                if (channel) {
                    channel.lastMessageId = event.id;
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
                if (event.append.embeds)
                    message.addEmbeds(...event.append.embeds);
                client.emit("messageUpdate", message, previousMessage);
            }
            break;
        }
        case "MessageDelete": {
            if (client.messages.cache.has(event.id)) {
                const message = client.messages.cache.get(event.id);
                client.emit("messageDelete", message);
                client.messages.delete(event.id);
            }
            break;
        }
        case "BulkMessageDelete": {
            client.emit("messageDeleteBulk", event.ids
                .map((id) => {
                if (client.messages.cache.has(id)) {
                    const message = client.messages.cache.get(id);
                    client.messages.delete(id);
                    return message;
                }
                return undefined;
            })
                .filter((x) => x), client.channels.cache.get(event.channel));
            break;
        }
        case "MessageReact": {
            const message = client.messages.cache.get(event.id);
            if (message) {
                const reactions = message.reactions;
                const set = reactions.get(event.emoji_id);
                if (set) {
                    if (set.has(event.user_id))
                        return;
                    set.add(event.user_id);
                }
                else {
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
                let changes = Object.assign({}, event.data);
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
            if (client.channels.cache.get(event.id)) {
                const channel = client.channels.cache.get(event.id);
                client.emit("channelDelete", channel);
                client.channels.delete(event.id);
            }
            break;
        }
        case "ChannelGroupJoin": {
            const channel = client.channels.resolve(event.id);
            if (channel) {
                if (!channel.recipientIds.has(event.user)) {
                    channel.recipientIds.add(event.user);
                }
                client.emit("channelGroupJoin", channel, await client.users.fetch(event.user));
            }
            break;
        }
        case "ChannelGroupLeave": {
            const channel = client.channels.resolve(event.id);
            if (channel) {
                if (channel.recipientIds.has(event.user)) {
                    channel.recipientIds.delete(event.user);
                }
                client.emit("channelGroupLeave", channel, client.users.resolve(event.user));
            }
            break;
        }
        case "ChannelStartTyping": {
            const channel = client.channels.resolve(event.id);
            if (channel) {
                if (!channel.typingIds.has(event.user)) {
                    channel.typingIds.add(event.user);
                }
                client.emit("channelStartTyping", channel, client.users.resolve(event.user));
            }
            break;
        }
        case "ChannelStopTyping": {
            const channel = client.channels.resolve(event.id);
            if (channel) {
                if (channel.typingIds.has(event.user)) {
                    channel.typingIds.delete(event.user);
                }
                client.emit("channelStopTyping", channel, client.users.resolve(event.user));
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
                else {
                    client.emit("serverRoleUpdate", server, event.role_id, role);
                }
            }
            break;
        }
        case "ServerRoleDelete": {
            const server = client.servers.resolve(event.id);
            if (server) {
                const role = server.roles._remove(event.role_id);
                client.emit("serverRoleDelete", server, event.role_id, role);
            }
            break;
        }
        case "ServerMemberJoin": {
            const server = client.servers.resolve(event.id);
            const userId = event.user;
            if (!server?.members.cache.has(userId)) {
                await client.users.fetch(userId);
                client.emit("serverMemberJoin", server?.members.create({
                    _id: {
                        server: event.id,
                        user: userId,
                    },
                    joined_at: new Date().toUTCString(),
                }));
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
            if (event.user == client.user.id) {
                handleEvent(client, {
                    type: "ServerDelete",
                    id: event.id,
                }, setReady);
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
            handleEvent(client, {
                type: "UserUpdate",
                id: event.user._id,
                data: {
                    relationship: event.user.relationship,
                },
            }, setReady);
            break;
        }
        case "UserPresence": {
            handleEvent(client, {
                type: "UserUpdate",
                id: event.id,
                data: {
                    online: event.online,
                },
            }, setReady);
            break;
        }
        case "UserSettingsUpdate": {
            client.emit("userSettingsUpdate", event.id, event.update);
            break;
        }
        case "UserPlatformWipe": {
            handleEvent(client, {
                type: "BulkMessageDelete",
                channel: "0",
                ids: client.messages.cache
                    .filter((message) => message.user?.id == event.user_id)
                    .map((message) => message.id),
            }, setReady);
            handleEvent(client, {
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
            }, setReady);
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
                client.emit("emojiDelete", emoji);
            }
            break;
        }
        case "Auth": {
            // TODO: implement DeleteSession and DeleteAllSessions
            break;
        }
    }
}
//# sourceMappingURL=v1.js.map