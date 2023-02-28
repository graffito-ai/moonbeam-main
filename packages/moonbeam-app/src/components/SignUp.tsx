import React, {useEffect, useState} from "react";
import {Dimensions, Image, ImageBackground, Keyboard, Platform, SafeAreaView, Text, View} from "react-native";
import {SignUpProps} from "../models/RootProps";
import {commonStyles} from '../styles/common.module';
import {styles} from '../styles/signUp.module';
// @ts-ignore
import {ProgressStep, ProgressSteps} from 'react-native-progress-steps';
import {Button, Modal, Portal, TextInput} from "react-native-paper";
import DropDownPicker from "react-native-dropdown-picker";
import {dutyDropdownItems} from "../common/Common";
import dayjs from 'dayjs';
// @ts-ignore
import {useValidation} from 'react-native-form-validator';
import moment from 'moment';
import {API, Auth, graphqlOperation} from 'aws-amplify';
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
// @ts-ignore
import FriendReferral from '../../assets/refer-friend.png';
import {getReferral} from '../graphql/queries';
import {ReferralStatus} from "../models";

/**
 * Sign Up component.
 */
export const SignUpComponent = ({navigation, route}: SignUpProps) => {
    // state driven key-value pairs for UI related elements
    const [emailFocus, setIsEmailFocus] = useState<boolean>(false);
    const [nameFocus, setIsNameFocus] = useState<boolean>(false);
    const [birthDateFocus, setIsBirthDateFocus] = useState<boolean>(false);
    const [phoneFocus, setIsPhoneFocus] = useState<boolean>(false);
    const [dutyOpen, setIsDutyOpen] = useState(false);
    const [dutyItems, setDutyItems] = useState(dutyDropdownItems);
    const [rankFocus, setIsRankFocus] = useState<boolean>(false);
    const [dutyStationFocus, setIsDutyStationFocus] = useState<boolean>(false);
    const [passwordFocus, setIsPasswordFocus] = useState<boolean>(false);
    const [confirmPasswordFocus, setIsConfirmPasswordFocus] = useState<boolean>(false);
    const [registerButtonShown, setIsRegisterButtonShown] = useState<boolean>(false);
    const [isInitialRender, setIsInitialRender] = useState<boolean>(route.params.initialRender);
    const [signUpErrorModalVisible, setSignUpErrorModalVisible] = useState<boolean>(false);
    const [referralSignUpModalVisible, setReferralSignUpModalVisible] = useState<boolean>(false);
    const [signUpModalError, setSignUpModalError] = useState<string>("");
    const [referralModalError, setReferralModalError] = useState<string>("");
    const [androidScrollPadding, setAndroidScrollPadding] = useState<number>(1);
    // state driven key-value pairs for signup form values
    const [progressStepsContactError, setProgressStepsContactError] = useState<boolean>(false);
    const [progressStepsMilitaryError, setProgressStepsMilitaryError] = useState<boolean>(false);
    const [progressStepsSecurityError, setProgressStepsSecurityError] = useState<boolean>(false);
    const [progressStepsErrors, setProgressStepsErrors] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [emailErrors, setEmailErrors] = useState<any[]>([]);
    const [name, setName] = useState<string>("");
    const [nameErrors, setNameErrors] = useState<any[]>([]);
    const [birthDate, setBirthDate] = useState<string>("");
    const [dateErrors, setDateErrors] = useState<any[]>([]);
    const [duty, setDuty] = useState<string | null>(null);
    const [dutyErrors, setDutyErrors] = useState<any[]>([]);
    const [rank, setRank] = useState<string>("");
    const [rankErrors, setRankErrors] = useState<any[]>([]);
    const [dutyStation, setDutyStation] = useState<string>("");
    const [dutyStationErrors, setDutyStationErrors] = useState<any[]>([]);
    const [password, setPassword] = useState<string>("");
    const [passwordShown, setIsPasswordShown] = useState<boolean>(false);
    const [passwordErrors, setPasswordErrors] = useState<any[]>([]);
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [confirmPasswordShown, setIsConfirmPasswordShown] = useState<boolean>(false);
    const [confirmPasswordErrors, setConfirmPasswordErrors] = useState<any[]>([]);
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [phoneNumberErrors, setPhoneNumberErrors] = useState<any[]>([]);
    const [referralData, setReferralData] = useState([]);

    // Constants used for easy field validation, to validate, check if field is invalid or get errors for invalid field
    const {validate, isFieldInError, getErrorsInField} =
        useValidation({
            state: {
                name: name,
                email: email,
                birthDate: birthDate,
                duty: duty,
                rank: rank,
                dutyStation: dutyStation,
                password: password,
                confirmPassword: confirmPassword,
                phoneNumber: phoneNumber
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
            case 'name':
                validate({
                    ...({[fieldName]: {minLength: 2, maxLength: 62, number: false, required: true}}),
                });
                if (isFieldInError('name') || !/^(\b([A-ZÀ-ÿ][-,a-z. ']+[ ]*){2,})$/.test(name)) {
                    setProgressStepsErrors(true);
                    setNameErrors([...getErrorsInField('name'), "Name formatting not valid (First | Middle | Last)."]);
                } else {
                    setProgressStepsErrors(false);
                    setNameErrors([]);
                }
                break;
            case 'birthDate':
                validate({
                    ...({[fieldName]: {date: 'YYYY-MM-DD', required: true}}),
                });
                if (isFieldInError('birthDate') && !/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/.test(birthDate)) {
                    setProgressStepsErrors(true);
                    setDateErrors([...getErrorsInField('birthDate'), "Date of Birth must be a valid date (YYYY-MM-DD)."]);
                } else if (!moment(birthDate, "YYYY-MM-DD", true).isValid()) {
                    setProgressStepsErrors(true);
                    setDateErrors(["Date of Birth must be a valid date (YYYY-MM-DD)."]);
                    // maximum age is 100, and minum age is 17
                } else if (Math.abs(dayjs(Date.parse(birthDate)).diff(Date.now(), "years")) > 100) {
                    setProgressStepsErrors(true);
                    setDateErrors(["You must be at most 100 years old."]);
                } else if (Math.abs(dayjs(Date.parse(birthDate)).diff(Date.now(), "years")) < 17) {
                    setProgressStepsErrors(true);
                    setDateErrors(["You must be at least 17 years old."]);
                } else {
                    setProgressStepsErrors(false);
                    setDateErrors([]);
                }
                break;
            case 'duty':
                validate({
                    ...({
                        [fieldName]: {
                            minLength: 7,
                            maxLength: 14,
                            required: true
                        }
                    }),
                });
                if (isFieldInError('duty') || duty === null) {
                    setProgressStepsErrors(true);
                    setDutyErrors([...getErrorsInField('duty'), "Please select a Duty Status."]);
                } else {
                    setProgressStepsErrors(false);
                    setDutyErrors([]);
                }
                break;
            case 'rank':
                validate({
                    ...({[fieldName]: {minLength: 2, maxLength: 35, required: true}}),
                });
                if (isFieldInError('rank') || !/^(\w{2,35})$/.test(rank)) {
                    setProgressStepsErrors(true);
                    setRankErrors([...getErrorsInField('rank'), "Invalid Military Rank format."]);
                } else {
                    setProgressStepsErrors(false);
                    setRankErrors([]);
                }
                break;
            case 'dutyStation':
                validate({
                    ...({[fieldName]: {minLength: 2, maxLength: 35, required: true}}),
                });
                if (isFieldInError('dutyStation') || !/^([A-Za-z\.\s\']{5,80})$/.test(dutyStation)) {
                    setProgressStepsErrors(true);
                    setDutyStationErrors([...getErrorsInField('dutyStation'), "Invalid Duty Station format."]);
                } else {
                    setProgressStepsErrors(false);
                    setDutyStationErrors([]);
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
            case 'phoneNumber':
                validate({
                    ...({
                        [fieldName]: {
                            minLength: 14,
                            maxLength: 14,
                            required: true,
                        }
                    }),
                });
                if (isFieldInError('phoneNumber') || !/^((\([0-9]{3}\)-|[0-9]{3}-)[0-9]{3}-[0-9]{4})$/.test(phoneNumber)) {
                    setProgressStepsErrors(true);
                    setPhoneNumberErrors([...getErrorsInField('phoneNumber'), "Invalid Phone Number - (XXX)-XXX-XXXX."]);
                } else {
                    setProgressStepsErrors(false);
                    setPhoneNumberErrors([]);
                }
                break;
            default:
                console.log('Unexpected field name!');
        }
    }

    /**
     * Function used for the Sign Up functionality, using AWSAmplify.
     *
     * @param username new user's username, synonymous with their email
     * @param name new user's name
     * @param birthDate new user's birthdate
     * @param dutyStatus new user's duty status
     * @param militaryRank new user's military rank
     * @param dutyStation new user's duty station
     * @param password new user's password
     * @param phoneNumber new user's phone number
     */
    const signUp = async (username: string, name: string, birthDate: string, dutyStatus: string,
                          militaryRank: string, dutyStation: string, password: string, phoneNumber: string) => {
        try {
            const signUp = await Auth.signUp({
                username,
                password,
                attributes: {
                    email: username,
                    phone_number: `+1${phoneNumber.replaceAll('(', '')
                        .replaceAll(')', '')
                        .replaceAll('-', '')}`,
                    name: name,
                    birthdate: birthDate,
                    updated_at: Date.now().toString(),
                    'custom:duty_station': dutyStation,
                    'custom:duty_status': dutyStatus,
                    'custom:military_rank': militaryRank,
                    'custom:points': '-99'
                },
            });
            if (signUp) {
                // depending on whether the SignUp resulted from a referral or not, perform separate flows
                navigation.navigate('EmailVerify', {
                    // @ts-ignore
                    username: username, ...(referralData !== null && referralData.id && referralData._version && referralData.status) && {
                        // @ts-ignore
                        referralId: referralData.id,
                        // @ts-ignore
                        _version: referralData._version,
                        // @ts-ignore
                        status: referralModalError !== "" ? ReferralStatus.INVALID : referralData.status
                    }
                });
            }
        } catch (error) {
            // @ts-ignore
            console.log(error.message ? `Unexpected error while Signing Up: ${JSON.stringify(error.message)}` : `Unexpected error while Signing Up: ${JSON.stringify(error)}`);
            setSignUpModalError('Unexpected error while Signing Up');
            setSignUpErrorModalVisible(true);
        }
    }

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

        // if it's not an initial render, set all validation errors to empty
        if (!isInitialRender) {
            // perform field validations on every state change, for the specific field that is being validated
            if (emailFocus && email !== "") {
                fieldValidation("email");
            }
            email === "" && setEmailErrors([]);

            if (nameFocus && name !== "") {
                fieldValidation("name");
            }
            name === "" && setNameErrors([]);

            if (birthDateFocus && birthDate !== "") {
                fieldValidation("birthDate");
            }
            birthDate === "" && setDateErrors([]);

            if (dutyOpen && duty !== null) {
                fieldValidation("duty");
            }
            duty === null && setDutyErrors([]);

            if (rankFocus && rank !== "") {
                fieldValidation("rank");
            }
            rank === "" && setRankErrors([]);

            if (dutyStationFocus && dutyStation !== "") {
                fieldValidation("dutyStation");
            }
            dutyStation === "" && setDutyStationErrors([]);

            if (passwordFocus && password !== "") {
                fieldValidation("password");
            }
            if (confirmPasswordFocus && confirmPassword !== "") {
                fieldValidation("confirmPassword");
            }
            (confirmPassword === "" && password === "") && setConfirmPasswordErrors([]);
            password === "" && setPasswordErrors([]);

            if (phoneFocus && phoneNumber !== "") {
                fieldValidation("phoneNumber");
            }
            phoneNumber === "" && setPhoneNumberErrors([]);
        } else {
            // check that if this is a deep link, with a referred id as parameter
            if (route.params.referralId) {
                // that the back button for the navigation is hidden
                route.params.setSignUpBackButtonVisible && route.params.setSignUpBackButtonVisible(false);

                // retrieves the referral invite data, given the information provided in the deep link
                getReferralInviteData();
            }
            setIsInitialRender(false);
        }

        // remove keyboard listeners accordingly
        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, [route.params, androidScrollPadding, email, name, birthDate, duty,
        rank, dutyStation, password, confirmPassword,
        phoneNumber, emailFocus, nameFocus, birthDateFocus,
        dutyOpen, rankFocus, dutyStationFocus, passwordFocus,
        confirmPasswordFocus, phoneFocus, referralModalError, signUpModalError]);

    /**
     * Function used to retrieve the information for a referral invite, referenced through a SignUp deep link
     */
    const getReferralInviteData = async () => {
        try {
            // that the back button for the navigation is hidden
            route.params.setSignUpBackButtonVisible && route.params.setSignUpBackButtonVisible(false);

            // perform a query to get the referral data
            const getsReferral = await API.graphql(graphqlOperation(getReferral, {
                id: route.params.referralId
            }));
            if (getsReferral) {
                console.log(JSON.stringify(getsReferral));
                // if the result is null, then we couldn't find a valid referral code, otherwise proceed with a full-blown referral modal

                // @ts-ignore
                setReferralData(getsReferral.data.getReferral);
                // @ts-ignore
                if (getsReferral.data.getReferral === null) {
                    setReferralModalError("Unable to validate invite code! No offers or points will be redeemed at this time!");
                } else {
                    // @ts-ignore
                    if (getsReferral.data.getReferral.status === ReferralStatus.REDEEMED) {
                        setReferralModalError("Invite code already redeemed! No offers or points will be redeemed at this time!");
                    }
                }
                // that the referral modal is shown
                setReferralSignUpModalVisible(true);
            }
        } catch (error) {
            setReferralModalError(`Error while retrieving referral invitation! No offers or points will be redeemed at this time!`);
            // @ts-ignore
            console.log(error.message ? JSON.stringify(error.message) : `Error while retrieving referral invitation! No offers or points will be redeemed at this time! ${JSON.stringify(error)}`);
        }
    }


    // return the component for the SignUp page
    return (
        <SafeAreaView style={[commonStyles.rowContainer, commonStyles.androidSafeArea]}>
            <ImageBackground
                imageStyle={{
                    resizeMode: 'stretch'
                }}
                style={commonStyles.image}
                source={require('../../assets/signup-background.png')}>
                <Portal>
                    {/*@ts-ignore*/}
                    <Modal contentContainerStyle={referralData !== null && referralData.status !== ReferralStatus.REDEEMED ? styles.referralModalContainer : styles.modalContainer}
                        dismissable={false} visible={referralSignUpModalVisible}
                        onDismiss={() => setReferralSignUpModalVisible(false)}>
                        {/*@ts-ignore*/}
                        {referralData !== null && referralData.status !== ReferralStatus.REDEEMED ?
                            <View style={styles.mainReferralView}>
                                <View style={styles.referralMessageView}>
                                    {/*@ts-ignore*/}
                                    <Text style={styles.referralMessageTitle}>{referralData.inviterName}</Text>
                                    <Text style={styles.referralMessageSubtitle}>referred you to the Alpha
                                        Program</Text>
                                </View>
                                <View style={{marginTop: '-30%'}}>
                                    <Image source={FriendReferral} style={styles.referralArt}></Image>
                                </View>
                                <View style={styles.referralMessageView}>
                                    <Text style={styles.referralMessageTitle}>Earn 10,000 Points</Text>
                                    <Text style={styles.referralMessageSubtitle}>Alpha card approval is required for
                                        redeeming Points.</Text>
                                </View>
                                <Button
                                    onPress={() => {
                                        setReferralSignUpModalVisible(false)
                                    }}
                                    uppercase={false}
                                    style={styles.referSignUpButton}
                                    textColor={"#f2f2f2"}
                                    buttonColor={"#2A3779"}
                                    mode="outlined"
                                    labelStyle={{fontSize: 18}}
                                    icon={"account-plus"}>
                                    Sign Up
                                </Button>
                            </View> :
                            <View>
                                <Text style={styles.modalParagraph}>{referralModalError}</Text>
                                <Button
                                    uppercase={false}
                                    style={styles.modalButton}
                                    icon={'account-plus'}
                                    textColor={"red"}
                                    buttonColor={"#f2f2f2"}
                                    mode="outlined"
                                    labelStyle={{fontSize: 15}}
                                    onPress={() => {
                                        setReferralSignUpModalVisible(false)
                                    }}>
                                    Continue Sign Up
                                </Button>
                            </View>
                        }
                    </Modal>
                </Portal>
                <Portal>
                    <Modal dismissable={false} visible={signUpErrorModalVisible}
                           onDismiss={() => setSignUpErrorModalVisible(false)}
                           contentContainerStyle={styles.modalContainer}>
                        <Text style={styles.modalParagraph}>{signUpModalError}</Text>
                        <Button
                            uppercase={false}
                            style={styles.modalButton}
                            icon={'redo-variant'}
                            textColor={"red"}
                            buttonColor={"#f2f2f2"}
                            mode="outlined"
                            labelStyle={{fontSize: 15}}
                            onPress={() => {
                                setSignUpErrorModalVisible(false)
                            }}>
                            Try Again
                        </Button>
                    </Modal>
                </Portal>
                <SafeAreaView style={commonStyles.rowContainer}>
                    <KeyboardAwareScrollView
                        onLayout={route.params.onLayoutRootView}
                        enableOnAndroid={true}
                        scrollEnabled={true}
                        contentContainerStyle={[commonStyles.keyboardScrollViewContainer, Platform.OS === 'android' ? {height: Dimensions.get("window").height + androidScrollPadding} : {flex: 1}]}
                        keyboardShouldPersistTaps={'handled'}
                    >
                        <View style={{flex: 1}}>
                            <View
                                style={[{alignSelf: 'center'}, Platform.OS === 'android' && {marginTop: '15%'}, route.params.referralId !== undefined && {marginTop: '10%'}]}>
                                <Text style={styles.signupTitle}>Welcome</Text>
                                <Text style={styles.signupSubtitle}>Let's set up an account</Text>
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
                                        // note do not enable this unless we need more space for content
                                        scrollable={false}
                                        label="Contact"
                                        nextBtnStyle={styles.initialNextBtnStyle}
                                        nextBtnTextStyle={styles.btnStyleText}
                                        onNext={() => {
                                            if (email === "" || name === "" || birthDate === "") {
                                                setProgressStepsContactError(true);
                                                setProgressStepsErrors(true);
                                            } else {
                                                fieldValidation("email");
                                                fieldValidation("name");
                                                fieldValidation("birthDate");
                                                if (emailErrors.length !== 0 || nameErrors.length !== 0 || dateErrors.length !== 0) {
                                                    setProgressStepsErrors(true);
                                                } else if (emailErrors.length === 0 && nameErrors.length === 0 && dateErrors.length === 0) {
                                                    dutyOpen && setIsDutyOpen(false);
                                                    setProgressStepsContactError(false);
                                                    setProgressStepsErrors(false);
                                                }
                                            }
                                        }}
                                        errors={progressStepsErrors}>
                                        <View style={styles.progressStepView}>
                                            <Text style={styles.contactProgressTitle}>Contact Information</Text>
                                            {progressStepsContactError &&
                                                <Text style={styles.errorMessageMain}>Please fill out the information
                                                    below!</Text>}
                                            {/* @ts-ignore */}
                                            <TextInput
                                                onChangeText={(value: React.SetStateAction<string>) => {
                                                    setIsEmailFocus(true);
                                                    setProgressStepsContactError(false);
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
                                            {(emailErrors.length > 0 && !progressStepsContactError) ?
                                                <Text style={styles.errorMessage}>{emailErrors[0]}</Text> : <></>}
                                            {/* @ts-ignore */}
                                            <TextInput
                                                onChangeText={(value: React.SetStateAction<string>) => {
                                                    setIsNameFocus(true);
                                                    setProgressStepsContactError(false);
                                                    setName(value);
                                                }}
                                                value={name}
                                                style={nameFocus ? styles.textInputFocus : styles.textInput}
                                                onFocus={() => {
                                                    setIsNameFocus(true);
                                                }}
                                                label="Full Name (First | Middle | Last )"
                                                textColor={"#313030"}
                                                underlineColor={"#f2f2f2"}
                                                activeUnderlineColor={"#313030"}
                                                left={<TextInput.Icon icon="account" iconColor="#313030"/>}
                                            />
                                            {(nameErrors.length > 0 && !progressStepsContactError) ?
                                                <Text style={styles.errorMessage}>{nameErrors[0]}</Text> : <></>}
                                            {/* @ts-ignore */}
                                            <TextInput
                                                onChangeText={(value: React.SetStateAction<string>) => {
                                                    setIsBirthDateFocus(true);
                                                    setProgressStepsContactError(false);
                                                    setBirthDate(value);
                                                }}
                                                value={birthDate}
                                                style={birthDateFocus ? styles.textInputFocus : styles.textInput}
                                                onFocus={() => {
                                                    setIsBirthDateFocus(true);
                                                }}
                                                label="Birthday (YYYY-MM-DD)"
                                                textColor={"#313030"}
                                                underlineColor={"#f2f2f2"}
                                                activeUnderlineColor={"#313030"}
                                                left={<TextInput.Icon icon="calendar" iconColor="#313030"/>}
                                            />
                                            {(dateErrors.length > 0 && !progressStepsContactError) ?
                                                <Text style={styles.errorMessage}>{dateErrors[0]}</Text> : <></>}
                                        </View>
                                    </ProgressStep>

                                    <ProgressStep
                                        // note do not enable this unless we need more space for content
                                        scrollable={false}
                                        label="Military"
                                        nextBtnStyle={styles.nextBtnStyle}
                                        nextBtnTextStyle={styles.btnStyleText}
                                        nextBtnText={"Next"}
                                        previousBtnText={"Back"}
                                        previousBtnStyle={styles.prevBtnStyle}
                                        previousBtnTextStyle={styles.btnStyleText}
                                        onNext={() => {
                                            if (duty === null || duty === "" || rank === "" || dutyStation === "") {
                                                setProgressStepsMilitaryError(true);
                                                setProgressStepsErrors(true);
                                            } else {
                                                fieldValidation("duty");
                                                fieldValidation("rank");
                                                fieldValidation("dutyStation");
                                                if (dutyErrors.length !== 0 || rankErrors.length !== 0 || dutyStationErrors.length !== 0) {
                                                    setProgressStepsErrors(true);
                                                } else {
                                                    setIsRegisterButtonShown(true);
                                                    dutyOpen && setIsDutyOpen(false);
                                                    setProgressStepsMilitaryError(false);
                                                    setProgressStepsErrors(false);
                                                }
                                            }
                                        }}
                                        errors={progressStepsErrors}
                                        onPrevious={() => {
                                            setProgressStepsMilitaryError(false);
                                            setIsRegisterButtonShown(false);
                                            dutyOpen && setIsDutyOpen(false);
                                        }}>
                                        <View style={styles.progressStepView}>
                                            <Text style={styles.militaryProgressTitle}>Military Information</Text>
                                            {progressStepsMilitaryError &&
                                                <Text style={styles.errorMessageMain}>Please fill out the information
                                                    below!</Text>}
                                            <DropDownPicker
                                                zIndex={1000}
                                                zIndexInverse={3000}
                                                placeholder={"Duty Status"}
                                                dropDownContainerStyle={styles.dropdownContainer}
                                                dropDownDirection={"BOTTOM"}
                                                style={styles.initialDropdownPicker}
                                                textStyle={{fontFamily: 'Raleway-Regular'}}
                                                open={dutyOpen}
                                                onOpen={() => {
                                                }}
                                                onClose={() => setIsDutyOpen(false)}
                                                value={duty}
                                                items={dutyItems}
                                                setOpen={setIsDutyOpen}
                                                setValue={setDuty}
                                                setItems={setDutyItems}
                                                onSelectItem={(item) => {
                                                    setProgressStepsMilitaryError(false);
                                                    setDuty(item.value!);
                                                }}
                                            />
                                            {(dutyErrors.length > 0 && !progressStepsMilitaryError) ?
                                                <Text style={styles.errorMessage}>{dutyErrors[0]}</Text> : <></>}
                                            {/* @ts-ignore */}
                                            <TextInput
                                                onChangeText={(value: React.SetStateAction<string>) => {
                                                    setIsRankFocus(true);
                                                    setProgressStepsMilitaryError(false);
                                                    setRank(value);
                                                }}
                                                value={rank}
                                                style={rankFocus ? styles.textInputFocus : styles.textInput}
                                                onFocus={() => {
                                                    setIsRankFocus(true);
                                                }}
                                                label="Rank"
                                                textColor={"#313030"}
                                                underlineColor={"#f2f2f2"}
                                                activeUnderlineColor={"#313030"}
                                                left={<TextInput.Icon icon="chevron-triple-up" iconColor="#313030"/>}
                                            />
                                            {(rankErrors.length > 0 && !progressStepsMilitaryError) ?
                                                <Text style={styles.errorMessage}>{rankErrors[0]}</Text> : <></>}
                                            {/* @ts-ignore */}
                                            <TextInput
                                                onChangeText={(value: React.SetStateAction<string>) => {
                                                    setIsDutyStationFocus(true);
                                                    setProgressStepsMilitaryError(false);
                                                    setDutyStation(value);
                                                }}
                                                value={dutyStation}
                                                style={dutyStationFocus ? styles.textInputFocus : styles.textInput}
                                                onFocus={() => {
                                                    setIsDutyStationFocus(true);
                                                }}
                                                label="Duty Station"
                                                textColor={"#313030"}
                                                underlineColor={"#f2f2f2"}
                                                activeUnderlineColor={"#313030"}
                                                left={<TextInput.Icon icon="office-building-marker"
                                                                      iconColor="#313030"/>}
                                            />
                                            {(dutyStationErrors.length > 0 && !progressStepsMilitaryError) ?
                                                <Text style={styles.errorMessage}>{dutyStationErrors[0]}</Text> : <></>}
                                        </View>
                                    </ProgressStep>

                                    <ProgressStep
                                        // note do not enable this unless we need more space for content - need to adjust for Android here
                                        scrollable={false}
                                        label="Security"
                                        nextBtnText={"Next"}
                                        previousBtnText={"Back"}
                                        finishBtnText={""}
                                        previousBtnStyle={styles.lastPrevBtnStyle}
                                        previousBtnTextStyle={styles.btnStyleText}
                                        errors={progressStepsErrors}
                                        onPrevious={() => {
                                            setProgressStepsSecurityError(false);
                                            setIsRegisterButtonShown(false);
                                            setIsConfirmPasswordShown(false);
                                            setIsPasswordShown(false);
                                        }}>
                                        <View style={styles.progressStepView}>
                                            <Text style={styles.securityProgressTitle}>Account Security</Text>
                                            {progressStepsSecurityError &&
                                                <Text style={styles.errorMessageMain}>Please fill out the information
                                                    below!</Text>}
                                            {/* @ts-ignore */}
                                            <TextInput
                                                onChangeText={(value: React.SetStateAction<string>) => {
                                                    setIsPasswordFocus(true);
                                                    setProgressStepsSecurityError(false);
                                                    setPassword(value);
                                                }}
                                                value={password}
                                                style={passwordFocus ? styles.initialTextInputFocus : styles.initialTextInput}
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
                                            {(passwordErrors.length > 0 && !progressStepsSecurityError) ?
                                                <Text style={styles.errorMessage}>{passwordErrors[0]}</Text> : <></>}
                                            {/* @ts-ignore */}
                                            <TextInput
                                                onChangeText={(value: React.SetStateAction<string>) => {
                                                    setIsConfirmPasswordFocus(true);
                                                    setProgressStepsSecurityError(false);
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
                                            {(confirmPasswordErrors.length > 0 && !progressStepsSecurityError) ?
                                                <Text
                                                    style={styles.errorMessage}>{confirmPasswordErrors[0]}</Text> : <></>}
                                            {/* @ts-ignore */}
                                            <TextInput
                                                onChangeText={(value: React.SetStateAction<string>) => {
                                                    setIsPhoneFocus(true);
                                                    setProgressStepsSecurityError(false);
                                                    setPhoneNumber(value);
                                                }}
                                                value={phoneNumber}
                                                style={phoneFocus ? styles.textInputFocus : styles.textInput}
                                                onFocus={() => {
                                                    setIsPhoneFocus(true);
                                                }}
                                                label="Phone Number"
                                                textColor={"#313030"}
                                                underlineColor={"#f2f2f2"}
                                                activeUnderlineColor={"#313030"}
                                                left={<TextInput.Icon icon="phone" iconColor="#313030"/>}
                                            />
                                            {(phoneNumberErrors.length > 0 && !progressStepsSecurityError) ?
                                                <Text style={styles.errorMessage}>{phoneNumberErrors[0]}</Text> : <></>}
                                        </View>
                                    </ProgressStep>
                                </ProgressSteps>
                            </View>
                        </View>
                        {
                            (registerButtonShown) &&
                            <View style={styles.signUpView}>
                                <Button
                                    uppercase={false}
                                    style={styles.signUpFooterButton}
                                    textColor={"#f2f2f2"}
                                    buttonColor={"#2A3779"}
                                    mode="outlined"
                                    labelStyle={{fontSize: 18}}
                                    onPress={() => {
                                        if (password === "" || confirmPassword === "" || phoneNumber === "") {
                                            setProgressStepsSecurityError(true);
                                            setProgressStepsErrors(true);
                                        } else {
                                            fieldValidation("password");
                                            fieldValidation("confirmPassword");
                                            fieldValidation("phoneNumber");
                                            if (passwordErrors.length !== 0 || confirmPasswordErrors.length !== 0 || phoneNumberErrors.length !== 0) {
                                                setProgressStepsErrors(true);
                                            } else {
                                                setProgressStepsSecurityError(false);
                                                setProgressStepsErrors(false);
                                                signUp(email, name, birthDate, duty!, rank, dutyStation, password, phoneNumber);
                                                setProgressStepsErrors(false);
                                            }
                                        }
                                    }}>
                                    Register
                                </Button>
                                <Text style={styles.disclaimerText}>
                                    By creating an account with us, you agree to our <Text style={styles.termsFooter}>Terms
                                    and Conditions</Text> and to our <Text style={styles.termsFooter}>Privacy
                                    Policy</Text>.
                                </Text>
                            </View>
                        }
                    </KeyboardAwareScrollView>
                </SafeAreaView>
            </ImageBackground>
        </SafeAreaView>
    );
};

