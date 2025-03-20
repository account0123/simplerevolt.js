import { Client } from "..";
export declare abstract class Base {
    readonly client: Client;
    constructor(client: Client);
    abstract get id(): string;
    clone(): this;
    patch(data: any): any;
    update(data: any): any;
}
//# sourceMappingURL=Base.d.ts.map