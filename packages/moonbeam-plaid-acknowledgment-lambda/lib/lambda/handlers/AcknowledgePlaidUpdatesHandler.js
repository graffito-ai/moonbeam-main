"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acknowledgePlaidUpdate = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * AcknowledgePlaidUpdates handler
 *
 * @param route request route, composed of HTTP Verb and HTTP Path
 * @param requestBody request body input, passed by the caller through the API Gateway event
 *
 * @returns {@link Promise} of {@link APIGatewayProxyResult}
 */
const acknowledgePlaidUpdate = async (route, requestBody) => {
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
            };
        }
        else {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    errorType: moonbeam_models_1.PlaidLinkingErrorType.UnexpectedError,
                    errorMessage: ""
                })
            };
        }
    }
    catch (error) {
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
                errorType: moonbeam_models_1.PlaidLinkingErrorType.UnexpectedError,
                errorMessage: errorMessage
            })
        };
    }
};
exports.acknowledgePlaidUpdate = acknowledgePlaidUpdate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNrbm93bGVkZ2VQbGFpZFVwZGF0ZXNIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9oYW5kbGVycy9BY2tub3dsZWRnZVBsYWlkVXBkYXRlc0hhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsK0RBQWdFO0FBRWhFOzs7Ozs7O0dBT0c7QUFDSSxNQUFNLHNCQUFzQixHQUFHLEtBQUssRUFBRSxLQUFhLEVBQUUsV0FBMEIsRUFBa0MsRUFBRTtJQUN0SCxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLDBDQUEwQztRQUUxQyxvREFBb0Q7UUFDcEQsSUFBSSxXQUFXLEtBQUssU0FBUyxJQUFJLFdBQVcsS0FBSyxJQUFJLElBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDL0Usd0RBQXdEO1lBQ3hELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNsRCxvRkFBb0Y7WUFFcEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztZQUMvQyxPQUFPO2dCQUNILFVBQVUsRUFBRSxHQUFHO2dCQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO29CQUNqQixJQUFJLEVBQUUsaUJBQWlCO2lCQUMxQixDQUFDO2FBQ0wsQ0FBQTtTQUNKO2FBQU07WUFDSCxPQUFPO2dCQUNILFVBQVUsRUFBRSxHQUFHO2dCQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO29CQUNqQixTQUFTLEVBQUUsdUNBQXFCLENBQUMsZUFBZTtvQkFDaEQsWUFBWSxFQUFFLEVBQUU7aUJBQ25CLENBQUM7YUFDTCxDQUFBO1NBQ0o7S0FDSjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osTUFBTSxZQUFZLEdBQUcscUNBQXFDLEtBQUssVUFBVSxDQUFDO1FBQzFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxZQUFZLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztRQUV4Qzs7O1dBR0c7UUFDSCxPQUFPO1lBQ0gsVUFBVSxFQUFFLEdBQUc7WUFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDakIsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsU0FBUyxFQUFFLHVDQUFxQixDQUFDLGVBQWU7Z0JBQ2hELFlBQVksRUFBRSxZQUFZO2FBQzdCLENBQUM7U0FDTCxDQUFBO0tBQ0o7QUFDTCxDQUFDLENBQUE7QUE1Q1ksUUFBQSxzQkFBc0IsMEJBNENsQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QVBJR2F0ZXdheVByb3h5UmVzdWx0fSBmcm9tIFwiYXdzLWxhbWJkYS90cmlnZ2VyL2FwaS1nYXRld2F5LXByb3h5XCI7XG5pbXBvcnQge1BsYWlkTGlua2luZ0Vycm9yVHlwZX0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBBY2tub3dsZWRnZVBsYWlkVXBkYXRlcyBoYW5kbGVyXG4gKlxuICogQHBhcmFtIHJvdXRlIHJlcXVlc3Qgcm91dGUsIGNvbXBvc2VkIG9mIEhUVFAgVmVyYiBhbmQgSFRUUCBQYXRoXG4gKiBAcGFyYW0gcmVxdWVzdEJvZHkgcmVxdWVzdCBib2R5IGlucHV0LCBwYXNzZWQgYnkgdGhlIGNhbGxlciB0aHJvdWdoIHRoZSBBUEkgR2F0ZXdheSBldmVudFxuICpcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgQVBJR2F0ZXdheVByb3h5UmVzdWx0fVxuICovXG5leHBvcnQgY29uc3QgYWNrbm93bGVkZ2VQbGFpZFVwZGF0ZSA9IGFzeW5jIChyb3V0ZTogc3RyaW5nLCByZXF1ZXN0Qm9keTogc3RyaW5nIHwgbnVsbCk6IFByb21pc2U8QVBJR2F0ZXdheVByb3h5UmVzdWx0PiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgLy8gY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLy8gZmlyc3QgY2hlY2sgd2hldGhlciB3ZSBoYXZlIGEgdmFsaWQgcmVxdWVzdCBib2R5LlxuICAgICAgICBpZiAocmVxdWVzdEJvZHkgIT09IHVuZGVmaW5lZCAmJiByZXF1ZXN0Qm9keSAhPT0gbnVsbCAmJiByZXF1ZXN0Qm9keS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgIC8vIHBhcnNlIHRoZSBpbmNvbWluZyByZXF1ZXN0IGJvZHkgZGF0YSBhcyBhIEpTT04gb2JqZWN0XG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0Qm9keVBhcnNlZCA9IEpTT04ucGFyc2UocmVxdWVzdEJvZHkpO1xuICAgICAgICAgICAgLy8gY29uc3QgcmVxdWVzdERhdGEgPSByZXF1ZXN0Qm9keVBhcnNlZFtcImRhdGFcIl0gPyByZXF1ZXN0Qm9keVBhcnNlZFtcImRhdGFcIl0gOiBudWxsO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShyZXF1ZXN0Qm9keVBhcnNlZCkpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiAyMDAsXG4gICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiByZXF1ZXN0Qm9keVBhcnNlZFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDIwMCxcbiAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUGxhaWRMaW5raW5nRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvcixcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBcIlwiXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHByb2Nlc3NpbmcgJHtyb3V0ZX0gcmVxdWVzdGA7XG4gICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJvcn1gKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogcmV0dXJuIHRoZSBlcnJvciBhY2NvcmRpbmdseVxuICAgICAgICAgKiBPbGl2ZSB3aWxsIHJldHJ5IHNlbmRpbmcgdGhpcyBtZXNzYWdlIHVwb24gcmVjZWl2aW5nIG9mIGEgbm9uIDJYWCBjb2RlXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBQbGFpZExpbmtpbmdFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yLFxuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxufVxuIl19