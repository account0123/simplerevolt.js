export class Base {
    client;
    constructor(client) {
        this.client = client;
    }
    clone() { return Object.assign(Object.create(this), this); }
    patch(data) { return data; }
    update(data) { return data; }
}
//# sourceMappingURL=Base.js.map