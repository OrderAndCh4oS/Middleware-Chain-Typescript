import {IHandler, IHandlerData, IMiddleware, IMiddlewareChain} from "./middleware.interface";
import ErrorResponse from "./error-reponse.exception";

function makeMiddleware(handler: IHandler): IMiddlewareChain {
    const middlewares: IMiddleware[] = [];
    const middlewareChain = ({
        add: function (middleware: IMiddleware) {
            middlewares.push(middleware);
            return middlewareChain;
        },
        handler: () => async function (event: any, context: any, callback: any) {
            const data = {
                event,
                context,
                callback,
                response: {},
                error: {}
            };
            try {
                await invokeMiddleware(data, [
                    ...middlewares,
                    async (context: IHandlerData, next: any) => {
                        context.response = await handler(data.event, data.context, data.callback);
                        await next();
                    }]
                );
            } catch (e) {
                // Todo: Add a errorHandler chain (array of handler functions).
                //       The chain can be called in order added
                //       This could be used to deinit any running processes
                //       and manipulate the error response.
                console.log('Error caught in middleware', e);

                if (!(e instanceof ErrorResponse)) {
                    return {
                        statusCode: 500,
                        body: JSON.stringify({error: 'Unhandled error'}),
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Content-Type': 'application/json'
                        }
                    }
                }

                return {
                    statusCode: e.status,
                    body: JSON.stringify(e.body),
                    headers: {
                        ...e.headers,
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    }
                }

            }

            return data.response;
        }
    });

    return middlewareChain
}

async function invokeMiddleware(context: IHandlerData, middlewares: IMiddleware[]): Promise<any> {
    if (!middlewares.length) return await context;
    const middleware: IMiddleware = <IMiddleware>middlewares.shift();
    return middleware(context, async () => {
        return await invokeMiddleware(context, middlewares)
    });
}

export default makeMiddleware;
