import React, {useEffect} from 'react';
import {Image, ImageSourcePropType, SafeAreaView, Text, View} from "react-native";
import {styles} from '../../styles/splashScreen.module';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {Icon} from "@rneui/base";
import {useRecoilState, useResetRecoilState} from "recoil";
import {
    accountCreationDisclaimerCheckState,
    additionalDocumentationErrors,
    additionalDocumentationNeeded,
    addressCityErrorsState,
    addressCityState,
    addressLineErrorsState,
    addressLineState,
    addressStateErrorsState,
    addressStateState,
    addressZipErrorsState,
    addressZipState,
    amplifySignUpProcessErrorsState,
    authRegistrationNavigation,
    automaticallyVerifyRegistrationCodeState,
    birthdayErrorState,
    birthdayState,
    cardLinkingRegistrationStatusState,
    currentMemberAffiliationState,
    currentUserInformation,
    deferToLoginState,
    documentsReCapturePhotoState,
    documentsRePickPhotoState,
    dutyStatusErrorsState,
    dutyStatusState,
    dutyStatusValueState,
    emailErrorsState,
    emailState,
    enlistingYearErrorsState,
    enlistingYearState,
    expoPushTokenState,
    firstNameErrorsState,
    firstNameState,
    globalAmplifyCacheState,
    initialAuthenticationScreen,
    isDocumentUploadedState,
    isLoadingAppOverviewNeededState,
    isPhotoUploadedState,
    isReadyRegistrationState,
    lastNameErrorsState,
    lastNameState,
    mainRootNavigationState,
    marketplaceAmplifyCacheState,
    militaryBranchErrorsState,
    militaryBranchState,
    militaryBranchValueState,
    militaryRegistrationDisclaimerCheckState,
    militaryVerificationStatus,
    permissionsInstructionsCustomMessageState,
    permissionsModalCustomMessageState,
    permissionsModalVisibleState,
    phoneNumberErrorsState,
    phoneNumberState,
    registrationBackButtonShown,
    registrationCodeTimerValue,
    registrationConfirmationPasswordErrorsState,
    registrationConfirmationPasswordState,
    registrationMainErrorState,
    registrationPasswordErrorsState,
    registrationPasswordState,
    registrationStepNumber,
    registrationVerificationDigit1,
    registrationVerificationDigit2,
    registrationVerificationDigit3,
    registrationVerificationDigit4,
    registrationVerificationDigit5,
    registrationVerificationDigit6,
    ssnErrorsState,
    ssnState,
    userIsAuthenticatedState,
    verificationCodeErrorsState,
    verificationDocumentState, filteredOffersSpinnerShownState
} from "../../recoil/AuthAtom";
import {
    clickOnlyOnlineOffersListState,
    clickOnlyOnlineOffersPageNumberState,
    currentActiveKitState,
    fidelisPartnerListState,
    filteredByDiscountPressedState, filteredOffersListState,
    filtersActiveState,
    fullScreenKitMapActiveState,
    isElectronicsKitLoadedState,
    isEntertainmentKitLoadedState,
    isFoodKitLoadedState,
    isHealthAndBeautyKitLoadedState,
    isHomeKitLoadedState,
    isOfficeAndBusinessKitLoadedState,
    isRetailKitLoadedState,
    isServicesAndSubscriptionsKitLoadedState,
    isVeteransDayKitLoadedState,
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
    nearbyKitListIsExpandedState,
    nearbyOffersListForFullScreenMapState,
    nearbyOffersListForMainHorizontalMapState,
    nearbyOffersListState,
    nearbyOffersPageNumberState,
    nearbyOffersSpinnerShownState,
    nearbyOfficeAndBusinessCategorizedOffersListState,
    nearbyOfficeAndBusinessCategorizedOffersPageNumberState,
    nearbyRetailCategorizedOffersListState,
    nearbyRetailCategorizedOffersPageNumberState,
    nearbyServicesAndSubscriptionsCategorizedOffersListState,
    nearbyServicesAndSubscriptionsCategorizedOffersPageNumberState,
    noClickOnlyOnlineOffersToLoadState, noFilteredOffersToLoadState,
    noNearbyElectronicsCategorizedOffersToLoadState,
    noNearbyEntertainmentCategorizedOffersToLoadState,
    noNearbyFoodCategorizedOffersToLoadState,
    noNearbyHealthAndBeautyCategorizedOffersToLoadState,
    noNearbyHomeCategorizedOffersToLoadState,
    noNearbyKitOffersAvailableState,
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
    numberOfClickOnlyOnlineOffersState,
    numberOfElectronicsCategorizedOffersWithin25MilesState,
    numberOfElectronicsCategorizedOnlineOffersState,
    numberOfEntertainmentCategorizedOffersWithin25MilesState,
    numberOfEntertainmentCategorizedOnlineOffersState,
    numberOfFailedClickOnlyOnlineOfferCallsState,
    numberOfFailedHorizontalMapOfferCallsState,
    numberOfFailedNearbyOfferCallsState,
    numberOfFailedOnlineOfferCallsState,
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
    onlineKitListIsExpandedState,
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
    premierClickOnlyOnlineOffersPageNumberState,
    premierNearbyOffersPageNumberState,
    premierOnlineOffersPageNumberState,
    reloadNearbyDueToPermissionsChangeState,
    searchQueryState,
    showClickOnlyBottomSheetState,
    storeNavigationState,
    storeOfferPhysicalLocationState,
    storeOfferState,
    toggleViewPressedState,
    verticalSectionActiveState
} from "../../recoil/StoreOfferAtom";
import {
    additionalAppWallDocumentationErrors,
    additionalAppWallDocumentationNeeded,
    appDrawerHeaderShownState,
    appWallDocumentsReCapturePhotoState,
    appWallDocumentsRePickPhotoState,
    appWallPermissionsInstructionsCustomMessageState,
    appWallPermissionsModalCustomMessageState,
    appWallPermissionsModalVisibleState,
    cardLinkingIdState,
    cardLinkingStatusState,
    customBannerShown,
    drawerDashboardState,
    drawerSwipeState,
    isDocumentUploadAppWallState,
    isPhotoUploadedAppWallState,
    isReadyAppWallState,
    profilePictureURIState,
    verificationDocumentAppWallState
} from "../../recoil/AppDrawerAtom";
import {codeVerificationSheetShown, codeVerifiedState} from "../../recoil/CodeVerificationAtom";
import {customBannerState} from "../../recoil/CustomBannerAtom";
import {
    showTransactionBottomSheetState,
    showWalletBottomSheetState,
    transactionDataState
} from "../../recoil/DashboardAtom";
import {faqListState} from "../../recoil/FaqAtom";
import {bottomBarNavigationState, bottomTabShownState, drawerNavigationState} from "../../recoil/HomeAtom";
import {
    currentUserLocationState,
    deviceTypeState,
    firstTimeLoggedInState,
    moonbeamUserIdPassState,
    moonbeamUserIdState
} from "../../recoil/RootAtom";
import {goToProfileSettingsState} from "../../recoil/Settings";
import {splashStatusState} from "../../recoil/SplashAtom";
import {cardLinkingBottomSheetState, selectedCardIndexState} from "../../recoil/WalletAtom";
import {
    branchRootUniversalObjectState,
    referralCodeMarketingCampaignState,
    referralCodeState
} from "../../recoil/BranchAtom";
import * as SecureStore from "expo-secure-store";
import {Auth} from "aws-amplify";
import {logEvent} from "../../utils/AppSync";
import {LoggingLevel} from "@moonbeam/moonbeam-models";
import Constants from "expo-constants";
import {AppOwnership} from "expo-constants/src/Constants.types";

