# Middleware Chain

Clone repo and run
`npm install`

Build
```sh
npm run build
```

Run
```sh
npm run script
```

Watch for changes (will need to run `npm run script` manually still)
```sh
npm run watch
```

## Example

```typescript
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

mw.handler()({}, {}, () => {}).then((response) => console.log(response))
```
