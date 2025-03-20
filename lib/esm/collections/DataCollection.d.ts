import { Collection } from '@discordjs/collection';
import { Client } from '../Client';
import { Base } from '../models/Base';
/**
 * Manages the API methods of a data model along with a collection of instances.
 */
declare abstract class DataCollection<T extends Base> {
    protected holds: new (...args: any[]) => T;
    /**
     * The client that instantiated this Collection
     */
    readonly client: Client;
    constructor(client: Client, holds: new (...args: any[]) => T);
    /**
     * The cache of items
     */
    abstract get cache(): Collection<string, T>;
    /**
     * Resolves a data entry to a data Object.
     */
    resolve(idOrInstance: string | T): T | null;
    /**
     * Resolves a data entry to an instance id.
     */
    resolveId(idOrInstance: string | T): string | null;
    valueOf(): Collection<string, T>;
}
type LimitedCollectionOptions<Key, Value> = {
    maxSize?: number;
    keepOverLimit?: (value: Value, key: Key, instance: Collection<Key, Value>) => boolean;
};
export declare class CachedCollection<T extends Base> extends DataCollection<T> {
    private readonly _cache;
    constructor(client: Client, holds: new (...args: any[]) => T, iterable?: Iterable<T>);
    get cache(): Collection<string, T>;
    _add(data: T, cache?: boolean, { id }?: {
        id?: string;
        extras?: any[];
    }): T;
    /**
     * Removes an item from the cache and returns it.
     */
    _remove(id: string): T | undefined;
}
export declare class LimitedCollection<K, V> extends Collection<K, V> {
    readonly maxSize: number;
    readonly keepOverLimit: ((value: V, key: K, instance: Collection<K, V>) => boolean) | undefined;
    constructor(options?: LimitedCollectionOptions<K, V>, iterable?: Iterable<[K, V]>);
    set(key: K, value: V): this;
    static get [Symbol.species](): typeof Collection;
}
export declare const makeCache: (managerType: Function, _: Function, manager: Function) => Collection<unknown, unknown> | LimitedCollection<unknown, unknown>;
export declare function makeLimitedCache<Key, Value>(settings: Record<string, LimitedCollectionOptions<Key, Value>>): (managerType: Function, _: Function, manager: Function) => Collection<unknown, unknown> | LimitedCollection<Key, Value>;
export {};
//# sourceMappingURL=DataCollection.d.ts.map