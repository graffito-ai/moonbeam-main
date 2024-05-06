"use strict";
// This is a file used to define the all GraphQL subscription constants
Object.defineProperty(exports, "__esModule", { value: true });
exports.createdTransaction = exports.updatedTransaction = exports.updatedMilitaryVerificationStatus = exports.updatedPlaidLinkingSession = void 0;
// Subscription used to subscribe to a Plaid Linking session update for a particular user it, timestamp and link token.
exports.updatedPlaidLinkingSession = `
    subscription UpdatedPlaidLinkingSession($id: ID!, $link_token: String!, $timestamp: AWSTimestamp!) {
        updatedPlaidLinkingSession(id: $id, link_token: $link_token, timestamp: $timestamp) {
            errorType
            errorMessage
            id
            link_token
            timestamp
            data {
                id
                createdAt
                updatedAt
                expiration
                hosted_link_url
                link_token
                request_id
                session_id
                status
            }
        }
    }
`;
// Subscription used to subscribe to a military status update for a particular user id.
exports.updatedMilitaryVerificationStatus = `
    subscription UpdatedMilitaryVerificationStatus($id: ID!) {
        updatedMilitaryVerificationStatus(id: $id) {
            errorType
            errorMessage
            id
            militaryVerificationStatus
        }
    }
`;
// Subscription used to subscribe to any transaction updates for a particular user id.
exports.updatedTransaction = `
    subscription UpdatedTransaction($id: ID!) {
        updatedTransaction(id: $id) {
            errorType
            errorMessage
            id
            data {
                id
                timestamp
                transactionId
                transactionStatus
                updatedAt
            }
        }
    }
`;
// Subscription used to subscribe to a transaction creation for a particular user id.
exports.createdTransaction = `
    subscription CreatedTransaction($id: ID!) {
        createdTransaction(id: $id) {
            errorType
            errorMessage
            id
            data {
                id
                timestamp
                transactionId
                transactionStatus
                transactionType
                createdAt
                updatedAt
                memberId
                cardId
                brandId
                storeId
                category
                currencyCode
                rewardAmount
                totalAmount
                pendingCashbackAmount
                creditedCashbackAmount
                transactionBrandName
                transactionBrandAddress
                transactionBrandLogoUrl
                transactionBrandURLAddress
                transactionIsOnline
            }
        }
    }
`;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3Vic2NyaXB0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ncmFwaHFsL3N1YnNjcmlwdGlvbnMvU3Vic2NyaXB0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsdUVBQXVFOzs7QUFFdkUsdUhBQXVIO0FBQzFHLFFBQUEsMEJBQTBCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FxQnZELENBQUM7QUFFRix1RkFBdUY7QUFDMUUsUUFBQSxpQ0FBaUMsR0FBaUI7Ozs7Ozs7OztDQVM5RCxDQUFDO0FBRUYsc0ZBQXNGO0FBQ3pFLFFBQUEsa0JBQWtCLEdBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Q0FlL0MsQ0FBQztBQUVGLHFGQUFxRjtBQUN4RSxRQUFBLGtCQUFrQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FnQy9DLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGlzIGlzIGEgZmlsZSB1c2VkIHRvIGRlZmluZSB0aGUgYWxsIEdyYXBoUUwgc3Vic2NyaXB0aW9uIGNvbnN0YW50c1xuXG4vLyBTdWJzY3JpcHRpb24gdXNlZCB0byBzdWJzY3JpYmUgdG8gYSBQbGFpZCBMaW5raW5nIHNlc3Npb24gdXBkYXRlIGZvciBhIHBhcnRpY3VsYXIgdXNlciBpdCwgdGltZXN0YW1wIGFuZCBsaW5rIHRva2VuLlxuZXhwb3J0IGNvbnN0IHVwZGF0ZWRQbGFpZExpbmtpbmdTZXNzaW9uID0gLyogR3JhcGhRTCAqLyBgXG4gICAgc3Vic2NyaXB0aW9uIFVwZGF0ZWRQbGFpZExpbmtpbmdTZXNzaW9uKCRpZDogSUQhLCAkbGlua190b2tlbjogU3RyaW5nISwgJHRpbWVzdGFtcDogQVdTVGltZXN0YW1wISkge1xuICAgICAgICB1cGRhdGVkUGxhaWRMaW5raW5nU2Vzc2lvbihpZDogJGlkLCBsaW5rX3Rva2VuOiAkbGlua190b2tlbiwgdGltZXN0YW1wOiAkdGltZXN0YW1wKSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgaWRcbiAgICAgICAgICAgIGxpbmtfdG9rZW5cbiAgICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXRcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgICAgICBleHBpcmF0aW9uXG4gICAgICAgICAgICAgICAgaG9zdGVkX2xpbmtfdXJsXG4gICAgICAgICAgICAgICAgbGlua190b2tlblxuICAgICAgICAgICAgICAgIHJlcXVlc3RfaWRcbiAgICAgICAgICAgICAgICBzZXNzaW9uX2lkXG4gICAgICAgICAgICAgICAgc3RhdHVzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBTdWJzY3JpcHRpb24gdXNlZCB0byBzdWJzY3JpYmUgdG8gYSBtaWxpdGFyeSBzdGF0dXMgdXBkYXRlIGZvciBhIHBhcnRpY3VsYXIgdXNlciBpZC5cbmV4cG9ydCBjb25zdCB1cGRhdGVkTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBzdWJzY3JpcHRpb24gVXBkYXRlZE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzKCRpZDogSUQhKSB7XG4gICAgICAgIHVwZGF0ZWRNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cyhpZDogJGlkKSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgaWRcbiAgICAgICAgICAgIG1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzXG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBTdWJzY3JpcHRpb24gdXNlZCB0byBzdWJzY3JpYmUgdG8gYW55IHRyYW5zYWN0aW9uIHVwZGF0ZXMgZm9yIGEgcGFydGljdWxhciB1c2VyIGlkLlxuZXhwb3J0IGNvbnN0IHVwZGF0ZWRUcmFuc2FjdGlvbiA9IC8qIEdyYXBoUUwgKi8gYFxuICAgIHN1YnNjcmlwdGlvbiBVcGRhdGVkVHJhbnNhY3Rpb24oJGlkOiBJRCEpIHtcbiAgICAgICAgdXBkYXRlZFRyYW5zYWN0aW9uKGlkOiAkaWQpIHtcbiAgICAgICAgICAgIGVycm9yVHlwZVxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICBpZFxuICAgICAgICAgICAgZGF0YSB7XG4gICAgICAgICAgICAgICAgaWRcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXBcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklkXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25TdGF0dXNcbiAgICAgICAgICAgICAgICB1cGRhdGVkQXRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbi8vIFN1YnNjcmlwdGlvbiB1c2VkIHRvIHN1YnNjcmliZSB0byBhIHRyYW5zYWN0aW9uIGNyZWF0aW9uIGZvciBhIHBhcnRpY3VsYXIgdXNlciBpZC5cbmV4cG9ydCBjb25zdCBjcmVhdGVkVHJhbnNhY3Rpb24gPSAvKiBHcmFwaFFMICovIGBcbiAgICBzdWJzY3JpcHRpb24gQ3JlYXRlZFRyYW5zYWN0aW9uKCRpZDogSUQhKSB7XG4gICAgICAgIGNyZWF0ZWRUcmFuc2FjdGlvbihpZDogJGlkKSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgaWRcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25JZFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25UeXBlXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0XG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICAgICAgbWVtYmVySWRcbiAgICAgICAgICAgICAgICBjYXJkSWRcbiAgICAgICAgICAgICAgICBicmFuZElkXG4gICAgICAgICAgICAgICAgc3RvcmVJZFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5XG4gICAgICAgICAgICAgICAgY3VycmVuY3lDb2RlXG4gICAgICAgICAgICAgICAgcmV3YXJkQW1vdW50XG4gICAgICAgICAgICAgICAgdG90YWxBbW91bnRcbiAgICAgICAgICAgICAgICBwZW5kaW5nQ2FzaGJhY2tBbW91bnRcbiAgICAgICAgICAgICAgICBjcmVkaXRlZENhc2hiYWNrQW1vdW50XG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZE5hbWVcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kQWRkcmVzc1xuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmRMb2dvVXJsXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZFVSTEFkZHJlc3NcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbklzT25saW5lXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuIl19