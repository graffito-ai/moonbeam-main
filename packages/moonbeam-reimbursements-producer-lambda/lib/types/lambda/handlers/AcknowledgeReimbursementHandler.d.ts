import { APIGatewayProxyResult } from "aws-lambda/trigger/api-gateway-proxy";
/**
 * AcknowledgeReimbursement handler
 *
 * @param route request route, composed of HTTP Verb and HTTP Path
 * @param requestBody request body input, passed by the caller through the API Gateway event
 *
 * @returns {@link Promise} of {@link APIGatewayProxyResult}
 */
export declare const acknowledgeReimbursement: (route: string, requestBody: string | null) => Promise<APIGatewayProxyResult>;