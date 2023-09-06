"use strict";
// This is a file used to define the all GraphQL subscription constants
Object.defineProperty(exports, "__esModule", { value: true });
exports.createdTransaction = exports.updatedMilitaryVerificationStatus = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3Vic2NyaXB0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ncmFwaHFsL3N1YnNjcmlwdGlvbnMvU3Vic2NyaXB0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsdUVBQXVFOzs7QUFFdkUsdUZBQXVGO0FBQzFFLFFBQUEsaUNBQWlDLEdBQWlCOzs7Ozs7Ozs7Q0FTOUQsQ0FBQztBQUVGLHFGQUFxRjtBQUN4RSxRQUFBLGtCQUFrQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FnQy9DLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGlzIGlzIGEgZmlsZSB1c2VkIHRvIGRlZmluZSB0aGUgYWxsIEdyYXBoUUwgc3Vic2NyaXB0aW9uIGNvbnN0YW50c1xuXG4vLyBTdWJzY3JpcHRpb24gdXNlZCB0byBzdWJzY3JpYmUgdG8gYSBtaWxpdGFyeSBzdGF0dXMgdXBkYXRlIGZvciBhIHBhcnRpY3VsYXIgdXNlciBpZC5cbmV4cG9ydCBjb25zdCB1cGRhdGVkTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMgPSAvKiBHcmFwaFFMICovIGBcbiAgICBzdWJzY3JpcHRpb24gVXBkYXRlZE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzKCRpZDogSUQhKSB7XG4gICAgICAgIHVwZGF0ZWRNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cyhpZDogJGlkKSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgaWRcbiAgICAgICAgICAgIG1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzXG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBTdWJzY3JpcHRpb24gdXNlZCB0byBzdWJzY3JpYmUgdG8gYSB0cmFuc2FjdGlvbiBjcmVhdGlvbiBmb3IgYSBwYXJ0aWN1bGFyIHVzZXIgaWQuXG5leHBvcnQgY29uc3QgY3JlYXRlZFRyYW5zYWN0aW9uID0gLyogR3JhcGhRTCAqLyBgXG4gICAgc3Vic2NyaXB0aW9uIENyZWF0ZWRUcmFuc2FjdGlvbigkaWQ6IElEISkge1xuICAgICAgICBjcmVhdGVkVHJhbnNhY3Rpb24oaWQ6ICRpZCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGlkXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSWRcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uVHlwZVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIG1lbWJlcklkXG4gICAgICAgICAgICAgICAgY2FyZElkXG4gICAgICAgICAgICAgICAgYnJhbmRJZFxuICAgICAgICAgICAgICAgIHN0b3JlSWRcbiAgICAgICAgICAgICAgICBjYXRlZ29yeVxuICAgICAgICAgICAgICAgIGN1cnJlbmN5Q29kZVxuICAgICAgICAgICAgICAgIHJld2FyZEFtb3VudFxuICAgICAgICAgICAgICAgIHRvdGFsQW1vdW50XG4gICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrQW1vdW50XG4gICAgICAgICAgICAgICAgY3JlZGl0ZWRDYXNoYmFja0Ftb3VudFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmROYW1lXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZEFkZHJlc3NcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kTG9nb1VybFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmRVUkxBZGRyZXNzXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25Jc09ubGluZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcbiJdfQ==