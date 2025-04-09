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
