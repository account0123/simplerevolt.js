import { Collection } from "@discordjs/collection";

import type { Client } from "../Client.js";
import type { Base } from "../models/Base.js";

/**
 * Manages the API methods of a data model along with a collection of instances.
 */
abstract class DataCollection<T extends Base> {
  /**
   * The client that instantiated this Collection
   */
  readonly client: Client;

  constructor(
    client: Client,
    protected holds: new (...args: any[]) => T,
  ) {
    this.client = client;
  }

  /**
   * The cache of items
   */
  abstract get cache(): Collection<string, T>;

  /**
   * Resolves a data entry to a data Object.
   */
  resolve(idOrInstance: string | T): T | null {
    if (idOrInstance instanceof this.holds) return idOrInstance;
    if (typeof idOrInstance == "string") return this.cache.get(idOrInstance) ?? null;
    return null;
  }

  /**
   * Resolves a data entry to an instance id.
   */
  resolveId(idOrInstance: string | T): string | null {
    if (idOrInstance instanceof this.holds) return idOrInstance.id;
    if (typeof idOrInstance == "string") return idOrInstance;
    return null;
  }

  valueOf() {
    return this.cache;
  }
}

type LimitedCollectionOptions<Key, Value> = {
  maxSize?: number;
  keepOverLimit?: (value: Value, key: Key, instance: Collection<Key, Value>) => boolean;
};

export class CachedCollection<T extends Base> extends DataCollection<T> {
  private readonly _cache: Collection<string, T>;
  constructor(client: Client, holds: new (...args: any[]) => T, iterable?: Iterable<T>) {
    super(client, holds);
    this._cache = makeCache(this.constructor, this.holds, this.constructor) as Collection<string, T>;

    if (iterable) {
      for (const item of iterable) {
        this._add(item);
      }
    }
  }
  get cache() {
    return this._cache;
  }

  _add(data: T, cache = true, { id }: { id?: string; extras?: any[] } = {}) {
    const existing = this.cache.get(id ?? data.id);
    if (existing) {
      if (cache) {
        return existing;
      }
      return existing.clone();
    }
    if (cache) this.cache.set(id ?? data.id, data);
    return data;
  }

  /**
   * Removes an item from the cache and returns it.
   */
  _remove(id: string) {
    const item = this.cache.get(id);
    this.cache.delete(id);
    return item;
  }
}

export class LimitedCollection<K, V> extends Collection<K, V> {
  readonly maxSize: number;
  readonly keepOverLimit: ((value: V, key: K, instance: Collection<K, V>) => boolean) | undefined;
  constructor(options: LimitedCollectionOptions<K, V> = {}, iterable?: Iterable<[K, V]>) {
    super(iterable);
    this.maxSize = options.maxSize ?? Infinity;
    this.keepOverLimit = options.keepOverLimit;
  }

  override set(key: K, value: V) {
    if (!this.maxSize && !this.keepOverLimit?.(value, key, this)) return this;
    if (this.size >= this.maxSize && !this.has(key)) {
      for (const [k, v] of this.entries()) {
        const keep = this.keepOverLimit?.(v, k, this) ?? false;
        if (!keep) {
          this.delete(k);
          break;
        }
      }
    }
    return super.set(key, value);
  }

  static override get [Symbol.species]() {
    return Collection;
  }
}

export const makeCache = makeLimitedCache({});
export function makeLimitedCache<Key, Value>(settings: Record<string, LimitedCollectionOptions<Key, Value>>) {
  return (managerType: Function, _: Function, manager: Function) => {
    const setting = settings[manager.name] ?? settings[managerType.name];

    if (setting == null) {
      return new Collection();
    }
    if (typeof setting == "number") {
      return setting == Infinity ? new Collection() : new LimitedCollection({ maxSize: setting });
    }

    const noLimit = setting.maxSize == null || setting.maxSize == Infinity;
    if (noLimit) {
      return new Collection();
    }
    return new LimitedCollection(setting);
  };
}
