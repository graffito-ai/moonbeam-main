"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AcknowledgeTransactionHandler_1 = require("./handlers/AcknowledgeTransactionHandler");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * Lambda Function handler, handling incoming requests,
 * depending on the type of http method and path, mapped by API Gateway.
 *
 * @param event APIGateway event to be passed in the handler
 * @returns a {@link Promise} containing a {@link APIGatewayProxyResult}
 */
exports.handler = async (event) => {
    // route for the request
    const route = `${event.httpMethod}${event.path}`;
    console.log(`Received new transaction request from Olive, through operation [${route}], with arguments ${JSON.stringify(event.body)}`);
    // switch the requests, based on the HTTP Method Verb and Path
    switch (`${route}`) {
        case `POST/transactionsAcknowledgment`:
            // call the appropriate handler, in order to handle incoming transactions accordingly
            return (0, AcknowledgeTransactionHandler_1.acknowledgeTransaction)(route, event.body);
        default:
            // return a 405, and log the unknown/unsupported routing via the HTTP Method and Verb combination accordingly
            console.log(`Unknown HTTP Method and Path combination ${event.httpMethod}${event.path}`);
            // return the error accordingly
            return {
                statusCode: 405,
                body: JSON.stringify({
                    data: null,
                    errorType: moonbeam_models_1.TransactionsErrorType.UnexpectedError,
                    errorMessage: `Method not supported by target resource.`
                })
            };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYW1iZGEvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDRGQUFnRjtBQUNoRiwrREFBZ0U7QUFFaEU7Ozs7OztHQU1HO0FBQ0gsT0FBTyxDQUFDLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBMkIsRUFBa0MsRUFBRTtJQUNwRix3QkFBd0I7SUFDeEIsTUFBTSxLQUFLLEdBQUcsR0FBRyxLQUFLLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNqRCxPQUFPLENBQUMsR0FBRyxDQUFDLG1FQUFtRSxLQUFLLHFCQUFxQixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFdkksOERBQThEO0lBQzlELFFBQVEsR0FBRyxLQUFLLEVBQUUsRUFBRTtRQUNoQixLQUFLLGlDQUFpQztZQUNsQyxxRkFBcUY7WUFDckYsT0FBTyxJQUFBLHNEQUFzQixFQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckQ7WUFDSSw2R0FBNkc7WUFDN0csT0FBTyxDQUFDLEdBQUcsQ0FBQyw0Q0FBNEMsS0FBSyxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUV6RiwrQkFBK0I7WUFDL0IsT0FBTztnQkFDSCxVQUFVLEVBQUUsR0FBRztnQkFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztvQkFDakIsSUFBSSxFQUFFLElBQUk7b0JBQ1YsU0FBUyxFQUFFLHVDQUFxQixDQUFDLGVBQWU7b0JBQ2hELFlBQVksRUFBRSwwQ0FBMEM7aUJBQzNELENBQUM7YUFDTCxDQUFBO0tBQ1I7QUFDTCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FQSUdhdGV3YXlQcm94eUV2ZW50LCBBUElHYXRld2F5UHJveHlSZXN1bHR9IGZyb20gXCJhd3MtbGFtYmRhL3RyaWdnZXIvYXBpLWdhdGV3YXktcHJveHlcIjtcbmltcG9ydCB7YWNrbm93bGVkZ2VUcmFuc2FjdGlvbn0gZnJvbSBcIi4vaGFuZGxlcnMvQWNrbm93bGVkZ2VUcmFuc2FjdGlvbkhhbmRsZXJcIjtcbmltcG9ydCB7VHJhbnNhY3Rpb25zRXJyb3JUeXBlfSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuXG4vKipcbiAqIExhbWJkYSBGdW5jdGlvbiBoYW5kbGVyLCBoYW5kbGluZyBpbmNvbWluZyByZXF1ZXN0cyxcbiAqIGRlcGVuZGluZyBvbiB0aGUgdHlwZSBvZiBodHRwIG1ldGhvZCBhbmQgcGF0aCwgbWFwcGVkIGJ5IEFQSSBHYXRld2F5LlxuICpcbiAqIEBwYXJhbSBldmVudCBBUElHYXRld2F5IGV2ZW50IHRvIGJlIHBhc3NlZCBpbiB0aGUgaGFuZGxlclxuICogQHJldHVybnMgYSB7QGxpbmsgUHJvbWlzZX0gY29udGFpbmluZyBhIHtAbGluayBBUElHYXRld2F5UHJveHlSZXN1bHR9XG4gKi9cbmV4cG9ydHMuaGFuZGxlciA9IGFzeW5jIChldmVudDogQVBJR2F0ZXdheVByb3h5RXZlbnQpOiBQcm9taXNlPEFQSUdhdGV3YXlQcm94eVJlc3VsdD4gPT4ge1xuICAgIC8vIHJvdXRlIGZvciB0aGUgcmVxdWVzdFxuICAgIGNvbnN0IHJvdXRlID0gYCR7ZXZlbnQuaHR0cE1ldGhvZH0ke2V2ZW50LnBhdGh9YDtcbiAgICBjb25zb2xlLmxvZyhgUmVjZWl2ZWQgbmV3IHRyYW5zYWN0aW9uIHJlcXVlc3QgZnJvbSBPbGl2ZSwgdGhyb3VnaCBvcGVyYXRpb24gWyR7cm91dGV9XSwgd2l0aCBhcmd1bWVudHMgJHtKU09OLnN0cmluZ2lmeShldmVudC5ib2R5KX1gKTtcblxuICAgIC8vIHN3aXRjaCB0aGUgcmVxdWVzdHMsIGJhc2VkIG9uIHRoZSBIVFRQIE1ldGhvZCBWZXJiIGFuZCBQYXRoXG4gICAgc3dpdGNoIChgJHtyb3V0ZX1gKSB7XG4gICAgICAgIGNhc2UgYFBPU1QvdHJhbnNhY3Rpb25zQWNrbm93bGVkZ21lbnRgOlxuICAgICAgICAgICAgLy8gY2FsbCB0aGUgYXBwcm9wcmlhdGUgaGFuZGxlciwgaW4gb3JkZXIgdG8gaGFuZGxlIGluY29taW5nIHRyYW5zYWN0aW9ucyBhY2NvcmRpbmdseVxuICAgICAgICAgICAgcmV0dXJuIGFja25vd2xlZGdlVHJhbnNhY3Rpb24ocm91dGUsIGV2ZW50LmJvZHkpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLy8gcmV0dXJuIGEgNDA1LCBhbmQgbG9nIHRoZSB1bmtub3duL3Vuc3VwcG9ydGVkIHJvdXRpbmcgdmlhIHRoZSBIVFRQIE1ldGhvZCBhbmQgVmVyYiBjb21iaW5hdGlvbiBhY2NvcmRpbmdseVxuICAgICAgICAgICAgY29uc29sZS5sb2coYFVua25vd24gSFRUUCBNZXRob2QgYW5kIFBhdGggY29tYmluYXRpb24gJHtldmVudC5odHRwTWV0aG9kfSR7ZXZlbnQucGF0aH1gKTtcblxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciBhY2NvcmRpbmdseVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiA0MDUsXG4gICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYE1ldGhvZCBub3Qgc3VwcG9ydGVkIGJ5IHRhcmdldCByZXNvdXJjZS5gXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICB9XG59XG5cbiJdfQ==