import React, {useEffect} from "react";
import {Dimensions, ImageBackground, Platform, TouchableOpacity, View} from "react-native";
import {commonStyles} from '../../../styles/common.module';
import {styles} from '../../../styles/registration.module';
import {RegistrationProps} from "../../../models/AuthenticationProps";
import {IconButton, Text} from "react-native-paper";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useRecoilState} from "recoil";
import {
    documentationStepSkip,
    registrationCodeTimerValue,
    registrationVerificationDigit1,
    registrationVerificationDigit2,
    registrationVerificationDigit3,
    registrationVerificationDigit4,
    registrationVerificationDigit5,
    registrationVerificationDigit6,
    registrationStepNumber,
    firstNameState,
    firstNameErrorsState,
    lastNameState,
    lastNameErrorsState,
    birthdayState,
    birthdayErrorState,
    phoneNumberState,
    phoneNumberErrorsState,
    emailState,
    emailErorrsState,
    registrationMainErrorState, registrationBackButtonShown
} from '../../../recoil/AuthAtom';
import {registrationStepDescription, registrationStepTitles} from "../../../models/Content";
import {ProfileRegistrationStep} from "./ProfileRegistrationStep";
import {CodeVerificationStep} from "./CodeVerificationStep";
import {DocumentCaptureStep} from "./DocumentCaptureStep";
import {IdentityCaptureStep} from "./IdentityCaptureStep";
import {CardLinkingStep} from "./CardLinkingStep";
import {SecurityStep} from "./SecurityStep";

/**
 * RegistrationComponent component.
 */
