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
    currentUserInformation,
    addressCityErrorsState,
    addressCityState, addressLineErrorsState,
    addressLineState, addressStateErrorsState, addressStateState, addressZipErrorsState, addressZipState,
    birthdayErrorState,
    birthdayState,
    dutyStatusErrorsState,
    dutyStatusValueState,
    emailErrorsState,
    emailState,
    enlistingYearErrorsState,
    enlistingYearState,
    firstNameErrorsState,
    firstNameState,
    lastNameErrorsState,
    lastNameState, militaryBranchErrorsState, militaryBranchValueState,
    militaryRegistrationDisclaimerCheckState,
    phoneNumberErrorsState,
    phoneNumberState,
    registrationBackButtonShown,
    registrationCodeTimerValue,
    registrationMainErrorState,
    registrationStepNumber,
    registrationVerificationDigit1,
    registrationVerificationDigit2,
    registrationVerificationDigit3,
    registrationVerificationDigit4,
    registrationVerificationDigit5,
    registrationVerificationDigit6
} from '../../../recoil/AuthAtom';
import {registrationStepDescription, registrationStepTitles} from "../../../models/Content";
import {ProfileRegistrationStep} from "./ProfileRegistrationStep";
import {CodeVerificationStep} from "./CodeVerificationStep";
import {DocumentCaptureStep} from "./DocumentCaptureStep";
import {CardLinkingStep} from "./CardLinkingStep";
import {SecurityStep} from "./SecurityStep";
import {AdditionalRegistrationStep} from "./AdditionalRegistrationStep";
import {API, graphqlOperation} from "aws-amplify";
import {createMilitaryVerification} from "@moonbeam/moonbeam-models";
import {v4 as uuidv4} from 'uuid';
import {MilitaryAffiliation} from "@moonbeam/moonbeam-models";
import {MilitaryStatusSplashStep} from "./MilitaryStatusSplashStep";
import {CardLinkingStatusSplashStep} from "./CardLinkingStatusSplash";

/**
 * RegistrationComponent component.
 */
export const RegistrationComponent = ({}: RegistrationProps) => {
    // constants used to keep track of local component state

    // constants used to keep track of shared states
    const [userInformation, setUserInformation] = useRecoilState(currentUserInformation);
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
    const [disclaimerChecked,] = useRecoilState(militaryRegistrationDisclaimerCheckState);

    const [, setRegistrationMainError] = useRecoilState(registrationMainErrorState);
    const [, setIsBackButtonShown] = useRecoilState(registrationBackButtonShown);
    const [stepNumber, setStepNumber] = useRecoilState(registrationStepNumber);
    const [, setCountDownValue] = useRecoilState(registrationCodeTimerValue);
    const [verificationCodeDigit1,] = useRecoilState(registrationVerificationDigit1);
    const [verificationCodeDigit2,] = useRecoilState(registrationVerificationDigit2);
    const [verificationCodeDigit3,] = useRecoilState(registrationVerificationDigit3);
    const [verificationCodeDigit4,] = useRecoilState(registrationVerificationDigit4);
    const [verificationCodeDigit5,] = useRecoilState(registrationVerificationDigit5);
    const [verificationCodeDigit6,] = useRecoilState(registrationVerificationDigit6);

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
     * Callback function used to decrease the value of the countdown by 1,
     * given a number of seconds passed in.
     *
     * @param seconds number of seconds passed in
     */
    const startCountdown = (seconds) => {
        let counter = seconds;

        const interval = setInterval(() => {
            setCountDownValue(counter !== 10 ? `0${counter}` : counter);
            counter--;

            if (counter < 0) {
                clearInterval(interval);
            }
        }, 1000);
    }

    /**
     * Function used to verify an individual's eligibility by checking their
     * military verification status.
     *
     * @params userId set the uuid to identify the user throughout the sign-up process
     */
    const verifyEligibility = async (userId: string) => {
        // call the verification API
        const eligibilityResult = await API.graphql(graphqlOperation(createMilitaryVerification, {
            createMilitaryVerificationInput: {
                id: userId,
                firstName: firstName,
                lastName: lastName,
                dateOfBirth: birthday,
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
                        {stepNumber !== 0 && <TouchableOpacity
                            style={styles.buttonLeft}
                            onPress={
                                () => {
                                    // show back button on previous step
                                    setIsBackButtonShown(true);

                                    // clean the registration error on previous step
                                    setRegistrationMainError(false);

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
                            disabled={!disclaimerChecked && stepNumber === 4}
                            style={[!disclaimerChecked && stepNumber === 4 ? styles.buttonRightDisabled : styles.buttonRight,
                                stepNumber !== 0 && {marginLeft: Dimensions.get('window').width / 5}]}
                            onPress={
                                async () => {
                                    // show back button on next step
                                    setIsBackButtonShown(true);

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
                                                if (addressLineErrors.length === 0 || addressCityErrors.length === 0 ||
                                                    addressStateErrors.length === 0 || addressZipErrors.length === 0 || militaryBranchErrors.length === 0) {
                                                    setRegistrationMainError(true);
                                                }
                                            } else {
                                                setRegistrationMainError(false);
                                                checksPassed = true;
                                            }
                                            break;
                                        case 2:
                                            // initiate the countdown
                                            setCountDownValue(10);
                                            startCountdown(10);

                                            break;
                                        case 3:
                                            if (verificationCodeDigit1 === "" || verificationCodeDigit2 === "" || verificationCodeDigit3 === "" ||
                                                verificationCodeDigit4 === "" || verificationCodeDigit5 === "" || verificationCodeDigit6 === "") {
                                                checksPassed = false;
                                                setRegistrationMainError(true);
                                            } else {
                                                // check on the code validity through Amplify sign-in/sign-up

                                                checksPassed = true;
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

