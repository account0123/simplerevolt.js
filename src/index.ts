import { Channel, ServerMember, Message, User } from "./models";

export type AllowedPartial =
  | User
  | Channel
  | ServerMember
  | Message;

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

export * from "./Client";
export * from "./collections";
export * from "./models";
export * from "./events/EventClient";