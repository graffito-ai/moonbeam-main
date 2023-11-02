import React, {useEffect, useState} from "react";
import {AuthenticationProps} from "../../../models/props/RootProps";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {AuthenticationStackParamList} from "../../../models/props/AuthenticationProps";
import {IconButton, Text} from "react-native-paper";
import {SignInComponent} from "./SignInComponent";
import {RegistrationComponent} from "./registration/RegistrationComponent";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    accountCreationDisclaimerCheckState,
    addressCityState,
    addressLineState,
    addressStateState,
    addressZipState,
    amplifySignUpProcessErrorsState,
    birthdayState,
    currentUserInformation,
    dutyStatusValueState,
    emailState,
    enlistingYearState,
    expoPushTokenState,
    firstNameState,
    globalAmplifyCacheState,
    initialAuthenticationScreen,
    isLoadingAppOverviewNeededState,
    isReadyRegistrationState,
    lastNameState,
    mainRootNavigationState,
    marketplaceAmplifyCacheState,
    militaryBranchValueState,
    phoneNumberState,
    registrationBackButtonShown,
    registrationConfirmationPasswordState,
    registrationMainErrorState,
    registrationPasswordState,
    registrationStepNumber
} from '../../../recoil/AuthAtom';
import {AccountRecoveryComponent} from "./AccountRecoveryComponent";
import {TouchableOpacity, View} from "react-native";
import {commonStyles} from "../../../styles/common.module";
import {AppDrawer} from "../drawer/AppDrawer";
import {DocumentsViewer} from "../../common/DocumentsViewer";
import * as SMS from "expo-sms";
import {styles} from "../../../styles/registration.module";
import {
    retrieveCategorizedOffersNearby,
    retrieveCategorizedOnlineOffersList,
    retrieveFidelisPartnerList,
    retrieveOffersNearby,
    retrieveOffersNearbyForMap,
    retrieveOnlineOffersList,
    retrievePremierOffersNearby,
    retrievePremierOnlineOffersList,
    updateUserAuthStat
} from "../../../utils/AppSync";
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {OfferCategory, PremierOnlineProdOfferIds, Stages, UserAuthSessionResponse} from "@moonbeam/moonbeam-models";
import {currentUserLocationState, firstTimeLoggedInState} from "../../../recoil/RootAtom";
import * as envInfo from "../../../../local-env-info.json";
import {
    locationServicesButtonState,
    nearbyElectronicsCategorizedOffersListState,
    nearbyElectronicsCategorizedOffersPageNumberState,
    nearbyEntertainmentCategorizedOffersListState,
    nearbyEntertainmentCategorizedOffersPageNumberState,
    nearbyFoodCategorizedOffersListState,
    nearbyFoodCategorizedOffersPageNumberState,
    nearbyHealthAndBeautyCategorizedOffersListState,
    nearbyHealthAndBeautyCategorizedOffersPageNumberState,
    nearbyHomeCategorizedOffersListState,
    nearbyHomeCategorizedOffersPageNumberState,
    nearbyOffersListForFullScreenMapState,
    nearbyOffersListForMainHorizontalMapState,
    nearbyOffersListState,
    nearbyOffersPageNumberState,
    nearbyOfficeAndBusinessCategorizedOffersListState,
    nearbyOfficeAndBusinessCategorizedOffersPageNumberState,
    nearbyRetailCategorizedOffersListState,
    nearbyRetailCategorizedOffersPageNumberState,
    nearbyServicesAndSubscriptionsCategorizedOffersListState,
    nearbyServicesAndSubscriptionsCategorizedOffersPageNumberState,
    noNearbyElectronicsCategorizedOffersToLoadState,
    noNearbyEntertainmentCategorizedOffersToLoadState,
    noNearbyFoodCategorizedOffersToLoadState,
    noNearbyHealthAndBeautyCategorizedOffersToLoadState,
    noNearbyHomeCategorizedOffersToLoadState,
    noNearbyOffersToLoadState,
    noNearbyOfficeAndBusinessCategorizedOffersToLoadState,
    noNearbyRetailCategorizedOffersToLoadState,
    noNearbyServicesAndSubscriptionsCategorizedOffersToLoadState,
    noOnlineElectronicsCategorizedOffersToLoadState,
    noOnlineEntertainmentCategorizedOffersToLoadState,
    noOnlineFoodCategorizedOffersToLoadState,
    noOnlineHealthAndBeautyCategorizedOffersToLoadState,
    noOnlineHomeCategorizedOffersToLoadState,
    noOnlineOffersToLoadState,
    noOnlineOfficeAndBusinessCategorizedOffersToLoadState,
    noOnlineRetailCategorizedOffersToLoadState,
    noOnlineServicesAndSubscriptionsCategorizedOffersToLoadState,
    noOnlineVeteransDayCategorizedOffersToLoadState,
    numberOfElectronicsCategorizedOffersWithin25MilesState,
    numberOfElectronicsCategorizedOnlineOffersState,
    numberOfEntertainmentCategorizedOffersWithin25MilesState,
    numberOfEntertainmentCategorizedOnlineOffersState,
    numberOfFoodCategorizedOffersWithin25MilesState,
    numberOfFoodCategorizedOnlineOffersState,
    numberOfHealthAndBeautyCategorizedOffersWithin25MilesState,
    numberOfHealthAndBeautyCategorizedOnlineOffersState,
    numberOfHomeCategorizedOffersWithin25MilesState,
    numberOfHomeCategorizedOnlineOffersState,
    numberOfOffersWithin25MilesState,
    numberOfOffersWithin5MilesState,
    numberOfOfficeAndBusinessCategorizedOffersWithin25MilesState,
    numberOfOfficeAndBusinessCategorizedOnlineOffersState,
    numberOfOnlineOffersState,
    numberOfRetailCategorizedOffersWithin25MilesState,
    numberOfRetailCategorizedOnlineOffersState,
    numberOfServicesAndSubscriptionsCategorizedOffersWithin25MilesState,
    numberOfServicesAndSubscriptionsCategorizedOnlineOffersState,
    numberOfVeteransDayCategorizedOnlineOffersState,
    offersNearUserLocationFlagState,
    onlineElectronicsCategorizedOfferListState,
    onlineElectronicsCategorizedOffersPageNumberState,
    onlineEntertainmentCategorizedOfferListState,
    onlineEntertainmentCategorizedOffersPageNumberState,
    onlineFoodCategorizedOfferListState,
    onlineFoodCategorizedOffersPageNumberState,
    onlineHealthAndBeautyCategorizedOfferListState,
    onlineHealthAndBeautyCategorizedOffersPageNumberState,
    onlineHomeCategorizedOfferListState,
    onlineHomeCategorizedOffersPageNumberState,
    onlineOffersListState,
    onlineOffersPageNumberState,
    onlineOfficeAndBusinessCategorizedOfferListState,
    onlineOfficeAndBusinessCategorizedOffersPageNumberState,
    onlineRetailCategorizedOfferListState,
    onlineRetailCategorizedOffersPageNumberState,
    onlineServicesAndSubscriptionsCategorizedOfferListState,
    onlineServicesAndSubscriptionsCategorizedOffersPageNumberState,
    onlineVeteransDayCategorizedOfferListState,
    onlineVeteransDayCategorizedOffersPageNumberState,
    premierNearbyOffersPageNumberState,
    premierOnlineOffersPageNumberState,
    reloadNearbyDueToPermissionsChangeState,
} from "../../../recoil/StoreOfferAtom";
import {registerListener, removeListener} from "../../../utils/AmplifyHub";
import * as Location from "expo-location";
import {LocationObject} from "expo-location";

/**
 * Authentication component.
 *
 * @constructor constructor for the component.
 */
