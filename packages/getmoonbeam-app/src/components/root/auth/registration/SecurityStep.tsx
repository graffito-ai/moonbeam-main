import React, {useEffect, useState} from "react";
import {styles} from "../../../../styles/registration.module";
import {Text, TextInput} from "react-native-paper";
import {View} from "react-native";
import {
    accountCreationDisclaimerCheckState, amplifySignUpProcessErrorsState, authRegistrationNavigation,
    registrationBackButtonShown, registrationConfirmationPasswordErrorsState, registrationConfirmationPasswordState,
    registrationMainErrorState, registrationPasswordErrorsState, registrationPasswordState
} from "../../../../recoil/AuthAtom";
import {useRecoilState} from "recoil";
import {Checkbox} from "expo-checkbox";
import {FieldValidator} from "../../../../utils/FieldValidator";

/**
 * SecurityStep component.
 *
 * @constructor constructor for the component.
 */
export const SecurityStep = () => {
    // constants used to keep track of local component state
    const [passwordFocus, setIsPasswordFocus] = useState<boolean>(false);
    const [confirmPasswordFocus, setIsConfirmPasswordFocus] = useState<boolean>(false);
    const [isPasswordShown, setIsPasswordShown] = useState<boolean>(false);
    const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState<boolean>(false);
    // constants used to keep track of shared states
    const [navigation, ] = useRecoilState(authRegistrationNavigation);
    const [amplifySignUpErrors, setAmplifySignUpErrors] = useRecoilState(amplifySignUpProcessErrorsState);
    const [password, setPassword] = useRecoilState(registrationPasswordState);
    const [confirmPassword, setConfirmPassword] = useRecoilState(registrationConfirmationPasswordState);
    const [passwordErrors, setPasswordErrors] = useRecoilState(registrationPasswordErrorsState);
    const [confirmPasswordErrors, setConfirmPasswordErrors] = useRecoilState(registrationConfirmationPasswordErrorsState);
    const [registrationMainError, setRegistrationMainError] = useRecoilState(registrationMainErrorState);
    const [, setIsBackButtonShown] = useRecoilState(registrationBackButtonShown);
    const [accountRegistrationDisclaimer, setAccountRegistrationDisclaimer] = useRecoilState(accountCreationDisclaimerCheckState);

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
    }, [password, passwordFocus, confirmPassword, confirmPasswordFocus]);

    // return the component for the SecurityStep, part of the Registration page
    return (
        <>
            {registrationMainError
                ? <Text style={styles.errorMessage}>Please fill out the information below!</Text>
                : (passwordErrors.length !== 0 && !registrationMainError)
                    ? <Text style={styles.errorMessage}>{passwordErrors[0]}</Text>
                    : (confirmPasswordErrors.length !== 0 && !registrationMainError)
                        ? <Text style={styles.errorMessage}>{confirmPasswordErrors[0]}</Text>
                        : (amplifySignUpErrors.length !== 0 && !registrationMainError)
                            ? <Text style={styles.errorMessage}>{amplifySignUpErrors[0]}</Text>
                            : <></>
            }
            <View style={styles.militaryRegistrationView}>
                <TextInput
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
                        setRegistrationMainError(false);
                        setAmplifySignUpErrors([]);
                        setPassword(value);
                    }}
                    onBlur={() => {
                        setIsPasswordFocus(false);
                        setIsBackButtonShown(true);
                    }}
                    value={password}
                    secureTextEntry={!isPasswordShown}
                    contentStyle={styles.textInputContentStyle}
                    style={passwordFocus ? styles.textInputFocus : styles.textInput}
                    onFocus={() => {
                        setIsPasswordFocus(true);
                        setIsBackButtonShown(false);
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
                        setAmplifySignUpErrors([]);
                        setRegistrationMainError(false);
                        setConfirmPassword(value);
                    }}
                    onBlur={() => {
                        setIsConfirmPasswordFocus(false);
                        setIsBackButtonShown(true);
                    }}
                    value={confirmPassword}
                    secureTextEntry={!isConfirmPasswordShown}
                    contentStyle={styles.textInputContentStyle}
                    style={confirmPasswordFocus ? styles.textInputFocus : styles.textInput}
                    onFocus={() => {
                        setIsConfirmPasswordFocus(true);
                        setIsBackButtonShown(false);
                    }}
                    placeholder={'Required (must match Password)'}
                    label="Confirm Password"
                    textColor={"#FFFFFF"}
                    left={<TextInput.Icon icon="lock" iconColor="#FFFFFF"/>}
                    right={<TextInput.Icon icon="eye"
                                           iconColor={isConfirmPasswordShown ? "#F2FF5D" : "#FFFFFF"}
                                           onPress={() => setIsConfirmPasswordShown(!isConfirmPasswordShown)}/>}
                />
                <View style={styles.disclaimerView}>
                    <Checkbox
                        style={styles.disclaimerCheckbox}
                        color={accountRegistrationDisclaimer ? 'blue' : '#F2FF5D'}
                        value={accountRegistrationDisclaimer}
                        onValueChange={(newValue) => {
                            setAccountRegistrationDisclaimer(newValue);
                        }}
                    />
                    <Text
                        style={styles.disclaimerText}>{'By checking this box, and signing up for an account with Moonbeam, you acknowledge and certify that you have read, and therefore agree to our '}
                        <Text style={styles.disclaimerTextHighlighted}
                              onPress={() => {
                                  // navigate to the Documents Viewer
                                  navigation && navigation.navigate('DocumentsViewer', {
                                      name: 'privacy-policy.pdf',
                                      privacyFlag: false
                                  });
                              }}>Privacy Policy</Text>{' and'}
                        <Text style={styles.disclaimerTextHighlighted}
                              onPress={() => {
                                  // navigate to the Documents Viewer
                                  navigation && navigation.navigate('DocumentsViewer', {
                                      name: 'terms-and-conditions.pdf',
                                      privacyFlag: false
                                  });
                              }}> Terms & Conditions.</Text>
                    </Text>
                </View>
            </View>
        </>
    );
}
