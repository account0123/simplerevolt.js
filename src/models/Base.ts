import { Client } from "..";

export abstract class Base {
  constructor(readonly client: Client) {}
  abstract get id(): string;
  clone(): this {
    return Object.assign(Object.create(this), this);
  }
  patch(data: any) {
    return data;
  }
  update(data: any) {
    return data;
  }
}
