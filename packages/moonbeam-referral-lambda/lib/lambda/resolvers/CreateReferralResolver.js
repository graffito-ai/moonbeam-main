"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReferral = void 0;
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
/**
 * CreateReferral resolver
 *
 * @param createReferralInput the input needed to create a new referral
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link ReferralResponse}
 */
const createReferral = async (fieldName, createReferralInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        const timestamp = Date.parse(createdAt);
        createReferralInput.createdAt = createReferralInput.createdAt ? createReferralInput.createdAt : createdAt;
        createReferralInput.updatedAt = createReferralInput.updatedAt ? createReferralInput.updatedAt : createdAt;
        /**
         * check to see if the referral already exists in the DB. Although this is a very rare situation, since we have so many resilient
         * methods (such as Dead-Letter-Queue, retries, etc.) we want to put a safeguard around duplicates even here.
         */
        const preExistingReferral = await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.REFERRAL_TABLE,
            Key: {
                fromId: {
                    S: createReferralInput.fromId
                },
                timestamp: {
                    N: timestamp.toString()
                }
            },
            /**
             * we're not interested in getting all the data for this call, just the minimum for us to determine whether this is a duplicate or not
             *
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
             */
            ProjectionExpression: '#fId, #t',
            ExpressionAttributeNames: {
                '#fId': 'fromId',
                '#t': 'timestamp'
            }
        }));
        // if there is an item retrieved, then we return an error
        if (preExistingReferral && preExistingReferral.Item) {
            /**
             * if there is a pre-existing referral with the same composite primary key (fromId/toId) combination,
             * then we cannot duplicate that, so we will return an error.
             */
            const errorMessage = `Duplicate referral found!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.ReferralErrorType.DuplicateObjectFound
            };
        }
        else {
            // create an initial status of a referral depending on the type of campaign code passed in
            let referralStatus;
            switch (createReferralInput.campaignCode) {
                case moonbeam_models_1.MarketingCampaignCode.Raffleregdec23:
                    referralStatus = moonbeam_models_1.ReferralStatus.Pending;
                    break;
                case moonbeam_models_1.MarketingCampaignCode.Raffleregjan24:
                    referralStatus = moonbeam_models_1.ReferralStatus.Pending;
                    break;
                default:
                    console.log(`Unknown campaign code passed in ${createReferralInput.campaignCode}, falling back to a ${moonbeam_models_1.ReferralStatus.Pending} referral status`);
                    referralStatus = moonbeam_models_1.ReferralStatus.Pending;
            }
            // store the transaction object
            await dynamoDbClient.send(new client_dynamodb_1.PutItemCommand({
                TableName: process.env.REFERRAL_TABLE,
                Item: {
                    fromId: {
                        S: createReferralInput.fromId
                    },
                    timestamp: {
                        N: timestamp.toString()
                    },
                    toId: {
                        S: createReferralInput.toId
                    },
                    createdAt: {
                        S: createReferralInput.createdAt
                    },
                    updatedAt: {
                        S: createReferralInput.updatedAt
                    },
                    campaignCode: {
                        S: createReferralInput.campaignCode
                    },
                    status: {
                        S: referralStatus
                    }
                }
            }));
            // return the referral object
            return {
                data: [{
                        ...createReferralInput,
                        timestamp: timestamp,
                        status: referralStatus
                    }]
            };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.ReferralErrorType.UnexpectedError
        };
    }
};
exports.createReferral = createReferral;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlUmVmZXJyYWxSZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0NyZWF0ZVJlZmVycmFsUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0RBT21DO0FBQ25DLDhEQUF3RjtBQUV4Rjs7Ozs7O0dBTUc7QUFDSSxNQUFNLGNBQWMsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxtQkFBd0MsRUFBNkIsRUFBRTtJQUMzSCxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLDRDQUE0QztRQUM1QyxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUU1RCxvQ0FBb0M7UUFDcEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMzQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3hDLG1CQUFtQixDQUFDLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQzFHLG1CQUFtQixDQUFDLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRTFHOzs7V0FHRztRQUNILE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksZ0NBQWMsQ0FBQztZQUNyRSxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFlO1lBQ3RDLEdBQUcsRUFBRTtnQkFDRCxNQUFNLEVBQUU7b0JBQ0osQ0FBQyxFQUFFLG1CQUFtQixDQUFDLE1BQU07aUJBQ2hDO2dCQUNELFNBQVMsRUFBRTtvQkFDUCxDQUFDLEVBQUUsU0FBUyxDQUFDLFFBQVEsRUFBRTtpQkFDMUI7YUFDSjtZQUNEOzs7OztlQUtHO1lBQ0gsb0JBQW9CLEVBQUUsVUFBVTtZQUNoQyx3QkFBd0IsRUFBRTtnQkFDdEIsTUFBTSxFQUFFLFFBQVE7Z0JBQ2hCLElBQUksRUFBRSxXQUFXO2FBQ3BCO1NBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSix5REFBeUQ7UUFDekQsSUFBSSxtQkFBbUIsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLEVBQUU7WUFDakQ7OztlQUdHO1lBQ0gsTUFBTSxZQUFZLEdBQUcsMkJBQTJCLENBQUM7WUFDakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsbUNBQWlCLENBQUMsb0JBQW9CO2FBQ3BELENBQUE7U0FDSjthQUFNO1lBQ0gsMEZBQTBGO1lBQzFGLElBQUksY0FBYyxDQUFDO1lBRW5CLFFBQVEsbUJBQW1CLENBQUMsWUFBWSxFQUFFO2dCQUN0QyxLQUFLLHVDQUFxQixDQUFDLGNBQWM7b0JBQ3JDLGNBQWMsR0FBRyxnQ0FBYyxDQUFDLE9BQU8sQ0FBQztvQkFDeEMsTUFBTTtnQkFDVixLQUFLLHVDQUFxQixDQUFDLGNBQWM7b0JBQ3JDLGNBQWMsR0FBRyxnQ0FBYyxDQUFDLE9BQU8sQ0FBQztvQkFDeEMsTUFBTTtnQkFDVjtvQkFDSSxPQUFPLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxtQkFBbUIsQ0FBQyxZQUFZLHVCQUF1QixnQ0FBYyxDQUFDLE9BQU8sa0JBQWtCLENBQUMsQ0FBQztvQkFDaEosY0FBYyxHQUFHLGdDQUFjLENBQUMsT0FBTyxDQUFDO2FBQy9DO1lBRUQsK0JBQStCO1lBQy9CLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLGdDQUFjLENBQUM7Z0JBQ3pDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWU7Z0JBQ3RDLElBQUksRUFBRTtvQkFDRixNQUFNLEVBQUU7d0JBQ0osQ0FBQyxFQUFFLG1CQUFtQixDQUFDLE1BQU07cUJBQ2hDO29CQUNELFNBQVMsRUFBRTt3QkFDUCxDQUFDLEVBQUUsU0FBUyxDQUFDLFFBQVEsRUFBRTtxQkFDMUI7b0JBQ0QsSUFBSSxFQUFFO3dCQUNGLENBQUMsRUFBRSxtQkFBbUIsQ0FBQyxJQUFJO3FCQUM5QjtvQkFDRCxTQUFTLEVBQUU7d0JBQ1AsQ0FBQyxFQUFFLG1CQUFtQixDQUFDLFNBQVM7cUJBQ25DO29CQUNELFNBQVMsRUFBRTt3QkFDUCxDQUFDLEVBQUUsbUJBQW1CLENBQUMsU0FBUztxQkFDbkM7b0JBQ0QsWUFBWSxFQUFFO3dCQUNWLENBQUMsRUFBRSxtQkFBbUIsQ0FBQyxZQUFZO3FCQUN0QztvQkFDRCxNQUFNLEVBQUU7d0JBQ0osQ0FBQyxFQUFFLGNBQWM7cUJBQ3BCO2lCQUNKO2FBQ0osQ0FBQyxDQUFDLENBQUM7WUFFSiw2QkFBNkI7WUFDN0IsT0FBTztnQkFDSCxJQUFJLEVBQUUsQ0FBQzt3QkFDSCxHQUFHLG1CQUFtQjt3QkFDdEIsU0FBUyxFQUFFLFNBQVM7d0JBQ3BCLE1BQU0sRUFBRSxjQUFjO3FCQUNiLENBQUM7YUFDakIsQ0FBQTtTQUNKO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxTQUFTLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDckYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLG1DQUFpQixDQUFDLGVBQWU7U0FDL0MsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBbkhZLFFBQUEsY0FBYyxrQkFtSDFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBDcmVhdGVSZWZlcnJhbElucHV0LFxuICAgIE1hcmtldGluZ0NhbXBhaWduQ29kZSxcbiAgICBSZWZlcnJhbCxcbiAgICBSZWZlcnJhbEVycm9yVHlwZSxcbiAgICBSZWZlcnJhbFJlc3BvbnNlLFxuICAgIFJlZmVycmFsU3RhdHVzXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge0R5bmFtb0RCQ2xpZW50LCBHZXRJdGVtQ29tbWFuZCwgUHV0SXRlbUNvbW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcblxuLyoqXG4gKiBDcmVhdGVSZWZlcnJhbCByZXNvbHZlclxuICpcbiAqIEBwYXJhbSBjcmVhdGVSZWZlcnJhbElucHV0IHRoZSBpbnB1dCBuZWVkZWQgdG8gY3JlYXRlIGEgbmV3IHJlZmVycmFsXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHJldHVybnMge0BsaW5rIFByb21pc2V9IG9mIHtAbGluayBSZWZlcnJhbFJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgY3JlYXRlUmVmZXJyYWwgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIGNyZWF0ZVJlZmVycmFsSW5wdXQ6IENyZWF0ZVJlZmVycmFsSW5wdXQpOiBQcm9taXNlPFJlZmVycmFsUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkeW5hbW9EYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAvLyB1cGRhdGUgdGhlIHRpbWVzdGFtcHMgYWNjb3JkaW5nbHlcbiAgICAgICAgY29uc3QgY3JlYXRlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICBjb25zdCB0aW1lc3RhbXAgPSBEYXRlLnBhcnNlKGNyZWF0ZWRBdCk7XG4gICAgICAgIGNyZWF0ZVJlZmVycmFsSW5wdXQuY3JlYXRlZEF0ID0gY3JlYXRlUmVmZXJyYWxJbnB1dC5jcmVhdGVkQXQgPyBjcmVhdGVSZWZlcnJhbElucHV0LmNyZWF0ZWRBdCA6IGNyZWF0ZWRBdDtcbiAgICAgICAgY3JlYXRlUmVmZXJyYWxJbnB1dC51cGRhdGVkQXQgPSBjcmVhdGVSZWZlcnJhbElucHV0LnVwZGF0ZWRBdCA/IGNyZWF0ZVJlZmVycmFsSW5wdXQudXBkYXRlZEF0IDogY3JlYXRlZEF0O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBjaGVjayB0byBzZWUgaWYgdGhlIHJlZmVycmFsIGFscmVhZHkgZXhpc3RzIGluIHRoZSBEQi4gQWx0aG91Z2ggdGhpcyBpcyBhIHZlcnkgcmFyZSBzaXR1YXRpb24sIHNpbmNlIHdlIGhhdmUgc28gbWFueSByZXNpbGllbnRcbiAgICAgICAgICogbWV0aG9kcyAoc3VjaCBhcyBEZWFkLUxldHRlci1RdWV1ZSwgcmV0cmllcywgZXRjLikgd2Ugd2FudCB0byBwdXQgYSBzYWZlZ3VhcmQgYXJvdW5kIGR1cGxpY2F0ZXMgZXZlbiBoZXJlLlxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgcHJlRXhpc3RpbmdSZWZlcnJhbCA9IGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IEdldEl0ZW1Db21tYW5kKHtcbiAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuUkVGRVJSQUxfVEFCTEUhLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgZnJvbUlkOiB7XG4gICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVJlZmVycmFsSW5wdXQuZnJvbUlkXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHtcbiAgICAgICAgICAgICAgICAgICAgTjogdGltZXN0YW1wLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiB3ZSdyZSBub3QgaW50ZXJlc3RlZCBpbiBnZXR0aW5nIGFsbCB0aGUgZGF0YSBmb3IgdGhpcyBjYWxsLCBqdXN0IHRoZSBtaW5pbXVtIGZvciB1cyB0byBkZXRlcm1pbmUgd2hldGhlciB0aGlzIGlzIGEgZHVwbGljYXRlIG9yIG5vdFxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUmVzZXJ2ZWRXb3Jkcy5odG1sXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL0V4cHJlc3Npb25zLkV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcy5odG1sXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFByb2plY3Rpb25FeHByZXNzaW9uOiAnI2ZJZCwgI3QnLFxuICAgICAgICAgICAgRXhwcmVzc2lvbkF0dHJpYnV0ZU5hbWVzOiB7XG4gICAgICAgICAgICAgICAgJyNmSWQnOiAnZnJvbUlkJyxcbiAgICAgICAgICAgICAgICAnI3QnOiAndGltZXN0YW1wJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gaXRlbSByZXRyaWV2ZWQsIHRoZW4gd2UgcmV0dXJuIGFuIGVycm9yXG4gICAgICAgIGlmIChwcmVFeGlzdGluZ1JlZmVycmFsICYmIHByZUV4aXN0aW5nUmVmZXJyYWwuSXRlbSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBpZiB0aGVyZSBpcyBhIHByZS1leGlzdGluZyByZWZlcnJhbCB3aXRoIHRoZSBzYW1lIGNvbXBvc2l0ZSBwcmltYXJ5IGtleSAoZnJvbUlkL3RvSWQpIGNvbWJpbmF0aW9uLFxuICAgICAgICAgICAgICogdGhlbiB3ZSBjYW5ub3QgZHVwbGljYXRlIHRoYXQsIHNvIHdlIHdpbGwgcmV0dXJuIGFuIGVycm9yLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRHVwbGljYXRlIHJlZmVycmFsIGZvdW5kIWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogUmVmZXJyYWxFcnJvclR5cGUuRHVwbGljYXRlT2JqZWN0Rm91bmRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBhbiBpbml0aWFsIHN0YXR1cyBvZiBhIHJlZmVycmFsIGRlcGVuZGluZyBvbiB0aGUgdHlwZSBvZiBjYW1wYWlnbiBjb2RlIHBhc3NlZCBpblxuICAgICAgICAgICAgbGV0IHJlZmVycmFsU3RhdHVzO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKGNyZWF0ZVJlZmVycmFsSW5wdXQuY2FtcGFpZ25Db2RlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBNYXJrZXRpbmdDYW1wYWlnbkNvZGUuUmFmZmxlcmVnZGVjMjM6XG4gICAgICAgICAgICAgICAgICAgIHJlZmVycmFsU3RhdHVzID0gUmVmZXJyYWxTdGF0dXMuUGVuZGluZztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBNYXJrZXRpbmdDYW1wYWlnbkNvZGUuUmFmZmxlcmVnamFuMjQ6XG4gICAgICAgICAgICAgICAgICAgIHJlZmVycmFsU3RhdHVzID0gUmVmZXJyYWxTdGF0dXMuUGVuZGluZztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFVua25vd24gY2FtcGFpZ24gY29kZSBwYXNzZWQgaW4gJHtjcmVhdGVSZWZlcnJhbElucHV0LmNhbXBhaWduQ29kZX0sIGZhbGxpbmcgYmFjayB0byBhICR7UmVmZXJyYWxTdGF0dXMuUGVuZGluZ30gcmVmZXJyYWwgc3RhdHVzYCk7XG4gICAgICAgICAgICAgICAgICAgIHJlZmVycmFsU3RhdHVzID0gUmVmZXJyYWxTdGF0dXMuUGVuZGluZztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gc3RvcmUgdGhlIHRyYW5zYWN0aW9uIG9iamVjdFxuICAgICAgICAgICAgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgUHV0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuUkVGRVJSQUxfVEFCTEUhLFxuICAgICAgICAgICAgICAgIEl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgZnJvbUlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVSZWZlcnJhbElucHV0LmZyb21JZFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE46IHRpbWVzdGFtcC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHRvSWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVJlZmVycmFsSW5wdXQudG9JZFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZVJlZmVycmFsSW5wdXQuY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlUmVmZXJyYWxJbnB1dC51cGRhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgY2FtcGFpZ25Db2RlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVSZWZlcnJhbElucHV0LmNhbXBhaWduQ29kZVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IHJlZmVycmFsU3RhdHVzXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgcmVmZXJyYWwgb2JqZWN0XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRhdGE6IFt7XG4gICAgICAgICAgICAgICAgICAgIC4uLmNyZWF0ZVJlZmVycmFsSW5wdXQsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogdGltZXN0YW1wLFxuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IHJlZmVycmFsU3RhdHVzXG4gICAgICAgICAgICAgICAgfSBhcyBSZWZlcnJhbF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IG11dGF0aW9uICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogUmVmZXJyYWxFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=