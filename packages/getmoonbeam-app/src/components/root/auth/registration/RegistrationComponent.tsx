import React, {useEffect, useState} from "react";
import 'react-native-get-random-values';
import {Dimensions, ImageBackground, Platform, TouchableOpacity, View} from "react-native";
import {commonStyles} from '../../../../styles/common.module';
import {styles} from '../../../../styles/registration.module';
import {RegistrationProps} from "../../../../models/props/AuthenticationProps";
import {IconButton, Text} from "react-native-paper";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useRecoilState} from "recoil";
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
    birthdayErrorState,
    birthdayState,
    cardLinkingRegistrationStatusState,
    currentUserInformation,
    dutyStatusErrorsState,
    dutyStatusValueState,
    emailErrorsState,
    emailState,
    enlistingYearErrorsState,
    enlistingYearState,
    firstNameErrorsState,
    firstNameState,
    lastNameErrorsState,
    lastNameState,
    militaryBranchErrorsState,
    militaryBranchValueState,
    militaryRegistrationDisclaimerCheckState,
    militaryVerificationStatus,
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
    verificationCodeErrorsState
} from '../../../../recoil/AuthAtom';
import {registrationSteps} from "../../../../models/Constants";
import {ProfileRegistrationStep} from "./ProfileRegistrationStep";
import {CodeVerificationStep} from "./CodeVerificationStep";
import {DocumentCaptureStep} from "./DocumentCaptureStep";
import {SecurityStep} from "./SecurityStep";
import {AdditionalRegistrationStep} from "./AdditionalRegistrationStep";
import {API, Auth, graphqlOperation} from "aws-amplify";
import {
    createMilitaryVerification,
    MilitaryAffiliation,
    MilitaryVerificationStatusType
} from "@moonbeam/moonbeam-models";
import {v4 as uuidv4} from 'uuid';
import {MilitaryStatusSplashStep} from "./MilitaryStatusSplashStep";
import {CardLinkingStatusSplashStep} from "./CardLinkingStatusSplash";
import {UserPermissionsStep} from "./UserPermissionsStep";
import * as Contacts from "expo-contacts";
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import {fetchFile} from "../../../../utils/File";
import {Spinner} from "../../../common/Spinner";
import {splashStatusState} from "../../../../recoil/SplashAtom";
import {CardLinkingStep} from "./CardLinkingStep";
// @ts-ignore
import CardLinkedSuccessImage from '../../../../../assets/art/card-linked-success.png';
// @ts-ignore
import RegistrationBackgroundImage from '../../../../../assets/backgrounds/registration-background.png';

