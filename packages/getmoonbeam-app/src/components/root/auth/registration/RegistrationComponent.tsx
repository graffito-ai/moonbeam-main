import React, {useEffect, useState} from "react";
import 'react-native-get-random-values';
import {Image, ImageBackground, Keyboard, Linking, Platform, TouchableOpacity, View} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {commonStyles} from '../../../../styles/common.module';
import {styles} from '../../../../styles/registration.module';
import {RegistrationProps} from "../../../../models/props/AuthenticationProps";
import {Dialog, IconButton, Portal, Text} from "react-native-paper";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useRecoilState, useResetRecoilState} from "recoil";
import {
    accountCreationDisclaimerCheckState,
    additionalDocumentationErrors,
    additionalDocumentationNeeded,
    addressCityErrorsState,
    addressCityState,
    addressLineErrorsState,
    addressLineFocusState,
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
    dutyStatusValueState,
    emailErrorsState,
    emailState,
    enlistingYearErrorsState,
    enlistingYearState,
    expoPushTokenState,
    firstNameErrorsState,
    firstNameState,
    globalAmplifyCacheState,
    isReadyRegistrationState,
    lastNameErrorsState,
    lastNameState,
    mainRootNavigationState,
    marketplaceAmplifyCacheState,
    militaryBranchErrorsState,
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
    verificationCodeErrorsState
} from '../../../../recoil/AuthAtom';
import {militaryAffiliationRegistrationStep, registrationSteps} from "../../../../models/Constants";
import {ProfileRegistrationStep} from "./ProfileRegistrationStep";
import {CodeVerificationStep} from "./CodeVerificationStep";
import {DocumentCaptureStep} from "./DocumentCaptureStep";
import {SecurityStep} from "./SecurityStep";
import {AdditionalRegistrationStep} from "./AdditionalRegistrationStep";
import {API, Auth, graphqlOperation} from "aws-amplify";
import {
    createMilitaryVerification,
    LoggingLevel,
    MilitaryAffiliation,
    MilitaryBranch,
    MilitaryDutyStatus,
    MilitaryVerificationStatusType,
    NotificationChannelType,
    NotificationStatus,
    NotificationType,
    ReferralResponse
} from "@moonbeam/moonbeam-models";
import {v4 as uuidv4} from 'uuid';
import {MilitaryStatusSplashStep} from "./MilitaryStatusSplashStep";
import {UserPermissionsStep} from "./UserPermissionsStep";
import * as Contacts from "expo-contacts";
import {fetchFile} from "../../../../utils/File";
import {Spinner} from "../../../common/Spinner";
import {splashStatusState} from "../../../../recoil/SplashAtom";
// @ts-ignore
import MoonbeamDuplicateEmail from '../../../../../assets/art/moonbeam-duplicate-email.png';
// @ts-ignore
import CardLinkedSuccessImage from '../../../../../assets/art/card-linked-success.png';
// @ts-ignore
import RegistrationBackgroundImage from '../../../../../assets/backgrounds/registration-background.png';
import {
    createPhysicalDevice,
    logEvent,
    processUserReferral,
    retrieveClickOnlyOnlineOffersList,
    retrieveFidelisPartnerList,
    retrieveOnlineOffersList,
    retrievePremierClickOnlyOnlineOffersList,
    retrievePremierOnlineOffersList,
    sendNotification
} from "../../../../utils/AppSync";
import {moonbeamUserIdPassState, moonbeamUserIdState} from "../../../../recoil/RootAtom";
import * as SecureStore from "expo-secure-store";
// @ts-ignore
import MoonbeamPreferencesIOS from "../../../../../assets/art/moonbeam-preferences-ios.jpg";
// @ts-ignore
import MoonbeamPreferencesAndroid from "../../../../../assets/art/moonbeam-preferences-android.jpg";
import {Button} from "@rneui/base";
import * as Notifications from "expo-notifications";
import * as ImagePicker from 'expo-image-picker';
import {
    numberOfClickOnlyOnlineOffersState,
    numberOfFailedClickOnlyOnlineOfferCallsState,
    numberOfFailedOnlineOfferCallsState,
    numberOfOnlineOffersState
} from "../../../../recoil/StoreOfferAtom";
import {referralCodeMarketingCampaignState, referralCodeState} from "../../../../recoil/BranchAtom";
import Constants from 'expo-constants';
import {AppOwnership} from "expo-constants/src/Constants.types";
import {MilitaryAffiliationStep} from "./MilitaryAffiliationStep";

