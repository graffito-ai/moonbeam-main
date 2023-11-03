import {
    CountryCode,
    createDevice,
    createNotification,
    CreateNotificationInput,
    createUserAuthSession,
    FidelisPartner, getAppUpgradeCredentials,
    getDeviceByToken,
    getFidelisPartners,
    getOffers,
    getPremierOffers, getSeasonalOffers,
    getUserAuthSession,
    Offer,
    OfferAvailability,
    OfferCategory,
    OfferFilter, OfferSeasonalType,
    OfferState,
    PushDevice,
    RedemptionType, Stages,
    updateDevice,
    updateUserAuthSession,
    UserAuthSession,
    UserAuthSessionErrorType,
    UserAuthSessionResponse,
    UserDeviceErrorType,
    UserDeviceState
} from "@moonbeam/moonbeam-models";
import {API, Cache, graphqlOperation} from "aws-amplify";
import {dynamicSort} from "./Main";
import * as Location from "expo-location";
import {LocationObject} from "expo-location";
import {SetterOrUpdater} from "recoil";
import {appUpgradeVersionCheck} from 'app-upgrade-react-native-sdk';
import {Platform} from "react-native";
import * as envInfo from "../../local-env-info.json";

/**
 * Function used to check whether the users have the most updated version of the app or not.
 *
 * This will integrate with App Upgrade {@link https://appupgrade.dev}, in order to check
 * whether we prompt users with an alert recommending an app upgrade or not.
 *
 * Depending on whether we have a breaking app version out, this might be turned on or off.
 */
export const appUpgradeCheck = async (): Promise<void> => {
    try {
        // first retrieve the API Key for App Upgrade by performing the getAppUpgradeCredentials AWS AppSync call
        const getAppUpgradeCredentialsResult = await API.graphql(graphqlOperation(getAppUpgradeCredentials));

        // retrieve the data block from the response
        // @ts-ignore
        const appUpgradeCredentialsResponseData = getAppUpgradeCredentialsResult ? getAppUpgradeCredentialsResult.data : null;

        // check if there are any errors in the returned response
        if (appUpgradeCredentialsResponseData !== null && appUpgradeCredentialsResponseData !== undefined &&
            appUpgradeCredentialsResponseData.getAppUpgradeCredentials.errorMessage === null) {
            const appStorageAPIKey = appUpgradeCredentialsResponseData.getAppUpgradeCredentials.data;

            // build the app information used to decide whether the user will get prompted with the app upgrade notification or not
            const appInfo = {
                appId: Platform.OS === 'android' ? 'com.moonbeam.moonbeamfin' : '6450375130', // The App ID from the Play Store or App Store
                appName: 'Moonbeam Finance', // The App Name
                appVersion: '0.0.10', // The targeted App Version
                platform: Platform.OS ==='android' ? 'android' : 'ios', // The App Platform
                environment:  envInfo.envName === Stages.DEV ? 'development': 'production', // App Environment, production, development
                appLanguage: 'en', // App Language ex: en, es, etc.
            };

            // configure the alert that will get displayed to the user accordingly
            const alertConfig = {
                title: 'Please Update',
                updateButtonTitle: 'Update Now',
                // laterButtonTitle: 'Later',
                // onDismissCallback: () => { console.log('Dismiss') },
                // onLaterCallback: () => { console.log('Later') }
            };

            // perform the user check for the App Upgrade
            appUpgradeVersionCheck(appInfo, appStorageAPIKey, alertConfig);
        } else {
            console.log(`Unexpected error while creating retrieving the App Storage API Key through the create notification API ${JSON.stringify(appUpgradeCredentialsResponseData)}`);
        }
    } catch (error) {
        const errorMessage = `Unexpected error while checking the App Upgrade version ${error} ${JSON.stringify(error)}`;
        console.log(errorMessage);
    }
}


/**
 * Function used to update a user authentication statistic. This will ensure that a user
 * session exists for the user before updating it, otherwise it will create a new user
 * session for the user.
 *
 * @param userId generated for the user
 *
 * @return a {@link Promise} containing a {@link UserAuthSessionResponse}, representing whether the
 * user authentication statistic was successfully updated or not, and if it was, what the user auth
 * session contains.
 */
