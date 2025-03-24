export * from "./Base.js";

// User
export * from "./User.js";
export * from "./ClientUser.js";
export * from "./Bot.js";

// Channels
export * from "./Channel.js";
export * from "./ChannelUnread.js";
export * from "./DMChannel.js";
export * from "./GroupChannel.js";
export * from "./ChannelWebhook.js";

import { Channel } from "./Channel.js";
import { DMChannel } from "./DMChannel.js";
import { Group } from "./GroupChannel.js";
import { TextChannel, VoiceChannel } from "./ServerChannel.js";

Channel.from = function (client, data) {
  switch (data.channel_type) {
    case "SavedMessages":
      return new Channel(client, data);
    case "DirectMessage":
      return new DMChannel(client, data);
    case "Group":
      return new Group(client, data);
    case "TextChannel":
      return new TextChannel(client, data);
    case "VoiceChannel":
      return new VoiceChannel(client, data);
  }
};

export * from "./Emoji.js";
export * from "./File.js";
export * from "./MessageEmbed.js";
export * from "./UserProfile.js";

// Server
export * from "./Server.js";
export * from "./Role.js";
export * from "./ServerCategory.js";
export * from "./ServerChannel.js";
export * from "./ServerMember.js";

// Message
export * from "./Message.js";
