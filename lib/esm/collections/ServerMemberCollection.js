import { ServerMember } from "../models/ServerMember";
import { CachedCollection } from "./DataCollection";
export class ServerMemberCollection extends CachedCollection {
    server;
    constructor(server) {
        super(server.client, ServerMember);
        this.server = server;
    }
    _add(member) {
        const existing = this.cache.get(member.id);
        if (existing)
            return existing;
        this.cache.set(member.id, member);
        return member;
    }
    create(data) {
        const instance = new ServerMember(this.server, data);
        this.cache.set(instance.id, instance);
        return instance;
    }
}
//# sourceMappingURL=ServerMemberCollection.js.map