/**
 * RegistrationComponent component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const RegistrationComponent = ({navigation}: RegistrationProps) => {
    // constants used to keep track of local component state
    const [isReady, setIsReady] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    // constants used to keep track of shared states
    const [, setAmplifySignUpErrors] = useRecoilState(amplifySignUpProcessErrorsState);
    const [, setRegistrationMainError] = useRecoilState(registrationMainErrorState);
    const [, setIsBackButtonShown] = useRecoilState(registrationBackButtonShown);
    const [stepNumber, setStepNumber] = useRecoilState(registrationStepNumber);
    const [userInformation, setUserInformation] = useRecoilState(currentUserInformation);
    // step 1
    const [firstName,] = useRecoilState(firstNameState);
    const [firstNameErrors,] = useRecoilState(firstNameErrorsState);
    const [lastName,] = useRecoilState(lastNameState);
    const [lastNameErrors,] = useRecoilState(lastNameErrorsState);
    const [birthday,] = useRecoilState(birthdayState);
    const [birthdayErrors,] = useRecoilState(birthdayErrorState);
    const [phoneNumber,] = useRecoilState(phoneNumberState);
    const [phoneNumberErrors,] = useRecoilState(phoneNumberErrorsState);
    const [email,] = useRecoilState(emailState);
    const [emailErrors,] = useRecoilState(emailErrorsState);
    const [dutyStatus,] = useRecoilState(dutyStatusValueState);
    const [dutyStatusErrors,] = useRecoilState(dutyStatusErrorsState);
    const [enlistingYear,] = useRecoilState(enlistingYearState);
    const [enlistingYearErrors,] = useRecoilState(enlistingYearErrorsState);
    // step 2
    const [addressLine,] = useRecoilState(addressLineState);
    const [addressLineErrors,] = useRecoilState(addressLineErrorsState);
    const [addressCity,] = useRecoilState(addressCityState);
    const [addressCityErrors,] = useRecoilState(addressCityErrorsState);
    const [addressState,] = useRecoilState(addressStateState);
    const [addressStateErrors,] = useRecoilState(addressStateErrorsState);
    const [addressZip,] = useRecoilState(addressZipState);
    const [addressZipErrors,] = useRecoilState(addressZipErrorsState);
    const [militaryBranch,] = useRecoilState(militaryBranchValueState);
    const [militaryBranchErrors,] = useRecoilState(militaryBranchErrorsState);
    // step 3
    const [password, setPassword] = useRecoilState(registrationPasswordState);
    const [confirmPassword, setConfirmPassword] = useRecoilState(registrationConfirmationPasswordState);
    const [passwordErrors,] = useRecoilState(registrationPasswordErrorsState);
    const [confirmPasswordErrors,] = useRecoilState(registrationConfirmationPasswordErrorsState);
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
    const [splashState, setSplashState] = useRecoilState(splashStatusState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // start the countdown if the value is 10
        if (countdownValue == 10) {
            startCountdown(10);
        }
        /**
         * since for step number 7, the driving action is performed by the linking button in Olive's iFrame,
         * we want to ensure that once the linking was done successfully there, then before we proceed to the next step,
         * we set the state for the next one accordingly.
         */
        if (stepNumber === 7 && cardLinkingStatus) {
            // setting the splash state for the next step
            setSplashState({
                splashTitle: 'Congrats!',
                splashDescription: 'Your card was successfully linked.',
                splashButtonText: 'Finish',
                splashArtSource: CardLinkedSuccessImage
            });

            // increase the step number
            let newStepValue = stepNumber + 1;
            setStepNumber(newStepValue);
        }
    }, [countdownValue, stepNumber, cardLinkingStatus]);

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
     * @params userId generated through previous steps during the sign-up process
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
                    firstName: firstName,
                    lastName: lastName,
                    dateOfBirth: birthday,
                    enlistmentYear: enlistingYear,
                    addressLine: addressLine,
                    city: addressCity,
                    state: addressState,
                    zipCode: addressZip,
                    militaryAffiliation: MilitaryAffiliation.ServiceMember, // ToDo: in the future when we add family members, we need a mechanism for that
                    militaryBranch: militaryBranch,
                    militaryDutyStatus: dutyStatus
                }
            }));

            // retrieve the data block from the response
            // @ts-ignore
            const responseData = eligibilityResult ? eligibilityResult.data : null;

            // check if there are any errors in the returned response
            if (responseData && responseData.createMilitaryVerification.errorMessage === null) {
                // release the loader on button press
                setIsReady(true);

                return [true, responseData.createMilitaryVerification.data.militaryVerificationStatus];
            } else {
                // release the loader on button press
                setIsReady(true);

                console.log(`Unexpected error while retrieving the eligibility status ${JSON.stringify(eligibilityResult)}`);
                return [false, MilitaryVerificationStatusType.Pending];
            }
        } catch (error) {
            // release the loader on button press
            setIsReady(true);

            console.log(`Unexpected error while retrieving the eligibility status ${JSON.stringify(error)} ${error}`);
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
                username: email,
                password: password,
                attributes: {
                    email: email,
                    phone_number: `${phoneNumber.replaceAll('(', '')
                        .replaceAll(')', '')
                        .replaceAll('-', '')
                        .replaceAll(' ', '')}`,
                    given_name: firstName,
                    family_name: lastName,
                    birthdate: dob,
                    address: `${addressLine}, ${addressCity}, ${addressState}, ${addressZip}`,
                    updated_at: Date.now().toString(),
                    'custom:branch': militaryBranch,
                    'custom:duty_status': dutyStatus,
                    'custom:userId': userId,
                    'custom:enlistmentYear': enlistingYear
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
            } else {
                // set Amplify errors accordingly
                // @ts-ignore
                setAmplifySignUpErrors(["Unexpected error while Signing Up. Try again!"]);
            }
            console.log(errorMessage
                ? `Unexpected error while Signing Up: ${JSON.stringify(errorMessage)}`
                : `Unexpected error while Signing Up: ${JSON.stringify(error)} ${error}`);

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
                    // remove the password and confirm password fields, since we won't need them beyond this point, and we don't store passwords anyway.
                    setPassword("");
                    setConfirmPassword("");

                    // retrieve the user information payload from the authenticated session.
                    const userInfo = user.signInUserSession.idToken.payload;

                    // set the current user information accordingly
                    setUserInformation({
                        ...userInformation,
                        ...userInfo
                    });

                    // release the loader on button press
                    setIsReady(true);

                    return true;
                } else {
                    console.log(`Unexpected error while signing in upon verifying account: ${JSON.stringify(user)}`);
                    // @ts-ignore
                    setVerificationCodeErrors(["Unexpected error while confirming sign up code. Try again!"]);

                    // release the loader on button press
                    setIsReady(true);

                    return false;
                }
            } else {
                console.log(`Unexpected error while confirming sign up code: ${JSON.stringify(signUp)}`);
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
            console.log(errorMessage
                ? `Unexpected error while confirming sign up code: ${JSON.stringify(errorMessage)}`
                : `Unexpected error while confirming sign up code: ${JSON.stringify(error)} ${error}`);

            // release the loader on button press
            setIsReady(true);

            return false;
        }
    };

    /**
     * Function used to add the necessary location foreground permissions, needed for the application
     * to access a user's geolocation.
     */
    const requestForegroundLocationPermission = async () => {
        const {status} = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location in foreground not granted!');
        }
    }

    /**
     * Function used to add the necessary location background permissions, needed for the application
     * to access a user's geolocation.
     */
    const requestBackgroundLocationPermission = async () => {
        const {status} = await Location.requestBackgroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location in background not granted!');
        }
    }

    /**
     * Function used to add the necessary notification permissions, needed for the application
     * to send push, as well as other types of notifications.
     */
    const requestNotificationsPermission = async () => {
        const {status} = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission for notifications not granted!');
        }
    }

    /**
     * Function used to add the support number to the user's contacts,
     * in order to ensure a better experience when they message support.
     *
     * Note: Right now, this does not check for duplicate contacts. We
     * can do that later.
     */
    const addSupportToContacts = async () => {
        const {status} = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
            // fetch the URI for the image to be retrieved from CloudFront
            // retrieving the document link from either local cache, or from storage
            const [returnFlag, shareURI] = await fetchFile('contact-icon.png', false);
            if (!returnFlag || shareURI === null) {
                console.log(`Unable to download contact icon file!`);
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
            console.log('Contacts permissions not granted!');
        }
    }

    // return the component for the Registration page
    return (
        <>
            {
                !isReady ?
                    <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                    : <ImageBackground
                        style={[commonStyles.image]}
                        imageStyle={{
                            resizeMode: 'stretch'
                        }}
                        source={RegistrationBackgroundImage}>
                        <KeyboardAwareScrollView
                            scrollEnabled={stepNumber == 0 || stepNumber === 1 || stepNumber === 2 || stepNumber === 3}
                            enableOnAndroid={true}
                            enableAutomaticScroll={(Platform.OS === 'ios')}
                            contentContainerStyle={[commonStyles.rowContainer]}
                            keyboardShouldPersistTaps={'handled'}
                        >
                            {stepNumber !== 8 && stepNumber !== 7 &&
                                <View
                                    style={[styles.titleView, {marginTop: Dimensions.get('window').height / 6},
                                        (stepNumber === 4 || (stepNumber === 5 && militaryStatus !== MilitaryVerificationStatusType.Rejected)) && {marginTop: Dimensions.get('window').height / 4.5}]}>
                                    {stepNumber === 4 &&
                                        <TouchableOpacity
                                            style={styles.buttonSkip}
                                            onPress={() => {
                                                // skip the current step
                                                setStepNumber(stepNumber + 1);

                                                // clear the registration error
                                                setRegistrationMainError(false);
                                            }}
                                        >
                                            <Text style={styles.buttonSkipText}>Skip</Text>
                                        </TouchableOpacity>
                                    }
                                    <View style={[styles.titleViewDescription]}>
                                        <Text style={styles.stepTitle}>
                                            {registrationSteps[stepNumber].stepTitle}
                                        </Text>
                                        <IconButton
                                            icon={"triangle"}
                                            iconColor={"#F2FF5D"}
                                            size={Dimensions.get('window').width / 20}
                                            style={styles.triangleIcon}
                                        />
                                    </View>
                                </View>}
                            {(militaryStatus === MilitaryVerificationStatusType.Verified && stepNumber === 5) || stepNumber === 7 ? <></> :
                                <Text style={styles.stepDescription}>{registrationSteps[stepNumber].stepDescription}</Text>}
                            {/*switch views based on the step number*/}
                            {
                                stepNumber === 0
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
                                                            : stepNumber === 7
                                                                ? <CardLinkingStep/>
                                                                : stepNumber === 8
                                                                    ? <CardLinkingStatusSplashStep/>
                                                                    : <></>
                            }
                            <View style={[styles.bottomContainerButtons]}>
                                {(stepNumber === 1 || stepNumber === 2) &&
                                    <TouchableOpacity
                                        style={styles.buttonLeft}
                                        onPress={
                                            () => {
                                                // show back button on previous step
                                                setIsBackButtonShown(true);

                                                // clean the registration error on previous step
                                                setRegistrationMainError(false);

                                                // clean any Amplify Sign Up errors
                                                if (stepNumber === 2) {
                                                    setAmplifySignUpErrors([]);
                                                }

                                                // decrease the step number
                                                if (stepNumber > 0) {
                                                    let newStepValue = stepNumber - 1;
                                                    setStepNumber(newStepValue);
                                                }
                                            }
                                        }
                                    >
                                        <Text style={styles.buttonText}>Previous</Text>
                                    </TouchableOpacity>}
                                {stepNumber !== 7 && <TouchableOpacity
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
                                        (stepNumber === 1 || stepNumber === 2) && {marginLeft: Dimensions.get('window').width / 5},
                                        (stepNumber === 4)
                                        && {
                                            marginBottom: Dimensions.get('window').height / 15,
                                            marginLeft: Dimensions.get('window').width / 25
                                        },
                                        (stepNumber === 5)
                                        && {
                                            marginBottom: Dimensions.get('window').height / 15,
                                            marginLeft: Dimensions.get('window').width / 25
                                        },
                                        stepNumber === 6
                                        && {
                                            marginLeft: Dimensions.get('window').width / 25
                                        },
                                        stepNumber === 8
                                        && {
                                            marginBottom: Dimensions.get('window').height / 10,
                                            marginLeft: Dimensions.get('window').width / 6
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
                                                    break;
                                                case 1:
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

                                                        await addSupportToContacts();
                                                        // ToDo: in the future fix these to allow for location tracking
                                                        // await requestForegroundLocationPermission();
                                                        // await requestBackgroundLocationPermission();
                                                        await requestNotificationsPermission();

                                                        // release the loader
                                                        setIsReady(true);
                                                    } catch (err) {
                                                        console.log(`Unexpected error while adding permissions: ${err}`);
                                                        console.log(`Unexpected error while adding permissions: ${JSON.stringify(err)}`);

                                                        setRegistrationMainError(true);
                                                        checksPassed = false;
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
                                                            /**
                                                             * even if this was successful, at first pass do not allow going to the next step if it is VERIFIED
                                                             * since we want to display the successful status screen
                                                             */
                                                            checksPassed = verificationStatus === MilitaryVerificationStatusType.Pending;

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
                                                case 6:
                                                    // for the 7th step, the driver of the step is the additional documentation needed flag in the Documentation component
                                                    break;
                                                case 7:
                                                    /**
                                                     * for the 8th step, we need to handle that retroactively in the useEffect(), since we don't have control over the button press,
                                                     * given that it's coming from Olive's iFrame.
                                                     */
                                                    break;
                                                case 8:
                                                    /**
                                                     * if we got to this point, then all checks passed, everything worked as expected, so we can just redirect the
                                                     * already logged-in user to the App Drawer.
                                                     */
                                                    navigation.navigate("AppDrawer", {});
                                                    break;
                                                default:
                                                    break;
                                            }
                                            // increase the step number
                                            if (stepNumber < 8 && checksPassed) {
                                                // in case the military status was verified, skip the documentation step
                                                if (stepNumber === 5 && militaryStatus === MilitaryVerificationStatusType.Verified) {
                                                    let newStepValue = stepNumber + 2;
                                                    setStepNumber(newStepValue);
                                                } else {
                                                    let newStepValue = stepNumber + 1;
                                                    setStepNumber(newStepValue);
                                                }
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
                                                : stepNumber === 8
                                                    ? splashState.splashButtonText
                                                    : `Next`}</Text>
                                </TouchableOpacity>}
                            </View>
                        </KeyboardAwareScrollView>
                    </ImageBackground>
            }
        </>
    );
};

