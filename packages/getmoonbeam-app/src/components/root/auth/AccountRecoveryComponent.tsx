import React, {useEffect, useRef, useState} from "react";
import {ImageBackground, Keyboard, Platform, TouchableOpacity, View} from "react-native";
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {commonStyles} from '../../../styles/common.module';
import {AccountRecoveryProps} from "../../../models/props/AuthenticationProps";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {styles} from "../../../styles/accountRecovery.module";
import {Dialog, Portal, Text, TextInput} from "react-native-paper";
import {accountRecoverySteps} from "../../../models/Constants";
import {FieldValidator} from "../../../utils/FieldValidator";
import {Auth} from "aws-amplify";
import {Spinner} from "../../common/Spinner";
// @ts-ignore
import AuthenticationGradientPicture from '../../../../assets/backgrounds/authentication-gradient.png'
import {Button} from "@rneui/base";

/**
 * AccountRecoveryComponent component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const AccountRecoveryComponent = ({navigation}: AccountRecoveryProps) => {
    // constants used to keep track of local component state
    const [isReady, setIsReady] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [stepNumber, setStepNumber] = useState<number>(0);
    const [accountRecoveryError, setAccountRecoveryError] = useState<boolean>(false);
    const [isKeyboardShown, setIsKeyboardShown] = useState<boolean>(false);
    // step 1
    const [email, setEmail] = useState<string>("");
    const [emailFocus, setIsEmailFocus] = useState<boolean>(false);
    const [emailErrors, setEmailErrors] = useState<string[]>([]);
    // step 2
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
    // step 3
    const [password, setPassword] = useState<string>("");
    const [passwordFocus, setIsPasswordFocus] = useState<boolean>(false);
    const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [isPasswordShown, setIsPasswordShown] = useState<boolean>(false);
    const [confirmPasswordErrors, setConfirmPasswordErrors] = useState<string[]>([]);
    const [confirmPasswordFocus, setIsConfirmPasswordFocus] = useState<boolean>(false);
    const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);

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
        // start the countdown if the value is 10
        if (countdownValue === 10) {
            startCountdown(10);
        }
        // perform field validations on every state change, for the specific field that is being validated
        if (emailFocus && email !== "") {
            fieldValidator.validateField(email, "email", setEmailErrors);
        }
        email === "" && setEmailErrors([]);

        if (passwordFocus && password !== "") {
            fieldValidator.validateField(password, "newPassword", setPasswordErrors);
        }
        password === "" && setPasswordErrors([]);

        if (confirmPasswordFocus && confirmPassword !== "") {
            fieldValidator.validateField(confirmPassword, "confirmPassword", setConfirmPasswordErrors, password);
        }
        (confirmPassword === "" && password === "") && setConfirmPasswordErrors([]);
        // for cases when password mismatch is not caught by validator
        if (confirmPassword !== "" && password !== "" && confirmPassword !== password) {
            // @ts-ignore
            setConfirmPasswordErrors(["Passwords do not match."]);
        }

        // remove keyboard listeners accordingly
        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, [isKeyboardShown, countdownValue, email, emailFocus,
        password, passwordFocus, confirmPassword, confirmPasswordFocus]);

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
     * Function used to capture the password reset code action
     *
     * @param username username inputted by the user
     * @return {@link Boolean} a flag representing whether the code retrieval was successful or not
     */
    const passwordCodeRetrieval = async (username: string): Promise<boolean> => {
        try {
            // set the loader
            setIsReady(false);

            const forgotPasswordRequest = await Auth.forgotPassword(username);
            if (forgotPasswordRequest !== null) {
                // release the loader
                setIsReady(true);

                return !!forgotPasswordRequest;
            } else {
                // release the loader
                setIsReady(true);

                const errorMessage = 'Unexpected error while confirming identity for resetting password';
                console.log(`${errorMessage} - Invalid response received from the forgotPassword call!`);

                setVerificationCodeErrors([errorMessage]);
                return false;
            }
        } catch (error) {
            // release the loader
            setIsReady(true);

            let errorMessage = 'Unexpected error while confirming identity for resetting password';

            // @ts-ignore
            const errorCode = error && error.code ? error.code : null;
            // based on the error code, return the appropriate error to the user
            if (errorCode === 'UserNotFoundException') {
                errorMessage = 'User not found!';
            } else if (errorCode === 'LimitExceededException') {
                errorMessage = 'Password reset limit exceeded! Please try again later!';
            }
            console.log(`${errorMessage} ${error}`);

            setEmailErrors([errorMessage]);
            return false;
        }
    };

    /**
     * Function used to capture the password reset code action
     *
     * @param username username inputted by the user
     * @param password new password inputted by the user
     * @param code verification code inputted by the user
     */
    const passwordReset = async (username: string, password: string, code: string): Promise<boolean> => {
        try {
            // set the loader
            setIsReady(false);

            const forgotPasswordReset = await Auth.forgotPasswordSubmit(username, code, password);
            if (forgotPasswordReset) {
                // release the loader
                setIsReady(true);
                return true;
            } else {
                // release the loader
                setIsReady(true);

                const errorMessage = 'Unexpected error while resetting password';
                console.log(`${errorMessage} - Invalid response received from the forgotPasswordSubmit call!`);

                setVerificationCodeErrors([errorMessage]);
                return false;
            }
        } catch (error) {
            // release the loader
            setIsReady(true);

            let errorMessage = 'Unexpected error while resetting password';

            // @ts-ignore
            const errorCode = error && error.code ? error.code : null;
            // based on the error code, return the appropriate error to the user
            if (errorCode === 'CodeMismatchException') {
                errorMessage = 'Invalid verification code provided. Try again!';
            }
            console.log(`${errorMessage} ${error}`);

            setVerificationCodeErrors([errorMessage]);
            return false;
        }
    };

    // return the component for the AccountRecovery page
    return (
        <>
            {
                !isReady ?
                    <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                    :
                    <ImageBackground
                        style={[commonStyles.image]}
                        imageStyle={{
                            resizeMode: 'stretch'
                        }}
                        resizeMethod={"scale"}
                        source={AuthenticationGradientPicture}>
                        <Portal>
                            <Dialog style={commonStyles.dialogStyle} visible={modalVisible}
                                    onDismiss={() => setModalVisible(false)}>
                                <Dialog.Icon icon="alert" color={"#F2FF5D"}
                                             size={hp(10)}/>
                                <Dialog.Title style={commonStyles.dialogTitle}>Great!</Dialog.Title>
                                <Dialog.Content>
                                    <Text
                                        style={commonStyles.dialogParagraph}>{`Thanks for confirming the code! Your password is now changed!`}</Text>
                                </Dialog.Content>
                                <Dialog.Actions>
                                    <Button buttonStyle={commonStyles.dialogButton}
                                            titleStyle={commonStyles.dialogButtonText}
                                            onPress={() => {
                                                navigation.navigate('SignIn', {});
                                            }}>
                                        Sign In
                                    </Button>
                                </Dialog.Actions>
                            </Dialog>
                        </Portal>
                        <KeyboardAwareScrollView
                            enableOnAndroid={true}
                            showsVerticalScrollIndicator={false}
                            enableAutomaticScroll={(Platform.OS === 'ios')}
                            contentContainerStyle={[commonStyles.rowContainer]}
                            keyboardShouldPersistTaps={'handled'}
                        >
                            <View
                                style={[Platform.OS === 'android' && isKeyboardShown && emailFocus && {height: hp(160)},
                                    Platform.OS === 'android' && isKeyboardShown && (confirmPasswordFocus || passwordFocus) && {height: hp(200)},
                                    Platform.OS === 'android' && isKeyboardShown &&
                                    (verificationCodeDigit1Focus || verificationCodeDigit2Focus || verificationCodeDigit3Focus ||
                                        verificationCodeDigit4Focus || verificationCodeDigit5Focus || verificationCodeDigit6Focus) && {height: hp(150)}]}>
                                <View style={styles.topContainer}>
                                    <Text
                                        style={styles.greetingTitle}>{accountRecoverySteps[stepNumber].stepTitle}</Text>
                                    <Text
                                        style={styles.gettingSubtitle}>{accountRecoverySteps[stepNumber].stepSubtitle}<Text
                                        style={styles.gettingSubtitleHighlighted}>{accountRecoverySteps[stepNumber].stepSubtitleHighlighted}</Text></Text>
                                </View>
                                <View style={[styles.bottomContainer]}>
                                    <Text
                                        style={styles.contentTitle}>{accountRecoverySteps[stepNumber].contentTitle}</Text>
                                    <Text
                                        style={styles.contentDescription}>{accountRecoverySteps[stepNumber].contentDescription}</Text>
                                    {accountRecoveryError
                                        ?
                                        <Text style={styles.errorMessage}>Please fill out the information below!</Text>
                                        : (emailErrors.length !== 0 && !accountRecoveryError)
                                            ? <Text style={styles.errorMessage}>{emailErrors[0]}</Text>
                                            : (verificationCodeErrors.length !== 0 && !accountRecoveryError)
                                                ? <Text style={styles.errorMessage}>{verificationCodeErrors[0]}</Text>
                                                : (passwordErrors.length !== 0 && !accountRecoveryError)
                                                    ? <Text style={styles.errorMessage}>{passwordErrors[0]}</Text>
                                                    : (confirmPasswordErrors.length !== 0 && !accountRecoveryError)
                                                        ?
                                                        <Text
                                                            style={styles.errorMessage}>{confirmPasswordErrors[0]}</Text>
                                                        : <></>
                                    }
                                    {
                                        stepNumber === 0 ?
                                            <>
                                                <TextInput
                                                    autoCapitalize={"none"}
                                                    autoCorrect={false}
                                                    autoComplete={"off"}
                                                    keyboardType={"email-address"}
                                                    placeholderTextColor={'#D9D9D9'}
                                                    activeUnderlineColor={'#F2FF5D'}
                                                    underlineColor={'#D9D9D9'}
                                                    outlineColor={'#D9D9D9'}
                                                    activeOutlineColor={'#F2FF5D'}
                                                    selectionColor={'#F2FF5D'}
                                                    mode={'outlined'}
                                                    onChangeText={(value: React.SetStateAction<string>) => {
                                                        setIsEmailFocus(true);
                                                        setAccountRecoveryError(false);
                                                        setEmailErrors([]);

                                                        setEmail(value);
                                                    }}
                                                    onBlur={() => {
                                                        setIsEmailFocus(false);
                                                    }}
                                                    value={email}
                                                    contentStyle={styles.textInputContentStyle}
                                                    style={emailFocus ? styles.textInputFocus : styles.textInput}
                                                    onFocus={() => {
                                                        setIsEmailFocus(true);
                                                    }}
                                                    placeholder={'Required'}
                                                    label="Email"
                                                    textColor={"#FFFFFF"}
                                                    left={<TextInput.Icon icon="email" iconColor="#FFFFFF"/>}
                                                />
                                            </>
                                            : stepNumber === 1 ?
                                                <>
                                                    <TextInput
                                                        autoCapitalize={"none"}
                                                        autoCorrect={false}
                                                        autoComplete={"off"}
                                                        keyboardType={"default"}
                                                        placeholderTextColor={'#D9D9D9'}
                                                        activeUnderlineColor={'#F2FF5D'}
                                                        underlineColor={'#D9D9D9'}
                                                        outlineColor={'#D9D9D9'}
                                                        activeOutlineColor={'#F2FF5D'}
                                                        selectionColor={'#F2FF5D'}
                                                        mode={'outlined'}
                                                        onChangeText={(value: React.SetStateAction<string>) => {
                                                            setIsPasswordFocus(true);
                                                            setAccountRecoveryError(false);
                                                            setPasswordErrors([]);

                                                            setPassword(value);
                                                        }}
                                                        onBlur={() => {
                                                            setIsPasswordFocus(false);
                                                        }}
                                                        value={password}
                                                        secureTextEntry={!isPasswordShown}
                                                        contentStyle={styles.textInputContentStyle}
                                                        style={passwordFocus ? styles.textInputFocus : styles.textInput}
                                                        onFocus={() => {
                                                            setIsPasswordFocus(true);
                                                        }}
                                                        placeholder={'Required'}
                                                        label="Password"
                                                        textColor={"#FFFFFF"}
                                                        left={<TextInput.Icon icon="lock" iconColor="#FFFFFF"/>}
                                                        right={<TextInput.Icon icon="eye"
                                                                               iconColor={isPasswordShown ? "#F2FF5D" : "#FFFFFF"}
                                                                               onPress={() => setIsPasswordShown(!isPasswordShown)}/>}
                                                    />
                                                    <TextInput
                                                        autoCapitalize={"none"}
                                                        autoCorrect={false}
                                                        autoComplete={"off"}
                                                        keyboardType={"default"}
                                                        placeholderTextColor={'#D9D9D9'}
                                                        activeUnderlineColor={'#F2FF5D'}
                                                        underlineColor={'#D9D9D9'}
                                                        outlineColor={'#D9D9D9'}
                                                        activeOutlineColor={'#F2FF5D'}
                                                        selectionColor={'#F2FF5D'}
                                                        mode={'outlined'}
                                                        onChangeText={(value: React.SetStateAction<string>) => {
                                                            setIsConfirmPasswordFocus(true);
                                                            setAccountRecoveryError(false);
                                                            setConfirmPasswordErrors([]);

                                                            setConfirmPassword(value);
                                                        }}
                                                        onBlur={() => {
                                                            setIsConfirmPasswordFocus(false);
                                                        }}
                                                        value={confirmPassword}
                                                        secureTextEntry={!isConfirmPasswordShown}
                                                        contentStyle={styles.textInputContentStyle}
                                                        style={confirmPasswordFocus ? styles.textPasswordInputFocus : styles.textPasswordInput}
                                                        onFocus={() => {
                                                            setIsConfirmPasswordFocus(true);
                                                        }}
                                                        placeholder={'Required (must match Password)'}
                                                        label="Confirm Password"
                                                        textColor={"#FFFFFF"}
                                                        left={<TextInput.Icon icon="lock" iconColor="#FFFFFF"/>}
                                                        right={<TextInput.Icon icon="eye"
                                                                               iconColor={isConfirmPasswordShown ? "#F2FF5D" : "#FFFFFF"}
                                                                               onPress={() => setIsConfirmPasswordShown(!isConfirmPasswordShown)}/>}
                                                    />
                                                </>
                                                : stepNumber === 2 ?
                                                    <>
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
                                                                    setAccountRecoveryError(false);
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
                                                                    setAccountRecoveryError(false);
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
                                                                    setAccountRecoveryError(false);
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
                                                                    setAccountRecoveryError(false);
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
                                                                    setAccountRecoveryError(false);
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
                                                                    setAccountRecoveryError(false);
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
                                                            {/*{countdownValue > 0*/}
                                                            {/*    ? <Text style={styles.countdownTimer}>{``}</Text>*/}
                                                            {/*    :*/}
                                                            {
                                                                <TouchableOpacity
                                                                    onPress={
                                                                        async () => {
                                                                            // reset the timer
                                                                            setCountdownValue(10);

                                                                            // resend the verification code, and clear previous code and errors
                                                                            await passwordCodeRetrieval(email);
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
                                        style={[styles.button, (stepNumber === 1) && {marginTop: hp(10)}, (stepNumber === 2) && {marginTop: hp(5)}]}
                                        onPress={
                                            async () => {
                                                switch (stepNumber) {
                                                    case 0:
                                                        if (email === "" || emailErrors.length !== 0) {
                                                            // only populate main error if there are no other errors showing
                                                            if (emailErrors.length === 0) {
                                                                setAccountRecoveryError(true);
                                                            }
                                                        } else {
                                                            // send a verification code to the email
                                                            const codeRetrievalFlag = await passwordCodeRetrieval(email);
                                                            if (codeRetrievalFlag) {
                                                                // set the next step
                                                                setStepNumber(1);
                                                            }
                                                        }
                                                        break;
                                                    case 1:
                                                        if (password === "" || confirmPassword === "" || passwordErrors.length !== 0 || confirmPasswordErrors.length !== 0) {
                                                            // only populate main error if there are no other errors showing
                                                            if (passwordErrors.length === 0 || confirmPasswordErrors.length === 0) {
                                                                setAccountRecoveryError(true);
                                                            }
                                                        } else {
                                                            // continue to next step, in order to verify code
                                                            setStepNumber(2);
                                                        }
                                                        break;
                                                    case 2:
                                                        if (verificationCodeDigit1 === "" || verificationCodeDigit2 === "" || verificationCodeDigit3 === "" ||
                                                            verificationCodeDigit4 === "" || verificationCodeDigit5 === "" || verificationCodeDigit6 === "" ||
                                                            verificationCodeErrors.length !== 0) {
                                                            // only populate main error if there are no other errors showing
                                                            if (verificationCodeErrors.length === 0) {
                                                                setAccountRecoveryError(true);
                                                            }
                                                        } else {
                                                            // confirm password reset
                                                            const passwordResetFlag = await passwordReset(email,
                                                                password,
                                                                `${verificationCodeDigit1}${verificationCodeDigit2}${verificationCodeDigit3}${verificationCodeDigit4}${verificationCodeDigit5}${verificationCodeDigit6}`);
                                                            if (passwordResetFlag) {
                                                                // display a success message
                                                                setModalVisible(true);
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
                                            style={styles.buttonText}>{accountRecoverySteps[stepNumber].stepButtonText}</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.bottomAuthenticationText}>{"Remember your password ?"}
                                        <Text
                                            onPress={() => {
                                                navigation.navigate('SignIn', {});
                                            }}
                                            style={styles.bottomAuthenticationTextButton}>{" Sign In"}
                                        </Text>
                                    </Text>
                                </View>
                            </View>
                        </KeyboardAwareScrollView>
                    </ImageBackground>
            }
        </>
    );
};

