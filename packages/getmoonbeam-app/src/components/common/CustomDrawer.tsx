import {
    DrawerContentComponentProps,
    DrawerContentScrollView,
    DrawerItem,
    DrawerItemList
} from '@react-navigation/drawer';
import {ImageBackground, Text, TouchableOpacity, View} from 'react-native';
import {Avatar, Divider} from "@rneui/base";
import React, {useEffect, useState} from "react";
import {commonStyles} from "../../styles/common.module";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {styles} from '../../styles/customDrawer.module';
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
    verificationCodeErrorsState,
    verificationDocumentState
} from '../../recoil/AuthAtom';
// @ts-ignore
import SideBarImage from '../../../assets/art/sidebar.png';
import {
    additionalAppWallDocumentationErrors,
    additionalAppWallDocumentationNeeded,
    appDrawerHeaderShownState,
    appWallDocumentsReCapturePhotoState,
    appWallDocumentsRePickPhotoState,
    appWallPermissionsInstructionsCustomMessageState,
    appWallPermissionsModalCustomMessageState,
    appWallPermissionsModalVisibleState,
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
import {Spinner} from "./Spinner";
import {Auth} from "aws-amplify";
import {bottomBarNavigationState, bottomTabShownState, drawerNavigationState} from "../../recoil/HomeAtom";
import {goToProfileSettingsState} from "../../recoil/Settings";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {codeVerificationSheetShown, codeVerifiedState} from "../../recoil/CodeVerificationAtom";
import {customBannerState} from "../../recoil/CustomBannerAtom";
import {
    showTransactionBottomSheetState,
    showWalletBottomSheetState,
    transactionDataState
} from "../../recoil/DashboardAtom";
import {faqListState} from "../../recoil/FaqAtom";
import {
    currentUserLocationState,
    deviceTypeState,
    firstTimeLoggedInState,
    moonbeamUserIdPassState,
    moonbeamUserIdState
} from "../../recoil/RootAtom";
import {splashStatusState} from "../../recoil/SplashAtom";
import {
    filteredByDiscountPressedState, filtersActiveState,
    locationServicesButtonState,
    nearbyOffersListState,
    nearbyOffersPageNumberState,
    nearbyOffersSpinnerShownState,
    noNearbyOffersToLoadState,
    noOnlineOffersToLoadState,
    offersNearUserLocationFlagState,
    onlineOffersListState,
    onlineOffersPageNumberState,
    premierNearbyOffersPageNumberState,
    premierOnlineOffersPageNumberState,
    reloadNearbyDueToPermissionsChangeState,
    resetSearchState,
    searchQueryState,
    storeOfferPhysicalLocationState,
    storeOfferState,
    toggleViewPressedState,
    verticalSectionActiveState
} from "../../recoil/StoreOfferAtom";
import {cardLinkingBottomSheetState} from "../../recoil/WalletAtom";
import * as SecureStore from 'expo-secure-store';
// @ts-ignore
import MoonbeamProfilePlaceholder from "../../../assets/art/moonbeam-profile-placeholder.png";
import {Image as ExpoImage} from "expo-image/build/Image";

/**
 * CustomDrawer component. This component will be used to further tailor our sidebar navigation drawer, mainly
 * used by the AppDrawer parent component.
 *
 * @param props component properties to be passed in.
 * @constructor constructor for the component.
 */
export const CustomDrawer = (props: DrawerContentComponentProps) => {
    // constants used to keep track of local component state
    const [currentUserTitle, setCurrentUserTitle] = useState<string>("N/A");
    const [currentUserName, setCurrentUserName] = useState<string>("N/A");
    const [isReady,] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    // constants used to keep track of shared states
    const [marketplaceCache,] = useRecoilState(marketplaceAmplifyCacheState);
    const [cache,] = useRecoilState(globalAmplifyCacheState);
    const [, setGoToProfileSettings] = useRecoilState(goToProfileSettingsState);
    const [drawerNavigation,] = useRecoilState(drawerNavigationState);
    const [, setIsLoadingAppOverviewNeeded] = useRecoilState(isLoadingAppOverviewNeededState);
    const [mainRootNavigation,] = useRecoilState(mainRootNavigationState);
    const [userInformation,] = useRecoilState(currentUserInformation);
    const [profilePictureURI,] = useRecoilState(profilePictureURIState);
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
    const resetSearchStateReset = useResetRecoilState(resetSearchState);
    const toggleViewPressedStateReset = useResetRecoilState(toggleViewPressedState);
    const verticalSectionActiveStateReset = useResetRecoilState(verticalSectionActiveState);
    const searchQueryStateReset = useResetRecoilState(searchQueryState);
    const filteredByDiscountPressedStateReset = useResetRecoilState(filteredByDiscountPressedState);
    const filtersActiveStateReset = useResetRecoilState(filtersActiveState);
    const currentUserLocationStateReset = useResetRecoilState(currentUserLocationState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        if (userInformation["custom:userId"]) {
            // check to see if the user information object has been populated accordingly
            if (userInformation["given_name"] && userInformation["family_name"]) {
                //set the title of the user's avatar in the dashboard, based on the user's information
                setCurrentUserTitle(`${Array.from(userInformation["given_name"].split(" ")[0])[0] as string}${Array.from(userInformation["family_name"].split(" ")[0])[0] as string}`);
                setCurrentUserName(`${userInformation["given_name"]} ${userInformation["family_name"]}`);
            }
        }
    }, [userInformation["custom:userId"], userInformation["given_name"],
        userInformation["family_name"], profilePictureURI]);


    // return the component for the CustomDrawer component, part of the AppDrawer pages.
    return (
        <>
            {
                !isReady ?
                    <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                    :
                    <View style={{flex: 1}}>
                        <DrawerContentScrollView
                            {...props}
                            scrollEnabled={false}
                            contentContainerStyle={{backgroundColor: '#5B5A5A', flexDirection: 'column'}}
                        >
                            <ImageBackground
                                resizeMethod={"scale"}
                                imageStyle={{
                                    left: wp(40),
                                    height: hp(30),
                                    width: wp(30),
                                    resizeMode: 'stretch'
                                }}
                                source={SideBarImage}>
                                {
                                    (!profilePictureURI || profilePictureURI === "") ?
                                        <Avatar
                                            {...profilePictureURI && profilePictureURI !== "" && {
                                                source: {
                                                    uri: profilePictureURI,
                                                    cache: 'reload'
                                                }
                                            }
                                            }
                                            avatarStyle={{
                                                resizeMode: 'cover',
                                                borderColor: '#F2FF5D',
                                                borderWidth: 3
                                            }}
                                            size={hp(15)}
                                            rounded
                                            title={(!profilePictureURI || profilePictureURI === "") ? currentUserTitle : undefined}
                                            {...(!profilePictureURI || profilePictureURI === "") && {
                                                titleStyle: [
                                                    styles.titleStyle
                                                ]
                                            }}
                                            containerStyle={styles.avatarStyle}
                                            onPress={async () => {
                                                // go to the Profile screen
                                                setGoToProfileSettings(true);
                                                // @ts-ignore
                                                drawerNavigation && drawerNavigation!.navigate('Settings', {});
                                            }}
                                        >
                                            <Avatar.Accessory
                                                size={hp(3.5)}
                                                style={styles.avatarAccessoryStyle}
                                                color={'#F2FF5D'}
                                                onPress={async () => {
                                                    // go to the Profile screen
                                                    setGoToProfileSettings(true);
                                                    // @ts-ignore
                                                    drawerNavigation && drawerNavigation!.navigate('Settings', {});
                                                }}
                                            />
                                        </Avatar> :
                                        <TouchableOpacity
                                            onPress={async () => {
                                                // go to the Profile screen
                                                setGoToProfileSettings(true);
                                                // @ts-ignore
                                                drawerNavigation && drawerNavigation!.navigate('Settings', {});
                                            }}
                                        >
                                            <ExpoImage
                                                style={styles.profileImage}
                                                source={{
                                                    uri: profilePictureURI
                                                }}
                                                placeholder={MoonbeamProfilePlaceholder}
                                                placeholderContentFit={'cover'}
                                                contentFit={'cover'}
                                                transition={1000}
                                                cachePolicy={'memory-disk'}
                                            />
                                            <Avatar.Accessory
                                                size={hp(3.5)}
                                                style={styles.profileImageAccessoryStyle}
                                                color={'#F2FF5D'}
                                                onPress={async () => {
                                                    // go to the Profile screen
                                                    setGoToProfileSettings(true);
                                                    // @ts-ignore
                                                    drawerNavigation && drawerNavigation!.navigate('Settings', {});
                                                }}
                                            />
                                        </TouchableOpacity>
                                }
                                <Text numberOfLines={3} textBreakStrategy={"simple"}
                                      style={[styles.userNameStyle]}>{currentUserName}</Text>
                            </ImageBackground>
                            <Divider
                                style={[commonStyles.divider]}/>
                            <View style={styles.drawerItemListView}>
                                <DrawerItemList {...props}/>
                            </View>
                        </DrawerContentScrollView>
                        <View style={styles.bottomDrawerItemListView}>
                            <Divider
                                style={[commonStyles.divider]}/>
                            {/*@ts-ignore*/}
                            <DrawerItem
                                activeBackgroundColor={'transparent'}
                                activeTintColor={'#F2FF5D'}
                                icon={() => <Icon
                                    size={hp(3)}
                                    name={'logout'}
                                    color={'#F2FF5D'}/>}
                                labelStyle={[styles.drawerItemLabel]}
                                label={'Log Out'}
                                onPress={async () => {
                                    try {
                                        // navigate to the Login Screen
                                        setIsLoadingAppOverviewNeeded(true);
                                        // @ts-ignore
                                        mainRootNavigation && mainRootNavigation!.navigate('AppOverview', {});

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
                                        resetSearchStateReset();
                                        toggleViewPressedStateReset();
                                        verticalSectionActiveStateReset();
                                        searchQueryStateReset();
                                        filteredByDiscountPressedStateReset();
                                        filtersActiveStateReset();
                                        currentUserLocationStateReset();

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
                                        console.log('error while signing out: ', error);
                                    }
                                }}>
                            </DrawerItem>
                        </View>
                    </View>
            }
        </>
    )
}
