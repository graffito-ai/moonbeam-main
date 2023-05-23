import {TouchableOpacity, View} from "react-native";
import {styles} from "../../../styles/registration.module";
import {Text, TextInput} from "react-native-paper";
import React, {useEffect, useState} from "react";
import {useRecoilState} from "recoil";
import {
    verificationCodeErrorsState,
    registrationBackButtonShown,
    registrationMainErrorState,
    registrationCodeTimerValue,
    registrationVerificationDigit1,
    registrationVerificationDigit2,
    registrationVerificationDigit3,
    registrationVerificationDigit4,
    registrationVerificationDigit5,
    registrationVerificationDigit6
} from "../../../recoil/AuthAtom";
import {FieldValidator} from "../../../utils/FieldValidator";

/**
 * CodeVerificationStep component.
 */
export const CodeVerificationStep = () => {
    // constants used to keep track of local component state
    const [verificationCodeDigit1Focus, setIsVerificationCodeDigit1Focus] = useState<boolean>(false);
    const [verificationCodeDigit2Focus, setIsVerificationCodeDigit2Focus] = useState<boolean>(false);
    const [verificationCodeDigit3Focus, setIsVerificationCodeDigit3Focus] = useState<boolean>(false);
    const [verificationCodeDigit4Focus, setIsVerificationCodeDigit4Focus] = useState<boolean>(false);
    const [verificationCodeDigit5Focus, setIsVerificationCodeDigit5Focus] = useState<boolean>(false);
    const [verificationCodeDigit6Focus, setIsVerificationCodeDigit6Focus] = useState<boolean>(false);
    // constants used to keep track of shared states
    const [countDownValue, ] = useRecoilState(registrationCodeTimerValue);
    const [verificationCodeErrors, ] = useRecoilState(verificationCodeErrorsState);
    const [verificationCodeDigit1, setVerificationCodeDigit1] = useRecoilState(registrationVerificationDigit1);
    const [verificationCodeDigit2, setVerificationCodeDigit2] = useRecoilState(registrationVerificationDigit2);
    const [verificationCodeDigit3, setVerificationCodeDigit3] = useRecoilState(registrationVerificationDigit3);
    const [verificationCodeDigit4, setVerificationCodeDigit4] = useRecoilState(registrationVerificationDigit4);
    const [verificationCodeDigit5, setVerificationCodeDigit5] = useRecoilState(registrationVerificationDigit5);
    const [verificationCodeDigit6, setVerificationCodeDigit6] = useRecoilState(registrationVerificationDigit6);
    const [registrationMainError, setRegistrationMainError] = useRecoilState(registrationMainErrorState);
    const [, setIsBackButtonShown] = useRecoilState(registrationBackButtonShown);

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
        // perform field validations on every state change, for the specific field that is being validated

    }, []);


    // return the component for the CodeVerificationStep, part of the Registration page
    return (
        <>
            {registrationMainError
                ? <Text style={styles.errorMessage}>Please fill out the information below!</Text>
                : (verificationCodeErrors.length && !registrationMainError)
                    ? <Text style={styles.errorMessage}>{verificationCodeErrors[0]}</Text>
                    : <></>
            }
            <View>
                <View style={styles.codeInputColumnView}>
                    <TextInput
                        keyboardType={"number-pad"}
                        placeholderTextColor={'#D9D9D9'}
                        activeUnderlineColor={'#F2FF5D'}
                        underlineColor={'#D9D9D9'}
                        outlineColor={'#D9D9D9'}
                        activeOutlineColor={'#F2FF5D'}
                        selectionColor={'#F2FF5D'}
                        mode={'outlined'}
                        onChangeText={(value: React.SetStateAction<string>) => {
                            setIsVerificationCodeDigit1Focus(true);
                            setRegistrationMainError(false);

                            // format value
                            value = fieldValidator.formatCodeDigit(verificationCodeDigit1, value.toString());

                            setVerificationCodeDigit1(value);
                        }}
                        onBlur={() => {
                            setIsVerificationCodeDigit1Focus(false);
                            setIsBackButtonShown(true);
                        }}
                        value={verificationCodeDigit1}
                        contentStyle={styles.textInputCodeContentStyle}
                        style={verificationCodeDigit1Focus ? styles.textInputCodeFocus : styles.textInputCode}
                        onFocus={() => {
                            setIsVerificationCodeDigit1Focus(true);
                            setIsBackButtonShown(false);
                        }}
                        placeholder={'-'}
                        label=""
                        textColor={"#FFFFFF"}
                    />
                    <TextInput
                        keyboardType={"number-pad"}
                        placeholderTextColor={'#D9D9D9'}
                        activeUnderlineColor={'#F2FF5D'}
                        underlineColor={'#D9D9D9'}
                        outlineColor={'#D9D9D9'}
                        activeOutlineColor={'#F2FF5D'}
                        selectionColor={'#F2FF5D'}
                        mode={'outlined'}
                        onChangeText={(value: React.SetStateAction<string>) => {
                            setIsVerificationCodeDigit2Focus(true);
                            setRegistrationMainError(false);

                            // format value
                            value = fieldValidator.formatCodeDigit(verificationCodeDigit2, value.toString());

                            setVerificationCodeDigit2(value);
                        }}
                        onBlur={() => {
                            setIsVerificationCodeDigit2Focus(false);
                            setIsBackButtonShown(true);
                        }}
                        value={verificationCodeDigit2}
                        contentStyle={styles.textInputCodeContentStyle}
                        style={verificationCodeDigit2Focus ? styles.textInputCodeFocus : styles.textInputCode}
                        onFocus={() => {
                            setIsVerificationCodeDigit2Focus(true);
                            setIsBackButtonShown(false);
                        }}
                        placeholder={'-'}
                        label=""
                        textColor={"#FFFFFF"}
                    />
                    <TextInput
                        keyboardType={"number-pad"}
                        placeholderTextColor={'#D9D9D9'}
                        activeUnderlineColor={'#F2FF5D'}
                        underlineColor={'#D9D9D9'}
                        outlineColor={'#D9D9D9'}
                        activeOutlineColor={'#F2FF5D'}
                        selectionColor={'#F2FF5D'}
                        mode={'outlined'}
                        onChangeText={(value: React.SetStateAction<string>) => {
                            setIsVerificationCodeDigit3Focus(true);
                            setRegistrationMainError(false);

                            // format value
                            value = fieldValidator.formatCodeDigit(verificationCodeDigit3, value.toString());

                            setVerificationCodeDigit3(value);
                        }}
                        onBlur={() => {
                            setIsVerificationCodeDigit3Focus(false);
                            setIsBackButtonShown(true);
                        }}
                        value={verificationCodeDigit3}
                        contentStyle={styles.textInputCodeContentStyle}
                        style={verificationCodeDigit3Focus ? styles.textInputCodeFocus : styles.textInputCode}
                        onFocus={() => {
                            setIsVerificationCodeDigit3Focus(true);
                            setIsBackButtonShown(false);
                        }}
                        placeholder={'-'}
                        label=""
                        textColor={"#FFFFFF"}
                    />
                    <TextInput
                        keyboardType={"number-pad"}
                        placeholderTextColor={'#D9D9D9'}
                        activeUnderlineColor={'#F2FF5D'}
                        underlineColor={'#D9D9D9'}
                        outlineColor={'#D9D9D9'}
                        activeOutlineColor={'#F2FF5D'}
                        selectionColor={'#F2FF5D'}
                        mode={'outlined'}
                        onChangeText={(value: React.SetStateAction<string>) => {
                            setIsVerificationCodeDigit4Focus(true);
                            setRegistrationMainError(false);

                            // format value
                            value = fieldValidator.formatCodeDigit(verificationCodeDigit4, value.toString());

                            setVerificationCodeDigit4(value);
                        }}
                        onBlur={() => {
                            setIsVerificationCodeDigit4Focus(false);
                            setIsBackButtonShown(true);
                        }}
                        value={verificationCodeDigit4}
                        contentStyle={styles.textInputCodeContentStyle}
                        style={verificationCodeDigit4Focus ? styles.textInputCodeFocus : styles.textInputCode}
                        onFocus={() => {
                            setIsVerificationCodeDigit4Focus(true);
                            setIsBackButtonShown(false);
                        }}
                        placeholder={'-'}
                        label=""
                        textColor={"#FFFFFF"}
                    />
                    <TextInput
                        keyboardType={"number-pad"}
                        placeholderTextColor={'#D9D9D9'}
                        activeUnderlineColor={'#F2FF5D'}
                        underlineColor={'#D9D9D9'}
                        outlineColor={'#D9D9D9'}
                        activeOutlineColor={'#F2FF5D'}
                        selectionColor={'#F2FF5D'}
                        mode={'outlined'}
                        onChangeText={(value: React.SetStateAction<string>) => {
                            setIsVerificationCodeDigit5Focus(true);
                            setRegistrationMainError(false);

                            // format value
                            value = fieldValidator.formatCodeDigit(verificationCodeDigit5, value.toString());

                            setVerificationCodeDigit5(value);
                        }}
                        onBlur={() => {
                            setIsVerificationCodeDigit5Focus(false);
                            setIsBackButtonShown(true);
                        }}
                        value={verificationCodeDigit5}
                        contentStyle={styles.textInputCodeContentStyle}
                        style={verificationCodeDigit5Focus ? styles.textInputCodeFocus : styles.textInputCode}
                        onFocus={() => {
                            setIsVerificationCodeDigit5Focus(true);
                            setIsBackButtonShown(false);
                        }}
                        placeholder={'-'}
                        label=""
                        textColor={"#FFFFFF"}
                    />
                    <TextInput
                        keyboardType={"number-pad"}
                        placeholderTextColor={'#D9D9D9'}
                        activeUnderlineColor={'#F2FF5D'}
                        underlineColor={'#D9D9D9'}
                        outlineColor={'#D9D9D9'}
                        activeOutlineColor={'#F2FF5D'}
                        selectionColor={'#F2FF5D'}
                        mode={'outlined'}
                        onChangeText={(value: React.SetStateAction<string>) => {
                            setIsVerificationCodeDigit6Focus(true);
                            setRegistrationMainError(false);

                            // format value
                            value = fieldValidator.formatCodeDigit(verificationCodeDigit6, value.toString());

                            setVerificationCodeDigit6(value);
                        }}
                        onBlur={() => {
                            setIsVerificationCodeDigit6Focus(false);
                            setIsBackButtonShown(true);
                        }}
                        value={verificationCodeDigit6}
                        contentStyle={styles.textInputCodeContentStyle}
                        style={verificationCodeDigit6Focus ? styles.textInputCodeFocus : styles.textInputCode}
                        onFocus={() => {
                            setIsVerificationCodeDigit6Focus(true);
                            setIsBackButtonShown(false);
                        }}
                        placeholder={'-'}
                        label=""
                        textColor={"#FFFFFF"}
                    />
                </View>
                <View style={styles.resendCodeView}>
                    {countDownValue > 0
                        ? <Text style={styles.countdownTimer}>{`00:${countDownValue}`}</Text>
                        :
                        <TouchableOpacity
                            onPress={
                                () => {
                                }
                            }
                        >
                            <Text style={styles.resendCode}>Resend Code</Text>
                        </TouchableOpacity>
                    }
                </View>
            </View>
        </>
    );
}
