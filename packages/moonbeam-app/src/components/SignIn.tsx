import React, {useEffect, useState} from 'react';
import {Image, ImageBackground, Platform, Text, View} from 'react-native';
import {Button, TextInput} from 'react-native-paper';
import {styles} from '../styles/signIn.module';
// @ts-ignore
import LoginLogo from '../../assets/login-logo.png';
import {SignInProps} from '../models/RootProps'
import {commonStyles} from '../styles/common.module';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
// @ts-ignore
import {useValidation} from 'react-native-form-validator';
import {API, Auth, graphqlOperation} from 'aws-amplify';
import {listReferrals, ReferralStatus, updateReferral} from '@moonbeam/moonbeam-models';

/**
 * Sign In component.
 */
export const SignInComponent = ({navigation, route}: SignInProps) => {
    // state driven key-value pairs
    const [emailFocus, setIsEmailFocus] = useState<boolean>(false);
    const [passwordFocus, setIsPasswordFocus] = useState<boolean>(false);
    const [isInitialRender, setIsInitialRender] = useState<boolean>(route.params.initialRender);
    const [passwordShown, setIsPasswordShown] = useState<boolean>(false);
    // state driven key-value pairs for forgot password form values
    const [email, setEmail] = useState<string>("");
    const [emailErrors, setEmailErrors] = useState<any[]>([]);
    const [loginMainError, setLoginMainError] = useState<boolean>(false);
    const [password, setPassword] = useState<string>("");
    const [passwordErrors, setPasswordErrors] = useState<any[]>([]);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // if it's not an initial render, set all validation errors to empty
        if (!isInitialRender) {
            // perform field validations on every state change, for the specific field that is being validated
            if (emailFocus && email !== "") {
                fieldValidation("email");
            }
            email === "" && setEmailErrors([]);

            if (passwordFocus && password !== "") {
                fieldValidation("password");
            }
            password === "" && setPasswordErrors([]);
        } else {
            setIsInitialRender(false);
        }
    }, [email, emailFocus, password, passwordFocus]);

    // Constants used for easy field validation, to validate, check if field is invalid or get errors for invalid field
    const {validate, isFieldInError, getErrorsInField} =
        useValidation({
            state: {
                email: email,
                password: password
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
                    setEmailErrors([...getErrorsInField('email'), "Invalid email address."]);
                } else {
                    setEmailErrors([]);
                }
                break;
            case 'password':
                validate({
                    ...({
                        [fieldName]: {
                            required: true,
                        }
                    }),
                });
                if (isFieldInError('password')) {
                    setPasswordErrors([...getErrorsInField('password')]);
                } else {
                    setPasswordErrors([]);
                }
                break;
            default:
                console.log('Unexpected field name!');
        }
    };

    /**
     * Function used to capture the sign in action
     *
     * @param username username inputted by the user
     * @param password password inputted by the user
     * @return {@link Boolean} a flag representing whether the code retrieval was successful or not
     */
    const confirmSignIn = async (username: string, password: string): Promise<[boolean, any]> => {
        try {
            const user = await Auth.signIn(username, password);

            /**
             * The number of points on signup is 0, unless the SignUp is as a result of an offer,
             * in which case the number of points will be derived from the referral offer.
             *
             *  As we have more offers, we might need to build an API to keep a mapping between the offers
             *  and number of points to be redeemed. For now we do this in the UI directly, due to the low number of mappings.
             *
             *  Only give points if an offer/invite was not redeemed.
             *  In the future switch on the offer type and determine the number of points to be updated
             */

            /**
             * First retrieve all unredeemed offers for the current user, and redeem them, by changing the referral status and timestamp,
             * as well as the user's point balance.
             */

            // perform a query to get the referral data for use-cases when user is Inviter
            if (user) {
                const inviterResult = await API.graphql(graphqlOperation(listReferrals, {
                    filter:
                        {
                            inviterEmail: user.attributes["email"].toLowerCase(),
                            statusInviter: ReferralStatus.Initiated,
                            status: ReferralStatus.Redeemed
                        }
                }))
                // @ts-ignore
                if (inviterResult && inviterResult.data.listReferrals.errorMessage === null) {
                    // perform a query to get the referral data for use-cases when user is Invitee
                    const inviteeResult = await API.graphql(graphqlOperation(listReferrals, {
                        filter:
                            {
                                inviteeEmail: user.attributes["email"].toLowerCase(),
                                statusInvitee: ReferralStatus.Initiated,
                                status: ReferralStatus.Redeemed
                            }
                    }));
                    // @ts-ignore
                    if (inviteeResult && inviteeResult.data.listReferrals.errorMessage === null) {
                        // @ts-ignore
                        const inviterList = inviterResult.data.listReferrals.data;
                        // @ts-ignore
                        const inviteeList = inviteeResult.data.listReferrals.data;

                        /**
                         * Retrieving the authenticated user's information.
                         * Necessary upon logging in because the Auth.signIn Promise result is caching information.
                         */
                        const user = await Auth.currentAuthenticatedUser({
                            bypassCache: true
                        });
                        if (user) {
                            const userInfo = user.signInUserSession.idToken.payload;
                            let redeemablePoints: number = 0;

                            // keep track of the point updates
                            const pointUpdatesInviter: string[] = [];
                            const pointUpdatesInvitee: string[] = [];

                            // update the list of referrals for the inviter, and the points
                            let itemCount = 0;
                            while (itemCount < inviterList.length) {
                                // create a timestamp to keep track of when the referral was last updated
                                const updatedAt = new Date().toISOString();

                                // update the referral object in the list of referrals, accordingly
                                const updatesReferral = await API.graphql(graphqlOperation(updateReferral, {
                                    updateInput:
                                        {
                                            // @ts-ignore
                                            id: `${inviterList[itemCount].id}`,
                                            statusInviter: ReferralStatus.Redeemed,
                                            updatedAt: updatedAt
                                        }
                                }));
                                // @ts-ignore
                                if (updatesReferral && updatesReferral.data.updateReferral.errorMessage === null) {
                                    let existingPoints = Number(userInfo["custom:points"]);
                                    redeemablePoints = existingPoints + 10000;
                                    // update the available points for the user
                                    const pointsUpdate = await Auth.updateUserAttributes(user, {
                                        'custom:points': `${redeemablePoints}`
                                    });

                                    // update the local user information object to reflect the latest redeemable points
                                    userInfo["custom:points"] = redeemablePoints;

                                    // add the updates to the list of updates
                                    if (pointsUpdate) {
                                        pointUpdatesInviter.push(pointsUpdate);
                                        itemCount++;
                                    }
                                }
                            }

                            if (itemCount === pointUpdatesInviter.length && pointUpdatesInviter.length === inviterList.length) {
                                let itemCount = 0;
                                // update the list of referrals for the invitee, and the points
                                while (itemCount < inviteeList.length) {
                                    // create a timestamp to keep track of when the referral was last updated
                                    const updatedAt = new Date().toISOString();

                                    // update the referral object in the list of referrals, accordingly
                                    const updatesReferral = await API.graphql(graphqlOperation(updateReferral, {
                                        input:
                                            {
                                                // @ts-ignore
                                                id: `${inviteeList[itemCount].id}`,
                                                statusInvitee: ReferralStatus.Redeemed,
                                                updatedAt: updatedAt
                                            }
                                    }));
                                    // @ts-ignore
                                    if (updatesReferral && updatesReferral.data.updateReferral.errorMessage === null) {
                                        let existingPoints = Number(userInfo["custom:points"]);
                                        redeemablePoints = existingPoints + 10000;
                                        // update the available points for the user
                                        const pointsUpdate = await Auth.updateUserAttributes(user, {
                                            'custom:points': `${redeemablePoints}`
                                        });

                                        // update the local user information object to reflect the latest redeemable points
                                        userInfo["custom:points"] = redeemablePoints;

                                        // add the updates to the list of updates
                                        if (pointsUpdate) {
                                            pointUpdatesInvitee.push(pointsUpdate);
                                            itemCount++;
                                        }
                                    }
                                }

                                if (itemCount === pointUpdatesInvitee.length && pointUpdatesInvitee.length === inviteeList.length) {
                                    return [true, userInfo];
                                } else {
                                    console.log(`Unexpected error while updating points for the list of Invitee-based referrals`);
                                    setPasswordErrors([`Unexpected error while Signing In`]);
                                    return [false, null];
                                }
                            } else {
                                console.log(`Unexpected error while updating points for the list of Inviter-based referrals`);
                                setPasswordErrors([`Unexpected error while Signing In`]);
                                return [false, null];
                            }

                        } else {
                            console.log(`Unexpected error while retrieving authenticated user's information`);
                            setPasswordErrors([`Unexpected error while Signing In`]);
                            return [false, null];
                        }
                    } else {
                        console.log(`Unexpected error while retrieving the list of Invitee-based referrals ${inviteeResult}`);
                        setPasswordErrors([`Unexpected error while Signing In`]);
                        return [false, null];
                    }
                } else {
                    console.log(`Unexpected error while retrieving the list of Inviter-based referrals ${inviterResult}`);
                    setPasswordErrors([`Unexpected error while Signing In`]);
                    return [false, null];
                }
            } else {
                console.log(`Unexpected error while signing user in`);
                setPasswordErrors([`Unexpected error while Signing In`]);
                return [false, null];
            }
        } catch (error) {
            // @ts-ignore
            if (error.message && error.message === "User does not exist." || error.message === "Incorrect username or password.") {
                // @ts-ignore
                console.log(error.message);
                // @ts-ignore
                setPasswordErrors(["Incorrect username or password."]);
            } else {
                // @ts-ignore
                console.log(error.message ? `Unexpected error while Signing In: ${JSON.stringify(error.message)}` : `Unexpected error while Signing In: ${JSON.stringify(error)}`);
                setPasswordErrors([`Error while Signing In`]);
            }
            return [false, null];
        }
    };

    // return the component for the SignIn page
    return (
        <ImageBackground
            style={commonStyles.image}
            imageStyle={{
                resizeMode: 'stretch'
            }}
            source={require('../../assets/login-background.png')}>
            <KeyboardAwareScrollView
                enableOnAndroid={true}
                enableAutomaticScroll={(Platform.OS === 'ios')}
                onLayout={route.params.onLayoutRootView}
                contentContainerStyle={[commonStyles.container]}
                keyboardShouldPersistTaps={'handled'}
            >
                <View style={styles.mainView}>
                    <View>
                        <Text style={styles.loginTitle}>Hello</Text>
                        <Text style={styles.loginSubtitle}>Sign in to your account</Text>
                    </View>
                    {loginMainError &&
                        <Text style={styles.errorMessageMain}>Please fill out the information below!</Text>}
                    {/* @ts-ignore */}
                    <TextInput
                        onChangeText={(value: React.SetStateAction<string>) => {
                            setIsEmailFocus(true);
                            setLoginMainError(false);
                            setEmail(value);
                        }}
                        value={email}
                        style={emailFocus ? styles.textInputFocus : styles.textInput}
                        onFocus={() => {
                            setIsEmailFocus(true);
                        }}
                        label="Email"
                        textColor={"#313030"}
                        underlineColor={"#f2f2f2"}
                        activeUnderlineColor={"#313030"}
                        left={<TextInput.Icon icon="email" iconColor="#313030"/>}
                    />
                    {(emailErrors.length > 0 && !loginMainError) ?
                        <Text style={styles.errorMessage}>{emailErrors[0]}</Text> : <></>}

                    {/* @ts-ignore */}
                    <TextInput
                        onChangeText={(value: React.SetStateAction<string>) => {
                            setIsPasswordFocus(true);
                            setLoginMainError(false);
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
                        right={<TextInput.Icon icon="eye" iconColor={passwordShown ? "#A2B000" : "#313030"}
                                               onPress={() => setIsPasswordShown(!passwordShown)}/>}
                        left={<TextInput.Icon icon="lock" iconColor="#313030"/>}
                    />
                    {(passwordErrors.length > 0 && !loginMainError) ?
                        <Text style={styles.errorMessage}>{passwordErrors[0]}</Text> : <></>}

                    <View style={styles.forgotPasswordView}>
                        <Text style={styles.forgotPasswordButton}
                              onPress={() => {
                                  setEmail("");
                                  setPassword("");
                                  setEmailErrors([]);
                                  setPasswordErrors([]);
                                  setLoginMainError(false);
                                  navigation.navigate('ForgotPassword', {initialRender: true})
                              }}>Forgot Password ?
                        </Text>
                    </View>
                    <Button
                        uppercase={false}
                        onPress={async () => {
                            if (email === "" || password === "") {
                                setLoginMainError(true);
                            } else if (emailErrors.length === 0 && passwordErrors.length === 0) {
                                fieldValidation("email");
                                fieldValidation("password");
                                if (emailErrors.length === 0 || passwordErrors.length === 0) {
                                    const [signedInFlag, userInformation] = await confirmSignIn(email, password);
                                    if (signedInFlag) {
                                        navigation.navigate('Dashboard', {currentUserInformation: userInformation});
                                    }
                                }
                            }
                        }}
                        style={styles.signInFooterButton}
                        textColor={"#f2f2f2"}
                        buttonColor={"#2A3779"}
                        mode="outlined"
                        labelStyle={{fontSize: 18}}>
                        Log in
                    </Button>
                    <View style={styles.bottomView}>
                        <Image source={LoginLogo} style={styles.loginLogo}/>
                        <Text style={styles.loginFooter}>Don't have an account ?
                            <Text style={styles.loginFooterButton}
                                  onPress={() => {
                                      navigation.navigate('SignUp', {initialRender: true})
                                  }}> Sign up</Text>
                        </Text>
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </ImageBackground>
    );
};

