import {
    CountryCode,
    createDevice,
    createNotification,
    CreateNotificationInput, FidelisPartner,
    getDeviceByToken, getFidelisPartners, getOffers, Offer, OfferAvailability, OfferFilter, OfferState,
    PushDevice, RedemptionType,
    updateDevice,
    UserDeviceErrorType,
    UserDeviceState
} from "@moonbeam/moonbeam-models";
import {API, graphqlOperation} from "aws-amplify";
import {dynamicSort} from "./Main";
import * as Location from "expo-location";

/**
 * Function used to send a notification (depending on type and channel)
 *
 * @param createNotificationInput the notification details to be passed in,
 * in order to send/route the notification appropriately.
 *
 * @returns a {@link Promise} containing a {@link boolean} flag, representing
 * whether the notification was successfully sent or not.
 */
export const sendNotification = async (createNotificationInput: CreateNotificationInput): Promise<boolean> => {
    try {
        // call the internal notification creation API
        const createNotificationResult = await API.graphql(graphqlOperation(createNotification, {
            createNotificationInput: createNotificationInput
        }));

        // retrieve the data block from the response
        // @ts-ignore
        const responseData = createNotificationResult ? createNotificationResult.data : null;

        // check if there are any errors in the returned response
        if (responseData && responseData.createNotification.errorMessage === null) {
            return true;
        } else {
            console.log(`Unexpected error while creating a notification through the create notification API ${JSON.stringify(responseData)}`);
            return false;
        }
    } catch (error) {
        console.log(`Unexpected error while sending a notification with details ${JSON.stringify(createNotificationInput)} ${error}`);

        return false;
    }
};

/**
 * Function used to determine whether we should proceed with the creation a physical device
 * or not. If so, it also updates the status of an existing association.
 *
 * @param userId generated for the user
 * @param tokenId the expo push token for the physical device
 *
 * @return a {@link Promise} of a pair, containing a {@link Boolean}, representing whether we should proceed with
 * the creation of a new physical device or not.
 */
export const proceedWithDeviceCreation = async (userId: string, tokenId: string): Promise<boolean> => {
    try {
        // call the createDevice API
        const getDeviceByTokenResult = await API.graphql(graphqlOperation(getDeviceByToken, {
            getDeviceByTokenInput: {
                tokenId: tokenId
            }
        }));

        // retrieve the data block from the response
        // @ts-ignore
        const responseData = getDeviceByTokenResult ? getDeviceByTokenResult.data : null;

        // check if there are any errors in the returned response
        if (responseData && responseData.getDeviceByToken.errorMessage === null) {
            // returning the military status
            const pushDevice: PushDevice = responseData.getDeviceByToken.data as PushDevice;

            // check if the IDs match, if they do then return false
            if (pushDevice.id === userId) {
                console.log(`Device already associated to user!`);
                return false;
            } else {
                /**
                 * if the device is associated to another user, ensure that chronologically
                 * the incoming association is newer than the existing one. If so, then we
                 * update the old association's status to INACTIVE, and return.
                 */
                if (Date.parse(new Date().toISOString()) > Date.parse(pushDevice.lastLoginDate)) {
                    /**
                     * update the old association's status to INACTIVE, since we only want one user associated to a device at a time.
                     *
                     * call the updateDevice API
                     */
                    const updateDeviceResult = await API.graphql(graphqlOperation(updateDevice, {
                        updateDeviceInput: {
                            id: pushDevice.id,
                            tokenId: pushDevice.tokenId,
                            deviceState: UserDeviceState.Inactive
                        }
                    }));
                    // retrieve the data block from the response
                    // @ts-ignore
                    const responseData = updateDeviceResult ? updateDeviceResult.data : null;

                    // check if there are any errors in the returned response
                    if (responseData && responseData.updateDevice.errorMessage === null) {
                        return true;
                    } else {
                        console.log(`Unexpected error while updating the physical device ${JSON.stringify(updateDeviceResult)}`);
                        return false;
                    }
                } else {
                    console.log(`Physical device association is older than existing one. Skipping.`);
                    return false;
                }
            }
        } else {
            /**
             * filter through any errors. If there are no physical devices with the incoming tokenId, then return true. For
             * other errors, return false.
             */
            if (responseData.getDeviceByToken.errorMessage !== null && responseData.getDeviceByToken.errorType === UserDeviceErrorType.NoneOrAbsent) {
                console.log(`No physical devices with ${tokenId} found!`);
                return true;
            } else {
                console.log(`Unexpected error while creating retrieving physical device by token ${JSON.stringify(getDeviceByTokenResult)}`);
                return false;
            }
        }
    } catch (error) {
        console.log(`Unexpected error while attempting to retrieve physical device by token ${JSON.stringify(error)} ${error}`);
        return false;
    }
}

