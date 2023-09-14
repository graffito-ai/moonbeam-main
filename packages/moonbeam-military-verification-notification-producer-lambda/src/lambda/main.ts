import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda/trigger/api-gateway-proxy";
import {acknowledgeMilitaryVerificationUpdate} from "./handlers/AcknowledgeMilitaryVerificationUpdateHandler";
import {MilitaryVerificationErrorType} from "@moonbeam/moonbeam-models";

/**
 * Lambda Function handler, handling incoming requests,
 * depending on the type of http method and path, mapped by API Gateway.
 *
 * @param event APIGateway event to be passed in the handler
 * @returns a {@link Promise} containing a {@link APIGatewayProxyResult}
 */
exports.handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // route for the request
    const route = `${event.httpMethod}${event.path}`;
    console.log(`Received new military verification update request, through operation [${route}], with arguments ${JSON.stringify(event.body)}`);

    // switch the requests, based on the HTTP Method Verb and Path
    switch (`${route}`) {
        case `POST/militaryVerificationUpdatesAcknowledgment`:
            // call the appropriate handler, in order to handle incoming military verification updates/notifications accordingly
            return acknowledgeMilitaryVerificationUpdate(route, event.body);
        default:
            // return a 405, and log the unknown/unsupported routing via the HTTP Method and Verb combination accordingly
            console.log(`Unknown HTTP Method and Path combination ${route}`);

            // return the error accordingly
            return {
                statusCode: 405,
                body: JSON.stringify({
                    data: null,
                    errorType: MilitaryVerificationErrorType.UnexpectedError,
                    errorMessage: `Method not supported by target resource.`
                })
            }
    }
}