export const updateUserAuthStat = async (userId: string): Promise<UserAuthSessionResponse> => {
    try {
        // first call the getUserAuthSession API, to check if user already has an associated session
        const getUserAuthSessionResult = await API.graphql(graphqlOperation(getUserAuthSession, {
            getUserAuthSessionInput: {
                id: userId
            }
        }));

        // retrieve the data block from the response
        // @ts-ignore
        const getUserAuthSessionResponseData = getUserAuthSessionResult ? getUserAuthSessionResult.data : null;

        // check if there are any errors in the returned response
        if (getUserAuthSessionResponseData !== null && getUserAuthSessionResponseData !== undefined &&
            getUserAuthSessionResponseData.getUserAuthSession.errorMessage === null) {
            // there is an existent user session associated with the user, proceed wth updating it
            const updateUserAuthSessionResult = await API.graphql(graphqlOperation(updateUserAuthSession, {
                updateUserAuthSessionInput: {
                    id: userId
                }
            }));

            // retrieve the data block from the response
            // @ts-ignore
            const updateUserAuthSessionResponseData = updateUserAuthSessionResult ? updateUserAuthSessionResult.data : null;

            // check if there are any errors in the returned response
            if (updateUserAuthSessionResponseData !== null && updateUserAuthSessionResponseData !== undefined &&
                updateUserAuthSessionResponseData.updateUserAuthSession.errorMessage === null) {
                // return the updated user auth session object
                return {
                    data: updateUserAuthSessionResponseData.updateUserAuthSession.data as UserAuthSession
                };
            } else {
                const errorMessage = `Unexpected error while updating existing user session through the updateUserAuthSession API ${JSON.stringify(updateUserAuthSessionResponseData)}`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: UserAuthSessionErrorType.UnexpectedError
                }
            }
        } else {
            // filter through the error message, in order to determine whether there's no user session associated with the user
            if (getUserAuthSessionResponseData !== null && getUserAuthSessionResponseData !== undefined &&
                getUserAuthSessionResponseData.getUserAuthSession.errorType === UserAuthSessionErrorType.NoneOrAbsent) {
                // proceed with creating a user session for the user
                const createUserAuthSessionResult = await API.graphql(graphqlOperation(createUserAuthSession, {
                    createUserAuthSessionInput: {
                        id: userId
                    }
                }));

                // retrieve the data block from the response
                // @ts-ignore
                const createUserAuthSessionResponseData = createUserAuthSessionResult ? createUserAuthSessionResult.data : null;

                // check if there are any errors in the returned response
                if (createUserAuthSessionResponseData !== null && createUserAuthSessionResponseData !== undefined &&
                    createUserAuthSessionResponseData.createUserAuthSession.errorMessage === null) {
                    // return the newly create user auth session object
                    return {
                        data: createUserAuthSessionResponseData.createUserAuthSession.data as UserAuthSession
                    };
                } else {
                    const errorMessage = `Unexpected error while creating existing user session through the createUserAuthSession API ${JSON.stringify(createUserAuthSessionResponseData)}`;
                    console.log(errorMessage);
                    return {
                        errorMessage: errorMessage,
                        errorType: UserAuthSessionErrorType.UnexpectedError
                    }
                }
            } else {
                const errorMessage = `Unexpected error while retrieving existing user session through the getUserAuthSession API ${JSON.stringify(getUserAuthSessionResponseData)}`;
                console.log(errorMessage);
                return {
                    errorMessage: errorMessage,
                    errorType: UserAuthSessionErrorType.UnexpectedError
                }
            }
        }
    } catch (error) {
        const errorMessage = `Unexpected error while updating user auth stat ${error} ${JSON.stringify(error)}`;
        console.log(errorMessage);
        return {
            errorMessage: errorMessage,
            errorType: UserAuthSessionErrorType.UnexpectedError
        }
    }
}


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
 * Function used to retrieve the list of premier online offers that we will
 * use for caching purposes.
 *
 * @param pageNumber optional parameter specifying a page number that we will get the locations
 * near offers from, in case we are not using this for caching purposes
 * @param setPageNumber setter or updater used to update the page number, if passed in.
 *
 * @returns a {@link Promise} of an {@link Array} of {@link Offer}, since this function will
 * be used to cache the list of premier online offers.
 */
export const retrievePremierOnlineOffersList = async (pageNumber?: number, setPageNumber?: SetterOrUpdater<number>): Promise<Offer[]> => {
    // result to return
    let premierOnlineOffers: Offer[] = [];

    try {
        // call the getOffers API
        const premierOnlineOffersResult = await API.graphql(graphqlOperation(getPremierOffers, {
            getOffersInput: {
                availability: OfferAvailability.Global,
                countryCode: CountryCode.Us,
                filterType: OfferFilter.PremierOnline,
                offerStates: [OfferState.Active, OfferState.Scheduled],
                pageNumber: pageNumber !== undefined ? pageNumber : 1,
                pageSize: 14, // load all the premier online offers, so we can sort them appropriately
                redemptionType: RedemptionType.Cardlinked
            }
        }));

        // retrieve the data block from the response
        // @ts-ignore
        const responseData = premierOnlineOffersResult ? premierOnlineOffersResult.data : null;

        // check if there are any errors in the returned response
        if (responseData && responseData.getPremierOffers.errorMessage === null) {
            // retrieve the array of online offers from the API call
            premierOnlineOffers = responseData.getPremierOffers.data.offers;

            // ensure that there is at least one online offer in the list
            if (premierOnlineOffers.length > 0) {
                // increase the page number, if needed
                pageNumber !== null && pageNumber !== undefined &&
                setPageNumber !== null && setPageNumber !== undefined && setPageNumber(pageNumber + 1);

                return premierOnlineOffers;
            } else {
                console.log(`No premier online offers to display ${JSON.stringify(premierOnlineOffersResult)}`);
                return premierOnlineOffers;
            }
        } else {
            console.log(`Unexpected error while retrieving premier online offers ${JSON.stringify(premierOnlineOffersResult)}`);
            return premierOnlineOffers;
        }
    } catch (error) {
        console.log(`Unexpected error while attempting to retrieve premier online offers ${JSON.stringify(error)} ${error}`);
        return premierOnlineOffers;
    }
}

/**
 * Function used to retrieve the list of categorized online offers that we will
 * use for caching purposes.
 *
 * @param pageNumber optional parameter specifying a page number that we will get the online
 * from, in case we are not using this for caching purposes
 * @param setPageNumber optional setter or updater used to update the page number.
 * @param totalNumberOfOffersAvailable parameter specifying the total number of categorized online offers available.
 * @param setTotalNumberOfOffersAvailable setter or updates used to update the total number of categorized online
 * offers available.
 * @param offerCategory category of offers to retrieve.
 *
 * @returns a {@link Promise} of an {@link Array} of {@link Offer}, since this function will
 * be used to cache the list of categorized online offers.
 */
export const retrieveCategorizedOnlineOffersList = async (totalNumberOfOffersAvailable: number, setTotalNumberOfOffersAvailable: SetterOrUpdater<number>,
                                                          offerCategory: OfferCategory, pageNumber?: number, setPageNumber?: SetterOrUpdater<number>,): Promise<Offer[]> => {
    // result to return
    let onlineOffers: Offer[] = [];

    try {
        // call the getOffers API for all categorized other than Veterans Day, for which we call getSeasonalOffers API
        const onlineOffersResult = offerCategory !== OfferCategory.VeteranDay
            ? await API.graphql(graphqlOperation(getOffers, {
                getOffersInput: {
                    availability: OfferAvailability.Global,
                    countryCode: CountryCode.Us,
                    filterType: OfferFilter.CategorizedOnline,
                    offerStates: [OfferState.Active, OfferState.Scheduled],
                    pageNumber: pageNumber !== undefined ? pageNumber : 1, // if no page number is passed in, revert to the first page number
                    pageSize: 15, // load 15 offers
                    redemptionType: RedemptionType.Cardlinked,
                    offerCategory: offerCategory
                }
            }))
            : await API.graphql(graphqlOperation(getSeasonalOffers, {
                getOffersInput: {
                    availability: OfferAvailability.ClientOnly,
                    countryCode: CountryCode.Us,
                    filterType: OfferFilter.SeasonalOnline,
                    offerStates: [OfferState.Active, OfferState.Scheduled],
                    pageNumber: pageNumber !== undefined ? pageNumber : 1, // if no page number is passed in, revert to the first page number
                    pageSize: 20, // load 15 offers
                    redemptionType: RedemptionType.Cardlinked,
                    offerSeasonalType: OfferSeasonalType.VeteransDay
                }
            }));

        // retrieve the data block from the response
        // @ts-ignore
        const responseData = onlineOffersResult ? onlineOffersResult.data : null;

        // get the appropriate property depending on whether the offers are seasonal or not
        const offerProperty = offerCategory !== OfferCategory.VeteranDay ? 'getOffers' : 'getSeasonalOffers';

        // check if there are any errors in the returned response
        if (responseData && responseData[`${offerProperty}`].errorMessage === null) {
            // retrieve the array of online offers from the API call
            onlineOffers = responseData[`${offerProperty}`].data.offers;

            // ensure that there is at least one online offer in the list
            if (onlineOffers.length > 0) {
                // increase the page number, if needed
                pageNumber !== null && pageNumber !== undefined &&
                setPageNumber !== null && setPageNumber !== undefined && setPageNumber(pageNumber + 1);

                // set the total number of online offers available, if not previously set
                totalNumberOfOffersAvailable !== responseData[`${offerProperty}`].data.totalNumberOfRecords &&
                setTotalNumberOfOffersAvailable !== undefined && setTotalNumberOfOffersAvailable(responseData[`${offerProperty}`].data.totalNumberOfRecords);

                return onlineOffers;
            } else {
                console.log(`No categorized online offers to display for category ${offerCategory} ${JSON.stringify(onlineOffersResult)}`);
                return onlineOffers;
            }
        } else {
            console.log(`Unexpected error while retrieving categorized online offers for category ${offerCategory} ${JSON.stringify(onlineOffersResult)}`);
            return onlineOffers;
        }
    } catch
        (error) {
        console.log(`Unexpected error while attempting to retrieve categorized online offers for category ${offerCategory} ${JSON.stringify(error)} ${error}`);
        return onlineOffers;
    }
}

/**
 * Function used to retrieve the list of online offers that we will
 * use for caching purposes.
 *
 * @param pageNumber optional parameter specifying a page number that we will get the online
 * from, in case we are not using this for caching purposes
 * @param setPageNumber optional setter or updater used to update the page number.
 * @param totalNumberOfOffersAvailable parameter specifying the total number of online offers available.
 * @param setTotalNumberOfOffersAvailable setter or updates used to update the total number of online
 * offers available.
 *
 * @returns a {@link Promise} of an {@link Array} of {@link Offer}, since this function will
 * be used to cache the list of online offers.
 */
