"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acknowledgeReimbursement = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_sns_1 = require("@aws-sdk/client-sns");
/**
 * AcknowledgeReimbursement handler
 *
 * @param route request route, composed of HTTP Verb and HTTP Path
 * @param requestBody request body input, passed by the caller through the API Gateway event
 *
 * @returns {@link Promise} of {@link APIGatewayProxyResult}
 */
const acknowledgeReimbursement = async (route, requestBody) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // first check whether we have a valid request body.
        if (requestBody) {
            // parse the incoming request body data as a JSON object
            const requestBodyParsed = JSON.parse(requestBody);
            // perform some validations based on what is expected in terms of the incoming data model and its mapping
            if (requestBodyParsed["id"] && requestBodyParsed["cardId"] && requestBodyParsed["memberId"]) {
                // build the eligible linked user object from the incoming request body
                const eligibleLinkedUser = requestBodyParsed;
                // initializing the SNS Client
                const snsClient = new client_sns_1.SNSClient({ region: region });
                /**
                 * drop the eligible linked user as a message to the reimbursements processing topic
                 */
                const reimbursementReceipt = await snsClient.send(new client_sns_1.PublishCommand({
                    TopicArn: process.env.REIMBURSEMENTS_PROCESSING_TOPIC_ARN,
                    Message: JSON.stringify(eligibleLinkedUser),
                    /**
                     * the message group id, will be represented by the Olive member id, so that we can group reimbursement messages for a particular member id,
                     * associated to a Moonbeam user id, and sort them in the FIFO processing topic accordingly.
                     */
                    MessageGroupId: eligibleLinkedUser.memberId
                }));
                // ensure that the reimbursement message was properly sent to the appropriate processing topic
                if (reimbursementReceipt && reimbursementReceipt.MessageId && reimbursementReceipt.MessageId.length !== 0 &&
                    reimbursementReceipt.SequenceNumber && reimbursementReceipt.SequenceNumber.length !== 0) {
                    /**
                     * the eligible linked user has been successfully dropped into the topic, and will be picked up by the reimbursements consumer and other
                     * services, like the notifications service consumer.
                     */
                    console.log(`Eligible linked user for reimbursements, successfully sent to topic for processing with receipt information: ${reimbursementReceipt.MessageId} ${reimbursementReceipt.SequenceNumber}`);
                    return {
                        statusCode: 202,
                        body: JSON.stringify({
                            data: `Reimbursement acknowledged!`
                        })
                    };
                }
                else {
                    const errorMessage = `Unexpected error while sending the reimbursement message further!`;
                    console.log(errorMessage);
                    /**
                     * if there are errors associated with sending the message to the topic.
                     * We will need to retry sending this message upon receiving of a non 2XX code
                     */
                    return {
                        statusCode: 424,
                        body: JSON.stringify({
                            data: null,
                            errorType: moonbeam_models_1.TransactionsErrorType.Unprocessable,
                            errorMessage: errorMessage
                        })
                    };
                }
            }
            else {
                const errorMessage = `Reimbursement object is not possible to process. Not processing.`;
                console.log(`${errorMessage} ${requestBody}`);
                /**
                 * return the error accordingly
                 * We will need to retry sending this message upon receiving of a non 2XX code
                 */
                return {
                    statusCode: 424,
                    body: JSON.stringify({
                        data: null,
                        errorType: moonbeam_models_1.ReimbursementsErrorType.Unprocessable,
                        errorMessage: errorMessage
                    })
                };
            }
        }
        else {
            // if the request body is null, return a validation error accordingly
            const errorMessage = `Invalid request body passed in.`;
            console.log(`${errorMessage} ${requestBody}`);
            /**
             * return the error accordingly
             * We will need to retry sending this message upon receiving of a non 2XX code
             */
            return {
                statusCode: 400,
                body: JSON.stringify({
                    data: null,
                    errorType: moonbeam_models_1.ReimbursementsErrorType.ValidationError,
                    errorMessage: errorMessage
                })
            };
        }
    }
    catch (error) {
        const errorMessage = `Unexpected error while processing ${route} request`;
        console.log(`${errorMessage} ${error}`);
        /**
         * return the error accordingly
         * We will retry sending this message upon receiving of a non 2XX code
         */
        return {
            statusCode: 500,
            body: JSON.stringify({
                data: null,
                errorType: moonbeam_models_1.ReimbursementsErrorType.UnexpectedError,
                errorMessage: errorMessage
            })
        };
    }
};
exports.acknowledgeReimbursement = acknowledgeReimbursement;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNrbm93bGVkZ2VSZWltYnVyc2VtZW50SGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvaGFuZGxlcnMvQWNrbm93bGVkZ2VSZWltYnVyc2VtZW50SGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwrREFBNkc7QUFDN0csb0RBQThEO0FBRTlEOzs7Ozs7O0dBT0c7QUFDSSxNQUFNLHdCQUF3QixHQUFHLEtBQUssRUFBRSxLQUFhLEVBQUUsV0FBMEIsRUFBa0MsRUFBRTtJQUN4SCxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLG9EQUFvRDtRQUNwRCxJQUFJLFdBQVcsRUFBRTtZQUNiLHdEQUF3RDtZQUN4RCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFbEQseUdBQXlHO1lBQ3pHLElBQUksaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksaUJBQWlCLENBQUMsUUFBUSxDQUFDLElBQUksaUJBQWlCLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ3pGLHVFQUF1RTtnQkFDdkUsTUFBTSxrQkFBa0IsR0FBdUIsaUJBQXVDLENBQUM7Z0JBRXZGLDhCQUE4QjtnQkFDOUIsTUFBTSxTQUFTLEdBQUcsSUFBSSxzQkFBUyxDQUFDLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7Z0JBRWxEOzttQkFFRztnQkFDSCxNQUFNLG9CQUFvQixHQUFHLE1BQU0sU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLDJCQUFjLENBQUM7b0JBQ2pFLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG1DQUFvQztvQkFDMUQsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUM7b0JBQzNDOzs7dUJBR0c7b0JBQ0gsY0FBYyxFQUFFLGtCQUFrQixDQUFDLFFBQVE7aUJBQzlDLENBQUMsQ0FBQyxDQUFDO2dCQUVKLDhGQUE4RjtnQkFDOUYsSUFBSSxvQkFBb0IsSUFBSSxvQkFBb0IsQ0FBQyxTQUFTLElBQUksb0JBQW9CLENBQUMsU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDO29CQUNyRyxvQkFBb0IsQ0FBQyxjQUFjLElBQUksb0JBQW9CLENBQUMsY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQ3pGOzs7dUJBR0c7b0JBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnSEFBZ0gsb0JBQW9CLENBQUMsU0FBUyxJQUFJLG9CQUFvQixDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7b0JBRXJNLE9BQU87d0JBQ0gsVUFBVSxFQUFFLEdBQUc7d0JBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7NEJBQ2pCLElBQUksRUFBRSw2QkFBNkI7eUJBQ3RDLENBQUM7cUJBQ0wsQ0FBQTtpQkFDSjtxQkFBTTtvQkFDSCxNQUFNLFlBQVksR0FBRyxtRUFBbUUsQ0FBQztvQkFDekYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFFMUI7Ozt1QkFHRztvQkFDSCxPQUFPO3dCQUNILFVBQVUsRUFBRSxHQUFHO3dCQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDOzRCQUNqQixJQUFJLEVBQUUsSUFBSTs0QkFDVixTQUFTLEVBQUUsdUNBQXFCLENBQUMsYUFBYTs0QkFDOUMsWUFBWSxFQUFFLFlBQVk7eUJBQzdCLENBQUM7cUJBQ0wsQ0FBQTtpQkFDSjthQUNKO2lCQUFNO2dCQUNILE1BQU0sWUFBWSxHQUFHLGtFQUFrRSxDQUFDO2dCQUN4RixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsWUFBWSxJQUFJLFdBQVcsRUFBRSxDQUFDLENBQUM7Z0JBRTlDOzs7bUJBR0c7Z0JBQ0gsT0FBTztvQkFDSCxVQUFVLEVBQUUsR0FBRztvQkFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQzt3QkFDakIsSUFBSSxFQUFFLElBQUk7d0JBQ1YsU0FBUyxFQUFFLHlDQUF1QixDQUFDLGFBQWE7d0JBQ2hELFlBQVksRUFBRSxZQUFZO3FCQUM3QixDQUFDO2lCQUNMLENBQUE7YUFDSjtTQUNKO2FBQU07WUFDSCxxRUFBcUU7WUFDckUsTUFBTSxZQUFZLEdBQUcsaUNBQWlDLENBQUM7WUFDdkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFlBQVksSUFBSSxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBRTlDOzs7ZUFHRztZQUNILE9BQU87Z0JBQ0gsVUFBVSxFQUFFLEdBQUc7Z0JBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7b0JBQ2pCLElBQUksRUFBRSxJQUFJO29CQUNWLFNBQVMsRUFBRSx5Q0FBdUIsQ0FBQyxlQUFlO29CQUNsRCxZQUFZLEVBQUUsWUFBWTtpQkFDN0IsQ0FBQzthQUNMLENBQUE7U0FDSjtLQUVKO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixNQUFNLFlBQVksR0FBRyxxQ0FBcUMsS0FBSyxVQUFVLENBQUM7UUFDMUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFlBQVksSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRXhDOzs7V0FHRztRQUNILE9BQU87WUFDSCxVQUFVLEVBQUUsR0FBRztZQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUNqQixJQUFJLEVBQUUsSUFBSTtnQkFDVixTQUFTLEVBQUUseUNBQXVCLENBQUMsZUFBZTtnQkFDbEQsWUFBWSxFQUFFLFlBQVk7YUFDN0IsQ0FBQztTQUNMLENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQXBIWSxRQUFBLHdCQUF3Qiw0QkFvSHBDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBUElHYXRld2F5UHJveHlSZXN1bHR9IGZyb20gXCJhd3MtbGFtYmRhL3RyaWdnZXIvYXBpLWdhdGV3YXktcHJveHlcIjtcbmltcG9ydCB7RWxpZ2libGVMaW5rZWRVc2VyLCBSZWltYnVyc2VtZW50c0Vycm9yVHlwZSwgVHJhbnNhY3Rpb25zRXJyb3JUeXBlfSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHtQdWJsaXNoQ29tbWFuZCwgU05TQ2xpZW50fSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LXNuc1wiO1xuXG4vKipcbiAqIEFja25vd2xlZGdlUmVpbWJ1cnNlbWVudCBoYW5kbGVyXG4gKlxuICogQHBhcmFtIHJvdXRlIHJlcXVlc3Qgcm91dGUsIGNvbXBvc2VkIG9mIEhUVFAgVmVyYiBhbmQgSFRUUCBQYXRoXG4gKiBAcGFyYW0gcmVxdWVzdEJvZHkgcmVxdWVzdCBib2R5IGlucHV0LCBwYXNzZWQgYnkgdGhlIGNhbGxlciB0aHJvdWdoIHRoZSBBUEkgR2F0ZXdheSBldmVudFxuICpcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgQVBJR2F0ZXdheVByb3h5UmVzdWx0fVxuICovXG5leHBvcnQgY29uc3QgYWNrbm93bGVkZ2VSZWltYnVyc2VtZW50ID0gYXN5bmMgKHJvdXRlOiBzdHJpbmcsIHJlcXVlc3RCb2R5OiBzdHJpbmcgfCBudWxsKTogUHJvbWlzZTxBUElHYXRld2F5UHJveHlSZXN1bHQ+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBmaXJzdCBjaGVjayB3aGV0aGVyIHdlIGhhdmUgYSB2YWxpZCByZXF1ZXN0IGJvZHkuXG4gICAgICAgIGlmIChyZXF1ZXN0Qm9keSkge1xuICAgICAgICAgICAgLy8gcGFyc2UgdGhlIGluY29taW5nIHJlcXVlc3QgYm9keSBkYXRhIGFzIGEgSlNPTiBvYmplY3RcbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3RCb2R5UGFyc2VkID0gSlNPTi5wYXJzZShyZXF1ZXN0Qm9keSk7XG5cbiAgICAgICAgICAgIC8vIHBlcmZvcm0gc29tZSB2YWxpZGF0aW9ucyBiYXNlZCBvbiB3aGF0IGlzIGV4cGVjdGVkIGluIHRlcm1zIG9mIHRoZSBpbmNvbWluZyBkYXRhIG1vZGVsIGFuZCBpdHMgbWFwcGluZ1xuICAgICAgICAgICAgaWYgKHJlcXVlc3RCb2R5UGFyc2VkW1wiaWRcIl0gJiYgcmVxdWVzdEJvZHlQYXJzZWRbXCJjYXJkSWRcIl0gJiYgcmVxdWVzdEJvZHlQYXJzZWRbXCJtZW1iZXJJZFwiXSkge1xuICAgICAgICAgICAgICAgIC8vIGJ1aWxkIHRoZSBlbGlnaWJsZSBsaW5rZWQgdXNlciBvYmplY3QgZnJvbSB0aGUgaW5jb21pbmcgcmVxdWVzdCBib2R5XG4gICAgICAgICAgICAgICAgY29uc3QgZWxpZ2libGVMaW5rZWRVc2VyOiBFbGlnaWJsZUxpbmtlZFVzZXIgPSByZXF1ZXN0Qm9keVBhcnNlZCBhcyBFbGlnaWJsZUxpbmtlZFVzZXI7XG5cbiAgICAgICAgICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIFNOUyBDbGllbnRcbiAgICAgICAgICAgICAgICBjb25zdCBzbnNDbGllbnQgPSBuZXcgU05TQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICogZHJvcCB0aGUgZWxpZ2libGUgbGlua2VkIHVzZXIgYXMgYSBtZXNzYWdlIHRvIHRoZSByZWltYnVyc2VtZW50cyBwcm9jZXNzaW5nIHRvcGljXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgY29uc3QgcmVpbWJ1cnNlbWVudFJlY2VpcHQgPSBhd2FpdCBzbnNDbGllbnQuc2VuZChuZXcgUHVibGlzaENvbW1hbmQoe1xuICAgICAgICAgICAgICAgICAgICBUb3BpY0FybjogcHJvY2Vzcy5lbnYuUkVJTUJVUlNFTUVOVFNfUFJPQ0VTU0lOR19UT1BJQ19BUk4hLFxuICAgICAgICAgICAgICAgICAgICBNZXNzYWdlOiBKU09OLnN0cmluZ2lmeShlbGlnaWJsZUxpbmtlZFVzZXIpLFxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogdGhlIG1lc3NhZ2UgZ3JvdXAgaWQsIHdpbGwgYmUgcmVwcmVzZW50ZWQgYnkgdGhlIE9saXZlIG1lbWJlciBpZCwgc28gdGhhdCB3ZSBjYW4gZ3JvdXAgcmVpbWJ1cnNlbWVudCBtZXNzYWdlcyBmb3IgYSBwYXJ0aWN1bGFyIG1lbWJlciBpZCxcbiAgICAgICAgICAgICAgICAgICAgICogYXNzb2NpYXRlZCB0byBhIE1vb25iZWFtIHVzZXIgaWQsIGFuZCBzb3J0IHRoZW0gaW4gdGhlIEZJRk8gcHJvY2Vzc2luZyB0b3BpYyBhY2NvcmRpbmdseS5cbiAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgIE1lc3NhZ2VHcm91cElkOiBlbGlnaWJsZUxpbmtlZFVzZXIubWVtYmVySWRcbiAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAvLyBlbnN1cmUgdGhhdCB0aGUgcmVpbWJ1cnNlbWVudCBtZXNzYWdlIHdhcyBwcm9wZXJseSBzZW50IHRvIHRoZSBhcHByb3ByaWF0ZSBwcm9jZXNzaW5nIHRvcGljXG4gICAgICAgICAgICAgICAgaWYgKHJlaW1idXJzZW1lbnRSZWNlaXB0ICYmIHJlaW1idXJzZW1lbnRSZWNlaXB0Lk1lc3NhZ2VJZCAmJiByZWltYnVyc2VtZW50UmVjZWlwdC5NZXNzYWdlSWQubGVuZ3RoICE9PSAwICYmXG4gICAgICAgICAgICAgICAgICAgIHJlaW1idXJzZW1lbnRSZWNlaXB0LlNlcXVlbmNlTnVtYmVyICYmIHJlaW1idXJzZW1lbnRSZWNlaXB0LlNlcXVlbmNlTnVtYmVyLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogdGhlIGVsaWdpYmxlIGxpbmtlZCB1c2VyIGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSBkcm9wcGVkIGludG8gdGhlIHRvcGljLCBhbmQgd2lsbCBiZSBwaWNrZWQgdXAgYnkgdGhlIHJlaW1idXJzZW1lbnRzIGNvbnN1bWVyIGFuZCBvdGhlclxuICAgICAgICAgICAgICAgICAgICAgKiBzZXJ2aWNlcywgbGlrZSB0aGUgbm90aWZpY2F0aW9ucyBzZXJ2aWNlIGNvbnN1bWVyLlxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEVsaWdpYmxlIGxpbmtlZCB1c2VyIGZvciByZWltYnVyc2VtZW50cywgc3VjY2Vzc2Z1bGx5IHNlbnQgdG8gdG9waWMgZm9yIHByb2Nlc3Npbmcgd2l0aCByZWNlaXB0IGluZm9ybWF0aW9uOiAke3JlaW1idXJzZW1lbnRSZWNlaXB0Lk1lc3NhZ2VJZH0gJHtyZWltYnVyc2VtZW50UmVjZWlwdC5TZXF1ZW5jZU51bWJlcn1gKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogMjAyLFxuICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGBSZWltYnVyc2VtZW50IGFja25vd2xlZGdlZCFgXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgc2VuZGluZyB0aGUgcmVpbWJ1cnNlbWVudCBtZXNzYWdlIGZ1cnRoZXIhYDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogaWYgdGhlcmUgYXJlIGVycm9ycyBhc3NvY2lhdGVkIHdpdGggc2VuZGluZyB0aGUgbWVzc2FnZSB0byB0aGUgdG9waWMuXG4gICAgICAgICAgICAgICAgICAgICAqIFdlIHdpbGwgbmVlZCB0byByZXRyeSBzZW5kaW5nIHRoaXMgbWVzc2FnZSB1cG9uIHJlY2VpdmluZyBvZiBhIG5vbiAyWFggY29kZVxuICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c0NvZGU6IDQyNCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogVHJhbnNhY3Rpb25zRXJyb3JUeXBlLlVucHJvY2Vzc2FibGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBSZWltYnVyc2VtZW50IG9iamVjdCBpcyBub3QgcG9zc2libGUgdG8gcHJvY2Vzcy4gTm90IHByb2Nlc3NpbmcuYDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7cmVxdWVzdEJvZHl9YCk7XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiByZXR1cm4gdGhlIGVycm9yIGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgICAgICogV2Ugd2lsbCBuZWVkIHRvIHJldHJ5IHNlbmRpbmcgdGhpcyBtZXNzYWdlIHVwb24gcmVjZWl2aW5nIG9mIGEgbm9uIDJYWCBjb2RlXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogNDI0LFxuICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBSZWltYnVyc2VtZW50c0Vycm9yVHlwZS5VbnByb2Nlc3NhYmxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBpZiB0aGUgcmVxdWVzdCBib2R5IGlzIG51bGwsIHJldHVybiBhIHZhbGlkYXRpb24gZXJyb3IgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBJbnZhbGlkIHJlcXVlc3QgYm9keSBwYXNzZWQgaW4uYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAke2Vycm9yTWVzc2FnZX0gJHtyZXF1ZXN0Qm9keX1gKTtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiByZXR1cm4gdGhlIGVycm9yIGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgKiBXZSB3aWxsIG5lZWQgdG8gcmV0cnkgc2VuZGluZyB0aGlzIG1lc3NhZ2UgdXBvbiByZWNlaXZpbmcgb2YgYSBub24gMlhYIGNvZGVcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdGF0dXNDb2RlOiA0MDAsXG4gICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IFJlaW1idXJzZW1lbnRzRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvcixcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBwcm9jZXNzaW5nICR7cm91dGV9IHJlcXVlc3RgO1xuICAgICAgICBjb25zb2xlLmxvZyhgJHtlcnJvck1lc3NhZ2V9ICR7ZXJyb3J9YCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHJldHVybiB0aGUgZXJyb3IgYWNjb3JkaW5nbHlcbiAgICAgICAgICogV2Ugd2lsbCByZXRyeSBzZW5kaW5nIHRoaXMgbWVzc2FnZSB1cG9uIHJlY2VpdmluZyBvZiBhIG5vbiAyWFggY29kZVxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IDUwMCxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICBkYXRhOiBudWxsLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUmVpbWJ1cnNlbWVudHNFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yLFxuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxufVxuIl19