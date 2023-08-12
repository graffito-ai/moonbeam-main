"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processOfferRedeemedTransactionNotifications = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * OfferRedeemedNotificationProcessorHandler handler
 *
 * @param event the {@link SQSEvent} to be processed, containing the transaction
 * message information
 * @returns {@link Promise} of {@link SQSBatchResponse}
 */
const processOfferRedeemedTransactionNotifications = async (event) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        /**
         * initializing the batch response, as an empty array, that will be populated with errors, if any throughout the processing
         *
         * for the Lambda to indicate SQS that there have been no failures, and thus enable the deletion of all processed messages
         * from the queue, we have to return an empty batchItemFailures array. If we want to indicate that there have been errors,
         * for each individual message, based on its ID, we have to add it in the final batch response
         *
         * @link https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
         */
        const itemFailures = [];
        // for each record in the incoming event, repeat the transaction notification processing steps
        for (const transactionalRecord of event.Records) {
            /**
             * The overall transaction notification processing, will be made up of the following steps:
             *
             * 1) Call the getDevicesForUser Moonbeam AppSync API endpoint, to retrieve all physical devices associated with an
             * incoming user. Filter the devices based on their status (only consider the ones that are ACTIVE for the user).
             * 2) Call the createNotification Moonbeam AppSync API endpoint, to store the notification transaction in Dynamo DB
             * and send the notification through Courier accordingly.
             */
            // first, convert the incoming event message body, into a transaction object
            const transaction = JSON.parse(transactionalRecord.body);
            // initialize the Moonbeam Client API here, in order to call the appropriate endpoints for this handler
            const moonbeamClient = new moonbeam_models_1.MoonbeamClient(process.env.ENV_NAME, region);
            // 1) Call the getDevicesForUser Moonbeam Appsync API endpoint (need to add this in the internal Moonbeam Client first).
            //     // 1) Call the createNotification Moonbeam AppSync API endpoint
            //     const createNotificationResponse: CreateNotificationResponse = await moonbeamClient.createNotification({
            //         id: transaction.id,
            //         type:
            //         channelType:
            //     NotificationChannelType;
            //     expoPushTokens: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
            //     merchantName ? : InputMaybe<Scalars['String']>;
            //     pendingCashback ? : InputMaybe<Scalars['Float']>;
            //     status: NotificationStatus;
            // })
            //     ;
            //
            //     // check to see if the member details call was successful or not
            //     if (createNotificationResponse && !createNotificationResponse.errorMessage && !createNotificationResponse.errorType && createNotificationResponse.data) {
            //
            //     } else {
            //         console.log(`UserID mapping through GET member details call failed`);
            //
            //         // adds an item failure, for the SQS message which failed processing, as part of the incoming event
            //         itemFailures.push({
            //             itemIdentifier: transactionalRecord.messageId
            //         });
            //     }
        }
        /**
         * for the Lambda to indicate SQS that there have been no failures, and thus enable the deletion of all processed messages
         * from the queue, we have to return an empty batchItemFailures array here.
         *
         * @link https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
         */
        return {
            batchItemFailures: itemFailures
        };
    }
    catch (error) {
        console.log(`Unexpected error while processing ${JSON.stringify(event)} notification transactional event ${error}`);
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
exports.processOfferRedeemedTransactionNotifications = processOfferRedeemedTransactionNotifications;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2ZmZXJSZWRlZW1lZE5vdGlmaWNhdGlvblByb2Nlc3NvckhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL2hhbmRsZXJzL09mZmVyUmVkZWVtZWROb3RpZmljYXRpb25Qcm9jZXNzb3JIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLCtEQUFzRTtBQUd0RTs7Ozs7O0dBTUc7QUFDSSxNQUFNLDRDQUE0QyxHQUFHLEtBQUssRUFBRSxLQUFlLEVBQTZCLEVBQUU7SUFDN0csSUFBSTtRQUNBLHlDQUF5QztRQUN6QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVcsQ0FBQztRQUV2Qzs7Ozs7Ozs7V0FRRztRQUNILE1BQU0sWUFBWSxHQUEwQixFQUFFLENBQUM7UUFFL0MsOEZBQThGO1FBQzlGLEtBQUssTUFBTSxtQkFBbUIsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFO1lBQzdDOzs7Ozs7O2VBT0c7WUFDQyw0RUFBNEU7WUFDaEYsTUFBTSxXQUFXLEdBQWdCLElBQUksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFnQixDQUFDO1lBRXJGLHVHQUF1RztZQUN2RyxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFekUsd0hBQXdIO1lBRXhILHNFQUFzRTtZQUN0RSwrR0FBK0c7WUFDL0csOEJBQThCO1lBQzlCLGdCQUFnQjtZQUNoQix1QkFBdUI7WUFDdkIsK0JBQStCO1lBQy9CLHdFQUF3RTtZQUN4RSxzREFBc0Q7WUFDdEQsd0RBQXdEO1lBQ3hELGtDQUFrQztZQUNsQyxLQUFLO1lBQ0wsUUFBUTtZQUNSLEVBQUU7WUFDRix1RUFBdUU7WUFDdkUsZ0tBQWdLO1lBQ2hLLEVBQUU7WUFDRixlQUFlO1lBQ2YsZ0ZBQWdGO1lBQ2hGLEVBQUU7WUFDRiw4R0FBOEc7WUFDOUcsOEJBQThCO1lBQzlCLDREQUE0RDtZQUM1RCxjQUFjO1lBQ2QsUUFBUTtTQUNYO1FBRUQ7Ozs7O1dBS0c7UUFDSCxPQUFPO1lBQ0gsaUJBQWlCLEVBQUUsWUFBWTtTQUNsQyxDQUFBO0tBQ0o7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUMscUNBQXFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLHFDQUFxQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRXBIOzs7OztXQUtHO1FBQ0gsT0FBTztZQUNILGlCQUFpQixFQUFFLENBQUM7b0JBQ2hCLGdHQUFnRztvQkFDaEcsY0FBYyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztpQkFDN0MsQ0FBQztTQUNMLENBQUE7S0FDSjtBQUNMLENBQUMsQ0FBQTtBQXJGWSxRQUFBLDRDQUE0QyxnREFxRnhEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtTUVNCYXRjaFJlc3BvbnNlLCBTUVNFdmVudH0gZnJvbSBcImF3cy1sYW1iZGFcIjtcbmltcG9ydCB7TW9vbmJlYW1DbGllbnQsIFRyYW5zYWN0aW9ufSBmcm9tIFwiQG1vb25iZWFtL21vb25iZWFtLW1vZGVsc1wiO1xuaW1wb3J0IHtTUVNCYXRjaEl0ZW1GYWlsdXJlfSBmcm9tIFwiYXdzLWxhbWJkYS90cmlnZ2VyL3Nxc1wiO1xuXG4vKipcbiAqIE9mZmVyUmVkZWVtZWROb3RpZmljYXRpb25Qcm9jZXNzb3JIYW5kbGVyIGhhbmRsZXJcbiAqXG4gKiBAcGFyYW0gZXZlbnQgdGhlIHtAbGluayBTUVNFdmVudH0gdG8gYmUgcHJvY2Vzc2VkLCBjb250YWluaW5nIHRoZSB0cmFuc2FjdGlvblxuICogbWVzc2FnZSBpbmZvcm1hdGlvblxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBTUVNCYXRjaFJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgcHJvY2Vzc09mZmVyUmVkZWVtZWRUcmFuc2FjdGlvbk5vdGlmaWNhdGlvbnMgPSBhc3luYyAoZXZlbnQ6IFNRU0V2ZW50KTogUHJvbWlzZTxTUVNCYXRjaFJlc3BvbnNlPiA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gcmV0cmlldmluZyB0aGUgY3VycmVudCBmdW5jdGlvbiByZWdpb25cbiAgICAgICAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiE7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGluaXRpYWxpemluZyB0aGUgYmF0Y2ggcmVzcG9uc2UsIGFzIGFuIGVtcHR5IGFycmF5LCB0aGF0IHdpbGwgYmUgcG9wdWxhdGVkIHdpdGggZXJyb3JzLCBpZiBhbnkgdGhyb3VnaG91dCB0aGUgcHJvY2Vzc2luZ1xuICAgICAgICAgKlxuICAgICAgICAgKiBmb3IgdGhlIExhbWJkYSB0byBpbmRpY2F0ZSBTUVMgdGhhdCB0aGVyZSBoYXZlIGJlZW4gbm8gZmFpbHVyZXMsIGFuZCB0aHVzIGVuYWJsZSB0aGUgZGVsZXRpb24gb2YgYWxsIHByb2Nlc3NlZCBtZXNzYWdlc1xuICAgICAgICAgKiBmcm9tIHRoZSBxdWV1ZSwgd2UgaGF2ZSB0byByZXR1cm4gYW4gZW1wdHkgYmF0Y2hJdGVtRmFpbHVyZXMgYXJyYXkuIElmIHdlIHdhbnQgdG8gaW5kaWNhdGUgdGhhdCB0aGVyZSBoYXZlIGJlZW4gZXJyb3JzLFxuICAgICAgICAgKiBmb3IgZWFjaCBpbmRpdmlkdWFsIG1lc3NhZ2UsIGJhc2VkIG9uIGl0cyBJRCwgd2UgaGF2ZSB0byBhZGQgaXQgaW4gdGhlIGZpbmFsIGJhdGNoIHJlc3BvbnNlXG4gICAgICAgICAqXG4gICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9sYW1iZGEvbGF0ZXN0L2RnL3dpdGgtc3FzLmh0bWxcbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IGl0ZW1GYWlsdXJlczogU1FTQmF0Y2hJdGVtRmFpbHVyZVtdID0gW107XG5cbiAgICAgICAgLy8gZm9yIGVhY2ggcmVjb3JkIGluIHRoZSBpbmNvbWluZyBldmVudCwgcmVwZWF0IHRoZSB0cmFuc2FjdGlvbiBub3RpZmljYXRpb24gcHJvY2Vzc2luZyBzdGVwc1xuICAgICAgICBmb3IgKGNvbnN0IHRyYW5zYWN0aW9uYWxSZWNvcmQgb2YgZXZlbnQuUmVjb3Jkcykge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBUaGUgb3ZlcmFsbCB0cmFuc2FjdGlvbiBub3RpZmljYXRpb24gcHJvY2Vzc2luZywgd2lsbCBiZSBtYWRlIHVwIG9mIHRoZSBmb2xsb3dpbmcgc3RlcHM6XG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogMSkgQ2FsbCB0aGUgZ2V0RGV2aWNlc0ZvclVzZXIgTW9vbmJlYW0gQXBwU3luYyBBUEkgZW5kcG9pbnQsIHRvIHJldHJpZXZlIGFsbCBwaHlzaWNhbCBkZXZpY2VzIGFzc29jaWF0ZWQgd2l0aCBhblxuICAgICAgICAgICAgICogaW5jb21pbmcgdXNlci4gRmlsdGVyIHRoZSBkZXZpY2VzIGJhc2VkIG9uIHRoZWlyIHN0YXR1cyAob25seSBjb25zaWRlciB0aGUgb25lcyB0aGF0IGFyZSBBQ1RJVkUgZm9yIHRoZSB1c2VyKS5cbiAgICAgICAgICAgICAqIDIpIENhbGwgdGhlIGNyZWF0ZU5vdGlmaWNhdGlvbiBNb29uYmVhbSBBcHBTeW5jIEFQSSBlbmRwb2ludCwgdG8gc3RvcmUgdGhlIG5vdGlmaWNhdGlvbiB0cmFuc2FjdGlvbiBpbiBEeW5hbW8gREJcbiAgICAgICAgICAgICAqIGFuZCBzZW5kIHRoZSBub3RpZmljYXRpb24gdGhyb3VnaCBDb3VyaWVyIGFjY29yZGluZ2x5LlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgLy8gZmlyc3QsIGNvbnZlcnQgdGhlIGluY29taW5nIGV2ZW50IG1lc3NhZ2UgYm9keSwgaW50byBhIHRyYW5zYWN0aW9uIG9iamVjdFxuICAgICAgICAgICAgY29uc3QgdHJhbnNhY3Rpb246IFRyYW5zYWN0aW9uID0gSlNPTi5wYXJzZSh0cmFuc2FjdGlvbmFsUmVjb3JkLmJvZHkpIGFzIFRyYW5zYWN0aW9uO1xuXG4gICAgICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBNb29uYmVhbSBDbGllbnQgQVBJIGhlcmUsIGluIG9yZGVyIHRvIGNhbGwgdGhlIGFwcHJvcHJpYXRlIGVuZHBvaW50cyBmb3IgdGhpcyBoYW5kbGVyXG4gICAgICAgICAgICBjb25zdCBtb29uYmVhbUNsaWVudCA9IG5ldyBNb29uYmVhbUNsaWVudChwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG5cbiAgICAgICAgICAgIC8vIDEpIENhbGwgdGhlIGdldERldmljZXNGb3JVc2VyIE1vb25iZWFtIEFwcHN5bmMgQVBJIGVuZHBvaW50IChuZWVkIHRvIGFkZCB0aGlzIGluIHRoZSBpbnRlcm5hbCBNb29uYmVhbSBDbGllbnQgZmlyc3QpLlxuXG4gICAgICAgICAgICAvLyAgICAgLy8gMSkgQ2FsbCB0aGUgY3JlYXRlTm90aWZpY2F0aW9uIE1vb25iZWFtIEFwcFN5bmMgQVBJIGVuZHBvaW50XG4gICAgICAgICAgICAvLyAgICAgY29uc3QgY3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2U6IENyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlID0gYXdhaXQgbW9vbmJlYW1DbGllbnQuY3JlYXRlTm90aWZpY2F0aW9uKHtcbiAgICAgICAgICAgIC8vICAgICAgICAgaWQ6IHRyYW5zYWN0aW9uLmlkLFxuICAgICAgICAgICAgLy8gICAgICAgICB0eXBlOlxuICAgICAgICAgICAgLy8gICAgICAgICBjaGFubmVsVHlwZTpcbiAgICAgICAgICAgIC8vICAgICBOb3RpZmljYXRpb25DaGFubmVsVHlwZTtcbiAgICAgICAgICAgIC8vICAgICBleHBvUHVzaFRva2VuczogSW5wdXRNYXliZTxBcnJheTxJbnB1dE1heWJlPFNjYWxhcnNbJ1N0cmluZyddPj4+O1xuICAgICAgICAgICAgLy8gICAgIG1lcmNoYW50TmFtZSA/IDogSW5wdXRNYXliZTxTY2FsYXJzWydTdHJpbmcnXT47XG4gICAgICAgICAgICAvLyAgICAgcGVuZGluZ0Nhc2hiYWNrID8gOiBJbnB1dE1heWJlPFNjYWxhcnNbJ0Zsb2F0J10+O1xuICAgICAgICAgICAgLy8gICAgIHN0YXR1czogTm90aWZpY2F0aW9uU3RhdHVzO1xuICAgICAgICAgICAgLy8gfSlcbiAgICAgICAgICAgIC8vICAgICA7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB0aGUgbWVtYmVyIGRldGFpbHMgY2FsbCB3YXMgc3VjY2Vzc2Z1bCBvciBub3RcbiAgICAgICAgICAgIC8vICAgICBpZiAoY3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2UgJiYgIWNyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlLmVycm9yTWVzc2FnZSAmJiAhY3JlYXRlTm90aWZpY2F0aW9uUmVzcG9uc2UuZXJyb3JUeXBlICYmIGNyZWF0ZU5vdGlmaWNhdGlvblJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgY29uc29sZS5sb2coYFVzZXJJRCBtYXBwaW5nIHRocm91Z2ggR0VUIG1lbWJlciBkZXRhaWxzIGNhbGwgZmFpbGVkYCk7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gICAgICAgICAvLyBhZGRzIGFuIGl0ZW0gZmFpbHVyZSwgZm9yIHRoZSBTUVMgbWVzc2FnZSB3aGljaCBmYWlsZWQgcHJvY2Vzc2luZywgYXMgcGFydCBvZiB0aGUgaW5jb21pbmcgZXZlbnRcbiAgICAgICAgICAgIC8vICAgICAgICAgaXRlbUZhaWx1cmVzLnB1c2goe1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IHRyYW5zYWN0aW9uYWxSZWNvcmQubWVzc2FnZUlkXG4gICAgICAgICAgICAvLyAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBmb3IgdGhlIExhbWJkYSB0byBpbmRpY2F0ZSBTUVMgdGhhdCB0aGVyZSBoYXZlIGJlZW4gbm8gZmFpbHVyZXMsIGFuZCB0aHVzIGVuYWJsZSB0aGUgZGVsZXRpb24gb2YgYWxsIHByb2Nlc3NlZCBtZXNzYWdlc1xuICAgICAgICAgKiBmcm9tIHRoZSBxdWV1ZSwgd2UgaGF2ZSB0byByZXR1cm4gYW4gZW1wdHkgYmF0Y2hJdGVtRmFpbHVyZXMgYXJyYXkgaGVyZS5cbiAgICAgICAgICpcbiAgICAgICAgICogQGxpbmsgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2xhbWJkYS9sYXRlc3QvZGcvd2l0aC1zcXMuaHRtbFxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGJhdGNoSXRlbUZhaWx1cmVzOiBpdGVtRmFpbHVyZXNcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHByb2Nlc3NpbmcgJHtKU09OLnN0cmluZ2lmeShldmVudCl9IG5vdGlmaWNhdGlvbiB0cmFuc2FjdGlvbmFsIGV2ZW50ICR7ZXJyb3J9YCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHJldHVybnMgYSBiYXRjaCByZXNwb25zZSBmYWlsdXJlIGZvciB0aGUgcGFydGljdWxhciBtZXNzYWdlIElEcyB3aGljaCBmYWlsZWRcbiAgICAgICAgICogaW4gdGhpcyBjYXNlLCB0aGUgTGFtYmRhIGZ1bmN0aW9uIERPRVMgTk9UIGRlbGV0ZSB0aGUgaW5jb21pbmcgbWVzc2FnZXMgZnJvbSB0aGUgcXVldWUsIGFuZCBpdCBtYWtlcyBpdCBhdmFpbGFibGUvdmlzaWJsZSBhZ2FpblxuICAgICAgICAgKlxuICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vbGFtYmRhL2xhdGVzdC9kZy93aXRoLXNxcy5odG1sXG4gICAgICAgICAqL1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYmF0Y2hJdGVtRmFpbHVyZXM6IFt7XG4gICAgICAgICAgICAgICAgLy8gZm9yIHRoaXMgY2FzZSwgd2Ugb25seSBwcm9jZXNzIDEgcmVjb3JkIGF0IGEgdGltZSwgd2UgbWlnaHQgbmVlZCB0byBjaGFuZ2UgdGhpcyBpbiB0aGUgZnV0dXJlXG4gICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IGV2ZW50LlJlY29yZHNbMF0ubWVzc2FnZUlkXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XG4gICAgfVxufVxuIl19