export const retrieveOnlineOffersList = async (totalNumberOfOffersAvailable: number, setTotalNumberOfOffersAvailable: SetterOrUpdater<number>,
                                               pageNumber?: number, setPageNumber?: SetterOrUpdater<number>): Promise<Offer[]> => {
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
                pageNumber: pageNumber !== undefined ? pageNumber : 1, // if no page number is passed in, revert to the first page number
                pageSize: 15, // load 15 offers
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
                // increase the page number, if needed
                pageNumber !== null && pageNumber !== undefined &&
                setPageNumber !== null && setPageNumber !== undefined && setPageNumber(pageNumber + 1);

                // set the total number of online offers available, if not previously set
                totalNumberOfOffersAvailable !== responseData.getOffers.data.totalNumberOfRecords &&
                setTotalNumberOfOffersAvailable !== undefined && setTotalNumberOfOffersAvailable(responseData.getOffers.data.totalNumberOfRecords);

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
 * Function used to retrieve the list of premier offers nearby, that we will use
 * for background loading purposes.
 *
 * @param pageNumber parameter specifying a page number that we will get the nearby locations
 * from
 * @param setPageNumber setter or updater used to update the page number.
 * @param currentUserLocation the current location object of the user
 * @param setCurrentUserLocation setter or updates used to update the current user location if needed
 *
 * @returns a {@link Promise} of an {@link Array} of {@link Offer}, since this function
 * will be used to get the list of offers nearby.
 */
export const retrievePremierOffersNearby = async (pageNumber: number, setPageNumber: SetterOrUpdater<number>, currentUserLocation: LocationObject | null,
                                                  setCurrentUserLocation: SetterOrUpdater<LocationObject | null>): Promise<Offer[] | null> => {
    // result to return
    let nearbyOffers: Offer[] = [];

    try {
        // first retrieve the necessary permissions for location purposes
        const foregroundPermissionStatus = await Location.requestForegroundPermissionsAsync();
        if (foregroundPermissionStatus.status !== 'granted') {
            const errorMessage = `Permission to access location was not granted!`;
            console.log(errorMessage);

            return null;
        } else {
            if (currentUserLocation === null) {
                const lastKnownPositionAsync: LocationObject | null = await Location.getLastKnownPositionAsync();
                setCurrentUserLocation(lastKnownPositionAsync !== null ? lastKnownPositionAsync : await Location.getCurrentPositionAsync());
            }

            // first retrieve the latitude and longitude of the current user
            if (currentUserLocation !== null && currentUserLocation.coords && currentUserLocation.coords.latitude && currentUserLocation.coords.longitude) {
                // call the getOffers API
                const premierNearbyOffersResult = await API.graphql(graphqlOperation(getPremierOffers, {
                    getOffersInput: {
                        availability: OfferAvailability.Global,
                        countryCode: CountryCode.Us,
                        filterType: OfferFilter.PremierNearby,
                        offerStates: [OfferState.Active, OfferState.Scheduled],
                        pageNumber: pageNumber,
                        pageSize: 1, // load 1 premier nearby offer at a time
                        radiusIncludeOnlineStores: false, // do not include online offers in nearby offers list
                        radius: 50000, // radius of 50 km (50,000 meters) roughly equal to 25 miles
                        radiusLatitude: currentUserLocation.coords.latitude,
                        radiusLongitude: currentUserLocation.coords.longitude,
                        redemptionType: RedemptionType.Cardlinked
                    }
                }));

                // retrieve the data block from the response
                // @ts-ignore
                const responseData = premierNearbyOffersResult ? premierNearbyOffersResult.data : null;

                // check if there are any errors in the returned response
                if (responseData && responseData.getPremierOffers.errorMessage === null) {
                    // retrieve the array of nearby offers from the API call
                    nearbyOffers = responseData.getPremierOffers.data.offers;

                    // ensure that there is at least one nearby offer in the list
                    if (nearbyOffers.length > 0) {
                        setPageNumber(pageNumber + 1);
                        // retrieve the array of nearby offers from the API call
                        return nearbyOffers;
                    } else {
                        console.log(`No premier nearby offers to display ${JSON.stringify(premierNearbyOffersResult)}`);
                        return [];
                    }
                } else {
                    console.log(`Unexpected error while retrieving premier nearby offers ${JSON.stringify(premierNearbyOffersResult)}`);
                    return null;
                }
            } else {
                console.log(`Unable to retrieve the current user's location coordinates!`);
                return null;
            }
        }
    } catch (error) {
        console.log(`Unexpected error while attempting to retrieve premier nearby offers ${JSON.stringify(error)} ${error}`);
        return null;
    }
}

/**
 * Function used to retrieve the list of offers nearby, that we will use
 * for background loading purposes to be displayed in the offers nearby
 * main horizontal or full screen maps.
 *
 * @param userInformation user information to be passed in, in case we need to fall back the
 * offers near a user's home location.
 * @param currentUserLocation the current location object of the user
 * @param setCurrentUserLocation setter or updates used to update the current user location if needed
 * @param totalNumberOfOffersAvailable optional parameter specifying the total number of offers available within 5-7 miles
 * of the user.
 * @param setTotalNumberOfOffersAvailable optional setter or updates used to update the total number of offers available
 * within 5-7 miles of the user.
 * @param fullScreenMap optional param representing whether this call is used for the full screen map or not
 * @param fullScreenLatitude optional param representing the full screen map's latitude, adjusted by the user
 * @param fullScreenLongitude optional param representing the full screen map's longitude, adjusted by the user
 *
 * @returns a {@link Promise} of an {@link Array} of {@link Offer}, since this function
 * will be used to get the list of offers nearby use for the main horizontal or full screen maps.
 */
export const retrieveOffersNearbyForMap = async (userInformation: any, currentUserLocation: LocationObject | null,
                                                 setCurrentUserLocation: SetterOrUpdater<LocationObject | null>, totalNumberOfOffersAvailable?: number,
                                                 setTotalNumberOfOffersAvailable?: SetterOrUpdater<number>, fullScreenMap?: boolean,
                                                 fullScreenLatitude?: number, fullScreenLongitude?: number): Promise<Offer[] | null> => {
    // result to return
    let nearbyOffers: Offer[] = [];

    try {
        // first retrieve the necessary permissions for location purposes
        const foregroundPermissionStatus = await Location.requestForegroundPermissionsAsync();
        if (foregroundPermissionStatus.status !== 'granted') {
            const errorMessage = `Permission to access location was not granted!`;
            console.log(errorMessage);

            return null;
        } else {
            if (currentUserLocation === null) {
                const lastKnownPositionAsync: LocationObject | null = await Location.getLastKnownPositionAsync();
                setCurrentUserLocation(lastKnownPositionAsync !== null ? lastKnownPositionAsync : await Location.getCurrentPositionAsync());
            }

            // first retrieve the latitude and longitude of the current user
            if (currentUserLocation !== null && currentUserLocation.coords && currentUserLocation.coords.latitude && currentUserLocation.coords.longitude) {
                // call the getOffers API
                const nearbyOffersResult = await API.graphql(graphqlOperation(getOffers, {
                    getOffersInput: {
                        availability: OfferAvailability.Global,
                        countryCode: CountryCode.Us,
                        filterType: OfferFilter.Nearby,
                        offerStates: [OfferState.Active, OfferState.Scheduled],
                        pageNumber: 1, // only look at the first page number (since we are loading a lot of offers for what we can display on the map)
                        pageSize: fullScreenMap === undefined || !fullScreenMap ? 10 : 1000, // only load 10 nearby offers for the main horizontal map and 1000 for full screen map
                        radiusIncludeOnlineStores: false, // do not include online offers in nearby offers list
                        radius: fullScreenMap === undefined || !fullScreenMap ? 10000 : 20000, // radius of 10 km for horizontal map and 20 km for full screen map
                        radiusLatitude: fullScreenLatitude !== undefined ? fullScreenLatitude : currentUserLocation.coords.latitude,
                        radiusLongitude: fullScreenLongitude !== undefined ? fullScreenLongitude : currentUserLocation.coords.longitude,
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
                        // set the total number of offers available nearby, if not previously set
                        fullScreenMap === undefined && totalNumberOfOffersAvailable !== responseData.getOffers.data.totalNumberOfRecords &&
                        setTotalNumberOfOffersAvailable !== undefined && setTotalNumberOfOffersAvailable(responseData.getOffers.data.totalNumberOfRecords);
                        // retrieve the array of nearby offers from the API call
                        return nearbyOffers;
                    } else {
                        console.log(`No nearby offers to display for main horizontal map ${JSON.stringify(nearbyOffersResult)}`);
                        // fall back to offers near their home address
                        return userInformation["address"] && userInformation["address"]["formatted"]
                            ? await retrieveOffersNearLocationForMap(userInformation["address"]["formatted"],
                                totalNumberOfOffersAvailable, setTotalNumberOfOffersAvailable, fullScreenMap, fullScreenLatitude, fullScreenLongitude)
                            : nearbyOffers;
                    }
                } else {
                    console.log(`Unexpected error while retrieving nearby offers for main horizontal map ${JSON.stringify(nearbyOffersResult)}`);
                    return nearbyOffers;
                }
            } else {
                console.log(`Unable to retrieve the current user's location coordinates!`);
                return nearbyOffers;
            }
        }
    } catch (error) {
        console.log(`Unexpected error while attempting to retrieve nearby offers for main horizontal map ${JSON.stringify(error)} ${error}`);

        // @ts-ignore
        if (!error.code && (error.code !== 'ERR_LOCATION_INFO_PLIST' || error.code !== 'E_LOCATION_UNAVAILABLE')) {
            return nearbyOffers;
        } else {
            // fall back to offers near their home address
            return userInformation["address"] && userInformation["address"]["formatted"]
                ? await retrieveOffersNearLocationForMap(userInformation["address"]["formatted"],
                    totalNumberOfOffersAvailable, setTotalNumberOfOffersAvailable, fullScreenMap, fullScreenLatitude, fullScreenLongitude)
                : nearbyOffers;
        }
    }
}

/**
 * Function used to retrieve the list of offers near the user's home location,
 * that we will use either for caching and/or for background loading purposes
 * to be displayed in the offers nearby main horizontal or full screen maps.
 *
 * @param address user's home location that we wil use to retrieve offers near location
 * @param totalNumberOfOffersAvailable optional parameter specifying the total number of offers available within 5-7 miles
 * of the user.
 * @param setTotalNumberOfOffersAvailable optional setter or updates used to update the total number of offers available
 * within 5-7 miles of the user.
 * @param fullScreenMap optional param representing whether this call is used for the full screen map or not
 * @param fullScreenLatitude optional param representing the full screen map's latitude, adjusted by the user
 * @param fullScreenLongitude optional param representing the full screen map's longitude, adjusted by the user
 *
 * @returns a {@link Promise} of an {@link Array} of {@link Offer}, since this function will
 * be used to get the list of offers near the user's home location for the main horizontal or full screen maps.
 */
const retrieveOffersNearLocationForMap = async (address: string, totalNumberOfOffersAvailable?: number,
                                                setTotalNumberOfOffersAvailable?: SetterOrUpdater<number>, fullScreenMap?: boolean,
                                                fullScreenLatitude?: number, fullScreenLongitude?: number): Promise<Offer[]> => {
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
                    pageNumber: 1, // only look at the first page number (since we are loading a lot of offers for what we can display on the map)
                    pageSize: fullScreenMap === undefined || !fullScreenMap ? 10 : 1000, // only load 10 nearby offers for the main horizontal map and 1000 for full screen map
                    radiusIncludeOnlineStores: false, // do not include online offers in nearby offers list
                    radius: fullScreenMap === undefined || !fullScreenMap ? 10000 : 20000, // radius of 10 km for horizontal map and 20 km for full screen map
                    radiusLatitude: fullScreenLatitude !== undefined ? fullScreenLatitude : geoLocation.latitude,
                    radiusLongitude: fullScreenLongitude !== undefined ? fullScreenLongitude : geoLocation.longitude,
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
                    // set the total number of offers available nearby, if not previously set
                    fullScreenMap === undefined && totalNumberOfOffersAvailable !== responseData.getOffers.data.totalNumberOfRecords &&
                    setTotalNumberOfOffersAvailable !== undefined && setTotalNumberOfOffersAvailable(responseData.getOffers.data.totalNumberOfRecords);

                    return nearbyOffers;
                } else {
                    console.log(`No offers near user's home location to display for main horizontal map ${JSON.stringify(nearbyOffersResult)}`);
                    return nearbyOffers;
                }
            } else {
                console.log(`Unexpected error while retrieving offers near user's home location for main horizontal map ${JSON.stringify(nearbyOffersResult)}`);
                return nearbyOffers;
            }
        }
    } catch (error) {
        console.log(`Unexpected error while attempting to retrieve offers near user's home location for main horizontal map ${JSON.stringify(error)} ${error}`);
        return nearbyOffers;
    }
}

