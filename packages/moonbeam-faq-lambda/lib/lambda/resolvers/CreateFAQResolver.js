"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFAQ = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const uuid_1 = require("uuid");
/**
 * CreateFAQ resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createFAQInput FAQS input object, used to create a new FAQ object.
 * @returns {@link Promise} of {@link FaqResponse}
 */
const createFAQ = async (fieldName, createFAQInput) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createFAQInput.createdAt = createFAQInput.createdAt ? createFAQInput.createdAt : createdAt;
        createFAQInput.updatedAt = createFAQInput.updatedAt ? createFAQInput.updatedAt : createdAt;
        /**
         * check to see if there is an existing FAQ with the same ID, in case there is
         * an id passed in.
         */
        const preExistingFAQ = createFAQInput.id && await dynamoDbClient.send(new client_dynamodb_1.GetItemCommand({
            TableName: process.env.FAQ_TABLE,
            Key: {
                id: {
                    S: createFAQInput.id
                }
            },
            /**
             * we're not interested in getting all the data for this call, just the minimum for us to determine whether this is a duplicate or not
             *
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
             * @link https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ExpressionAttributeNames.html
             */
            ProjectionExpression: '#idf',
            ExpressionAttributeNames: {
                '#idf': 'id'
            }
        }));
        // if there is an item retrieved, then we return an error
        if (preExistingFAQ && preExistingFAQ.Item) {
            // if there is an existent FAQ object, then we cannot duplicate that, so we will return an error
            const errorMessage = `Duplicate FAQ object found!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.FaqErrorType.DuplicateObjectFound
            };
        }
        else {
            // generate a unique application identifier for the FAQ, if not already passed in
            createFAQInput.id = createFAQInput.id ? createFAQInput.id : (0, uuid_1.v4)();
            // store the FAQ object
            const facts = [];
            createFAQInput.facts.forEach(fact => {
                facts.push({
                    M: {
                        description: {
                            S: fact.description
                        },
                        ...(fact.linkableKeyword && {
                            linkableKeyword: {
                                S: fact.linkableKeyword
                            }
                        }),
                        ...(fact.linkLocation && {
                            linkLocation: {
                                S: fact.linkLocation
                            }
                        }),
                        type: {
                            S: fact.type
                        }
                    }
                });
            });
            await dynamoDbClient.send(new client_dynamodb_1.PutItemCommand({
                TableName: process.env.FAQ_TABLE,
                Item: {
                    id: {
                        S: createFAQInput.id
                    },
                    title: {
                        S: createFAQInput.title
                    },
                    createdAt: {
                        S: createFAQInput.createdAt
                    },
                    updatedAt: {
                        S: createFAQInput.updatedAt
                    },
                    facts: {
                        L: facts
                    }
                },
            }));
            // return the FAQ object
            return {
                data: [createFAQInput]
            };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.FaqErrorType.UnexpectedError
        };
    }
};
exports.createFAQ = createFAQ;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlRkFRUmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy9DcmVhdGVGQVFSZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4REFBd0c7QUFDeEcsK0RBQXlGO0FBQ3pGLCtCQUFrQztBQUVsQzs7Ozs7O0dBTUc7QUFDSSxNQUFNLFNBQVMsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxjQUE4QixFQUF3QixFQUFFO0lBQ3ZHLElBQUk7UUFDQSx5Q0FBeUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXLENBQUM7UUFFdkMsNENBQTRDO1FBQzVDLE1BQU0sY0FBYyxHQUFHLElBQUksZ0NBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBRTVELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLGNBQWMsQ0FBQyxTQUFTLEdBQUcsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQzNGLGNBQWMsQ0FBQyxTQUFTLEdBQUcsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRTNGOzs7V0FHRztRQUNILE1BQU0sY0FBYyxHQUFHLGNBQWMsQ0FBQyxFQUFFLElBQUksTUFBTSxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksZ0NBQWMsQ0FBQztZQUNyRixTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFVO1lBQ2pDLEdBQUcsRUFBRTtnQkFDRCxFQUFFLEVBQUU7b0JBQ0EsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxFQUFFO2lCQUN2QjthQUNKO1lBQ0Q7Ozs7O2VBS0c7WUFDSCxvQkFBb0IsRUFBRSxNQUFNO1lBQzVCLHdCQUF3QixFQUFFO2dCQUN0QixNQUFNLEVBQUUsSUFBSTthQUNmO1NBQ0osQ0FBQyxDQUFDLENBQUM7UUFFSix5REFBeUQ7UUFDekQsSUFBSSxjQUFjLElBQUksY0FBYyxDQUFDLElBQUksRUFBRTtZQUN2QyxnR0FBZ0c7WUFDaEcsTUFBTSxZQUFZLEdBQUcsNkJBQTZCLENBQUM7WUFDbkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsOEJBQVksQ0FBQyxvQkFBb0I7YUFDL0MsQ0FBQTtTQUNKO2FBQU07WUFDSCxpRkFBaUY7WUFDakYsY0FBYyxDQUFDLEVBQUUsR0FBRyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFBLFNBQU0sR0FBRSxDQUFDO1lBRXJFLHVCQUF1QjtZQUN2QixNQUFNLEtBQUssR0FBcUIsRUFBRSxDQUFDO1lBQ25DLGNBQWMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNoQyxLQUFLLENBQUMsSUFBSSxDQUFDO29CQUNQLENBQUMsRUFBRTt3QkFDQyxXQUFXLEVBQUU7NEJBQ1QsQ0FBQyxFQUFFLElBQUssQ0FBQyxXQUFXO3lCQUN2Qjt3QkFDRCxHQUFHLENBQUMsSUFBSyxDQUFDLGVBQWUsSUFBSTs0QkFDekIsZUFBZSxFQUFFO2dDQUNiLENBQUMsRUFBRSxJQUFLLENBQUMsZUFBZ0I7NkJBQzVCO3lCQUNKLENBQUM7d0JBQ0YsR0FBRyxDQUFDLElBQUssQ0FBQyxZQUFZLElBQUk7NEJBQ3RCLFlBQVksRUFBRTtnQ0FDVixDQUFDLEVBQUUsSUFBSyxDQUFDLFlBQWE7NkJBQ3pCO3lCQUNKLENBQUM7d0JBQ0YsSUFBSSxFQUFFOzRCQUNGLENBQUMsRUFBRSxJQUFLLENBQUMsSUFBSTt5QkFDaEI7cUJBQ0o7aUJBQ0osQ0FBQyxDQUFBO1lBQ04sQ0FBQyxDQUFDLENBQUM7WUFFSCxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxnQ0FBYyxDQUFDO2dCQUN6QyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFVO2dCQUNqQyxJQUFJLEVBQUU7b0JBQ0YsRUFBRSxFQUFFO3dCQUNBLENBQUMsRUFBRSxjQUFjLENBQUMsRUFBRztxQkFDeEI7b0JBQ0QsS0FBSyxFQUFFO3dCQUNILENBQUMsRUFBRSxjQUFjLENBQUMsS0FBSztxQkFDMUI7b0JBQ0QsU0FBUyxFQUFFO3dCQUNQLENBQUMsRUFBRSxjQUFjLENBQUMsU0FBVTtxQkFDL0I7b0JBQ0QsU0FBUyxFQUFFO3dCQUNQLENBQUMsRUFBRSxjQUFjLENBQUMsU0FBVTtxQkFDL0I7b0JBQ0QsS0FBSyxFQUFFO3dCQUNILENBQUMsRUFBRSxLQUFLO3FCQUNYO2lCQUNKO2FBQ0osQ0FBQyxDQUFDLENBQUM7WUFFSix3QkFBd0I7WUFDeEIsT0FBTztnQkFDSCxJQUFJLEVBQUUsQ0FBQyxjQUFxQixDQUFDO2FBQ2hDLENBQUE7U0FDSjtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsU0FBUyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3JGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSw4QkFBWSxDQUFDLGVBQWU7U0FDMUMsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBN0dZLFFBQUEsU0FBUyxhQTZHckIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0F0dHJpYnV0ZVZhbHVlLCBEeW5hbW9EQkNsaWVudCwgR2V0SXRlbUNvbW1hbmQsIFB1dEl0ZW1Db21tYW5kfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWR5bmFtb2RiXCI7XG5pbXBvcnQge0NyZWF0ZUZhcUlucHV0LCBGYXEsIEZhcUVycm9yVHlwZSwgRmFxUmVzcG9uc2V9IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge3Y0IGFzIHV1aWR2NH0gZnJvbSAndXVpZCc7XG5cbi8qKlxuICogQ3JlYXRlRkFRIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEBwYXJhbSBjcmVhdGVGQVFJbnB1dCBGQVFTIGlucHV0IG9iamVjdCwgdXNlZCB0byBjcmVhdGUgYSBuZXcgRkFRIG9iamVjdC5cbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgRmFxUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVGQVEgPSBhc3luYyAoZmllbGROYW1lOiBzdHJpbmcsIGNyZWF0ZUZBUUlucHV0OiBDcmVhdGVGYXFJbnB1dCk6IFByb21pc2U8RmFxUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkeW5hbW9EYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAvLyB1cGRhdGUgdGhlIHRpbWVzdGFtcHMgYWNjb3JkaW5nbHlcbiAgICAgICAgY29uc3QgY3JlYXRlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICBjcmVhdGVGQVFJbnB1dC5jcmVhdGVkQXQgPSBjcmVhdGVGQVFJbnB1dC5jcmVhdGVkQXQgPyBjcmVhdGVGQVFJbnB1dC5jcmVhdGVkQXQgOiBjcmVhdGVkQXQ7XG4gICAgICAgIGNyZWF0ZUZBUUlucHV0LnVwZGF0ZWRBdCA9IGNyZWF0ZUZBUUlucHV0LnVwZGF0ZWRBdCA/IGNyZWF0ZUZBUUlucHV0LnVwZGF0ZWRBdCA6IGNyZWF0ZWRBdDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogY2hlY2sgdG8gc2VlIGlmIHRoZXJlIGlzIGFuIGV4aXN0aW5nIEZBUSB3aXRoIHRoZSBzYW1lIElELCBpbiBjYXNlIHRoZXJlIGlzXG4gICAgICAgICAqIGFuIGlkIHBhc3NlZCBpbi5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IHByZUV4aXN0aW5nRkFRID0gY3JlYXRlRkFRSW5wdXQuaWQgJiYgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgR2V0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5GQVFfVEFCTEUhLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlRkFRSW5wdXQuaWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiB3ZSdyZSBub3QgaW50ZXJlc3RlZCBpbiBnZXR0aW5nIGFsbCB0aGUgZGF0YSBmb3IgdGhpcyBjYWxsLCBqdXN0IHRoZSBtaW5pbXVtIGZvciB1cyB0byBkZXRlcm1pbmUgd2hldGhlciB0aGlzIGlzIGEgZHVwbGljYXRlIG9yIG5vdFxuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqIEBsaW5rIGh0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUmVzZXJ2ZWRXb3Jkcy5odG1sXG4gICAgICAgICAgICAgKiBAbGluayBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L2RldmVsb3Blcmd1aWRlL0V4cHJlc3Npb25zLkV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lcy5odG1sXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFByb2plY3Rpb25FeHByZXNzaW9uOiAnI2lkZicsXG4gICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlTmFtZXM6IHtcbiAgICAgICAgICAgICAgICAnI2lkZic6ICdpZCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGFuIGl0ZW0gcmV0cmlldmVkLCB0aGVuIHdlIHJldHVybiBhbiBlcnJvclxuICAgICAgICBpZiAocHJlRXhpc3RpbmdGQVEgJiYgcHJlRXhpc3RpbmdGQVEuSXRlbSkge1xuICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gZXhpc3RlbnQgRkFRIG9iamVjdCwgdGhlbiB3ZSBjYW5ub3QgZHVwbGljYXRlIHRoYXQsIHNvIHdlIHdpbGwgcmV0dXJuIGFuIGVycm9yXG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgRHVwbGljYXRlIEZBUSBvYmplY3QgZm91bmQhYDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBGYXFFcnJvclR5cGUuRHVwbGljYXRlT2JqZWN0Rm91bmRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGdlbmVyYXRlIGEgdW5pcXVlIGFwcGxpY2F0aW9uIGlkZW50aWZpZXIgZm9yIHRoZSBGQVEsIGlmIG5vdCBhbHJlYWR5IHBhc3NlZCBpblxuICAgICAgICAgICAgY3JlYXRlRkFRSW5wdXQuaWQgPSBjcmVhdGVGQVFJbnB1dC5pZCA/IGNyZWF0ZUZBUUlucHV0LmlkIDogdXVpZHY0KCk7XG5cbiAgICAgICAgICAgIC8vIHN0b3JlIHRoZSBGQVEgb2JqZWN0XG4gICAgICAgICAgICBjb25zdCBmYWN0czogQXR0cmlidXRlVmFsdWVbXSA9IFtdO1xuICAgICAgICAgICAgY3JlYXRlRkFRSW5wdXQuZmFjdHMuZm9yRWFjaChmYWN0ID0+IHtcbiAgICAgICAgICAgICAgICBmYWN0cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgTToge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBmYWN0IS5kZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLihmYWN0IS5saW5rYWJsZUtleXdvcmQgJiYge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmthYmxlS2V5d29yZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBmYWN0IS5saW5rYWJsZUtleXdvcmQhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi4oZmFjdCEubGlua0xvY2F0aW9uICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rTG9jYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogZmFjdCEubGlua0xvY2F0aW9uIVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGZhY3QhLnR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgYXdhaXQgZHluYW1vRGJDbGllbnQuc2VuZChuZXcgUHV0SXRlbUNvbW1hbmQoe1xuICAgICAgICAgICAgICAgIFRhYmxlTmFtZTogcHJvY2Vzcy5lbnYuRkFRX1RBQkxFISxcbiAgICAgICAgICAgICAgICBJdGVtOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVGQVFJbnB1dC5pZCFcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZUZBUUlucHV0LnRpdGxlXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlRkFRSW5wdXQuY3JlYXRlZEF0IVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZUZBUUlucHV0LnVwZGF0ZWRBdCFcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZmFjdHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIEw6IGZhY3RzXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIEZBUSBvYmplY3RcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGF0YTogW2NyZWF0ZUZBUUlucHV0IGFzIEZhcV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgJHtmaWVsZE5hbWV9IG11dGF0aW9uICR7ZXJyfWA7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgIGVycm9yVHlwZTogRmFxRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9XG4gICAgfVxufVxuIl19