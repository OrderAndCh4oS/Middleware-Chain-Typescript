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

## Examples

*Parse JSON Body*
```typescript
import {IHandlerData} from "../interfaces/middleware.interface";
import ErrorResponse from "../exceptions/error-reponse.exception";

const jsonBodyParser = async (context: IHandlerData, next: any) => {
    if (!context.event.body) {
        throw new ErrorResponse(400, {error: 'invalid request, you are missing the parameter body'})
    }

    context.event.body = typeof context.event.body == 'object' ? context.event.body : JSON.parse(context.event.body);
    await next();
};

export default jsonBodyParser;
```

*Parse JSON Response*
```typescript
import {IHandlerData} from "../interfaces/middleware.interface";

const jsonResponseParser = async (context: IHandlerData, next: any) => {
    await next();
    context.response.headers = {
        'Content-Type': 'application/json',
        ...context.response.headers
    };
    context.response.body = context.response?.body && typeof context.response!.body !== 'string'
        ? JSON.stringify(context.response.body)
        : ''
};

export default jsonResponseParser;

```

*CORS Header Middleware*
```typescript
import {IHandlerData} from "../interfaces/middleware.interface";

const corsHeader = async (context: IHandlerData, next: any) => {
    await next();
    context.response.headers = {
        'Access-Control-Allow-Origin': '*',
        ...context.response.headers
    }
};

export default corsHeader;
```

*Lambda handler example usage*
```typescript
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();

import corsHeader from "../middleware/cors-header.middleware";
import jsonBodyParser from "../middleware/json-body-parser.middleware";
import jsonResponseParser from "../middleware/json-response-parser.middleware";
import makeMiddleware from "../middleware/middleware";

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const {v4: uuidv4} = require('uuid');

export const createHandler = async (event: any = {}): Promise<any> => {

    const body = event.body;

    if (typeof body.name === 'undefined') {
        return {statusCode: 400, body: `invalid request, you are missing the name property`};
    }

    const user = {
        [PRIMARY_KEY]: uuidv4(),
        name: body.name,
    }

    const params: any = {
            TableName: TABLE_NAME,
            Item: user
        };
        await db.put(params).promise();

    return {
        statusCode: 201,
        body: user
    };

};

export const handler = makeMiddleware(createHandler)
    .add(jsonBodyParser)
    .add(corsHeader)
    .add(jsonResponseParser)
    .handler();
```

