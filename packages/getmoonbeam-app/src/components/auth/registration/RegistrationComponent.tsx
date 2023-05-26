import React, {useEffect} from "react";
import 'react-native-get-random-values';
import {Dimensions, ImageBackground, Platform, TouchableOpacity, View} from "react-native";
import {commonStyles} from '../../../styles/common.module';
import {styles} from '../../../styles/registration.module';
import {RegistrationProps} from "../../../models/AuthenticationProps";
import {IconButton, Text} from "react-native-paper";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useRecoilState} from "recoil";
import {
    accountCreationDisclaimerCheckState,
    addressCityErrorsState,
    addressCityState,
    addressLineErrorsState,
    addressLineState,
    addressStateErrorsState,
    addressStateState,
    addressZipErrorsState,
    addressZipState, amplifySignUpProcessErrorsState,
    birthdayErrorState,
    birthdayState, codeConfirmationInterval,
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
    registrationVerificationDigit6, resetCodeConfirmationTimer, verificationCodeErrorsState
} from '../../../recoil/AuthAtom';
import {registrationStepDescription, registrationStepTitles} from "../../../models/Content";
import {ProfileRegistrationStep} from "./ProfileRegistrationStep";
import {CodeVerificationStep} from "./CodeVerificationStep";
import {DocumentCaptureStep} from "./DocumentCaptureStep";
import {CardLinkingStep} from "./CardLinkingStep";
import {SecurityStep} from "./SecurityStep";
import {AdditionalRegistrationStep} from "./AdditionalRegistrationStep";
import {API, Auth, graphqlOperation} from "aws-amplify";
import {createMilitaryVerification, MilitaryAffiliation} from "@moonbeam/moonbeam-models";
import {v4 as uuidv4} from 'uuid';
import {MilitaryStatusSplashStep} from "./MilitaryStatusSplashStep";
import {CardLinkingStatusSplashStep} from "./CardLinkingStatusSplash";

/**
 * RegistrationComponent component.
 */
