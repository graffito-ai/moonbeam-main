"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AcknowledgeUpdatedTransactionHandler_1 = require("./handlers/AcknowledgeUpdatedTransactionHandler");
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
    console.log(`Received new updated transaction request from Olive, through operation [${route}], with arguments ${JSON.stringify(event.body)}`);
    // switch the requests, based on the HTTP Method Verb and Path
    switch (`${route}`) {
        case `POST/updatedTransactionsAcknowledgment`:
            // call the appropriate handler, in order to handle incoming transactions accordingly
            return (0, AcknowledgeUpdatedTransactionHandler_1.acknowledgeUpdatedTransaction)(route, event.body);
        default:
            // return a 405, and log the unknown/unsupported routing via the HTTP Method and Verb combination accordingly
            console.log(`Unknown HTTP Method and Path combination ${route}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYW1iZGEvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDBHQUE4RjtBQUM5RiwrREFBZ0U7QUFFaEU7Ozs7OztHQU1HO0FBQ0gsT0FBTyxDQUFDLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBMkIsRUFBa0MsRUFBRTtJQUNwRix3QkFBd0I7SUFDeEIsTUFBTSxLQUFLLEdBQUcsR0FBRyxLQUFLLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNqRCxPQUFPLENBQUMsR0FBRyxDQUFDLDJFQUEyRSxLQUFLLHFCQUFxQixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFL0ksOERBQThEO0lBQzlELFFBQVEsR0FBRyxLQUFLLEVBQUUsRUFBRTtRQUNoQixLQUFLLHdDQUF3QztZQUN6QyxxRkFBcUY7WUFDckYsT0FBTyxJQUFBLG9FQUE2QixFQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUQ7WUFDSSw2R0FBNkc7WUFDN0csT0FBTyxDQUFDLEdBQUcsQ0FBQyw0Q0FBNEMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUVqRSwrQkFBK0I7WUFDL0IsT0FBTztnQkFDSCxVQUFVLEVBQUUsR0FBRztnQkFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztvQkFDakIsSUFBSSxFQUFFLElBQUk7b0JBQ1YsU0FBUyxFQUFFLHVDQUFxQixDQUFDLGVBQWU7b0JBQ2hELFlBQVksRUFBRSwwQ0FBMEM7aUJBQzNELENBQUM7YUFDTCxDQUFBO0tBQ1I7QUFDTCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FQSUdhdGV3YXlQcm94eUV2ZW50LCBBUElHYXRld2F5UHJveHlSZXN1bHR9IGZyb20gXCJhd3MtbGFtYmRhL3RyaWdnZXIvYXBpLWdhdGV3YXktcHJveHlcIjtcbmltcG9ydCB7YWNrbm93bGVkZ2VVcGRhdGVkVHJhbnNhY3Rpb259IGZyb20gXCIuL2hhbmRsZXJzL0Fja25vd2xlZGdlVXBkYXRlZFRyYW5zYWN0aW9uSGFuZGxlclwiO1xuaW1wb3J0IHtUcmFuc2FjdGlvbnNFcnJvclR5cGV9IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogTGFtYmRhIEZ1bmN0aW9uIGhhbmRsZXIsIGhhbmRsaW5nIGluY29taW5nIHJlcXVlc3RzLFxuICogZGVwZW5kaW5nIG9uIHRoZSB0eXBlIG9mIGh0dHAgbWV0aG9kIGFuZCBwYXRoLCBtYXBwZWQgYnkgQVBJIEdhdGV3YXkuXG4gKlxuICogQHBhcmFtIGV2ZW50IEFQSUdhdGV3YXkgZXZlbnQgdG8gYmUgcGFzc2VkIGluIHRoZSBoYW5kbGVyXG4gKiBAcmV0dXJucyBhIHtAbGluayBQcm9taXNlfSBjb250YWluaW5nIGEge0BsaW5rIEFQSUdhdGV3YXlQcm94eVJlc3VsdH1cbiAqL1xuZXhwb3J0cy5oYW5kbGVyID0gYXN5bmMgKGV2ZW50OiBBUElHYXRld2F5UHJveHlFdmVudCk6IFByb21pc2U8QVBJR2F0ZXdheVByb3h5UmVzdWx0PiA9PiB7XG4gICAgLy8gcm91dGUgZm9yIHRoZSByZXF1ZXN0XG4gICAgY29uc3Qgcm91dGUgPSBgJHtldmVudC5odHRwTWV0aG9kfSR7ZXZlbnQucGF0aH1gO1xuICAgIGNvbnNvbGUubG9nKGBSZWNlaXZlZCBuZXcgdXBkYXRlZCB0cmFuc2FjdGlvbiByZXF1ZXN0IGZyb20gT2xpdmUsIHRocm91Z2ggb3BlcmF0aW9uIFske3JvdXRlfV0sIHdpdGggYXJndW1lbnRzICR7SlNPTi5zdHJpbmdpZnkoZXZlbnQuYm9keSl9YCk7XG5cbiAgICAvLyBzd2l0Y2ggdGhlIHJlcXVlc3RzLCBiYXNlZCBvbiB0aGUgSFRUUCBNZXRob2QgVmVyYiBhbmQgUGF0aFxuICAgIHN3aXRjaCAoYCR7cm91dGV9YCkge1xuICAgICAgICBjYXNlIGBQT1NUL3VwZGF0ZWRUcmFuc2FjdGlvbnNBY2tub3dsZWRnbWVudGA6XG4gICAgICAgICAgICAvLyBjYWxsIHRoZSBhcHByb3ByaWF0ZSBoYW5kbGVyLCBpbiBvcmRlciB0byBoYW5kbGUgaW5jb21pbmcgdHJhbnNhY3Rpb25zIGFjY29yZGluZ2x5XG4gICAgICAgICAgICByZXR1cm4gYWNrbm93bGVkZ2VVcGRhdGVkVHJhbnNhY3Rpb24ocm91dGUsIGV2ZW50LmJvZHkpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLy8gcmV0dXJuIGEgNDA1LCBhbmQgbG9nIHRoZSB1bmtub3duL3Vuc3VwcG9ydGVkIHJvdXRpbmcgdmlhIHRoZSBIVFRQIE1ldGhvZCBhbmQgVmVyYiBjb21iaW5hdGlvbiBhY2NvcmRpbmdseVxuICAgICAgICAgICAgY29uc29sZS5sb2coYFVua25vd24gSFRUUCBNZXRob2QgYW5kIFBhdGggY29tYmluYXRpb24gJHtyb3V0ZX1gKTtcblxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciBhY2NvcmRpbmdseVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiA0MDUsXG4gICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFRyYW5zYWN0aW9uc0Vycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogYE1ldGhvZCBub3Qgc3VwcG9ydGVkIGJ5IHRhcmdldCByZXNvdXJjZS5gXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICB9XG59XG5cbiJdfQ==