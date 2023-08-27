import React, {useEffect, useState} from "react";
// @ts-ignore
import FaceIDIcon from '../../../../../../assets/face-id-icon.png';
import {ResetPasswordProps} from "../../../../../models/props/SettingsProps";
import {useRecoilState} from "recoil";
import {appDrawerHeaderShownState, drawerSwipeState} from "../../../../../recoil/AppDrawerAtom";
import {CognitoUser} from "amazon-cognito-identity-js";
import {Auth} from "aws-amplify";
import {Spinner} from "../../../../common/Spinner";
import {Dimensions, SafeAreaView, StyleSheet, TouchableOpacity, View} from "react-native";
import {Dialog, Portal, Text, TextInput} from "react-native-paper";
import {commonStyles} from "../../../../../styles/common.module";
import {Button} from "@rneui/base";
import {styles} from "../../../../../styles/resetPw.module";
import {LinearGradient} from "expo-linear-gradient";
import {FieldValidator} from "../../../../../utils/FieldValidator";

/**
 * ResetPassword component
 *
 * @constructor constructor for the component
 */
export const ResetPassword = ({}: ResetPasswordProps) => {
    // constants used to keep track of local component state
    const [isReady, setIsReady] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalCustomMessage, setModalCustomMessage] = useState<string>("");
    const [modalButtonMessage, setModalButtonMessage] = useState<string>("");
    const [resetPasswordError, setResetPasswordError] = useState<boolean>(false);
    const [oldPassword, setOldPassword] = useState<string>("");
    const [oldPasswordErrors, setOldPasswordErrors] = useState<string[]>([]);
    const [oldPasswordFocus, setIsOldPasswordFocus] = useState<boolean>(false);
    const [isOldPasswordShown, setIsOldPasswordShown] = useState<boolean>(false);
    const [password, setPassword] = useState<string>("");
    const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
    const [passwordFocus, setIsPasswordFocus] = useState<boolean>(false);
    const [isPasswordShown, setIsPasswordShown] = useState<boolean>(false);
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [confirmPasswordErrors, setConfirmPasswordErrors] = useState<string[]>([]);
    const [confirmPasswordFocus, setIsConfirmPasswordFocus] = useState<boolean>(false);
    const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState<boolean>(false);
    // constants used to keep track of shared states
    const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);
    const [, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);

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
        // disable the swipe for the drawer
        setDrawerSwipeEnabled(false);

        // hide the app drawer header on load
        setAppDrawerHeaderShown(false);

        // perform field validations on every state change, for the specific field that is being validated
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
            setConfirmPasswordErrors(["New Passwords do not match."]);
        }
        // for cases when old password is the same as new password
        if (oldPassword !== "" && password !== "" && confirmPassword !== "" && oldPassword === password) {
            // @ts-ignore
            setOldPasswordErrors(["Your New Password cannot be the same as the old one."]);
        }
    }, [oldPassword, oldPasswordFocus,
        password, passwordFocus,
        confirmPassword, confirmPasswordFocus]);

    /**
     * Function used to update a user's password. This will also send
     * the user a code to the new email that they provide.
     *
     * @param oldPassword old password for account
     * @param newPassword new password for account
     *
     * @return a {@link Promise} containing a {@link Boolean} representing a flag of whether
     * the password was successfully updated or not
     */
    const updatePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
        try {
            // set the loader on button press
            setIsReady(false);

            // retrieve the current authenticated user
            const user: CognitoUser = await Auth.currentAuthenticatedUser();

            // if there is no authenticated user, then redirect user to login page
            if (user) {
                // update the user attributes accordingly - this will also trigger a code
                const changePasswordResult = await Auth.changePassword(user, oldPassword, newPassword);

                // check if the update was successful or not
                if (changePasswordResult) {
                    console.log(JSON.stringify(changePasswordResult));

                    // release the loader on button press
                    setIsReady(true);
                    return true;
                } else {
                    const errorMessage = `Error while resetting password!`;
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
            let errorMessage = `Error resetting password!`;
            console.log(`${errorMessage} - ${error}`);

            // Filter the error based on the message received, in order to properly narrow down the reason for the failure
            // @ts-ignore
            if (error && error.code && error.code === 'NotAuthorizedException') {
               errorMessage = `Incorrect old password!`;
            }

            setModalCustomMessage(errorMessage);
            setModalButtonMessage('Try Again!');
            setModalVisible(true);

            // release the loader on button press
            setIsReady(true);
            return false;
        }
    }

    // return the component for the ResetPassword page
    return (
        <>
            {!isReady ?
                <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                :
                <>
                    <Portal>
                        <Dialog style={[commonStyles.dialogStyle, {backgroundColor: '#313030'}]} visible={modalVisible}
                                onDismiss={() => setModalVisible(false)}>
                            <Dialog.Icon icon="alert" color={"#F2FF5D"}
                                         size={Dimensions.get('window').height / 14}/>
                            <Dialog.Title
                                style={commonStyles.dialogTitle}>{modalButtonMessage === 'Ok' ? 'Great' : 'We hit a snag!'}</Dialog.Title>
                            <Dialog.Content>
                                <Text
                                    style={commonStyles.dialogParagraph}>{modalCustomMessage}</Text>
                            </Dialog.Content>
                            <Dialog.Actions>
                                <Button buttonStyle={commonStyles.dialogButton}
                                        titleStyle={commonStyles.dialogButtonText}
                                        onPress={() => {
                                            setModalVisible(false);
                                        }}>
                                    {modalButtonMessage}
                                </Button>
                            </Dialog.Actions>
                        </Dialog>
                    </Portal>
                    <SafeAreaView style={styles.mainContainer}>
                        <View style={[styles.topContainer, StyleSheet.absoluteFill]}>
                            <LinearGradient
                                style={{height: '100%'}}
                                start={{x: 0.5, y: 0.05}}
                                end={{x: 0.5, y: 1}}
                                colors={['#313030', 'transparent']}>
                                <View style={styles.topTextView}>
                                    <Text style={styles.resetPwTitle}>Create a new Password</Text>
                                    <Text style={styles.resetPwSubtitle}>Your new password must be different than your
                                        existing one.</Text>
                                </View>
                                <View style={styles.inputFieldsView}>
                                    {resetPasswordError
                                        ?
                                        <Text style={styles.errorMessage}>Please fill out the information below!</Text>
                                        : (oldPasswordErrors.length !== 0 && !resetPasswordError)
                                            ? <Text style={styles.errorMessage}>{oldPasswordErrors[0]}</Text>
                                            : (passwordErrors.length !== 0 && !resetPasswordError)
                                                ? <Text style={styles.errorMessage}>{passwordErrors[0]}</Text>
                                                : (confirmPasswordErrors.length !== 0 && !resetPasswordError)
                                                    ?
                                                    <Text style={styles.errorMessage}>{confirmPasswordErrors[0]}</Text>
                                                    : <></>
                                    }
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
                                            setIsOldPasswordFocus(true);
                                            setResetPasswordError(false);
                                            setOldPasswordErrors([]);

                                            setOldPassword(value);
                                        }}
                                        onBlur={() => {
                                            setIsOldPasswordFocus(false);
                                        }}
                                        value={oldPassword}
                                        secureTextEntry={!isOldPasswordShown}
                                        contentStyle={styles.textInputContentStyle}
                                        style={oldPasswordFocus ? styles.textInputFocus : styles.textInput}
                                        onFocus={() => {
                                            setIsOldPasswordFocus(true);
                                        }}
                                        placeholder={'Required'}
                                        label="Old Password"
                                        textColor={"#FFFFFF"}
                                        left={<TextInput.Icon icon="lock" iconColor="#FFFFFF"/>}
                                        right={<TextInput.Icon icon="eye"
                                                               iconColor={isOldPasswordShown ? "#F2FF5D" : "#FFFFFF"}
                                                               onPress={() => setIsOldPasswordShown(!isOldPasswordShown)}/>}
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
                                            setIsPasswordFocus(true);
                                            setResetPasswordError(false);
                                            setPasswordErrors([]);

                                            setPassword(value);
                                        }}
                                        onBlur={() => {
                                            setIsPasswordFocus(false);
                                        }}
                                        value={password}
                                        secureTextEntry={!isPasswordShown}
                                        contentStyle={styles.textInputContentStyle}
                                        style={passwordFocus ? styles.textPasswordInputFocus : styles.textPasswordInput}
                                        onFocus={() => {
                                            setIsPasswordFocus(true);
                                        }}
                                        placeholder={'Required'}
                                        label="New Password"
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
                                            setResetPasswordError(false);
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
                                        placeholder={'Must match New Password'}
                                        label="Confirm New Password"
                                        textColor={"#FFFFFF"}
                                        left={<TextInput.Icon icon="lock" iconColor="#FFFFFF"/>}
                                        right={<TextInput.Icon icon="eye"
                                                               iconColor={isConfirmPasswordShown ? "#F2FF5D" : "#FFFFFF"}
                                                               onPress={() => setIsConfirmPasswordShown(!isConfirmPasswordShown)}/>}
                                    />
                                </View>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={async () => {
                                        if (oldPassword === "" || password === "" || confirmPassword === "" ||
                                        oldPasswordErrors.length !== 0 || passwordErrors.length !== 0 || confirmPasswordErrors.length !== 0) {
                                            // only populate main error if there are no other errors showing
                                            if (oldPasswordErrors.length === 0 || passwordErrors.length === 0 || confirmPasswordErrors.length === 0) {
                                                setResetPasswordError(true);
                                            }
                                        } else {
                                            // validations passed, perform the password reset action
                                            const passwordResetFlag = await updatePassword(oldPassword, password);
                                            if (passwordResetFlag) {
                                                // shown a successful modal
                                                setModalButtonMessage('Ok');
                                                setModalCustomMessage('Your password has been successfully changed!');
                                                setModalVisible(true);

                                                // clear the fields for a success
                                                setOldPassword('');
                                                setIsOldPasswordFocus(false);
                                                setPassword('');
                                                setIsPasswordFocus(false);
                                                setConfirmPassword('');
                                                setIsConfirmPasswordFocus(false);
                                            }
                                        }
                                    }}
                                >
                                    <Text
                                        style={styles.buttonText}>Reset Password</Text>
                                </TouchableOpacity>

                            </LinearGradient>
                        </View>
                    </SafeAreaView>
                </>
            }
        </>
    );
}