/**
 * import branch only if the app is not running in Expo Go (so we can actually run the application without Branch for
 * Expo Go), for easier testing purposes.
 */
const isRunningInExpoGo = Constants.appOwnership === AppOwnership.Expo;

/**
 * Splash component. This component will be used as a confirmation and/or error message screen
 * by various parent components for a better UI/UX experience.
 *
 * @param props component properties to be passed in.
 * @constructor constructor for the component.
 */
export const SplashScreen = (props: {
    splashTitle: string,
    splashDescription: string,
    splashButtonText: string,
    splashArtSource: ImageSourcePropType,
    splashDismissButton?: boolean
}) => {
    // constants used to keep track of shared states
    const [marketplaceCache,] = useRecoilState(marketplaceAmplifyCacheState);
    const [cache,] = useRecoilState(globalAmplifyCacheState);
    const [mainRootNavigation,] = useRecoilState(mainRootNavigationState);
    const [, setDeferToLogin] = useRecoilState(deferToLoginState);
    // Recoil atoms to reset
    const verificationDocumentAppWallStateReset = useResetRecoilState(verificationDocumentAppWallState);
    const isReadyAppWallStateReset = useResetRecoilState(isReadyAppWallState);
    const isPhotoUploadedAppWallStateReset = useResetRecoilState(isPhotoUploadedAppWallState);
    const isDocumentUploadAppWallStateReset = useResetRecoilState(isDocumentUploadAppWallState);
    const drawerDashboardStateReset = useResetRecoilState(drawerDashboardState);
    const appDrawerHeaderShownStateReset = useResetRecoilState(appDrawerHeaderShownState);
    const additionalAppWallDocumentationNeededReset = useResetRecoilState(additionalAppWallDocumentationNeeded);
    const additionalAppWallDocumentationErrorsReset = useResetRecoilState(additionalAppWallDocumentationErrors);
    const cardLinkingStatusStateReset = useResetRecoilState(cardLinkingStatusState);
    const customBannerShownReset = useResetRecoilState(customBannerShown);
    const drawerSwipeStateReset = useResetRecoilState(drawerSwipeState);
    const profilePictureURIStateReset = useResetRecoilState(profilePictureURIState);
    const verificationDocumentStateReset = useResetRecoilState(verificationDocumentState);
    const mainRootNavigationStateReset = useResetRecoilState(mainRootNavigationState);
    const isLoadingAppOverviewNeededStateReset = useResetRecoilState(isLoadingAppOverviewNeededState);
    const globalAmplifyCacheStateReset = useResetRecoilState(globalAmplifyCacheState);
    const marketplaceAmplifyCacheStateReset = useResetRecoilState(marketplaceAmplifyCacheState);
    const isPhotoUploadedStateReset = useResetRecoilState(isPhotoUploadedState);
    const isDocumentUploadedStateReset = useResetRecoilState(isDocumentUploadedState);
    const isReadyRegistrationStateReset = useResetRecoilState(isReadyRegistrationState);
    const authRegistrationNavigationReset = useResetRecoilState(authRegistrationNavigation);
    const expoPushTokenStateReset = useResetRecoilState(expoPushTokenState);
    const cardLinkingRegistrationStatusStateReset = useResetRecoilState(cardLinkingRegistrationStatusState);
    const additionalDocumentationErrorsReset = useResetRecoilState(additionalDocumentationErrors);
    const additionalDocumentationNeededReset = useResetRecoilState(additionalDocumentationNeeded);
    const militaryVerificationStatusReset = useResetRecoilState(militaryVerificationStatus);
    const amplifySignUpProcessErrorsStateReset = useResetRecoilState(amplifySignUpProcessErrorsState);
    const registrationPasswordStateReset = useResetRecoilState(registrationPasswordState);
    const registrationPasswordErrorsStateReset = useResetRecoilState(registrationPasswordErrorsState);
    const registrationConfirmationPasswordStateReset = useResetRecoilState(registrationConfirmationPasswordState);
    const registrationConfirmationPasswordErrorsStateReset = useResetRecoilState(registrationConfirmationPasswordErrorsState);
    const dutyStatusErrorsStateReset = useResetRecoilState(dutyStatusErrorsState);
    const militaryBranchErrorsStateReset = useResetRecoilState(militaryBranchErrorsState);
    const enlistingYearStateReset = useResetRecoilState(enlistingYearState);
    const militaryRegistrationDisclaimerCheckStateReset = useResetRecoilState(militaryRegistrationDisclaimerCheckState);
    const accountCreationDisclaimerCheckStateReset = useResetRecoilState(accountCreationDisclaimerCheckState);
    const addressStateStateReset = useResetRecoilState(addressStateState);
    const addressCityStateReset = useResetRecoilState(addressCityState);
    const addressLineStateReset = useResetRecoilState(addressLineState);
    const addressZipStateReset = useResetRecoilState(addressZipState);
    const enlistingYearErrorsStateReset = useResetRecoilState(enlistingYearErrorsState);
    const addressLineErrorsStateReset = useResetRecoilState(addressLineErrorsState);
    const addressCityErrorsStateReset = useResetRecoilState(addressCityErrorsState);
    const addressZipErrorsStateReset = useResetRecoilState(addressZipErrorsState);
    const addressStateErrorsStateReset = useResetRecoilState(addressStateErrorsState);
    const militaryBranchStateReset = useResetRecoilState(militaryBranchState);
    const militaryBranchValueStateReset = useResetRecoilState(militaryBranchValueState);
    const dutyStatusValueStateReset = useResetRecoilState(dutyStatusValueState);
    const dutyStatusStateReset = useResetRecoilState(dutyStatusState);
    const verificationCodeErrorsStateReset = useResetRecoilState(verificationCodeErrorsState);
    const firstNameErrorsStateReset = useResetRecoilState(firstNameErrorsState);
    const lastNameErrorsStateReset = useResetRecoilState(lastNameErrorsState);
    const birthdayErrorStateReset = useResetRecoilState(birthdayErrorState);
    const emailErrorsStateReset = useResetRecoilState(emailErrorsState);
    const phoneNumberErrorsStateReset = useResetRecoilState(phoneNumberErrorsState);
    const registrationCodeTimerValueReset = useResetRecoilState(registrationCodeTimerValue);
    const registrationVerificationDigit1Reset = useResetRecoilState(registrationVerificationDigit1);
    const registrationVerificationDigit2Reset = useResetRecoilState(registrationVerificationDigit2);
    const registrationVerificationDigit3Reset = useResetRecoilState(registrationVerificationDigit3);
    const registrationVerificationDigit4Reset = useResetRecoilState(registrationVerificationDigit4);
    const registrationVerificationDigit5Reset = useResetRecoilState(registrationVerificationDigit5);
    const registrationVerificationDigit6Reset = useResetRecoilState(registrationVerificationDigit6);
    const registrationStepNumberReset = useResetRecoilState(registrationStepNumber);
    const currentUserInformationReset = useResetRecoilState(currentUserInformation);
    const initialAuthenticationScreenReset = useResetRecoilState(initialAuthenticationScreen);
    const registrationBackButtonShownReset = useResetRecoilState(registrationBackButtonShown);
    const registrationMainErrorStateReset = useResetRecoilState(registrationMainErrorState);
    const firstNameStateReset = useResetRecoilState(firstNameState);
    const lastNameStateReset = useResetRecoilState(lastNameState);
    const emailStateReset = useResetRecoilState(emailState);
    const birthdayStateReset = useResetRecoilState(birthdayState);
    const phoneNumberStateReset = useResetRecoilState(phoneNumberState);
    const codeVerificationSheetShownReset = useResetRecoilState(codeVerificationSheetShown);
    const codeVerifiedStateReset = useResetRecoilState(codeVerifiedState);
    const customBannerStateReset = useResetRecoilState(customBannerState);
    const showWalletBottomSheetStateReset = useResetRecoilState(showWalletBottomSheetState);
    const transactionDataStateReset = useResetRecoilState(transactionDataState);
    const showTransactionBottomSheetStateReset = useResetRecoilState(showTransactionBottomSheetState);
    const faqListStateReset = useResetRecoilState(faqListState);
    const bottomTabShownStateReset = useResetRecoilState(bottomTabShownState);
    const bottomBarNavigationStateReset = useResetRecoilState(bottomBarNavigationState);
    const drawerNavigationStateReset = useResetRecoilState(drawerNavigationState);
    const deviceTypeStateReset = useResetRecoilState(deviceTypeState);
    const goToProfileSettingsStateReset = useResetRecoilState(goToProfileSettingsState);
    const splashStatusStateReset = useResetRecoilState(splashStatusState);
    const storeOfferStateReset = useResetRecoilState(storeOfferState);
    const storeOfferPhysicalLocationStateReset = useResetRecoilState(storeOfferPhysicalLocationState);
    const cardLinkingBottomSheetStateReset = useResetRecoilState(cardLinkingBottomSheetState);
    const firstTimeLoggedInStateReset = useResetRecoilState(firstTimeLoggedInState);
    const moonbeamUserIdStateReset = useResetRecoilState(moonbeamUserIdState);
    const moonbeamUserIdPassStateReset = useResetRecoilState(moonbeamUserIdPassState);
    const permissionsModalVisibleStateReset = useResetRecoilState(permissionsModalVisibleState);
    const permissionsModalCustomMessageStateReset = useResetRecoilState(permissionsModalCustomMessageState);
    const permissionsInstructionsCustomMessageStateReset = useResetRecoilState(permissionsInstructionsCustomMessageState);
    const documentsRePickPhotoStateReset = useResetRecoilState(documentsRePickPhotoState);
    const documentsReCapturePhotoStateReset = useResetRecoilState(documentsReCapturePhotoState);
    const appWallPermissionsModalVisibleStateReset = useResetRecoilState(appWallPermissionsModalVisibleState);
    const appWallPermissionsModalCustomMessageStateReset = useResetRecoilState(appWallPermissionsModalCustomMessageState);
    const appWallPermissionsInstructionsCustomMessageStateReset = useResetRecoilState(appWallPermissionsInstructionsCustomMessageState);
    const appWallDocumentsRePickPhotoStateReset = useResetRecoilState(appWallDocumentsRePickPhotoState);
    const appWallDocumentsReCapturePhotoStateReset = useResetRecoilState(appWallDocumentsReCapturePhotoState);
    const automaticallyVerifyRegistrationCodeStateReset = useResetRecoilState(automaticallyVerifyRegistrationCodeState);
    const deferToLoginStateReset = useResetRecoilState(deferToLoginState);
    const nearbyOffersPageNumberStateReset = useResetRecoilState(nearbyOffersPageNumberState)
    const onlineOffersPageNumberStateReset = useResetRecoilState(onlineOffersPageNumberState);
    const onlineOffersListStateReset = useResetRecoilState(onlineOffersListState);
    const nearbyOffersListStateReset = useResetRecoilState(nearbyOffersListState);
    const noOnlineOffersToLoadStateReset = useResetRecoilState(noOnlineOffersToLoadState);
    const noNearbyOffersToLoadStateReset = useResetRecoilState(noNearbyOffersToLoadState);
    const offersNearUserLocationFlagStateReset = useResetRecoilState(offersNearUserLocationFlagState);
    const premierNearbyOffersPageNumberStateReset = useResetRecoilState(premierNearbyOffersPageNumberState);
    const premierOnlineOffersPageNumberStateReset = useResetRecoilState(premierOnlineOffersPageNumberState);
    const locationServicesButtonStateReset = useResetRecoilState(locationServicesButtonState);
    const reloadNearbyDueToPermissionsChangeStateReset = useResetRecoilState(reloadNearbyDueToPermissionsChangeState);
    const nearbyOffersSpinnerShownStateReset = useResetRecoilState(nearbyOffersSpinnerShownState);
    const toggleViewPressedStateReset = useResetRecoilState(toggleViewPressedState);
    const verticalSectionActiveStateReset = useResetRecoilState(verticalSectionActiveState);
    const searchQueryStateReset = useResetRecoilState(searchQueryState);
    const filteredByDiscountPressedStateReset = useResetRecoilState(filteredByDiscountPressedState);
    const filtersActiveStateReset = useResetRecoilState(filtersActiveState);
    const currentUserLocationStateReset = useResetRecoilState(currentUserLocationState);
    const numberOfOffersWithin25MilesReset = useResetRecoilState(numberOfOffersWithin5MilesState);
    const numberOfOffersWithin5MilesReset = useResetRecoilState(numberOfOffersWithin25MilesState);
    const nearbyOffersListForMainHorizontalMapReset = useResetRecoilState(nearbyOffersListForMainHorizontalMapState);
    const nearbyOffersListForFullScreenMapReset = useResetRecoilState(nearbyOffersListForFullScreenMapState);
    const numberOfOnlineOffersReset = useResetRecoilState(numberOfOnlineOffersState);
    const numberOfFoodCategorizedOnlineOffersReset = useResetRecoilState(numberOfFoodCategorizedOnlineOffersState);
    const numberOfRetailCategorizedOnlineOffersReset = useResetRecoilState(numberOfRetailCategorizedOnlineOffersState);
    const numberOfEntertainmentCategorizedOnlineOffersReset = useResetRecoilState(numberOfEntertainmentCategorizedOnlineOffersState);
    const numberOfElectronicsCategorizedOnlineOffersReset = useResetRecoilState(numberOfElectronicsCategorizedOnlineOffersState);
    const numberOfHomeCategorizedOnlineOffersReset = useResetRecoilState(numberOfHomeCategorizedOnlineOffersState);
    const numberOfHealthAndBeautyCategorizedOnlineOffersReset = useResetRecoilState(numberOfHealthAndBeautyCategorizedOnlineOffersState);
    const numberOfOfficeAndBusinessCategorizedOnlineOffersReset = useResetRecoilState(numberOfOfficeAndBusinessCategorizedOnlineOffersState);
    const numberOfServicesAndSubscriptionsCategorizedOnlineOffersReset = useResetRecoilState(numberOfServicesAndSubscriptionsCategorizedOnlineOffersState);
    const onlineFoodCategorizedOffersPageNumberReset = useResetRecoilState(onlineFoodCategorizedOffersPageNumberState);
    const onlineRetailCategorizedOffersPageNumberReset = useResetRecoilState(onlineRetailCategorizedOffersPageNumberState);
    const onlineEntertainmentCategorizedOffersPageNumberReset = useResetRecoilState(onlineEntertainmentCategorizedOffersPageNumberState);
    const onlineElectronicsCategorizedOffersPageNumberReset = useResetRecoilState(onlineElectronicsCategorizedOffersPageNumberState);
    const onlineHomeCategorizedOffersPageNumberReset = useResetRecoilState(onlineHomeCategorizedOffersPageNumberState);
    const onlineHealthAndBeautyCategorizedOffersPageNumberReset = useResetRecoilState(onlineHealthAndBeautyCategorizedOffersPageNumberState);
    const onlineOfficeAndBusinessCategorizedOffersPageNumberReset = useResetRecoilState(onlineOfficeAndBusinessCategorizedOffersPageNumberState);
    const onlineServicesAndSubscriptionsCategorizedOffersPageNumberReset = useResetRecoilState(onlineServicesAndSubscriptionsCategorizedOffersPageNumberState);
    const noOnlineFoodCategorizedOffersToLoadReset = useResetRecoilState(noOnlineFoodCategorizedOffersToLoadState);
    const noOnlineRetailCategorizedOffersToLoadReset = useResetRecoilState(noOnlineRetailCategorizedOffersToLoadState);
    const noOnlineEntertainmentCategorizedOffersToLoadReset = useResetRecoilState(noOnlineEntertainmentCategorizedOffersToLoadState);
    const noOnlineElectronicsCategorizedOffersToLoadReset = useResetRecoilState(noOnlineElectronicsCategorizedOffersToLoadState);
    const noOnlineHomeCategorizedOffersToLoadReset = useResetRecoilState(noOnlineHomeCategorizedOffersToLoadState);
    const noOnlineHealthAndBeautyCategorizedOffersToLoadReset = useResetRecoilState(noOnlineHealthAndBeautyCategorizedOffersToLoadState);
    const noOnlineOfficeAndBusinessCategorizedOffersToLoadReset = useResetRecoilState(noOnlineOfficeAndBusinessCategorizedOffersToLoadState);
    const noOnlineServicesAndSubscriptionsCategorizedOffersToLoadReset = useResetRecoilState(noOnlineServicesAndSubscriptionsCategorizedOffersToLoadState);
    const onlineFoodCategorizedOfferListReset = useResetRecoilState(onlineFoodCategorizedOfferListState);
    const onlineRetailCategorizedOfferListReset = useResetRecoilState(onlineRetailCategorizedOfferListState);
    const onlineEntertainmentCategorizedOfferListReset = useResetRecoilState(onlineEntertainmentCategorizedOfferListState);
    const onlineElectronicsCategorizedOfferListReset = useResetRecoilState(onlineElectronicsCategorizedOfferListState);
    const onlineHomeCategorizedOfferListReset = useResetRecoilState(onlineHomeCategorizedOfferListState);
    const onlineHealthAndBeautyCategorizedOfferListReset = useResetRecoilState(onlineHealthAndBeautyCategorizedOfferListState);
    const onlineOfficeAndBusinessCategorizedOfferListReset = useResetRecoilState(onlineOfficeAndBusinessCategorizedOfferListState);
    const onlineServicesAndSubscriptionsCategorizedOfferListReset = useResetRecoilState(onlineServicesAndSubscriptionsCategorizedOfferListState);
    const numberOfFoodCategorizedOffersWithin25MilesReset = useResetRecoilState(numberOfFoodCategorizedOffersWithin25MilesState);
    const numberOfRetailCategorizedOffersWithin25MilesReset = useResetRecoilState(numberOfRetailCategorizedOffersWithin25MilesState);
    const numberOfEntertainmentCategorizedOffersWithin25MilesReset = useResetRecoilState(numberOfEntertainmentCategorizedOffersWithin25MilesState);
    const numberOfElectronicsCategorizedOffersWithin25MilesReset = useResetRecoilState(numberOfElectronicsCategorizedOffersWithin25MilesState);
    const numberOfHomeCategorizedOffersWithin25MilesReset = useResetRecoilState(numberOfHomeCategorizedOffersWithin25MilesState);
    const numberOfHealthAndBeautyCategorizedOffersWithin25MilesReset = useResetRecoilState(numberOfHealthAndBeautyCategorizedOffersWithin25MilesState);
    const numberOfOfficeAndBusinessCategorizedOffersWithin25MilesReset = useResetRecoilState(numberOfOfficeAndBusinessCategorizedOffersWithin25MilesState);
    const numberOfServicesAndSubscriptionsCategorizedOffersWithin25MilesReset = useResetRecoilState(numberOfServicesAndSubscriptionsCategorizedOffersWithin25MilesState);
    const nearbyFoodCategorizedOffersPageNumberReset = useResetRecoilState(nearbyFoodCategorizedOffersPageNumberState);
    const nearbyRetailCategorizedOffersPageNumberReset = useResetRecoilState(nearbyRetailCategorizedOffersPageNumberState);
    const nearbyEntertainmentCategorizedOffersPageNumberReset = useResetRecoilState(nearbyEntertainmentCategorizedOffersPageNumberState);
    const nearbyElectronicsCategorizedOffersPageNumberReset = useResetRecoilState(nearbyElectronicsCategorizedOffersPageNumberState);
    const nearbyHomeCategorizedOffersPageNumberReset = useResetRecoilState(nearbyHomeCategorizedOffersPageNumberState);
    const nearbyHealthAndBeautyCategorizedOffersPageNumberReset = useResetRecoilState(nearbyHealthAndBeautyCategorizedOffersPageNumberState);
    const nearbyOfficeAndBusinessCategorizedOffersPageNumberReset = useResetRecoilState(nearbyOfficeAndBusinessCategorizedOffersPageNumberState);
    const nearbyServicesAndSubscriptionsCategorizedOffersPageNumberReset = useResetRecoilState(nearbyServicesAndSubscriptionsCategorizedOffersPageNumberState);
    const noNearbyFoodCategorizedOffersToLoadReset = useResetRecoilState(noNearbyFoodCategorizedOffersToLoadState);
    const noNearbyRetailCategorizedOffersToLoadReset = useResetRecoilState(noNearbyRetailCategorizedOffersToLoadState);
    const noNearbyEntertainmentCategorizedOffersToLoadReset = useResetRecoilState(noNearbyEntertainmentCategorizedOffersToLoadState);
    const noNearbyElectronicsCategorizedOffersToLoadReset = useResetRecoilState(noNearbyElectronicsCategorizedOffersToLoadState);
    const noNearbyHomeCategorizedOffersToLoadReset = useResetRecoilState(noNearbyHomeCategorizedOffersToLoadState);
    const noNearbyHealthAndBeautyCategorizedOffersToLoadReset = useResetRecoilState(noNearbyHealthAndBeautyCategorizedOffersToLoadState);
    const noNearbyOfficeAndBusinessCategorizedOffersToLoadReset = useResetRecoilState(noNearbyOfficeAndBusinessCategorizedOffersToLoadState);
    const noNearbyServicesAndSubscriptionsCategorizedOffersToLoadReset = useResetRecoilState(noNearbyServicesAndSubscriptionsCategorizedOffersToLoadState);
    const nearbyFoodCategorizedOffersListReset = useResetRecoilState(nearbyFoodCategorizedOffersListState);
    const nearbyRetailCategorizedOffersListReset = useResetRecoilState(nearbyRetailCategorizedOffersListState);
    const nearbyEntertainmentCategorizedOffersListReset = useResetRecoilState(nearbyEntertainmentCategorizedOffersListState);
    const nearbyElectronicsCategorizedOffersListReset = useResetRecoilState(nearbyElectronicsCategorizedOffersListState);
    const nearbyHomeCategorizedOffersListReset = useResetRecoilState(nearbyHomeCategorizedOffersListState);
    const nearbyHealthAndBeautyCategorizedOffersListReset = useResetRecoilState(nearbyHealthAndBeautyCategorizedOffersListState);
    const nearbyOfficeAndBusinessCategorizedOffersListReset = useResetRecoilState(nearbyOfficeAndBusinessCategorizedOffersListState);
    const nearbyServicesAndSubscriptionsCategorizedOffersListReset = useResetRecoilState(nearbyServicesAndSubscriptionsCategorizedOffersListState);
    const storeNavigationReset = useResetRecoilState(storeNavigationState);
    const currentActiveKitReset = useResetRecoilState(currentActiveKitState);
    const onlineKitListIsExpandedReset = useResetRecoilState(onlineKitListIsExpandedState);
    const nearbyKitListIsExpandedReset = useResetRecoilState(nearbyKitListIsExpandedState);
    const fullScreenKitMapActiveReset = useResetRecoilState(fullScreenKitMapActiveState);
    const noNearbyKitOffersAvailableReset = useResetRecoilState(noNearbyKitOffersAvailableState);
    const onlineVeteransDayCategorizedOfferListReset = useResetRecoilState(onlineVeteransDayCategorizedOfferListState);
    const numberOfVeteransDayCategorizedOnlineOffersReset = useResetRecoilState(numberOfVeteransDayCategorizedOnlineOffersState);
    const noOnlineVeteransDayCategorizedOffersToLoadReset = useResetRecoilState(noOnlineVeteransDayCategorizedOffersToLoadState);
    const onlineVeteransDayCategorizedOffersPageNumberReset = useResetRecoilState(onlineVeteransDayCategorizedOffersPageNumberState);
    const fidelisPartnerListReset = useResetRecoilState(fidelisPartnerListState);
    const isVeteransDayKitLoadedReset = useResetRecoilState(isVeteransDayKitLoadedState);
    const isFoodKitLoadedReset = useResetRecoilState(isFoodKitLoadedState);
    const isRetailKitLoadedReset = useResetRecoilState(isRetailKitLoadedState);
    const isElectronicsKitLoadedReset = useResetRecoilState(isElectronicsKitLoadedState);
    const isEntertainmentKitLoadedReset = useResetRecoilState(isEntertainmentKitLoadedState);
    const isHomeKitLoadedReset = useResetRecoilState(isHomeKitLoadedState);
    const isHealthAndBeautyKitLoadedReset = useResetRecoilState(isHealthAndBeautyKitLoadedState);
    const isOfficeAndBusinessKitLoadedReset = useResetRecoilState(isOfficeAndBusinessKitLoadedState);
    const isServicesAndSubscriptionsKitLoadedReset = useResetRecoilState(isServicesAndSubscriptionsKitLoadedState);
    const branchRootUniversalObjectReset = useResetRecoilState(branchRootUniversalObjectState);
    const referralCodeStateReset = useResetRecoilState(referralCodeState);
    const referralCodeMarketingCampaignStateReset = useResetRecoilState(referralCodeMarketingCampaignState);
    const clickOnlyOnlineOffersListStateReset = useResetRecoilState(clickOnlyOnlineOffersListState);
    const clickOnlyOnlineOffersPageNumberStateReset = useResetRecoilState(clickOnlyOnlineOffersPageNumberState);
    const premierClickOnlyOnlineOffersPageNumberStateReset = useResetRecoilState(premierClickOnlyOnlineOffersPageNumberState);
    const noClickOnlyOnlineOffersToLoadStateReset = useResetRecoilState(noClickOnlyOnlineOffersToLoadState);
    const numberOfClickOnlyOnlineOffersStateReset = useResetRecoilState(numberOfClickOnlyOnlineOffersState);
    const numberOfFailedOnlineOfferCallsStateReset = useResetRecoilState(numberOfFailedOnlineOfferCallsState);
    const numberOfFailedNearbyOfferCallsStateReset = useResetRecoilState(numberOfFailedNearbyOfferCallsState);
    const numberOfFailedHorizontalMapOfferCallsStateReset = useResetRecoilState(numberOfFailedHorizontalMapOfferCallsState);
    const numberOfFailedClickOnlyOnlineOfferCallsStateReset = useResetRecoilState(numberOfFailedClickOnlyOnlineOfferCallsState);
    const showClickOnlyBottomSheetStateReset = useResetRecoilState(showClickOnlyBottomSheetState);
    const cardLinkingIdStateReset = useResetRecoilState(cardLinkingIdState);
    const userIsAuthenticatedStateReset = useResetRecoilState(userIsAuthenticatedState);
    const selectedCardIndexStateReset = useResetRecoilState(selectedCardIndexState);
    const currentMemberAffiliationStateReset = useResetRecoilState(currentMemberAffiliationState);
    const ssnStateReset = useResetRecoilState(ssnState);
    const ssnErrorsStateReset = useResetRecoilState(ssnErrorsState);
    const filteredOffersListStateReset = useResetRecoilState(filteredOffersListState);
    const noFilteredOffersToLoadReset = useResetRecoilState(noFilteredOffersToLoadState);
    const filteredOffersSpinnerShownStateReset = useResetRecoilState(filteredOffersSpinnerShownState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
    }, []);

    /**
     * Function used to log out of the app.
     */
    const logOut = async (): Promise<void> => {
        try {
            // reset all Recoil atoms
            verificationDocumentAppWallStateReset();
            isReadyAppWallStateReset();
            isPhotoUploadedAppWallStateReset();
            isDocumentUploadAppWallStateReset();
            drawerDashboardStateReset();
            appDrawerHeaderShownStateReset();
            appDrawerHeaderShownStateReset();
            additionalAppWallDocumentationNeededReset();
            additionalAppWallDocumentationErrorsReset();
            cardLinkingStatusStateReset();
            customBannerShownReset();
            drawerSwipeStateReset();
            profilePictureURIStateReset();
            verificationDocumentStateReset();
            mainRootNavigationStateReset();
            isLoadingAppOverviewNeededStateReset();
            globalAmplifyCacheStateReset();
            marketplaceAmplifyCacheStateReset();
            isPhotoUploadedStateReset();
            isDocumentUploadedStateReset();
            isReadyRegistrationStateReset();
            authRegistrationNavigationReset();
            expoPushTokenStateReset();
            cardLinkingRegistrationStatusStateReset();
            additionalDocumentationErrorsReset();
            additionalDocumentationNeededReset();
            militaryVerificationStatusReset();
            amplifySignUpProcessErrorsStateReset();
            registrationPasswordStateReset();
            registrationPasswordErrorsStateReset();
            registrationConfirmationPasswordStateReset();
            registrationConfirmationPasswordErrorsStateReset();
            dutyStatusErrorsStateReset();
            militaryBranchErrorsStateReset();
            enlistingYearStateReset();
            militaryRegistrationDisclaimerCheckStateReset();
            accountCreationDisclaimerCheckStateReset();
            addressStateStateReset();
            addressCityStateReset();
            addressLineStateReset();
            addressZipStateReset();
            enlistingYearErrorsStateReset();
            addressLineErrorsStateReset();
            addressCityErrorsStateReset();
            addressZipErrorsStateReset();
            addressStateErrorsStateReset();
            militaryBranchStateReset();
            militaryBranchValueStateReset();
            dutyStatusValueStateReset();
            dutyStatusStateReset();
            verificationCodeErrorsStateReset();
            firstNameErrorsStateReset();
            lastNameErrorsStateReset();
            birthdayErrorStateReset();
            emailErrorsStateReset();
            phoneNumberErrorsStateReset();
            registrationCodeTimerValueReset();
            registrationVerificationDigit1Reset();
            registrationVerificationDigit2Reset();
            registrationVerificationDigit3Reset();
            registrationVerificationDigit4Reset();
            registrationVerificationDigit5Reset();
            registrationVerificationDigit6Reset();
            registrationStepNumberReset();
            currentUserInformationReset();
            initialAuthenticationScreenReset();
            registrationBackButtonShownReset();
            registrationMainErrorStateReset();
            firstNameStateReset();
            lastNameStateReset();
            emailStateReset();
            birthdayStateReset();
            phoneNumberStateReset();
            codeVerificationSheetShownReset();
            codeVerifiedStateReset();
            customBannerStateReset();
            showWalletBottomSheetStateReset();
            transactionDataStateReset();
            showTransactionBottomSheetStateReset();
            faqListStateReset();
            bottomTabShownStateReset();
            bottomBarNavigationStateReset();
            drawerNavigationStateReset();
            deviceTypeStateReset();
            goToProfileSettingsStateReset();
            splashStatusStateReset();
            storeOfferStateReset();
            storeOfferPhysicalLocationStateReset();
            cardLinkingBottomSheetStateReset();
            firstTimeLoggedInStateReset();
            moonbeamUserIdStateReset();
            moonbeamUserIdPassStateReset();
            permissionsModalVisibleStateReset();
            permissionsModalCustomMessageStateReset();
            permissionsInstructionsCustomMessageStateReset();
            documentsRePickPhotoStateReset();
            documentsReCapturePhotoStateReset();
            appWallPermissionsModalVisibleStateReset();
            appWallPermissionsModalCustomMessageStateReset();
            appWallPermissionsInstructionsCustomMessageStateReset();
            appWallDocumentsRePickPhotoStateReset();
            appWallDocumentsReCapturePhotoStateReset();
            automaticallyVerifyRegistrationCodeStateReset();
            deferToLoginStateReset();
            nearbyOffersPageNumberStateReset();
            onlineOffersPageNumberStateReset();
            onlineOffersListStateReset();
            nearbyOffersListStateReset();
            noNearbyOffersToLoadStateReset();
            noOnlineOffersToLoadStateReset();
            offersNearUserLocationFlagStateReset();
            premierNearbyOffersPageNumberStateReset();
            premierOnlineOffersPageNumberStateReset();
            locationServicesButtonStateReset();
            reloadNearbyDueToPermissionsChangeStateReset();
            nearbyOffersSpinnerShownStateReset();
            toggleViewPressedStateReset();
            verticalSectionActiveStateReset();
            searchQueryStateReset();
            filteredByDiscountPressedStateReset();
            filtersActiveStateReset();
            currentUserLocationStateReset();
            numberOfOffersWithin5MilesReset();
            numberOfOffersWithin25MilesReset();
            nearbyOffersListForMainHorizontalMapReset();
            nearbyOffersListForFullScreenMapReset();
            numberOfOnlineOffersReset();
            numberOfFoodCategorizedOnlineOffersReset();
            numberOfRetailCategorizedOnlineOffersReset();
            numberOfEntertainmentCategorizedOnlineOffersReset();
            numberOfElectronicsCategorizedOnlineOffersReset();
            numberOfHomeCategorizedOnlineOffersReset();
            numberOfHealthAndBeautyCategorizedOnlineOffersReset();
            numberOfOfficeAndBusinessCategorizedOnlineOffersReset();
            numberOfServicesAndSubscriptionsCategorizedOnlineOffersReset();
            onlineFoodCategorizedOffersPageNumberReset();
            onlineRetailCategorizedOffersPageNumberReset();
            onlineEntertainmentCategorizedOffersPageNumberReset();
            onlineElectronicsCategorizedOffersPageNumberReset();
            onlineHomeCategorizedOffersPageNumberReset();
            onlineHealthAndBeautyCategorizedOffersPageNumberReset();
            onlineOfficeAndBusinessCategorizedOffersPageNumberReset();
            onlineServicesAndSubscriptionsCategorizedOffersPageNumberReset();
            noOnlineFoodCategorizedOffersToLoadReset();
            noOnlineRetailCategorizedOffersToLoadReset();
            noOnlineEntertainmentCategorizedOffersToLoadReset();
            noOnlineElectronicsCategorizedOffersToLoadReset();
            noOnlineHomeCategorizedOffersToLoadReset();
            noOnlineHealthAndBeautyCategorizedOffersToLoadReset();
            noOnlineOfficeAndBusinessCategorizedOffersToLoadReset();
            noOnlineServicesAndSubscriptionsCategorizedOffersToLoadReset();
            onlineFoodCategorizedOfferListReset();
            onlineRetailCategorizedOfferListReset();
            onlineEntertainmentCategorizedOfferListReset();
            onlineElectronicsCategorizedOfferListReset();
            onlineHomeCategorizedOfferListReset();
            onlineHealthAndBeautyCategorizedOfferListReset();
            onlineOfficeAndBusinessCategorizedOfferListReset();
            onlineServicesAndSubscriptionsCategorizedOfferListReset();
            numberOfFoodCategorizedOffersWithin25MilesReset();
            numberOfRetailCategorizedOffersWithin25MilesReset();
            numberOfEntertainmentCategorizedOffersWithin25MilesReset();
            numberOfElectronicsCategorizedOffersWithin25MilesReset();
            numberOfHomeCategorizedOffersWithin25MilesReset();
            numberOfHealthAndBeautyCategorizedOffersWithin25MilesReset();
            numberOfOfficeAndBusinessCategorizedOffersWithin25MilesReset();
            numberOfServicesAndSubscriptionsCategorizedOffersWithin25MilesReset();
            nearbyFoodCategorizedOffersPageNumberReset();
            nearbyRetailCategorizedOffersPageNumberReset();
            nearbyEntertainmentCategorizedOffersPageNumberReset();
            nearbyElectronicsCategorizedOffersPageNumberReset();
            nearbyHomeCategorizedOffersPageNumberReset();
            nearbyHealthAndBeautyCategorizedOffersPageNumberReset();
            nearbyOfficeAndBusinessCategorizedOffersPageNumberReset();
            nearbyServicesAndSubscriptionsCategorizedOffersPageNumberReset();
            noNearbyFoodCategorizedOffersToLoadReset();
            noNearbyRetailCategorizedOffersToLoadReset();
            noNearbyEntertainmentCategorizedOffersToLoadReset();
            noNearbyElectronicsCategorizedOffersToLoadReset();
            noNearbyHomeCategorizedOffersToLoadReset();
            noNearbyHealthAndBeautyCategorizedOffersToLoadReset();
            noNearbyOfficeAndBusinessCategorizedOffersToLoadReset();
            noNearbyServicesAndSubscriptionsCategorizedOffersToLoadReset();
            nearbyFoodCategorizedOffersListReset();
            nearbyRetailCategorizedOffersListReset();
            nearbyEntertainmentCategorizedOffersListReset();
            nearbyElectronicsCategorizedOffersListReset();
            nearbyHomeCategorizedOffersListReset();
            nearbyHealthAndBeautyCategorizedOffersListReset();
            nearbyOfficeAndBusinessCategorizedOffersListReset();
            nearbyServicesAndSubscriptionsCategorizedOffersListReset();
            storeNavigationReset();
            currentActiveKitReset();
            onlineKitListIsExpandedReset();
            nearbyKitListIsExpandedReset();
            fullScreenKitMapActiveReset();
            noNearbyKitOffersAvailableReset();
            onlineVeteransDayCategorizedOfferListReset();
            numberOfVeteransDayCategorizedOnlineOffersReset();
            noOnlineVeteransDayCategorizedOffersToLoadReset();
            onlineVeteransDayCategorizedOffersPageNumberReset();
            fidelisPartnerListReset();
            isVeteransDayKitLoadedReset();
            isFoodKitLoadedReset();
            isRetailKitLoadedReset();
            isElectronicsKitLoadedReset();
            isEntertainmentKitLoadedReset();
            isHomeKitLoadedReset();
            isHealthAndBeautyKitLoadedReset();
            isOfficeAndBusinessKitLoadedReset();
            isServicesAndSubscriptionsKitLoadedReset();
            branchRootUniversalObjectReset();
            referralCodeStateReset();
            referralCodeMarketingCampaignStateReset();
            userIsAuthenticatedStateReset();
            clickOnlyOnlineOffersListStateReset();
            clickOnlyOnlineOffersPageNumberStateReset();
            premierClickOnlyOnlineOffersPageNumberStateReset();
            noClickOnlyOnlineOffersToLoadStateReset();
            numberOfClickOnlyOnlineOffersStateReset();
            numberOfFailedOnlineOfferCallsStateReset();
            numberOfFailedNearbyOfferCallsStateReset();
            numberOfFailedHorizontalMapOfferCallsStateReset();
            numberOfFailedClickOnlyOnlineOfferCallsStateReset();
            showClickOnlyBottomSheetStateReset();
            cardLinkingIdStateReset();
            selectedCardIndexStateReset();
            currentMemberAffiliationStateReset();
            ssnStateReset();
            ssnErrorsStateReset();
            filteredOffersListStateReset();
            noFilteredOffersToLoadReset();
            filteredOffersSpinnerShownStateReset();
            // if this is not running in Expo Go
            if (!isRunningInExpoGo) {
                // import branch
                const branch = await import('react-native-branch');
                // logout the user in branch
                branch.default.logout();
            }

            /**
             * ensure that the current user's biometric session is interrupted, and that the already signed in flag is reset
             * so next user can set up biometrics once more, and they can also benefit from skipping the overview screen.
             */
            await SecureStore.deleteItemAsync(`biometrics-enabled`, {
                requireAuthentication: false // we don't need this to be under authentication, so we can check at login
            });
            await SecureStore.deleteItemAsync(`moonbeam-user-id`, {
                requireAuthentication: false // we don't need this to be under authentication, so we can check at login
            });
            await SecureStore.deleteItemAsync(`moonbeam-user-passcode`, {
                requireAuthentication: false // we don't need this to be under authentication, so we can check at login
            });
            await SecureStore.deleteItemAsync(`moonbeam-skip-overview`, {
                requireAuthentication: false // we don't need this to be under authentication, so we can check at login
            });
            await SecureStore.deleteItemAsync(`biometrics-type`, {
                requireAuthentication: false // we don't need this to be under authentication, so we can check at login
            });

            // clear the cache
            marketplaceCache !== null && marketplaceCache.clear();
            cache !== null && cache.clear();

            // performing the Sign-Out action through Amplify
            await Auth.signOut();
        } catch (error) {
            const message = `error while signing out: , ${error}`;
            console.log(message);
            await logEvent(message, LoggingLevel.Error, true);
        }
    }

    // return the component for the Splash page
    return (
        <SafeAreaView style={styles.splashScreenView}>
            {
                props.splashDismissButton !== null && props.splashDismissButton !== undefined && props.splashDismissButton &&
                <View style={{width: wp(100)}}>
                    <Icon
                        name={'close'}
                        size={hp(4.5)}
                        color={'#FFFFFF'}
                        style={styles.loginButton}
                        onPress={async () => {
                            // reset all the recoil states here
                            await logOut();

                            // go to the Login page
                            setDeferToLogin(true);
                            mainRootNavigation && mainRootNavigation!.navigate('AppOverview', {});
                        }}
                    />
                </View>
            }
            <Image
                style={[styles.splashArt,
                    props.splashDismissButton !== null && props.splashDismissButton !== undefined &&
                    props.splashDismissButton && {bottom: hp(5)}]}
                resizeMethod={'scale'}
                resizeMode={'contain'}
                source={props.splashArtSource}
            />
            <View style={[styles.splashContentView,
                props.splashDismissButton !== null && props.splashDismissButton !== undefined &&
                props.splashDismissButton && {bottom: hp(15)}]}>
                <Text style={styles.splashTitle}>{props.splashTitle}</Text>
                <Text style={styles.splashDescription}>{props.splashDescription}</Text>
            </View>
        </SafeAreaView>
    );
};