/**
 * RegistrationComponent component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const RegistrationComponent = ({navigation}: RegistrationProps) => {
    // constants used to keep track of local component state
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [isKeyboardShown, setIsKeyboardShown] = useState<boolean>(false);
    const [existentAccountVisible, setExistentAccountVisible] = useState<boolean>(false);
    // constants used to keep track of shared states
    const [userIsAuthenticated,] = useRecoilState(userIsAuthenticatedState);
    const [numberOfOnlineFailedCalls, setNumberOfOnlineFailedCalls] = useRecoilState(numberOfFailedOnlineOfferCallsState);
    const [numberOfClickOnlyOnlineFailedCalls, setNumberOfClickOnlyOnlineFailedCalls] = useRecoilState(numberOfFailedClickOnlyOnlineOfferCallsState);
    const [, setIsUserAuthenticated] = useRecoilState(userIsAuthenticatedState);
    const [referralCodeMarketingCampaign,] = useRecoilState(referralCodeMarketingCampaignState);
    const [referralCode,] = useRecoilState(referralCodeState);
    const [numberOfOnlineOffers, setNumberOfOnlineOffers] = useRecoilState(numberOfOnlineOffersState);
    const [numberOfClickOnlyOnlineOffers, setNumberOfClickOnlyOnlineOffers] = useRecoilState(numberOfClickOnlyOnlineOffersState);
    const [mainRootNavigation,] = useRecoilState(mainRootNavigationState);
    const [, setDeferToLogin] = useRecoilState(deferToLoginState);
    const [automaticallyVerifyRegistrationCode, setAutomaticallyVerifyRegistrationCode] = useRecoilState(automaticallyVerifyRegistrationCodeState);
    const [, setDocumentsRePickPhoto] = useRecoilState(documentsRePickPhotoState);
    const [, setDocumentsReCapturePhoto] = useRecoilState(documentsReCapturePhotoState);
    const [permissionsModalVisible, setPermissionsModalVisible] = useRecoilState(permissionsModalVisibleState);
    const [permissionsModalCustomMessage, setPermissionsModalCustomMessage] = useRecoilState(permissionsModalCustomMessageState);
    const [permissionsInstructionsCustomMessage, setPermissionsInstructionsCustomMessage] = useRecoilState(permissionsInstructionsCustomMessageState);
    const [, setMoonbeamUserId] = useRecoilState(moonbeamUserIdState);
    const [, setMoonbeamUserIdPass] = useRecoilState(moonbeamUserIdPassState);
    const [marketplaceCache,] = useRecoilState(marketplaceAmplifyCacheState);
    const [globalCache,] = useRecoilState(globalAmplifyCacheState);
    const [isReady, setIsReady] = useRecoilState(isReadyRegistrationState);
    const [, setNavigation] = useRecoilState(authRegistrationNavigation);
    const [, setAmplifySignUpErrors] = useRecoilState(amplifySignUpProcessErrorsState);
    const [, setRegistrationMainError] = useRecoilState(registrationMainErrorState);
    const [, setIsBackButtonShown] = useRecoilState(registrationBackButtonShown);
    const [stepNumber, setStepNumber] = useRecoilState(registrationStepNumber);
    const [userInformation, setUserInformation] = useRecoilState(currentUserInformation);
    const [expoPushToken,] = useRecoilState(expoPushTokenState);
    // step 0
    const [currentMemberAffiliation, setCurrentMemberAffiliation] = useRecoilState(currentMemberAffiliationState);
    // step 1
    const [firstName, setFirstName] = useRecoilState(firstNameState);
    const [firstNameErrors, setFirstNameErrors] = useRecoilState(firstNameErrorsState);
    const [lastName, setLastName] = useRecoilState(lastNameState);
    const [lastNameErrors, setLastNameErrors] = useRecoilState(lastNameErrorsState);
    const [birthday, setBirthday] = useRecoilState(birthdayState);
    const [birthdayErrors, setBirthdayErrors] = useRecoilState(birthdayErrorState);
    const [phoneNumber, setPhoneNumber] = useRecoilState(phoneNumberState);
    const [phoneNumberErrors, setPhoneNumberErrors] = useRecoilState(phoneNumberErrorsState);
    const [email, setEmail] = useRecoilState(emailState);
    const [emailErrors, setEmailErrors] = useRecoilState(emailErrorsState);
    const [dutyStatus, setDutyStatus] = useRecoilState(dutyStatusValueState);
    const [dutyStatusErrors, setDutyStatusErrors] = useRecoilState(dutyStatusErrorsState);
    const [enlistingYear, setEnlistingYear] = useRecoilState(enlistingYearState);
    const [enlistingYearErrors, setEnlistingYearErrors] = useRecoilState(enlistingYearErrorsState);
    const ssnValueReset = useResetRecoilState(ssnState);
    const [ssnValue, setSSNValue] = useRecoilState(ssnState);
    const [ssnErrors, setSSNErrors] = useRecoilState(ssnErrorsState);
    // step 2
    const [addressLineFocus,] = useRecoilState(addressLineFocusState);
    const [addressLine, setAddressLine] = useRecoilState(addressLineState);
    const [addressLineErrors, setAddressLineErrors] = useRecoilState(addressLineErrorsState);
    const [addressCity, setAddressCity] = useRecoilState(addressCityState);
    const [addressCityErrors, setAddressCityErrors] = useRecoilState(addressCityErrorsState);
    const [addressState, setAddressState] = useRecoilState(addressStateState);
    const [addressStateErrors, setAddressStateErrors] = useRecoilState(addressStateErrorsState);
    const [addressZip, setAddressZip] = useRecoilState(addressZipState);
    const [addressZipErrors, setAddressZipErrors] = useRecoilState(addressZipErrorsState);
    const [militaryBranch, setMilitaryBranch] = useRecoilState(militaryBranchValueState);
    const [militaryBranchErrors, setMilitaryBranchErrors] = useRecoilState(militaryBranchErrorsState);
    // step 3
    const passwordStateReset = useResetRecoilState(registrationPasswordState);
    const [password, setPassword] = useRecoilState(registrationPasswordState);
    const confirmPasswordStateReset = useResetRecoilState(registrationConfirmationPasswordState);
    const [confirmPassword, setConfirmPassword] = useRecoilState(registrationConfirmationPasswordState);
    const [passwordErrors, setPasswordErrors] = useRecoilState(registrationPasswordErrorsState);
    const [confirmPasswordErrors, setConfirmPasswordErrors] = useRecoilState(registrationConfirmationPasswordErrorsState);
    const [accountRegistrationDisclaimer,] = useRecoilState(accountCreationDisclaimerCheckState);
    // step 4
    const [countdownValue, setCountdownValue] = useRecoilState(registrationCodeTimerValue);
    const [verificationCodeDigit1,] = useRecoilState(registrationVerificationDigit1);
    const [verificationCodeDigit2,] = useRecoilState(registrationVerificationDigit2);
    const [verificationCodeDigit3,] = useRecoilState(registrationVerificationDigit3);
    const [verificationCodeDigit4,] = useRecoilState(registrationVerificationDigit4);
    const [verificationCodeDigit5,] = useRecoilState(registrationVerificationDigit5);
    const [verificationCodeDigit6,] = useRecoilState(registrationVerificationDigit6);
    const [, setVerificationCodeErrors] = useRecoilState(verificationCodeErrorsState);
    // step 5
    const [militaryStatus, setMilitaryStatus] = useRecoilState(militaryVerificationStatus);
    const [militaryVerificationDisclaimer,] = useRecoilState(militaryRegistrationDisclaimerCheckState);
    // step 6
    const [additionalDocumentsNeeded, setAdditionalDocumentsNeeded] = useRecoilState(additionalDocumentationNeeded);
    const [, setDocumentationErrors] = useRecoilState(additionalDocumentationErrors);
    // step 7
    const [cardLinkingStatus,] = useRecoilState(cardLinkingRegistrationStatusState);
    const [splashState,] = useRecoilState(splashStatusState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // automatically verify the code without having to press next
        if (automaticallyVerifyRegistrationCode) {
            if (verificationCodeDigit1 === "" || verificationCodeDigit2 === "" || verificationCodeDigit3 === "" ||
                verificationCodeDigit4 === "" || verificationCodeDigit5 === "" || verificationCodeDigit6 === "") {
                setAutomaticallyVerifyRegistrationCode(false);
                setRegistrationMainError(true);
            } else {
                setAutomaticallyVerifyRegistrationCode(false);
                // check on the code validity through Amplify sign-in/sign-up
                confirmSignUpCode().then(signUpConfirmationFlag => {
                    // check if the confirmation was successful
                    if (signUpConfirmationFlag) {
                        setRegistrationMainError(false);
                        let newStepValue = stepNumber + 1;
                        setStepNumber(newStepValue);
                    } else {
                        setAutomaticallyVerifyRegistrationCode(false);
                    }
                });
            }

        }
        // keyboard listeners
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setIsKeyboardShown(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setIsKeyboardShown(false);
            }
        );

        // set the registration navigation to be used for Documents Viewer purposes
        setNavigation(navigation);

        // start the countdown if the value is 10
        if (countdownValue === 10) {
            startCountdown(10);
        }
        // /**
        //  * since for step number 7, the driving action is performed by the linking button in Olive's iFrame,
        //  * we want to ensure that once the linking was done successfully there, then before we proceed to the next step,
        //  * we set the state for the next one accordingly.
        //  */
        // if (stepNumber === 7 && cardLinkingStatus) {
        //     // setting the splash state for the next step
        //     setSplashState({
        //         splashTitle: 'Congrats!',
        //         splashDescription: 'Your card was successfully linked.',
        //         splashButtonText: 'Finish',
        //         splashArtSource: CardLinkedSuccessImage
        //     });
        //
        //     // increase the step number
        //     let newStepValue = stepNumber + 1;
        //     setStepNumber(newStepValue);
        // }
        // remove keyboard listeners accordingly
        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, [automaticallyVerifyRegistrationCode, isKeyboardShown, countdownValue, stepNumber, cardLinkingStatus]);

    /**
     * Callback function used to decrease the value of the countdown by 1,
     * given a number of seconds passed in.
     *
     * @param seconds number of seconds passed in
     */
    const startCountdown = (seconds): void => {
        let counter = seconds;

        const interval = setInterval(() => {
            setCountdownValue(counter.toString().length !== 2 ? `0${counter}` : counter);
            counter--;

            // if the number of seconds goes below 0
            if (counter < 0) {
                clearInterval(interval);
            }
        }, 1000);
    }

    /**
     * Function used to verify an individual's eligibility by checking their
     * military verification status.
     *
     * @param userId generated through previous steps during the sign-up process
     * @return a {@link Promise} of a pair, containing a {@link Boolean} and {@link MilitaryVerificationStatusType},
     * representing whether eligibility was verified successfully or not, and implicitly, the verification status.
     */
    const verifyEligibility = async (userId: string): Promise<[boolean, MilitaryVerificationStatusType]> => {
        try {
            // set a loader on button press
            setIsReady(false);

            // call the verification API
            const eligibilityResult = await API.graphql(graphqlOperation(createMilitaryVerification, {
                createMilitaryVerificationInput: {
                    id: userId,
                    firstName: firstName.trimStart().trimEnd(),
                    lastName: lastName.trimStart().trimEnd(),
                    dateOfBirth: birthday,
                    // default to current year for military spouses
                    enlistmentYear:
                        currentMemberAffiliation && currentMemberAffiliation === MilitaryAffiliation.FamilySpouse
                            ? new Date().getFullYear()
                            : enlistingYear.trimStart().trimEnd(),
                    addressLine: addressLine.trimStart().trimEnd(),
                    city: addressCity.trimStart().trimEnd(),
                    state: addressState.trimStart().trimEnd(),
                    zipCode: addressZip.trimStart().trimEnd(),
                    militaryAffiliation: currentMemberAffiliation,
                    militaryBranch:
                        currentMemberAffiliation && currentMemberAffiliation === MilitaryAffiliation.FamilySpouse
                            ? MilitaryBranch.NotApplicable
                            : militaryBranch.trimStart().trimEnd(),
                    militaryDutyStatus:
                        currentMemberAffiliation && currentMemberAffiliation === MilitaryAffiliation.FamilySpouse
                            ? MilitaryDutyStatus.NotApplicable
                            : dutyStatus.trimStart().trimEnd(),
                    ...(currentMemberAffiliation && currentMemberAffiliation === MilitaryAffiliation.FamilySpouse && {
                        personalIdentifier: ssnValue.trimStart().trimEnd().trim().replaceAll(' ', '')
                    })
                }
            }));

            // retrieve the data block from the response
            // @ts-ignore
            const responseData = eligibilityResult ? eligibilityResult.data : null;

            // check if there are any errors in the returned response
            if (responseData && responseData.createMilitaryVerification.errorMessage === null) {
                // release the loader on button press
                setIsReady(true);

                // we destroy any personal identifier info here since we don't need it anymore
                ssnValueReset();
                setSSNValue("");

                return [true, responseData.createMilitaryVerification.data.militaryVerificationStatus];
            } else {
                // release the loader on button press
                setIsReady(true);

                const message = `Unexpected error while retrieving the eligibility status ${JSON.stringify(eligibilityResult)}`;
                console.log(message);
                await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                return [false, MilitaryVerificationStatusType.Pending];
            }
        } catch (error) {
            // release the loader on button press
            setIsReady(true);

            const message = `Unexpected error while retrieving the eligibility status ${JSON.stringify(error)} ${error}`;
            console.log(message);
            await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

            return [false, MilitaryVerificationStatusType.Pending];
        }
    }

    /**
     * Function used for the Sign-Up functionality, using AWSAmplify.
     *
     * @returns a {@link Promise} containing a {@link boolean} flag, representing
     * whether the sign-up was successful or not
     */
    const signUp = async (): Promise<boolean> => {
        try {
            // set a loader on button press
            setIsReady(false);

            // convert the date of birth into the appropriate format (YYYY-MM-DD), accepted by AWS Amplify
            let dob = birthday;
            dob = `${dob.split('/')[2]}-${dob.split('/')[0]}-${dob.split('/')[1]}`;

            // set the uuid to identify the user throughout the sign-up process
            const userId = uuidv4();

            // update the user information state, with the newly created ID, to be used in later steps
            setUserInformation({
                userId: userId
            });

            // sign up the user
            await Auth.signUp({
                // enables auto sign in after user is confirmed
                autoSignIn: {
                    enabled: false
                },
                username: email.trimStart().trimEnd(),
                password: password,
                attributes: {
                    email: email.trimStart().trimEnd(),
                    phone_number: `${phoneNumber.replaceAll('(', '')
                        .replaceAll(')', '')
                        .replaceAll('-', '')
                        .replaceAll(' ', '')}`,
                    given_name: firstName.trimStart().trimEnd(),
                    family_name: lastName.trimStart().trimEnd(),
                    birthdate: dob,
                    address: `${addressLine.trimStart().trimEnd()}, ${addressCity.trimStart().trimEnd()}, ${addressState.trimStart().trimEnd()}, ${addressZip.trimStart().trimEnd()}`,
                    updated_at: Date.now().toString(),
                    'custom:branch': militaryBranch.trimStart().trimEnd(),
                    'custom:duty_status': dutyStatus.trimStart().trimEnd(),
                    'custom:userId': userId,
                    // we sign up the user with a single expo push token, representing the token of the physical device that they signed up from
                    'custom:expoPushToken': expoPushToken.data,
                    'custom:enlistmentYear': enlistingYear.trimStart().trimEnd(),
                    // only populate the military affiliation parameter as part of the Cognito object, if the member is not a service member
                    ...(currentMemberAffiliation && currentMemberAffiliation === MilitaryAffiliation.FamilySpouse && {
                        'custom:militaryAffiliation': currentMemberAffiliation
                    })
                }
            });

            // release the loader on button press
            setIsReady(true);

            // reset any errors that we might have previously had for Amplify
            setAmplifySignUpErrors([]);
            return true;
        } catch (error) {
            // @ts-ignore
            const errorMessage: string = error.message;
            if (errorMessage && errorMessage === "An account with the given email already exists.") {
                // set Amplify errors accordingly
                // @ts-ignore
                setAmplifySignUpErrors([errorMessage]);
                // show the appropriate modal
                setExistentAccountVisible(true);
            } else {
                // set Amplify errors accordingly
                // @ts-ignore
                setAmplifySignUpErrors(["Unexpected error while Signing Up. Try again!"]);
            }

            const message = errorMessage
                ? `Unexpected error while Signing Up: ${JSON.stringify(errorMessage)}`
                : `Unexpected error while Signing Up: ${JSON.stringify(error)} ${error}`;
            console.log(message);
            await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

            // release the loader on button press
            setIsReady(true);

            return false;
        }
    }

    /**
     * Function used to capture the confirmation of the verification code, and automatically sign in
     * a user, if they have successfully verified their account.
     *
     * @returns a {@link Promise} containing a {@link boolean} flag, representing
     * whether the sign-up code was successfully confirmed or not
     */
    const confirmSignUpCode = async (): Promise<boolean> => {
        try {
            // set a loader on button press
            setIsReady(false);

            // first confirm the signing up of the user, using the code provided
            const signUp = await Auth.confirmSignUp(
                email,
                `${verificationCodeDigit1}${verificationCodeDigit2}${verificationCodeDigit3}${verificationCodeDigit4}${verificationCodeDigit5}${verificationCodeDigit6}`,
                {forceAliasCreation: false}
            );
            if (signUp) {
                /**
                 * perform sign in here, once the user confirmed their account. Even though the 'autoSignIn' should have done this, since it doesn't properly
                 * work, we set that to false, and do it manually here instead.
                 */
                const user = await Auth.signIn(email, password);
                if (user) {
                    /**
                     * we will store these values in a Recoil state, so we can use them through Keychain/Secure Store in case the user wants to enable biometrics
                     * we will remove the values in these fields for readability purposes
                     */
                    setMoonbeamUserId(email);
                    setMoonbeamUserIdPass(password);
                    passwordStateReset();
                    setPassword("");
                    confirmPasswordStateReset();
                    setConfirmPassword("");

                    /**
                     * set the already signed in flag to true, so next time user logs in, they
                     * can skip on the overview screen.
                     */
                    await SecureStore.setItemAsync(`moonbeam-skip-overview`, '1', {
                        requireAuthentication: false // can only retrieve this if a valid authentication mechanism was successfully passed.
                    });

                    // retrieve the user information payload from the authenticated session.
                    const userInfo = user.signInUserSession.idToken.payload;

                    // set the current user information accordingly
                    setUserInformation({
                        ...userInformation,
                        ...userInfo
                    });

                    // once we have an account created for the user, we can send them a welcome notification
                    const createNotificationFlag = await sendNotification({
                        id: userInformation["userId"],
                        channelType: NotificationChannelType.Email,
                        type: NotificationType.NewUserSignup,
                        status: NotificationStatus.Sent,
                        emailDestination: userInfo["email"],
                        userFullName: `${userInfo["given_name"]} ${userInfo["family_name"]}`
                    });
                    /**
                     * if the notification was successfully sent, then we log it for sanity purposes. Otherwise,
                     * the error is already logged in the sendNotification() call, and we don't want to interrupt
                     * our user's experience due to this failure.
                     */
                    if (createNotificationFlag) {
                        const message = `User registration notification successfully sent!`;
                        console.log(message);
                        await logEvent(message, LoggingLevel.Info, userIsAuthenticated);
                    }

                    /**
                     * we then check whether we should proceed with the creation of a new physical device, or not.
                     * (only if we are not running the app in Expo Go)
                     */
                    if (Constants.appOwnership !== AppOwnership.Expo) {
                        // if so, we create the physical device accordingly (and associated to the new user)
                        const physicalDeviceCreationFlag = await createPhysicalDevice(userInformation["userId"], expoPushToken.data);
                        if (physicalDeviceCreationFlag) {
                            const message = `Successfully created a physical device for user!`;
                            console.log(message);
                            await logEvent(message, LoggingLevel.Info, userIsAuthenticated);
                        } else {
                            const message = `Unable to create a physical device for user!`;
                            console.log(message);
                            await logEvent(message, LoggingLevel.Error, userIsAuthenticated);
                        }
                    }

                    /**
                     * if the user successfully signed up and confirmed their account (through the email confirmation
                     * then we can kickstart the referral check process).
                     */
                    const referralResponse: ReferralResponse = await processUserReferral(referralCode, userInformation["userId"], referralCodeMarketingCampaign);

                    /**
                     * we do not throw an error here so we interrupt the registration flow, but merely so we know if the
                     * referral through the registration process has been successful or not
                     */
                    if (referralResponse.data !== null && referralResponse.data !== undefined) {
                        const message = `Referral through registration successfully processed for user ${userInformation["userId"]}`;
                        console.log(message);
                        await logEvent(message, LoggingLevel.Info, userIsAuthenticated);
                    } else {
                        const message = `Referral through registration was not successfully processed for user ${userInformation["userId"]}`;
                        console.log(message);
                        await logEvent(message, LoggingLevel.Warning, userIsAuthenticated);
                    }

                    // release the loader on button press
                    setIsReady(true);

                    // mark that the user is authenticated
                    setIsUserAuthenticated(true);

                    return true;
                } else {
                    const message = `Unexpected error while signing in upon verifying account: ${JSON.stringify(user)}`;
                    console.log(message);
                    await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                    // @ts-ignore
                    setVerificationCodeErrors(["Unexpected error while confirming sign up code. Try again!"]);

                    // release the loader on button press
                    setIsReady(true);

                    return false;
                }
            } else {
                const message = `Unexpected error while confirming sign up code: ${JSON.stringify(signUp)}`;
                console.log(message);
                await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                // @ts-ignore
                setVerificationCodeErrors(["Unexpected error while re-sending verification code. Try again!"]);

                // release the loader on button press
                setIsReady(true);

                return false;
            }
        } catch (error) {
            // @ts-ignore
            const errorMessage: string = error.name;
            if (errorMessage && errorMessage === "CodeMismatchException") {
                // set verification code errors accordingly
                // @ts-ignore
                setVerificationCodeErrors(["Invalid verification code provided. Try again!"]);
            } else if (errorMessage && errorMessage === "LimitExceededException") {
                // set verification code errors accordingly
                // @ts-ignore
                setVerificationCodeErrors(["Too many attempts to verify code. Please wait a while before verifying again!"]);
            } else if (errorMessage && errorMessage === "NotAuthorizedException") {
                // set verification code errors accordingly
                // @ts-ignore
                setVerificationCodeErrors(["Verification code expired. Generate a new code and try again!"]);
            } else {
                // set verification code errors accordingly
                // @ts-ignore
                setAmplifySignUpErrors(["Unexpected error while re-sending verification code. Try again!"]);
            }

            const message = errorMessage
                ? `Unexpected error while confirming sign up code: ${JSON.stringify(errorMessage)}`
                : `Unexpected error while confirming sign up code: ${JSON.stringify(error)} ${error}`;
            console.log(message);
            await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

            // release the loader on button press
            setIsReady(true);

            return false;
        }
    };

    /**
     * Function used to add the support number to the user's contacts,
     * in order to ensure a better experience when they message support.
     *
     * Note: Right now, this does not check for duplicate contacts. We
     * can do that later.
     */
    const addSupportToContacts = async (): Promise<void> => {
        const {status} = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
            // fetch the URI for the image to be retrieved from CloudFront
            // retrieving the document link from either local cache, or from storage
            const [returnFlag, shareURI] = await fetchFile('contact-icon.png', false, false, true);
            if (!returnFlag || shareURI === null) {
                const message = `Unable to download contact icon file!`;
                console.log(message);
                await logEvent(message, LoggingLevel.Warning, userIsAuthenticated);
            } else {
                // create a new contact for Moonbeam Support chat
                const contact = {
                    [Contacts.Fields.Name]: 'Moonbeam 🪖',
                    [Contacts.Fields.FirstName]: 'Moonbeam 🪖',
                    [Contacts.Fields.ContactType]: Contacts.ContactTypes.Company,
                    [Contacts.Fields.Birthday]: {
                        day: 4,
                        month: 6,
                        year: 1776
                    },
                    [Contacts.Fields.ImageAvailable]: true,
                    [Contacts.Fields.Image]: {
                        uri: shareURI
                    },
                    [Contacts.Fields.Emails]: [
                        {
                            label: 'Moonbeam Support Email',
                            email: 'info@moonbeam.vet',
                            isPrimary: true
                        }
                    ],
                    [Contacts.Fields.PhoneNumbers]: [
                        {
                            label: 'Moonbeam Support Phone Number',
                            countryCode: '+1',
                            number: '2107446222',
                            isPrimary: true
                        }
                    ],
                    [Contacts.Fields.UrlAddresses]: [
                        {
                            label: 'Moonbeam Website',
                            url: 'https://www.getmoonbeam.vet'
                        }
                    ]
                }
                // add a new contact for our Support chat
                // @ts-ignore
                await Contacts.addContactAsync(contact);
            }
        } else {
            const errorMessage = `Permission to access contacts was not granted!`;
            console.log(errorMessage);
            await logEvent(errorMessage, LoggingLevel.Warning, userIsAuthenticated);

            setPermissionsModalCustomMessage(errorMessage);
            setPermissionsInstructionsCustomMessage(Platform.OS === 'ios'
                ? "In order to easily contact our team and store our customer service number in your Contacts, go to Settings -> Moonbeam Finance, and allow Contacts access by tapping on the \'Contacts\' option."
                : "In order to easily contact our team and store our customer service number in your Contacts, go to Settings -> Apps -> Moonbeam Finance -> Permissions, and allow Contacts access by tapping on the \"Contacts\" option.");
            setPermissionsModalVisible(true);
        }
    }

    /**
     * Function used to add the necessary notification permissions, needed for the application
     * to send push, as well as other types of notifications.
     */
    const addSupportForNotifications = async () => {
        const {status} = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
            const errorMessage = `Permission to access notifications was not granted!`;
            console.log(errorMessage);
            await logEvent(errorMessage, LoggingLevel.Warning, userIsAuthenticated);

            setPermissionsModalCustomMessage(errorMessage);
            setPermissionsInstructionsCustomMessage(Platform.OS === 'ios'
                ? "In order to stay up to date with your latest cashback earned, go to Settings -> Moonbeam Finance, and allow Notifications by tapping on the \'Notifications\' option."
                : "In order to stay up to date with your latest cashback earned, go to Settings -> Apps -> Moonbeam Finance -> Permissions/Notifications, and allow Notifications by tapping on the \'Notifications\' option.");
            setPermissionsModalVisible(true);
        }
    }

    // return the component for the Registration page
    return (
        <>
            {
                !isReady ?
                    <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                    :
                    <>
                        <Portal>
                            <Dialog style={[commonStyles.dialogStyle, {height: hp(60)}]}
                                    visible={existentAccountVisible}
                                    onDismiss={() => setExistentAccountVisible(false)}
                                    dismissable={false}
                            >
                                <Dialog.Title
                                    style={commonStyles.dialogTitle}>{'Duplicate email!'}</Dialog.Title>
                                <Dialog.Content>
                                    <Image
                                        resizeMethod={"scale"}
                                        source={MoonbeamDuplicateEmail}
                                        style={styles.duplicateEmailImage}
                                    />
                                    <Text
                                        style={commonStyles.dialogParagraph}>{"An account with the given email already exists. Login with your existing account or try again with a new email!"}</Text>
                                </Dialog.Content>
                                <Dialog.Actions style={{alignSelf: 'center', flexDirection: 'column'}}>
                                    <Button buttonStyle={commonStyles.dialogButton}
                                            titleStyle={commonStyles.dialogButtonText}
                                            onPress={async () => {
                                                // go to the Login page
                                                setDeferToLogin(true);
                                                mainRootNavigation && mainRootNavigation!.navigate('AppOverview', {});

                                                // reset all registration fields as needed, for steps 0, 1 and 2
                                                setStepNumber(-1);
                                                setIsBackButtonShown(true);
                                                setRegistrationMainError(false);
                                                // reset step -1
                                                setCurrentMemberAffiliation(null);
                                                // reset step 0
                                                setFirstNameErrors([]);
                                                setLastNameErrors([]);
                                                setEmailErrors([]);
                                                setBirthdayErrors([]);
                                                setPhoneNumberErrors([]);
                                                setEnlistingYearErrors([]);
                                                setDutyStatusErrors([]);
                                                setFirstName("");
                                                setLastName("");
                                                setEmail("");
                                                setBirthday("");
                                                setPhoneNumber("");
                                                setEnlistingYear("");
                                                setDutyStatus("");
                                                setSSNValue("");
                                                setSSNErrors([]);
                                                // reset step 1
                                                setAddressLineErrors([]);
                                                setAddressCityErrors([]);
                                                setAddressStateErrors([]);
                                                setAddressZipErrors([]);
                                                setMilitaryBranchErrors([]);
                                                setAddressLine("");
                                                setAddressCity("");
                                                setAddressState("");
                                                setAddressZip("");
                                                setMilitaryBranch("");
                                                // reset step 2
                                                setAmplifySignUpErrors([]);
                                                setPasswordErrors([]);
                                                setConfirmPasswordErrors([]);
                                                setPassword("");
                                                setConfirmPassword("");
                                            }}>
                                        {"Go to Login"}
                                    </Button>
                                    <Button buttonStyle={commonStyles.dialogButtonSkip}
                                            titleStyle={commonStyles.dialogButtonSkipText}
                                            onPress={async () => {
                                                // close modal
                                                setExistentAccountVisible(false);

                                                // go back to initial email step
                                                setStepNumber(0);
                                                setIsBackButtonShown(true);
                                                setRegistrationMainError(false);
                                                // reset step 1
                                                setAddressLineErrors([]);
                                                setAddressCityErrors([]);
                                                setAddressStateErrors([]);
                                                setAddressZipErrors([]);
                                                setMilitaryBranchErrors([]);
                                                setAddressLine("");
                                                setAddressCity("");
                                                setAddressState("");
                                                setAddressZip("");
                                                setMilitaryBranch("");
                                                // reset step 2
                                                setAmplifySignUpErrors([]);
                                                setPasswordErrors([]);
                                                setConfirmPasswordErrors([]);
                                                setPassword("");
                                                setConfirmPassword("");
                                            }}>
                                        {"Back"}
                                    </Button>
                                </Dialog.Actions>
                            </Dialog>
                        </Portal>
                        <Portal>
                            <Dialog style={commonStyles.permissionsDialogStyle} visible={permissionsModalVisible}
                                    onDismiss={() => setPermissionsModalVisible(false)}>
                                <Dialog.Title
                                    style={commonStyles.dialogTitle}>{'Permissions not granted!'}</Dialog.Title>
                                <Dialog.Content>
                                    <Text
                                        style={commonStyles.dialogParagraph}>{permissionsModalCustomMessage}</Text>
                                </Dialog.Content>
                                <Image source={
                                    Platform.OS === 'ios'
                                        ? MoonbeamPreferencesIOS
                                        : MoonbeamPreferencesAndroid
                                }
                                       style={commonStyles.permissionsDialogImage}/>
                                <Dialog.Content>
                                    <Text
                                        style={commonStyles.dialogParagraphInstructions}>{permissionsInstructionsCustomMessage}</Text>
                                </Dialog.Content>
                                <Dialog.Actions style={{alignSelf: 'center', flexDirection: 'column'}}>
                                    <Button buttonStyle={commonStyles.dialogButton}
                                            titleStyle={commonStyles.dialogButtonText}
                                            onPress={async () => {
                                                // go to the appropriate settings page depending on the OS
                                                if (Platform.OS === 'ios') {
                                                    await Linking.openURL("app-settings:");
                                                } else {
                                                    await Linking.openSettings();
                                                }
                                                setPermissionsModalVisible(false);

                                                // check if media library permissions have been re-enabled
                                                const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
                                                // if the status is granted
                                                if (mediaLibraryStatus && mediaLibraryStatus.status === 'granted') {
                                                    setDocumentsRePickPhoto(true);
                                                }

                                                // check if camera permissions have been re-enabled
                                                const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
                                                // if the status is granted
                                                if (cameraStatus && cameraStatus.status === 'granted') {
                                                    setDocumentsReCapturePhoto(true);
                                                }
                                            }}>
                                        {"Go to App Settings"}
                                    </Button>
                                    <Button buttonStyle={commonStyles.dialogButtonSkip}
                                            titleStyle={commonStyles.dialogButtonSkipText}
                                            onPress={async () => {
                                                // close modal
                                                setPermissionsModalVisible(false);
                                            }}>
                                        {"Skip"}
                                    </Button>
                                </Dialog.Actions>
                            </Dialog>
                        </Portal>
                        <ImageBackground
                            style={[commonStyles.image]}
                            imageStyle={{
                                resizeMode: 'stretch'
                            }}
                            resizeMethod={"scale"}
                            source={RegistrationBackgroundImage}>
                            <KeyboardAwareScrollView
                                scrollEnabled={(stepNumber == 0 || (stepNumber === 1 && !addressLineFocus) || stepNumber === 2 || stepNumber === 3)}
                                enableOnAndroid={true}
                                showsVerticalScrollIndicator={false}
                                enableAutomaticScroll={(Platform.OS === 'ios')}
                                contentContainerStyle={[commonStyles.rowContainer]}
                                keyboardShouldPersistTaps={'handled'}
                            >
                                <View style={[Platform.OS === 'android' && isKeyboardShown && {height: hp(110)},
                                    Platform.OS === 'android' && isKeyboardShown && stepNumber === 2 && {height: hp(100)},
                                    Platform.OS === 'android' && isKeyboardShown && stepNumber === 3 && {height: hp(85)}]}>
                                    {stepNumber !== 8 && stepNumber !== 7 &&
                                        <View
                                            style={[styles.titleView, {marginTop: hp(18)},
                                                (stepNumber === -1) && {top: -hp(7)},
                                                (stepNumber === 1 || stepNumber === 2) && {bottom: hp(3.5)},
                                                (stepNumber === 4 || (stepNumber === 5 && militaryStatus !== MilitaryVerificationStatusType.Rejected)) && {marginTop: hp(25)}]}>
                                            <View style={[styles.titleViewDescription]}>
                                                <Text style={styles.stepTitle}>
                                                    {stepNumber === -1
                                                        ? militaryAffiliationRegistrationStep[0].stepTitle
                                                        : registrationSteps[stepNumber].stepTitle
                                                    }
                                                </Text>
                                                <IconButton
                                                    icon={"triangle"}
                                                    iconColor={"#F2FF5D"}
                                                    size={wp(4)}
                                                    style={styles.triangleIcon}
                                                />
                                            </View>
                                        </View>}
                                    {(militaryStatus === MilitaryVerificationStatusType.Verified && stepNumber === 5) || stepNumber === 7 ? <></> :
                                        (stepNumber === 3
                                                ?
                                                <Text style={styles.stepDescription}>{
                                                    registrationSteps[stepNumber].stepDescription
                                                }{" "}<Text style={styles.stepDescriptionUnderline}>Check your spam and
                                                    trash
                                                    inboxes.</Text>
                                                </Text>
                                                : <Text style={[styles.stepDescription,
                                                    (stepNumber === -1) && {top: -hp(7)},
                                                    (stepNumber === 1 || stepNumber === 2) && {bottom: hp(3.5)}]}>{
                                                    stepNumber === -1
                                                        ? militaryAffiliationRegistrationStep[0].stepDescription
                                                        : registrationSteps[stepNumber].stepDescription
                                                }</Text>
                                        )
                                    }
                                    {/*switch views based on the step number*/}
                                    {
                                        stepNumber === -1
                                            ? <MilitaryAffiliationStep/>
                                            : stepNumber === 0
                                                ? <ProfileRegistrationStep/>
                                                : stepNumber === 1
                                                    ? <AdditionalRegistrationStep/>
                                                    : stepNumber === 2
                                                        ? <SecurityStep/>
                                                        : stepNumber === 3
                                                            ? <CodeVerificationStep/>
                                                            : stepNumber === 4
                                                                ? <UserPermissionsStep/>
                                                                : stepNumber === 5
                                                                    ? <MilitaryStatusSplashStep/>
                                                                    : stepNumber === 6
                                                                        ? <DocumentCaptureStep/>
                                                                        : <></>
                                        // : stepNumber === 7
                                        //     ? <CardLinkingStep/>
                                        //     : stepNumber === 8
                                        //         ? <CardLinkingStatusSplashStep/>
                                        //         : <></>
                                    }
                                    <View style={[
                                        styles.bottomContainerButtons,
                                        (stepNumber === 1 || stepNumber === 2) && {bottom: hp(10)}
                                    ]}>
                                        {(stepNumber === 0 || stepNumber === 1 || stepNumber === 2) &&
                                            <TouchableOpacity
                                                style={styles.buttonLeft}
                                                onPress={
                                                    () => {
                                                        // show back button on previous step
                                                        setIsBackButtonShown(true);

                                                        // clean the registration error on previous step
                                                        setRegistrationMainError(false);

                                                        // reset all the text fields according to the step number
                                                        if (stepNumber === 2) {
                                                            setAmplifySignUpErrors([]);
                                                            setPasswordErrors([]);
                                                            setConfirmPasswordErrors([]);
                                                            setPassword("");
                                                            setConfirmPassword("");
                                                        }
                                                        if (stepNumber === 1) {
                                                            setAddressLineErrors([]);
                                                            setAddressCityErrors([]);
                                                            setAddressStateErrors([]);
                                                            setAddressZipErrors([]);
                                                            setMilitaryBranchErrors([]);
                                                            setAddressLine("");
                                                            setAddressCity("");
                                                            setAddressState("");
                                                            setAddressZip("");
                                                            setMilitaryBranch("");
                                                        }
                                                        if (stepNumber === 0) {
                                                            setFirstNameErrors([]);
                                                            setFirstName("");
                                                            setLastNameErrors([]);
                                                            setLastName("");
                                                            setEmailErrors([]);
                                                            setEmail("");
                                                            setBirthday("");
                                                            setBirthdayErrors([]);
                                                            setPhoneNumber("");
                                                            setPhoneNumberErrors([]);
                                                            setEnlistingYear("");
                                                            setEnlistingYearErrors([]);
                                                            setDutyStatus("");
                                                            setDutyStatusErrors([]);
                                                            setSSNErrors([]);
                                                            setSSNValue("");
                                                        }

                                                        // decrease the step number
                                                        if (stepNumber >= 0) {
                                                            let newStepValue = stepNumber - 1;
                                                            setStepNumber(newStepValue);
                                                        }
                                                    }
                                                }
                                            >
                                                <Text style={styles.buttonText}>Previous</Text>
                                            </TouchableOpacity>}
                                        {stepNumber !== 7 && stepNumber !== -1 && <TouchableOpacity
                                            disabled={
                                                (!militaryVerificationDisclaimer && stepNumber === 5)
                                                || (!accountRegistrationDisclaimer && stepNumber === 2)
                                                || (additionalDocumentsNeeded && stepNumber === 6)
                                            }
                                            style={[
                                                (
                                                    !militaryVerificationDisclaimer && stepNumber === 5
                                                    || (!accountRegistrationDisclaimer && stepNumber === 2)
                                                    || (additionalDocumentsNeeded && stepNumber === 6)
                                                )
                                                    ? styles.buttonRightDisabled
                                                    : styles.buttonRight,
                                                (stepNumber === 3 || stepNumber === 6) && {alignSelf: 'center'},
                                                (stepNumber === 0 || stepNumber === 1 || stepNumber === 2) && {marginLeft: wp(25)},
                                                (stepNumber === 4)
                                                && {
                                                    alignSelf: 'center',
                                                    marginBottom: hp(12)
                                                },
                                                (stepNumber === 5)
                                                && {
                                                    alignSelf: 'center',
                                                    marginBottom: hp(10)
                                                },
                                                stepNumber === 8
                                                && {
                                                    marginBottom: hp(10)
                                                }]
                                            }
                                            onPress={
                                                async () => {
                                                    // show back button on next step if the step is 0, 1 or 2
                                                    (stepNumber === 0 || stepNumber === 1) ? setIsBackButtonShown(true) : setIsBackButtonShown(false);

                                                    // verify if we can move to the next stage
                                                    let checksPassed = true;
                                                    switch (stepNumber) {
                                                        case 0:
                                                            if (currentMemberAffiliation === MilitaryAffiliation.ServiceMember) {
                                                                if (dutyStatus === "" || enlistingYear === "" || firstName === "" || lastName === "" || email === "" || birthday === "" || phoneNumber === ""
                                                                    || firstNameErrors.length !== 0 || lastNameErrors.length !== 0 ||
                                                                    enlistingYearErrors.length !== 0 || dutyStatusErrors.length !== 0 ||
                                                                    emailErrors.length !== 0 || birthdayErrors.length !== 0 || phoneNumberErrors.length !== 0) {
                                                                    checksPassed = false;

                                                                    // only populate main error if there are no other errors showing
                                                                    if (firstNameErrors.length === 0 && lastNameErrors.length === 0 &&
                                                                        emailErrors.length === 0 && birthdayErrors.length === 0 && phoneNumberErrors.length === 0 &&
                                                                        enlistingYearErrors.length === 0 && dutyStatusErrors.length === 0) {
                                                                        setRegistrationMainError(true);
                                                                    }
                                                                } else {
                                                                    setRegistrationMainError(false);
                                                                    checksPassed = true;
                                                                }
                                                            } else if (currentMemberAffiliation === MilitaryAffiliation.FamilySpouse) {
                                                                if (ssnValue === "" || firstName === "" || lastName === "" || email === "" || birthday === "" || phoneNumber === "" ||
                                                                    firstNameErrors.length !== 0 || lastNameErrors.length !== 0 || ssnErrors.length !== 0 || emailErrors.length !== 0 || birthdayErrors.length !== 0 || phoneNumberErrors.length !== 0) {
                                                                    checksPassed = false;

                                                                    // only populate main error if there are no other errors showing
                                                                    if (firstNameErrors.length === 0 && lastNameErrors.length === 0 &&
                                                                        emailErrors.length === 0 && birthdayErrors.length === 0 && phoneNumberErrors.length === 0 &&
                                                                        ssnErrors.length === 0) {
                                                                        setRegistrationMainError(true);
                                                                    }
                                                                } else {
                                                                    setRegistrationMainError(false);
                                                                    checksPassed = true;
                                                                }
                                                            }
                                                            break;
                                                        case 1:
                                                            if (currentMemberAffiliation === MilitaryAffiliation.ServiceMember) {
                                                                if (addressLine === "" || addressCity === "" || addressState === "" || addressZip === "" || militaryBranch === ""
                                                                    || addressLineErrors.length !== 0 || addressCityErrors.length !== 0 ||
                                                                    addressStateErrors.length !== 0 || addressZipErrors.length !== 0 || militaryBranchErrors.length !== 0) {
                                                                    checksPassed = false;

                                                                    // only populate main error if there are no other errors showing
                                                                    if (addressLineErrors.length === 0 && addressCityErrors.length === 0 &&
                                                                        addressStateErrors.length === 0 && addressZipErrors.length === 0 && militaryBranchErrors.length === 0) {
                                                                        setRegistrationMainError(true);
                                                                    }
                                                                } else {
                                                                    setRegistrationMainError(false);
                                                                    checksPassed = true;
                                                                }
                                                            } else if (currentMemberAffiliation === MilitaryAffiliation.FamilySpouse) {
                                                                if (addressLine === "" || addressCity === "" || addressState === "" || addressZip === "" ||
                                                                    addressLineErrors.length !== 0 || addressCityErrors.length !== 0 || addressStateErrors.length !== 0 ||
                                                                    addressZipErrors.length !== 0) {
                                                                    checksPassed = false;

                                                                    // only populate main error if there are no other errors showing
                                                                    if (addressLineErrors.length === 0 && addressCityErrors.length === 0 &&
                                                                        addressStateErrors.length === 0 && addressZipErrors.length === 0) {
                                                                        setRegistrationMainError(true);
                                                                    }
                                                                } else {
                                                                    setRegistrationMainError(false);
                                                                    checksPassed = true;
                                                                }
                                                            }
                                                            break;
                                                        case 2:
                                                            if (confirmPassword === "" || password === "" || passwordErrors.length !== 0
                                                                || confirmPasswordErrors.length !== 0) {
                                                                checksPassed = false;

                                                                // only populate main error if there are no other errors showing
                                                                if (passwordErrors.length === 0 && confirmPasswordErrors.length === 0) {
                                                                    setRegistrationMainError(true);
                                                                }
                                                            } else {
                                                                // register user through Amplify
                                                                const signUpFlag = await signUp();

                                                                // check if registration was successful
                                                                if (signUpFlag) {
                                                                    // initiate the countdown if an account has been created without any errors
                                                                    setCountdownValue(10);

                                                                    setRegistrationMainError(false);
                                                                    checksPassed = true;
                                                                } else {
                                                                    checksPassed = false;
                                                                }
                                                            }
                                                            break;
                                                        case 3:
                                                            if (verificationCodeDigit1 === "" || verificationCodeDigit2 === "" || verificationCodeDigit3 === "" ||
                                                                verificationCodeDigit4 === "" || verificationCodeDigit5 === "" || verificationCodeDigit6 === "") {
                                                                checksPassed = false;

                                                                setRegistrationMainError(true);
                                                            } else {
                                                                // check on the code validity through Amplify sign-in/sign-up
                                                                const signUpConfirmationFlag = await confirmSignUpCode();

                                                                // check if the confirmation was successful
                                                                if (signUpConfirmationFlag) {
                                                                    setRegistrationMainError(false);
                                                                    checksPassed = true;
                                                                } else {
                                                                    checksPassed = false;
                                                                }
                                                            }
                                                            break;
                                                        case 4:
                                                            try {
                                                                // set the loader
                                                                setIsReady(false);

                                                                // permissions for user device for newly registered user
                                                                await addSupportToContacts();
                                                                await addSupportForNotifications();
                                                                // await requestForegroundLocationPermission();
                                                                // await requestMediaLibraryPermission();
                                                                // await requestCameraPermission();

                                                                // release the loader
                                                                setIsReady(true);
                                                            } catch (err) {
                                                                // make an exception for Android/Expo Go for Contacts
                                                                // @ts-ignore
                                                                if (Platform.OS === 'android' && err.code && err.code === 'E_MISSING_PERMISSION') {
                                                                    const errorMessage1 = `Unexpected error while adding permissions, overriding: ${err}`;
                                                                    console.log(errorMessage1);
                                                                    await logEvent(errorMessage1, LoggingLevel.Error, userIsAuthenticated);

                                                                    const errorMessage2 = `Unexpected error while adding permissions, overriding: ${JSON.stringify(err)}`;
                                                                    console.log(errorMessage2);
                                                                    await logEvent(errorMessage2, LoggingLevel.Error, userIsAuthenticated);

                                                                    setIsReady(true);
                                                                } else {
                                                                    const errorMessage1 = `Unexpected error while adding permissions: ${err}`;
                                                                    console.log(errorMessage1);
                                                                    await logEvent(errorMessage1, LoggingLevel.Error, userIsAuthenticated);

                                                                    const errorMessage2 = `Unexpected error while adding permissions: ${JSON.stringify(err)}`;
                                                                    console.log(errorMessage2);
                                                                    await logEvent(errorMessage2, LoggingLevel.Error, userIsAuthenticated);

                                                                    setRegistrationMainError(true);
                                                                    checksPassed = false;

                                                                    // release the loader
                                                                    setIsReady(true);
                                                                }
                                                            }
                                                            break;
                                                        case 5:
                                                            // when initiating the verification process
                                                            if (militaryStatus === MilitaryVerificationStatusType.Rejected) {
                                                                // check on the military verification eligibility status
                                                                const [verificationFlag, verificationStatus] = await verifyEligibility(userInformation["userId"]);

                                                                // check if the military status retrieval was successful
                                                                if (verificationFlag) {
                                                                    setRegistrationMainError(false);

                                                                    // if the verification status is verified, then we can cache it accordingly
                                                                    if (verificationStatus === MilitaryVerificationStatusType.Verified) {
                                                                        if (globalCache && await globalCache!.getItem(`${userInformation["custom:userId"]}-militaryStatus`) !== null) {
                                                                            const message = 'old military status is cached, needs cleaning up';
                                                                            console.log(message);
                                                                            await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                                                                            await globalCache!.removeItem(`${userInformation["custom:userId"]}-militaryStatus`);
                                                                            await globalCache!.setItem(`${userInformation["custom:userId"]}-militaryStatus`, MilitaryVerificationStatusType.Verified);
                                                                            userInformation["militaryStatus"] = MilitaryVerificationStatusType.Verified;

                                                                        } else {
                                                                            const message = 'military status is not cached';
                                                                            console.log(message);
                                                                            await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                                                                            globalCache && globalCache!.setItem(`${userInformation["custom:userId"]}-militaryStatus`, MilitaryVerificationStatusType.Verified);
                                                                            userInformation["militaryStatus"] = MilitaryVerificationStatusType.Verified;
                                                                        }
                                                                    }

                                                                    /**
                                                                     * even if this was successful, at first pass do not allow going to the next step if it is VERIFIED
                                                                     * since we want to display the successful status screen
                                                                     */
                                                                    checksPassed = verificationStatus === MilitaryVerificationStatusType.Pending;
                                                                    userInformation["militaryStatus"] = MilitaryVerificationStatusType.Pending;

                                                                    // if the checks passed, and implicitly if the status is VERIFIED, then set the additional documents needed flag
                                                                    if (checksPassed) {
                                                                        setAdditionalDocumentsNeeded(true);
                                                                    }

                                                                    // set the obtained status appropriately
                                                                    setMilitaryStatus(verificationStatus);
                                                                } else {
                                                                    setRegistrationMainError(true);
                                                                    checksPassed = false;
                                                                }
                                                            } else {
                                                                // upon subsequent button presses, once the status was changed, enable going to the next step
                                                                checksPassed = true;

                                                                // clear any documents related errors
                                                                setDocumentationErrors([]);
                                                            }
                                                            break;
                                                        // case 6:
                                                        //     // for the 7th step, the driver of the step is the additional documentation needed flag in the Documentation component
                                                        //     break;
                                                        // case 7:
                                                        //     /**
                                                        //      * for the 8th step, we need to handle that retroactively in the useEffect(), since we don't have control over the button press,
                                                        //      * given that it's coming from Olive's iFrame.
                                                        //      */
                                                        //     break;
                                                        // case 8:
                                                        //     setIsReady(false);
                                                        //     /**
                                                        //      * If everything was successful, then:
                                                        //      * - we just cache the list of:
                                                        //      *      - Fidelis partners for initial load (for 1 week only)
                                                        //      *      - the list of premier click-only online offers
                                                        //      *      - the list of click-only online offers (first page only) for initial load (for 1 week only)
                                                        //      *      - the list of premier online offers
                                                        //      *      - the list of online offers (first page only) for initial load (for 1 week only)
                                                        //      *      - the list of offers near user's home address (first page only) for initial load (for 1 week only)
                                                        //      *      - the list of categorized online offers
                                                        //      * - we just cache an empty profile photo for the user for initial load
                                                        //      */
                                                        //     if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-fidelisPartners`) !== null) {
                                                        //         const message = 'old Fidelis Partners are cached, needs cleaning up';
                                                        //         console.log(message);
                                                        //         await logEvent(message, LoggingLevel.Info, userIsAuthenticated);
                                                        //         await marketplaceCache!.removeItem(`${userInformation["custom:userId"]}-fidelisPartners`);
                                                        //         await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-fidelisPartners`, await retrieveFidelisPartnerList());
                                                        //     } else {
                                                        //         const message = 'Fidelis Partners are not cached';
                                                        //         console.log(message);
                                                        //         await logEvent(message, LoggingLevel.Info, userIsAuthenticated);
                                                        //         marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-fidelisPartners`, await retrieveFidelisPartnerList());
                                                        //     }
                                                        //     if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineOffers`) !== null) {
                                                        //         const message = 'online offers are cached, needs cleaning up';
                                                        //         console.log(message);
                                                        //         await logEvent(message, LoggingLevel.Info, userIsAuthenticated);
                                                        //         await marketplaceCache!.removeItem(`${userInformation["custom:userId"]}-onlineOffers`);
                                                        //
                                                        //         // retrieve the premier online, and regular online offers
                                                        //         const onlineOffers = await retrieveOnlineOffersList(
                                                        //             numberOfOnlineFailedCalls, setNumberOfOnlineFailedCalls,
                                                        //             numberOfOnlineOffers, setNumberOfOnlineOffers);
                                                        //         const premierOnlineOffers = await retrievePremierOnlineOffersList(numberOfOnlineFailedCalls, setNumberOfOnlineFailedCalls);
                                                        //
                                                        //         // update the number of available total online offers
                                                        //         setNumberOfOnlineOffers(oldNumberOfOnlineOffers => {
                                                        //             return oldNumberOfOnlineOffers + premierOnlineOffers.length
                                                        //         });
                                                        //
                                                        //         await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineOffers`,
                                                        //             [...premierOnlineOffers, ...onlineOffers]);
                                                        //     } else {
                                                        //         const message = 'online offers are not cached';
                                                        //         console.log(message);
                                                        //         await logEvent(message, LoggingLevel.Info, userIsAuthenticated);
                                                        //
                                                        //         // retrieve the premier online, and regular online offers
                                                        //         const onlineOffers = await retrieveOnlineOffersList(
                                                        //             numberOfOnlineFailedCalls, setNumberOfOnlineFailedCalls,
                                                        //             numberOfOnlineOffers, setNumberOfOnlineOffers);
                                                        //         const premierOnlineOffers = await retrievePremierOnlineOffersList(numberOfOnlineFailedCalls, setNumberOfOnlineFailedCalls);
                                                        //
                                                        //         // update the number of available total online offers
                                                        //         setNumberOfOnlineOffers(oldNumberOfOnlineOffers => {
                                                        //             return oldNumberOfOnlineOffers + premierOnlineOffers.length
                                                        //         });
                                                        //
                                                        //         marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineOffers`,
                                                        //             [...premierOnlineOffers, ...onlineOffers]);
                                                        //     }
                                                        //     if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-clickOnlyOnlineOffers`) !== null) {
                                                        //         const message = 'click-only online offers are cached, needs cleaning up';
                                                        //         console.log(message);
                                                        //         await logEvent(message, LoggingLevel.Info, userIsAuthenticated);
                                                        //
                                                        //         await marketplaceCache!.removeItem(`${userInformation["custom:userId"]}-clickOnlyOnlineOffers`);
                                                        //
                                                        //         // retrieve the premier click-only online, and regular click-only online offers
                                                        //         const clickOnlyOnlineOffers = await retrieveClickOnlyOnlineOffersList(
                                                        //             numberOfClickOnlyOnlineFailedCalls, setNumberOfClickOnlyOnlineFailedCalls,
                                                        //             numberOfClickOnlyOnlineOffers, setNumberOfClickOnlyOnlineOffers)
                                                        //         const premierClickOnlyOnlineOffers = await retrievePremierClickOnlyOnlineOffersList(numberOfClickOnlyOnlineFailedCalls, setNumberOfClickOnlyOnlineFailedCalls);
                                                        //
                                                        //         // update the number of available total online offers
                                                        //         setNumberOfClickOnlyOnlineOffers(oldNumberOfClickOnlyOnlineOffers => {
                                                        //             return oldNumberOfClickOnlyOnlineOffers + premierClickOnlyOnlineOffers.length
                                                        //         });
                                                        //
                                                        //         await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-clickOnlyOnlineOffers`,
                                                        //             [...premierClickOnlyOnlineOffers, ...clickOnlyOnlineOffers]);
                                                        //     } else {
                                                        //         const message = 'online click-only offers are not cached';
                                                        //         console.log(message);
                                                        //         await logEvent(message, LoggingLevel.Info, userIsAuthenticated);
                                                        //
                                                        //         // retrieve the premier click-only online, and regular click-only online offers
                                                        //         const clickOnlyOnlineOffers = await retrieveClickOnlyOnlineOffersList(
                                                        //             numberOfClickOnlyOnlineFailedCalls, setNumberOfClickOnlyOnlineFailedCalls,
                                                        //             numberOfClickOnlyOnlineOffers, setNumberOfClickOnlyOnlineOffers);
                                                        //         const premierClickOnlyOnlineOffers = await retrievePremierClickOnlyOnlineOffersList(numberOfClickOnlyOnlineFailedCalls, setNumberOfClickOnlyOnlineFailedCalls);
                                                        //
                                                        //         // update the number of available total online offers
                                                        //         setNumberOfClickOnlyOnlineOffers(oldNumberOfClickOnlyOnlineOffers => {
                                                        //             return oldNumberOfClickOnlyOnlineOffers + premierClickOnlyOnlineOffers.length
                                                        //         });
                                                        //
                                                        //         marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-clickOnlyOnlineOffers`,
                                                        //             [...premierClickOnlyOnlineOffers, ...clickOnlyOnlineOffers]);
                                                        //     }
                                                        //     if (globalCache && await globalCache!.getItem(`${userInformation["custom:userId"]}-profilePictureURI`) !== null) {
                                                        //         const message = 'old profile picture is cached, needs cleaning up';
                                                        //         console.log(message);
                                                        //         await logEvent(message, LoggingLevel.Info, userIsAuthenticated);
                                                        //
                                                        //         await globalCache!.removeItem(`${userInformation["custom:userId"]}-profilePictureURI`);
                                                        //         await globalCache!.setItem(`${userInformation["custom:userId"]}-profilePictureURI`, "");
                                                        //     } else {
                                                        //         const message = 'profile picture is not cached';
                                                        //         console.log(message);
                                                        //         await logEvent(message, LoggingLevel.Info, userIsAuthenticated);
                                                        //
                                                        //         globalCache && globalCache!.setItem(`${userInformation["custom:userId"]}-profilePictureURI`, "");
                                                        //     }
                                                        //     setIsReady(true);
                                                        //
                                                        //     /**
                                                        //      * if we got to this point, then all checks passed, everything worked as expected, so we can just redirect the
                                                        //      * already logged-in user to the App Drawer.
                                                        //      */
                                                        //     navigation.navigate("AppDrawer", {});
                                                        //     break;
                                                        default:
                                                            break;
                                                    }
                                                    // increase the step number
                                                    if (stepNumber < 7 && checksPassed) {
                                                        /**
                                                         * since we are skipping the card linking step, for step number 5
                                                         * - in case the military status was VERIFIED, skip the documentation step
                                                         * AND go straight to the Dashboard
                                                         *
                                                         * since we are skipping the card linking step, for step number 6
                                                         * - we know that the military status is PENDING, so just go straight to the
                                                         * Dashboard
                                                         *
                                                         */
                                                        if ((stepNumber === 5 && militaryStatus === MilitaryVerificationStatusType.Verified) ||
                                                            (stepNumber === 6 && militaryStatus === MilitaryVerificationStatusType.Pending)) {
                                                            let newStepValue = stepNumber + 1;
                                                            setStepNumber(newStepValue);

                                                            setIsReady(false);
                                                            /**
                                                             * If everything was successful, then:
                                                             *
                                                             * - we just cache the list of:
                                                             *      - Fidelis partners for initial load (for 1 week only)
                                                             *      - the list of premier click-only online offers
                                                             *      - the list of click-only online offers (first page only) for initial load (for 1 week only)
                                                             *      - the list of premier online offers
                                                             *      - the list of online offers (first page only) for initial load (for 1 week only)
                                                             *      - the list of offers near user's home address (first page only) for initial load (for 1 week only)
                                                             *      - the list of categorized online offers
                                                             * - we just cache an empty profile photo for the user for initial load
                                                             */
                                                            if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-fidelisPartners`) !== null) {
                                                                const message = 'old Fidelis Partners are cached, needs cleaning up';
                                                                console.log(message);
                                                                await logEvent(message, LoggingLevel.Info, userIsAuthenticated);
                                                                await marketplaceCache!.removeItem(`${userInformation["custom:userId"]}-fidelisPartners`);
                                                                await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-fidelisPartners`, await retrieveFidelisPartnerList());
                                                            } else {
                                                                const message = 'Fidelis Partners are not cached';
                                                                console.log(message);
                                                                await logEvent(message, LoggingLevel.Info, userIsAuthenticated);
                                                                marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-fidelisPartners`, await retrieveFidelisPartnerList());
                                                            }
                                                            if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-onlineOffers`) !== null) {
                                                                const message = 'online offers are cached, needs cleaning up';
                                                                console.log(message);
                                                                await logEvent(message, LoggingLevel.Info, userIsAuthenticated);
                                                                await marketplaceCache!.removeItem(`${userInformation["custom:userId"]}-onlineOffers`);

                                                                // retrieve the premier online, and regular online offers
                                                                const onlineOffers = await retrieveOnlineOffersList(
                                                                    numberOfOnlineFailedCalls, setNumberOfOnlineFailedCalls,
                                                                    numberOfOnlineOffers, setNumberOfOnlineOffers);
                                                                const premierOnlineOffers = await retrievePremierOnlineOffersList(numberOfOnlineFailedCalls, setNumberOfOnlineFailedCalls);

                                                                // update the number of available total online offers
                                                                setNumberOfOnlineOffers(oldNumberOfOnlineOffers => {
                                                                    return oldNumberOfOnlineOffers + premierOnlineOffers.length
                                                                });

                                                                await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineOffers`,
                                                                    [...premierOnlineOffers, ...onlineOffers]);
                                                            } else {
                                                                const message = 'online offers are not cached';
                                                                console.log(message);
                                                                await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                                                                // retrieve the premier online, and regular online offers
                                                                const onlineOffers = await retrieveOnlineOffersList(
                                                                    numberOfOnlineFailedCalls, setNumberOfOnlineFailedCalls,
                                                                    numberOfOnlineOffers, setNumberOfOnlineOffers);
                                                                const premierOnlineOffers = await retrievePremierOnlineOffersList(numberOfOnlineFailedCalls, setNumberOfOnlineFailedCalls);

                                                                // update the number of available total online offers
                                                                setNumberOfOnlineOffers(oldNumberOfOnlineOffers => {
                                                                    return oldNumberOfOnlineOffers + premierOnlineOffers.length
                                                                });

                                                                marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-onlineOffers`,
                                                                    [...premierOnlineOffers, ...onlineOffers]);
                                                            }
                                                            if (marketplaceCache && await marketplaceCache!.getItem(`${userInformation["custom:userId"]}-clickOnlyOnlineOffers`) !== null) {
                                                                const message = 'click-only online offers are cached, needs cleaning up';
                                                                console.log(message);
                                                                await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                                                                await marketplaceCache!.removeItem(`${userInformation["custom:userId"]}-clickOnlyOnlineOffers`);

                                                                // retrieve the premier click-only online, and regular click-only online offers
                                                                const clickOnlyOnlineOffers = await retrieveClickOnlyOnlineOffersList(
                                                                    numberOfClickOnlyOnlineFailedCalls, setNumberOfClickOnlyOnlineFailedCalls,
                                                                    numberOfClickOnlyOnlineOffers, setNumberOfClickOnlyOnlineOffers)
                                                                const premierClickOnlyOnlineOffers = await retrievePremierClickOnlyOnlineOffersList(numberOfClickOnlyOnlineFailedCalls, setNumberOfClickOnlyOnlineFailedCalls);

                                                                // update the number of available total online offers
                                                                setNumberOfClickOnlyOnlineOffers(oldNumberOfClickOnlyOnlineOffers => {
                                                                    return oldNumberOfClickOnlyOnlineOffers + premierClickOnlyOnlineOffers.length
                                                                });

                                                                await marketplaceCache!.setItem(`${userInformation["custom:userId"]}-clickOnlyOnlineOffers`,
                                                                    [...premierClickOnlyOnlineOffers, ...clickOnlyOnlineOffers]);
                                                            } else {
                                                                const message = 'online click-only offers are not cached';
                                                                console.log(message);
                                                                await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                                                                // retrieve the premier click-only online, and regular click-only online offers
                                                                const clickOnlyOnlineOffers = await retrieveClickOnlyOnlineOffersList(
                                                                    numberOfClickOnlyOnlineFailedCalls, setNumberOfClickOnlyOnlineFailedCalls,
                                                                    numberOfClickOnlyOnlineOffers, setNumberOfClickOnlyOnlineOffers);
                                                                const premierClickOnlyOnlineOffers = await retrievePremierClickOnlyOnlineOffersList(numberOfClickOnlyOnlineFailedCalls, setNumberOfClickOnlyOnlineFailedCalls);

                                                                // update the number of available total online offers
                                                                setNumberOfClickOnlyOnlineOffers(oldNumberOfClickOnlyOnlineOffers => {
                                                                    return oldNumberOfClickOnlyOnlineOffers + premierClickOnlyOnlineOffers.length
                                                                });

                                                                marketplaceCache && marketplaceCache!.setItem(`${userInformation["custom:userId"]}-clickOnlyOnlineOffers`,
                                                                    [...premierClickOnlyOnlineOffers, ...clickOnlyOnlineOffers]);
                                                            }
                                                            if (globalCache && await globalCache!.getItem(`${userInformation["custom:userId"]}-profilePictureURI`) !== null) {
                                                                const message = 'old profile picture is cached, needs cleaning up';
                                                                console.log(message);
                                                                await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                                                                await globalCache!.removeItem(`${userInformation["custom:userId"]}-profilePictureURI`);
                                                                await globalCache!.setItem(`${userInformation["custom:userId"]}-profilePictureURI`, "");
                                                            } else {
                                                                const message = 'profile picture is not cached';
                                                                console.log(message);
                                                                await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                                                                globalCache && globalCache!.setItem(`${userInformation["custom:userId"]}-profilePictureURI`, "");
                                                            }
                                                            setIsReady(true);

                                                            /**
                                                             * if we got to this point, then all checks passed, everything worked as expected, so we can just redirect the
                                                             * already logged-in user to the App Drawer.
                                                             */
                                                            navigation.navigate("AppDrawer", {});
                                                        } else {
                                                            let newStepValue = stepNumber + 1;
                                                            setStepNumber(newStepValue);
                                                        }
                                                        // in case the military status was verified, skip the documentation step
                                                        // if (stepNumber === 5 && militaryStatus === MilitaryVerificationStatusType.Verified) {
                                                        //     let newStepValue = stepNumber + 2;
                                                        //     setStepNumber(newStepValue);
                                                        // } else {
                                                        //     let newStepValue = stepNumber + 1;
                                                        //     setStepNumber(newStepValue);
                                                        // }
                                                    }
                                                }
                                            }
                                        >
                                            <Text
                                                style={styles.buttonText}>{
                                                stepNumber === 4
                                                    ? `Enable`
                                                    : (militaryStatus === MilitaryVerificationStatusType.Rejected && stepNumber === 5)
                                                        ? `Verify`
                                                        : stepNumber === 5 && MilitaryVerificationStatusType.Verified
                                                            ? `Finish`
                                                            : stepNumber === 8
                                                                ? splashState.splashButtonText
                                                                : `Next`}</Text>
                                        </TouchableOpacity>}
                                    </View>
                                </View>
                            </KeyboardAwareScrollView>
                        </ImageBackground>
                    </>
            }
        </>
    );
};

