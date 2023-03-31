# simple-lambda-api-router

Simple and lightweight lambda api router.

# CommonJS

```javascript
const { createController } = require('simple-lambda-api-router/dist/utils/controller');
const { AwsSamRouter } = require('simple-lambda-api-router/dist/classes');

// Use the SAM router
const router = new AwsSamRouter();

router.use(
  // Resources should match with the template.yml api paths
  '/user/{type}/clients/{id+}',
  createController({
    // should each be a HTTP method in lower case
    get: async (event, context) => {
      return { statusCode: 200, body: 'hello world' };
    },
  }),
);

/**
 * Expose and export the lambda handler
 */
export const lambdaHandler = router.expose();
```

# Usage with AWS SAM

```typescript
import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AwsSamRouter, { HandlerType } from 'simple-lambda-api-router/dist/classes/AwsSamRouter';
import { createController } from 'simple-lambda-api-router/dist/utils/controller';

// Use the SAM router
const router = new AwsSamRouter();

router.use(
  // Resources should match with the template.yml api paths
  '/user/{type}/clients/{id+}',
  createController<HandlerType>({
    // should each be a HTTP method in lower case
    get: async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
      return { statusCode: 200, body: 'hello world' };
    },
  }),
);

/**
 * Expose and export the lambda handler
 */
export const lambdaHandler = router.expose();
```

## Setting middy middlewares

Sometimes you need middlewares capabilites. For that instance you might want to use [middy](https://middy.js.org/).

```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { HandlerType } from 'simple-lambda-api-router/dist/classes/AwsSamRouter';
import { createController } from 'simple-lambda-api-router/dist/utils/controller';

async function get(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  return { statusCode: 200, body: JSON.stringify({ event }) };
}

async function post(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  return { statusCode: 200, body: JSON.stringify({ event }) };
}

const middlewares = [httpErrorHandler(), httpEventNormalizer(), httpJsonBodyParser()];
const controller = createController<HandlerType>({
  get: middy(get).use(middlewares) as HandlerType,
  post: middy(post).use(middlewares) as HandlerType,
});

export default controller;
```

If you dont want to use middy you are free to use the library of your preference, but you should pass that function to the controller configuration object.
