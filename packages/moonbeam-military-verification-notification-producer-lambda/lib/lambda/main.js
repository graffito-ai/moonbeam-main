"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AcknowledgeMilitaryVerificationUpdateHandler_1 = require("./handlers/AcknowledgeMilitaryVerificationUpdateHandler");
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
    console.log(`Received new military verification update request, through operation [${route}], with arguments ${JSON.stringify(event.body)}`);
    // switch the requests, based on the HTTP Method Verb and Path
    switch (`${route}`) {
        case `POST/militaryVerificationUpdatesAcknowledgment`:
            // call the appropriate handler, in order to handle incoming military verification updates/notifications accordingly
            return (0, AcknowledgeMilitaryVerificationUpdateHandler_1.acknowledgeMilitaryVerificationUpdate)(route, event.body);
        default:
            // return a 405, and log the unknown/unsupported routing via the HTTP Method and Verb combination accordingly
            console.log(`Unknown HTTP Method and Path combination ${route}`);
            // return the error accordingly
            return {
                statusCode: 405,
                body: JSON.stringify({
                    data: null,
                    errorType: moonbeam_models_1.MilitaryVerificationErrorType.UnexpectedError,
                    errorMessage: `Method not supported by target resource.`
                })
            };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYW1iZGEvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDBIQUE4RztBQUM5RywrREFBd0U7QUFFeEU7Ozs7OztHQU1HO0FBQ0gsT0FBTyxDQUFDLE9BQU8sR0FBRyxLQUFLLEVBQUUsS0FBMkIsRUFBa0MsRUFBRTtJQUNwRix3QkFBd0I7SUFDeEIsTUFBTSxLQUFLLEdBQUcsR0FBRyxLQUFLLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNqRCxPQUFPLENBQUMsR0FBRyxDQUFDLHlFQUF5RSxLQUFLLHFCQUFxQixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFN0ksOERBQThEO0lBQzlELFFBQVEsR0FBRyxLQUFLLEVBQUUsRUFBRTtRQUNoQixLQUFLLGdEQUFnRDtZQUNqRCxvSEFBb0g7WUFDcEgsT0FBTyxJQUFBLG9GQUFxQyxFQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEU7WUFDSSw2R0FBNkc7WUFDN0csT0FBTyxDQUFDLEdBQUcsQ0FBQyw0Q0FBNEMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUVqRSwrQkFBK0I7WUFDL0IsT0FBTztnQkFDSCxVQUFVLEVBQUUsR0FBRztnQkFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztvQkFDakIsSUFBSSxFQUFFLElBQUk7b0JBQ1YsU0FBUyxFQUFFLCtDQUE2QixDQUFDLGVBQWU7b0JBQ3hELFlBQVksRUFBRSwwQ0FBMEM7aUJBQzNELENBQUM7YUFDTCxDQUFBO0tBQ1I7QUFDTCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0FQSUdhdGV3YXlQcm94eUV2ZW50LCBBUElHYXRld2F5UHJveHlSZXN1bHR9IGZyb20gXCJhd3MtbGFtYmRhL3RyaWdnZXIvYXBpLWdhdGV3YXktcHJveHlcIjtcbmltcG9ydCB7YWNrbm93bGVkZ2VNaWxpdGFyeVZlcmlmaWNhdGlvblVwZGF0ZX0gZnJvbSBcIi4vaGFuZGxlcnMvQWNrbm93bGVkZ2VNaWxpdGFyeVZlcmlmaWNhdGlvblVwZGF0ZUhhbmRsZXJcIjtcbmltcG9ydCB7TWlsaXRhcnlWZXJpZmljYXRpb25FcnJvclR5cGV9IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5cbi8qKlxuICogTGFtYmRhIEZ1bmN0aW9uIGhhbmRsZXIsIGhhbmRsaW5nIGluY29taW5nIHJlcXVlc3RzLFxuICogZGVwZW5kaW5nIG9uIHRoZSB0eXBlIG9mIGh0dHAgbWV0aG9kIGFuZCBwYXRoLCBtYXBwZWQgYnkgQVBJIEdhdGV3YXkuXG4gKlxuICogQHBhcmFtIGV2ZW50IEFQSUdhdGV3YXkgZXZlbnQgdG8gYmUgcGFzc2VkIGluIHRoZSBoYW5kbGVyXG4gKiBAcmV0dXJucyBhIHtAbGluayBQcm9taXNlfSBjb250YWluaW5nIGEge0BsaW5rIEFQSUdhdGV3YXlQcm94eVJlc3VsdH1cbiAqL1xuZXhwb3J0cy5oYW5kbGVyID0gYXN5bmMgKGV2ZW50OiBBUElHYXRld2F5UHJveHlFdmVudCk6IFByb21pc2U8QVBJR2F0ZXdheVByb3h5UmVzdWx0PiA9PiB7XG4gICAgLy8gcm91dGUgZm9yIHRoZSByZXF1ZXN0XG4gICAgY29uc3Qgcm91dGUgPSBgJHtldmVudC5odHRwTWV0aG9kfSR7ZXZlbnQucGF0aH1gO1xuICAgIGNvbnNvbGUubG9nKGBSZWNlaXZlZCBuZXcgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHVwZGF0ZSByZXF1ZXN0LCB0aHJvdWdoIG9wZXJhdGlvbiBbJHtyb3V0ZX1dLCB3aXRoIGFyZ3VtZW50cyAke0pTT04uc3RyaW5naWZ5KGV2ZW50LmJvZHkpfWApO1xuXG4gICAgLy8gc3dpdGNoIHRoZSByZXF1ZXN0cywgYmFzZWQgb24gdGhlIEhUVFAgTWV0aG9kIFZlcmIgYW5kIFBhdGhcbiAgICBzd2l0Y2ggKGAke3JvdXRlfWApIHtcbiAgICAgICAgY2FzZSBgUE9TVC9taWxpdGFyeVZlcmlmaWNhdGlvblVwZGF0ZXNBY2tub3dsZWRnbWVudGA6XG4gICAgICAgICAgICAvLyBjYWxsIHRoZSBhcHByb3ByaWF0ZSBoYW5kbGVyLCBpbiBvcmRlciB0byBoYW5kbGUgaW5jb21pbmcgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIHVwZGF0ZXMvbm90aWZpY2F0aW9ucyBhY2NvcmRpbmdseVxuICAgICAgICAgICAgcmV0dXJuIGFja25vd2xlZGdlTWlsaXRhcnlWZXJpZmljYXRpb25VcGRhdGUocm91dGUsIGV2ZW50LmJvZHkpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLy8gcmV0dXJuIGEgNDA1LCBhbmQgbG9nIHRoZSB1bmtub3duL3Vuc3VwcG9ydGVkIHJvdXRpbmcgdmlhIHRoZSBIVFRQIE1ldGhvZCBhbmQgVmVyYiBjb21iaW5hdGlvbiBhY2NvcmRpbmdseVxuICAgICAgICAgICAgY29uc29sZS5sb2coYFVua25vd24gSFRUUCBNZXRob2QgYW5kIFBhdGggY29tYmluYXRpb24gJHtyb3V0ZX1gKTtcblxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciBhY2NvcmRpbmdseVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiA0MDUsXG4gICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IE1pbGl0YXJ5VmVyaWZpY2F0aW9uRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvcixcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgTWV0aG9kIG5vdCBzdXBwb3J0ZWQgYnkgdGFyZ2V0IHJlc291cmNlLmBcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgIH1cbn1cblxuIl19