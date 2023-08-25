"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFAQs = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * GetFAQs resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @returns {@link Promise} of {@link FaqResponse}
 */
const getFAQs = async (fieldName) => {
    try {
        // retrieving the current function region
        const region = process.env.AWS_REGION;
        // initializing the DynamoDB document client
        const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
        /**
         * the data to be retrieved from the Query Command
         * the eligible user Items returned from the Query Command, all aggregated together
         * the last evaluated key, to help with the pagination of results
         */
        let result = [];
        let retrievedData;
        do {
            /**
             * retrieve all the FAQs
             *
             * Limit of 1 MB per paginated response data, but we won't have that many FAQs anyway for now, which means that we won't
             * need to do pagination here, since we actually retrieve all users in a looped format, and we account for
             * paginated responses.
             *
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html}
             * @link {https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html}
             */
            retrievedData = await dynamoDbClient.send(new client_dynamodb_1.ScanCommand({
                TableName: process.env.FAQ_TABLE,
                Limit: 1000, // for now, we don't need to worry about this limit
            }));
            result = result.concat(retrievedData.Items);
        } while (retrievedData && retrievedData.Count && retrievedData.Items &&
            retrievedData.Items.length && retrievedData.Count !== 0 &&
            retrievedData.Items.length !== 0 && retrievedData.LastEvaluatedKey);
        // if there are eligible users retrieved, then return them accordingly
        if (result && result.length !== 0) {
            // convert the Dynamo DB data from Dynamo DB JSON format to an FAQ data format
            const faqsData = [];
            result.forEach(faqResult => {
                const facts = [];
                faqResult.facts.L && faqResult.facts.L.forEach(fact => {
                    const newFact = {
                        description: fact.M.description.S,
                        ...(fact.M.linkableKeyword && {
                            linkableKeyword: fact.M.linkableKeyword.S
                        }),
                        ...(fact.M.linkLocation && {
                            linkLocation: fact.M.linkLocation.S
                        }),
                        type: fact.M.type.S
                    };
                    facts.push(newFact);
                });
                const faq = {
                    id: faqResult.id.S,
                    title: faqResult.title.S,
                    facts: facts,
                    createdAt: faqResult.createdAt.S,
                    updatedAt: faqResult.updatedAt.S,
                };
                faqsData.push(faq);
            });
            // return the list of FAQs retrieved
            return {
                data: faqsData
            };
        }
        else {
            const errorMessage = `No FAQs not found!`;
            console.log(errorMessage);
            return {
                errorMessage: errorMessage,
                errorType: moonbeam_models_1.FaqErrorType.NoneOrAbsent
            };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} query ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.FaqErrorType.UnexpectedError
        };
    }
};
exports.getFAQs = getFAQs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2V0RkFRc1Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvR2V0RkFRc1Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDhEQUFxRjtBQUNyRiwrREFBeUY7QUFFekY7Ozs7O0dBS0c7QUFDSSxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBd0IsRUFBRTtJQUNyRSxJQUFJO1FBQ0EseUNBQXlDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRXZDLDRDQUE0QztRQUM1QyxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUU1RDs7OztXQUlHO1FBQ0gsSUFBSSxNQUFNLEdBQXFDLEVBQUUsQ0FBQztRQUNsRCxJQUFJLGFBQWEsQ0FBQztRQUVsQixHQUFHO1lBQ0M7Ozs7Ozs7OztlQVNHO1lBQ0gsYUFBYSxHQUFHLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLDZCQUFXLENBQUM7Z0JBQ3RELFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVU7Z0JBQ2pDLEtBQUssRUFBRSxJQUFJLEVBQUUsbURBQW1EO2FBQ25FLENBQUMsQ0FBQyxDQUFDO1lBRUosTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQy9DLFFBQVEsYUFBYSxJQUFJLGFBQWEsQ0FBQyxLQUFLLElBQUksYUFBYSxDQUFDLEtBQUs7WUFDcEUsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksYUFBYSxDQUFDLEtBQUssS0FBSyxDQUFDO1lBQ3ZELGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxhQUFhLENBQUMsZ0JBQWdCLEVBQUU7UUFFcEUsc0VBQXNFO1FBQ3RFLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQy9CLDhFQUE4RTtZQUM5RSxNQUFNLFFBQVEsR0FBVSxFQUFFLENBQUM7WUFDM0IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDdkIsTUFBTSxLQUFLLEdBQVcsRUFBRSxDQUFDO2dCQUN6QixTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ25ELE1BQU0sT0FBTyxHQUFTO3dCQUNsQixXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBRTt3QkFDbkMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFFLENBQUMsZUFBZSxJQUFJOzRCQUMzQixlQUFlLEVBQUUsSUFBSSxDQUFDLENBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBRTt5QkFDOUMsQ0FBQzt3QkFDRixHQUFHLENBQUMsSUFBSSxDQUFDLENBQUUsQ0FBQyxZQUFZLElBQUk7NEJBQ3hCLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBRSxDQUFDLFlBQVksQ0FBQyxDQUFFO3lCQUN4QyxDQUFDO3dCQUNGLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBRSxDQUFDLElBQUksQ0FBQyxDQUFjO3FCQUNwQyxDQUFBO29CQUNELEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3hCLENBQUMsQ0FBQyxDQUFBO2dCQUNGLE1BQU0sR0FBRyxHQUFRO29CQUNiLEVBQUUsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUU7b0JBQ25CLEtBQUssRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUU7b0JBQ3pCLEtBQUssRUFBRSxLQUFLO29CQUNaLFNBQVMsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUU7b0JBQ2pDLFNBQVMsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUU7aUJBQ3BDLENBQUM7Z0JBQ0YsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN2QixDQUFDLENBQUMsQ0FBQztZQUNILG9DQUFvQztZQUNwQyxPQUFPO2dCQUNILElBQUksRUFBRSxRQUFRO2FBQ2pCLENBQUE7U0FDSjthQUFNO1lBQ0gsTUFBTSxZQUFZLEdBQUcsb0JBQW9CLENBQUM7WUFDMUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxQixPQUFPO2dCQUNILFlBQVksRUFBRSxZQUFZO2dCQUMxQixTQUFTLEVBQUUsOEJBQVksQ0FBQyxZQUFZO2FBQ3ZDLENBQUE7U0FDSjtLQUNKO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLFlBQVksR0FBRyxvQ0FBb0MsU0FBUyxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ2xGLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDMUIsT0FBTztZQUNILFlBQVksRUFBRSxZQUFZO1lBQzFCLFNBQVMsRUFBRSw4QkFBWSxDQUFDLGVBQWU7U0FDMUMsQ0FBQztLQUNMO0FBQ0wsQ0FBQyxDQUFBO0FBdEZZLFFBQUEsT0FBTyxXQXNGbkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0F0dHJpYnV0ZVZhbHVlLCBEeW5hbW9EQkNsaWVudCwgU2NhbkNvbW1hbmR9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIjtcbmltcG9ydCB7RmFjdCwgRmFjdFR5cGUsIEZhcSwgRmFxRXJyb3JUeXBlLCBGYXFSZXNwb25zZX0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBHZXRGQVFzIHJlc29sdmVyXG4gKlxuICogQHBhcmFtIGZpZWxkTmFtZSBuYW1lIG9mIHRoZSByZXNvbHZlciBwYXRoIGZyb20gdGhlIEFwcFN5bmMgZXZlbnRcbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgRmFxUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRGQVFzID0gYXN5bmMgKGZpZWxkTmFtZTogc3RyaW5nKTogUHJvbWlzZTxGYXFSZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8vIHJldHJpZXZpbmcgdGhlIGN1cnJlbnQgZnVuY3Rpb24gcmVnaW9uXG4gICAgICAgIGNvbnN0IHJlZ2lvbiA9IHByb2Nlc3MuZW52LkFXU19SRUdJT04hO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemluZyB0aGUgRHluYW1vREIgZG9jdW1lbnQgY2xpZW50XG4gICAgICAgIGNvbnN0IGR5bmFtb0RiQ2xpZW50ID0gbmV3IER5bmFtb0RCQ2xpZW50KHtyZWdpb246IHJlZ2lvbn0pO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiB0aGUgZGF0YSB0byBiZSByZXRyaWV2ZWQgZnJvbSB0aGUgUXVlcnkgQ29tbWFuZFxuICAgICAgICAgKiB0aGUgZWxpZ2libGUgdXNlciBJdGVtcyByZXR1cm5lZCBmcm9tIHRoZSBRdWVyeSBDb21tYW5kLCBhbGwgYWdncmVnYXRlZCB0b2dldGhlclxuICAgICAgICAgKiB0aGUgbGFzdCBldmFsdWF0ZWQga2V5LCB0byBoZWxwIHdpdGggdGhlIHBhZ2luYXRpb24gb2YgcmVzdWx0c1xuICAgICAgICAgKi9cbiAgICAgICAgbGV0IHJlc3VsdDogUmVjb3JkPHN0cmluZywgQXR0cmlidXRlVmFsdWU+W10gPSBbXTtcbiAgICAgICAgbGV0IHJldHJpZXZlZERhdGE7XG5cbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiByZXRyaWV2ZSBhbGwgdGhlIEZBUXNcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBMaW1pdCBvZiAxIE1CIHBlciBwYWdpbmF0ZWQgcmVzcG9uc2UgZGF0YSwgYnV0IHdlIHdvbid0IGhhdmUgdGhhdCBtYW55IEZBUXMgYW55d2F5IGZvciBub3csIHdoaWNoIG1lYW5zIHRoYXQgd2Ugd29uJ3RcbiAgICAgICAgICAgICAqIG5lZWQgdG8gZG8gcGFnaW5hdGlvbiBoZXJlLCBzaW5jZSB3ZSBhY3R1YWxseSByZXRyaWV2ZSBhbGwgdXNlcnMgaW4gYSBsb29wZWQgZm9ybWF0LCBhbmQgd2UgYWNjb3VudCBmb3JcbiAgICAgICAgICAgICAqIHBhZ2luYXRlZCByZXNwb25zZXMuXG4gICAgICAgICAgICAgKlxuICAgICAgICAgICAgICogQGxpbmsge2h0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUXVlcnkuUGFnaW5hdGlvbi5odG1sfVxuICAgICAgICAgICAgICogQGxpbmsge2h0dHBzOi8vZG9jcy5hd3MuYW1hem9uLmNvbS9hbWF6b25keW5hbW9kYi9sYXRlc3QvZGV2ZWxvcGVyZ3VpZGUvUXVlcnkuaHRtbH1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgcmV0cmlldmVkRGF0YSA9IGF3YWl0IGR5bmFtb0RiQ2xpZW50LnNlbmQobmV3IFNjYW5Db21tYW5kKHtcbiAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkZBUV9UQUJMRSEsXG4gICAgICAgICAgICAgICAgTGltaXQ6IDEwMDAsIC8vIGZvciBub3csIHdlIGRvbid0IG5lZWQgdG8gd29ycnkgYWJvdXQgdGhpcyBsaW1pdFxuICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHJldHJpZXZlZERhdGEuSXRlbXMpO1xuICAgICAgICB9IHdoaWxlIChyZXRyaWV2ZWREYXRhICYmIHJldHJpZXZlZERhdGEuQ291bnQgJiYgcmV0cmlldmVkRGF0YS5JdGVtcyAmJlxuICAgICAgICByZXRyaWV2ZWREYXRhLkl0ZW1zLmxlbmd0aCAmJiByZXRyaWV2ZWREYXRhLkNvdW50ICE9PSAwICYmXG4gICAgICAgIHJldHJpZXZlZERhdGEuSXRlbXMubGVuZ3RoICE9PSAwICYmIHJldHJpZXZlZERhdGEuTGFzdEV2YWx1YXRlZEtleSk7XG5cbiAgICAgICAgLy8gaWYgdGhlcmUgYXJlIGVsaWdpYmxlIHVzZXJzIHJldHJpZXZlZCwgdGhlbiByZXR1cm4gdGhlbSBhY2NvcmRpbmdseVxuICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgIC8vIGNvbnZlcnQgdGhlIER5bmFtbyBEQiBkYXRhIGZyb20gRHluYW1vIERCIEpTT04gZm9ybWF0IHRvIGFuIEZBUSBkYXRhIGZvcm1hdFxuICAgICAgICAgICAgY29uc3QgZmFxc0RhdGE6IEZhcVtdID0gW107XG4gICAgICAgICAgICByZXN1bHQuZm9yRWFjaChmYXFSZXN1bHQgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZhY3RzOiBGYWN0W10gPSBbXTtcbiAgICAgICAgICAgICAgICBmYXFSZXN1bHQuZmFjdHMuTCAmJiBmYXFSZXN1bHQuZmFjdHMuTCEuZm9yRWFjaChmYWN0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3RmFjdDogRmFjdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBmYWN0Lk0hLmRlc2NyaXB0aW9uLlMhLFxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uKGZhY3QuTSEubGlua2FibGVLZXl3b3JkICYmIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rYWJsZUtleXdvcmQ6IGZhY3QuTSEubGlua2FibGVLZXl3b3JkLlMhXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLihmYWN0Lk0hLmxpbmtMb2NhdGlvbiAmJiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlua0xvY2F0aW9uOiBmYWN0Lk0hLmxpbmtMb2NhdGlvbi5TIVxuICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBmYWN0Lk0hLnR5cGUuUyEgYXMgRmFjdFR5cGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmYWN0cy5wdXNoKG5ld0ZhY3QpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgY29uc3QgZmFxOiBGYXEgPSB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBmYXFSZXN1bHQuaWQuUyEsXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBmYXFSZXN1bHQudGl0bGUuUyEsXG4gICAgICAgICAgICAgICAgICAgIGZhY3RzOiBmYWN0cyxcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBmYXFSZXN1bHQuY3JlYXRlZEF0LlMhLFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IGZhcVJlc3VsdC51cGRhdGVkQXQuUyEsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBmYXFzRGF0YS5wdXNoKGZhcSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgbGlzdCBvZiBGQVFzIHJldHJpZXZlZFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkYXRhOiBmYXFzRGF0YVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE5vIEZBUXMgbm90IGZvdW5kIWA7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvck1lc3NhZ2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogRmFxRXJyb3JUeXBlLk5vbmVPckFic2VudFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gcXVlcnkgJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBGYXFFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19