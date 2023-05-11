import React, {useEffect, useState} from "react";
import {Image, ImageBackground, View} from "react-native";
import {commonStyles} from '../../styles/common.module';
import {styles} from '../../styles/signIn.module';
import {SignInProps} from "../../models/AuthenticationProps";
import {Button, Text, TextInput} from "react-native-paper";
import {FieldValidator} from "../../utils/FieldValidator";
// @ts-ignore
import LoginLogo from '../../../assets/login-logo.png';

/**
 * SignInComponent component.
 */
export const SignInComponent = ({route, navigation}: SignInProps) => {
    // constants used to keep track of local component state
    const [email, setEmail] = useState<string>("");
    const [emailErrors, setEmailErrors] = useState<any[]>([]);
    const [emailFocus, setIsEmailFocus] = useState<boolean>(false);
    const [password, setPassword] = useState<string>("");
    const [passwordErrors, setPasswordErrors] = useState<any[]>([]);
    const [passwordFocus, setIsPasswordFocus] = useState<boolean>(false);
    const [loginMainError, setLoginMainError] = useState<boolean>(false);
    const [passwordShown, setIsPasswordShown] = useState<boolean>(false);
    const [isInitialRender, setIsInitialRender] = useState<boolean>(route.params.initialRender);

    // initializing the field validator, to be used for validating form field values
    const fieldValidator = new FieldValidator({
        email: email,
        password: password
    })

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        if (!isInitialRender) {
            // perform field validations on every state change, for the specific field that is being validated
            if (emailFocus && email !== "") {
                fieldValidator.validateField(email, "email", setEmailErrors);
            }
            email === "" && setEmailErrors([]);

            if (passwordFocus && password !== "") {
                fieldValidator.validateField(password, "password", setPasswordErrors);
            }
            password === "" && setPasswordErrors([]);
        } else {
            setIsInitialRender(false);
        }
    }, [email, emailFocus, password, passwordFocus]);

    // return the component for the SignIn page
    return (
        <>
            <ImageBackground
                style={[commonStyles.image]}
                imageStyle={{
                    resizeMode: 'stretch'
                }}
                source={require('../../../assets/backgrounds/authentication-gradient.png')}>
                <View style={commonStyles.rowContainer}>
                    <View style={styles.topContainer}>
                        <Text style={styles.greetingTitle}>Hello</Text>
                        <Text style={styles.gettingSubtitle}>Get ready to <Text
                            style={styles.gettingSubtitleHighlighted}>Earn</Text></Text>
                        <Image resizeMode={'cover'}
                               source={require('../../../assets/art/authentication-logos.png')}
                               style={styles.topContainerImage}/>
                    </View>
                    <View style={[styles.bottomContainer]}>
                        <Text style={styles.bottomTitle}>Login</Text>
                        {   loginMainError ?
                            <Text style={styles.errorMessage}>Please fill out the information below!</Text>
                            : (emailErrors.length && !loginMainError) ?
                            <Text style={styles.errorMessage}>{emailErrors[0]}</Text> :
                            <Text style={styles.errorMessage}>{passwordErrors[0]}</Text>
                        }
                        <TextInput
                            placeholderTextColor={'#D9D9D9'}
                            activeUnderlineColor={'#F2FF5D'}
                            underlineColor={'#D9D9D9'}
                            outlineColor={'#D9D9D9'}
                            activeOutlineColor={'#F2FF5D'}
                            selectionColor={'#F2FF5D'}
                            mode={'outlined'}
                            onChangeText={(value: React.SetStateAction<string>) => {
                                setIsEmailFocus(true);
                                setLoginMainError(false);
                                setEmail(value);
                            }}
                            value={email}
                            contentStyle={styles.textInputContentStyle}
                            style={emailFocus ? styles.textInputFocus : styles.textInput}
                            onFocus={() => {
                                setIsEmailFocus(true);
                            }}
                            placeholder={'Type in your email...'}
                            label="Email"
                            textColor={"#D9D9D9"}
                            left={<TextInput.Icon icon="email" iconColor="#FFFFFF"/>}
                        />
                        <TextInput
                            placeholderTextColor={'#303030'}
                            activeUnderlineColor={'#F2FF5D'}
                            underlineColor={'#D9D9D9'}
                            outlineColor={'#D9D9D9'}
                            activeOutlineColor={'#F2FF5D'}
                            selectionColor={'#F2FF5D'}
                            mode={'outlined'}
                            onChangeText={(value: React.SetStateAction<string>) => {
                                setIsPasswordFocus(true);
                                setLoginMainError(false);
                                setPassword(value);
                            }}
                            value={password}
                            contentStyle={styles.textInputContentStyle}
                            style={passwordFocus ? styles.textInputFocus : styles.textInput}
                            onFocus={() => {
                                setIsPasswordFocus(true);
                            }}
                            placeholder={'Type in your password...'}
                            label="Password"
                            secureTextEntry={!passwordShown}
                            textColor={"#D9D9D9"}
                            right={<TextInput.Icon icon={!passwordShown ? "eye": "eye-off"} iconColor={passwordShown ? "#F2FF5D" : "#FFFFFF"}
                                                   onPress={() => setIsPasswordShown(!passwordShown)}/>}
                            left={<TextInput.Icon icon="lock" iconColor="#FFFFFF"/>}
                        />
                        <View style={styles.forgotPasswordView}>
                            <Text style={styles.forgotPasswordButton}
                                  onPress={() => {
                                      setIsEmailFocus(false);
                                      setEmail("");
                                      setIsPasswordFocus(false);
                                      setPassword("");
                                      setEmailErrors([]);
                                      setPasswordErrors([]);
                                      setLoginMainError(false);
                                      navigation.navigate('AccountRecovery', {})
                                  }}>Forgot Password ?
                            </Text>
                        </View>
                        <Button
                            uppercase={false}
                            onPress={async () => {
                                // set a loader on button press
                                // setIsReady(false);
                                if (email === "" || password === "") {
                                    // reset the loading view in case of errors
                                    // setIsReady(true);
                                    setLoginMainError(true);
                                } else if (emailErrors.length === 0 && passwordErrors.length === 0) {
                                    fieldValidator.validateField(email, "email", setEmailErrors);
                                    fieldValidator.validateField(password, "password", setPasswordErrors);
                                    if (emailErrors.length === 0 || passwordErrors.length === 0) {
                                        // const [signedInFlag, userInformation] = await confirmSignIn(email, password);
                                        // if (signedInFlag) {
                                        //     // clear the username and password
                                        //     setPassword("");
                                        //     setEmail("");
                                        //     // store the user information in secure store, in order to handle deeplinks later on
                                        //     await SecureStore.setItemAsync('currentUserInformation', JSON.stringify(userInformation));
                                        //     navigation.navigate('MainDash', {currentUserInformation: userInformation});
                                        //     setIsReady(true);
                                        // } else {
                                        //     // reset the loading view in case of errors
                                        //     setIsReady(true);
                                        // }
                                    } else {
                                        // reset the loading view in case of errors
                                        // setIsReady(true);
                                    }
                                } else {
                                    // reset the loading view in case of errors
                                    // setIsReady(true);
                                }
                            }}
                            labelStyle={styles.loginButtonContentStyle}
                            style={styles.logInButton}>
                            Log In
                        </Button>
                        <View style={styles.bottomView}>
                            <Image source={LoginLogo}
                                   style={styles.loginLogo}
                                   resizeMode={'stretch'}/>
                            <Text style={styles.loginFooter}>Don't have an account ?
                                <Text style={styles.loginFooterButton}
                                      onPress={() => {
                                          // clear the username and password
                                          setPassword("");
                                          setEmail("");
                                          navigation.navigate('Registration', {})
                                      }}> Sign up</Text>
                            </Text>
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </>
    );
};
