"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMilitaryVerification = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const moonbeam_models_1 = require("@moonbeam/moonbeam-models");
const VAClient_1 = require("../clients/VAClient");
const QuandisClient_1 = require("../clients/QuandisClient");
/**
 * CreateMilitaryVerification resolver
 *
 * @param fieldName name of the resolver path from the AppSync event
 * @param createMilitaryVerificationInput military verification object to be created
 * @returns {@link Promise} of {@link CreateMilitaryVerificationResponse}
 */
const createMilitaryVerification = async (fieldName, createMilitaryVerificationInput) => {
    try {
        /**
         * verify that the appropriate type of input is being passed in:
         *
         * - for now, we only support a military affiliation of FAMILY_SPOUSE
         * or SERVICE_MEMBER.
         *
         * - for the FAMILY_SPOUSE military affiliation type we need to have
         * a personal identifier field passed in AND the military branch and
         * military duty status should be of type NOT_APPLICABLE
         *
         * - for the SERVICE_MEMBER military affiliation type we cannot have a
         * personal identifier field passed in AND we cannot have a military branch
         * and military duty status of type NOT_APPLICABLE
         */
        switch (createMilitaryVerificationInput.militaryAffiliation) {
            case moonbeam_models_1.MilitaryAffiliation.ServiceMember:
            case moonbeam_models_1.MilitaryAffiliation.FamilySpouse:
                if (createMilitaryVerificationInput.militaryAffiliation === moonbeam_models_1.MilitaryAffiliation.ServiceMember &&
                    (
                    // make sure there's a valid status for branch and status, with no personal identifier
                    (createMilitaryVerificationInput.personalIdentifier) ||
                        (createMilitaryVerificationInput.militaryBranch === moonbeam_models_1.MilitaryBranch.NotApplicable || createMilitaryVerificationInput.militaryDutyStatus === moonbeam_models_1.MilitaryDutyStatus.NotApplicable))) {
                    const errorMessage = `Input not valid for ${createMilitaryVerificationInput.militaryAffiliation} military affiliation type!`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: moonbeam_models_1.MilitaryVerificationErrorType.ValidationError
                    };
                }
                else if (createMilitaryVerificationInput.militaryAffiliation === moonbeam_models_1.MilitaryAffiliation.FamilySpouse &&
                    (
                    // make sure there's a valid personal identifier passed in, and a valid branch and duty status
                    (!createMilitaryVerificationInput.personalIdentifier) ||
                        (createMilitaryVerificationInput.militaryBranch !== moonbeam_models_1.MilitaryBranch.NotApplicable || createMilitaryVerificationInput.militaryDutyStatus !== moonbeam_models_1.MilitaryDutyStatus.NotApplicable))) {
                    const errorMessage = `Input not valid for ${createMilitaryVerificationInput.militaryAffiliation} military affiliation type!`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: moonbeam_models_1.MilitaryVerificationErrorType.ValidationError
                    };
                }
                else {
                    // retrieving the current function region
                    const region = process.env.AWS_REGION;
                    // initializing the DynamoDB document client
                    const dynamoDbClient = new client_dynamodb_1.DynamoDBClient({ region: region });
                    // update the timestamps accordingly
                    const createdAt = new Date().toISOString();
                    createMilitaryVerificationInput.createdAt = createMilitaryVerificationInput.createdAt ? createMilitaryVerificationInput.createdAt : createdAt;
                    createMilitaryVerificationInput.updatedAt = createMilitaryVerificationInput.updatedAt ? createMilitaryVerificationInput.updatedAt : createdAt;
                    /**
                     * call the verification Client APIs here, in order to get the appropriate initial verification status for the object.
                     *
                     * start with the Quandis API. If that status is not VERIFIED, then proceed with the VA Lighthouse API call, accordingly.
                     */
                    const quandisClient = new QuandisClient_1.QuandisClient(createMilitaryVerificationInput, process.env.ENV_NAME, region);
                    const quandisVerificationStatus = createMilitaryVerificationInput.militaryAffiliation === moonbeam_models_1.MilitaryAffiliation.ServiceMember
                        ? await quandisClient.verifyServiceMember()
                        : await quandisClient.verifyMemberSpouse();
                    console.log(`Quandis status for ${createMilitaryVerificationInput.militaryAffiliation} - ${quandisVerificationStatus}`);
                    // only call the Lighthouse API, if the status above is not VERIFIED, otherwise there's no reason for another network call.
                    let lighthouseVerificationStatus = moonbeam_models_1.MilitaryVerificationStatusType.Pending;
                    if (quandisVerificationStatus !== moonbeam_models_1.MilitaryVerificationStatusType.Verified) {
                        const lighthouseClient = new VAClient_1.VAClient(createMilitaryVerificationInput, process.env.ENV_NAME, region);
                        // for now, we call the same API whether you are a member or not. We need to check with Lighthouse to see if we need another API call for it or not.
                        lighthouseVerificationStatus = createMilitaryVerificationInput.militaryAffiliation === moonbeam_models_1.MilitaryAffiliation.ServiceMember
                            ? await lighthouseClient.verifyServiceMember()
                            : await lighthouseClient.verifyServiceMember();
                        console.log(`Lighthouse status for ${createMilitaryVerificationInput.militaryAffiliation} - ${lighthouseVerificationStatus}`);
                    }
                    // resolve the resulting status accordingly
                    let verificationStatus;
                    if (lighthouseVerificationStatus === moonbeam_models_1.MilitaryVerificationStatusType.Verified || quandisVerificationStatus === moonbeam_models_1.MilitaryVerificationStatusType.Verified) {
                        verificationStatus = moonbeam_models_1.MilitaryVerificationStatusType.Verified;
                    }
                    else {
                        verificationStatus = moonbeam_models_1.MilitaryVerificationStatusType.Pending;
                    }
                    // store the military verification object
                    await dynamoDbClient.send(new client_dynamodb_1.PutItemCommand({
                        TableName: process.env.MILITARY_VERIFICATION_TABLE,
                        Item: {
                            id: {
                                S: createMilitaryVerificationInput.id
                            },
                            firstName: {
                                S: createMilitaryVerificationInput.firstName
                            },
                            lastName: {
                                S: createMilitaryVerificationInput.lastName
                            },
                            dateOfBirth: {
                                S: createMilitaryVerificationInput.dateOfBirth
                            },
                            enlistmentYear: {
                                S: createMilitaryVerificationInput.enlistmentYear
                            },
                            addressLine: {
                                S: createMilitaryVerificationInput.addressLine
                            },
                            city: {
                                S: createMilitaryVerificationInput.city
                            },
                            state: {
                                S: createMilitaryVerificationInput.state
                            },
                            zipCode: {
                                S: createMilitaryVerificationInput.zipCode
                            },
                            militaryAffiliation: {
                                S: createMilitaryVerificationInput.militaryAffiliation
                            },
                            militaryBranch: {
                                S: createMilitaryVerificationInput.militaryBranch
                            },
                            militaryDutyStatus: {
                                S: createMilitaryVerificationInput.militaryDutyStatus
                            },
                            militaryVerificationStatus: {
                                S: verificationStatus
                            },
                            createdAt: {
                                S: createMilitaryVerificationInput.createdAt
                            },
                            updatedAt: {
                                S: createMilitaryVerificationInput.updatedAt
                            }
                        },
                    }));
                    // return the military verification object
                    return {
                        data: {
                            ...createMilitaryVerificationInput,
                            militaryVerificationStatus: verificationStatus
                        }
                    };
                }
            default:
                const errorMessage = `Military affiliation type ${createMilitaryVerificationInput.militaryAffiliation} not supported`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: moonbeam_models_1.MilitaryVerificationErrorType.ValidationError
                };
        }
    }
    catch (err) {
        const errorMessage = `Unexpected error while executing ${fieldName} mutation ${err}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: moonbeam_models_1.MilitaryVerificationErrorType.UnexpectedError
        };
    }
};
exports.createMilitaryVerification = createMilitaryVerification;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25SZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYW1iZGEvcmVzb2x2ZXJzL0NyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsOERBQXdFO0FBQ3hFLCtEQVNtQztBQUNuQyxrREFBNkM7QUFDN0MsNERBQXVEO0FBRXZEOzs7Ozs7R0FNRztBQUNJLE1BQU0sMEJBQTBCLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsK0JBQWdFLEVBQStDLEVBQUU7SUFDakwsSUFBSTtRQUNBOzs7Ozs7Ozs7Ozs7O1dBYUc7UUFDSCxRQUFRLCtCQUErQixDQUFDLG1CQUFtQixFQUFFO1lBQ3pELEtBQUsscUNBQW1CLENBQUMsYUFBYSxDQUFDO1lBQ3ZDLEtBQUsscUNBQW1CLENBQUMsWUFBWTtnQkFDakMsSUFBSSwrQkFBK0IsQ0FBQyxtQkFBbUIsS0FBSyxxQ0FBbUIsQ0FBQyxhQUFhO29CQUN6RjtvQkFDSSxzRkFBc0Y7b0JBQ3RGLENBQUMsK0JBQStCLENBQUMsa0JBQWtCLENBQUM7d0JBQ3BELENBQUMsK0JBQStCLENBQUMsY0FBYyxLQUFLLGdDQUFjLENBQUMsYUFBYSxJQUFJLCtCQUErQixDQUFDLGtCQUFrQixLQUFLLG9DQUFrQixDQUFDLGFBQWEsQ0FBQyxDQUMvSyxFQUNIO29CQUNFLE1BQU0sWUFBWSxHQUFHLHVCQUF1QiwrQkFBK0IsQ0FBQyxtQkFBbUIsNkJBQTZCLENBQUM7b0JBQzdILE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQzFCLE9BQU87d0JBQ0gsWUFBWSxFQUFFLFlBQVk7d0JBQzFCLFNBQVMsRUFBRSwrQ0FBNkIsQ0FBQyxlQUFlO3FCQUMzRCxDQUFBO2lCQUNKO3FCQUFNLElBQUksK0JBQStCLENBQUMsbUJBQW1CLEtBQUsscUNBQW1CLENBQUMsWUFBWTtv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LEVBQUUsK0JBQStCLENBQUMsU0FBUzs2QkFDL0M7NEJBQ0QsU0FBUyxFQUFFO2dDQUNQLENBQUMsRUFBRSwrQkFBK0IsQ0FBQyxTQUFTOzZCQUMvQzt5QkFDSjtxQkFDSixDQUFDLENBQUMsQ0FBQztvQkFFSiwwQ0FBMEM7b0JBQzFDLE9BQU87d0JBQ0gsSUFBSSxFQUFFOzRCQUNGLEdBQUcsK0JBQStCOzRCQUNsQywwQkFBMEIsRUFBRSxrQkFBa0I7eUJBQ2Q7cUJBQ3ZDLENBQUE7aUJBQ0o7WUFDTDtnQkFDSSxNQUFNLFlBQVksR0FBRyw2QkFBNkIsK0JBQStCLENBQUMsbUJBQW1CLGdCQUFnQixDQUFDO2dCQUN0SCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUMxQixPQUFPO29CQUNILFlBQVksRUFBRSxZQUFZO29CQUMxQixTQUFTLEVBQUUsK0NBQTZCLENBQUMsZUFBZTtpQkFDM0QsQ0FBQTtTQUNSO0tBQ0o7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sWUFBWSxHQUFHLG9DQUFvQyxTQUFTLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDckYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQixPQUFPO1lBQ0gsWUFBWSxFQUFFLFlBQVk7WUFDMUIsU0FBUyxFQUFFLCtDQUE2QixDQUFDLGVBQWU7U0FDM0QsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBbktZLFFBQUEsMEJBQTBCLDhCQW1LdEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0R5bmFtb0RCQ2xpZW50LCBQdXRJdGVtQ29tbWFuZH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiO1xuaW1wb3J0IHtcbiAgICBDcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LFxuICAgIENyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVzcG9uc2UsXG4gICAgTWlsaXRhcnlBZmZpbGlhdGlvbixcbiAgICBNaWxpdGFyeUJyYW5jaCxcbiAgICBNaWxpdGFyeUR1dHlTdGF0dXMsXG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25FcnJvclR5cGUsXG4gICAgTWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbixcbiAgICBNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1R5cGUsXG59IGZyb20gXCJAbW9vbmJlYW0vbW9vbmJlYW0tbW9kZWxzXCI7XG5pbXBvcnQge1ZBQ2xpZW50fSBmcm9tIFwiLi4vY2xpZW50cy9WQUNsaWVudFwiO1xuaW1wb3J0IHtRdWFuZGlzQ2xpZW50fSBmcm9tIFwiLi4vY2xpZW50cy9RdWFuZGlzQ2xpZW50XCI7XG5cbi8qKlxuICogQ3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb24gcmVzb2x2ZXJcbiAqXG4gKiBAcGFyYW0gZmllbGROYW1lIG5hbWUgb2YgdGhlIHJlc29sdmVyIHBhdGggZnJvbSB0aGUgQXBwU3luYyBldmVudFxuICogQHBhcmFtIGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIG9iamVjdCB0byBiZSBjcmVhdGVkXG4gKiBAcmV0dXJucyB7QGxpbmsgUHJvbWlzZX0gb2Yge0BsaW5rIENyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uUmVzcG9uc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbiA9IGFzeW5jIChmaWVsZE5hbWU6IHN0cmluZywgY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dDogQ3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCk6IFByb21pc2U8Q3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25SZXNwb25zZT4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiB2ZXJpZnkgdGhhdCB0aGUgYXBwcm9wcmlhdGUgdHlwZSBvZiBpbnB1dCBpcyBiZWluZyBwYXNzZWQgaW46XG4gICAgICAgICAqXG4gICAgICAgICAqIC0gZm9yIG5vdywgd2Ugb25seSBzdXBwb3J0IGEgbWlsaXRhcnkgYWZmaWxpYXRpb24gb2YgRkFNSUxZX1NQT1VTRVxuICAgICAgICAgKiBvciBTRVJWSUNFX01FTUJFUi5cbiAgICAgICAgICpcbiAgICAgICAgICogLSBmb3IgdGhlIEZBTUlMWV9TUE9VU0UgbWlsaXRhcnkgYWZmaWxpYXRpb24gdHlwZSB3ZSBuZWVkIHRvIGhhdmVcbiAgICAgICAgICogYSBwZXJzb25hbCBpZGVudGlmaWVyIGZpZWxkIHBhc3NlZCBpbiBBTkQgdGhlIG1pbGl0YXJ5IGJyYW5jaCBhbmRcbiAgICAgICAgICogbWlsaXRhcnkgZHV0eSBzdGF0dXMgc2hvdWxkIGJlIG9mIHR5cGUgTk9UX0FQUExJQ0FCTEVcbiAgICAgICAgICpcbiAgICAgICAgICogLSBmb3IgdGhlIFNFUlZJQ0VfTUVNQkVSIG1pbGl0YXJ5IGFmZmlsaWF0aW9uIHR5cGUgd2UgY2Fubm90IGhhdmUgYVxuICAgICAgICAgKiBwZXJzb25hbCBpZGVudGlmaWVyIGZpZWxkIHBhc3NlZCBpbiBBTkQgd2UgY2Fubm90IGhhdmUgYSBtaWxpdGFyeSBicmFuY2hcbiAgICAgICAgICogYW5kIG1pbGl0YXJ5IGR1dHkgc3RhdHVzIG9mIHR5cGUgTk9UX0FQUExJQ0FCTEVcbiAgICAgICAgICovXG4gICAgICAgIHN3aXRjaCAoY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5taWxpdGFyeUFmZmlsaWF0aW9uKSB7XG4gICAgICAgICAgICBjYXNlIE1pbGl0YXJ5QWZmaWxpYXRpb24uU2VydmljZU1lbWJlcjpcbiAgICAgICAgICAgIGNhc2UgTWlsaXRhcnlBZmZpbGlhdGlvbi5GYW1pbHlTcG91c2U6XG4gICAgICAgICAgICAgICAgaWYgKGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQubWlsaXRhcnlBZmZpbGlhdGlvbiA9PT0gTWlsaXRhcnlBZmZpbGlhdGlvbi5TZXJ2aWNlTWVtYmVyICYmXG4gICAgICAgICAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGVyZSdzIGEgdmFsaWQgc3RhdHVzIGZvciBicmFuY2ggYW5kIHN0YXR1cywgd2l0aCBubyBwZXJzb25hbCBpZGVudGlmaWVyXG4gICAgICAgICAgICAgICAgICAgICAgICAoY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5wZXJzb25hbElkZW50aWZpZXIpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAoY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5taWxpdGFyeUJyYW5jaCA9PT0gTWlsaXRhcnlCcmFuY2guTm90QXBwbGljYWJsZSB8fCBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0Lm1pbGl0YXJ5RHV0eVN0YXR1cyA9PT0gTWlsaXRhcnlEdXR5U3RhdHVzLk5vdEFwcGxpY2FibGUpXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYElucHV0IG5vdCB2YWxpZCBmb3IgJHtjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0Lm1pbGl0YXJ5QWZmaWxpYXRpb259IG1pbGl0YXJ5IGFmZmlsaWF0aW9uIHR5cGUhYDtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JUeXBlOiBNaWxpdGFyeVZlcmlmaWNhdGlvbkVycm9yVHlwZS5WYWxpZGF0aW9uRXJyb3JcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5taWxpdGFyeUFmZmlsaWF0aW9uID09PSBNaWxpdGFyeUFmZmlsaWF0aW9uLkZhbWlseVNwb3VzZSAmJlxuICAgICAgICAgICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBtYWtlIHN1cmUgdGhlcmUncyBhIHZhbGlkIHBlcnNvbmFsIGlkZW50aWZpZXIgcGFzc2VkIGluLCBhbmQgYSB2YWxpZCBicmFuY2ggYW5kIGR1dHkgc3RhdHVzXG4gICAgICAgICAgICAgICAgICAgICAgICAoIWNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQucGVyc29uYWxJZGVudGlmaWVyKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgKGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQubWlsaXRhcnlCcmFuY2ggIT09IE1pbGl0YXJ5QnJhbmNoLk5vdEFwcGxpY2FibGUgfHwgY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5taWxpdGFyeUR1dHlTdGF0dXMgIT09IE1pbGl0YXJ5RHV0eVN0YXR1cy5Ob3RBcHBsaWNhYmxlKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBJbnB1dCBub3QgdmFsaWQgZm9yICR7Y3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5taWxpdGFyeUFmZmlsaWF0aW9ufSBtaWxpdGFyeSBhZmZpbGlhdGlvbiB0eXBlIWA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTWlsaXRhcnlWZXJpZmljYXRpb25FcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyByZXRyaWV2aW5nIHRoZSBjdXJyZW50IGZ1bmN0aW9uIHJlZ2lvblxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OITtcblxuICAgICAgICAgICAgICAgICAgICAvLyBpbml0aWFsaXppbmcgdGhlIER5bmFtb0RCIGRvY3VtZW50IGNsaWVudFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkeW5hbW9EYkNsaWVudCA9IG5ldyBEeW5hbW9EQkNsaWVudCh7cmVnaW9uOiByZWdpb259KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyB1cGRhdGUgdGhlIHRpbWVzdGFtcHMgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY3JlYXRlZEF0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LmNyZWF0ZWRBdCA9IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQuY3JlYXRlZEF0ID8gY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5jcmVhdGVkQXQgOiBjcmVhdGVkQXQ7XG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQudXBkYXRlZEF0ID0gY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC51cGRhdGVkQXQgPyBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LnVwZGF0ZWRBdCA6IGNyZWF0ZWRBdDtcblxuICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICogY2FsbCB0aGUgdmVyaWZpY2F0aW9uIENsaWVudCBBUElzIGhlcmUsIGluIG9yZGVyIHRvIGdldCB0aGUgYXBwcm9wcmlhdGUgaW5pdGlhbCB2ZXJpZmljYXRpb24gc3RhdHVzIGZvciB0aGUgb2JqZWN0LlxuICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgKiBzdGFydCB3aXRoIHRoZSBRdWFuZGlzIEFQSS4gSWYgdGhhdCBzdGF0dXMgaXMgbm90IFZFUklGSUVELCB0aGVuIHByb2NlZWQgd2l0aCB0aGUgVkEgTGlnaHRob3VzZSBBUEkgY2FsbCwgYWNjb3JkaW5nbHkuXG4gICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBxdWFuZGlzQ2xpZW50ID0gbmV3IFF1YW5kaXNDbGllbnQoY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCBhcyBNaWxpdGFyeVZlcmlmaWNhdGlvbkluZm9ybWF0aW9uICYgeyBwZXJzb25hbElkZW50aWZpZXI6IHN0cmluZyB8IHVuZGVmaW5lZCB9LCBwcm9jZXNzLmVudi5FTlZfTkFNRSEsIHJlZ2lvbik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHF1YW5kaXNWZXJpZmljYXRpb25TdGF0dXMgPSBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0Lm1pbGl0YXJ5QWZmaWxpYXRpb24gPT09IE1pbGl0YXJ5QWZmaWxpYXRpb24uU2VydmljZU1lbWJlclxuICAgICAgICAgICAgICAgICAgICAgICAgPyBhd2FpdCBxdWFuZGlzQ2xpZW50LnZlcmlmeVNlcnZpY2VNZW1iZXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBhd2FpdCBxdWFuZGlzQ2xpZW50LnZlcmlmeU1lbWJlclNwb3VzZSgpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgUXVhbmRpcyBzdGF0dXMgZm9yICR7Y3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5taWxpdGFyeUFmZmlsaWF0aW9ufSAtICR7cXVhbmRpc1ZlcmlmaWNhdGlvblN0YXR1c31gKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBvbmx5IGNhbGwgdGhlIExpZ2h0aG91c2UgQVBJLCBpZiB0aGUgc3RhdHVzIGFib3ZlIGlzIG5vdCBWRVJJRklFRCwgb3RoZXJ3aXNlIHRoZXJlJ3Mgbm8gcmVhc29uIGZvciBhbm90aGVyIG5ldHdvcmsgY2FsbC5cbiAgICAgICAgICAgICAgICAgICAgbGV0IGxpZ2h0aG91c2VWZXJpZmljYXRpb25TdGF0dXM6IE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZSA9IE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5QZW5kaW5nO1xuICAgICAgICAgICAgICAgICAgICBpZiAocXVhbmRpc1ZlcmlmaWNhdGlvblN0YXR1cyAhPT0gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlZlcmlmaWVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsaWdodGhvdXNlQ2xpZW50ID0gbmV3IFZBQ2xpZW50KGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQgYXMgTWlsaXRhcnlWZXJpZmljYXRpb25JbmZvcm1hdGlvbiAmIHsgcGVyc29uYWxJZGVudGlmaWVyOiBzdHJpbmcgfCB1bmRlZmluZWQgfSwgcHJvY2Vzcy5lbnYuRU5WX05BTUUhLCByZWdpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZm9yIG5vdywgd2UgY2FsbCB0aGUgc2FtZSBBUEkgd2hldGhlciB5b3UgYXJlIGEgbWVtYmVyIG9yIG5vdC4gV2UgbmVlZCB0byBjaGVjayB3aXRoIExpZ2h0aG91c2UgdG8gc2VlIGlmIHdlIG5lZWQgYW5vdGhlciBBUEkgY2FsbCBmb3IgaXQgb3Igbm90LlxuICAgICAgICAgICAgICAgICAgICAgICAgbGlnaHRob3VzZVZlcmlmaWNhdGlvblN0YXR1cyA9IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQubWlsaXRhcnlBZmZpbGlhdGlvbiA9PT0gTWlsaXRhcnlBZmZpbGlhdGlvbi5TZXJ2aWNlTWVtYmVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBhd2FpdCBsaWdodGhvdXNlQ2xpZW50LnZlcmlmeVNlcnZpY2VNZW1iZXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogYXdhaXQgbGlnaHRob3VzZUNsaWVudC52ZXJpZnlTZXJ2aWNlTWVtYmVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgTGlnaHRob3VzZSBzdGF0dXMgZm9yICR7Y3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5taWxpdGFyeUFmZmlsaWF0aW9ufSAtICR7bGlnaHRob3VzZVZlcmlmaWNhdGlvblN0YXR1c31gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlc29sdmUgdGhlIHJlc3VsdGluZyBzdGF0dXMgYWNjb3JkaW5nbHlcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZlcmlmaWNhdGlvblN0YXR1czogTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlO1xuICAgICAgICAgICAgICAgICAgICBpZiAobGlnaHRob3VzZVZlcmlmaWNhdGlvblN0YXR1cyA9PT0gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlZlcmlmaWVkIHx8IHF1YW5kaXNWZXJpZmljYXRpb25TdGF0dXMgPT09IE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzVHlwZS5WZXJpZmllZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmVyaWZpY2F0aW9uU3RhdHVzID0gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlZlcmlmaWVkO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmVyaWZpY2F0aW9uU3RhdHVzID0gTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXNUeXBlLlBlbmRpbmc7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBzdG9yZSB0aGUgbWlsaXRhcnkgdmVyaWZpY2F0aW9uIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBkeW5hbW9EYkNsaWVudC5zZW5kKG5ldyBQdXRJdGVtQ29tbWFuZCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBUYWJsZU5hbWU6IHByb2Nlc3MuZW52Lk1JTElUQVJZX1ZFUklGSUNBVElPTl9UQUJMRSEsXG4gICAgICAgICAgICAgICAgICAgICAgICBJdGVtOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3ROYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQuZmlyc3ROYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0TmFtZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0Lmxhc3ROYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRlT2ZCaXJ0aDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LmRhdGVPZkJpcnRoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmxpc3RtZW50WWVhcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LmVubGlzdG1lbnRZZWFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRyZXNzTGluZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LmFkZHJlc3NMaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaXR5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQuY2l0eVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5zdGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgemlwQ29kZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0LnppcENvZGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbGl0YXJ5QWZmaWxpYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5taWxpdGFyeUFmZmlsaWF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaWxpdGFyeUJyYW5jaDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTOiBjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0Lm1pbGl0YXJ5QnJhbmNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaWxpdGFyeUR1dHlTdGF0dXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC5taWxpdGFyeUR1dHlTdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IHZlcmlmaWNhdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFM6IGNyZWF0ZU1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5wdXQuY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUzogY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dC51cGRhdGVkQXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBtaWxpdGFyeSB2ZXJpZmljYXRpb24gb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uY3JlYXRlTWlsaXRhcnlWZXJpZmljYXRpb25JbnB1dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1czogdmVyaWZpY2F0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGFzIE1pbGl0YXJ5VmVyaWZpY2F0aW9uSW5mb3JtYXRpb25cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE1pbGl0YXJ5IGFmZmlsaWF0aW9uIHR5cGUgJHtjcmVhdGVNaWxpdGFyeVZlcmlmaWNhdGlvbklucHV0Lm1pbGl0YXJ5QWZmaWxpYXRpb259IG5vdCBzdXBwb3J0ZWRgO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVHlwZTogTWlsaXRhcnlWZXJpZmljYXRpb25FcnJvclR5cGUuVmFsaWRhdGlvbkVycm9yXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGV4ZWN1dGluZyAke2ZpZWxkTmFtZX0gbXV0YXRpb24gJHtlcnJ9YDtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZTogZXJyb3JNZXNzYWdlLFxuICAgICAgICAgICAgZXJyb3JUeXBlOiBNaWxpdGFyeVZlcmlmaWNhdGlvbkVycm9yVHlwZS5VbmV4cGVjdGVkRXJyb3JcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==