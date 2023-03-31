# simple-lambda-api-router

Simple and lightweight lambda api router.

# Usage with AWS SAM

```typescript
import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AwsSamRouter, { HandlerType } from '@mv/simple-lambda-api-router/dist/classes/AwsSamRouter';
import { createController } from '@mv/simple-lambda-api-router/dist/utils/controller';

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
