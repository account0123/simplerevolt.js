import { User as ApiUser } from "revolt-api";
import type { Client } from "..";
import { User } from "../models/User";
import { CachedCollection } from "./DataCollection";
export declare class UserCollection extends CachedCollection<User> {
    constructor(client: Client);
    _add(user: User, cache?: boolean): User;
    /**
     * Creates and caches an user instance, overwriting any existing user with the same ID.
     */
    create(data: ApiUser): User;
    fetch(id: string): Promise<User>;
}
//# sourceMappingURL=UserCollection.d.ts.map