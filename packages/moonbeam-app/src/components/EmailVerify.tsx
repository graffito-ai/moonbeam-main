import React, {useEffect, useState} from "react";
import {EmailVerifyProps} from "../models/RootProps";
import {Dimensions, Image, ImageBackground, Text, View} from "react-native";
import {commonStyles} from "../styles/common.module";
import {styles} from "../styles/emailVerify.module";
// @ts-ignore
import CongratulationsSplash from '../../assets/congratulations.png';
import {Button, Modal, Portal, TextInput} from "react-native-paper";
import {Auth} from "aws-amplify";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
// @ts-ignore
import {useValidation} from 'react-native-form-validator';

/**
 * Email Verification component.
 */
export const EmailVerify = ({navigation, route}: EmailVerifyProps) => {
    // state driven key-value pairs for UI related elements
    const [confirmationCodeFocus, setIsConfirmationCodeFocus] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalMessage, setModalMessage] = useState<string>("");
    const [isErrorModal, setIsErrorModal] = useState<boolean>(false);
    const [isResendModal, setIsResendModal] = useState<boolean>(false);
    // state driven key-value pairs for forgot password form values
    const [code, setCode] = useState<string>("");
    const [codeErrors, setCodeErrors] = useState<any[]>([]);
    const [profileCodeVerificationMainError, setProfileCodeVerificationMainError] = useState<boolean>(false);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        if (confirmationCodeFocus && code !== "") {
            fieldValidation("code");
        }
        code === "" && setCodeErrors([]);
    }, [code, confirmationCodeFocus]);


    // Constants used for easy field validation, to validate, check if field is invalid or get errors for invalid field
    const {validate, isFieldInError, getErrorsInField} =
        useValidation({
            state: {
                code: code
            },
        });

    /**
     * Helper function used to validate fields
     *
     * @param fieldName name of the field to validate
     */
    const fieldValidation = (fieldName: string) => {
        switch (fieldName) {
            case 'code':
                validate({
                    ...({[fieldName]: {minLength: 6, maxLength: 6, required: true}}),
                });
                // this is done because the in-built library for emails, does not fully work properly
                if (isFieldInError('code') || !/^\d{6,6}$/.test(code)) {
                    // setProgressStepsErrors(true);
                    setCodeErrors([...getErrorsInField('code'), "Invalid verification code format (######)."]);
                } else {
                    // setProgressStepsErrors(false);
                    setCodeErrors([]);
                }
                break;
            default:
                console.log('Unexpected field name!');
        }
    };

    /**
     * Function used to capture the confirmation button press
     *
     * @param code verification code inputted by the user
     */
    const onConfirmPressed = async (code: string) => {
        try {
            await Auth.confirmSignUp(route.params.username, code);
            setModalMessage("Thanks for confirming the code! Your email address is now verified!");
            setModalVisible(true);
            setIsResendModal(false);
            setIsErrorModal(false);
        } catch (error) {
            // @ts-ignore
            setModalMessage(error.message);
            setModalVisible(true);
            setIsErrorModal(true);
            setIsResendModal(false);
            console.log(`Unexpected error while confirming sign up code :, ${error}`);
        }
    };

    /**
     * Function used to capture the confirmation button press
     */
    const onResendCodePressed = async () => {
        try {
            await Auth.resendSignUp(route.params.username);
            setModalMessage("Re-sending verification code! You should receive an email shortly");
            setModalVisible(true);
            setIsResendModal(true);
            setIsErrorModal(false);
        } catch (error) {
            // @ts-ignore
            setModalMessage(error.message);
            setModalVisible(true);
            setIsErrorModal(true);
            setIsResendModal(false);
            console.log(`Unexpected error while resending verification code: ${error}`);
        }
    };

    // return the component for the EmailVerification page
    return (
        <ImageBackground
            imageStyle={{
                resizeMode: 'stretch'
            }}
            style={commonStyles.image}
            source={require('../../assets/login-background.png')}>
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
                        {...isResendModal && {
                            icon: 'redo-variant'
                        }}
                        mode="outlined"
                        labelStyle={{fontSize: 15}}
                        onPress={() => {
                            (isErrorModal || isResendModal) ? setModalVisible(false) : navigation.navigate('SignIn', {initialRender: true})
                        }}>
                        {(isErrorModal || isResendModal) ? `Try Again` : `Sign In`}
                    </Button>
                </Modal>
            </Portal>
            <KeyboardAwareScrollView
                contentContainerStyle={commonStyles.container}
                keyboardShouldPersistTaps={'handled'}
            >
                <View style={styles.mainView}>
                    <View style={styles.topView}>
                        <Image source={CongratulationsSplash} style={[styles.congratulationsSplash, {height: Dimensions.get('window').height/4 ,width: Dimensions.get('window').width/2.5, alignSelf: 'center'}]}/>
                    </View>
                    <View>
                        <Text style={styles.emailVerifyTitle}>Congratulations</Text>
                        <Text style={styles.emailVerifySubtitle}>Verify your email to login</Text>
                    </View>
                    {profileCodeVerificationMainError &&
                        <Text style={styles.errorMessageMain}>Please fill out the information below!</Text>}
                    {/* @ts-ignore */}
                    <TextInput
                        onChangeText={(value: React.SetStateAction<string>) => {
                            setIsConfirmationCodeFocus(true);
                            setProfileCodeVerificationMainError(false);
                            setCode(value);
                        }}
                        value={code}
                        style={confirmationCodeFocus ? styles.textInputFocus : styles.textInput}
                        onFocus={() => {
                            setIsConfirmationCodeFocus(true);
                        }}
                        label="Verification Code"
                        textColor={"#313030"}
                        underlineColor={"#f2f2f2"}
                        activeUnderlineColor={"#313030"}
                        left={<TextInput.Icon icon="dialpad" iconColor="#313030"/>}
                    />
                    {(codeErrors.length > 0 && !profileCodeVerificationMainError) ?
                        <Text style={styles.errorMessage}>{codeErrors[0]}</Text> : <></>}

                    <Button
                        uppercase={false}
                        onPress={() => {
                            if (code === "") {
                                setProfileCodeVerificationMainError(true);
                            } else {
                                fieldValidation("code");
                                if (codeErrors.length === 0) {
                                    setProfileCodeVerificationMainError(false);
                                    onConfirmPressed(code);
                                }
                            }
                        }}
                        style={styles.confirmButton}
                        textColor={"#f2f2f2"}
                        buttonColor={"#2A3779"}
                        mode="outlined"
                        labelStyle={{fontSize: 18}}>
                        Confirm
                    </Button>
                    <Button
                        uppercase={false}
                        onPress={() => onResendCodePressed()}
                        style={styles.resendCodeButton}
                        textColor={"#f2f2f2"}
                        buttonColor={"#2A3779"}
                        mode="outlined"
                        labelStyle={{fontSize: 18}}>
                        Resend Code
                    </Button>
                    <View style={styles.bottomView}>
                        <Text style={styles.backToSignInFooter}>Back to
                            <Text style={styles.backToSignInButton}
                                  onPress={() => {
                                      navigation.navigate('SignIn', {initialRender: true})
                                  }}> Sign in</Text>
                        </Text>
                    </View>
                    <View style={styles.disclaimerView}>
                        <Text style={styles.disclaimerText}>
                            Verification codes will <Text style={styles.disclaimerModified}>expire</Text>. Please refer
                            to the <Text style={styles.disclaimerModified}>latest</Text> code, sent to you by email.
                        </Text>
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </ImageBackground>
    );
};

