import {APIGatewayProxyResult} from "aws-lambda/trigger/api-gateway-proxy";
import {PlaidLinkingErrorType} from "@moonbeam/moonbeam-models";

/**
 * AcknowledgePlaidUpdates handler
 *
 * @param route request route, composed of HTTP Verb and HTTP Path
 * @param requestBody request body input, passed by the caller through the API Gateway event
 *
 * @returns {@link Promise} of {@link APIGatewayProxyResult}
 */
export const acknowledgePlaidUpdate = async (route: string, requestBody: string | null): Promise<APIGatewayProxyResult> => {
    try {
        // retrieving the current function region
        // const region = process.env.AWS_REGION!;

        // first check whether we have a valid request body.
        if (requestBody !== undefined && requestBody !== null && requestBody.length !== 0) {
            // parse the incoming request body data as a JSON object
            const requestBodyParsed = JSON.parse(requestBody);
            // const requestData = requestBodyParsed["data"] ? requestBodyParsed["data"] : null;

            console.log(JSON.stringify(requestBodyParsed));
            return {
                statusCode: 200,
                body: JSON.stringify({
                    data: requestBodyParsed
                })
            }
        } else {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    errorType: PlaidLinkingErrorType.UnexpectedError,
                    errorMessage: ""
                })
            }
        }
    } catch (error) {
        const errorMessage = `Unexpected error while processing ${route} request`;
        console.log(`${errorMessage} ${error}`);

        /**
         * return the error accordingly
         * Olive will retry sending this message upon receiving of a non 2XX code
         */
        return {
            statusCode: 500,
            body: JSON.stringify({
                data: null,
                errorType: PlaidLinkingErrorType.UnexpectedError,
                errorMessage: errorMessage
            })
        }
    }
}