/**
 * Function used to create a new physical device, associated to a user.
 *
 * @param userId generated for the user
 * @param tokenId the expo push token for the physical device that will be associated to the user
 *
 * @return a {@link Promise} of a pair, containing a {@link Boolean}, representing whether a physical device
 * was successfully associated to the user, or not.
 */
export const createPhysicalDevice = async (userId: string, tokenId: string): Promise<boolean> => {
    try {
        // call the createDevice API
        const createDeviceResult = await API.graphql(graphqlOperation(createDevice, {
            createDeviceInput: {
                id: userId,
                tokenId: tokenId,
                deviceState: UserDeviceState.Active // set the device to active by default
            }
        }));

        // retrieve the data block from the response
        // @ts-ignore
        const responseData = createDeviceResult ? createDeviceResult.data : null;

        // check if there are any errors in the returned response
        if (responseData && responseData.createDevice.errorMessage === null) {
            return true;
        } else {
            console.log(`Unexpected error while creating a new physical device for user ${JSON.stringify(createDeviceResult)}`);
            return false;
        }
    } catch (error) {
        console.log(`Unexpected error while attempting to create a new physical device for user ${JSON.stringify(error)} ${error}`);
        return false;
    }
}

/**
 * Function used to retrieve the list of online offers that we will
 * use for caching purposes.
 *
 * @returns a {@link Promise} of an {@link Array} of {@link Offer}, since this function will
 * be used to cache the list of online offers.
 */
export const retrieveOnlineOffersList = async (): Promise<Offer[]> => {
    // result to return
    let onlineOffers: Offer[] = [];

    try {
        // call the getOffers API
        const onlineOffersResult = await API.graphql(graphqlOperation(getOffers, {
            getOffersInput: {
                availability: OfferAvailability.Global,
                countryCode: CountryCode.Us,
                filterType: OfferFilter.Online,
                offerStates: [OfferState.Active, OfferState.Scheduled],
                pageNumber: 1, // cache the first page only
                pageSize: 7, // load 7 nearby offers at a time
                redemptionType: RedemptionType.Cardlinked
            }
        }));

        // retrieve the data block from the response
        // @ts-ignore
        const responseData = onlineOffersResult ? onlineOffersResult.data : null;

        // check if there are any errors in the returned response
        if (responseData && responseData.getOffers.errorMessage === null) {
            // retrieve the array of online offers from the API call
            onlineOffers = responseData.getOffers.data.offers;

            // ensure that there is at least one online offer in the list
            if (onlineOffers.length > 0) {
                return onlineOffers;
            } else {
                console.log(`No online offers to display ${JSON.stringify(onlineOffersResult)}`);
                return onlineOffers;
            }
        } else {
            console.log(`Unexpected error while retrieving online offers ${JSON.stringify(onlineOffersResult)}`);
            return onlineOffers;
        }
    } catch (error) {
        console.log(`Unexpected error while attempting to retrieve online offers ${JSON.stringify(error)} ${error}`);
        return onlineOffers;
    }
}

/**
 * Function used to retrieve the list of preferred (Fidelis) partners
 * and their offers, that we will use for caching purposes.
 *
 * @returns a {@link Promise} of an {@link Array} of {@link FidelisPartner}, since this function will
 * be used to cache the list of Fidelis partners and their offers.
 */
