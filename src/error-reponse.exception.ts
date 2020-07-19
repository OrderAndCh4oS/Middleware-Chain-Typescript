export default class ErrorResponse extends Error {
    status: number;
    body: object;
    headers: object;

    constructor(
        status?: number,
        body?: object,
        headers?: object,
        message?: string
    ) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = ErrorResponse.name;
        this.status = status || 400;
        this.body = body || {};
        this.headers = headers || {};
    }
}
