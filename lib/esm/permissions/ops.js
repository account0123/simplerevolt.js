import Long from "long";
import { Server } from "..";
import { ALLOW_IN_TIMEOUT, DEFAULT_PERMISSION_DIRECT_MESSAGE, DEFAULT_PERMISSION_VIEW_ONLY, Permission, UserPermission, } from "./index";
import { BitField } from "../utils/BitField";
import { PermissionOverrides } from "./PermissionOverrides";
export class PermissionsBitField extends BitField {
    constructor(bits = 0) {
        super(typeof bits == "number" ? Long.fromNumber(bits) : bits);
    }
    bitwiseAndEq(...b) {
        const value = b.reduce((prev, cur) => prev.or(cur), Long.fromNumber(0));
        return value.and(this.bitfield).eq(value);
    }
}
/**
 * Calculate permissions against a given object
 * @param target Target object to check permissions against
 * @param options Additional options to use when calculating
 */
export function calculatePermission(client, target, options) {
    const user = options?.member ? options?.member.user : client.user;
    if (user?.privileged) {
        return Permission.GrantAllSafe;
    }
    if (target instanceof Server) {
        // 1. Check if owner.
        if (target.ownerId == user?.id) {
            return Permission.GrantAllSafe;
        }
        else {
            // 2. Get ServerMember.
            const member = options?.member;
            if (!member)
                return 0;
            // 3. Apply allows from default_permissions.
            let perm = BitField.resolve(target.defaultPermissions);
            // 4. If user has roles, iterate in order.
            if (member.roles && target.roles) {
                // 5. Apply allows and denies from roles.
                const permissions = member.orderedRoles.map((role) => role.permissions || new PermissionOverrides(target, { id: role.id, a: 0, d: 0 }));
                for (const permission of permissions) {
                    const allow = BitField.resolve(permission.allow);
                    const deny = BitField.resolve(permission.deny);
                    perm = perm.or(allow).and(deny.not());
                }
            }
            // 5. Revoke permissions if ServerMember is timed out.
            if (member.timeout && member.timeout > new Date()) {
                perm = perm.and(ALLOW_IN_TIMEOUT);
            }
            return perm.toNumber();
        }
    }
    else {
        // 1. Check channel type.
        switch (target.channelType) {
            case "SavedMessages":
                return Permission.GrantAllSafe;
            case "DirectMessage": {
                // 2. Determine user permissions.
                const user_permissions = target.recipient?.permission || 0;
                // 3. Check if the user can send messages.
                if (user_permissions & UserPermission.SendMessage) {
                    return DEFAULT_PERMISSION_DIRECT_MESSAGE;
                }
                else {
                    return DEFAULT_PERMISSION_VIEW_ONLY;
                }
            }
            case "Group": {
                const group = target;
                // 2. Check if user is owner.
                if (group.ownerId == user?.id) {
                    return Permission.GrantAllSafe;
                }
                else {
                    // 3. Pull out group permissions.
                    return group.permissions ?? DEFAULT_PERMISSION_DIRECT_MESSAGE;
                }
            }
            case "TextChannel":
            case "VoiceChannel": {
                // 2. Get server.
                const channel = target;
                const server = channel.server;
                if (!server)
                    return 0;
                // 3. If server owner, just grant all permissions.
                if (server?.ownerId == user?.id) {
                    return Permission.GrantAllSafe;
                }
                else {
                    // 4. Get ServerMember.
                    const member = options?.member;
                    if (!member)
                        return 0;
                    // 5. Calculate server base permissions.
                    let perm = Long.fromNumber(calculatePermission(client, server, options));
                    // 6. Apply default allows and denies for channel.
                    if (channel.defaultPermissions) {
                        const allow = BitField.resolve(channel.defaultPermissions.allow);
                        const deny = BitField.resolve(channel.defaultPermissions.deny);
                        perm = perm.or(allow).and(deny.not());
                    }
                    // 7. If user has roles, iterate in order.
                    if (member.roles && channel.rolePermissions && server.roles) {
                        // 5. Apply allows and denies from roles.
                        const roleIds = member.orderedRoles.map(({ id }) => id);
                        for (const id of roleIds) {
                            const override = channel.rolePermissions.resolve(id);
                            if (override) {
                                const allow = BitField.resolve(override.allow);
                                const deny = BitField.resolve(override.deny);
                                perm = perm.or(allow).and(deny.not());
                            }
                        }
                    }
                    // 8. Revoke permissions if ServerMember is timed out.
                    if (member.timeout && member.timeout > new Date()) {
                        perm = perm.and(ALLOW_IN_TIMEOUT);
                    }
                    return perm.toNumber();
                }
            }
        }
    }
}
//# sourceMappingURL=ops.js.map