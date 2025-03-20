import { User } from ".";
export class ClientUser extends User {
    constructor(client, data) {
        super(client, data);
        this.update(data);
    }
    /**
     * Change the username of the current user
     * @param username New username
     * @param password Current password
     */
    async setUsername(username, password) {
        const body = {
            username,
            password,
        };
        const result = await this.client.api.patch("/users/@me/username", body);
        return this.client.users.create(result);
    }
}
//# sourceMappingURL=ClientUser.js.map