import Long from "long";
import { RecursiveReadonlyArray } from "..";
export type BitFieldResolvable<Flags extends string, Type extends number | bigint | Long> = RecursiveReadonlyArray<Flags | Type | `${bigint}` | Readonly<BitField<Flags>>> | Flags | Type | `${bigint}` | Readonly<BitField<Flags>>;
export declare class BitField<Flags extends string> {
    static Flags: {};
    static defaultBit: Long;
    bitfield: Long;
    constructor(bits?: Long);
    /**
     * Checks whether the bitfield has a bit, or any of multiple bits.
     */
    any(bit: BitFieldResolvable<Flags, Long>): boolean;
    /**
    * Resolves bitfields to their numeric form.
    */
    static resolve(bit: BitFieldResolvable<string, number | bigint | Long>): Long;
}
//# sourceMappingURL=BitField.d.ts.map