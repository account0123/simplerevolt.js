"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.Relationship = exports.UserBadges = exports.UserFlags = void 0;
const __1 = require("..");
const Base_1 = require("./Base");
const permissions_1 = require("../permissions");
var UserFlags;
(function (UserFlags) {
    UserFlags[UserFlags["Suspended"] = 1] = "Suspended";
    UserFlags[UserFlags["Deleted"] = 2] = "Deleted";
    UserFlags[UserFlags["Banned"] = 4] = "Banned";
    UserFlags[UserFlags["Spam"] = 8] = "Spam";
})(UserFlags || (exports.UserFlags = UserFlags = {}));
var UserBadges;
(function (UserBadges) {
    UserBadges[UserBadges["Developer"] = 1] = "Developer";
    UserBadges[UserBadges["Translator"] = 2] = "Translator";
    UserBadges[UserBadges["Supporter"] = 4] = "Supporter";
    UserBadges[UserBadges["ResponsibleDisclosure"] = 8] = "ResponsibleDisclosure";
    UserBadges[UserBadges["Founder"] = 16] = "Founder";
    UserBadges[UserBadges["PlatformModeration"] = 32] = "PlatformModeration";
    UserBadges[UserBadges["ActiveSupporter"] = 64] = "ActiveSupporter";
    UserBadges[UserBadges["Paw"] = 128] = "Paw";
    UserBadges[UserBadges["EarlyAdopter"] = 256] = "EarlyAdopter";
    UserBadges[UserBadges["ReservedRelevantJokeBadge1"] = 512] = "ReservedRelevantJokeBadge1";
    UserBadges[UserBadges["ReservedRelevantJokeBadge2"] = 1024] = "ReservedRelevantJokeBadge2";
})(UserBadges || (exports.UserBadges = UserBadges = {}));
var Relationship;
(function (Relationship) {
    Relationship["None"] = "None";
    Relationship["User"] = "User";
    Relationship["Friend"] = "Friend";
    Relationship["Outgoing"] = "Outgoing";
    Relationship["Incoming"] = "Incoming";
    Relationship["Blocked"] = "Blocked";
    Relationship["BlockedOther"] = "BlockedOther";
})(Relationship || (exports.Relationship = Relationship = {}));
class User extends Base_1.Base {
    id;
    displayName;
    discriminator;
    flags = 0;
    badges = 0;
    username;
    isOnline = false;
    privileged = false;
    ownerId = null;
    status;
    relationship;
    constructor(client, data) {
        super(client);
        if ("bot" in data) {
            this.ownerId = data.bot?.owner || null;
        }
        this.id = data._id;
        this.displayName = data.display_name || data.username;
        this.username = data.username;
        this.discriminator = data.discriminator;
        this.isOnline = data.online || false;
        this.relationship = data.relationship;
        this.status = data.status || null;
        this.update(data);
    }
    /**
     * Edits the user
     */
    async edit(data) {
        return await this.client.api.patch(`/users/${this.id == this.client.user?.id ? "@me" : this.id}`, data);
    }
    get bot() {
        return this.ownerId != null;
    }
    /**
     * Permissions against this user
     */
    get permission() {
        let permissions = 0;
        switch (this.relationship) {
            case "Friend":
            case "User":
                return permissions_1.U32_MAX;
            case "Blocked":
            case "BlockedOther":
                return permissions_1.UserPermission.Access;
            case "Incoming":
            case "Outgoing":
                permissions = permissions_1.UserPermission.Access;
        }
        if (this.client.channels.cache.find((channel) => (channel instanceof __1.Group && channel.recipientIds.has(this.id)) ||
            (channel instanceof __1.DMChannel && channel.recipientIds.has(this.id))) ||
            this.client.servers.cache.find((server) => server.members.cache.some((member) => member.id == this.id))) {
            if (this.client.user?.bot || this.bot) {
                permissions |= permissions_1.UserPermission.SendMessage;
            }
            permissions |= permissions_1.UserPermission.Access | permissions_1.UserPermission.ViewProfile;
        }
        return permissions;
    }
    toString() {
        return `<@${this.id}>`;
    }
    update(data) {
        if (data.username)
            this.username = data.username;
        if (data.discriminator)
            this.discriminator = data.discriminator;
        if ("display_name" in data)
            this.displayName = data.display_name || this.username;
        if ("flags" in data)
            this.flags = data.flags;
        if ("badges" in data)
            this.badges = data.badges;
        if ("privileged" in data)
            this.privileged = data.privileged;
        if ("status" in data)
            this.status = data.status;
        return this;
    }
}
exports.User = User;
//# sourceMappingURL=User.js.map