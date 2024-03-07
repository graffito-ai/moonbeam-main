"use strict";
// This is a file used to define the all GraphQL subscription constants
Object.defineProperty(exports, "__esModule", { value: true });
exports.createdTransaction = exports.updatedTransaction = exports.updatedMilitaryVerificationStatus = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3Vic2NyaXB0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ncmFwaHFsL3N1YnNjcmlwdGlvbnMvU3Vic2NyaXB0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsdUVBQXVFOzs7QUFFdkUsdUZBQXVGO0FBQzFFLFFBQUEsaUNBQWlDLEdBQWlCOzs7Ozs7Ozs7Q0FTOUQsQ0FBQztBQUVGLHNGQUFzRjtBQUN6RSxRQUFBLGtCQUFrQixHQUFpQjs7Ozs7Ozs7Ozs7Ozs7O0NBZS9DLENBQUM7QUFFRixxRkFBcUY7QUFDeEUsUUFBQSxrQkFBa0IsR0FBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBZ0MvQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhpcyBpcyBhIGZpbGUgdXNlZCB0byBkZWZpbmUgdGhlIGFsbCBHcmFwaFFMIHN1YnNjcmlwdGlvbiBjb25zdGFudHNcblxuLy8gU3Vic2NyaXB0aW9uIHVzZWQgdG8gc3Vic2NyaWJlIHRvIGEgbWlsaXRhcnkgc3RhdHVzIHVwZGF0ZSBmb3IgYSBwYXJ0aWN1bGFyIHVzZXIgaWQuXG5leHBvcnQgY29uc3QgdXBkYXRlZE1pbGl0YXJ5VmVyaWZpY2F0aW9uU3RhdHVzID0gLyogR3JhcGhRTCAqLyBgXG4gICAgc3Vic2NyaXB0aW9uIFVwZGF0ZWRNaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1cygkaWQ6IElEISkge1xuICAgICAgICB1cGRhdGVkTWlsaXRhcnlWZXJpZmljYXRpb25TdGF0dXMoaWQ6ICRpZCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGlkXG4gICAgICAgICAgICBtaWxpdGFyeVZlcmlmaWNhdGlvblN0YXR1c1xuICAgICAgICB9XG4gICAgfVxuYDtcblxuLy8gU3Vic2NyaXB0aW9uIHVzZWQgdG8gc3Vic2NyaWJlIHRvIGFueSB0cmFuc2FjdGlvbiB1cGRhdGVzIGZvciBhIHBhcnRpY3VsYXIgdXNlciBpZC5cbmV4cG9ydCBjb25zdCB1cGRhdGVkVHJhbnNhY3Rpb24gPSAvKiBHcmFwaFFMICovIGBcbiAgICBzdWJzY3JpcHRpb24gVXBkYXRlZFRyYW5zYWN0aW9uKCRpZDogSUQhKSB7XG4gICAgICAgIHVwZGF0ZWRUcmFuc2FjdGlvbihpZDogJGlkKSB7XG4gICAgICAgICAgICBlcnJvclR5cGVcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgaWRcbiAgICAgICAgICAgIGRhdGEge1xuICAgICAgICAgICAgICAgIGlkXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25JZFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uU3RhdHVzXG4gICAgICAgICAgICAgICAgdXBkYXRlZEF0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG4vLyBTdWJzY3JpcHRpb24gdXNlZCB0byBzdWJzY3JpYmUgdG8gYSB0cmFuc2FjdGlvbiBjcmVhdGlvbiBmb3IgYSBwYXJ0aWN1bGFyIHVzZXIgaWQuXG5leHBvcnQgY29uc3QgY3JlYXRlZFRyYW5zYWN0aW9uID0gLyogR3JhcGhRTCAqLyBgXG4gICAgc3Vic2NyaXB0aW9uIENyZWF0ZWRUcmFuc2FjdGlvbigkaWQ6IElEISkge1xuICAgICAgICBjcmVhdGVkVHJhbnNhY3Rpb24oaWQ6ICRpZCkge1xuICAgICAgICAgICAgZXJyb3JUeXBlXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgIGlkXG4gICAgICAgICAgICBkYXRhIHtcbiAgICAgICAgICAgICAgICBpZFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uSWRcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvblN0YXR1c1xuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uVHlwZVxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdFxuICAgICAgICAgICAgICAgIHVwZGF0ZWRBdFxuICAgICAgICAgICAgICAgIG1lbWJlcklkXG4gICAgICAgICAgICAgICAgY2FyZElkXG4gICAgICAgICAgICAgICAgYnJhbmRJZFxuICAgICAgICAgICAgICAgIHN0b3JlSWRcbiAgICAgICAgICAgICAgICBjYXRlZ29yeVxuICAgICAgICAgICAgICAgIGN1cnJlbmN5Q29kZVxuICAgICAgICAgICAgICAgIHJld2FyZEFtb3VudFxuICAgICAgICAgICAgICAgIHRvdGFsQW1vdW50XG4gICAgICAgICAgICAgICAgcGVuZGluZ0Nhc2hiYWNrQW1vdW50XG4gICAgICAgICAgICAgICAgY3JlZGl0ZWRDYXNoYmFja0Ftb3VudFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmROYW1lXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25CcmFuZEFkZHJlc3NcbiAgICAgICAgICAgICAgICB0cmFuc2FjdGlvbkJyYW5kTG9nb1VybFxuICAgICAgICAgICAgICAgIHRyYW5zYWN0aW9uQnJhbmRVUkxBZGRyZXNzXG4gICAgICAgICAgICAgICAgdHJhbnNhY3Rpb25Jc09ubGluZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuYDtcbiJdfQ==