export declare function objectToMap<T>(obj: Record<string, T>): Map<string, T>;
export declare function mapObject<T, U>(obj: Record<string, T>, mapper: (key: string, value: T) => {
    [key: string]: U;
}): {};
//# sourceMappingURL=index.d.ts.map