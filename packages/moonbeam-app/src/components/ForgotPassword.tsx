import React, {useEffect, useState} from "react";
import {Dimensions, Image, ImageBackground, Keyboard, Platform, SafeAreaView, ScrollView, View} from "react-native";
import {ForgotPasswordProps} from "../models/RootProps";
import {commonStyles} from "../styles/common.module";
// @ts-ignore
import {ProgressStep, ProgressSteps} from 'react-native-progress-steps';
import {Button, Modal, Portal, Text, TextInput} from "react-native-paper";
import {styles} from "../styles/forgotPassword.module";
// @ts-ignore
import {useValidation} from 'react-native-form-validator';
// @ts-ignore
import ForgotPasswordLogo from '../../assets/login-logo.png';
import {Auth} from 'aws-amplify';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'

/**
 * Forgot Password component.
 */
export const ForgotPassword = ({navigation, route}: ForgotPasswordProps) => {
    // state driven key-value pairs for UI related elements
    const [emailFocus, setIsEmailFocus] = useState<boolean>(false);
    const [isInitialRender, setIsInitialRender] = useState<boolean>(route.params.initialRender);
    const [resetPasswordDisclaimerShown, setResetPasswordDisclaimerShown] = useState<boolean>(false);
    const [passwordFocus, setIsPasswordFocus] = useState<boolean>(false);
    const [confirmPasswordFocus, setIsConfirmPasswordFocus] = useState<boolean>(false);
    const [codeFocus, setIsCodeFocus] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalMessage, setModalMessage] = useState<string>("");
    const [isErrorModal, setIsErrorModal] = useState<boolean>(false);
    const [androidScrollPadding, setAndroidScrollPadding] = useState<number>(1);
    // state driven key-value pairs for forgot password form values
    const [profileStepProgressError, setProfileStepProgressError] = useState<boolean>(false);
    const [codeVerificationStepProgressError, setCodeVerificationStepProgressError] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [emailErrors, setEmailErrors] = useState<any[]>([]);
    const [progressStepsErrors, setProgressStepsErrors] = useState<boolean>(false);
    const [password, setPassword] = useState<string>("");
    const [passwordShown, setIsPasswordShown] = useState<boolean>(false);
    const [passwordErrors, setPasswordErrors] = useState<any[]>([]);
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [confirmPasswordShown, setIsConfirmPasswordShown] = useState<boolean>(false);
    const [confirmPasswordErrors, setConfirmPasswordErrors] = useState<any[]>([]);
    const [code, setCode] = useState<string>("");
    const [codeErrors, setCodeErrors] = useState<any[]>([]);

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
                // add padding for Android keyboards since the scrolling doesn't work
                setAndroidScrollPadding(300);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setAndroidScrollPadding(10);
            }
        );

        // if it's an initial render, set all validation errors to empty
        if (!isInitialRender) {
            // perform field validations on every state change, for the specific field that is being validated
            if (emailFocus && email !== "") {
                fieldValidation("email");
            }
            email === "" && setEmailErrors([]);

            if (codeFocus && code !== "") {
                fieldValidation("code");
            }
            code === "" && setCodeErrors([]);

            if (passwordFocus && password !== "") {
                fieldValidation("password");
            }
            if (confirmPasswordFocus) {
                fieldValidation("confirmPassword");
            }
            password === "" && setPasswordErrors([]);
            (confirmPassword === "" && password === "") && setConfirmPasswordErrors([]);
        } else {
            setIsInitialRender(false);
        }

        // remove keyboard listeners accordingly
        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, [email, emailFocus,
        code, codeFocus,
        password, passwordFocus,
        confirmPassword, confirmPasswordFocus]);

    // Constants used for easy field validation, to validate, check if field is invalid or get errors for invalid field
    const {validate, isFieldInError, getErrorsInField} =
        useValidation({
            state: {
                email: email,
                code: code,
                password: password,
                confirmPassword: confirmPassword
            },
        });

    /**
     * Helper function used to validate fields
     *
     * @param fieldName name of the field to validate
     */
    const fieldValidation = (fieldName: string) => {
        switch (fieldName) {
            case 'email':
                validate({
                    ...({[fieldName]: {minLength: 7, email: true, required: true}}),
                });
                // this is done because the in-built library for emails, does not fully work properly
                if (isFieldInError('email') || !/^([^\s@]+@[^\s@]+\.[^\s@]+)$/.test(email)) {
                    setProgressStepsErrors(true);
                    setEmailErrors([...getErrorsInField('email'), "Invalid email address."]);
                } else {
                    setProgressStepsErrors(false);
                    setEmailErrors([]);
                }
                break;
            case 'code':
                validate({
                    ...({[fieldName]: {minLength: 6, maxLength: 6, required: true}}),
                });
                // this is done because the in-built library for emails, does not fully work properly
                if (isFieldInError('code') || !/^\d{6,6}$/.test(code)) {
                    setProgressStepsErrors(true);
                    setCodeErrors([...getErrorsInField('code'), "Invalid verification code format (######)."]);
                } else {
                    setProgressStepsErrors(false);
                    setCodeErrors([]);
                }
                break;
            case 'password':
                validate({
                    ...({
                        [fieldName]: {
                            minLength: 12,
                            maxLength: 72,
                            required: true,
                        }
                    }),
                });
                if (isFieldInError('password') || !/^((?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{12,72})$/.test(password)) {
                    setProgressStepsErrors(true);
                    setPasswordErrors([...getErrorsInField('password'), "Invalid Password - max 72 chars, min: 12 chars, 1 special character, 1 number, 1 lowerCase, 1 UpperCase."]);
                } else {
                    setProgressStepsErrors(false);
                    setPasswordErrors([]);
                }
                break;
            case 'confirmPassword':
                if (password !== confirmPassword) {
                    setProgressStepsErrors(true);
                    setConfirmPasswordErrors([...getErrorsInField('confirmPassword'), "Passwords do not match."]);
                } else {
                    setProgressStepsErrors(false);
                    setConfirmPasswordErrors([]);
                }
                break;
            default:
                console.log('Unexpected field name!');
        }
    };

    /**
     * Function used to capture the password reset code action
     *
     * @param username username inputted by the user
     * @return {@link Boolean} a flag representing whether the code retrieval was successful or not
     */
    const passwordCodeRetrieval = async (username: string): Promise<boolean> => {
        try {
            await Auth.forgotPassword(username);
            return true;
        } catch (error) {
            console.log(`Unexpected error while confirming identity: ${error}`);
            // @ts-ignore
            setConfirmPasswordErrors([error.message]);
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
    const passwordReset = async (username: string, password: string, code: string) => {
        try {
            await Auth.forgotPasswordSubmit(username, code, password);
            setModalVisible(true);
            setIsErrorModal(false);
            setModalMessage("Thanks for confirming the code! Your password is now changed!");
        } catch (error) {
            console.log(`Unexpected error while resetting password: ${error}`);
            setModalVisible(true);
            setIsErrorModal(true);
            // @ts-ignore
            setModalMessage(error.message);
        }
    };

    // return the component for the Forgot Password page
    return (
        <ImageBackground
            imageStyle={{
                resizeMode: 'stretch'
            }}
            style={commonStyles.image}
            source={require('../../assets/forgot-password-background.png')}>
            <Portal>
                <Modal dismissable={false} visible={modalVisible} onDismiss={() => setModalVisible(false)}
                       contentContainerStyle={[styles.modalContainer, isErrorModal ? {borderColor: 'red'} : {borderColor: 'green'}]}>
                    <Text style={styles.modalParagraph}>{modalMessage}</Text>
                    <Button
                        uppercase={false}
                        style={[styles.modalButton, isErrorModal ? {borderColor: 'red'} : {borderColor: 'green'}]}
                        {...!isErrorModal && {
                            textColor: 'green',
                            buttonColor: '#f2f2f2'
                        }}
                        {...isErrorModal && {
                            icon: 'redo-variant',
                            textColor: 'red',
                            buttonColor: '#f2f2f2'
                        }}
                        mode="outlined"
                        labelStyle={{fontSize: 15}}
                        onPress={() => {
                            isErrorModal ? setModalVisible(false) : navigation.navigate('SignIn', {initialRender: true})
                        }}>
                        {isErrorModal ? `Try Again` : `Sign In`}
                    </Button>
                </Modal>
            </Portal>
            <SafeAreaView style={commonStyles.rowContainer}>
                <ScrollView style={{height: Dimensions.get('window').height}}
                            scrollEnabled={true}
                            persistentScrollbar={false}
                            showsHorizontalScrollIndicator={false}>
                    <KeyboardAwareScrollView
                        enableOnAndroid={true}
                        scrollEnabled={true}
                        contentContainerStyle={[commonStyles.keyboardScrollViewContainer, Platform.OS === 'android' ? {height: Dimensions.get("window").height + androidScrollPadding} : {flex: 1}]}
                        keyboardShouldPersistTaps={'handled'}
                    >
                        <View style={{flex: 1, zIndex: 1}}>
                            <View style={[{alignSelf: 'center'}, Platform.OS === 'android' && {marginTop: '15%'}]}>
                                <Text style={styles.forgotPasswordTitle}>
                                    {resetPasswordDisclaimerShown ? 'Great' : 'Welcome'}
                                </Text>
                                <Text style={styles.forgotPasswordSubtitle}>
                                    {resetPasswordDisclaimerShown ? 'We just sent a code via email' : 'Input your new password'}
                                </Text>
                            </View>
                            <View style={{flex: 1}}>
                                <ProgressSteps
                                    progressBarColor={"grey"}
                                    disabledStepIconColor={"grey"}
                                    labelColor={"#313030"}
                                    activeLabelColor={"#2A3779"}
                                    activeStepIconBorderColor={"#2A3779"}
                                    completedStepIconColor={"#2A3779"}
                                    completedProgressBarColor={"#2A3779"}
                                    completedLabelColor={"#2A3779"}
                                    labelFontSize={16}
                                    labelFontFamily={"Raleway-Medium"}>
                                    <ProgressStep
                                        // note do not enable this unless we need more space for content - need to adjust for Android here
                                        scrollable={false}
                                        label="Profile"
                                        nextBtnStyle={styles.initialNextBtnStyle}
                                        nextBtnTextStyle={styles.btnStyleText}
                                        onNext={async () => {
                                            if (email === "" || password === "" || confirmPassword === "") {
                                                setProfileStepProgressError(true);
                                                setProgressStepsErrors(true);
                                            } else {
                                                fieldValidation("email");
                                                fieldValidation("password");
                                                fieldValidation("confirmPassword");
                                                if (emailErrors.length !== 0 || passwordErrors.length !== 0 || confirmPasswordErrors.length !== 0) {
                                                    setProgressStepsErrors(true);
                                                } else if (emailErrors.length === 0 || passwordErrors.length === 0 || confirmPasswordErrors.length === 0) {
                                                    const codeRetrievedFlag = await passwordCodeRetrieval(email);
                                                    console.log('HERE' + codeRetrievedFlag);
                                                    if (!codeRetrievedFlag) {
                                                        setProgressStepsErrors(true);
                                                    } else {
                                                        setProfileStepProgressError(false);
                                                        setProgressStepsErrors(false);
                                                        setIsPasswordShown(false);
                                                        setIsConfirmPasswordShown(false);
                                                        setResetPasswordDisclaimerShown(true);
                                                    }
                                                }
                                            }
                                        }}
                                        errors={progressStepsErrors}>
                                        <View style={styles.progressStepView}>
                                            <Text style={styles.usernameProgressTitle}>Profile Information</Text>
                                            {profileStepProgressError &&
                                                <Text style={styles.errorMessageMain}>Please fill out the information
                                                    below!</Text>}
                                            {/* @ts-ignore */}
                                            <TextInput
                                                onChangeText={(value: React.SetStateAction<string>) => {
                                                    setIsEmailFocus(true);
                                                    setProfileStepProgressError(false);
                                                    setEmail(value);
                                                }}
                                                value={email}
                                                style={emailFocus ? styles.initialTextInputFocus : styles.initialTextInput}
                                                onFocus={() => {
                                                    setIsEmailFocus(true);
                                                }}
                                                label="Email"
                                                textColor={"#313030"}
                                                underlineColor={"#f2f2f2"}
                                                activeUnderlineColor={"#313030"}
                                                left={<TextInput.Icon icon="email" iconColor="#313030"/>}
                                            />
                                            {(emailErrors.length > 0 && !profileStepProgressError) ?
                                                <Text style={styles.errorMessage}>{emailErrors[0]}</Text> : <></>}

                                            {/* @ts-ignore */}
                                            <TextInput
                                                onChangeText={(value: React.SetStateAction<string>) => {
                                                    setIsPasswordFocus(true);
                                                    setProfileStepProgressError(false);
                                                    setPassword(value);
                                                }}
                                                value={password}
                                                style={passwordFocus ? styles.textInputFocus : styles.textInput}
                                                onFocus={() => {
                                                    setIsPasswordFocus(true);
                                                }}
                                                label="Password"
                                                secureTextEntry={!passwordShown}
                                                textColor={"#313030"}
                                                underlineColor={"#f2f2f2"}
                                                activeUnderlineColor={"#313030"}
                                                right={<TextInput.Icon icon="eye"
                                                                       iconColor={passwordShown ? "#A2B000" : "#313030"}
                                                                       onPress={() => setIsPasswordShown(!passwordShown)}/>}
                                                left={<TextInput.Icon icon="lock" iconColor="#313030"/>}
                                            />
                                            {(passwordErrors.length > 0 && !profileStepProgressError) ?
                                                <Text style={styles.errorMessage}>{passwordErrors[0]}</Text> : <></>}
                                            {/* @ts-ignore */}
                                            <TextInput
                                                onChangeText={(value: React.SetStateAction<string>) => {
                                                    setIsConfirmPasswordFocus(true);
                                                    setProfileStepProgressError(false);
                                                    setConfirmPassword(value);
                                                }}
                                                value={confirmPassword}
                                                style={confirmPasswordFocus ? styles.textInputFocus : styles.textInput}
                                                onFocus={() => {
                                                    setIsConfirmPasswordFocus(true);
                                                }}
                                                label="Confirm Password"
                                                secureTextEntry={!confirmPasswordShown}
                                                textColor={"#313030"}
                                                underlineColor={"#f2f2f2"}
                                                activeUnderlineColor={"#313030"}
                                                right={<TextInput.Icon icon="eye"
                                                                       iconColor={confirmPasswordShown ? "#A2B000" : "#313030"}
                                                                       onPress={() => setIsConfirmPasswordShown(!confirmPasswordShown)}/>}
                                                left={<TextInput.Icon icon="lock" iconColor="#313030"/>}
                                            />
                                            {(confirmPasswordErrors.length > 0 && !profileStepProgressError) ?
                                                <Text style={styles.errorMessage}>{confirmPasswordErrors[0]}</Text> : <></>}
                                        </View>
                                    </ProgressStep>

                                    <ProgressStep
                                        // note do not enable this unless we need more space for content
                                        scrollable={false}
                                        label="Verification"
                                        nextBtnStyle={styles.nextBtnStyle}
                                        nextBtnTextStyle={styles.btnStyleText}
                                        finishBtnText={""}
                                        previousBtnText={"Back"}
                                        previousBtnStyle={styles.lastPrevBtnStyle}
                                        previousBtnTextStyle={styles.btnStyleText}
                                        errors={progressStepsErrors}
                                        onPrevious={() => {
                                            setCodeVerificationStepProgressError(false);
                                            setResetPasswordDisclaimerShown(false);
                                        }}>
                                        <View style={styles.progressStepView}>

                                            <Text style={styles.codeVerificationProgressTitle}>Code Verification</Text>
                                            {codeVerificationStepProgressError &&
                                                <Text style={styles.errorMessageMain}>Please fill out the information
                                                    below!</Text>}
                                            {/* @ts-ignore */}
                                            <TextInput
                                                onChangeText={(value: React.SetStateAction<string>) => {
                                                    setIsCodeFocus(true);
                                                    setCodeVerificationStepProgressError(false);
                                                    setCode(value);
                                                }}
                                                value={code}
                                                style={codeFocus ? styles.initialTextInputFocus : styles.initialTextInput}
                                                onFocus={() => {
                                                    setIsCodeFocus(true);
                                                }}
                                                label="Verification Code"
                                                textColor={"#313030"}
                                                underlineColor={"#f2f2f2"}
                                                activeUnderlineColor={"#313030"}
                                                left={<TextInput.Icon icon="dialpad" iconColor="#313030"/>}
                                            />
                                            {(codeErrors.length > 0 && !codeVerificationStepProgressError) ?
                                                <Text style={styles.errorMessage}>{codeErrors[0]}</Text> : <></>}
                                        </View>
                                    </ProgressStep>
                                </ProgressSteps>
                            </View>
                        </View>
                        <View style={[styles.bottomView, resetPasswordDisclaimerShown ? {marginTop: '-5%'} : {marginTop: `-${Dimensions.get('window').height/50}%`}]}>
                            {resetPasswordDisclaimerShown &&
                                <Button
                                    uppercase={false}
                                    style={styles.resetPasswordButton}
                                    textColor={"#f2f2f2"}
                                    buttonColor={"#2A3779"}
                                    mode="outlined"
                                    labelStyle={{fontSize: 18}}
                                    onPress={async () => {
                                        if (code === "") {
                                            setCodeVerificationStepProgressError(true);
                                            setProgressStepsErrors(true);
                                        } else {
                                            fieldValidation("code");
                                            if (codeErrors.length !== 0) {
                                                setProgressStepsErrors(true);
                                            } else if (codeErrors.length === 0) {
                                                setCodeVerificationStepProgressError(false);
                                                setProgressStepsErrors(false);
                                                await passwordReset(email, password, code);
                                            }
                                        }
                                    }}>
                                    Reset Password
                                </Button>
                            }
                            <View>
                                <Image source={ForgotPasswordLogo} style={[styles.forgotPasswordLogo, {height: Dimensions.get('window').height/6, width: Dimensions.get('window').width/4}]}/>
                                <Text style={styles.forgotPasswordFooter}>
                                    Remember your password ?
                                    <Text style={styles.forgotPasswordFooterButton}
                                          onPress={() => {
                                              navigation.navigate('SignIn', {initialRender: true})
                                          }}> Sign in</Text>
                                </Text>
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </ScrollView>
            </SafeAreaView>
        </ImageBackground>
    );
}
