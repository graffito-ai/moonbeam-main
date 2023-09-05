import React, {useEffect, useRef, useState} from "react";
import {Image, Platform, SafeAreaView, TouchableOpacity, View} from "react-native";
import {Dialog, Portal, Text, TextInput} from "react-native-paper";
import {commonStyles} from '../../../../../styles/common.module';
import {styles} from '../../../../../styles/codeVerification.module';
import {Spinner} from "../../../../common/Spinner";
import {CodeVerificationType, emailCodeVerificationSteps} from "../../../../../models/Constants";
// @ts-ignore
import EmailVerificationPicture from "../../../../../../assets/art/moonbeam-email-verification-code.png";
import {FieldValidator} from "../../../../../utils/FieldValidator";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import * as Device from "expo-device";
import {useRecoilState} from "recoil";
import {deviceTypeState} from "../../../../../recoil/RootAtom";
import {codeVerificationSheetShown, codeVerifiedState} from "../../../../../recoil/CodeVerificationAtom";
import {Auth} from "aws-amplify";
import {currentUserInformation} from "../../../../../recoil/AuthAtom";
import {CognitoUser} from "amazon-cognito-identity-js";
import {Button} from "@rneui/base";
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';

/**
 * CodVerificationBottomSheet component.
 *
 * @param props component properties to be passed in.
 * @constructor constructor for the component.
 */
export const CodeVerificationBottomSheet = (props: {
    verificationType: CodeVerificationType,
    email: string,
    phoneNumber: string,
    address: string,
    dutyStatus: string
}) => {
    // constants used to keep track of local component state
    const [isReady, setIsReady] = useState<boolean>(true);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalCustomMessage, setModalCustomMessage] = useState<string>("");
    const [modalButtonMessage, setModalButtonMessage] = useState<string>("");
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [stepNumber, setStepNumber] = useState<number>(0);
    // constants used to keep track of shared states
    const [deviceType, setDeviceType] = useRecoilState(deviceTypeState);
    const [, setShowBottomSheet] = useRecoilState(codeVerificationSheetShown);
    // step 0
    const [userInformation, setUserInformation] = useRecoilState(currentUserInformation);
    // step 1
    const [, setCodeVerified] = useRecoilState(codeVerifiedState);
    const [countdownValue, setCountdownValue] = useState<number>(0);
    const [verificationCodeDigit1, setVerificationCodeDigit1] = useState<string>("");
    const [verificationCodeDigit1Focus, setVerificationCodeDigit1Focus] = useState<boolean>(false);
    const [verificationCodeDigit2, setVerificationCodeDigit2] = useState<string>("");
    const [verificationCodeDigit2Focus, setVerificationCodeDigit2Focus] = useState<boolean>(false);
    const verificationCodeDigit2Ref = useRef(null);
    const [verificationCodeDigit3, setVerificationCodeDigit3] = useState<string>("");
    const [verificationCodeDigit3Focus, setVerificationCodeDigit3Focus] = useState<boolean>(false);
    const verificationCodeDigit3Ref = useRef(null);
    const [verificationCodeDigit4, setVerificationCodeDigit4] = useState<string>("");
    const [verificationCodeDigit4Focus, setVerificationCodeDigit4Focus] = useState<boolean>(false);
    const verificationCodeDigit4Ref = useRef(null);
    const [verificationCodeDigit5, setVerificationCodeDigit5] = useState<string>("");
    const [verificationCodeDigit5Focus, setVerificationCodeDigit5Focus] = useState<boolean>(false);
    const verificationCodeDigit5Ref = useRef(null);
    const [verificationCodeDigit6, setVerificationCodeDigit6] = useState<string>("");
    const [verificationCodeDigit6Focus, setVerificationCodeDigit6Focus] = useState<boolean>(false);
    const verificationCodeDigit6Ref = useRef(null);
    const [verificationCodeErrors, setVerificationCodeErrors] = useState<string[]>([]);
    const [codeVerificationErrors, setCodeVerificationErrors] = useState<boolean>(false);

    // initializing the field validator, to be used for validating form field values
    const fieldValidator = new FieldValidator();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // check and set the type of device, to be used throughout the app
        Device.getDeviceTypeAsync().then(deviceType => {
            setDeviceType(deviceType);
        });

        // start the countdown if the value is 10
        if (countdownValue === 10) {
            startCountdown(10);
        }
    }, [countdownValue, deviceType]);

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
    };

    /**
     * Function used to update a user's profile information. This will also send
     * the user a code to the new email that they provide
     *
     * @return a {@link Promise} containing a {@link Boolean} representing a flag of whether
     * the profile information was successfully updated or not
     */
    const updateProfile = async (): Promise<boolean> => {
        try {
            // set the loader on button press
            setIsReady(false);

            // retrieve the current authenticated user
            const user: CognitoUser = await Auth.currentAuthenticatedUser();

            // if there is no authenticated user, then redirect user to login page
            if (user) {
                // update the user attributes accordingly - this will also trigger a code
                const updateAttributesResult = await Auth.updateUserAttributes(user, {
                    address: props.address,
                    email: props.email,
                    // ToDo: in the future need to have a separate flow for the phone number, as we have one for email
                    phone_number: props.phoneNumber,
                    ['custom:duty_status']: props.dutyStatus
                });

                // check if the update was successful or not
                if (updateAttributesResult && updateAttributesResult.toLowerCase().includes('success')) {
                    // update the userInformation object with the appropriate updated info - besides email since it has not yet been verified
                    setUserInformation({
                        ...userInformation,
                        address: {
                            formatted: props.address
                        },
                        phone_number: props.phoneNumber,
                        ["custom:duty_status"]: props.dutyStatus
                    });

                    // release the loader on button press
                    setIsReady(true);

                    return true;
                } else {
                    const errorMessage = `Error while updating profile information!`;
                    console.log(errorMessage);

                    setModalCustomMessage(errorMessage);
                    setModalButtonMessage('Try Again!');
                    setModalVisible(true);

                    // release the loader on button press
                    setIsReady(true);

                    return false;
                }
            } else {
                // release the loader on button press
                setIsReady(true);

                // ToDO: re-direct to the Login screen and logout
                return false;
            }
        } catch (error) {
            const errorMessage = `Error updating profile information!`;
            console.log(`${errorMessage} - ${error}`);

            setModalCustomMessage(errorMessage);
            setModalButtonMessage('Try Again!');
            setModalVisible(true);

            // release the loader on button press
            setIsReady(true);

            return false;
        }
    }

    /**
     * Function used to verify the incoming verification code.
     *
     * @param code code that was sent, to be verified, as inputted by the user
     * @return a {@link Promise} containing a {@link Boolean} representing a flag of whether
     * the verification code was successfully verified or not
     */
    const verifyCode = async (code: string): Promise<boolean> => {
        try {
            // set the loader on button press
            setIsReady(false);

            // retrieve the current authenticated user
            const user = await Auth.currentAuthenticatedUser();

            // if there is no authenticated user, then redirect user to login page
            if (user) {
                // verify the verification code
                const userCodeVerificationResult = await Auth.verifyUserAttributeSubmit(user, 'email', code);

                // check if the verification was successful or not
                if (userCodeVerificationResult) {
                    // update the userInformation object for the email that was just verified
                    setUserInformation({
                        ...userInformation,
                        email: props.email
                    });

                    // release the loader
                    setIsReady(true);

                    return true;
                } else {
                    // release the loader on button press
                    setIsReady(true);

                    const errorMessage = `Error confirming the verification code!`;
                    console.log(errorMessage);

                    setModalCustomMessage(errorMessage);
                    setModalButtonMessage('Try Again!');
                    setModalVisible(true);

                    return false;
                }
            } else {
                // release the loader on button press
                setIsReady(true);

                // ToDO: re-direct to the Login screen and logout

                return false;
            }
        } catch (error) {
            // release the loader on button press
            setIsReady(true);

            let errorMessage = `Error while confirming the verification code!`;

            // @ts-ignore
            const errorCode = error && error.code ? error.code : null;
            // based on the error code, return the appropriate error to the user
            if (errorCode === 'CodeMismatchException') {
                errorMessage = 'Invalid verification code provided. Try again!';
            }
            if (errorCode === 'AliasExistsException') {
                errorMessage = 'An account with the given email already exists. Try again with a new email!';
            }
            console.log(`${errorMessage} - ${error}`);

            setModalCustomMessage(errorMessage);
            setModalButtonMessage('Try Again!');
            setModalVisible(true);

            return false;
        }
    }

    // return the component for the CodeVerificationBottomSheet, part of the Profile page
    return (
        <>
            {!isReady ?
                <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                :
                <>
                    <Portal>
                        <Dialog style={commonStyles.dialogStyle} visible={modalVisible}
                                onDismiss={() => setModalVisible(false)}>
                            <Dialog.Icon icon="alert" color={"#F2FF5D"}
                                         size={hp(10)}/>
                            <Dialog.Title style={commonStyles.dialogTitle}>{'We hit a snag!'}</Dialog.Title>
                            <Dialog.Content>
                                <Text
                                    style={commonStyles.dialogParagraph}>{modalCustomMessage}</Text>
                            </Dialog.Content>
                            <Dialog.Actions>
                                <Button buttonStyle={commonStyles.dialogButton}
                                        titleStyle={commonStyles.dialogButtonText}
                                        onPress={() => {
                                            // hide the modal
                                            setModalVisible(false);

                                            // depending on whether the modal is an error modal or not, act on the code verification sheet
                                            if (modalButtonMessage === 'Ok') {
                                                // close the code verification sheet
                                                setShowBottomSheet(false);
                                            }
                                        }}>
                                    {modalButtonMessage}
                                </Button>
                            </Dialog.Actions>
                        </Dialog>
                    </Portal>
                    <SafeAreaView style={commonStyles.rowContainer}>
                        <KeyboardAwareScrollView
                            enableOnAndroid={true}
                            showsVerticalScrollIndicator={false}
                            enableAutomaticScroll={(Platform.OS === 'ios')}
                            keyboardShouldPersistTaps={'handled'}
                            style={{width: '100%'}}
                        >
                            <View style={styles.topContainer}>
                                <Text
                                    style={styles.greetingTitle}>{emailCodeVerificationSteps[stepNumber].stepTitle}</Text>
                                <Text
                                    style={styles.gettingSubtitle}>{emailCodeVerificationSteps[stepNumber].stepSubtitle}
                                    <Text
                                        style={styles.gettingSubtitleHighlighted}>{emailCodeVerificationSteps[stepNumber].stepSubtitleHighlighted}. </Text>
                                    {emailCodeVerificationSteps[stepNumber].contentDescription}
                                </Text>
                            </View>
                            {
                                stepNumber === 0 ?
                                    <Image
                                        resizeMethod={"scale"}
                                        style={styles.greetingImage}
                                        resizeMode={'stretch'}
                                        source={EmailVerificationPicture}/>
                                    : stepNumber === 1
                                        ? <>
                                            {codeVerificationErrors
                                                ?
                                                <Text
                                                    style={styles.errorMessage}>Please
                                                    fill out the information
                                                    below!</Text>
                                                : (verificationCodeErrors.length !== 0 && !codeVerificationErrors)
                                                    ? <Text
                                                        style={styles.errorMessage}>{verificationCodeErrors[0]}</Text>
                                                    : <></>
                                            }
                                            <View style={styles.codeInputColumnView}>
                                                <TextInput
                                                    autoCorrect={false}
                                                    autoComplete={"off"}
                                                    keyboardType={"number-pad"}
                                                    placeholderTextColor={'#D9D9D9'}
                                                    activeUnderlineColor={'#F2FF5D'}
                                                    underlineColor={'#D9D9D9'}
                                                    outlineColor={'#D9D9D9'}
                                                    activeOutlineColor={'#F2FF5D'}
                                                    selectionColor={'#F2FF5D'}
                                                    mode={'outlined'}
                                                    onChangeText={(value: React.SetStateAction<string>) => {
                                                        setVerificationCodeDigit1Focus(true);
                                                        setCodeVerificationErrors(false);
                                                        setVerificationCodeErrors([]);

                                                        // format value
                                                        value = fieldValidator.formatCodeDigit(verificationCodeDigit1, value.toString());

                                                        setVerificationCodeDigit1(value);

                                                        // if the value is of length 1, then move to the next digit
                                                        if (value.length === 1) {
                                                            // @ts-ignore
                                                            verificationCodeDigit2Ref.current.focus();
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        setVerificationCodeDigit1Focus(false);
                                                    }}
                                                    value={verificationCodeDigit1}
                                                    contentStyle={styles.textInputCodeContentStyle}
                                                    style={verificationCodeDigit1Focus ? styles.textInputCodeFocus : styles.textInputCode}
                                                    onFocus={() => {
                                                        setVerificationCodeDigit1Focus(true);
                                                    }}
                                                    placeholder={'-'}
                                                    label=""
                                                    textColor={"#FFFFFF"}
                                                />
                                                <TextInput
                                                    autoCorrect={false}
                                                    autoComplete={"off"}
                                                    ref={verificationCodeDigit2Ref}
                                                    keyboardType={"number-pad"}
                                                    placeholderTextColor={'#D9D9D9'}
                                                    activeUnderlineColor={'#F2FF5D'}
                                                    underlineColor={'#D9D9D9'}
                                                    outlineColor={'#D9D9D9'}
                                                    activeOutlineColor={'#F2FF5D'}
                                                    selectionColor={'#F2FF5D'}
                                                    mode={'outlined'}
                                                    onChangeText={(value: React.SetStateAction<string>) => {
                                                        setVerificationCodeDigit2Focus(true);
                                                        setCodeVerificationErrors(false);
                                                        setVerificationCodeErrors([]);

                                                        // format value
                                                        value = fieldValidator.formatCodeDigit(verificationCodeDigit2, value.toString());

                                                        setVerificationCodeDigit2(value);

                                                        // if the value is of length 1, then move to the next digit
                                                        if (value.length === 1) {
                                                            // @ts-ignore
                                                            verificationCodeDigit3Ref.current.focus();
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        setVerificationCodeDigit2Focus(false);
                                                    }}
                                                    value={verificationCodeDigit2}
                                                    contentStyle={styles.textInputCodeContentStyle}
                                                    style={verificationCodeDigit2Focus ? styles.textInputCodeFocus : styles.textInputCode}
                                                    onFocus={() => {
                                                        setVerificationCodeDigit2Focus(true);
                                                    }}
                                                    placeholder={'-'}
                                                    label=""
                                                    textColor={"#FFFFFF"}
                                                />
                                                <TextInput
                                                    autoCorrect={false}
                                                    autoComplete={"off"}
                                                    ref={verificationCodeDigit3Ref}
                                                    keyboardType={"number-pad"}
                                                    placeholderTextColor={'#D9D9D9'}
                                                    activeUnderlineColor={'#F2FF5D'}
                                                    underlineColor={'#D9D9D9'}
                                                    outlineColor={'#D9D9D9'}
                                                    activeOutlineColor={'#F2FF5D'}
                                                    selectionColor={'#F2FF5D'}
                                                    mode={'outlined'}
                                                    onChangeText={(value: React.SetStateAction<string>) => {
                                                        setVerificationCodeDigit3Focus(true);
                                                        setCodeVerificationErrors(false);
                                                        setVerificationCodeErrors([]);

                                                        // format value
                                                        value = fieldValidator.formatCodeDigit(verificationCodeDigit3, value.toString());

                                                        setVerificationCodeDigit3(value);

                                                        // if the value is of length 1, then move to the next digit
                                                        if (value.length === 1) {
                                                            // @ts-ignore
                                                            verificationCodeDigit4Ref.current.focus();
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        setVerificationCodeDigit3Focus(false);
                                                    }}
                                                    value={verificationCodeDigit3}
                                                    contentStyle={styles.textInputCodeContentStyle}
                                                    style={verificationCodeDigit3Focus ? styles.textInputCodeFocus : styles.textInputCode}
                                                    onFocus={() => {
                                                        setVerificationCodeDigit3Focus(true);
                                                    }}
                                                    placeholder={'-'}
                                                    label=""
                                                    textColor={"#FFFFFF"}
                                                />
                                                <TextInput
                                                    autoCorrect={false}
                                                    autoComplete={"off"}
                                                    ref={verificationCodeDigit4Ref}
                                                    keyboardType={"number-pad"}
                                                    placeholderTextColor={'#D9D9D9'}
                                                    activeUnderlineColor={'#F2FF5D'}
                                                    underlineColor={'#D9D9D9'}
                                                    outlineColor={'#D9D9D9'}
                                                    activeOutlineColor={'#F2FF5D'}
                                                    selectionColor={'#F2FF5D'}
                                                    mode={'outlined'}
                                                    onChangeText={(value: React.SetStateAction<string>) => {
                                                        setVerificationCodeDigit4Focus(true);
                                                        setCodeVerificationErrors(false);
                                                        setVerificationCodeErrors([]);

                                                        // format value
                                                        value = fieldValidator.formatCodeDigit(verificationCodeDigit4, value.toString());

                                                        setVerificationCodeDigit4(value);

                                                        // if the value is of length 1, then move to the next digit
                                                        if (value.length === 1) {
                                                            // @ts-ignore
                                                            verificationCodeDigit5Ref.current.focus();
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        setVerificationCodeDigit4Focus(false);
                                                    }}
                                                    value={verificationCodeDigit4}
                                                    contentStyle={styles.textInputCodeContentStyle}
                                                    style={verificationCodeDigit4Focus ? styles.textInputCodeFocus : styles.textInputCode}
                                                    onFocus={() => {
                                                        setVerificationCodeDigit4Focus(true);
                                                    }}
                                                    placeholder={'-'}
                                                    label=""
                                                    textColor={"#FFFFFF"}
                                                />
                                                <TextInput
                                                    autoCorrect={false}
                                                    autoComplete={"off"}
                                                    ref={verificationCodeDigit5Ref}
                                                    keyboardType={"number-pad"}
                                                    placeholderTextColor={'#D9D9D9'}
                                                    activeUnderlineColor={'#F2FF5D'}
                                                    underlineColor={'#D9D9D9'}
                                                    outlineColor={'#D9D9D9'}
                                                    activeOutlineColor={'#F2FF5D'}
                                                    selectionColor={'#F2FF5D'}
                                                    mode={'outlined'}
                                                    onChangeText={(value: React.SetStateAction<string>) => {
                                                        setVerificationCodeDigit5Focus(true);
                                                        setCodeVerificationErrors(false);
                                                        setVerificationCodeErrors([]);

                                                        // format value
                                                        value = fieldValidator.formatCodeDigit(verificationCodeDigit5, value.toString());

                                                        setVerificationCodeDigit5(value);

                                                        // if the value is of length 1, then move to the next digit
                                                        if (value.length === 1) {
                                                            // @ts-ignore
                                                            verificationCodeDigit6Ref.current.focus();
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        setVerificationCodeDigit5Focus(false);
                                                    }}
                                                    value={verificationCodeDigit5}
                                                    contentStyle={styles.textInputCodeContentStyle}
                                                    style={verificationCodeDigit5Focus ? styles.textInputCodeFocus : styles.textInputCode}
                                                    onFocus={() => {
                                                        setVerificationCodeDigit5Focus(true);
                                                    }}
                                                    placeholder={'-'}
                                                    label=""
                                                    textColor={"#FFFFFF"}
                                                />
                                                <TextInput
                                                    autoCorrect={false}
                                                    autoComplete={"off"}
                                                    ref={verificationCodeDigit6Ref}
                                                    keyboardType={"number-pad"}
                                                    placeholderTextColor={'#D9D9D9'}
                                                    activeUnderlineColor={'#F2FF5D'}
                                                    underlineColor={'#D9D9D9'}
                                                    outlineColor={'#D9D9D9'}
                                                    activeOutlineColor={'#F2FF5D'}
                                                    selectionColor={'#F2FF5D'}
                                                    mode={'outlined'}
                                                    onChangeText={(value: React.SetStateAction<string>) => {
                                                        setVerificationCodeDigit6Focus(true);
                                                        setCodeVerificationErrors(false);
                                                        setVerificationCodeErrors([]);

                                                        // format value
                                                        value = fieldValidator.formatCodeDigit(verificationCodeDigit6, value.toString());

                                                        setVerificationCodeDigit6(value);
                                                    }}
                                                    onBlur={() => {
                                                        setVerificationCodeDigit6Focus(false);
                                                    }}
                                                    value={verificationCodeDigit6}
                                                    contentStyle={styles.textInputCodeContentStyle}
                                                    style={verificationCodeDigit6Focus ? styles.textInputCodeFocus : styles.textInputCode}
                                                    onFocus={() => {
                                                        setVerificationCodeDigit6Focus(true);
                                                    }}
                                                    placeholder={'-'}
                                                    label=""
                                                    textColor={"#FFFFFF"}
                                                />
                                            </View>
                                            <View style={styles.resendCodeView}>
                                                {countdownValue > 0 && Platform.OS !== 'android' // this flickers on Android so we will enable it by default
                                                    ? <Text style={styles.countdownTimer}>{``}</Text>
                                                    :
                                                    <TouchableOpacity
                                                        onPress={
                                                            async () => {
                                                                // reset the timer
                                                                setCountdownValue(10);

                                                                // resend the verification code, update profile, and clear previous code and errors
                                                                await updateProfile();

                                                                setVerificationCodeDigit1("");
                                                                setVerificationCodeDigit2("");
                                                                setVerificationCodeDigit3("");
                                                                setVerificationCodeDigit4("");
                                                                setVerificationCodeDigit5("");
                                                                setVerificationCodeDigit6("");
                                                                setVerificationCodeErrors([]);
                                                            }
                                                        }
                                                    >
                                                        <Text style={styles.resendCode}>Resend Code</Text>
                                                    </TouchableOpacity>
                                                }
                                            </View>
                                        </>
                                        : <></>
                            }
                            <TouchableOpacity
                                style={[styles.button]}
                                onPress={
                                    async () => {
                                        switch (stepNumber) {
                                            case 0:
                                                // update the profile information and trigger a code
                                                const updateProfileFlag = await updateProfile();

                                                // check if the profile information was successfully updated, otherwise we show a modal
                                                if (updateProfileFlag) {
                                                    // go to the next step upon updating the user information, and sending the code
                                                    setStepNumber(1);
                                                }
                                                break;
                                            case 1:
                                                if (verificationCodeDigit1 === "" || verificationCodeDigit2 === "" || verificationCodeDigit3 === "" || verificationCodeDigit4 === "" ||
                                                    verificationCodeDigit5 === "" || verificationCodeDigit6 === "" || verificationCodeErrors.length !== 0) {
                                                    // only populate main error if there are no other errors showing
                                                    if (verificationCodeErrors.length === 0) {
                                                        setCodeVerificationErrors(true);
                                                    }
                                                } else {
                                                    // verify the inputted code
                                                    const verificationCodeFlag = await verifyCode(`${verificationCodeDigit1}${verificationCodeDigit2}${verificationCodeDigit3}${verificationCodeDigit4}${verificationCodeDigit5}${verificationCodeDigit6}`);

                                                    // check if the code has been successfully verified, otherwise a modal will be shown
                                                    if (verificationCodeFlag) {
                                                        // set the verification flag accordingly, so we can display a success modal in the profile component
                                                        setCodeVerified(true);

                                                        // hide the bottom sheet if everything has been successfully verified
                                                        setShowBottomSheet(false);
                                                    }
                                                }
                                                break;
                                            default:
                                                console.log(`Unexpected step number ${stepNumber}!`);
                                                break;
                                        }
                                    }
                                }
                            >
                                <Text
                                    style={styles.buttonText}>{emailCodeVerificationSteps[stepNumber].stepButtonText}</Text>
                            </TouchableOpacity>
                        </KeyboardAwareScrollView>
                    </SafeAreaView>
                </>
            }
        </>
    );
}
