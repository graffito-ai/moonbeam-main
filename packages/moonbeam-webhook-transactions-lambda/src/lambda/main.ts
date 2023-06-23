import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda/trigger/api-gateway-proxy";

/**
 * Lambda Function handler, handling incoming events,
 * depending on the type of http method and path, mapped by API Gateway.
 *
 * @param event APIGateway event to be passed in the handler
 * @returns a {@link Promise} containing a {@link APIGatewayProxyResult}
 */
exports.handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log(`Received new storage event for operation [${event.httpMethod}${event.path}], with arguments ${JSON.stringify(event.body)}`);

    // return a dummy response for testing purposes
    return {
        statusCode: 200,
        body: JSON.stringify({
            data: 'hello world'
        })
    }
}

