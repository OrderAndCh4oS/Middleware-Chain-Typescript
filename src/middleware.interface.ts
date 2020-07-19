export interface IMiddlewareChain {
    add: (middleware: IMiddleware) => IMiddlewareChain
    handler: () => (event: any, context: any, callback: any) => Promise<IResponse>
}

export interface IMiddleware {
    (context: IHandlerData, next: () => Promise<void>): void
}

export interface IHandler {
    (event: any, context: any, callback: any): Promise<IResponse>
}

export interface IHandlerData {
    event: any
    context: any
    callback: any
    response: IResponse
    error: IResponse
}

export interface IResponse {
    status?: number
    body?: object | string
    headers?: object
}
