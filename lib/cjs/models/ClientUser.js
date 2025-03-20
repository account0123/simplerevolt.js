"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientUser = void 0;
const _1 = require(".");
class ClientUser extends _1.User {
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
exports.ClientUser = ClientUser;
//# sourceMappingURL=ClientUser.js.map