import React, {useEffect, useState} from "react";
import {styles} from "../../../../styles/registration.module";
import {Text, TextInput} from "react-native-paper";
import {Linking, View} from "react-native";
import {
    accountCreationDisclaimerCheckState,
    amplifySignUpProcessErrorsState,
    registrationBackButtonShown,
    registrationConfirmationPasswordErrorsState,
    registrationConfirmationPasswordState,
    registrationMainErrorState,
    registrationPasswordErrorsState,
    registrationPasswordState, userIsAuthenticatedState
} from "../../../../recoil/AuthAtom";
import {useRecoilState} from "recoil";
import {Checkbox} from "expo-checkbox";
import {FieldValidator} from "../../../../utils/FieldValidator";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {logEvent} from "../../../../utils/AppSync";
import {LoggingLevel} from "@moonbeam/moonbeam-models";

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
    const [userIsAuthenticated, ] = useRecoilState(userIsAuthenticatedState);
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
                ? <Text style={[styles.errorMessage, {bottom: hp(1)}]}>Please fill out the information below!</Text>
                : (passwordErrors.length !== 0 && !registrationMainError)
                    ? <Text style={[styles.errorMessage, {bottom: hp(1)}]}>{passwordErrors[0]}</Text>
                    : (confirmPasswordErrors.length !== 0 && !registrationMainError)
                        ? <Text style={[styles.errorMessage, {bottom: hp(1)}]}>{confirmPasswordErrors[0]}</Text>
                        : (amplifySignUpErrors.length !== 0 && !registrationMainError)
                            ? <Text style={[styles.errorMessage, {bottom: hp(1)}]}>{amplifySignUpErrors[0]}</Text>
                            : <></>
            }
            <View style={styles.securityRegistrationView}>
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
                    contentStyle={[styles.textInputContentStyle, {width: wp(60)}]}
                    style={passwordFocus ? styles.textInputFocus : styles.textInput}
                    onFocus={() => {
                        setIsPasswordFocus(true);
                        setIsBackButtonShown(false);
                    }}
                    placeholder={'Required'}
                    label="Password"
                    textColor={"#FFFFFF"}
                    left={
                        <TextInput.Icon icon="lock" size={hp(2.8)} style={{marginTop: hp(2)}} color="#FFFFFF"/>
                    }
                    right={<TextInput.Icon icon="eye"
                                           size={hp(2.8)} style={{marginTop: hp(2)}}
                                           color={isPasswordShown ? "#F2FF5D" : "#FFFFFF"}
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
                    contentStyle={[styles.textInputContentStyle, {width: wp(60)}]}
                    style={confirmPasswordFocus ? styles.textInputFocus : styles.textInput}
                    onFocus={() => {
                        setIsConfirmPasswordFocus(true);
                        setIsBackButtonShown(false);
                    }}
                    placeholder={'Required (must match Password)'}
                    label="Confirm Password"
                    textColor={"#FFFFFF"}
                    left={
                        <TextInput.Icon icon="lock" size={hp(2.8)} style={{marginTop: hp(2)}} color="#FFFFFF"/>
                    }
                    right={<TextInput.Icon icon="eye"
                                           size={hp(2.8)} style={{marginTop: hp(2)}}
                                           color={isConfirmPasswordShown ? "#F2FF5D" : "#FFFFFF"}
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
                                  // open the privacy policy document
                                  const privacyPolicyUrl = 'https://www.moonbeam.vet/privacy-policy'
                                  Linking.canOpenURL(privacyPolicyUrl).then(supported => {
                                      if (supported) {
                                          Linking.openURL(privacyPolicyUrl).then(() => {
                                          });
                                      } else {
                                          const message = `Don't know how to open URI: ${privacyPolicyUrl}`;
                                          console.log(message);
                                          logEvent(message, LoggingLevel.Warning, userIsAuthenticated).then(() => {});
                                      }
                                  });
                              }}>Privacy Policy</Text>{' and'}
                        <Text style={styles.disclaimerTextHighlighted}
                              onPress={() => {
                                  // open the terms and conditions document
                                  const termsAndConditionsUrl = 'https://www.moonbeam.vet/terms-and-conditions'
                                  Linking.canOpenURL(termsAndConditionsUrl).then(supported => {
                                      if (supported) {
                                          Linking.openURL(termsAndConditionsUrl).then(() => {
                                          });
                                      } else {
                                          const message = `Don't know how to open URI: ${termsAndConditionsUrl}`;
                                          console.log(message);
                                          logEvent(message, LoggingLevel.Warning, userIsAuthenticated).then(() => {});
                                      }
                                  });
                              }}> Terms & Conditions.</Text>
                        {'\nMoving forward with the account registration, represents your consent to Moonbeam Finance storing any personal data that is and/or will be collected during this process.'}
                    </Text>
                </View>
            </View>
        </>
    );
}