export const AuthenticationComponent = ({route, navigation}: AuthenticationProps) => {
        // constants used to keep track of local component state
        const [checkedOnlineCache, setCheckOnlineCache] = useState<boolean>(false);
        const [checkedVeteransDayOnlineCache, setCheckVeteransDayOnlineCache] = useState<boolean>(false);
        const [checkedFoodOnlineCache, setCheckFoodOnlineCache] = useState<boolean>(false);
        const [checkedRetailOnlineCache, setCheckRetailOnlineCache] = useState<boolean>(false);
        const [checkedEntertainmentOnlineCache, setCheckEntertainmentOnlineCache] = useState<boolean>(false);
        const [checkedElectronicsOnlineCache, setCheckElectronicsOnlineCache] = useState<boolean>(false);
        const [checkedHomeOnlineCache, setCheckHomeOnlineCache] = useState<boolean>(false);
        const [checkedHealthAndBeautyOnlineCache, setCheckHealthAndBeautyOnlineCache] = useState<boolean>(false);
        const [checkedOfficeAndBusinessOnlineCache, setCheckOfficeAndBusinessOnlineCache] = useState<boolean>(false);
        const [checkedServicesAndSubscriptionsOnlineCache, setCheckServicesAndSubscriptionsOnlineCache] = useState<boolean>(false);
        const [userIsAuthenticated, setIsUserAuthenticated] = useState<boolean>(false);
        const [loadingNearbyOffersInProgress, setIsLoadingNearbyOffersInProgress] = useState<boolean>(false);
        const [loadingNearbyFoodCategorizedOffersInProgress, setIsLoadingNearbyFoodCategorizedOffersInProgress] = useState<boolean>(false);
        const [loadingNearbyRetailCategorizedOffersInProgress, setIsLoadingNearbyRetailCategorizedOffersInProgress] = useState<boolean>(false);
        const [loadingNearbyEntertainmentCategorizedOffersInProgress, setIsLoadingNearbyEntertainmentCategorizedOffersInProgress] = useState<boolean>(false);
        const [loadingNearbyElectronicsCategorizedOffersInProgress, setIsLoadingNearbyElectronicsCategorizedOffersInProgress] = useState<boolean>(false);
        const [loadingNearbyHomeCategorizedOffersInProgress, setIsLoadingNearbyHomeCategorizedOffersInProgress] = useState<boolean>(false);
        const [loadingNearbyHealthAndBeautyCategorizedOffersInProgress, setIsLoadingNearbyHealthAndBeautyCategorizedOffersInProgress] = useState<boolean>(false);
        const [loadingNearbyOfficeAndBusinessCategorizedOffersInProgress, setIsLoadingNearbyOfficeAndBusinessCategorizedOffersInProgress] = useState<boolean>(false);
        const [loadingNearbyServicesAndSubscriptionsCategorizedOffersInProgress, setIsLoadingNearbyServicesAndSubscriptionsCategorizedOffersInProgress] = useState<boolean>(false);
        const [loadingOnlineInProgress, setIsLoadingOnlineInProgress] = useState<boolean>(false);
        const [loadingOnlineVeteransDayCategorizedInProgress, setIsLoadingOnlineVeteransDayCategorizedInProgress] = useState<boolean>(false);
        const [loadingOnlineFoodCategorizedInProgress, setIsLoadingOnlineFoodCategorizedInProgress] = useState<boolean>(false);
        const [loadingOnlineRetailCategorizedInProgress, setIsLoadingOnlineRetailCategorizedInProgress] = useState<boolean>(false);
        const [loadingOnlineEntertainmentCategorizedInProgress, setIsLoadingOnlineEntertainmentCategorizedInProgress] = useState<boolean>(false);
        const [loadingOnlineElectronicsCategorizedInProgress, setIsLoadingOnlineElectronicsCategorizedInProgress] = useState<boolean>(false);
        const [loadingOnlineHomeCategorizedInProgress, setIsLoadingOnlineHomeCategorizedInProgress] = useState<boolean>(false);
        const [loadingOnlineHealthAndBeautyCategorizedInProgress, setIsLoadingOnlineHealthAndBeautyCategorizedInProgress] = useState<boolean>(false);
        const [loadingOnlineOfficeAndBusinessCategorizedInProgress, setIsLoadingOnlineOfficeAndBusinessCategorizedInProgress] = useState<boolean>(false);
        const [loadingOnlineServicesAndSubscriptionsCategorizedInProgress, setIsLoadingOnlineServicesAndSubscriptionsCategorizedInProgress] = useState<boolean>(false);
        const [noPremierOnlineOffersToLoad, setNoPremierOnlineOffersToLoad] = useState<boolean>(false);
        const [loadingNearbyOffersForHorizontalMapInProgress, setIsLoadingNearbyOffersForHorizontalMapInProgress] = useState<boolean>(false);
        const [areOffersForMainHorizontalMapLoaded, setAreOffersForMainHorizontalMapLoaded] = useState<boolean>(false);
        const [loadingNearbyOffersForFullScreenMapInProgress, setIsLoadingNearbyOffersForFullScreenMapInProgress] = useState<boolean>(false);
        const [areOffersForFullScreenMapLoaded, setAreOffersForFullScreenMapLoaded] = useState<boolean>(false);
        // constants used to keep track of shared states
        const [numberOfOnlineOffers, setNumberOfOnlineOffers] = useRecoilState(numberOfOnlineOffersState);
        const [numberOfVeteransDayCategorizedOnlineOffers, setNumberOfVeteransDayCategorizedOnlineOffers] = useRecoilState(numberOfVeteransDayCategorizedOnlineOffersState);
        const [numberOfFoodCategorizedOnlineOffers, setNumberOfFoodCategorizedOnlineOffers] = useRecoilState(numberOfFoodCategorizedOnlineOffersState);
        const [numberOfRetailCategorizedOnlineOffers, setNumberOfRetailCategorizedOnlineOffers] = useRecoilState(numberOfRetailCategorizedOnlineOffersState);
        const [numberOfEntertainmentCategorizedOnlineOffers, setNumberOfEntertainmentCategorizedOnlineOffers] = useRecoilState(numberOfEntertainmentCategorizedOnlineOffersState);
        const [numberOfElectronicsCategorizedOnlineOffers, setNumberOfElectronicsCategorizedOnlineOffers] = useRecoilState(numberOfElectronicsCategorizedOnlineOffersState);
        const [numberOfHomeCategorizedOnlineOffers, setNumberOfHomeCategorizedOnlineOffers] = useRecoilState(numberOfHomeCategorizedOnlineOffersState);
        const [numberOfHealthAndBeautyCategorizedOnlineOffers, setNumberOfHealthAndBeautyCategorizedOnlineOffers] = useRecoilState(numberOfHealthAndBeautyCategorizedOnlineOffersState);
        const [numberOfOfficeAndBusinessCategorizedOnlineOffers, setNumberOfOfficeAndBusinessCategorizedOnlineOffers] = useRecoilState(numberOfOfficeAndBusinessCategorizedOnlineOffersState);
        const [numberOfServicesAndSubscriptionsCategorizedOnlineOffers, setNumberOfServicesAndSubscriptionsCategorizedOnlineOffers] = useRecoilState(numberOfServicesAndSubscriptionsCategorizedOnlineOffersState);
        const [numberOfOffersWithin5Miles, setNumberOfOffersWithin5Miles] = useRecoilState(numberOfOffersWithin5MilesState);
        const [numberOfOffersWithin25Miles, setNumberOfOffersWithin25Miles] = useRecoilState(numberOfOffersWithin25MilesState);
        const [numberOfFoodCategorizedOffersWithin25Miles, setNumberOfFoodCategorizedOffersWithin25Miles] = useRecoilState(numberOfFoodCategorizedOffersWithin25MilesState);
        const [numberOfRetailCategorizedOffersWithin25Miles, setNumberOfRetailCategorizedOffersWithin25Miles] = useRecoilState(numberOfRetailCategorizedOffersWithin25MilesState);
        const [numberOfEntertainmentCategorizedOffersWithin25Miles, setNumberOfEntertainmentCategorizedOffersWithin25Miles] = useRecoilState(numberOfEntertainmentCategorizedOffersWithin25MilesState);
        const [numberOfElectronicsCategorizedOffersWithin25Miles, setNumberOfElectronicsCategorizedOffersWithin25Miles] = useRecoilState(numberOfElectronicsCategorizedOffersWithin25MilesState);
        const [numberOfHomeCategorizedOffersWithin25Miles, setNumberOfHomeCategorizedOffersWithin25Miles] = useRecoilState(numberOfHomeCategorizedOffersWithin25MilesState);
        const [numberOfHealthAndBeautyCategorizedOffersWithin25Miles, setNumberOfHealthAndBeautyCategorizedOffersWithin25Miles] = useRecoilState(numberOfHealthAndBeautyCategorizedOffersWithin25MilesState);
        const [numberOfOfficeAndBusinessCategorizedOffersWithin25Miles, setNumberOfOfficeAndBusinessCategorizedOffersWithin25Miles] = useRecoilState(numberOfOfficeAndBusinessCategorizedOffersWithin25MilesState);
        const [numberOfServicesAndSubscriptionsCategorizedOffersWithin25Miles, setNumberOfServicesAndSubscriptionsCategorizedOffersWithin25Miles] = useRecoilState(numberOfServicesAndSubscriptionsCategorizedOffersWithin25MilesState);
        const [currentUserLocation, setCurrentUserLocation] = useRecoilState(currentUserLocationState);
        const [nearbyOffersPageNumber, setNearbyOffersPageNumber] = useRecoilState(nearbyOffersPageNumberState);
        const [nearbyFoodCategorizedOffersPageNumber, setNearbyFoodCategorizedOffersPageNumber] = useRecoilState(nearbyFoodCategorizedOffersPageNumberState);
        const [nearbyRetailCategorizedOffersPageNumber, setNearbyRetailCategorizedOffersPageNumber] = useRecoilState(nearbyRetailCategorizedOffersPageNumberState);
        const [nearbyEntertainmentCategorizedOffersPageNumber, setNearbyEntertainmentCategorizedOffersPageNumber] = useRecoilState(nearbyEntertainmentCategorizedOffersPageNumberState);
        const [nearbyElectronicsCategorizedOffersPageNumber, setNearbyElectronicsCategorizedOffersPageNumber] = useRecoilState(nearbyElectronicsCategorizedOffersPageNumberState);
        const [nearbyHomeCategorizedOffersPageNumber, setNearbyHomeCategorizedOffersPageNumber] = useRecoilState(nearbyHomeCategorizedOffersPageNumberState);
        const [nearbyHealthAndBeautyCategorizedOffersPageNumber, setNearbyHealthAndBeautyCategorizedOffersPageNumber] = useRecoilState(nearbyHealthAndBeautyCategorizedOffersPageNumberState);
        const [nearbyOfficeAndBusinessCategorizedOffersPageNumber, setNearbyOfficeAndBusinessCategorizedOffersPageNumber] = useRecoilState(nearbyOfficeAndBusinessCategorizedOffersPageNumberState);
        const [nearbyServicesAndSubscriptionsCategorizedOffersPageNumber, setNearbyServicesAndSubscriptionsCategorizedOffersPageNumber] = useRecoilState(nearbyServicesAndSubscriptionsCategorizedOffersPageNumberState);
        const [premierNearbyOffersPageNumber, setPremierNearbyOffersPageNumber] = useRecoilState(premierNearbyOffersPageNumberState);
        const [onlineOffersPageNumber, setOnlineOffersPageNumber] = useRecoilState(onlineOffersPageNumberState);
        const [onlineVeteransDayCategorizedOffersPageNumber, setOnlineVeteransDayCategorizedOffersPageNumber] = useRecoilState(onlineVeteransDayCategorizedOffersPageNumberState);
        const [onlineFoodCategorizedOffersPageNumber, setOnlineFoodCategorizedOffersPageNumber] = useRecoilState(onlineFoodCategorizedOffersPageNumberState);
        const [onlineRetailCategorizedOffersPageNumber, setOnlineRetailCategorizedOffersPageNumber] = useRecoilState(onlineRetailCategorizedOffersPageNumberState);
        const [onlineEntertainmentCategorizedOffersPageNumber, setOnlineEntertainmentCategorizedOffersPageNumber] = useRecoilState(onlineEntertainmentCategorizedOffersPageNumberState);
        const [onlineElectronicsCategorizedOffersPageNumber, setOnlineElectronicsCategorizedOffersPageNumber] = useRecoilState(onlineElectronicsCategorizedOffersPageNumberState);
        const [onlineHomeCategorizedOffersPageNumber, setOnlineHomeCategorizedOffersPageNumber] = useRecoilState(onlineHomeCategorizedOffersPageNumberState);
        const [onlineHealthAndBeautyCategorizedOffersPageNumber, setOnlineHealthAndBeautyCategorizedOffersPageNumber] = useRecoilState(onlineHealthAndBeautyCategorizedOffersPageNumberState);
        const [onlineOfficeAndBusinessCategorizedOffersPageNumber, setOnlineOfficeAndBusinessCategorizedOffersPageNumber] = useRecoilState(onlineOfficeAndBusinessCategorizedOffersPageNumberState);
        const [onlineServicesAndSubscriptionsCategorizedOffersPageNumber, setOnlineServicesAndSubscriptionsCategorizedOffersPageNumber] = useRecoilState(onlineServicesAndSubscriptionsCategorizedOffersPageNumberState);
        const [premierOnlineOffersPageNumber, setPremierOnlineOffersPageNumber] = useRecoilState(premierOnlineOffersPageNumberState);
        const [noOnlineOffersToLoad, setNoOnlineOffersToLoad] = useRecoilState(noOnlineOffersToLoadState);
        const [noOnlineVeteransDayCategorizedOffersToLoad, setNoOnlineVeteransDayCategorizedOffersToLoad] = useRecoilState(noOnlineVeteransDayCategorizedOffersToLoadState);
        const [noOnlineFoodCategorizedOffersToLoad, setNoOnlineFoodCategorizedOffersToLoad] = useRecoilState(noOnlineFoodCategorizedOffersToLoadState);
        const [noOnlineRetailCategorizedOffersToLoad, setNoOnlineRetailCategorizedOffersToLoad] = useRecoilState(noOnlineRetailCategorizedOffersToLoadState);
        const [noOnlineEntertainmentCategorizedOffersToLoad, setNoOnlineEntertainmentCategorizedOffersToLoad] = useRecoilState(noOnlineEntertainmentCategorizedOffersToLoadState);
        const [noOnlineElectronicsCategorizedOffersToLoad, setNoOnlineElectronicsCategorizedOffersToLoad] = useRecoilState(noOnlineElectronicsCategorizedOffersToLoadState);
        const [noOnlineHomeCategorizedOffersToLoad, setNoOnlineHomeCategorizedOffersToLoad] = useRecoilState(noOnlineHomeCategorizedOffersToLoadState);
        const [noOnlineHealthAndBeautyCategorizedOffersToLoad, setNoOnlineHealthAndBeautyCategorizedOffersToLoad] = useRecoilState(noOnlineHealthAndBeautyCategorizedOffersToLoadState);
        const [noOnlineOfficeAndBusinessCategorizedOffersToLoad, setNoOnlineOfficeAndBusinessCategorizedOffersToLoad] = useRecoilState(noOnlineOfficeAndBusinessCategorizedOffersToLoadState);
        const [noOnlineServicesAndSubscriptionsCategorizedOffersToLoad, setNoOnlineServicesAndSubscriptionsCategorizedOffersToLoad] = useRecoilState(noOnlineServicesAndSubscriptionsCategorizedOffersToLoadState);
        const [noNearbyOffersToLoad, setNoNearbyOffersToLoad] = useRecoilState(noNearbyOffersToLoadState);
        const [noNearbyFoodCategorizedOffersToLoad, setNoNearbyFoodCategorizedOffersToLoad] = useRecoilState(noNearbyFoodCategorizedOffersToLoadState);
        const [noNearbyRetailCategorizedOffersToLoad, setNoNearbyRetailCategorizedOffersToLoad] = useRecoilState(noNearbyRetailCategorizedOffersToLoadState);
        const [noNearbyEntertainmentCategorizedOffersToLoad, setNoNearbyEntertainmentCategorizedOffersToLoad] = useRecoilState(noNearbyEntertainmentCategorizedOffersToLoadState);
        const [noNearbyElectronicsCategorizedOffersToLoad, setNoNearbyElectronicsCategorizedOffersToLoad] = useRecoilState(noNearbyElectronicsCategorizedOffersToLoadState);
        const [noNearbyHomeCategorizedOffersToLoad, setNoNearbyHomeCategorizedOffersToLoad] = useRecoilState(noNearbyHomeCategorizedOffersToLoadState);
        const [noNearbyHealthAndBeautyCategorizedOffersToLoad, setNoNearbyHealthAndBeautyCategorizedOffersToLoad] = useRecoilState(noNearbyHealthAndBeautyCategorizedOffersToLoadState);
        const [noNearbyOfficeAndBusinessCategorizedOffersToLoad, setNoNearbyOfficeAndBusinessCategorizedOffersToLoad] = useRecoilState(noNearbyOfficeAndBusinessCategorizedOffersToLoadState);
        const [noNearbyServicesAndSubscriptionsCategorizedOffersToLoad, setNoNearbyServicesAndSubscriptionsCategorizedOffersToLoad] = useRecoilState(noNearbyServicesAndSubscriptionsCategorizedOffersToLoadState);
        const [, setOffersNearUserLocationFlag] = useRecoilState(offersNearUserLocationFlagState);
        const [reloadNearbyDueToPermissionsChange, setReloadNearbyDueToPermissionsChange] = useRecoilState(reloadNearbyDueToPermissionsChangeState);
        const [, setLocationServicesButtonState] = useRecoilState(locationServicesButtonState);
        const [nearbyOffersListForMainHorizontalMap, setNearbyOffersListForMainHorizontalMap] = useRecoilState(nearbyOffersListForMainHorizontalMapState);
        const [nearbyOffersListForFullScreenMap, setNearbyOffersListForFullScreenMap] = useRecoilState(nearbyOffersListForFullScreenMapState);
        const [nearbyOfferList, setNearbyOfferList] = useRecoilState(nearbyOffersListState);
        const [nearbyFoodCategorizedOfferList, setNearbyFoodCategorizedOfferList] = useRecoilState(nearbyFoodCategorizedOffersListState);
        const [nearbyRetailCategorizedOfferList, setNearbyRetailCategorizedOfferList] = useRecoilState(nearbyRetailCategorizedOffersListState);
        const [nearbyEntertainmentCategorizedOfferList, setNearbyEntertainmentCategorizedOfferList] = useRecoilState(nearbyEntertainmentCategorizedOffersListState);
        const [nearbyElectronicsCategorizedOfferList, setNearbyElectronicsCategorizedOfferList] = useRecoilState(nearbyElectronicsCategorizedOffersListState);
        const [nearbyHomeCategorizedOfferList, setNearbyHomeCategorizedOfferList] = useRecoilState(nearbyHomeCategorizedOffersListState);
        const [nearbyHealthAndBeautyCategorizedOfferList, setNearbyHealthAndBeautyCategorizedOfferList] = useRecoilState(nearbyHealthAndBeautyCategorizedOffersListState);
        const [nearbyOfficeAndBusinessCategorizedOfferList, setNearbyOfficeAndBusinessCategorizedOfferList] = useRecoilState(nearbyOfficeAndBusinessCategorizedOffersListState);
        const [nearbyServicesAndSubscriptionsCategorizedOfferList, setNearbyServicesAndSubscriptionsCategorizedOfferList] = useRecoilState(nearbyServicesAndSubscriptionsCategorizedOffersListState);
        const [onlineOfferList, setOnlineOfferList] = useRecoilState(onlineOffersListState);
        const [onlineVeteransDayCategorizedOfferList, setOnlineVeteransDayCategorizedOfferList] = useRecoilState(onlineVeteransDayCategorizedOfferListState);
        const [onlineFoodCategorizedOfferList, setOnlineFoodCategorizedOfferList] = useRecoilState(onlineFoodCategorizedOfferListState);
        const [onlineRetailCategorizedOfferList, setOnlineRetailCategorizedOfferList] = useRecoilState(onlineRetailCategorizedOfferListState);
        const [onlineEntertainmentCategorizedOfferList, setOnlineEntertainmentCategorizedOfferList] = useRecoilState(onlineEntertainmentCategorizedOfferListState);
        const [onlineElectronicsCategorizedOfferList, setOnlineElectronicsCategorizedOfferList] = useRecoilState(onlineElectronicsCategorizedOfferListState);
        const [onlineHomeCategorizedOfferList, setOnlineHomeCategorizedOfferList] = useRecoilState(onlineHomeCategorizedOfferListState);
        const [onlineHealthAndBeautyCategorizedOfferList, setOnlineHealthAndBeautyCategorizedOfferList] = useRecoilState(onlineHealthAndBeautyCategorizedOfferListState);
        const [onlineOfficeAndBusinessCategorizedOfferList, setOnlineOfficeAndBusinessCategorizedOfferList] = useRecoilState(onlineOfficeAndBusinessCategorizedOfferListState);
        const [onlineServicesAndSubscriptionsCategorizedOfferList, setOnlineServicesAndSubscriptionsCategorizedOfferList] = useRecoilState(onlineServicesAndSubscriptionsCategorizedOfferListState);
        const [mainRootNavigation, setMainRootNavigation] = useRecoilState(mainRootNavigationState);
        const [isLoadingAppOverviewNeeded,] = useRecoilState(isLoadingAppOverviewNeededState);
        const [, setIsReady] = useRecoilState(isReadyRegistrationState);
        const [marketplaceCache, setMarketplaceCache] = useRecoilState(marketplaceAmplifyCacheState);
        const [globalCache, setGlobalCache] = useRecoilState(globalAmplifyCacheState);
        const [isRegistrationReady,] = useRecoilState(isReadyRegistrationState);
        const [, setRegistrationMainError] = useRecoilState(registrationMainErrorState);
        const [stepNumber, setStepNumber] = useRecoilState(registrationStepNumber);
        const [userInformation,] = useRecoilState(currentUserInformation);
        const [, setExpoPushToken] = useRecoilState(expoPushTokenState);
        const [, setFirstTimeLoggedIn] = useRecoilState(firstTimeLoggedInState);
        // step 1
        const [, setFirstName] = useRecoilState(firstNameState);
        const [, setLastName] = useRecoilState(lastNameState);
        const [, setBirthday] = useRecoilState(birthdayState);
        const [, setPhoneNumber] = useRecoilState(phoneNumberState);
        const [, setEmail] = useRecoilState(emailState);
        const [, setDutyStatus] = useRecoilState(dutyStatusValueState);
        const [, setEnlistingYear] = useRecoilState(enlistingYearState);
        // step 2
        const [, setAddressLine] = useRecoilState(addressLineState);
        const [, setAddressState] = useRecoilState(addressStateState);
        const [, setAddressZip] = useRecoilState(addressZipState);
        const [, setAddressCity] = useRecoilState(addressCityState);
        const [, setMilitaryBranch] = useRecoilState(militaryBranchValueState);
        // step 3
        const [, setPassword] = useRecoilState(registrationPasswordState);
        const [, setConfirmationPassword] = useRecoilState(registrationConfirmationPasswordState);
        const [, setAccountRegistrationDisclaimer] = useRecoilState(accountCreationDisclaimerCheckState);
        const [, setAmplifySignUpErrors] = useRecoilState(amplifySignUpProcessErrorsState);
        // do not need to clear further steps because back button won't be shown for subsequent ones

        // create a native stack navigator, to be used for our Authentication application navigation
        const Stack = createNativeStackNavigator<AuthenticationStackParamList>();

        /**
         * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
         * auth-related functionality for example), as well as any afferent API calls.
         *
         * Generally speaking, any functionality imperative prior to the full page-load should be
         * included in here.
         */
        useEffect(() => {
            // set the mai root navigation of the app accordingly
            setMainRootNavigation(navigation);
            // set the Cache to the global cache passed in from the App root component
            setGlobalCache(route.params.cache);
            // set the Marketplace Cache to the marketplace cache passed in from the App root component
            setMarketplaceCache(route.params.marketplaceCache);
            // set the current user's location passed in from the App root component
            setCurrentUserLocation(route.params.currentUserLocation);

            // set the expo push token accordingly, to be used in later stages, as part of the current user information object
            setExpoPushToken(route.params.expoPushToken);

            userIsAuthenticated && loadStoreData().then(() => {
            });

            /**
             * initialize the Amplify Hub, and start listening to various events, that would help in capturing important metrics,
             * and/or making specific decisions.
             */
            registerListener('auth', 'amplify_auth_listener', async (data) => {
                switch (data.payload.event) {
                    case 'signIn':
                        console.log(`user signed in`);
                        setIsUserAuthenticated(true);
                        // update the user auth session statistics
                        const userAuthSessionResponse: UserAuthSessionResponse = await updateUserAuthStat(data.payload.data.attributes["custom:userId"]);
                        // check if the user auth stat has successfully been updated
                        if (userAuthSessionResponse.data !== null && userAuthSessionResponse.data !== undefined) {
                            console.log('Successfully updated user auth stat during sign in!');
                            // check if this sign in session, is the first time that the user logged in
                            if (userAuthSessionResponse.data.numberOfSessions === 1 &&
                                userAuthSessionResponse.data.createdAt === userAuthSessionResponse.data.updatedAt) {
                                console.log(`User ${userAuthSessionResponse.data.id} logged in for the first time!`);
                                setFirstTimeLoggedIn(true);
                            } else {
                                console.log(`User ${userAuthSessionResponse.data.id} not logged in for the first time!`);
                                setFirstTimeLoggedIn(false);
                            }
                        } else {
                            console.log('Unsuccessfully updated user auth stat during sign in!');
                        }
                        break;
                    case 'signOut':
                        setIsUserAuthenticated(true);
                        /**
                         * Amplify automatically manages the sessions, and when the session token expires, it will log out the user and send an event
                         * here. What we do then is intercept that event, and since the user Sign-Out has already happened, we will perform the cleanup that
                         * we usually do in our Sign-Out functionality, without actually signing the user out.
                         */
                        console.log(`user signed out`);
                        // remove listener on sign out action
                        removeListener('auth', 'amplify_auth_listener');
                        break;
                    case 'configured':
                        console.log('the Auth module is successfully configured!');
                        break;
                }
            });
        }, [
            userIsAuthenticated, reloadNearbyDueToPermissionsChange,

            noNearbyOffersToLoad, noNearbyFoodCategorizedOffersToLoad, noNearbyRetailCategorizedOffersToLoad, noNearbyEntertainmentCategorizedOffersToLoadState,
            noNearbyElectronicsCategorizedOffersToLoad, noNearbyHealthAndBeautyCategorizedOffersToLoad, noNearbyOfficeAndBusinessCategorizedOffersToLoad,
            noNearbyServicesAndSubscriptionsCategorizedOffersToLoad,

            nearbyOfferList, nearbyFoodCategorizedOfferList, nearbyRetailCategorizedOfferList, nearbyEntertainmentCategorizedOfferList,
            nearbyElectronicsCategorizedOfferList, nearbyHealthAndBeautyCategorizedOfferList, nearbyOfficeAndBusinessCategorizedOfferList,
            nearbyServicesAndSubscriptionsCategorizedOfferList,

            onlineOfferList, onlineVeteransDayCategorizedOfferList, onlineFoodCategorizedOfferList, onlineRetailCategorizedOfferList,
            onlineEntertainmentCategorizedOfferList, onlineElectronicsCategorizedOfferList, onlineHealthAndBeautyCategorizedOfferList,
            onlineOfficeAndBusinessCategorizedOfferList, onlineServicesAndSubscriptionsCategorizedOfferList,

            marketplaceCache,

            loadingOnlineInProgress, loadingOnlineVeteransDayCategorizedInProgress,
            loadingOnlineFoodCategorizedInProgress, loadingNearbyFoodCategorizedOffersInProgress,
            loadingOnlineRetailCategorizedInProgress, loadingNearbyRetailCategorizedOffersInProgress,
            loadingOnlineEntertainmentCategorizedInProgress, loadingNearbyEntertainmentCategorizedOffersInProgress,
            loadingOnlineElectronicsCategorizedInProgress, loadingNearbyElectronicsCategorizedOffersInProgress,
            loadingOnlineHealthAndBeautyCategorizedInProgress, loadingNearbyHealthAndBeautyCategorizedOffersInProgress,
            loadingOnlineOfficeAndBusinessCategorizedInProgress, loadingNearbyOfficeAndBusinessCategorizedOffersInProgress,
            loadingOnlineServicesAndSubscriptionsCategorizedInProgress, loadingNearbyServicesAndSubscriptionsCategorizedOffersInProgress,

            noOnlineOffersToLoad, noOnlineVeteransDayCategorizedOffersToLoad, noOnlineFoodCategorizedOffersToLoad, noOnlineRetailCategorizedOffersToLoad,
            noOnlineEntertainmentCategorizedOffersToLoad, noOnlineElectronicsCategorizedOffersToLoad, noOnlineHealthAndBeautyCategorizedOffersToLoad,
            noOnlineOfficeAndBusinessCategorizedOffersToLoad, noOnlineServicesAndSubscriptionsCategorizedOffersToLoad
        ]);

        /**
         * Function used to load the online VETERANS_DAY categorized data
         */
        const loadOnlineVeteransDayCategorizedData = async (): Promise<void> => {
            setIsLoadingOnlineVeteransDayCategorizedInProgress(true);

            const additionalOnlineVeteransDayCategoryOffers =
                await retrieveCategorizedOnlineOffersList(numberOfVeteransDayCategorizedOnlineOffers, setNumberOfVeteransDayCategorizedOnlineOffers,
                    OfferCategory.VeteranDay, onlineVeteransDayCategorizedOffersPageNumber, setOnlineVeteransDayCategorizedOffersPageNumber);

            if (additionalOnlineVeteransDayCategoryOffers.length === 0) {
                setNoOnlineVeteransDayCategorizedOffersToLoad(true);
                setOnlineVeteransDayCategorizedOfferList(oldOnlineVeteransDayCategorizedOfferList => {
                    return [...oldOnlineVeteransDayCategorizedOfferList, ...additionalOnlineVeteransDayCategoryOffers]
                });
            } else {
                setNoOnlineVeteransDayCategorizedOffersToLoad(false);
                setOnlineVeteransDayCategorizedOfferList(oldOnlineVeteransDayCategorizedOfferList => {
                    return [...oldOnlineVeteransDayCategorizedOfferList, ...additionalOnlineVeteransDayCategoryOffers]
                });
            }

            setIsLoadingOnlineVeteransDayCategorizedInProgress(false);
        }

        /**
         * Function used to load the online FOOD categorized data
         */
        const loadOnlineFoodCategorizedData = async (): Promise<void> => {
            setIsLoadingOnlineFoodCategorizedInProgress(true);

            const additionalOnlineFoodCategoryOffers =
                await retrieveCategorizedOnlineOffersList(numberOfFoodCategorizedOnlineOffers, setNumberOfFoodCategorizedOnlineOffers,
                    OfferCategory.Food, onlineFoodCategorizedOffersPageNumber, setOnlineFoodCategorizedOffersPageNumber);
            if (additionalOnlineFoodCategoryOffers.length === 0) {
                setNoOnlineFoodCategorizedOffersToLoad(true);
                setOnlineFoodCategorizedOfferList(oldOnlineFoodCategorizedOfferList => {
                    return [...oldOnlineFoodCategorizedOfferList, ...additionalOnlineFoodCategoryOffers]
                });
            } else {
                setNoOnlineFoodCategorizedOffersToLoad(false);
                setOnlineFoodCategorizedOfferList(oldOnlineFoodCategorizedOfferList => {
                    return [...oldOnlineFoodCategorizedOfferList, ...additionalOnlineFoodCategoryOffers]
                });
            }

            setIsLoadingOnlineFoodCategorizedInProgress(false);
        }

        /**
         * Function used to load the online RETAIL categorized data
         */
        const loadOnlineRetailCategorizedData = async (): Promise<void> => {
            setIsLoadingOnlineRetailCategorizedInProgress(true);

            const additionalOnlineRetailCategoryOffers =
                await retrieveCategorizedOnlineOffersList(numberOfRetailCategorizedOnlineOffers, setNumberOfRetailCategorizedOnlineOffers,
                    OfferCategory.Retail, onlineRetailCategorizedOffersPageNumber, setOnlineRetailCategorizedOffersPageNumber);
            if (additionalOnlineRetailCategoryOffers.length === 0) {
                setNoOnlineRetailCategorizedOffersToLoad(true);
                setOnlineRetailCategorizedOfferList(oldOnlineRetailCategorizedOfferList => {
                    return [...oldOnlineRetailCategorizedOfferList, ...additionalOnlineRetailCategoryOffers]
                });
            } else {
                setNoOnlineRetailCategorizedOffersToLoad(false);
                setOnlineRetailCategorizedOfferList(oldOnlineRetailCategorizedOfferList => {
                    return [...oldOnlineRetailCategorizedOfferList, ...additionalOnlineRetailCategoryOffers]
                });
            }

            setIsLoadingOnlineRetailCategorizedInProgress(false);
        }

        /**
         * Function used to load the online ENTERTAINMENT categorized data
         */
        const loadOnlineEntertainmentCategorizedData = async (): Promise<void> => {
            setIsLoadingOnlineEntertainmentCategorizedInProgress(true);

            const additionalOnlineEntertainmentCategoryOffers =
                await retrieveCategorizedOnlineOffersList(numberOfEntertainmentCategorizedOnlineOffers, setNumberOfEntertainmentCategorizedOnlineOffers,
                    OfferCategory.Entertainment, onlineEntertainmentCategorizedOffersPageNumber, setOnlineEntertainmentCategorizedOffersPageNumber);
            if (additionalOnlineEntertainmentCategoryOffers.length === 0) {
                setNoOnlineEntertainmentCategorizedOffersToLoad(true);
                setOnlineEntertainmentCategorizedOfferList(oldOnlineEntertainmentCategorizedOfferList => {
                    return [...oldOnlineEntertainmentCategorizedOfferList, ...additionalOnlineEntertainmentCategoryOffers]
                });
            } else {
                setNoOnlineEntertainmentCategorizedOffersToLoad(false);
                setOnlineEntertainmentCategorizedOfferList(oldOnlineEntertainmentCategorizedOfferList => {
                    return [...oldOnlineEntertainmentCategorizedOfferList, ...additionalOnlineEntertainmentCategoryOffers]
                });
            }

            setIsLoadingOnlineEntertainmentCategorizedInProgress(false);
        }

        /**
         * Function used to load the online ELECTRONICS categorized data
         */
        const loadOnlineElectronicsCategorizedData = async (): Promise<void> => {
            setIsLoadingOnlineElectronicsCategorizedInProgress(true);

            const additionalOnlineElectronicsCategoryOffers =
                await retrieveCategorizedOnlineOffersList(numberOfElectronicsCategorizedOnlineOffers, setNumberOfElectronicsCategorizedOnlineOffers,
                    OfferCategory.Electronics, onlineElectronicsCategorizedOffersPageNumber, setOnlineElectronicsCategorizedOffersPageNumber);
            if (additionalOnlineElectronicsCategoryOffers.length === 0) {
                setNoOnlineElectronicsCategorizedOffersToLoad(true);
                setOnlineElectronicsCategorizedOfferList(oldOnlineElectronicsCategorizedOfferList => {
                    return [...oldOnlineElectronicsCategorizedOfferList, ...additionalOnlineElectronicsCategoryOffers]
                });
            } else {
                setNoOnlineElectronicsCategorizedOffersToLoad(false);
                setOnlineElectronicsCategorizedOfferList(oldOnlineElectronicsCategorizedOfferList => {
                    return [...oldOnlineElectronicsCategorizedOfferList, ...additionalOnlineElectronicsCategoryOffers]
                });
            }

            setIsLoadingOnlineElectronicsCategorizedInProgress(false);
        }

        /**
         * Function used to load the online HOME categorized data
         */
        const loadOnlineHomeCategorizedData = async (): Promise<void> => {
            setIsLoadingOnlineHomeCategorizedInProgress(true);

            const additionalOnlineHomeCategoryOffers =
                await retrieveCategorizedOnlineOffersList(numberOfHomeCategorizedOnlineOffers, setNumberOfHomeCategorizedOnlineOffers,
                    OfferCategory.Home, onlineHomeCategorizedOffersPageNumber, setOnlineHomeCategorizedOffersPageNumber);
            if (additionalOnlineHomeCategoryOffers.length === 0) {
                setNoOnlineHomeCategorizedOffersToLoad(true);
                setOnlineHomeCategorizedOfferList(oldOnlineHomeCategorizedOfferList => {
                    return [...oldOnlineHomeCategorizedOfferList, ...additionalOnlineHomeCategoryOffers]
                });
            } else {
                setNoOnlineHomeCategorizedOffersToLoad(false);
                setOnlineHomeCategorizedOfferList(oldOnlineHomeCategorizedOfferList => {
                    return [...oldOnlineHomeCategorizedOfferList, ...additionalOnlineHomeCategoryOffers]
                });
            }

            setIsLoadingOnlineHomeCategorizedInProgress(false);
        }

        /**
         * Function used to load the online HEALTH AND BEAUTY categorized data
         */
        const loadOnlineHealthAndBeautyCategorizedData = async (): Promise<void> => {
            setIsLoadingOnlineHealthAndBeautyCategorizedInProgress(true);

            const additionalOnlineHealthAndBeautyCategoryOffers =
                await retrieveCategorizedOnlineOffersList(numberOfHealthAndBeautyCategorizedOnlineOffers, setNumberOfHealthAndBeautyCategorizedOnlineOffers,
                    OfferCategory.HealthAndBeauty, onlineHealthAndBeautyCategorizedOffersPageNumber, setOnlineHealthAndBeautyCategorizedOffersPageNumber);
            if (additionalOnlineHealthAndBeautyCategoryOffers.length === 0) {
                setNoOnlineHealthAndBeautyCategorizedOffersToLoad(true);
                setOnlineHealthAndBeautyCategorizedOfferList(oldOnlineHealthAndBeautyCategorizedOfferList => {
                    return [...oldOnlineHealthAndBeautyCategorizedOfferList, ...additionalOnlineHealthAndBeautyCategoryOffers]
                });
            } else {
                setNoOnlineHealthAndBeautyCategorizedOffersToLoad(false);
                setOnlineHealthAndBeautyCategorizedOfferList(oldOnlineHealthAndBeautyCategorizedOfferList => {
                    return [...oldOnlineHealthAndBeautyCategorizedOfferList, ...additionalOnlineHealthAndBeautyCategoryOffers]
                });
            }

            setIsLoadingOnlineHealthAndBeautyCategorizedInProgress(false);
        }

        /**
         * Function used to load the online OFFICE AND BUSINESS categorized data
         */
        const loadOnlineOfficeAndBusinessCategorizedData = async (): Promise<void> => {
            setIsLoadingOnlineOfficeAndBusinessCategorizedInProgress(true);

            const additionalOnlineOfficeAndBusinessCategoryOffers =
                await retrieveCategorizedOnlineOffersList(numberOfOfficeAndBusinessCategorizedOnlineOffers, setNumberOfOfficeAndBusinessCategorizedOnlineOffers,
                    OfferCategory.OfficeAndBusiness, onlineOfficeAndBusinessCategorizedOffersPageNumber, setOnlineOfficeAndBusinessCategorizedOffersPageNumber);
            if (additionalOnlineOfficeAndBusinessCategoryOffers.length === 0) {
                setNoOnlineOfficeAndBusinessCategorizedOffersToLoad(true);
                setOnlineOfficeAndBusinessCategorizedOfferList(oldOnlineOfficeAndBusinessCategorizedOfferList => {
                    return [...oldOnlineOfficeAndBusinessCategorizedOfferList, ...additionalOnlineOfficeAndBusinessCategoryOffers]
                });
            } else {
                setNoOnlineOfficeAndBusinessCategorizedOffersToLoad(false);
                setOnlineOfficeAndBusinessCategorizedOfferList(oldOnlineOfficeAndBusinessCategorizedOfferList => {
                    return [...oldOnlineOfficeAndBusinessCategorizedOfferList, ...additionalOnlineOfficeAndBusinessCategoryOffers]
                });
            }

            setIsLoadingOnlineOfficeAndBusinessCategorizedInProgress(false);
        }

        /**
         * Function used to load the online SERVICES AND SUBSCRIPTIONS categorized data
         */
        const loadOnlineServicesAndSubscriptionsCategorizedData = async (): Promise<void> => {
            setIsLoadingOnlineServicesAndSubscriptionsCategorizedInProgress(true);

            const additionalOnlineServicesAndSubscriptionsCategoryOffers =
                await retrieveCategorizedOnlineOffersList(numberOfServicesAndSubscriptionsCategorizedOnlineOffers, setNumberOfServicesAndSubscriptionsCategorizedOnlineOffers,
                    OfferCategory.ServicesAndSubscriptions, onlineServicesAndSubscriptionsCategorizedOffersPageNumber, setOnlineServicesAndSubscriptionsCategorizedOffersPageNumber);
            if (additionalOnlineServicesAndSubscriptionsCategoryOffers.length === 0) {
                setNoOnlineServicesAndSubscriptionsCategorizedOffersToLoad(true);
                setOnlineServicesAndSubscriptionsCategorizedOfferList(oldOnlineServicesAndSubscriptionsCategorizedOfferList => {
                    return [...oldOnlineServicesAndSubscriptionsCategorizedOfferList, ...additionalOnlineServicesAndSubscriptionsCategoryOffers]
                });
            } else {
                setNoOnlineServicesAndSubscriptionsCategorizedOffersToLoad(false);
                setOnlineServicesAndSubscriptionsCategorizedOfferList(oldOnlineServicesAndSubscriptionsCategorizedOfferList => {
                    return [...oldOnlineServicesAndSubscriptionsCategorizedOfferList, ...additionalOnlineServicesAndSubscriptionsCategoryOffers]
                });
            }

            setIsLoadingOnlineServicesAndSubscriptionsCategorizedInProgress(false);
        }

        /**
         * Function used to load the online data
         */
        const loadOnlineData = async (): Promise<void> => {
            setIsLoadingOnlineInProgress(true);

            const additionalOnlineOffers = await retrieveOnlineOffersList(numberOfOnlineOffers, setNumberOfOnlineOffers, onlineOffersPageNumber, setOnlineOffersPageNumber);
            if (additionalOnlineOffers.length === 0) {
                setNoOnlineOffersToLoad(true);
                setOnlineOfferList(oldOnlineOfferList => {
                    return [...oldOnlineOfferList, ...additionalOnlineOffers]
                });
            } else {
                setNoOnlineOffersToLoad(false);
                setOnlineOfferList(oldOnlineOfferList => {
                    return [...oldOnlineOfferList, ...additionalOnlineOffers]
                });
            }

            setIsLoadingOnlineInProgress(false);
        }

        /**
         * Function used to load the premier online data
         */
        const loadPremierOnlineData = async (): Promise<void> => {
            setIsLoadingOnlineInProgress(true);

            const premierOnlineOffers = await retrievePremierOnlineOffersList(premierOnlineOffersPageNumber, setPremierOnlineOffersPageNumber);

            if (premierOnlineOffers.length !== 0) {
                setNoPremierOnlineOffersToLoad(false);
                setOnlineOfferList(oldOnlineOfferList => {
                    return [...premierOnlineOffers, ...oldOnlineOfferList]
                });
            } else {
                setNoPremierOnlineOffersToLoad(true);
                setOnlineOfferList(oldOnlineOfferList => {
                    return [...premierOnlineOffers, ...oldOnlineOfferList]
                });
            }
            setIsLoadingOnlineInProgress(false);
        }

        /**
         * Function used to load the nearby FOOD categorized offer data
         */
        const loadNearbyFoodCategorizedData = async (): Promise<void> => {
            setIsLoadingNearbyFoodCategorizedOffersInProgress(true);

            const offersFoodCategorizedNearby = await
                retrieveCategorizedOffersNearby(nearbyFoodCategorizedOffersPageNumber, setNearbyFoodCategorizedOffersPageNumber,
                    userInformation, setOffersNearUserLocationFlag, currentUserLocation, setCurrentUserLocation, numberOfFoodCategorizedOffersWithin25Miles,
                    setNumberOfFoodCategorizedOffersWithin25Miles, OfferCategory.Food);
            if (offersFoodCategorizedNearby === null) {
                setIsLoadingNearbyFoodCategorizedOffersInProgress(false);
                setNoNearbyFoodCategorizedOffersToLoad(true);
                setLocationServicesButtonState(true);
            } else if (offersFoodCategorizedNearby.length === 0) {
                setIsLoadingNearbyFoodCategorizedOffersInProgress(false);
                setNoNearbyFoodCategorizedOffersToLoad(true);
            } else {
                setNoNearbyFoodCategorizedOffersToLoad(false);
                setIsLoadingNearbyFoodCategorizedOffersInProgress(false);
                setNearbyFoodCategorizedOfferList(oldNearbyFoodCategorizedOfferList => {
                    return [...oldNearbyFoodCategorizedOfferList, ...offersFoodCategorizedNearby]
                });
            }
        }

        /**
         * Function used to load the nearby RETAIL categorized offer data
         */
        const loadNearbyRetailCategorizedData = async (): Promise<void> => {
            setIsLoadingNearbyRetailCategorizedOffersInProgress(true);

            const offersRetailCategorizedNearby = await
                retrieveCategorizedOffersNearby(nearbyRetailCategorizedOffersPageNumber, setNearbyRetailCategorizedOffersPageNumber,
                    userInformation, setOffersNearUserLocationFlag, currentUserLocation, setCurrentUserLocation, numberOfRetailCategorizedOffersWithin25Miles,
                    setNumberOfRetailCategorizedOffersWithin25Miles, OfferCategory.Retail);
            if (offersRetailCategorizedNearby === null) {
                setIsLoadingNearbyRetailCategorizedOffersInProgress(false);
                setNoNearbyRetailCategorizedOffersToLoad(true);
                setLocationServicesButtonState(true);
            } else if (offersRetailCategorizedNearby.length === 0) {
                setIsLoadingNearbyRetailCategorizedOffersInProgress(false);
                setNoNearbyRetailCategorizedOffersToLoad(true);
            } else {
                setNoNearbyRetailCategorizedOffersToLoad(false);
                setIsLoadingNearbyRetailCategorizedOffersInProgress(false);
                setNearbyRetailCategorizedOfferList(oldNearbyRetailCategorizedOfferList => {
                    return [...oldNearbyRetailCategorizedOfferList, ...offersRetailCategorizedNearby]
                });
            }
        }

        /**
         * Function used to load the nearby ENTERTAINMENT categorized offer data
         */
        const loadNearbyEntertainmentCategorizedData = async (): Promise<void> => {
            setIsLoadingNearbyEntertainmentCategorizedOffersInProgress(true);

            const offersEntertainmentCategorizedNearby = await
                retrieveCategorizedOffersNearby(nearbyEntertainmentCategorizedOffersPageNumber, setNearbyEntertainmentCategorizedOffersPageNumber,
                    userInformation, setOffersNearUserLocationFlag, currentUserLocation, setCurrentUserLocation, numberOfEntertainmentCategorizedOffersWithin25Miles,
                    setNumberOfEntertainmentCategorizedOffersWithin25Miles, OfferCategory.Entertainment);
            if (offersEntertainmentCategorizedNearby === null) {
                setIsLoadingNearbyEntertainmentCategorizedOffersInProgress(false);
                setNoNearbyEntertainmentCategorizedOffersToLoad(true);
                setLocationServicesButtonState(true);
            } else if (offersEntertainmentCategorizedNearby.length === 0) {
                setIsLoadingNearbyEntertainmentCategorizedOffersInProgress(false);
                setNoNearbyEntertainmentCategorizedOffersToLoad(true);
            } else {
                setNoNearbyEntertainmentCategorizedOffersToLoad(false);
                setIsLoadingNearbyEntertainmentCategorizedOffersInProgress(false);
                setNearbyEntertainmentCategorizedOfferList(oldNearbyEntertainmentCategorizedOfferList => {
                    return [...oldNearbyEntertainmentCategorizedOfferList, ...offersEntertainmentCategorizedNearby]
                });
            }
        }

        /**
         * Function used to load the nearby ELECTRONICS categorized offer data
         */
        const loadNearbyElectronicsCategorizedData = async (): Promise<void> => {
            setIsLoadingNearbyElectronicsCategorizedOffersInProgress(true);

            const offersElectronicsCategorizedNearby = await
                retrieveCategorizedOffersNearby(nearbyElectronicsCategorizedOffersPageNumber, setNearbyElectronicsCategorizedOffersPageNumber,
                    userInformation, setOffersNearUserLocationFlag, currentUserLocation, setCurrentUserLocation, numberOfElectronicsCategorizedOffersWithin25Miles,
                    setNumberOfElectronicsCategorizedOffersWithin25Miles, OfferCategory.Electronics);
            if (offersElectronicsCategorizedNearby === null) {
                setIsLoadingNearbyElectronicsCategorizedOffersInProgress(false);
                setNoNearbyElectronicsCategorizedOffersToLoad(true);
                setLocationServicesButtonState(true);
            } else if (offersElectronicsCategorizedNearby.length === 0) {
                setIsLoadingNearbyElectronicsCategorizedOffersInProgress(false);
                setNoNearbyElectronicsCategorizedOffersToLoad(true);
            } else {
                setNoNearbyElectronicsCategorizedOffersToLoad(false);
                setIsLoadingNearbyElectronicsCategorizedOffersInProgress(false);
                setNearbyElectronicsCategorizedOfferList(oldNearbyElectronicsCategorizedOfferList => {
                    return [...oldNearbyElectronicsCategorizedOfferList, ...offersElectronicsCategorizedNearby]
                });
            }
        }

        /**
         * Function used to load the nearby HOME categorized offer data
         */
        const loadNearbyHomeCategorizedData = async (): Promise<void> => {
            setIsLoadingNearbyHomeCategorizedOffersInProgress(true);

            const offersHomeCategorizedNearby = await
                retrieveCategorizedOffersNearby(nearbyHomeCategorizedOffersPageNumber, setNearbyHomeCategorizedOffersPageNumber,
                    userInformation, setOffersNearUserLocationFlag, currentUserLocation, setCurrentUserLocation, numberOfHomeCategorizedOffersWithin25Miles,
                    setNumberOfHomeCategorizedOffersWithin25Miles, OfferCategory.Home);
            if (offersHomeCategorizedNearby === null) {
                setIsLoadingNearbyHomeCategorizedOffersInProgress(false);
                setNoNearbyHomeCategorizedOffersToLoad(true);
                setLocationServicesButtonState(true);
            } else if (offersHomeCategorizedNearby.length === 0) {
                setIsLoadingNearbyHomeCategorizedOffersInProgress(false);
                setNoNearbyHomeCategorizedOffersToLoad(true);
            } else {
                setNoNearbyHomeCategorizedOffersToLoad(false);
                setIsLoadingNearbyHomeCategorizedOffersInProgress(false);
                setNearbyHomeCategorizedOfferList(oldNearbyHomeCategorizedOfferList => {
                    return [...oldNearbyHomeCategorizedOfferList, ...offersHomeCategorizedNearby]
                });
            }
        }

        /**
         * Function used to load the nearby HEALTH AND BEAUTY categorized offer data
         */
        const loadNearbyHealthAndBeautyCategorizedData = async (): Promise<void> => {
            setIsLoadingNearbyHealthAndBeautyCategorizedOffersInProgress(true);

            const offersHealthAndBeautyCategorizedNearby = await
                retrieveCategorizedOffersNearby(nearbyHealthAndBeautyCategorizedOffersPageNumber, setNearbyHealthAndBeautyCategorizedOffersPageNumber,
                    userInformation, setOffersNearUserLocationFlag, currentUserLocation, setCurrentUserLocation, numberOfHealthAndBeautyCategorizedOffersWithin25Miles,
                    setNumberOfHealthAndBeautyCategorizedOffersWithin25Miles, OfferCategory.HealthAndBeauty);
            if (offersHealthAndBeautyCategorizedNearby === null) {
                setIsLoadingNearbyHealthAndBeautyCategorizedOffersInProgress(false);
                setNoNearbyHealthAndBeautyCategorizedOffersToLoad(true);
                setLocationServicesButtonState(true);
            } else if (offersHealthAndBeautyCategorizedNearby.length === 0) {
                setIsLoadingNearbyHealthAndBeautyCategorizedOffersInProgress(false);
                setNoNearbyHealthAndBeautyCategorizedOffersToLoad(true);
            } else {
                setNoNearbyHealthAndBeautyCategorizedOffersToLoad(false);
                setIsLoadingNearbyHealthAndBeautyCategorizedOffersInProgress(false);
                setNearbyHealthAndBeautyCategorizedOfferList(oldNearbyHealthAndBeautyCategorizedOfferList => {
                    return [...oldNearbyHealthAndBeautyCategorizedOfferList, ...offersHealthAndBeautyCategorizedNearby]
                });
            }
        }

        /**
         * Function used to load the nearby OFFICE AND BUSINESS categorized offer data
         */
        const loadNearbyOfficeAndBusinessCategorizedData = async (): Promise<void> => {
            setIsLoadingNearbyOfficeAndBusinessCategorizedOffersInProgress(true);

            const offersOfficeAndBusinessCategorizedNearby = await
                retrieveCategorizedOffersNearby(nearbyOfficeAndBusinessCategorizedOffersPageNumber, setNearbyOfficeAndBusinessCategorizedOffersPageNumber,
                    userInformation, setOffersNearUserLocationFlag, currentUserLocation, setCurrentUserLocation, numberOfOfficeAndBusinessCategorizedOffersWithin25Miles,
                    setNumberOfOfficeAndBusinessCategorizedOffersWithin25Miles, OfferCategory.OfficeAndBusiness);
            if (offersOfficeAndBusinessCategorizedNearby === null) {
                setIsLoadingNearbyOfficeAndBusinessCategorizedOffersInProgress(false);
                setNoNearbyOfficeAndBusinessCategorizedOffersToLoad(true);
                setLocationServicesButtonState(true);
            } else if (offersOfficeAndBusinessCategorizedNearby.length === 0) {
                setIsLoadingNearbyOfficeAndBusinessCategorizedOffersInProgress(false);
                setNoNearbyOfficeAndBusinessCategorizedOffersToLoad(true);
            } else {
                setNoNearbyOfficeAndBusinessCategorizedOffersToLoad(false);
                setIsLoadingNearbyOfficeAndBusinessCategorizedOffersInProgress(false);
                setNearbyOfficeAndBusinessCategorizedOfferList(oldNearbyOfficeAndBusinessCategorizedOfferList => {
                    return [...oldNearbyOfficeAndBusinessCategorizedOfferList, ...offersOfficeAndBusinessCategorizedNearby]
                });
            }
        }

        /**
         * Function used to load the nearby SERVICES AND SUBSCRIPTIONS categorized offer data
         */
        const loadNearbyServicesAndSubscriptionsCategorizedData = async (): Promise<void> => {
            setIsLoadingNearbyServicesAndSubscriptionsCategorizedOffersInProgress(true);

            const offersServicesAndSubscriptionsCategorizedNearby = await
                retrieveCategorizedOffersNearby(nearbyServicesAndSubscriptionsCategorizedOffersPageNumber, setNearbyServicesAndSubscriptionsCategorizedOffersPageNumber,
                    userInformation, setOffersNearUserLocationFlag, currentUserLocation, setCurrentUserLocation, numberOfServicesAndSubscriptionsCategorizedOffersWithin25Miles,
                    setNumberOfServicesAndSubscriptionsCategorizedOffersWithin25Miles, OfferCategory.Food);
            if (offersServicesAndSubscriptionsCategorizedNearby === null) {
                setIsLoadingNearbyServicesAndSubscriptionsCategorizedOffersInProgress(false);
                setNoNearbyServicesAndSubscriptionsCategorizedOffersToLoad(true);
                setLocationServicesButtonState(true);
            } else if (offersServicesAndSubscriptionsCategorizedNearby.length === 0) {
                setIsLoadingNearbyServicesAndSubscriptionsCategorizedOffersInProgress(false);
                setNoNearbyServicesAndSubscriptionsCategorizedOffersToLoad(true);
            } else {
                setNoNearbyServicesAndSubscriptionsCategorizedOffersToLoad(false);
                setIsLoadingNearbyServicesAndSubscriptionsCategorizedOffersInProgress(false);
                setNearbyServicesAndSubscriptionsCategorizedOfferList(oldNearbyServicesAndSubscriptionsCategorizedOfferList => {
                    return [...oldNearbyServicesAndSubscriptionsCategorizedOfferList, ...offersServicesAndSubscriptionsCategorizedNearby]
                });
            }
        }

        /**
         * Function used to load the nearby offer data
         */
        const loadNearbyData = async (): Promise<void> => {
            setIsLoadingNearbyOffersInProgress(true);
            const offersNearby = await
                retrieveOffersNearby(nearbyOffersPageNumber, setNearbyOffersPageNumber,
                    premierNearbyOffersPageNumber, setPremierNearbyOffersPageNumber,
                    userInformation, setOffersNearUserLocationFlag, marketplaceCache, currentUserLocation,
                    setCurrentUserLocation, numberOfOffersWithin25Miles, setNumberOfOffersWithin25Miles);
            if (offersNearby === null) {
                setIsLoadingNearbyOffersInProgress(false);
                setNoNearbyOffersToLoad(true);
                setLocationServicesButtonState(true);
            } else if (offersNearby.length === 0) {
                setIsLoadingNearbyOffersInProgress(false);
                setNoNearbyOffersToLoad(true);
            } else {
                setNoNearbyOffersToLoad(false);
                setIsLoadingNearbyOffersInProgress(false);
                setNearbyOfferList(oldNearbyOfferList => {
                    return [...oldNearbyOfferList, ...offersNearby]
                });
            }
        }

        /**
         * Function used to load the nearby offer data used for main horizontal map
         */
        const loadNearbyDataForMainHorizontalMap = async (): Promise<void> => {
            setIsLoadingNearbyOffersForHorizontalMapInProgress(true);
            const offersNearby = await
                retrieveOffersNearbyForMap(userInformation, currentUserLocation, setCurrentUserLocation,
                    numberOfOffersWithin5Miles, setNumberOfOffersWithin5Miles);
            if (offersNearby === null) {
                setIsLoadingNearbyOffersForHorizontalMapInProgress(false);
                setAreOffersForMainHorizontalMapLoaded(true);
            } else if (offersNearby.length === 0) {
                setIsLoadingNearbyOffersForHorizontalMapInProgress(false);
                setAreOffersForMainHorizontalMapLoaded(true);
            } else {
                setIsLoadingNearbyOffersForHorizontalMapInProgress(false);
                setAreOffersForMainHorizontalMapLoaded(true);
                setNearbyOffersListForMainHorizontalMap(oldNearbyOfferList => {
                    return [...oldNearbyOfferList, ...offersNearby]
                });
            }
        }

        /**
         * Function used to load the nearby offer data used for the full screen map
         */
        const loadNearbyDataForFullScreenMap = async (): Promise<void> => {
            setIsLoadingNearbyOffersForFullScreenMapInProgress(true);
            const offersNearby = await
                retrieveOffersNearbyForMap(userInformation, currentUserLocation, setCurrentUserLocation,
                    undefined, undefined, true);
            if (offersNearby === null) {
                setIsLoadingNearbyOffersForFullScreenMapInProgress(false);
                setAreOffersForFullScreenMapLoaded(true);
            } else if (offersNearby.length === 0) {
                setIsLoadingNearbyOffersForFullScreenMapInProgress(false);
                setAreOffersForFullScreenMapLoaded(true);
            } else {
                setIsLoadingNearbyOffersForFullScreenMapInProgress(false);
                setAreOffersForFullScreenMapLoaded(true);
                setNearbyOffersListForFullScreenMap(oldNearbyOfferList => {
                    return [...oldNearbyOfferList, ...offersNearby]
                });
            }
        }

        /**
         * Function used to load the premier nearby offer data
         */
        const loadPremierNearbyData = async (): Promise<void> => {
            setIsLoadingNearbyOffersInProgress(true);
            const premierOffersNearby = await
                retrievePremierOffersNearby(premierNearbyOffersPageNumber, setPremierNearbyOffersPageNumber, currentUserLocation, setCurrentUserLocation);
            if (premierOffersNearby === null) {
                setIsLoadingNearbyOffersInProgress(false);
            } else if (premierOffersNearby.length === 0 || nearbyOfferList.length >= 1) {
                setIsLoadingNearbyOffersInProgress(false);
            } else {
                setNoNearbyOffersToLoad(false);
                setIsLoadingNearbyOffersInProgress(false);
                setNearbyOfferList(oldNearbyOfferList => {
                    return [...premierOffersNearby, ...oldNearbyOfferList]
                });
            }
        }

        /**
         * Function used to load the marketplace/store data.
         *
         * @return a tuple of {@link Promise} of {@link void}
         */
        const loadStoreData = async (): Promise<void> => {
            // set the current user's position accordingly, if not already set
            if (currentUserLocation === null) {
                const foregroundPermissionStatus = await Location.requestForegroundPermissionsAsync();
                if (foregroundPermissionStatus.status !== 'granted') {
                    const errorMessage = `Permission to access location was not granted!`;
                    console.log(errorMessage);

                    setCurrentUserLocation(null);
                } else {
                    const lastKnownPositionAsync: LocationObject | null = await Location.getLastKnownPositionAsync();
                    setCurrentUserLocation(lastKnownPositionAsync !== null ? lastKnownPositionAsync : await Location.getCurrentPositionAsync());
                }
            }

            // check to see if we have cached Online Offers. If we do, set them appropriately
            const onlineOffersCached = await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineOffers`);
            if (marketplaceCache !== null && onlineOffersCached !== null && onlineOffersCached.length !== 0 && !checkedOnlineCache) {
                console.log('pre-emptively loading - online offers are cached');
                setCheckOnlineCache(true);
                const cachedOnlineOffers = await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineOffers`);
                setOnlineOfferList(cachedOnlineOffers);

                setIsLoadingOnlineInProgress(false);
                (cachedOnlineOffers === null || cachedOnlineOffers.length < 20) && await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineOffers`, null);
            }
            // check to see if we have cached categorized Online Offers. If we do, set them appropriately
            const onlineVeteransDayOffersCached = await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineVeteransDayOffers`);
            if (marketplaceCache !== null && onlineVeteransDayOffersCached !== null && onlineVeteransDayOffersCached.length !== 0 && !checkedVeteransDayOnlineCache) {
                console.log('pre-emptively loading - online Veterans Day offers are cached');
                setCheckVeteransDayOnlineCache(true);
                const cachedVeteransDayOnlineOffers = await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineVeteransDayOffers`);
                setOnlineVeteransDayCategorizedOfferList(cachedVeteransDayOnlineOffers);
                setIsLoadingOnlineVeteransDayCategorizedInProgress(false);
                (cachedVeteransDayOnlineOffers === null || cachedVeteransDayOnlineOffers.length < 20) && await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineVeteransDayOffers`, null);
            }
            const onlineFoodOffersCached = await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineFoodOffers`);
            if (marketplaceCache !== null && onlineFoodOffersCached !== null && onlineFoodOffersCached.length !== 0 && !checkedFoodOnlineCache) {
                console.log('pre-emptively loading - online food offers are cached');
                setCheckFoodOnlineCache(true);
                const cachedFoodOnlineOffers = await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineFoodOffers`);
                setOnlineFoodCategorizedOfferList(cachedFoodOnlineOffers);

                setIsLoadingOnlineFoodCategorizedInProgress(false);
                (cachedFoodOnlineOffers === null || cachedFoodOnlineOffers.length < 20) && await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineFoodOffers`, null);
            }
            const onlineRetailOffersCached = await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineRetailOffers`);
            if (marketplaceCache !== null && onlineRetailOffersCached !== null && onlineRetailOffersCached.length !== 0 && !checkedRetailOnlineCache) {
                console.log('pre-emptively loading - online retail offers are cached');
                setCheckRetailOnlineCache(true);
                const cachedRetailOnlineOffers = await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineRetailOffers`);
                setOnlineRetailCategorizedOfferList(cachedRetailOnlineOffers);

                setIsLoadingOnlineRetailCategorizedInProgress(false);
                (cachedRetailOnlineOffers === null || cachedRetailOnlineOffers.length < 20) && await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineRetailOffers`, null);
            }
            const onlineEntertainmentOffersCached = await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineEntertainmentOffers`);
            if (marketplaceCache !== null && onlineEntertainmentOffersCached !== null && onlineEntertainmentOffersCached.length !== 0 && !checkedEntertainmentOnlineCache) {
                console.log('pre-emptively loading - online entertainment offers are cached');
                setCheckEntertainmentOnlineCache(true);
                const cachedEntertainmentOnlineOffers = await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineEntertainmentOffers`);
                setOnlineEntertainmentCategorizedOfferList(cachedEntertainmentOnlineOffers);

                setIsLoadingOnlineEntertainmentCategorizedInProgress(false);
                (cachedEntertainmentOnlineOffers === null || cachedEntertainmentOnlineOffers.length < 20) && await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineEntertainmentOffers`, null);
            }
            const onlineElectronicsOffersCached = await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineElectronicsOffers`);
            if (marketplaceCache !== null && onlineElectronicsOffersCached !== null && onlineElectronicsOffersCached.length !== 0 && !checkedElectronicsOnlineCache) {
                console.log('pre-emptively loading - online electronics offers are cached');
                setCheckElectronicsOnlineCache(true);
                const cachedElectronicsOnlineOffers = await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineElectronicsOffers`);
                setOnlineElectronicsCategorizedOfferList(cachedElectronicsOnlineOffers);

                setIsLoadingOnlineElectronicsCategorizedInProgress(false);
                (cachedElectronicsOnlineOffers === null || cachedElectronicsOnlineOffers.length < 20) && await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineElectronicsOffers`, null);
            }
            const onlineHomeOffersCached = await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineHomeOffers`);
            if (marketplaceCache !== null && onlineHomeOffersCached !== null && onlineHomeOffersCached.length !== 0 && !checkedHomeOnlineCache) {
                console.log('pre-emptively loading - online home offers are cached');
                setCheckHomeOnlineCache(true);
                const cachedHomeOnlineOffers = await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineHomeOffers`);
                setOnlineHomeCategorizedOfferList(cachedHomeOnlineOffers);

                setIsLoadingOnlineHomeCategorizedInProgress(false);
                (cachedHomeOnlineOffers === null || cachedHomeOnlineOffers.length < 20) && await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineHomeOffers`, null);
            }
            const onlineHealthAndBeautyOffersCached = await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineHealthAndBeautyOffers`);
            if (marketplaceCache !== null && onlineHealthAndBeautyOffersCached !== null && onlineHealthAndBeautyOffersCached.length !== 0 && !checkedHealthAndBeautyOnlineCache) {
                console.log('pre-emptively loading - online health and beauty offers are cached');
                setCheckHealthAndBeautyOnlineCache(true);
                const cachedHealthAndBeautyOnlineOffers = await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineHealthAndBeautyOffers`);
                setOnlineHealthAndBeautyCategorizedOfferList(cachedHealthAndBeautyOnlineOffers);

                setIsLoadingOnlineHealthAndBeautyCategorizedInProgress(false);
                (cachedHealthAndBeautyOnlineOffers === null || cachedHealthAndBeautyOnlineOffers.length < 20) && await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineHealthAndBeautyOffers`, null);
            }
            const onlineOfficeAndBusinessOffersCached = await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineOfficeAndBusinessOffers`);
            if (marketplaceCache !== null && onlineOfficeAndBusinessOffersCached !== null && onlineOfficeAndBusinessOffersCached.length !== 0 && !checkedOfficeAndBusinessOnlineCache) {
                console.log('pre-emptively loading - online office and business offers are cached');
                setCheckOfficeAndBusinessOnlineCache(true);
                const cachedOfficeAndBusinessOnlineOffers = await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineOfficeAndBusinessOffers`);
                setOnlineOfficeAndBusinessCategorizedOfferList(cachedOfficeAndBusinessOnlineOffers);

                setIsLoadingOnlineOfficeAndBusinessCategorizedInProgress(false);
                (cachedOfficeAndBusinessOnlineOffers === null || cachedOfficeAndBusinessOnlineOffers.length < 20) && await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineOfficeAndBusinessOffers`, null);
            }
            const onlineServicesAndSubscriptionsOffersCached = await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineServicesAndSubscriptionsOffers`);
            if (marketplaceCache !== null && onlineServicesAndSubscriptionsOffersCached !== null && onlineServicesAndSubscriptionsOffersCached.length !== 0 && !checkedServicesAndSubscriptionsOnlineCache) {
                console.log('pre-emptively loading - online services and subscriptions offers are cached');
                setCheckServicesAndSubscriptionsOnlineCache(true);
                const cachedServicesAndSubscriptionsOnlineOffers = await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineServicesAndSubscriptionsOffers`);
                setOnlineServicesAndSubscriptionsCategorizedOfferList(cachedServicesAndSubscriptionsOnlineOffers);

                setIsLoadingOnlineServicesAndSubscriptionsCategorizedInProgress(false);
                (cachedServicesAndSubscriptionsOnlineOffers === null || cachedServicesAndSubscriptionsOnlineOffers.length < 20) && await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineServicesAndSubscriptionsOffers`, null);
            }

            // stop caching online offers until we have at least 20 and at most 100 offers loaded, or until we run out of offers to load.
            if ((marketplaceCache && onlineOfferList.length >= 20 && onlineOfferList.length < 100) || (marketplaceCache && noOnlineOffersToLoad)) {
                marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineOffers`).then(onlineOffersCached => {
                    // check if there's really a need for caching
                    if (((onlineOffersCached !== null && onlineOffersCached.length < onlineOfferList.length) || onlineOffersCached === null)) {
                        console.log('Caching additional online offers');
                        marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineOffers`, onlineOfferList);
                    }
                });
            }
            // stop caching online categorized offers until we have at least 5 and at most 20 offers loaded, or until we run out of offers to load.
            if ((marketplaceCache && onlineVeteransDayCategorizedOfferList.length >= 5 && onlineVeteransDayCategorizedOfferList.length < 20) || (marketplaceCache && noOnlineVeteransDayCategorizedOffersToLoad)) {
                marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineVeteransDayOffers`).then(onlineVeteransDayOffersCached => {
                    // check if there's really a need for caching
                    if (((onlineVeteransDayOffersCached !== null && onlineVeteransDayOffersCached.length < onlineVeteransDayCategorizedOfferList.length) || onlineVeteransDayOffersCached === null)) {
                        console.log('Caching additional online Veterans Day offers');
                        marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineVeteransDayOffers`, onlineVeteransDayCategorizedOfferList);
                    }
                });
            }
            if ((marketplaceCache && onlineFoodCategorizedOfferList.length >= 5 && onlineFoodCategorizedOfferList.length < 20) || (marketplaceCache && noOnlineFoodCategorizedOffersToLoad)) {
                marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineFoodOffers`).then(onlineFoodOffersCached => {
                    // check if there's really a need for caching
                    if (((onlineFoodOffersCached !== null && onlineFoodOffersCached.length < onlineFoodCategorizedOfferList.length) || onlineFoodOffersCached === null)) {
                        console.log('Caching additional online food offers');
                        marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineFoodOffers`, onlineFoodCategorizedOfferList);
                    }
                });
            }
            if ((marketplaceCache && onlineRetailCategorizedOfferList.length >= 5 && onlineRetailCategorizedOfferList.length < 20) || (marketplaceCache && noOnlineRetailCategorizedOffersToLoad)) {
                marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineRetailOffers`).then(onlineRetailOffersCached => {
                    // check if there's really a need for caching
                    if (((onlineRetailOffersCached !== null && onlineRetailOffersCached.length < onlineRetailCategorizedOfferList.length) || onlineRetailOffersCached === null)) {
                        console.log('Caching additional online retail offers');
                        marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineRetailOffers`, onlineRetailCategorizedOfferList);
                    }
                });
            }
            if ((marketplaceCache && onlineEntertainmentCategorizedOfferList.length >= 5 && onlineEntertainmentCategorizedOfferList.length < 20) || (marketplaceCache && noOnlineEntertainmentCategorizedOffersToLoad)) {
                marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineEntertainmentOffers`).then(onlineEntertainmentOffersCached => {
                    // check if there's really a need for caching
                    if (((onlineEntertainmentOffersCached !== null && onlineEntertainmentOffersCached.length < onlineEntertainmentCategorizedOfferList.length) || onlineEntertainmentOffersCached === null)) {
                        console.log('Caching additional online entertainment offers');
                        marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineEntertainmentOffers`, onlineEntertainmentCategorizedOfferList);
                    }
                });
            }
            if ((marketplaceCache && onlineElectronicsCategorizedOfferList.length >= 5 && onlineElectronicsCategorizedOfferList.length < 20) || (marketplaceCache && noOnlineElectronicsCategorizedOffersToLoad)) {
                marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineElectronicsOffers`).then(onlineElectronicsOffersCached => {
                    // check if there's really a need for caching
                    if (((onlineElectronicsOffersCached !== null && onlineElectronicsOffersCached.length < onlineElectronicsCategorizedOfferList.length) || onlineElectronicsOffersCached === null)) {
                        console.log('Caching additional online electronics offers');
                        marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineElectronicsOffers`, onlineElectronicsCategorizedOfferList);
                    }
                });
            }
            if ((marketplaceCache && onlineHomeCategorizedOfferList.length >= 5 && onlineHomeCategorizedOfferList.length < 20) || (marketplaceCache && noOnlineHomeCategorizedOffersToLoad)) {
                marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineHomeOffers`).then(onlineHomeOffersCached => {
                    // check if there's really a need for caching
                    if (((onlineHomeOffersCached !== null && onlineHomeOffersCached.length < onlineHomeCategorizedOfferList.length) || onlineHomeOffersCached === null)) {
                        console.log('Caching additional online home offers');
                        marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineHomeOffers`, onlineHomeCategorizedOfferList);
                    }
                });
            }
            if ((marketplaceCache && onlineHealthAndBeautyCategorizedOfferList.length >= 5 && onlineHealthAndBeautyCategorizedOfferList.length < 20) || (marketplaceCache && noOnlineHealthAndBeautyCategorizedOffersToLoad)) {
                marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineHealthAndBeautyOffers`).then(onlineHealthAndBeautyOffersCached => {
                    // check if there's really a need for caching
                    if (((onlineHealthAndBeautyOffersCached !== null && onlineHealthAndBeautyOffersCached.length < onlineHealthAndBeautyCategorizedOfferList.length) || onlineHealthAndBeautyOffersCached === null)) {
                        console.log('Caching additional online health and beauty offers');
                        marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineHealthAndBeautyOffers`, onlineHealthAndBeautyCategorizedOfferList);
                    }
                });
            }
            if ((marketplaceCache && onlineOfficeAndBusinessCategorizedOfferList.length >= 5 && onlineOfficeAndBusinessCategorizedOfferList.length < 20) || (marketplaceCache && noOnlineOfficeAndBusinessCategorizedOffersToLoad)) {
                marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineOfficeAndBusinessOffers`).then(onlineOfficeAndBusinessOffersCached => {
                    // check if there's really a need for caching
                    if (((onlineOfficeAndBusinessOffersCached !== null && onlineOfficeAndBusinessOffersCached.length < onlineOfficeAndBusinessCategorizedOfferList.length) || onlineOfficeAndBusinessOffersCached === null)) {
                        console.log('Caching additional online office and business offers');
                        marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineOfficeAndBusinessOffers`, onlineOfficeAndBusinessCategorizedOfferList);
                    }
                });
            }
            if ((marketplaceCache && onlineServicesAndSubscriptionsCategorizedOfferList.length >= 5 && onlineServicesAndSubscriptionsCategorizedOfferList.length < 20) || (marketplaceCache && noOnlineServicesAndSubscriptionsCategorizedOffersToLoad)) {
                marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineServicesAndSubscriptionsOffers`).then(onlineServicesAndSubscriptionsOffersCached => {
                    // check if there's really a need for caching
                    if (((onlineServicesAndSubscriptionsOffersCached !== null && onlineServicesAndSubscriptionsOffersCached.length < onlineServicesAndSubscriptionsCategorizedOfferList.length) || onlineServicesAndSubscriptionsOffersCached === null)) {
                        console.log('Caching additional online services and subscriptions offers');
                        marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineServicesAndSubscriptionsOffers`, onlineServicesAndSubscriptionsCategorizedOfferList);
                    }
                });
            }

            if (envInfo.envName === Stages.DEV) {
                if (reloadNearbyDueToPermissionsChange) {
                    setIsLoadingOnlineInProgress(false);
                    setIsLoadingOnlineVeteransDayCategorizedInProgress(false);
                    setIsLoadingOnlineFoodCategorizedInProgress(false);
                    setIsLoadingOnlineRetailCategorizedInProgress(false);
                    setIsLoadingOnlineEntertainmentCategorizedInProgress(false);
                    setIsLoadingOnlineElectronicsCategorizedInProgress(false);
                    setIsLoadingOnlineHomeCategorizedInProgress(false);
                    setIsLoadingOnlineHealthAndBeautyCategorizedInProgress(false);
                    setIsLoadingOnlineOfficeAndBusinessCategorizedInProgress(false);
                    setIsLoadingOnlineServicesAndSubscriptionsCategorizedInProgress(false);

                    setIsLoadingNearbyOffersInProgress(false);
                    setIsLoadingNearbyFoodCategorizedOffersInProgress(false);
                    setIsLoadingNearbyRetailCategorizedOffersInProgress(false);
                    setIsLoadingNearbyEntertainmentCategorizedOffersInProgress(false);
                    setIsLoadingNearbyElectronicsCategorizedOffersInProgress(false);
                    setIsLoadingNearbyHomeCategorizedOffersInProgress(false);
                    setIsLoadingNearbyHealthAndBeautyCategorizedOffersInProgress(false);
                    setIsLoadingNearbyOfficeAndBusinessCategorizedOffersInProgress(false);
                    setIsLoadingNearbyServicesAndSubscriptionsCategorizedOffersInProgress(false);

                    setIsLoadingNearbyOffersForHorizontalMapInProgress(false)

                    setAreOffersForMainHorizontalMapLoaded(false);
                    setIsLoadingNearbyOffersForFullScreenMapInProgress(false);
                    setAreOffersForFullScreenMapLoaded(false);

                    setNoNearbyOffersToLoad(false);
                    setNoNearbyFoodCategorizedOffersToLoad(false);
                    setNoNearbyRetailCategorizedOffersToLoad(false);
                    setNoNearbyEntertainmentCategorizedOffersToLoad(false);
                    setNoNearbyElectronicsCategorizedOffersToLoad(false);
                    setNoNearbyHomeCategorizedOffersToLoad(false);
                    setNoNearbyHealthAndBeautyCategorizedOffersToLoad(false);
                    setNoNearbyOfficeAndBusinessCategorizedOffersToLoad(false);
                    setNoNearbyServicesAndSubscriptionsCategorizedOffersToLoad(false);

                    setNoOnlineOffersToLoad(false);
                    setNoOnlineVeteransDayCategorizedOffersToLoad(false);
                    setNoOnlineFoodCategorizedOffersToLoad(false);
                    setNoOnlineRetailCategorizedOffersToLoad(false);
                    setNoOnlineEntertainmentCategorizedOffersToLoad(false);
                    setNoOnlineElectronicsCategorizedOffersToLoad(false);
                    setNoOnlineHomeCategorizedOffersToLoad(false);
                    setNoOnlineHealthAndBeautyCategorizedOffersToLoad(false);
                    setNoOnlineOfficeAndBusinessCategorizedOffersToLoad(false);
                    setNoOnlineServicesAndSubscriptionsCategorizedOffersToLoad(false);

                    setReloadNearbyDueToPermissionsChange(false);
                }

                /**
                 * pre-emptively load in parallel:
                 * - nearby offers for main horizontal map
                 * - nearby premier
                 * - nearby regular
                 * - online premier
                 * - online regular offers
                 * - all categorized offers (online + nearby)
                 */
                await Promise.all([
                    !loadingOnlineInProgress && !noPremierOnlineOffersToLoad && onlineOfferList.length < PremierOnlineProdOfferIds.length && loadPremierOnlineData(),
                    !loadingOnlineInProgress && !noOnlineOffersToLoad && PremierOnlineProdOfferIds.length <= onlineOfferList.length && onlineOfferList.length < 100 && loadOnlineData(),
                    !loadingOnlineVeteransDayCategorizedInProgress && !noOnlineVeteransDayCategorizedOffersToLoad && onlineVeteransDayCategorizedOfferList.length < 20 && loadOnlineVeteransDayCategorizedData(),
                    // !loadingOnlineFoodCategorizedInProgress && !noOnlineFoodCategorizedOffersToLoad && onlineFoodCategorizedOfferList.length < 20 && loadOnlineFoodCategorizedData(),
                    // !loadingOnlineRetailCategorizedInProgress && !noOnlineRetailCategorizedOffersToLoad && onlineRetailCategorizedOfferList.length < 20 && loadOnlineRetailCategorizedData(),
                    // !loadingOnlineEntertainmentCategorizedInProgress && !noOnlineEntertainmentCategorizedOffersToLoad && onlineEntertainmentCategorizedOfferList.length < 20 && loadOnlineEntertainmentCategorizedData(),
                    // !loadingOnlineElectronicsCategorizedInProgress && !noOnlineElectronicsCategorizedOffersToLoad && onlineElectronicsCategorizedOfferList.length < 20 && loadOnlineElectronicsCategorizedData(),
                    // !loadingOnlineHomeCategorizedInProgress && !noOnlineHomeCategorizedOffersToLoad && onlineHomeCategorizedOfferList.length < 20 && loadOnlineHomeCategorizedData(),
                    // !loadingOnlineHealthAndBeautyCategorizedInProgress && !noOnlineHealthAndBeautyCategorizedOffersToLoad && onlineHealthAndBeautyCategorizedOfferList.length < 20 && loadOnlineHealthAndBeautyCategorizedData(),
                    // !loadingOnlineOfficeAndBusinessCategorizedInProgress && !noOnlineOfficeAndBusinessCategorizedOffersToLoad && onlineOfficeAndBusinessCategorizedOfferList.length < 20 && loadOnlineOfficeAndBusinessCategorizedData(),
                    // !loadingOnlineServicesAndSubscriptionsCategorizedInProgress && !noOnlineServicesAndSubscriptionsCategorizedOffersToLoad && onlineServicesAndSubscriptionsCategorizedOfferList.length < 20 && loadOnlineServicesAndSubscriptionsCategorizedData(),
                    // !loadingNearbyOffersForHorizontalMapInProgress && !areOffersForMainHorizontalMapLoaded && nearbyOffersListForMainHorizontalMap.length === 0 && loadNearbyDataForMainHorizontalMap(),
                    // !loadingNearbyOffersForFullScreenMapInProgress && !areOffersForFullScreenMapLoaded && nearbyOffersListForFullScreenMap.length === 0 && loadNearbyDataForFullScreenMap(),
                    // !loadingNearbyOffersInProgress && !noNearbyOffersToLoad && loadPremierNearbyData(),
                    // !loadingNearbyOffersInProgress && !noNearbyOffersToLoad && nearbyOfferList.length < 100 && loadNearbyData(),
                    // !loadingNearbyFoodCategorizedOffersInProgress && !noNearbyFoodCategorizedOffersToLoad && nearbyFoodCategorizedOfferList.length < 20 && loadNearbyFoodCategorizedData(),
                    // !loadingNearbyRetailCategorizedOffersInProgress && !noNearbyRetailCategorizedOffersToLoad && nearbyRetailCategorizedOfferList.length < 20 && loadNearbyRetailCategorizedData(),
                    // !loadingNearbyEntertainmentCategorizedOffersInProgress && !noNearbyEntertainmentCategorizedOffersToLoad && nearbyEntertainmentCategorizedOfferList.length < 20 && loadNearbyEntertainmentCategorizedData(),
                    // !loadingNearbyElectronicsCategorizedOffersInProgress && !noNearbyElectronicsCategorizedOffersToLoad && nearbyElectronicsCategorizedOfferList.length < 20 && loadNearbyElectronicsCategorizedData(),
                    // !loadingNearbyHomeCategorizedOffersInProgress && !noNearbyHomeCategorizedOffersToLoad && nearbyHomeCategorizedOfferList.length < 20 && loadNearbyHomeCategorizedData(),
                    // !loadingNearbyHealthAndBeautyCategorizedOffersInProgress && !noNearbyHealthAndBeautyCategorizedOffersToLoad && nearbyHealthAndBeautyCategorizedOfferList.length < 20 && loadNearbyHealthAndBeautyCategorizedData(),
                    // !loadingNearbyOfficeAndBusinessCategorizedOffersInProgress && !noNearbyOfficeAndBusinessCategorizedOffersToLoad && nearbyOfficeAndBusinessCategorizedOfferList.length < 20 && loadNearbyOfficeAndBusinessCategorizedData(),
                    // !loadingNearbyServicesAndSubscriptionsCategorizedOffersInProgress && !noNearbyServicesAndSubscriptionsCategorizedOffersToLoad && nearbyServicesAndSubscriptionsCategorizedOfferList.length < 20 && loadNearbyServicesAndSubscriptionsCategorizedData()
                ]);
            }
            if (envInfo.envName === Stages.PROD) {
                if (reloadNearbyDueToPermissionsChange) {
                    setIsLoadingOnlineInProgress(false);
                    setIsLoadingOnlineVeteransDayCategorizedInProgress(false);
                    setIsLoadingOnlineFoodCategorizedInProgress(false);
                    setIsLoadingOnlineRetailCategorizedInProgress(false);
                    setIsLoadingOnlineEntertainmentCategorizedInProgress(false);
                    setIsLoadingOnlineElectronicsCategorizedInProgress(false);
                    setIsLoadingOnlineHomeCategorizedInProgress(false);
                    setIsLoadingOnlineHealthAndBeautyCategorizedInProgress(false);
                    setIsLoadingOnlineOfficeAndBusinessCategorizedInProgress(false);
                    setIsLoadingOnlineServicesAndSubscriptionsCategorizedInProgress(false);

                    setIsLoadingNearbyOffersInProgress(false);
                    setIsLoadingNearbyFoodCategorizedOffersInProgress(false);
                    setIsLoadingNearbyRetailCategorizedOffersInProgress(false);
                    setIsLoadingNearbyEntertainmentCategorizedOffersInProgress(false);
                    setIsLoadingNearbyElectronicsCategorizedOffersInProgress(false);
                    setIsLoadingNearbyHomeCategorizedOffersInProgress(false);
                    setIsLoadingNearbyHealthAndBeautyCategorizedOffersInProgress(false);
                    setIsLoadingNearbyOfficeAndBusinessCategorizedOffersInProgress(false);
                    setIsLoadingNearbyServicesAndSubscriptionsCategorizedOffersInProgress(false);

                    setIsLoadingNearbyOffersForHorizontalMapInProgress(false)

                    setAreOffersForMainHorizontalMapLoaded(false);
                    setIsLoadingNearbyOffersForFullScreenMapInProgress(false);
                    setAreOffersForFullScreenMapLoaded(false);

                    setNoNearbyOffersToLoad(false);
                    setNoNearbyFoodCategorizedOffersToLoad(false);
                    setNoNearbyRetailCategorizedOffersToLoad(false);
                    setNoNearbyEntertainmentCategorizedOffersToLoad(false);
                    setNoNearbyElectronicsCategorizedOffersToLoad(false);
                    setNoNearbyHomeCategorizedOffersToLoad(false);
                    setNoNearbyHealthAndBeautyCategorizedOffersToLoad(false);
                    setNoNearbyOfficeAndBusinessCategorizedOffersToLoad(false);
                    setNoNearbyServicesAndSubscriptionsCategorizedOffersToLoad(false);

                    setNoOnlineOffersToLoad(false);
                    setNoOnlineVeteransDayCategorizedOffersToLoad(false);
                    setNoOnlineFoodCategorizedOffersToLoad(false);
                    setNoOnlineRetailCategorizedOffersToLoad(false);
                    setNoOnlineEntertainmentCategorizedOffersToLoad(false);
                    setNoOnlineElectronicsCategorizedOffersToLoad(false);
                    setNoOnlineHomeCategorizedOffersToLoad(false);
                    setNoOnlineHealthAndBeautyCategorizedOffersToLoad(false);
                    setNoOnlineOfficeAndBusinessCategorizedOffersToLoad(false);
                    setNoOnlineServicesAndSubscriptionsCategorizedOffersToLoad(false);

                    setReloadNearbyDueToPermissionsChange(false);
                }

                /**
                 * pre-emptively load in parallel:
                 * - nearby offers for main horizontal map
                 * - nearby premier
                 * - nearby regular
                 * - online premier
                 * - online regular offers
                 * - all categorized offers (online + nearby)
                 */
                await Promise.all([
                    !loadingOnlineInProgress && !noPremierOnlineOffersToLoad && onlineOfferList.length < PremierOnlineProdOfferIds.length && loadPremierOnlineData(),
                    !loadingOnlineInProgress && !noOnlineOffersToLoad && PremierOnlineProdOfferIds.length <= onlineOfferList.length && onlineOfferList.length < 100 && loadOnlineData(),
                    !loadingOnlineVeteransDayCategorizedInProgress && !noOnlineVeteransDayCategorizedOffersToLoad && onlineVeteransDayCategorizedOfferList.length < 20 && loadOnlineVeteransDayCategorizedData(),
                    !loadingOnlineFoodCategorizedInProgress && !noOnlineFoodCategorizedOffersToLoad && onlineFoodCategorizedOfferList.length < 20 && loadOnlineFoodCategorizedData(),
                    !loadingOnlineRetailCategorizedInProgress && !noOnlineRetailCategorizedOffersToLoad && onlineRetailCategorizedOfferList.length < 20 && loadOnlineRetailCategorizedData(),
                    !loadingOnlineEntertainmentCategorizedInProgress && !noOnlineEntertainmentCategorizedOffersToLoad && onlineEntertainmentCategorizedOfferList.length < 20 && loadOnlineEntertainmentCategorizedData(),
                    !loadingOnlineElectronicsCategorizedInProgress && !noOnlineElectronicsCategorizedOffersToLoad && onlineElectronicsCategorizedOfferList.length < 20 && loadOnlineElectronicsCategorizedData(),
                    !loadingOnlineHomeCategorizedInProgress && !noOnlineHomeCategorizedOffersToLoad && onlineHomeCategorizedOfferList.length < 20 && loadOnlineHomeCategorizedData(),
                    !loadingOnlineHealthAndBeautyCategorizedInProgress && !noOnlineHealthAndBeautyCategorizedOffersToLoad && onlineHealthAndBeautyCategorizedOfferList.length < 20 && loadOnlineHealthAndBeautyCategorizedData(),
                    !loadingOnlineOfficeAndBusinessCategorizedInProgress && !noOnlineOfficeAndBusinessCategorizedOffersToLoad && onlineOfficeAndBusinessCategorizedOfferList.length < 20 && loadOnlineOfficeAndBusinessCategorizedData(),
                    !loadingOnlineServicesAndSubscriptionsCategorizedInProgress && !noOnlineServicesAndSubscriptionsCategorizedOffersToLoad && onlineServicesAndSubscriptionsCategorizedOfferList.length < 20 && loadOnlineServicesAndSubscriptionsCategorizedData(),
                    !loadingNearbyOffersForHorizontalMapInProgress && !areOffersForMainHorizontalMapLoaded && nearbyOffersListForMainHorizontalMap.length === 0 && loadNearbyDataForMainHorizontalMap(),
                    !loadingNearbyOffersForFullScreenMapInProgress && !areOffersForFullScreenMapLoaded && nearbyOffersListForFullScreenMap.length === 0 && loadNearbyDataForFullScreenMap(),
                    !loadingNearbyOffersInProgress && !noNearbyOffersToLoad && loadPremierNearbyData(),
                    !loadingNearbyOffersInProgress && !noNearbyOffersToLoad && nearbyOfferList.length < 100 && loadNearbyData(),
                    !loadingNearbyFoodCategorizedOffersInProgress && !noNearbyFoodCategorizedOffersToLoad && nearbyFoodCategorizedOfferList.length < 20 && loadNearbyFoodCategorizedData(),
                    !loadingNearbyRetailCategorizedOffersInProgress && !noNearbyRetailCategorizedOffersToLoad && nearbyRetailCategorizedOfferList.length < 20 && loadNearbyRetailCategorizedData(),
                    !loadingNearbyEntertainmentCategorizedOffersInProgress && !noNearbyEntertainmentCategorizedOffersToLoad && nearbyEntertainmentCategorizedOfferList.length < 20 && loadNearbyEntertainmentCategorizedData(),
                    !loadingNearbyElectronicsCategorizedOffersInProgress && !noNearbyElectronicsCategorizedOffersToLoad && nearbyElectronicsCategorizedOfferList.length < 20 && loadNearbyElectronicsCategorizedData(),
                    !loadingNearbyHomeCategorizedOffersInProgress && !noNearbyHomeCategorizedOffersToLoad && nearbyHomeCategorizedOfferList.length < 20 && loadNearbyHomeCategorizedData(),
                    !loadingNearbyHealthAndBeautyCategorizedOffersInProgress && !noNearbyHealthAndBeautyCategorizedOffersToLoad && nearbyHealthAndBeautyCategorizedOfferList.length < 20 && loadNearbyHealthAndBeautyCategorizedData(),
                    !loadingNearbyOfficeAndBusinessCategorizedOffersInProgress && !noNearbyOfficeAndBusinessCategorizedOffersToLoad && nearbyOfficeAndBusinessCategorizedOfferList.length < 20 && loadNearbyOfficeAndBusinessCategorizedData(),
                    !loadingNearbyServicesAndSubscriptionsCategorizedOffersInProgress && !noNearbyServicesAndSubscriptionsCategorizedOffersToLoad && nearbyServicesAndSubscriptionsCategorizedOfferList.length < 20 && loadNearbyServicesAndSubscriptionsCategorizedData()
                ]);
            }
        }

        /**
         * Function used to contact support, via the native messaging application.
         */
        const contactSupport = async (): Promise<void> => {
            const isAvailable = await SMS.isAvailableAsync();
            if (isAvailable) {
                // customize the SMS message below
                const result = await SMS.sendSMSAsync(
                    ['210-744-6222'],
                    'Hello I would like some help with: ',
                    {}
                );
                // switch based on the result received from the async SMS action
                switch (result.result) {
                    case 'sent':
                        console.log('Message sent!');
                        break;
                    case 'unknown':
                        console.log('Unknown error has occurred while attempting to send a message!');
                        break;
                    case 'cancelled':
                        console.log('Message was cancelled!');
                        break;
                }
            } else {
                // there's no SMS available on this device
                console.log('no SMS available');
            }
        }

        // return the component for the Authentication stack
        return (
            <>
                <View style={{flex: 1, backgroundColor: '#313030'}}>
                    <Stack.Navigator
                        initialRouteName={useRecoilValue(initialAuthenticationScreen) == 'SignIn' ? "SignIn" : 'Registration'}
                        screenOptions={{
                            headerShown: false,
                            gestureEnabled: false
                        }}
                    >
                        <Stack.Screen
                            name="SignIn"
                            component={SignInComponent}
                            initialParams={{}}
                        />
                        <Stack.Screen
                            name="Registration"
                            component={RegistrationComponent}
                            options={({navigation}) => {
                                return ({
                                    headerTitle: '',
                                    headerShown: true,
                                    headerTransparent: true,
                                    headerRight: () => {
                                        return useRecoilValue(registrationBackButtonShown) || (stepNumber >= 3 && stepNumber !== 8)
                                            ? (
                                                <IconButton
                                                    icon="help"
                                                    iconColor={"#F2FF5D"}
                                                    size={hp(3)}
                                                    style={[commonStyles.backButton, !isRegistrationReady && {display: 'none'}]}
                                                    onPress={async () => {
                                                        // go to the support
                                                        await contactSupport();
                                                    }}
                                                />) : <>{}</>
                                    },
                                    headerLeft: () => {
                                        return useRecoilValue(registrationBackButtonShown)
                                            ?
                                            (<IconButton
                                                icon="chevron-left"
                                                iconColor={"#FFFFFF"}
                                                size={hp(3)}
                                                style={[commonStyles.backButton, !isRegistrationReady && {display: 'none'}]}
                                                onPress={() => {
                                                    // clear the registration values
                                                    // step 1
                                                    setFirstName("");
                                                    setLastName("");
                                                    setEmail("");
                                                    setBirthday("");
                                                    setPhoneNumber("");
                                                    setDutyStatus("");
                                                    setEnlistingYear("");
                                                    // step 2
                                                    setAddressLine("");
                                                    setAddressCity("");
                                                    setAddressZip("");
                                                    setAddressState("");
                                                    setMilitaryBranch("");
                                                    // step 3
                                                    setPassword("");
                                                    setConfirmationPassword("");
                                                    setAccountRegistrationDisclaimer(false);
                                                    setAmplifySignUpErrors([]);
                                                    // do not need to clear next steps because back button won't be shown for subsequent ones

                                                    // main
                                                    setRegistrationMainError(false);
                                                    setStepNumber(0);

                                                    // navigate to the AppOverviewComponent page - in case we have not already been to the SignIn
                                                    if (isLoadingAppOverviewNeeded) {
                                                        // navigate to the SignIn page - in case we have already been there
                                                        mainRootNavigation && mainRootNavigation!.navigate('AppOverview', {
                                                            marketplaceCache: route.params.marketplaceCache,
                                                            cache: route.params.cache,
                                                            expoPushToken: route.params.expoPushToken,
                                                            onLayoutRootView: route.params.onLayoutRootView
                                                        });
                                                    } else {
                                                        // navigate to the SignIn page - in case we have already been there
                                                        navigation.navigate('SignIn', {});
                                                    }
                                                }}
                                            />)
                                            : (stepNumber === 4 || stepNumber === 7 ?
                                                <TouchableOpacity
                                                    style={[styles.buttonSkip, !isRegistrationReady && {display: 'none'}]}
                                                    onPress={async () => {
                                                        if (stepNumber === 4) {
                                                            // skip the current step
                                                            setStepNumber(stepNumber + 1);

                                                            // clear the registration error
                                                            setRegistrationMainError(false);
                                                        } else {
                                                            // clear the registration error
                                                            setRegistrationMainError(false);

                                                            setIsReady(false);
                                                            /**
                                                             * if everything was successful, then:
                                                             * - we just cache the list of:
                                                             *      - Fidelis partners for initial load (for 1 week only)
                                                             *      - the list of online offers (first page only) for initial load (for 1 week only)
                                                             *      - the list of offers near user's home address (first page only) for initial load (for 1 week only)
                                                             *       - the list of categorized online offers
                                                             * - we just cache an empty profile photo for the user for initial load
                                                             */
                                                            if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-fidelisPartners`) !== null) {
                                                                console.log('old Fidelis Partners are cached, needs cleaning up');
                                                                await marketplaceCache!.removeItem(`${userInformation["custom:userId"]}-fidelisPartners`);
                                                                await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-fidelisPartners`, await retrieveFidelisPartnerList());
                                                            } else {
                                                                console.log('Fidelis Partners are not cached');
                                                                marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-fidelisPartners`, await retrieveFidelisPartnerList());
                                                            }
                                                            if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineOffers`) !== null) {
                                                                console.log('online offers are cached, needs cleaning up');
                                                                await marketplaceCache!.removeItem(`${userInformation["custom:userId"]}-onlineOffers`);
                                                                await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineOffers`,
                                                                    await retrieveOnlineOffersList(numberOfOnlineOffers, setNumberOfOnlineOffers));
                                                            } else {
                                                                console.log('online offers are not cached');
                                                                marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineOffers`,
                                                                    await retrieveOnlineOffersList(numberOfOnlineOffers, setNumberOfOnlineOffers));
                                                            }
                                                            if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineVeteransDayOffers`) !== null) {
                                                                console.log('online Veterans Day offers are cached, needs cleaning up');
                                                                await marketplaceCache!.removeItem(`${userInformation["custom:userId"]}-onlineVeteransDayOffers`);
                                                                await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineVeteransDayOffers`,
                                                                    await retrieveCategorizedOnlineOffersList(numberOfVeteransDayCategorizedOnlineOffers, setNumberOfVeteransDayCategorizedOnlineOffers, OfferCategory.VeteranDay));
                                                            } else {
                                                                console.log('online Veterans Day offers are not cached');
                                                                marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineVeteransDayOffers`,
                                                                    await retrieveCategorizedOnlineOffersList(numberOfVeteransDayCategorizedOnlineOffers, setNumberOfVeteransDayCategorizedOnlineOffers, OfferCategory.VeteranDay));
                                                            }
                                                            if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineFoodOffers`) !== null) {
                                                                console.log('online food offers are cached, needs cleaning up');
                                                                await marketplaceCache!.removeItem(`${userInformation["custom:userId"]}-onlineFoodOffers`);
                                                                await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineFoodOffers`,
                                                                    await retrieveCategorizedOnlineOffersList(numberOfFoodCategorizedOnlineOffers, setNumberOfFoodCategorizedOnlineOffers, OfferCategory.Food));
                                                            } else {
                                                                console.log('online food offers are not cached');
                                                                marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineFoodOffers`,
                                                                    await retrieveCategorizedOnlineOffersList(numberOfFoodCategorizedOnlineOffers, setNumberOfFoodCategorizedOnlineOffers, OfferCategory.Food));
                                                            }
                                                            if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineRetailOffers`) !== null) {
                                                                console.log('online retail offers are cached, needs cleaning up');
                                                                await marketplaceCache!.removeItem(`${userInformation["custom:userId"]}-onlineRetailOffers`);
                                                                await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineRetailOffers`,
                                                                    await retrieveCategorizedOnlineOffersList(numberOfRetailCategorizedOnlineOffers, setNumberOfRetailCategorizedOnlineOffers, OfferCategory.Retail));
                                                            } else {
                                                                console.log('online retail offers are not cached');
                                                                marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineRetailOffers`,
                                                                    await retrieveCategorizedOnlineOffersList(numberOfRetailCategorizedOnlineOffers, setNumberOfRetailCategorizedOnlineOffers, OfferCategory.Retail));
                                                            }
                                                            if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineEntertainmentOffers`) !== null) {
                                                                console.log('online entertainment offers are cached, needs cleaning up');
                                                                await marketplaceCache!.removeItem(`${userInformation["custom:userId"]}-onlineEntertainmentOffers`);
                                                                await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineEntertainmentOffers`,
                                                                    await retrieveCategorizedOnlineOffersList(numberOfEntertainmentCategorizedOnlineOffers, setNumberOfEntertainmentCategorizedOnlineOffers, OfferCategory.Entertainment));
                                                            } else {
                                                                console.log('online entertainment offers are not cached');
                                                                marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineEntertainmentOffers`,
                                                                    await retrieveCategorizedOnlineOffersList(numberOfEntertainmentCategorizedOnlineOffers, setNumberOfEntertainmentCategorizedOnlineOffers, OfferCategory.Entertainment));
                                                            }
                                                            if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineElectronicsOffers`) !== null) {
                                                                console.log('online electronics offers are cached, needs cleaning up');
                                                                await marketplaceCache!.removeItem(`${userInformation["custom:userId"]}-onlineElectronicsOffers`);
                                                                await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineElectronicsOffers`,
                                                                    await retrieveCategorizedOnlineOffersList(numberOfElectronicsCategorizedOnlineOffers, setNumberOfElectronicsCategorizedOnlineOffers, OfferCategory.Electronics));
                                                            } else {
                                                                console.log('online electronics offers are not cached');
                                                                marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineElectronicsOffers`,
                                                                    await retrieveCategorizedOnlineOffersList(numberOfElectronicsCategorizedOnlineOffers, setNumberOfElectronicsCategorizedOnlineOffers, OfferCategory.Electronics));
                                                            }
                                                            if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineHomeOffers`) !== null) {
                                                                console.log('online home offers are cached, needs cleaning up');
                                                                await marketplaceCache!.removeItem(`${userInformation["custom:userId"]}-onlineHomeOffers`);
                                                                await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineHomeOffers`,
                                                                    await retrieveCategorizedOnlineOffersList(numberOfHomeCategorizedOnlineOffers, setNumberOfHomeCategorizedOnlineOffers, OfferCategory.Home));
                                                            } else {
                                                                console.log('online home offers are not cached');
                                                                marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineHomeOffers`,
                                                                    await retrieveCategorizedOnlineOffersList(numberOfHomeCategorizedOnlineOffers, setNumberOfHomeCategorizedOnlineOffers, OfferCategory.Home));
                                                            }
                                                            if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineHealthAndBeautyOffers`) !== null) {
                                                                console.log('online health and beauty offers are cached, needs cleaning up');
                                                                await marketplaceCache!.removeItem(`${userInformation["custom:userId"]}-onlineHealthAndBeautyOffers`);
                                                                await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineHealthAndBeautyOffers`,
                                                                    await retrieveCategorizedOnlineOffersList(numberOfHealthAndBeautyCategorizedOnlineOffers, setNumberOfHealthAndBeautyCategorizedOnlineOffers, OfferCategory.HealthAndBeauty));
                                                            } else {
                                                                console.log('online health and beauty offers are not cached');
                                                                marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineHealthAndBeautyOffers`,
                                                                    await retrieveCategorizedOnlineOffersList(numberOfHealthAndBeautyCategorizedOnlineOffers, setNumberOfHealthAndBeautyCategorizedOnlineOffers, OfferCategory.HealthAndBeauty));
                                                            }
                                                            if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineOfficeAndBusinessOffers`) !== null) {
                                                                console.log('online office and business offers are cached, needs cleaning up');
                                                                await marketplaceCache!.removeItem(`${userInformation["custom:userId"]}-onlineOfficeAndBusinessOffers`);
                                                                await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineOfficeAndBusinessOffers`,
                                                                    await retrieveCategorizedOnlineOffersList(numberOfOfficeAndBusinessCategorizedOnlineOffers, setNumberOfOfficeAndBusinessCategorizedOnlineOffers, OfferCategory.OfficeAndBusiness));
                                                            } else {
                                                                console.log('online office and business offers are not cached');
                                                                marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineOfficeAndBusinessOffers`,
                                                                    await retrieveCategorizedOnlineOffersList(numberOfOfficeAndBusinessCategorizedOnlineOffers, setNumberOfOfficeAndBusinessCategorizedOnlineOffers, OfferCategory.OfficeAndBusiness));
                                                            }
                                                            if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineServicesAndSubscriptionsOffers`) !== null) {
                                                                console.log('online services and subscriptions offers are cached, needs cleaning up');
                                                                await marketplaceCache!.removeItem(`${userInformation["custom:userId"]}-onlineServicesAndSubscriptionsOffers`);
                                                                await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineServicesAndSubscriptionsOffers`,
                                                                    await retrieveCategorizedOnlineOffersList(numberOfServicesAndSubscriptionsCategorizedOnlineOffers, setNumberOfServicesAndSubscriptionsCategorizedOnlineOffers, OfferCategory.ServicesAndSubscriptions));
                                                            } else {
                                                                console.log('online services and subscriptions offers are not cached');
                                                                marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineServicesAndSubscriptionsOffers`,
                                                                    await retrieveCategorizedOnlineOffersList(numberOfServicesAndSubscriptionsCategorizedOnlineOffers, setNumberOfServicesAndSubscriptionsCategorizedOnlineOffers, OfferCategory.ServicesAndSubscriptions));
                                                            }
                                                            if (globalCache && await globalCache!.getItem(`${userInformation["custom:userId"]}-profilePictureURI`) !== null) {
                                                                console.log('old profile picture is cached, needs cleaning up');
                                                                await globalCache!.removeItem(`${userInformation["custom:userId"]}-profilePictureURI`);
                                                                await globalCache!.setItem(`${userInformation["custom:userId"]}-profilePictureURI`, "");
                                                            } else {
                                                                console.log('profile picture is not cached');
                                                                globalCache && globalCache!.setItem(`${userInformation["custom:userId"]}-profilePictureURI`, "");
                                                            }
                                                            setIsReady(true);

                                                            // go to the dashboard
                                                            navigation.navigate("AppDrawer", {});
                                                        }
                                                    }}
                                                >
                                                    <Text style={styles.buttonSkipText}>Skip</Text>
                                                </TouchableOpacity> : <></>)
                                    }
                                })
                            }}
                            initialParams={{}}
                        />
                        <Stack.Screen
                            name="AccountRecovery"
                            component={AccountRecoveryComponent}
                            initialParams={{}}
                        />
                        <Stack.Screen
                            name="AppDrawer"
                            component={AppDrawer}
                            initialParams={{}}
                        />
                        <Stack.Screen
                            name="DocumentsViewer"
                            component={DocumentsViewer}
                            initialParams={{}}
                        />
                    </Stack.Navigator>
                </View>
            </>
        );
    }
;