/**
 * Function used to retrieve the list of offers nearby, that we will use
 * for background loading purposes.
 *
 * @param pageNumber parameter specifying a page number that we will get the nearby locations
 * from
 * @param setPageNumber setter or updater used to update the page number.
 * @param premierPageNumber parameter specifying a page number that we will get the premier nearby locations
 * from
 * @param setPremierPageNumber setter or updater used to update the premier page number.
 * @param userInformation user information to be passed in, in case we need to fall back the
 * offers near a user's home location.
 * @param setOffersNearUserLocationFlag setter or updated used to update the flag indicating whether
 * the nearby offers are based on a user's geolocation or their home address.
 * @param marketplaceCache the marketplace cache to be passed in
 * @param currentUserLocation the current location object of the user
 * @param setCurrentUserLocation setter or updates used to update the current user location if needed
 * @param totalNumberOfOffersAvailable parameter specifying the total number of offers available within 25 miles
 * of the user.
 * @param setTotalNumberOfOffersAvailable setter or updates used to update the total number of offers available
 * within 25 miles of the user.
 *
 * @returns a {@link Promise} of an {@link Array} of {@link Offer}, since this function
 * will be used to get the list of offers nearby.
 */
export const retrieveOffersNearby = async (pageNumber: number, setPageNumber: SetterOrUpdater<number>,
                                           premierPageNumber: number, setPremierPageNumber: SetterOrUpdater<number>,
                                           userInformation: any, setOffersNearUserLocationFlag: SetterOrUpdater<boolean>,
                                           marketplaceCache: typeof Cache | null,
                                           currentUserLocation: LocationObject | null,
                                           setCurrentUserLocation: SetterOrUpdater<LocationObject | null>,
                                           totalNumberOfOffersAvailable: number, setTotalNumberOfOffersAvailable: SetterOrUpdater<number>): Promise<Offer[] | null> => {
    // result to return
    let nearbyOffers: Offer[] = [];

    try {
        // first retrieve the necessary permissions for location purposes
        const foregroundPermissionStatus = await Location.requestForegroundPermissionsAsync();
        if (foregroundPermissionStatus.status !== 'granted') {
            const errorMessage = `Permission to access location was not granted!`;
            console.log(errorMessage);

            return null;
        } else {
            if (currentUserLocation === null) {
                const lastKnownPositionAsync: LocationObject | null = await Location.getLastKnownPositionAsync();
                setCurrentUserLocation(lastKnownPositionAsync !== null ? lastKnownPositionAsync : await Location.getCurrentPositionAsync());
            }

            // first retrieve the latitude and longitude of the current user
            if (currentUserLocation !== null && currentUserLocation.coords && currentUserLocation.coords.latitude && currentUserLocation.coords.longitude) {
                // call the getOffers API
                const nearbyOffersResult = await API.graphql(graphqlOperation(getOffers, {
                    getOffersInput: {
                        availability: OfferAvailability.Global,
                        countryCode: CountryCode.Us,
                        filterType: OfferFilter.Nearby,
                        offerStates: [OfferState.Active, OfferState.Scheduled],
                        pageNumber: pageNumber,
                        pageSize: premierPageNumber === 1 ? 5 : 15, // for the first time load 5 and then load 15 at a time
                        radiusIncludeOnlineStores: false, // do not include online offers in nearby offers list
                        radius: 50000, // radius of 50 km (50,000 meters) roughly equal to 25 miles
                        radiusLatitude: currentUserLocation.coords.latitude,
                        radiusLongitude: currentUserLocation.coords.longitude,
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
                        // increase the page number according to whether it's the first time loading these offers or not
                        premierPageNumber === 1
                            ? setPremierPageNumber(premierPageNumber + 1)
                            : setPageNumber(pageNumber + 1);
                        // set the total number of offers available within 25 miles of the user, if not previously set
                        totalNumberOfOffersAvailable !== responseData.getOffers.data.totalNumberOfRecords &&
                        setTotalNumberOfOffersAvailable(responseData.getOffers.data.totalNumberOfRecords);
                        // retrieve the array of nearby offers from the API call
                        return nearbyOffers;
                    } else {
                        console.log(`No nearby offers to display ${JSON.stringify(nearbyOffersResult)}`);
                        // fall back to offers near their home address
                        return userInformation["address"] && userInformation["address"]["formatted"]
                            ? await retrieveOffersNearLocation(userInformation["address"]["formatted"], pageNumber,
                                setPageNumber, premierPageNumber, setPremierPageNumber, setOffersNearUserLocationFlag, marketplaceCache, userInformation,
                                totalNumberOfOffersAvailable, setTotalNumberOfOffersAvailable)
                            : nearbyOffers;
                    }
                } else {
                    console.log(`Unexpected error while retrieving nearby offers ${JSON.stringify(nearbyOffersResult)}`);
                    return nearbyOffers;
                }
            } else {
                console.log(`Unable to retrieve the current user's location coordinates!`);
                return nearbyOffers;
            }
        }
    } catch (error) {
        console.log(`Unexpected error while attempting to retrieve nearby offers ${JSON.stringify(error)} ${error}`);

        // @ts-ignore
        if (!error.code && (error.code !== 'ERR_LOCATION_INFO_PLIST' || error.code !== 'E_LOCATION_UNAVAILABLE')) {
            return nearbyOffers;
        } else {
            // fall back to offers near their home address
            return userInformation["address"] && userInformation["address"]["formatted"]
                ? await retrieveOffersNearLocation(userInformation["address"]["formatted"], pageNumber,
                    setPageNumber, premierPageNumber, setPremierPageNumber, setOffersNearUserLocationFlag, marketplaceCache, userInformation,
                    totalNumberOfOffersAvailable, setTotalNumberOfOffersAvailable)
                : nearbyOffers;
        }
    }
}

/**
 * Function used to retrieve the list of offers near the user's home location,
 * that we will use either for caching and/or for background loading purposes.
 *
 * @param address user's home location that we wil use to retrieve offers near location
 * @param pageNumber optional parameter specifying a page number that we will get the locations
 * near offers from, in case we are not using this for caching purposes
 * @param setPageNumber setter or updater used to update the page number, if passed in.
 * @param premierPageNumber parameter specifying a page number that we will get the premier nearby locations
 * from
 * @param setPremierPageNumber setter or updater used to update the premier page number.
 * @param setOffersNearUserLocationFlag optional setter or updated used to update the flag indicating whether
 * the nearby offers are based on a user's geolocation or their home address.
 * @param marketplaceCache optional marketplace cache to be passed in
 * @param userInformation relevant user information
 * @param totalNumberOfOffersAvailable parameter specifying the total number of offers available within 25 miles
 * of the user.
 * @param setTotalNumberOfOffersAvailable setter or updates used to update the total number of offers available
 * within 25 miles of the user.
 *
 * @returns a {@link Promise} of an {@link Array} of {@link Offer}, since this function will
 * be used to get the list of offers near the user's home location.
 */
const retrieveOffersNearLocation = async (address: string, pageNumber: number, setPageNumber: SetterOrUpdater<number>,
                                          premierPageNumber: number, setPremierPageNumber: SetterOrUpdater<number>,
                                          setOffersNearUserLocationFlag: SetterOrUpdater<boolean>,
                                          marketplaceCache: typeof Cache | null, userInformation: any,
                                          totalNumberOfOffersAvailable: number, setTotalNumberOfOffersAvailable: SetterOrUpdater<number>): Promise<Offer[]> => {
    // result to return
    let nearbyOffers: Offer[] = [];

    try {
        // check to see if we already have these offers cached, for the first page, if we do retrieve them from cache instead
        if (pageNumber === 1 && marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-offerNearUserHome`) !== null) {
            console.log('offers near user home are cached');

            // increase the page number, if needed
            setPageNumber(pageNumber + 1);

            // set the nearby user location flag
            setOffersNearUserLocationFlag(true);

            return await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-offerNearUserHome`);
        } else {
            console.log('offers near user home are not cached, or page number is not 1');
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
                        pageNumber: pageNumber !== undefined ? pageNumber : 1, // cache the first page only, otherwise retrieve the appropriate page number
                        pageSize: premierPageNumber === 1 ? 5 : 15, // for the first time load 5 and then load 15 at a time
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
                        // if the page number is 1, then cache the first page of offers near user home
                        pageNumber === 1 && marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-offerNearUserHome`, nearbyOffers);

                        // increase the page number according to whether it's the first time loading these offers or not
                        premierPageNumber === 1
                            ? setPremierPageNumber(premierPageNumber + 1)
                            : setPageNumber(pageNumber + 1);

                        // set the nearby user location flag
                        setOffersNearUserLocationFlag(true);

                        // set the total number of offers available within 25 miles of the user, if not previously set
                        totalNumberOfOffersAvailable !== responseData.getOffers.data.totalNumberOfRecords &&
                        setTotalNumberOfOffersAvailable(responseData.getOffers.data.totalNumberOfRecords);

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
        }
    } catch (error) {
        console.log(`Unexpected error while attempting to retrieve offers near user's home location ${JSON.stringify(error)} ${error}`);
        return nearbyOffers;
    }
}

/**
 * Function used to retrieve the list of categorized offers nearby, that we will use
 * for background loading purposes.
 *
 * @param pageNumber parameter specifying a page number that we will get the nearby locations
 * from
 * @param setPageNumber setter or updater used to update the page number.
 * @param userInformation user information to be passed in, in case we need to fall back the
 * offers near a user's home location.
 * @param setOffersNearUserLocationFlag setter or updated used to update the flag indicating whether
 * the nearby offers are based on a user's geolocation or their home address.
 * @param currentUserLocation the current location object of the user
 * @param setCurrentUserLocation setter or updates used to update the current user location if needed
 * @param totalNumberOfOffersAvailable parameter specifying the total number of offers available within 25 miles
 * of the user.
 * @param setTotalNumberOfOffersAvailable setter or updates used to update the total number of offers available
 * within 25 miles of the user.
 * @param offerCategory category of offers to retrieve.
 *
 * @returns a {@link Promise} of an {@link Array} of {@link Offer}, since this function
 * will be used to get the list of categorized offers nearby.
 */
export const retrieveCategorizedOffersNearby = async (pageNumber: number, setPageNumber: SetterOrUpdater<number>,
                                                      userInformation: any, setOffersNearUserLocationFlag: SetterOrUpdater<boolean>,
                                                      currentUserLocation: LocationObject | null, setCurrentUserLocation: SetterOrUpdater<LocationObject | null>,
                                                      totalNumberOfOffersAvailable: number, setTotalNumberOfOffersAvailable: SetterOrUpdater<number>,
                                                      offerCategory: OfferCategory): Promise<Offer[] | null> => {
    // result to return
    let nearbyOffers: Offer[] = [];

    try {
        // first retrieve the necessary permissions for location purposes
        const foregroundPermissionStatus = await Location.requestForegroundPermissionsAsync();
        if (foregroundPermissionStatus.status !== 'granted') {
            const errorMessage = `Permission to access location was not granted!`;
            console.log(errorMessage);

            return null;
        } else {
            if (currentUserLocation === null) {
                const lastKnownPositionAsync: LocationObject | null = await Location.getLastKnownPositionAsync();
                setCurrentUserLocation(lastKnownPositionAsync !== null ? lastKnownPositionAsync : await Location.getCurrentPositionAsync());
            }

            // first retrieve the latitude and longitude of the current user
            if (currentUserLocation !== null && currentUserLocation.coords && currentUserLocation.coords.latitude && currentUserLocation.coords.longitude) {
                // call the getOffers API
                const nearbyOffersResult = await API.graphql(graphqlOperation(getOffers, {
                    getOffersInput: {
                        availability: OfferAvailability.Global,
                        countryCode: CountryCode.Us,
                        filterType: OfferFilter.CategorizedNearby,
                        offerStates: [OfferState.Active, OfferState.Scheduled],
                        pageNumber: pageNumber,
                        pageSize: 15, // load 15 offers at a time
                        radiusIncludeOnlineStores: false, // do not include online offers in nearby categorized offers list
                        radius: 50000, // radius of 50 km (50,000 meters) roughly equal to 25 miles
                        radiusLatitude: currentUserLocation.coords.latitude,
                        radiusLongitude: currentUserLocation.coords.longitude,
                        redemptionType: RedemptionType.Cardlinked,
                        offerCategory: offerCategory
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
                        // increase the page number according to whether it's the first time loading these offers or not
                        setPageNumber(pageNumber + 1);
                        // set the total number of offers available within 25 miles of the user, if not previously set
                        totalNumberOfOffersAvailable !== responseData.getOffers.data.totalNumberOfRecords &&
                        setTotalNumberOfOffersAvailable(responseData.getOffers.data.totalNumberOfRecords);
                        // retrieve the array of nearby offers from the API call
                        return nearbyOffers;
                    } else {
                        console.log(`No nearby categorized offers to display for category ${offerCategory} ${JSON.stringify(nearbyOffersResult)}`);
                        // fall back to offers near their home address
                        return userInformation["address"] && userInformation["address"]["formatted"]
                            ? await retrieveCategorizedOffersNearLocation(userInformation["address"]["formatted"], pageNumber,
                                setPageNumber, setOffersNearUserLocationFlag, totalNumberOfOffersAvailable,
                                setTotalNumberOfOffersAvailable, offerCategory)
                            : nearbyOffers;
                    }
                } else {
                    console.log(`Unexpected error while retrieving nearby categorized offers for category ${offerCategory} ${JSON.stringify(nearbyOffersResult)}`);
                    return nearbyOffers;
                }
            } else {
                console.log(`Unable to retrieve the current user's location coordinates!`);
                return nearbyOffers;
            }
        }
    } catch (error) {
        console.log(`Unexpected error while attempting to retrieve categorized nearby offers for category ${offerCategory} ${JSON.stringify(error)} ${error}`);

        // @ts-ignore
        if (!error.code && (error.code !== 'ERR_LOCATION_INFO_PLIST' || error.code !== 'E_LOCATION_UNAVAILABLE')) {
            return nearbyOffers;
        } else {
            // fall back to offers near their home address
            return userInformation["address"] && userInformation["address"]["formatted"]
                ? await retrieveCategorizedOffersNearLocation(userInformation["address"]["formatted"], pageNumber,
                    setPageNumber, setOffersNearUserLocationFlag, totalNumberOfOffersAvailable,
                    setTotalNumberOfOffersAvailable, offerCategory)
                : nearbyOffers;
        }
    }
}

/**
 * Function used to retrieve the list of categorized offers near the user's home location,
 * that we will use either for caching and/or for background loading purposes.
 *
 * @param address user's home location that we wil use to retrieve offers near location
 * @param pageNumber optional parameter specifying a page number that we will get the locations
 * near offers from, in case we are not using this for caching purposes
 * @param setPageNumber setter or updater used to update the page number, if passed in.
 * @param setOffersNearUserLocationFlag optional setter or updated used to update the flag indicating whether
 * the nearby offers are based on a user's geolocation or their home address.
 * @param totalNumberOfOffersAvailable parameter specifying the total number of offers available within 25 miles
 * of the user.
 * @param setTotalNumberOfOffersAvailable setter or updates used to update the total number of offers available
 * within 25 miles of the user.
 * @param offerCategory category of offers to retrieve.
 *
 * @returns a {@link Promise} of an {@link Array} of {@link Offer}, since this function will
 * be used to get the list of categorized offers near the user's home location.
 */
const retrieveCategorizedOffersNearLocation = async (address: string, pageNumber: number, setPageNumber: SetterOrUpdater<number>,
                                                     setOffersNearUserLocationFlag: SetterOrUpdater<boolean>,
                                                     totalNumberOfOffersAvailable: number, setTotalNumberOfOffersAvailable: SetterOrUpdater<number>,
                                                     offerCategory: OfferCategory): Promise<Offer[]> => {
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
                    filterType: OfferFilter.CategorizedNearby,
                    offerStates: [OfferState.Active, OfferState.Scheduled],
                    pageNumber: pageNumber,
                    pageSize: 15, // load 15 offers at a time
                    radiusIncludeOnlineStores: false, // do not include online offers in nearby offers list
                    radius: 50000, // radius of 50 km (50,000 meters) roughly equal to 25 miles
                    radiusLatitude: geoLocation.latitude,
                    radiusLongitude: geoLocation.longitude,
                    redemptionType: RedemptionType.Cardlinked,
                    offerCategory: offerCategory
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
                    // increase the page number according to whether it's the first time loading these offers or not
                    setPageNumber(pageNumber + 1);

                    // set the nearby user location flag
                    setOffersNearUserLocationFlag(true);

                    // set the total number of offers available within 25 miles of the user, if not previously set
                    totalNumberOfOffersAvailable !== responseData.getOffers.data.totalNumberOfRecords &&
                    setTotalNumberOfOffersAvailable(responseData.getOffers.data.totalNumberOfRecords);

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
