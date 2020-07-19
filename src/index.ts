import "regenerator-runtime/runtime";

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
            const data: IHandlerData = {
                event,
                context,
                callback,
                response: {},
                errorHandlers: []
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
                console.log('Error caught in middleware', e);

                for (const errorHandler of data.errorHandlers) {
                    errorHandler(e, data);
                }

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
    if (!middlewares.length) return context;
    const middleware: IMiddleware = <IMiddleware>middlewares.shift();
    return middleware(context, async () => await invokeMiddleware(context, middlewares));
}

export default makeMiddleware;


const mw = makeMiddleware(async (event: any, context: any, callback: any) => {
    console.log('run here');
    return {statusCode: 200, body: event}
});

mw.add(async (context: IHandlerData, next: any) => {
    if(Math.random() > 0.9) {
        throw new ErrorResponse(403, {error: 'Not Authorised'})
    }
    await next();
})

mw.add(async (context: IHandlerData, next: any) => {
    console.log('1');
    console.log(context);
    context.errorHandlers.push(() => console.log('Deinit Something'))
    await next();
    console.log('4');
});

mw.add(async (context: IHandlerData, next: any) => {
    console.log('2');
    context.event = {two: "blah2"};
    console.log(context);
    await next();
    console.log('3');
    context.response.headers = {
        'Access-Control-Allow-Origin': '*',
        ...context.response.headers
    }
});

mw.add(async (context: IHandlerData, next: any) => {
    await next();
    if(Math.random() > 0.6) {
        throw new ErrorResponse(400, {error: 'Something randomly broke'})
    }
    context.response.headers = {
        'Access-Control-Allow-Origin': '*',
        ...context.response.headers
    }
})

mw.add(async (context: IHandlerData, next: any) => {
    await next();
    context.response.headers = {
        'Content-Type': 'application/json',
        ...context.response.headers
    };
    context.response.body = context.response?.body && typeof context.response!.body !== 'string'
        ? JSON.stringify(context.response.body)
        : ''
})

mw.handler()({}, {}, () => {}).then((response) => console.log(response));
