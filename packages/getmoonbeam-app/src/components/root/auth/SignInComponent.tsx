import React, {useEffect, useState} from "react";
import {Image, ImageBackground, Platform, TouchableOpacity, View} from "react-native";
import {commonStyles} from '../../../styles/common.module';
import {styles} from '../../../styles/signIn.module';
import {SignInProps} from "../../../models/props/AuthenticationProps";
import {Text, TextInput} from "react-native-paper";
import {FieldValidator} from "../../../utils/FieldValidator";
// @ts-ignore
import LoginLogo from '../../../../assets/login-logo.png';
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useRecoilState} from "recoil";
import {currentUserInformation} from "../../../recoil/AuthAtom";
import {Auth} from "aws-amplify";
import {Spinner} from "../../common/Spinner";
// @ts-ignore
import AuthenticationGradientImage from '../../../../assets/backgrounds/authentication-gradient.png';
// @ts-ignore
import MilitaryBranchImage from '../../../../assets/art/military-branch-logos.png';

/**
 * Sign In component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const SignInComponent = ({navigation}: SignInProps) => {
    // constants used to keep track of local component state
    const [isReady, setIsReady] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [email, setEmail] = useState<string>("");
    const [emailErrors, setEmailErrors] = useState<any[]>([]);
    const [emailFocus, setIsEmailFocus] = useState<boolean>(false);
    const [password, setPassword] = useState<string>("");
    const [passwordErrors, setPasswordErrors] = useState<any[]>([]);
    const [passwordFocus, setIsPasswordFocus] = useState<boolean>(false);
    const [loginMainError, setLoginMainError] = useState<boolean>(false);
    const [passwordShown, setIsPasswordShown] = useState<boolean>(false);
    // constants used to keep track of shared states
    const [, setUserInformation] = useRecoilState(currentUserInformation);

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
        if (emailFocus && email !== "") {
            fieldValidator.validateField(email, "email", setEmailErrors);
        }
        email === "" && setEmailErrors([]);

        if (passwordFocus && password !== "") {
            fieldValidator.validateField(password, "password", setPasswordErrors);
        }
        password === "" && setPasswordErrors([]);
    }, [email, emailFocus, password, passwordFocus]);

    /**
     * Function used to authenticate a user, given their username and password.
     *
     * @return a {@link Promise} of a {@link Boolean} representing a flag indicating whether
     * a user was successfully authenticated or not.
     */
    const signIn = async (): Promise<boolean> => {
        // constant to keep track of the common error for authentication
        let authenticationErrorMessage = `Unexpected error while signing in. Try again!`;

        try {
            // set a loader on button press
            setIsReady(false);

            // use Amplify to sign in the user, given the inputted email and password combination.
            const user = await Auth.signIn(email, password);
            if (user) {
                // remove the email and password fields, since we don't need them beyond this point
                setPassword("");
                setEmail("");

                // retrieve the user information payload from the authenticated session.
                const userInfo = user.signInUserSession.idToken.payload;

                // set the current user information accordingly
                setUserInformation({
                    ...userInfo
                });

                // release the loader on button press
                setIsReady(true);

                return true;
            } else {
                // release the loader on button press
                setIsReady(true);
                console.log(`${authenticationErrorMessage} - user object: ${JSON.stringify(user)}`);
                /**
                 * here we just chose to populate one of the error arrays for the fields, instead of having to create a separate
                 * error array for authentication purposes.
                 */
                setEmailErrors([authenticationErrorMessage]);
                return false;
            }
        } catch (error) {
            // filter through the errors accordingly
            // @ts-ignore
            const errorCode = error.code;
            if (error && errorCode) {
                if (errorCode === "UserNotFoundException") {
                    authenticationErrorMessage = `User not found! Register first.`;
                } else if (errorCode === "NotAuthorizedException") {
                    authenticationErrorMessage = `User and password combination incorrect.`
                }
                // ToDo: add more filtering if needed below
            }

            // release the loader on button press
            setIsReady(true);
            console.log(`${authenticationErrorMessage} ${error}`);
            /**
             * here we just chose to populate one of the error arrays for the fields, instead of having to create a separate
             * error array for authentication purposes.
             */
            setEmailErrors([authenticationErrorMessage]);
            return false;
        }
    }

    // return the component for the SignIn page
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
                        source={AuthenticationGradientImage}>
                        <KeyboardAwareScrollView
                            enableOnAndroid={true}
                            showsVerticalScrollIndicator={false}
                            enableAutomaticScroll={(Platform.OS === 'ios')}
                            contentContainerStyle={commonStyles.rowContainer}
                            keyboardShouldPersistTaps={'handled'}
                        >
                            <View style={styles.topContainer}>
                                <Text style={styles.greetingTitle}>Hello</Text>
                                <Text style={styles.gettingSubtitle}>Get ready to <Text
                                    style={styles.gettingSubtitleHighlighted}>Earn</Text></Text>
                                <Image resizeMethod={"scale"}
                                       resizeMode={'contain'}
                                       source={MilitaryBranchImage}
                                       style={styles.topContainerImage}/>
                            </View>
                            <View style={[styles.bottomContainer]}>
                                <Text style={styles.bottomTitle}>Login</Text>
                                {loginMainError ?
                                    <Text style={styles.errorMessage}>Please fill out the information below!</Text>
                                    : (emailErrors.length !== 0 && !loginMainError) ?
                                        <Text style={styles.errorMessage}>{emailErrors[0]}</Text>
                                        : (passwordErrors.length !== 0 && !loginMainError) ?
                                            <Text style={styles.errorMessage}>{passwordErrors[0]}</Text>
                                            : <></>
                                }
                                <TextInput
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
                                    textColor={"#FFFFFF"}
                                    left={<TextInput.Icon icon="email" iconColor="#FFFFFF"/>}
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
                                    textColor={"#FFFFFF"}
                                    right={<TextInput.Icon icon={!passwordShown ? "eye" : "eye-off"}
                                                           iconColor={passwordShown ? "#F2FF5D" : "#FFFFFF"}
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
                                <TouchableOpacity
                                    style={styles.logInButton}
                                    onPress={async () => {
                                        if (email === "" || password === "" || passwordErrors.length !== 0
                                            || emailErrors.length !== 0) {
                                            // only populate main error if there are no other errors showing
                                            if (passwordErrors.length === 0 && emailErrors.length === 0) {
                                                setLoginMainError(true);
                                            }
                                        } else {
                                            // authenticate user through Amplify
                                            const signInFlag = await signIn();

                                            // check if authentication was successful
                                            if (signInFlag) {
                                                setLoginMainError(false);

                                                // navigate to the App Drawer
                                                navigation.navigate("AppDrawer", {});
                                            }
                                        }
                                    }}
                                >
                                    <Text style={styles.loginButtonContentStyle}>Sign In</Text>
                                </TouchableOpacity>
                                <View style={styles.bottomView}>
                                    <Image source={LoginLogo}
                                           style={styles.loginLogo}
                                           resizeMode={'contain'}/>
                                    <Text style={styles.loginFooter}>Don't have an account ?
                                        <Text style={styles.loginFooterButton}
                                              onPress={() => {
                                                  // clear the username and password
                                                  setPassword("");
                                                  setEmail("");
                                                  navigation.navigate('Registration', {})
                                              }}>{"  "}Sign up</Text>
                                    </Text>
                                </View>
                            </View>
                        </KeyboardAwareScrollView>
                    </ImageBackground>
            }
        </>
    );
};
