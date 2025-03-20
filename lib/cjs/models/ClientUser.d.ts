import { User as ApiUser } from "revolt-api";
import { User } from ".";
import type { Client } from "..";
export declare class ClientUser extends User {
    constructor(client: Client, data: ApiUser);
    /**
     * Change the username of the current user
     * @param username New username
     * @param password Current password
     */
    setUsername(username: string, password: string): Promise<User>;
}
//# sourceMappingURL=ClientUser.d.ts.map