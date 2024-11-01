import {TouchableOpacity, View} from "react-native";
import {styles} from "../../../../styles/registration.module";
import {Text, TextInput} from "react-native-paper";
import React, {useEffect, useRef, useState} from "react";
import {useRecoilState} from "recoil";
import {
    automaticallyVerifyRegistrationCodeState,
    emailState,
    registrationCodeTimerValue,
    registrationMainErrorState,
    registrationVerificationDigit1,
    registrationVerificationDigit2,
    registrationVerificationDigit3,
    registrationVerificationDigit4,
    registrationVerificationDigit5,
    registrationVerificationDigit6, userIsAuthenticatedState,
    verificationCodeErrorsState
} from "../../../../recoil/AuthAtom";
import {FieldValidator} from "../../../../utils/FieldValidator";
import {Auth} from "aws-amplify";
import {logEvent} from "../../../../utils/AppSync";
import {LoggingLevel} from "@moonbeam/moonbeam-models";

/**
 * CodeVerificationStep component.
 *
 * @constructor constructor for the component.
 */
export const CodeVerificationStep = () => {
    // other constants
    const RESEND_CODE_ALERT_MESSAGE: string = "Re-sending verification code! You should receive an email shortly";
    // constants used to keep track of local component state
    const [verificationCodeDigit1Focus, setIsVerificationCodeDigit1Focus] = useState<boolean>(false);
    const [verificationCodeDigit2Focus, setIsVerificationCodeDigit2Focus] = useState<boolean>(false);
    const [verificationCodeDigit3Focus, setIsVerificationCodeDigit3Focus] = useState<boolean>(false);
    const [verificationCodeDigit4Focus, setIsVerificationCodeDigit4Focus] = useState<boolean>(false);
    const [verificationCodeDigit5Focus, setIsVerificationCodeDigit5Focus] = useState<boolean>(false);
    const [verificationCodeDigit6Focus, setIsVerificationCodeDigit6Focus] = useState<boolean>(false);
    // constants used to keep track of shared states
    const [userIsAuthenticated, ] = useRecoilState(userIsAuthenticatedState);
    const [, setAutomaticallyVerifyRegistrationCode] = useRecoilState(automaticallyVerifyRegistrationCodeState);
    const [email,] = useRecoilState(emailState);
    const [countdownValue, setCountDownValue] = useRecoilState(registrationCodeTimerValue);
    const [verificationCodeErrors, setVerificationCodeErrors] = useRecoilState(verificationCodeErrorsState);
    const [verificationCodeDigit1, setVerificationCodeDigit1] = useRecoilState(registrationVerificationDigit1);
    const verificationCodeDigit1Ref = useRef(null);
    const [verificationCodeDigit2, setVerificationCodeDigit2] = useRecoilState(registrationVerificationDigit2);
    const verificationCodeDigit2Ref = useRef(null);
    const [verificationCodeDigit3, setVerificationCodeDigit3] = useRecoilState(registrationVerificationDigit3);
    const verificationCodeDigit3Ref = useRef(null);
    const [verificationCodeDigit4, setVerificationCodeDigit4] = useRecoilState(registrationVerificationDigit4);
    const verificationCodeDigit4Ref = useRef(null);
    const [verificationCodeDigit5, setVerificationCodeDigit5] = useRecoilState(registrationVerificationDigit5);
    const verificationCodeDigit5Ref = useRef(null);
    const [verificationCodeDigit6, setVerificationCodeDigit6] = useRecoilState(registrationVerificationDigit6);
    const verificationCodeDigit6Ref = useRef(null);
    const [registrationMainError, setRegistrationMainError] = useRecoilState(registrationMainErrorState);

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
        /**
         * if the countdown value runs down, then reset any verification code errors, if there are any present,
         * and they are specifying the resend message
         */
        if (countdownValue <= 0
            && verificationCodeErrors.length !== 0
            && verificationCodeErrors[0] === RESEND_CODE_ALERT_MESSAGE) {
            setVerificationCodeErrors([]);
        }
    }, [countdownValue, verificationCodeErrors]);

    /**
     * Function used to capture the confirmation button press
     */
    const resendCode = async () => {
        try {
            const resendSignUpCode = await Auth.resendSignUp(email);
            if (resendSignUpCode) {
                // this is not an actual error, but we will treat it as an alerting message
                // @ts-ignore
                setVerificationCodeErrors([RESEND_CODE_ALERT_MESSAGE]);

                // clear previous code and any errors
                setVerificationCodeDigit1("");
                setVerificationCodeDigit2("");
                setVerificationCodeDigit3("");
                setVerificationCodeDigit4("");
                setVerificationCodeDigit5("");
                setVerificationCodeDigit6("");
                setVerificationCodeErrors([]);
            }
        } catch (error) {
            // @ts-ignore
            const errorMessage: string = error.name;
            if (errorMessage && errorMessage === "LimitExceededException") {
                // set verification code errors accordingly
                // @ts-ignore
                setVerificationCodeErrors(["Requested too many codes. Wait a while before requesting another one!"]);
            } else {
                // set verification code errors accordingly
                // @ts-ignore
                setVerificationCodeErrors(["Unexpected error while re-sending verification code. Try again!"]);
            }
            const message = errorMessage
                ? `Unexpected error while resending verification code: ${JSON.stringify(errorMessage)}`
                : `Unexpected error while resending verification code: ${JSON.stringify(error)} ${error}`;
            console.log(message);
            await logEvent(message, LoggingLevel.Error, userIsAuthenticated);
        }
    };

    // return the component for the CodeVerificationStep, part of the Registration page
    return (
        <>
            {registrationMainError
                ? <Text style={styles.errorMessage}>Please fill out the information below!</Text>
                : (verificationCodeErrors.length !== 0 && !registrationMainError)
                    ? <Text style={styles.errorMessage}>{verificationCodeErrors[0]}</Text>
                    : <></>
            }
            <View>
                <View style={styles.codeInputColumnView}>
                    <TextInput
                        ref={verificationCodeDigit1Ref}
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
                        selection={{start: verificationCodeDigit1.length}}
                        onChangeText={(value: React.SetStateAction<string>) => {
                            setIsVerificationCodeDigit1Focus(true);
                            setRegistrationMainError(false);
                            setVerificationCodeErrors([]);

                            // format value
                            value = fieldValidator.formatCodeDigit(value.toString());
                            setVerificationCodeDigit1(value);

                            // if the value is of length 1, then move to the next digit and clear its contents too
                            if (value.length === 1) {
                                // @ts-ignore
                                verificationCodeDigit2Ref.current.focus();
                                setVerificationCodeDigit2('');
                            }
                        }}
                        onBlur={() => {
                            setIsVerificationCodeDigit1Focus(false);
                        }}
                        value={verificationCodeDigit1}
                        contentStyle={styles.textInputCodeContentStyle}
                        style={verificationCodeDigit1Focus ? styles.textInputCodeFocus : styles.textInputCode}
                        onFocus={() => {
                            setIsVerificationCodeDigit1Focus(true);
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
                        selection={{start: verificationCodeDigit2.length}}
                        onKeyPress={({nativeEvent}) => {
                            // for backspace, go back to the previous digit if current digit value is empty
                            if (nativeEvent.key === 'Backspace' && verificationCodeDigit2.length === 0) {
                                // @ts-ignore
                                verificationCodeDigit1Ref.current.focus();
                            }
                        }}
                        onChangeText={(value: React.SetStateAction<string>) => {
                            setIsVerificationCodeDigit2Focus(true);
                            setRegistrationMainError(false);
                            setVerificationCodeErrors([]);

                            // format value
                            value = fieldValidator.formatCodeDigit(value.toString());
                            setVerificationCodeDigit2(value);

                            // if the value is of length 1, then move to the next digit and clear its contents too
                            if (value.length === 1) {
                                // @ts-ignore
                                verificationCodeDigit3Ref.current.focus();
                                setVerificationCodeDigit3('');
                            }
                            // if the value is of length 0, then we move to the previous digit
                            if (value.length === 0) {
                                // @ts-ignore
                                verificationCodeDigit1Ref.current.focus();
                            }
                        }}
                        onBlur={() => {
                            setIsVerificationCodeDigit2Focus(false);
                        }}
                        value={verificationCodeDigit2}
                        contentStyle={styles.textInputCodeContentStyle}
                        style={verificationCodeDigit2Focus ? styles.textInputCodeFocus : styles.textInputCode}
                        onFocus={() => {
                            setIsVerificationCodeDigit2Focus(true);
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
                        selection={{start: verificationCodeDigit3.length}}
                        onKeyPress={({nativeEvent}) => {
                            // for backspace, go back to the previous digit if current digit value is empty
                            if (nativeEvent.key === 'Backspace' && verificationCodeDigit3.length === 0) {
                                // @ts-ignore
                                verificationCodeDigit2Ref.current.focus();
                            }
                        }}
                        onChangeText={(value: React.SetStateAction<string>) => {
                            setIsVerificationCodeDigit3Focus(true);
                            setRegistrationMainError(false);
                            setVerificationCodeErrors([]);

                            // format value
                            value = fieldValidator.formatCodeDigit(value.toString());
                            setVerificationCodeDigit3(value);

                            // if the value is of length 1, then move to the next digit and clear its contents too
                            if (value.length === 1) {
                                // @ts-ignore
                                verificationCodeDigit4Ref.current.focus();
                                setVerificationCodeDigit4('');
                            }
                            // if the value is of length 0, then we move to the previous digit
                            if (value.length === 0) {
                                // @ts-ignore
                                verificationCodeDigit2Ref.current.focus();
                            }
                        }}
                        onBlur={() => {
                            setIsVerificationCodeDigit3Focus(false);
                        }}
                        value={verificationCodeDigit3}
                        contentStyle={styles.textInputCodeContentStyle}
                        style={verificationCodeDigit3Focus ? styles.textInputCodeFocus : styles.textInputCode}
                        onFocus={() => {
                            setIsVerificationCodeDigit3Focus(true);
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
                        selection={{start: verificationCodeDigit4.length}}
                        onKeyPress={({nativeEvent}) => {
                            // for backspace, go back to the previous digit if current digit value is empty
                            if (nativeEvent.key === 'Backspace' && verificationCodeDigit4.length === 0) {
                                // @ts-ignore
                                verificationCodeDigit3Ref.current.focus();
                            }
                        }}
                        onChangeText={(value: React.SetStateAction<string>) => {
                            setIsVerificationCodeDigit4Focus(true);
                            setRegistrationMainError(false);
                            setVerificationCodeErrors([]);

                            // format value
                            value = fieldValidator.formatCodeDigit(value.toString());
                            setVerificationCodeDigit4(value);

                            // if the value is of length 1, then move to the next digit and clear its contents too
                            if (value.length === 1) {
                                // @ts-ignore
                                verificationCodeDigit5Ref.current.focus();
                                setVerificationCodeDigit5('');
                            }
                            // if the value is of length 0, then we move to the previous digit
                            if (value.length === 0) {
                                // @ts-ignore
                                verificationCodeDigit3Ref.current.focus();
                            }
                        }}
                        onBlur={() => {
                            setIsVerificationCodeDigit4Focus(false);
                        }}
                        value={verificationCodeDigit4}
                        contentStyle={styles.textInputCodeContentStyle}
                        style={verificationCodeDigit4Focus ? styles.textInputCodeFocus : styles.textInputCode}
                        onFocus={() => {
                            setIsVerificationCodeDigit4Focus(true);
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
                        selection={{start: verificationCodeDigit5.length}}
                        onKeyPress={({nativeEvent}) => {
                            /// for backspace, go back to the previous digit if current digit value is empty
                            if (nativeEvent.key === 'Backspace' && verificationCodeDigit5.length === 0) {
                                // @ts-ignore
                                verificationCodeDigit4Ref.current.focus();
                            }
                        }}
                        onChangeText={(value: React.SetStateAction<string>) => {
                            setIsVerificationCodeDigit5Focus(true);
                            setRegistrationMainError(false);
                            setVerificationCodeErrors([]);

                            // format value
                            value = fieldValidator.formatCodeDigit(value.toString());
                            setVerificationCodeDigit5(value);

                            // if the value is of length 1, then move to the next digit and clear its contents too
                            if (value.length === 1) {
                                // @ts-ignore
                                verificationCodeDigit6Ref.current.focus();
                                setVerificationCodeDigit6('');
                            }
                            // if the value is of length 0, then we move to the previous digit
                            if (value.length === 0) {
                                // @ts-ignore
                                verificationCodeDigit4Ref.current.focus();
                            }
                        }}
                        onBlur={() => {
                            setIsVerificationCodeDigit5Focus(false);
                        }}
                        value={verificationCodeDigit5}
                        contentStyle={styles.textInputCodeContentStyle}
                        style={verificationCodeDigit5Focus ? styles.textInputCodeFocus : styles.textInputCode}
                        onFocus={() => {
                            setIsVerificationCodeDigit5Focus(true);
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
                        selection={{start: verificationCodeDigit6.length}}
                        onKeyPress={({nativeEvent}) => {
                            // for backspace, go back to the previous digit if current digit value is empty
                            if (nativeEvent.key === 'Backspace' && verificationCodeDigit6.length === 0) {
                                // @ts-ignore
                                verificationCodeDigit5Ref.current.focus();
                            }
                        }}
                        onChangeText={(value: React.SetStateAction<string>) => {
                            setIsVerificationCodeDigit6Focus(true);
                            setRegistrationMainError(false);
                            setVerificationCodeErrors([]);

                            // format value
                            value = fieldValidator.formatCodeDigit(value.toString());
                            setVerificationCodeDigit6(value);

                            // if the value is of length 1, then verify code automatically
                            if (value.length === 1) {
                                // @ts-ignore
                                verificationCodeDigit6Ref.current.blur();
                                // automatically verify the code
                                setAutomaticallyVerifyRegistrationCode(true);
                            }
                            // if the value is of length 0, then we move to the previous digit
                            if (value.length === 0) {
                                // @ts-ignore
                                verificationCodeDigit5Ref.current.focus();
                            }
                        }}
                        onBlur={() => {
                            setIsVerificationCodeDigit6Focus(false);
                        }}
                        value={verificationCodeDigit6}
                        contentStyle={styles.textInputCodeContentStyle}
                        style={verificationCodeDigit6Focus ? styles.textInputCodeFocus : styles.textInputCode}
                        onFocus={() => {
                            setIsVerificationCodeDigit6Focus(true);
                        }}
                        placeholder={'-'}
                        label=""
                        textColor={"#FFFFFF"}
                    />
                </View>
                <View style={styles.resendCodeView}>
                    {
                        <TouchableOpacity
                            // disabled={countdownValue > 0}
                            onPress={
                                async () => {
                                    // reset the timer
                                    setCountDownValue(10);

                                    // resend the verification code
                                    await resendCode();

                                    // reset all error messages
                                    setRegistrationMainError(false);
                                    setVerificationCodeErrors([]);
                                }
                            }
                        >
                            <Text style={styles.resendCode}>Resend Code</Text>
                            {/*<Text style={[countdownValue > 0 ? styles.resendCodeDisabled : styles.resendCode]}>Resend Code</Text>*/}
                        </TouchableOpacity>
                    }
                </View>
            </View>
        </>
    );
}
