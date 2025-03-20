"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCollection = void 0;
const User_1 = require("../models/User");
const DataCollection_1 = require("./DataCollection");
class UserCollection extends DataCollection_1.CachedCollection {
    constructor(client) {
        super(client, User_1.User);
    }
    _add(user, cache = true) {
        const existing = this.cache.get(user.id);
        if (cache && existing)
            return existing;
        this.cache.set(user.id, user);
        return user;
    }
    /**
     * Creates and caches an user instance, overwriting any existing user with the same ID.
     */
    create(data) {
        const instance = new User_1.User(this.client, data);
        this.cache.set(instance.id, instance);
        return instance;
    }
    async fetch(id) {
        const result = await this.client.api.get(`/users/${id}`);
        return this.create(result);
    }
}
exports.UserCollection = UserCollection;
//# sourceMappingURL=UserCollection.js.map