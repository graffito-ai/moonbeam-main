"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processOfferRedeemedTransactions = void 0;
/**
 * OfferRedeemedProcessorHandler handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the transaction
 * message information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
const processOfferRedeemedTransactions = async (event) => {
    try {
        // retrieving the current function region
        // const region = process.env.AWS_REGION!;
        // TODO:
        //      1) Call the GET brand details Olive API to retrieve the brand name for transaction
        //      2) Call the GET store details Olive API to retrieve the brand store address for transaction
        //      3) Convert any necessary timestamps and created/updated at times to appropriate formats
        //      4) Call the createTransaction Moonbeam AppSync API endpoint, to store transaction in Dynamo DB database
        //      5) Return the appropriate responses for happy and/or unhappy paths
        /**
         * for the Lambda to indicate SQS that there have been no failures, and thus enable the deletion of all processed messages
         * from the queue, we have to return an empty batchItemFailures array here.
         *
         * @link https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
         */
        return {
            batchItemFailures: []
        };
    }
    catch (error) {
        const errorMessage = `Unexpected error while processing ${JSON.stringify(event)} transactional event`;
        console.log(`${errorMessage} ${error}`);
        /**
         * returns a batch response failure for the particular message IDs which failed
         * in this case, the Lambda function DOES NOT delete the incoming messages from the queue, and it makes it available/visible again
         *
         * @link https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
         */
        return {
            batchItemFailures: [{
                    // for this case, we only process 1 record at a time, we might need to change this in the future
                    itemIdentifier: event.Records[0].messageId
                }]
        };
    }
};
exports.processOfferRedeemedTransactions = processOfferRedeemedTransactions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2ZmZXJSZWRlZW1lZFByb2Nlc3NvckhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL2hhbmRsZXJzL09mZmVyUmVkZWVtZWRQcm9jZXNzb3JIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBOzs7Ozs7R0FNRztBQUNJLE1BQU0sZ0NBQWdDLEdBQUcsS0FBSyxFQUFFLEtBQWUsRUFBNkIsRUFBRTtJQUNqRyxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLDBDQUEwQztRQUUxQyxRQUFRO1FBQ1IsMEZBQTBGO1FBQzFGLG1HQUFtRztRQUNuRywrRkFBK0Y7UUFDL0YsK0dBQStHO1FBQy9HLDBFQUEwRTtRQUUxRTs7Ozs7V0FLRztRQUNILE9BQU87WUFDSCxpQkFBaUIsRUFBRSxFQUFFO1NBQ3hCLENBQUE7S0FDSjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osTUFBTSxZQUFZLEdBQUcscUNBQXFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDO1FBQ3RHLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxZQUFZLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztRQUV4Qzs7Ozs7V0FLRztRQUNILE9BQU87WUFDSCxpQkFBaUIsRUFBRSxDQUFDO29CQUNoQixnR0FBZ0c7b0JBQ2hHLGNBQWMsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7aUJBQzdDLENBQUM7U0FDTCxDQUFBO0tBQ0o7QUFDTCxDQUFDLENBQUE7QUF0Q1ksUUFBQSxnQ0FBZ0Msb0NBc0M1QyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7U1FTQmF0Y2hSZXNwb25zZSwgU1FTRXZlbnR9IGZyb20gXCJhd3MtbGFtYmRhXCI7XG5cbi8qKlxuICogT2ZmZXJSZWRlZW1lZFByb2Nlc3NvckhhbmRsZXIgaGFuZGxlclxuICpcbiAqIEBwYXJhbSBldmVudCB0aGUge0BsaW5rIFNRU0V2ZW50fSB0byBiZSBwcm9jZXNzZWQsIGNvbnRhaW5pbmcgdGhlIHRyYW5zYWN0aW9uXG4gKiBtZXNzYWdlIGluZm9ybWF0aW9uXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIFNRU0JhdGNoUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBwcm9jZXNzT2ZmZXJSZWRlZW1lZFRyYW5zYWN0aW9ucyA9IGFzeW5jIChldmVudDogU1FTRXZlbnQpOiBQcm9taXNlPFNRU0JhdGNoUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICAvLyBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBUT0RPOlxuICAgICAgICAvLyAgICAgIDEpIENhbGwgdGhlIEdFVCBicmFuZCBkZXRhaWxzIE9saXZlIEFQSSB0byByZXRyaWV2ZSB0aGUgYnJhbmQgbmFtZSBmb3IgdHJhbnNhY3Rpb25cbiAgICAgICAgLy8gICAgICAyKSBDYWxsIHRoZSBHRVQgc3RvcmUgZGV0YWlscyBPbGl2ZSBBUEkgdG8gcmV0cmlldmUgdGhlIGJyYW5kIHN0b3JlIGFkZHJlc3MgZm9yIHRyYW5zYWN0aW9uXG4gICAgICAgIC8vICAgICAgMykgQ29udmVydCBhbnkgbmVjZXNzYXJ5IHRpbWVzdGFtcHMgYW5kIGNyZWF0ZWQvdXBkYXRlZCBhdCB0aW1lcyB0byBhcHByb3ByaWF0ZSBmb3JtYXRzXG4gICAgICAgIC8vICAgICAgNCkgQ2FsbCB0aGUgY3JlYXRlVHJhbnNhY3Rpb24gTW9vbmJlYW0gQXBwU3luYyBBUEkgZW5kcG9pbnQsIHRvIHN0b3JlIHRyYW5zYWN0aW9uIGluIER5bmFtbyBEQiBkYXRhYmFzZVxuICAgICAgICAvLyAgICAgIDUpIFJldHVybiB0aGUgYXBwcm9wcmlhdGUgcmVzcG9uc2VzIGZvciBoYXBweSBhbmQvb3IgdW5oYXBweSBwYXRoc1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBmb3IgdGhlIExhbWJkYSB0byBpbmRpY2F0ZSBTUVMgdGhhdCB0aGVyZSBoYXZlIGJlZW4gbm8gZmFpbHVyZXMsIGFuZCB0aHVzIGVuYWJsZSB0aGUgZGVsZXRpb24gb2YgYWxsIHByb2Nlc3NlZCBtZXNzYWdlc1xuICAgICAgICAgKiBmcm9tIHRoZSBxdWV1ZSwgd2UgaGF2ZSB0byByZXR1cm4gYW4gZW1wdHkgYmF0Y2hJdGVtRmFpbHVyZXMgYXJyYXkgaGVyZS5cbiAgICAgICAgICpcbiAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2xhbWJkYS9sYXRlc3QvZGcvd2l0aC1zcXMuaHRtbFxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGJhdGNoSXRlbUZhaWx1cmVzOiBbXVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgcHJvY2Vzc2luZyAke0pTT04uc3RyaW5naWZ5KGV2ZW50KX0gdHJhbnNhY3Rpb25hbCBldmVudGA7XG4gICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtlcnJvcn1gKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogcmV0dXJucyBhIGJhdGNoIHJlc3BvbnNlIGZhaWx1cmUgZm9yIHRoZSBwYXJ0aWN1bGFyIG1lc3NhZ2UgSURzIHdoaWNoIGZhaWxlZFxuICAgICAgICAgKiBpbiB0aGlzIGNhc2UsIHRoZSBMYW1iZGEgZnVuY3Rpb24gRE9FUyBOT1QgZGVsZXRlIHRoZSBpbmNvbWluZyBtZXNzYWdlcyBmcm9tIHRoZSBxdWV1ZSwgYW5kIGl0IG1ha2VzIGl0IGF2YWlsYWJsZS92aXNpYmxlIGFnYWluXG4gICAgICAgICAqXG4gICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9sYW1iZGEvbGF0ZXN0L2RnL3dpdGgtc3FzLmh0bWxcbiAgICAgICAgICovXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBiYXRjaEl0ZW1GYWlsdXJlczogW3tcbiAgICAgICAgICAgICAgICAvLyBmb3IgdGhpcyBjYXNlLCB3ZSBvbmx5IHByb2Nlc3MgMSByZWNvcmQgYXQgYSB0aW1lLCB3ZSBtaWdodCBuZWVkIHRvIGNoYW5nZSB0aGlzIGluIHRoZSBmdXR1cmVcbiAgICAgICAgICAgICAgICBpdGVtSWRlbnRpZmllcjogZXZlbnQuUmVjb3Jkc1swXS5tZXNzYWdlSWRcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=