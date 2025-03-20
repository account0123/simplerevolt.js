import { User } from "../models/User";
import { CachedCollection } from "./DataCollection";
export class UserCollection extends CachedCollection {
    constructor(client) {
        super(client, User);
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
        const instance = new User(this.client, data);
        this.cache.set(instance.id, instance);
        return instance;
    }
    async fetch(id) {
        const result = await this.client.api.get(`/users/${id}`);
        return this.create(result);
    }
}
//# sourceMappingURL=UserCollection.js.map