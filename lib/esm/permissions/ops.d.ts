import Long from "long";
import { Channel, Client, Server, ServerMember } from "..";
import { Permission } from "./index";
import { BitField } from "../utils/BitField";
export declare class PermissionsBitField extends BitField<keyof typeof Permission> {
    constructor(bits?: number | Long);
    bitwiseAndEq(...b: number[]): boolean;
}
/**
 * Calculate permissions against a given object
 * @param target Target object to check permissions against
 * @param options Additional options to use when calculating
 */
export declare function calculatePermission(client: Client, target: Channel | Server, options?: {
    /**
     * Pretend to be another ServerMember
     */
    member?: ServerMember;
}): number;
//# sourceMappingURL=ops.d.ts.map