export const retrieveFidelisPartnerList = async (): Promise<FidelisPartner[]> => {
    // result to return
    let fidelisPartners: FidelisPartner[] = [];

    try {
        // call the getFidelisPartners API
        const fidelisPartnersResult = await API.graphql(graphqlOperation(getFidelisPartners));

        // retrieve the data block from the response
        // @ts-ignore
        const responseData = fidelisPartnersResult ? fidelisPartnersResult.data : null;

        // check if there are any errors in the returned response
        if (responseData && responseData.getFidelisPartners.errorMessage === null) {
            // retrieve the array of Fidelis partners from the API call
            fidelisPartners = responseData.getFidelisPartners.data;

            // ensure that there is at least one featured partner in the list
            if (fidelisPartners.length > 0) {
                return fidelisPartners.sort(dynamicSort("brandName"));
            } else {
                console.log(`No Fidelis partners to display ${JSON.stringify(fidelisPartnersResult)}`);
                return fidelisPartners;
            }
        } else {
            console.log(`Unexpected error while retrieving Fidelis partner offers ${JSON.stringify(fidelisPartnersResult)}`);
            return fidelisPartners;
        }
    } catch (error) {
        console.log(`Unexpected error while attempting to retrieve the Fidelis partner offers ${JSON.stringify(error)} ${error}`);
        return fidelisPartners;
    }
}


/**
 * Function used to retrieve the list of offers near the user's home location,
 * that we will use for caching purposes.
 *
 * @returns a {@link Promise} of an {@link Array} of {@link Offer}, since this function will
 * be used to cache the list of offers near the user's home location.
 */
export const retrieveOffersNearLocation = async (address: string): Promise<Offer[]> => {
    // result to return
    let nearbyOffers: Offer[] = [];

    try {
        // first retrieve the necessary geolocation information based on the user's home address
        const geoLocationArray = await Location.geocodeAsync(address);
        /**
         * get the first location point in the array of geolocation returned
         */
        const geoLocation = geoLocationArray && geoLocationArray.length !== 0 ? geoLocationArray[0] : null;
        if (!geoLocation) {
            console.log(`Unable to retrieve user's home location's geolocation ${address}`);
            return nearbyOffers;
        } else {
            // call the getOffers API
            const nearbyOffersResult = await API.graphql(graphqlOperation(getOffers, {
                getOffersInput: {
                    availability: OfferAvailability.Global,
                    countryCode: CountryCode.Us,
                    filterType: OfferFilter.Nearby,
                    offerStates: [OfferState.Active, OfferState.Scheduled],
                    pageNumber: 1, // cache the first page only
                    pageSize: 7, // load 7 nearby offers at a time
                    radiusIncludeOnlineStores: false, // do not include online offers in nearby offers list
                    radius: 50000, // radius of 50 km (50,000 meters) roughly equal to 25 miles
                    radiusLatitude: geoLocation.latitude,
                    radiusLongitude: geoLocation.longitude,
                    redemptionType: RedemptionType.Cardlinked
                }
            }));

            // retrieve the data block from the response
            // @ts-ignore
            const responseData = nearbyOffersResult ? nearbyOffersResult.data : null;

            // check if there are any errors in the returned response
            if (responseData && responseData.getOffers.errorMessage === null) {
                // retrieve the array of nearby offers from the API call
                nearbyOffers = responseData.getOffers.data.offers;

                // ensure that there is at least one nearby offer in the list
                if (nearbyOffers.length > 0) {
                    return nearbyOffers;
                } else {
                    console.log(`No offers near user's home location to display ${JSON.stringify(nearbyOffersResult)}`);
                    return nearbyOffers;
                }
            } else {
                console.log(`Unexpected error while retrieving offers near user's home location ${JSON.stringify(nearbyOffersResult)}`);
                return nearbyOffers;
            }
        }
    } catch (error) {
        console.log(`Unexpected error while attempting to retrieve offers near user's home location ${JSON.stringify(error)} ${error}`);
        return nearbyOffers;
    }
}