export const RegistrationComponent = ({}: RegistrationProps) => {
    // constants used to keep track of local component state

    // constants used to keep track of shared states
    const [, setAmplifySignUpErrors] = useRecoilState(amplifySignUpProcessErrorsState);
    const [, setRegistrationMainError] = useRecoilState(registrationMainErrorState);
    const [, setIsBackButtonShown] = useRecoilState(registrationBackButtonShown);
    const [stepNumber, setStepNumber] = useRecoilState(registrationStepNumber);
    const [, setUserInformation] = useRecoilState(currentUserInformation);
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
    const [password,] = useRecoilState(registrationPasswordState);
    const [confirmPassword,] = useRecoilState(registrationConfirmationPasswordState);
    const [passwordErrors,] = useRecoilState(registrationPasswordErrorsState);
    const [confirmPasswordErrors,] = useRecoilState(registrationConfirmationPasswordErrorsState);
    const [accountRegistrationDisclaimer,] = useRecoilState(accountCreationDisclaimerCheckState);
    // step 4
    const [codeVerificationInterval, setCodeVerificationInterval] = useRecoilState(codeConfirmationInterval);
    const [codeConfirmationReset, setCodeConfirmationReset] = useRecoilState(resetCodeConfirmationTimer);
    const [countdownValue, setCountDownValue] = useRecoilState(registrationCodeTimerValue);
    const [verificationCodeDigit1,] = useRecoilState(registrationVerificationDigit1);
    const [verificationCodeDigit2,] = useRecoilState(registrationVerificationDigit2);
    const [verificationCodeDigit3,] = useRecoilState(registrationVerificationDigit3);
    const [verificationCodeDigit4,] = useRecoilState(registrationVerificationDigit4);
    const [verificationCodeDigit5,] = useRecoilState(registrationVerificationDigit5);
    const [verificationCodeDigit6,] = useRecoilState(registrationVerificationDigit6);
    const [, setVerificationCodeErrors] = useRecoilState(verificationCodeErrorsState);

    const [militaryVerificationDisclaimer,] = useRecoilState(militaryRegistrationDisclaimerCheckState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        if ((codeConfirmationReset && codeVerificationInterval) || countdownValue < 0) {
            setCodeVerificationInterval(setInterval(() => {
                clearInterval(codeVerificationInterval)
            }, 0));
        }
        if (countdownValue === 30) {
            startCountdown(30);
        }
        // for steps 3,4,5 and 6 do not show the back button
        if (stepNumber === 3 || stepNumber === 4 || stepNumber === 5 || stepNumber === 6) {
            setIsBackButtonShown(false);
        }
    }, [codeConfirmationReset, countdownValue, stepNumber]);

    /**
     * Callback function used to decrease the value of the countdown by 1,
     * given a number of seconds passed in.
     *
     * @param seconds number of seconds passed in
     */
    const startCountdown = (seconds): void => {
        let counter = seconds;

        setCodeVerificationInterval(setInterval(() => {
            setCountDownValue(counter.toString().length !== 2 ? `0${counter}` : counter);
            counter--;

            // if the number of seconds goes below 0, or if the counter has been reset by a back/previous button action
            if (counter < 0 || codeConfirmationReset) {
                clearInterval(codeVerificationInterval);
                setCodeConfirmationReset(false);
            }
        }, 1000));
    }

    /**
     * Function used to verify an individual's eligibility by checking their
     * military verification status.
     *
     * @params userId set the uuid to identify the user throughout the sign-up process
     */
    const verifyEligibility = async (userId: string): Promise<void> => {
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
            console.log(JSON.stringify(eligibilityResult));
        } else {
            console.log(`Unexpected error while retrieving the eligibility status ${JSON.stringify(eligibilityResult)}`);
            // ToDo: need to create a modal with errors
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
            // convert the date of birth into the appropriate format (YYYY-MM-DD), accepted by AWS Amplify
            let dob = birthday;
            dob = `${dob.split('/')[2]}-${dob.split('/')[0]}-${dob.split('/')[1]}`;

            // sign up the user
            await Auth.signUp({
                // enables auto sign in after user is confirmed
                autoSignIn: {
                    enabled: true
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
                    'custom:userId': uuidv4()
                }
            });

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
                : `Unexpected error while Signing Up: ${JSON.stringify(error)}`);
            return false;
        }
    }

    /**
     * Function used to capture the confirmation of the verification code
     *
     * @returns a {@link Promise} containing a {@link boolean} flag, representing
     * whether the sign-up code was successfully confirmed or not
     */
    const confirmSignUpCode = async (): Promise<boolean> => {
        try {
            // first confirm the signing up of the user, using the code provided
            const signUp = await Auth.confirmSignUp(
                email,
                `${verificationCodeDigit1}${verificationCodeDigit2}${verificationCodeDigit3}${verificationCodeDigit4}${verificationCodeDigit5}${verificationCodeDigit6}`,
                {forceAliasCreation: false}
            );
            if (signUp) {
                console.log(JSON.stringify(signUp));
                return true;
            } else {
                console.log(`Unexpected error while confirming sign up code: ${JSON.stringify(signUp)}`);

                // @ts-ignore
                setVerificationCodeErrors(["Unexpected error while re-sending verification code. Try again!"]);
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
            } else {
                // set verification code errors accordingly
                // @ts-ignore
                setAmplifySignUpErrors(["Unexpected error while re-sending verification code. Try again!"]);
            }
            console.log(errorMessage
                ? `Unexpected error while confirming sign up code: ${JSON.stringify(errorMessage)}`
                : `Unexpected error while confirming sign up code: ${JSON.stringify(error)}`);
            return false;
        }
    };

    // return the component for the Registration page
    return (
        <>
            <ImageBackground
                style={[commonStyles.image]}
                imageStyle={{
                    resizeMode: 'stretch'
                }}
                source={require('../../../../assets/backgrounds/registration-background.png')}>
                <KeyboardAwareScrollView
                    enableOnAndroid={true}
                    enableAutomaticScroll={(Platform.OS === 'ios')}
                    contentContainerStyle={[commonStyles.rowContainer]}
                    keyboardShouldPersistTaps={'handled'}
                >
                    <View style={[styles.titleView, {marginTop: Dimensions.get('window').height / 6}]}>
                        <Text style={styles.stepTitle}>{registrationStepTitles[stepNumber]}</Text>
                        <IconButton
                            icon={"triangle"}
                            iconColor={"#F2FF5D"}
                            size={Dimensions.get('window').width / 20}
                            style={styles.triangleIcon}
                        />
                    </View>
                    <Text style={styles.stepDescription}>{registrationStepDescription[stepNumber]}</Text>
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
                                            ? <MilitaryStatusSplashStep/>
                                            : stepNumber === 5
                                                ? <DocumentCaptureStep/>
                                                : stepNumber === 6
                                                    ? <CardLinkingStep/>
                                                    : <CardLinkingStatusSplashStep/>
                    }
                    <View style={[styles.bottomContainerButtons]}>
                        {(stepNumber !== 0 && stepNumber !== 3 && stepNumber !== 4 && stepNumber !== 5 && stepNumber !== 6) &&
                            <TouchableOpacity
                                style={styles.buttonLeft}
                                onPress={
                                    () => {
                                        // show back button on previous step
                                        setIsBackButtonShown(true);

                                        // clean the registration error on previous step
                                        setRegistrationMainError(false);

                                        // even though the previous button can't show up on step number 3, this is used as a precaution
                                        if (stepNumber === 3) {
                                            // reset the code interval/timer
                                            setCodeConfirmationReset(true);
                                        }

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
                        <TouchableOpacity
                            disabled={!militaryVerificationDisclaimer && stepNumber === 4 || !accountRegistrationDisclaimer && stepNumber === 2}
                            style={[(!militaryVerificationDisclaimer && stepNumber === 4 || !accountRegistrationDisclaimer && stepNumber === 2)
                                ? styles.buttonRightDisabled
                                : styles.buttonRight,
                                (stepNumber !== 0 && stepNumber !== 3 && stepNumber !== 4 && stepNumber !== 5 && stepNumber !== 6) && {marginLeft: Dimensions.get('window').width / 5}]}
                            onPress={
                                async () => {
                                    // show back button on next step if the step is not 3,4,5 or 6
                                    (stepNumber !== 3 && stepNumber !== 4 && stepNumber !== 5 && stepNumber !== 6) && setIsBackButtonShown(true);

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
                                                // set the uuid to identify the user throughout the sign-up process
                                                const userId = uuidv4();

                                                // update the user information state, with the newly created ID
                                                setUserInformation({
                                                    userId: userId
                                                });

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
                                                    setCodeConfirmationReset(false);
                                                    setCountDownValue(30);

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
                                        default:
                                            break;
                                    }
                                    // increase the step number
                                    if (stepNumber < 7 && checksPassed) {
                                        let newStepValue = stepNumber + 1;
                                        setStepNumber(newStepValue);
                                    }
                                }
                            }
                        >
                            <Text
                                style={styles.buttonText}>{stepNumber === 7 ? `Finish` : `Next`}</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAwareScrollView>
            </ImageBackground>
        </>
    );
};

