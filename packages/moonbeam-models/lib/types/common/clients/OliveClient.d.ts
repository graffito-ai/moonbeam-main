import { Card, CardLinkResponse, GetOffersInput, GetUserCardLinkingIdInput, GetUserCardLinkingIdResponse, MemberDetailsResponse, MemberResponse, OfferIdResponse, OfferRedemptionTypeResponse, OffersResponse, RemoveCardResponse, SearchOffersInput, Transaction, TransactionResponse, UpdatedTransactionEvent, UpdatedTransactionEventResponse } from "../GraphqlExports";
import { BaseAPIClient } from "./BaseAPIClient";
/**
 * Class used as the base/generic client for all Olive card linking related calls.
 */
export declare class OliveClient extends BaseAPIClient {
    /**
     * Generic constructor for the client.
     *
     * @param environment the AWS environment passed in from the Lambda resolver.
     * @param region the AWS region passed in from the Lambda resolver.
     */
    constructor(environment: string, region: string);
    /**
     * Function used to complete the linking of an individual's card on the platform.
     *
     * @param userId unique user ID of a card linking user.
     * @param createdAt card linked object creation date
     * @param updatedAt card linked object update date
     * @param card card information to be used during the enrollment/linking process
     *
     * @return a {@link Promise} of {@link CardLinkResponse} representing the
     * card link response object obtained from the linking call
     */
    link(userId: string, createdAt: string, updatedAt: string, card: Card): Promise<CardLinkResponse>;
    /**
     * Function used to add a new card to an existing member.
     *
     * @param userId unique user ID of a card linking user.
     * @param memberId member id, retrieved from Olive, which the card will be added to
     * @param createdAt card linked object creation date
     * @param updatedAt card linked object update date
     * @param card card information to be used in adding a new card to a member
     *
     * @return a {@link Promise} of {@link CardLinkResponse} representing the
     * card link response object obtained from the add card call
     */
    addCard(userId: string, memberId: string, createdAt: string, updatedAt: string, card: Card): Promise<CardLinkResponse>;
    /**
     * Function used to update a member's status, to either active or inactive.
     *
     * @param userId unique user ID of a card linking user.
     * @param memberId member id, retrieved from Olive, which the status will be updated for
     * @param memberFlag flag to indicate what the status of the member, will be updated to
     * @param updatedAt card linked object update date
     *
     * @return a {@link Promise} of {@link MemberResponse} representing the
     * member's contents after the update is performed
     */
    updateMemberStatus(userId: string, memberId: string, memberFlag: boolean, updatedAt: string): Promise<MemberResponse>;
    /**
     * Function used to remove/deactivate a card, given its ID.
     *
     * @param cardId the id of the card to be removed/deleted/deactivated
     *
     * @return a {@link Promise} of {@link RemoveCardResponse} representing the
     * card removal response.
     */
    removeCard(cardId: string): Promise<RemoveCardResponse>;
    /**
     * Function used to retrieve the brand details, given a brand ID.
     *
     * @param transaction the transaction object, populated by the initial details
     * passed in by Olive. This object will be used to set even more information for
     * it, obtained from this brand call.
     *
     * @return a {@link Promise} of {@link TransactionResponse} representing the
     * transaction object, populated with the brand details
     */
    getBrandDetails(transaction: Transaction): Promise<TransactionResponse>;
    /**
     * Function used to retrieve the store details, given a store ID.
     *
     * @param transaction the transaction object, populated by the initial details
     * passed in by Olive. This object will be used to set even more information for
     * it, obtained from this brand call.
     *
     * @return a {@link Promise} of {@link TransactionResponse} representing the transaction
     * with the store details obtained, included in it.
     */
    getStoreDetails(transaction: Transaction): Promise<TransactionResponse>;
    /**
     * Function used to retrieve the member details, specifically the extMemberId, which is Moonbeam's unique user ID
     * set at creation time, given a member ID.
     *
     * @param memberId member ID obtained from Olive at creation time, used to retrieve the
     * other member details.
     *
     * @return a {@link Promise} of {@link MemberDetailsResponse} representing the member details
     */
    getMemberDetails(memberId: string): Promise<MemberDetailsResponse>;
    /**
     * Function used to retrieve the transaction details, given a transaction ID (used for updated
     * transactional events purposes).
     *
     * @param updatedTransactionEvent the updated transaction event object, populated by the
     * initial details passed by Olive in the updated webhook call. This object will be used
     * to set even more information for it, obtained from this transaction details call.
     *
     * @return a {@link Promise} of {@link UpdatedTransactionEventResponse} representing the
     * updated transaction event object, populated with the additional transaction details
     * that we retrieved
     */
    getUpdatedTransactionDetails(updatedTransactionEvent: UpdatedTransactionEvent): Promise<UpdatedTransactionEventResponse>;
    /**
     * Function used to retrieve the type of offer redemption, obtained from the offer object.
     *
     * @param offerId the id of the offer, used to retrieve the type of redemption for.
     *
     * @return a {@link Promise} of {@link OfferRedemptionTypeResponse} representing the redemption
     * type, obtained from the offer object.
     */
    getOfferRedemptionType(offerId: string): Promise<OfferRedemptionTypeResponse>;
    /**
     * Function used to retrieve the offer id, obtained from a transaction object, given
     * a transaction identifier (used for transactional purposes).
     *
     * @param transactionId the id of the transaction, used to retrieve the offer id
     * from.
     *
     * @return a {@link Promise} of {@link OfferIdResponse} representing the offer id
     * and/or the redeemed offer id, obtained from the transaction details.
     */
    getOfferId(transactionId: string): Promise<OfferIdResponse>;
    /**
     * Function used to retrieve the transaction details, given a transaction ID.
     *
     * @param transaction the transaction object, populated by the initial details
     * passed in by Olive. This object will be used to set even more information for
     * it, obtained from this transaction details call.
     *
     * @return a {@link Promise} of {@link TransactionResponse} representing the
     * transaction object, populated with the additional transaction details that
     * we retrieved.
     */
    getTransactionDetails(transaction: Transaction): Promise<TransactionResponse>;
    /**
     * Function used to search an offer, given certain filters to be passed in.
     *
     * @param searchOffersInput the offers input, containing the filtering information
     * used to search any applicable/matching offers.
     *
     * @returns a {@link OffersResponse} representing the matched offers' information.
     */
    searchOffers(searchOffersInput: SearchOffersInput): Promise<OffersResponse>;
    /**
     * Function used to get all the offers, given certain filters to be passed in.
     *
     * @param getOffersInput the offers input, containing the filtering information
     * used to retrieve all the applicable/matching offers.
     * @param numberOfRetries this optional param is applied in extreme circumstances,
     * when the number of records returned does not match to the number of records parameter.
     * @param pageNumber this optional param is applied in extreme circumstances,
     * when the number of records returned does not match to the number of records parameter,
     * and we need to decrease the page number forcefully.
     *
     * @returns a {@link OffersResponse} representing the matched offers' information.
     */
    getOffers(getOffersInput: GetOffersInput, numberOfRetries?: number, pageNumber?: number): Promise<OffersResponse>;
    /**
     * Function used to retrieve a user's card linking ID, given their Moonbeam
     * internal unique ID.
     *
     * @param getUserCardLinkingIdInput the input object containing the unique Moonbeam
     * internal ID, to be used while retrieving the user's card linking ID.
     *
     * @return a {@link Promise} of {@link GetUserCardLinkingIdResponse} representing the response
     * object, containing the user's card linking id.
     */
    getUserCardLinkingId(getUserCardLinkingIdInput: GetUserCardLinkingIdInput): Promise<GetUserCardLinkingIdResponse>;
}
