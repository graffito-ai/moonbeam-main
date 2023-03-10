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
exports.updateAccountLink = void 0;
const AWS = __importStar(require("aws-sdk"));
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
/**
 * UpdateAccountLink resolver
 *
 * @param updateAccountLinkInput input to update an account link to
 * @returns {@link Promise} of {@link ReferralResponse}
 */
const updateAccountLink = async (updateAccountLinkInput) => {
    // initializing the DynamoDB document client
    const docClient = new AWS.DynamoDB.DocumentClient();
    try {
        // validating that the appropriate update link parameters are passed in
        if (!updateAccountLinkInput.accountLinkError &&
            ((!updateAccountLinkInput.accounts && !updateAccountLinkInput.accessToken) ||
                (updateAccountLinkInput.accounts && (updateAccountLinkInput.accounts.length === 0 || !updateAccountLinkInput.accessToken)) ||
                (!updateAccountLinkInput.accounts && updateAccountLinkInput.accessToken))) {
            console.log(`Invalid link parameters to update account link with {}`, JSON.stringify(updateAccountLinkInput));
            return {
                errorMessage: `Invalid link parameters to update account link with ${JSON.stringify(updateAccountLinkInput)}`,
                errorType: moonbeam_models_1.LinkErrorType.ValidationError
            };
        }
        // build the parameters to passed in, in order to update the account link object
        let params = {
            TableName: process.env.ACCOUNT_LINKS,
            Key: {
                id: updateAccountLinkInput.id
            },
            ExpressionAttributeValues: {},
            ExpressionAttributeNames: {},
            UpdateExpression: "",
            ReturnValues: "UPDATED_NEW"
        };
        let prefix = "set ";
        let attributes = Object.keys(updateAccountLinkInput);
        for (let i = 0; i < attributes.length; i++) {
            let attribute = attributes[i];
            if (attribute !== "id") {
                params["UpdateExpression"] += prefix + "#" + attribute + " = :" + attribute;
                // @ts-ignore
                params["ExpressionAttributeValues"][":" + attribute] = updateAccountLinkInput[attribute];
                params["ExpressionAttributeNames"]["#" + attribute] = attribute;
                prefix = ", ";
            }
        }
        // update the account link based on the passed in object
        await docClient.update(params).promise();
        // return the updated referral object
        return {
            data: updateAccountLinkInput
        };
    }
    catch (err) {
        console.log(`Unexpected error while executing updateAccountLink mutation {}`, err);
        return {
            errorMessage: `Unexpected error while executing createAccountLink mutation. ${err}`,
            errorType: moonbeam_models_1.LinkErrorType.UnexpectedError
        };
    }
};
exports.updateAccountLink = updateAccountLink;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlQWNjb3VudExpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGFtYmRhL3Jlc29sdmVycy91cGRhdGVBY2NvdW50TGluay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDZDQUErQjtBQUMvQiwrREFLbUM7QUFlbkM7Ozs7O0dBS0c7QUFDSSxNQUFNLGlCQUFpQixHQUFHLEtBQUssRUFBRSxzQkFBOEMsRUFBZ0MsRUFBRTtJQUNwSCw0Q0FBNEM7SUFDNUMsTUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBRXBELElBQUk7UUFDQSx1RUFBdUU7UUFDdkUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLGdCQUFnQjtZQUN4QyxDQUNJLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUM7Z0JBQ3pFLENBQUMsc0JBQXNCLENBQUMsUUFBUSxJQUFJLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDMUgsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLFFBQVEsSUFBSSxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsQ0FDM0UsRUFBRTtZQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsd0RBQXdELEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7WUFDOUcsT0FBTztnQkFDSCxZQUFZLEVBQUUsdURBQXVELElBQUksQ0FBQyxTQUFTLENBQUMsc0JBQXNCLENBQUMsRUFBRTtnQkFDN0csU0FBUyxFQUFFLCtCQUFhLENBQUMsZUFBZTthQUMzQyxDQUFDO1NBQ0w7UUFFRCxnRkFBZ0Y7UUFDaEYsSUFBSSxNQUFNLEdBQWlCO1lBQ3ZCLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWM7WUFDckMsR0FBRyxFQUFFO2dCQUNELEVBQUUsRUFBRSxzQkFBc0IsQ0FBQyxFQUFFO2FBQ2hDO1lBQ0QseUJBQXlCLEVBQUUsRUFBRTtZQUM3Qix3QkFBd0IsRUFBRSxFQUFFO1lBQzVCLGdCQUFnQixFQUFFLEVBQUU7WUFDcEIsWUFBWSxFQUFFLGFBQWE7U0FDOUIsQ0FBQztRQUNGLElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNwQixJQUFJLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDckQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDeEMsSUFBSSxTQUFTLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLElBQUksU0FBUyxLQUFLLElBQUksRUFBRTtnQkFDcEIsTUFBTSxDQUFDLGtCQUFrQixDQUFDLElBQUksTUFBTSxHQUFHLEdBQUcsR0FBRyxTQUFTLEdBQUcsTUFBTSxHQUFHLFNBQVMsQ0FBQztnQkFDNUUsYUFBYTtnQkFDYixNQUFNLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFDLEdBQUcsc0JBQXNCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3pGLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUMsR0FBRyxTQUFTLENBQUM7Z0JBQ2hFLE1BQU0sR0FBRyxJQUFJLENBQUM7YUFDakI7U0FDSjtRQUVELHdEQUF3RDtRQUN4RCxNQUFNLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFekMscUNBQXFDO1FBQ3JDLE9BQU87WUFDSCxJQUFJLEVBQUUsc0JBQTRDO1NBQ3JELENBQUE7S0FDSjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnRUFBZ0UsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNuRixPQUFPO1lBQ0gsWUFBWSxFQUFFLGdFQUFnRSxHQUFHLEVBQUU7WUFDbkYsU0FBUyxFQUFFLCtCQUFhLENBQUMsZUFBZTtTQUMzQyxDQUFDO0tBQ0w7QUFDTCxDQUFDLENBQUE7QUF6RFksUUFBQSxpQkFBaUIscUJBeUQ3QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEFXUyBmcm9tICdhd3Mtc2RrJztcbmltcG9ydCB7XG4gICAgQWNjb3VudExpbmtEZXRhaWxzLFxuICAgIEFjY291bnRMaW5rUmVzcG9uc2UsXG4gICAgTGlua0Vycm9yVHlwZSxcbiAgICBVcGRhdGVBY2NvdW50TGlua0lucHV0XG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge1RhYmxlTmFtZSwgVXBkYXRlRXhwcmVzc2lvbn0gZnJvbSAnYXdzLXNkay9jbGllbnRzL2R5bmFtb2RiJztcblxuLyoqXG4gKiBNYXBwaW5nIG91dCB0aGUgdXBkYXRlIHBhcmFtZXRlcnMgdG8gcGFzcyBpbiB0byB0aGUgRHluYW1vREIgY2xpZW50XG4gKi9cbnR5cGUgVXBkYXRlUGFyYW1zID0ge1xuICAgIFRhYmxlTmFtZTogVGFibGVOYW1lXG4gICAgS2V5OiBhbnksXG4gICAgRXhwcmVzc2lvbkF0dHJpYnV0ZVZhbHVlczogYW55LFxuICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczogYW55LFxuICAgIFVwZGF0ZUV4cHJlc3Npb246IFVwZGF0ZUV4cHJlc3Npb24sXG4gICAgUmV0dXJuVmFsdWVzOiBzdHJpbmdcbn1cblxuLyoqXG4gKiBVcGRhdGVBY2NvdW50TGluayByZXNvbHZlclxuICpcbiAqIEBwYXJhbSB1cGRhdGVBY2NvdW50TGlua0lucHV0IGlucHV0IHRvIHVwZGF0ZSBhbiBhY2NvdW50IGxpbmsgdG9cbiAqIEByZXR1cm5zIHtAbGluayBQcm9taXNlfSBvZiB7QGxpbmsgUmVmZXJyYWxSZXNwb25zZX1cbiAqL1xuZXhwb3J0IGNvbnN0IHVwZGF0ZUFjY291bnRMaW5rID0gYXN5bmMgKHVwZGF0ZUFjY291bnRMaW5rSW5wdXQ6IFVwZGF0ZUFjY291bnRMaW5rSW5wdXQpOiBQcm9taXNlPEFjY291bnRMaW5rUmVzcG9uc2U+ID0+IHtcbiAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgIGNvbnN0IGRvY0NsaWVudCA9IG5ldyBBV1MuRHluYW1vREIuRG9jdW1lbnRDbGllbnQoKTtcblxuICAgIHRyeSB7XG4gICAgICAgIC8vIHZhbGlkYXRpbmcgdGhhdCB0aGUgYXBwcm9wcmlhdGUgdXBkYXRlIGxpbmsgcGFyYW1ldGVycyBhcmUgcGFzc2VkIGluXG4gICAgICAgIGlmICghdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2NvdW50TGlua0Vycm9yICYmXG4gICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAgKCF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRzICYmICF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY2Vzc1Rva2VuKSB8fFxuICAgICAgICAgICAgICAgICh1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRzICYmICh1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRzLmxlbmd0aCA9PT0gMCB8fCAhdXBkYXRlQWNjb3VudExpbmtJbnB1dC5hY2Nlc3NUb2tlbikpIHx8XG4gICAgICAgICAgICAgICAgKCF1cGRhdGVBY2NvdW50TGlua0lucHV0LmFjY291bnRzICYmIHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuYWNjZXNzVG9rZW4pXG4gICAgICAgICAgICApKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgSW52YWxpZCBsaW5rIHBhcmFtZXRlcnMgdG8gdXBkYXRlIGFjY291bnQgbGluayB3aXRoIHt9YCwgSlNPTi5zdHJpbmdpZnkodXBkYXRlQWNjb3VudExpbmtJbnB1dCkpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGBJbnZhbGlkIGxpbmsgcGFyYW1ldGVycyB0byB1cGRhdGUgYWNjb3VudCBsaW5rIHdpdGggJHtKU09OLnN0cmluZ2lmeSh1cGRhdGVBY2NvdW50TGlua0lucHV0KX1gLFxuICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTGlua0Vycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBidWlsZCB0aGUgcGFyYW1ldGVycyB0byBwYXNzZWQgaW4sIGluIG9yZGVyIHRvIHVwZGF0ZSB0aGUgYWNjb3VudCBsaW5rIG9iamVjdFxuICAgICAgICBsZXQgcGFyYW1zOiBVcGRhdGVQYXJhbXMgPSB7XG4gICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52LkFDQ09VTlRfTElOS1MhLFxuICAgICAgICAgICAgS2V5OiB7XG4gICAgICAgICAgICAgICAgaWQ6IHVwZGF0ZUFjY291bnRMaW5rSW5wdXQuaWRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiB7fSxcbiAgICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVOYW1lczoge30sXG4gICAgICAgICAgICBVcGRhdGVFeHByZXNzaW9uOiBcIlwiLFxuICAgICAgICAgICAgUmV0dXJuVmFsdWVzOiBcIlVQREFURURfTkVXXCJcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHByZWZpeCA9IFwic2V0IFwiO1xuICAgICAgICBsZXQgYXR0cmlidXRlcyA9IE9iamVjdC5rZXlzKHVwZGF0ZUFjY291bnRMaW5rSW5wdXQpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBhdHRyaWJ1dGUgPSBhdHRyaWJ1dGVzW2ldO1xuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZSAhPT0gXCJpZFwiKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zW1wiVXBkYXRlRXhwcmVzc2lvblwiXSArPSBwcmVmaXggKyBcIiNcIiArIGF0dHJpYnV0ZSArIFwiID0gOlwiICsgYXR0cmlidXRlO1xuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICBwYXJhbXNbXCJFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzXCJdW1wiOlwiICsgYXR0cmlidXRlXSA9IHVwZGF0ZUFjY291bnRMaW5rSW5wdXRbYXR0cmlidXRlXTtcbiAgICAgICAgICAgICAgICBwYXJhbXNbXCJFeHByZXNzaW9uQXR0cmlidXRlTmFtZXNcIl1bXCIjXCIgKyBhdHRyaWJ1dGVdID0gYXR0cmlidXRlO1xuICAgICAgICAgICAgICAgIHByZWZpeCA9IFwiLCBcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgYWNjb3VudCBsaW5rIGJhc2VkIG9uIHRoZSBwYXNzZWQgaW4gb2JqZWN0XG4gICAgICAgIGF3YWl0IGRvY0NsaWVudC51cGRhdGUocGFyYW1zKS5wcm9taXNlKCk7XG5cbiAgICAgICAgLy8gcmV0dXJuIHRoZSB1cGRhdGVkIHJlZmVycmFsIG9iamVjdFxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGF0YTogdXBkYXRlQWNjb3VudExpbmtJbnB1dCBhcyBBY2NvdW50TGlua0RldGFpbHNcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgdXBkYXRlQWNjb3VudExpbmsgbXV0YXRpb24ge31gLCBlcnIpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBgVW5leHBlY3RlZCBlcnJvciB3aGlsZSBleGVjdXRpbmcgY3JlYXRlQWNjb3VudExpbmsgbXV0YXRpb24uICR7ZXJyfWAsXG4gICAgICAgICAgICBlcnJvclR5cGU6IExpbmtFcnJvclR5cGUuVW5leHBlY3RlZEVycm9yXG4gICAgICAgIH07XG4gICAgfVxufVxuIl19