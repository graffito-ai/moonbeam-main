// This is a file used to define the all GraphQL query constants

// Mutation used to create a new reimbursement.
export const createReimbursement = /* GraphQL */ `
    mutation CreateReimbursement($createReimbursementInput: CreateReimbursementInput!) {
        createReimbursement(createReimbursementInput: $createReimbursementInput) {
            errorType
            errorMessage
            id
            data {
                id
                timestamp
                reimbursementId
                clientId
                paymentGatewayId
                succeeded
                processingMessage
                cardId
                reimbursementStatus
                pendingCashbackAmount
                creditedCashbackAmount
                currencyCode
                transactions {
                    id
                    timestamp
                    transactionId
                    transactionStatus
                }
                createdAt
                updatedAt
            }
        }
    }
`;

// Mutation used to create a reimbursement's details.
export const updateReimbursement = /* GraphQL */ `
    mutation UpdateReimbursement($updateReimbursementInput: UpdateReimbursementInput!) {
        updateReimbursement(updateReimbursementInput: $updateReimbursementInput) {
            errorType
            errorMessage
            id
            data {
                id
                timestamp
                reimbursementId
                clientId
                paymentGatewayId
                succeeded
                processingMessage
                cardId
                reimbursementStatus
                pendingCashbackAmount
                creditedCashbackAmount
                currencyCode
                transactions {
                    id
                    timestamp
                    transactionId
                    transactionStatus
                }
                createdAt
                updatedAt
            }
        }
    }
`;

// Mutation used to create a new transaction, based on an incoming transaction message/event.
export const createTransaction = /* GraphQL */ `
    mutation CreateTransaction($createTransactionInput: CreateTransactionInput!) {
        createTransaction(createTransactionInput: $createTransactionInput) {
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

// Mutation used to update a transaction's details.
export const updateTransaction = /* GraphQL */ `
    mutation UpdateTransaction($updateTransactionInput: UpdateTransactionInput!) {
        updateTransaction(updateTransactionInput: $updateTransactionInput) {
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

// Mutation used to create a new card link for a brand-new user, with a new card.
export const createCardLink = /* GraphQL */ `
    mutation CreateCardLink($createCardLinkInput: CreateCardLinkInput!) {
        createCardLink(createCardLinkInput: $createCardLinkInput) {
            errorType
            errorMessage
            data {
                id
                memberId
                cards {
                    id
                    applicationID
                    token
                    type
                    name
                    last4
                    additionalProgramID
                }
                createdAt
                updatedAt
                status
            }
        }
    }
`;

// Mutation used to add a new card, to an existing user, without creating a brand-new user.
export const addCard = /* GraphQL */ `
    mutation AddCard($addCardInput: AddCardInput!) {
        addCard(addCardInput: $addCardInput) {
            errorType
            errorMessage
            data {
                id
                memberId
                cards {
                    id
                    applicationID
                    token
                    type
                    name
                    last4
                    additionalProgramID
                }
                createdAt
                updatedAt
                status
            }
        }
    }
`;

// Mutation used to remove a card link from a user's card link.
export const deleteCard = /* GraphQL */ `
    mutation DeleteCard($deleteCardInput: DeleteCardInput!) {
        deleteCard(deleteCardInput: $deleteCardInput) {
            errorType
            errorMessage
            data {
                id
                cardId
                updatedAt
            }
        }
    }
`;

// Mutation used to create an individual's military verification object
export const createMilitaryVerification = /* GraphQL */ `
    mutation CreateMilitaryVerification($createMilitaryVerificationInput: CreateMilitaryVerificationInput!) {
        createMilitaryVerification(createMilitaryVerificationInput: $createMilitaryVerificationInput) {
            errorType
            errorMessage
            data {
                id
                firstName
                lastName
                dateOfBirth
                enlistmentYear
                addressLine
                city
                state
                zipCode
                createdAt
                updatedAt
                militaryDutyStatus
                militaryBranch
                militaryAffiliation
                militaryVerificationStatus
            }
        }
    }
`;

// Mutation used to update an individual's military verification status
export const updateMilitaryVerificationStatus = /* GraphQL */ `
    mutation UpdateMilitaryVerificationStatus($updateMilitaryVerificationInput: UpdateMilitaryVerificationInput!) {
        updateMilitaryVerificationStatus(updateMilitaryVerificationInput: $updateMilitaryVerificationInput) {
            errorType
            errorMessage
            id
            militaryVerificationStatus
        }
    }
`;
