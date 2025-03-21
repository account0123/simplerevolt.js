import type { Channel, ServerMember, Message, User } from "./models/index.js";

export type AllowedPartial = User | Channel | ServerMember | Message;

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

export interface RecursiveReadonlyArray<ItemType> extends ReadonlyArray<ItemType | RecursiveReadonlyArray<ItemType>> {}

export * as API from "revolt-api";

export { Client } from "./Client.js";
export * from "./collections/index.js";
export * from "./models/index.js";
export { ConnectionState, EventClient } from "./events/EventClient.js";
export * from "./regex.js";