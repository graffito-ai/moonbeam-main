"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFAQ = void 0;
const AWS = __importStar(require("aws-sdk"));
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * CreateFAQ resolver
 *
 * @param createFaqInput object to be used when creating a new FAQ object
 * @returns {@link Promise} of {@link FaqResponse}
 */
const createFAQ = async (createFaqInput) => {
    try {
        // initializing the DynamoDB document client
        const docClient = new AWS.DynamoDB.DocumentClient();
        // update the timestamps accordingly
        const createdAt = new Date().toISOString();
        createFaqInput.createdAt = createdAt;
        createFaqInput.updatedAt = createdAt;
        // validating that the appropriate input object parameters are passed in according to the type of FAQ to be created
        switch (createFaqInput.type) {
            case moonbeam_models_1.FaqType.Linkable:
                // validate that there is an application link passed in, and that there are no facts in the FAQ object
                if (!createFaqInput.applicationLink || (createFaqInput.facts && createFaqInput.facts.length !== 0)) {
                    const invalidLinkableInputMessage = `Invalid ${moonbeam_models_1.FaqType.Linkable} input passed in!`;
                    return {
                        errorMessage: invalidLinkableInputMessage,
                        errorType: moonbeam_models_1.FaqErrorType.ValidationError
                    };
                }
                break;
            case moonbeam_models_1.FaqType.NonLinkable:
                // validate that there is no application link passed in, and that there is a least one fact in the FAQ object
                if (createFaqInput.applicationLink || (!createFaqInput.facts || createFaqInput.facts.length === 0)) {
                    const invalidNonLinkableInputMessage = `Invalid ${moonbeam_models_1.FaqType.NonLinkable} input passed in!`;
                    return {
                        errorMessage: invalidNonLinkableInputMessage,
                        errorType: moonbeam_models_1.FaqErrorType.ValidationError
                    };
                }
                break;
            default:
                const invalidFAQTypeMessage = `Invalid FAQ type passed in ${createFaqInput.type}`;
                console.log(invalidFAQTypeMessage);
                return {
                    errorMessage: invalidFAQTypeMessage,
                    errorType: moonbeam_models_1.FaqErrorType.ValidationError
                };
        }
        // store the FAQ object
        await docClient.put({
            TableName: process.env.FAQ_TABLE,
            Item: createFaqInput
        }).promise();
        // return the FAQS object
        return {
            data: [createFaqInput]
        };
    }
    catch (err) {
        console.log(`Unexpected error while executing createFAQ mutation {}`, err);
        return {
            errorMessage: `Unexpected error while executing createFAQ mutation ${err}`,
            errorType: moonbeam_models_1.FaqErrorType.UnexpectedError
        };
    }
};
exports.createFAQ = createFAQ;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlRkFRLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xhbWJkYS9yZXNvbHZlcnMvY3JlYXRlRkFRLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNkNBQStCO0FBQy9CLCtEQUFrRztBQUVsRzs7Ozs7R0FLRztBQUNJLE1BQU0sU0FBUyxHQUFHLEtBQUssRUFBRSxjQUE4QixFQUF3QixFQUFFO0lBQ3BGLElBQUk7UUFDQSw0Q0FBNEM7UUFDNUMsTUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXBELG9DQUFvQztRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLGNBQWMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQ3JDLGNBQWMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO1FBRXBDLG1IQUFtSDtRQUNuSCxRQUFRLGNBQWMsQ0FBQyxJQUFJLEVBQUU7WUFDekIsS0FBSyx5QkFBTyxDQUFDLFFBQVE7Z0JBQ2pCLHNHQUFzRztnQkFDdEcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxJQUFJLGNBQWMsQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxFQUFFO29CQUNoRyxNQUFNLDJCQUEyQixHQUFHLFdBQVcseUJBQU8sQ0FBQyxRQUFRLG1CQUFtQixDQUFDO29CQUNuRixPQUFPO3dCQUNILFlBQVksRUFBRSwyQkFBMkI7d0JBQ3pDLFNBQVMsRUFBRSw4QkFBWSxDQUFDLGVBQWU7cUJBQzFDLENBQUE7aUJBQ0o7Z0JBQ0QsTUFBTTtZQUNWLEtBQUsseUJBQU8sQ0FBQyxXQUFXO2dCQUNwQiw2R0FBNkc7Z0JBQzdHLElBQUksY0FBYyxDQUFDLGVBQWUsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUFDLEtBQUssSUFBSSxjQUFjLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsRUFBRTtvQkFDaEcsTUFBTSw4QkFBOEIsR0FBRyxXQUFXLHlCQUFPLENBQUMsV0FBVyxtQkFBbUIsQ0FBQztvQkFDekYsT0FBTzt3QkFDSCxZQUFZLEVBQUUsOEJBQThCO3dCQUM1QyxTQUFTLEVBQUUsOEJBQVksQ0FBQyxlQUFlO3FCQUMxQyxDQUFBO2lCQUNKO2dCQUNELE1BQU07WUFDVjtnQkFDSSxNQUFNLHFCQUFxQixHQUFHLDhCQUE4QixjQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xGLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztnQkFDbkMsT0FBTztvQkFDSCxZQUFZLEVBQUUscUJBQXFCO29CQUNuQyxTQUFTLEVBQUUsOEJBQVksQ0FBQyxlQUFlO2lCQUMxQyxDQUFBO1NBQ1I7UUFFRCx1QkFBdUI7UUFDdkIsTUFBTSxTQUFTLENBQUMsR0FBRyxDQUFDO1lBQ2hCLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVU7WUFDakMsSUFBSSxFQUFFLGNBQWM7U0FDdkIsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRWIseUJBQXlCO1FBQ3pCLE9BQU87WUFDSCxJQUFJLEVBQUUsQ0FBQyxjQUFxQixDQUFDO1NBQ2hDLENBQUE7S0FDSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3REFBd0QsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMzRSxPQUFPO1lBQ0gsWUFBWSxFQUFFLHVEQUF1RCxHQUFHLEVBQUU7WUFDMUUsU0FBUyxFQUFFLDhCQUFZLENBQUMsZUFBZTtTQUMxQyxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUExRFksUUFBQSxTQUFTLGFBMERyQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEFXUyBmcm9tICdhd3Mtc2RrJztcbmltcG9ydCB7Q3JlYXRlRmFxSW5wdXQsIEZhcSwgRmFxRXJyb3JUeXBlLCBGYXFSZXNwb25zZSwgRmFxVHlwZX0gZnJvbSBcIkBtb29uYmVhbS9tb29uYmVhbS1tb2RlbHNcIjtcblxuLyoqXG4gKiBDcmVhdGVGQVEgcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gY3JlYXRlRmFxSW5wdXQgb2JqZWN0IHRvIGJlIHVzZWQgd2hlbiBjcmVhdGluZyBhIG5ldyBGQVEgb2JqZWN0XG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIEZhcVJlc3BvbnNlfVxuICovXG5leHBvcnQgY29uc3QgY3JlYXRlRkFRID0gYXN5bmMgKGNyZWF0ZUZhcUlucHV0OiBDcmVhdGVGYXFJbnB1dCk6IFByb21pc2U8RmFxUmVzcG9uc2U+ID0+IHtcbiAgICB0cnkge1xuICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICBjb25zdCBkb2NDbGllbnQgPSBuZXcgQVdTLkR5bmFtb0RCLkRvY3VtZW50Q2xpZW50KCk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSB0aW1lc3RhbXBzIGFjY29yZGluZ2x5XG4gICAgICAgIGNvbnN0IGNyZWF0ZWRBdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICAgICAgY3JlYXRlRmFxSW5wdXQuY3JlYXRlZEF0ID0gY3JlYXRlZEF0O1xuICAgICAgICBjcmVhdGVGYXFJbnB1dC51cGRhdGVkQXQgPSBjcmVhdGVkQXRcblxuICAgICAgICAvLyB2YWxpZGF0aW5nIHRoYXQgdGhlIGFwcHJvcHJpYXRlIGlucHV0IG9iamVjdCBwYXJhbWV0ZXJzIGFyZSBwYXNzZWQgaW4gYWNjb3JkaW5nIHRvIHRoZSB0eXBlIG9mIEZBUSB0byBiZSBjcmVhdGVkXG4gICAgICAgIHN3aXRjaCAoY3JlYXRlRmFxSW5wdXQudHlwZSkge1xuICAgICAgICAgICAgY2FzZSBGYXFUeXBlLkxpbmthYmxlOlxuICAgICAgICAgICAgICAgIC8vIHZhbGlkYXRlIHRoYXQgdGhlcmUgaXMgYW4gYXBwbGljYXRpb24gbGluayBwYXNzZWQgaW4sIGFuZCB0aGF0IHRoZXJlIGFyZSBubyBmYWN0cyBpbiB0aGUgRkFRIG9iamVjdFxuICAgICAgICAgICAgICAgIGlmICghY3JlYXRlRmFxSW5wdXQuYXBwbGljYXRpb25MaW5rIHx8IChjcmVhdGVGYXFJbnB1dC5mYWN0cyAmJiBjcmVhdGVGYXFJbnB1dC5mYWN0cy5sZW5ndGggIT09IDApKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGludmFsaWRMaW5rYWJsZUlucHV0TWVzc2FnZSA9IGBJbnZhbGlkICR7RmFxVHlwZS5MaW5rYWJsZX0gaW5wdXQgcGFzc2VkIGluIWA7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGludmFsaWRMaW5rYWJsZUlucHV0TWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogRmFxRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBGYXFUeXBlLk5vbkxpbmthYmxlOlxuICAgICAgICAgICAgICAgIC8vIHZhbGlkYXRlIHRoYXQgdGhlcmUgaXMgbm8gYXBwbGljYXRpb24gbGluayBwYXNzZWQgaW4sIGFuZCB0aGF0IHRoZXJlIGlzIGEgbGVhc3Qgb25lIGZhY3QgaW4gdGhlIEZBUSBvYmplY3RcbiAgICAgICAgICAgICAgICBpZiAoY3JlYXRlRmFxSW5wdXQuYXBwbGljYXRpb25MaW5rIHx8ICghY3JlYXRlRmFxSW5wdXQuZmFjdHMgfHwgY3JlYXRlRmFxSW5wdXQuZmFjdHMubGVuZ3RoID09PSAwKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbnZhbGlkTm9uTGlua2FibGVJbnB1dE1lc3NhZ2UgPSBgSW52YWxpZCAke0ZhcVR5cGUuTm9uTGlua2FibGV9IGlucHV0IHBhc3NlZCBpbiFgO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBpbnZhbGlkTm9uTGlua2FibGVJbnB1dE1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclR5cGU6IEZhcUVycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgY29uc3QgaW52YWxpZEZBUVR5cGVNZXNzYWdlID0gYEludmFsaWQgRkFRIHR5cGUgcGFzc2VkIGluICR7Y3JlYXRlRmFxSW5wdXQudHlwZX1gO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGludmFsaWRGQVFUeXBlTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBpbnZhbGlkRkFRVHlwZU1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogRmFxRXJyb3JUeXBlLlZhbGlkYXRpb25FcnJvclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHN0b3JlIHRoZSBGQVEgb2JqZWN0XG4gICAgICAgIGF3YWl0IGRvY0NsaWVudC5wdXQoe1xuICAgICAgICAgICAgVGFibGVOYW1lOiBwcm9jZXNzLmVudi5GQVFfVEFCTEUhLFxuICAgICAgICAgICAgSXRlbTogY3JlYXRlRmFxSW5wdXRcbiAgICAgICAgfSkucHJvbWlzZSgpO1xuXG4gICAgICAgIC8vIHJldHVybiB0aGUgRkFRUyBvYmplY3RcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRhdGE6IFtjcmVhdGVGYXFJbnB1dCBhcyBGYXFdXG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZXhlY3V0aW5nIGNyZWF0ZUZBUSBtdXRhdGlvbiB7fWAsIGVycik7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyBjcmVhdGVGQVEgbXV0YXRpb24gJHtlcnJ9YCxcbiAgICAgICAgICAgIGVycm9yVHlwZTogRmFxRXJyb3JUeXBlLlVuZXhwZWN0ZWRFcnJvclxuICAgICAgICB9O1xuICAgIH1cbn1cbiJdfQ==