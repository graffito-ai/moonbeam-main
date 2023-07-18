import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda/trigger/api-gateway-proxy";
import {acknowledgeTransaction} from "./handlers/AcknowledgeTransactionHandler";
import {TransactionsErrorType} from "@moonbeam/moonbeam-models";

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
    console.log(`Received new transaction request from Olive, through operation [${route}], with arguments ${JSON.stringify(event.body)}`);

    // switch the requests, based on the HTTP Method Verb and Path
    switch (`${route}`) {
        case `POST/transactionsAcknowledgment`:
            // call the appropriate handler, in order to handle incoming transactions accordingly
            return acknowledgeTransaction(route, event.body);
        default:
            // return a 405, and log the unknown/unsupported routing via the HTTP Method and Verb combination accordingly
            console.log(`Unknown HTTP Method and Path combination ${route}`);

            // return the error accordingly
            return {
                statusCode: 405,
                body: JSON.stringify({
                    data: null,
                    errorType: TransactionsErrorType.UnexpectedError,
                    errorMessage: `Method not supported by target resource.`
                })
            }
    }
}

