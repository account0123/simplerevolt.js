import { Collection } from '@discordjs/collection';
/**
 * Manages the API methods of a data model along with a collection of instances.
 */
class DataCollection {
    holds;
    /**
     * The client that instantiated this Collection
     */
    client;
    constructor(client, holds) {
        this.holds = holds;
        this.client = client;
    }
    /**
     * Resolves a data entry to a data Object.
     */
    resolve(idOrInstance) {
        if (idOrInstance instanceof this.holds)
            return idOrInstance;
        if (typeof idOrInstance == 'string')
            return this.cache.get(idOrInstance) ?? null;
        return null;
    }
    /**
     * Resolves a data entry to an instance id.
     */
    resolveId(idOrInstance) {
        if (idOrInstance instanceof this.holds)
            return idOrInstance.id;
        if (typeof idOrInstance == 'string')
            return idOrInstance;
        return null;
    }
    valueOf() {
        return this.cache;
    }
}
export class CachedCollection extends DataCollection {
    _cache;
    constructor(client, holds, iterable) {
        super(client, holds);
        this._cache = makeCache(this.constructor, this.holds, this.constructor);
        if (iterable) {
            for (const item of iterable) {
                this._add(item);
            }
        }
    }
    get cache() {
        return this._cache;
    }
    _add(data, cache = true, { id } = {}) {
        const existing = this.cache.get(id ?? data.id);
        if (existing) {
            if (cache) {
                return existing;
            }
            return existing.clone();
        }
        if (cache)
            this.cache.set(id ?? data.id, data);
        return data;
    }
    /**
     * Removes an item from the cache and returns it.
     */
    _remove(id) {
        const item = this.cache.get(id);
        this.cache.delete(id);
        return item;
    }
}
export class LimitedCollection extends Collection {
    maxSize;
    keepOverLimit;
    constructor(options = {}, iterable) {
        super(iterable);
        this.maxSize = options.maxSize ?? Infinity;
        this.keepOverLimit = options.keepOverLimit;
    }
    set(key, value) {
        if (!this.maxSize && !this.keepOverLimit?.(value, key, this))
            return this;
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
    static get [Symbol.species]() {
        return Collection;
    }
}
export const makeCache = makeLimitedCache({});
export function makeLimitedCache(settings) {
    return (managerType, _, manager) => {
        const setting = settings[manager.name] ?? settings[managerType.name];
        if (setting == null) {
            return new Collection();
        }
        if (typeof setting == 'number') {
            return setting == Infinity ? new Collection() : new LimitedCollection({ maxSize: setting });
        }
        const noLimit = setting.maxSize == null || setting.maxSize == Infinity;
        if (noLimit) {
            return new Collection();
        }
        return new LimitedCollection(setting);
    };
}
//# sourceMappingURL=DataCollection.js.map