export const RegistrationComponent = ({}: RegistrationProps) => {
    // constants used to keep track of local component state

    // constants used to keep track of shared states
    const [skipDocumentationStep, setSkipDocumentationStep] = useRecoilState(documentationStepSkip);
    const [firstName,] = useRecoilState(firstNameState);
    const [firstNameErrors,] = useRecoilState(firstNameErrorsState);
    const [lastName,] = useRecoilState(lastNameState);
    const [lastNameErrors,] = useRecoilState(lastNameErrorsState);
    const [birthday,] = useRecoilState(birthdayState);
    const [birthdayErrors,] = useRecoilState(birthdayErrorState);
    const [phoneNumber,] = useRecoilState(phoneNumberState);
    const [phoneNumberErrors,] = useRecoilState(phoneNumberErrorsState);
    const [email,] = useRecoilState(emailState);
    const [emailErrors,] = useRecoilState(emailErorrsState);
    const [, setRegistrationMainError] = useRecoilState(registrationMainErrorState);
    const [, setIsBackButtonShown] = useRecoilState(registrationBackButtonShown);
    const [stepNumber, setStepNumber] = useRecoilState(registrationStepNumber);
    const [, setCountDownValue] = useRecoilState(registrationCodeTimerValue);
    const [verificationCodeDigit1, setVerificationCodeDigit1] = useRecoilState(registrationVerificationDigit1);
    const [verificationCodeDigit2, setVerificationCodeDigit2] = useRecoilState(registrationVerificationDigit2);
    const [verificationCodeDigit3, setVerificationCodeDigit3] = useRecoilState(registrationVerificationDigit3);
    const [verificationCodeDigit4, setVerificationCodeDigit4] = useRecoilState(registrationVerificationDigit4);
    const [verificationCodeDigit5, setVerificationCodeDigit5] = useRecoilState(registrationVerificationDigit5);
    const [verificationCodeDigit6, setVerificationCodeDigit6] = useRecoilState(registrationVerificationDigit6);

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
    function startCountdown(seconds) {
        let counter = seconds;

        const interval = setInterval(() => {
            setCountDownValue(counter !== 10 ? `0${counter}` : counter);
            counter--;

            if (counter < 0) {
                clearInterval(interval);
            }
        }, 1000);
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
                                ? <DocumentCaptureStep/>
                                : stepNumber === 2
                                    ? <DocumentCaptureStep/>
                                    : stepNumber === 3
                                        ? <DocumentCaptureStep/>
                                        : stepNumber === 4
                                            ? <IdentityCaptureStep/>
                                            : stepNumber === 5
                                                ? <CardLinkingStep/>
                                                : stepNumber === 6
                                                    ? <SecurityStep/>
                                                    : stepNumber === 7
                                                        ? <CodeVerificationStep/>
                                                        : <></>
                    }
                    <View style={[styles.bottomContainerButtons]}>
                        {stepNumber !== 0 && <TouchableOpacity
                            style={[styles.buttonLeft, stepNumber !== 1 && {marginRight: Dimensions.get('window').width/5}]}
                            onPress={
                                () => {
                                    // show back button on previous step
                                    setIsBackButtonShown(true);

                                    // decrease the step number
                                    if (stepNumber > 0) {
                                        // make an exception for the Documentation Steps
                                        if (stepNumber === 3) {
                                            setStepNumber(1);
                                        } else if (stepNumber == 4 && skipDocumentationStep) {
                                            setSkipDocumentationStep(false);
                                            setStepNumber(2);
                                        } else {
                                            let newStepValue = stepNumber - 1;
                                            setStepNumber(newStepValue);
                                        }
                                    }
                                }
                            }
                        >
                            <Text style={styles.buttonText}>Previous</Text>
                        </TouchableOpacity>}
                        { stepNumber !== 1 &&
                            <TouchableOpacity
                                style={styles.buttonRight}
                                onPress={
                                    async () => {
                                        // show back button on next step
                                        setIsBackButtonShown(true);

                                        // verify if we can move to the next stage
                                        let checksPassed = true;
                                        switch (stepNumber) {
                                            case 0:
                                                if (firstName === "" || lastName === "" || email === "" || birthday === "" || phoneNumber === ""
                                                    || firstNameErrors.length !== 0 || lastNameErrors.length !== 0 ||
                                                    emailErrors.length !== 0 || birthdayErrors.length !== 0 || phoneNumberErrors.length !== 0) {
                                                    checksPassed = false;

                                                    // only populate main error if there are no other errors showing
                                                    if (firstNameErrors.length === 0 && lastNameErrors.length === 0 &&
                                                        emailErrors.length === 0 && birthdayErrors.length === 0 && phoneNumberErrors.length === 0) {
                                                        setRegistrationMainError(true);
                                                    }
                                                } else {
                                                    // clear the next step's old values
                                                    setVerificationCodeDigit1("");
                                                    setVerificationCodeDigit2("");
                                                    setVerificationCodeDigit3("");
                                                    setVerificationCodeDigit4("");
                                                    setVerificationCodeDigit5("");
                                                    setVerificationCodeDigit6("");

                                                    checksPassed = true;
                                                }
                                                break;
                                            case 6:
                                                // initiate the countdown
                                                setCountDownValue(10);
                                                startCountdown(10);

                                                break;
                                            case 7:
                                                if (verificationCodeDigit1 === "" || verificationCodeDigit2 === "" || verificationCodeDigit3 === "" ||
                                                    verificationCodeDigit4 === "" || verificationCodeDigit5 === "" || verificationCodeDigit6 === "") {
                                                    checksPassed = false;
                                                    setRegistrationMainError(true);
                                                } else {
                                                    // check on the code validity through Amplify

                                                    // clear the next step's old values

                                                    checksPassed = true;
                                                }
                                                break;
                                            default:
                                                break;
                                        }


                                        // increase the step number
                                        if (stepNumber < 7 && checksPassed) {
                                            // make an exception for the Documentation Steps
                                            if (stepNumber === 2) {
                                                setStepNumber(4);
                                            } else {
                                                let newStepValue = stepNumber + 1;
                                                setStepNumber(newStepValue);
                                            }
                                        }
                                    }
                                }
                            >
                                <Text style={styles.buttonText}>{stepNumber === 7 ? `Finish` : `Next`}</Text>
                            </TouchableOpacity>
                        }
                    </View>
                </KeyboardAwareScrollView>
            </ImageBackground>
        </>
    );
};

