import React, {useEffect, useState} from "react";
import {Dimensions, ImageBackground, Platform, TouchableOpacity, View} from "react-native";
import {commonStyles} from '../../styles/common.module';
import {styles} from '../../styles/registration.module';
import {RegistrationProps} from "../../models/AuthenticationProps";
import {IconButton, Text, TextInput} from "react-native-paper";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {FieldValidator} from "../../utils/FieldValidator";
import {useRecoilState} from "recoil";
import {
    registrationStepNumber,
    registrationBackButtonShown,
    registrationMainErrorState,
    firstNameState,
    lastNameState,
    emailState,
    birthdayState,
    phoneNumberState
} from '../../recoil/AuthAtom';

/**
 * RegistrationComponent component.
 */
export const RegistrationComponent = ({}: RegistrationProps) => {
    // constants used to keep track of local component state
    const [firstNameErrors, setFirstNameErrors] = useState<any[]>([]);
    const [firstNameFocus, setIsFirstNameFocus] = useState<boolean>(false);
    const [lastNameErrors, setLastNameErrors] = useState<any[]>([]);
    const [lastNameFocus, setIsLastNameFocus] = useState<boolean>(false);
    const [birthdayErrors, setBirthdayErrors] = useState<any[]>([]);
    const [birthdayFocus, setIsBirthdayFocus] = useState<boolean>(false);
    const [phoneNumberErrors, setPhoneNumberErrors] = useState<any[]>([]);
    const [phoneNumberFocus, setIsPhoneNumberFocus] = useState<boolean>(false);
    const [emailErrors, setEmailErrors] = useState<any[]>([]);
    const [emailFocus, setIsEmailFocus] = useState<boolean>(false);

    // constants used to keep track of shared states
    const [stepNumber, setStepNumber] = useRecoilState(registrationStepNumber);
    const [registrationMainError, setRegistrationMainError] = useRecoilState(registrationMainErrorState);
    const [_, setIsBackButtonShown] = useRecoilState(registrationBackButtonShown);
    const [firstName, setFirstName] = useRecoilState(firstNameState);
    const [lastName, setLastName] = useRecoilState(lastNameState);
    const [birthday, setBirthday] = useRecoilState(birthdayState);
    const [phoneNumber, setPhoneNumber] = useRecoilState(phoneNumberState);
    const [email, setEmail] = useRecoilState(emailState);


    // constants used to keep track of steps content
    const stepTitles = [
        "Personal Info",
        "Code Verification",
        "Documentation",
        "Military Status",
        "Military Status",
        "Identification",
        "Card Linking",
        "Account Security"
    ]
    const stepDescription = [
        "Enter your full name, email, birthday and phone number to continue.",
        "Enter the code that we sent to your email.",
        "Help us verify your military status by uploading either your military ID or DD214.",
        "Help us verify your military status by taking a photo of your military ID (CAC or Veteran ID).",
        "Help us verify your military status by taking a photo or uploading your DD214. Please redact your SSN before uploading.",
        "Help us verify your identity by uploading or taking a photo of your Driver’s License or Passport.",
        "Link your favorite Visa, American Express, or MasterCard card and earn rewards with every transaction at qualifying merchant locations.",
        "Secure your account by setting an account password. Make sure to review our agreements and policies."
    ]


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
        if (firstNameFocus && firstName !== "") {
            fieldValidator.validateField(firstName, "firstName", setFirstNameErrors);
        }
        firstName === "" && setFirstNameErrors([]);

        if (lastNameFocus && lastName !== "") {
            fieldValidator.validateField(lastName, "lastName", setLastNameErrors);
        }
        lastName === "" && setLastNameErrors([]);

        if (emailFocus && email !== "") {
            fieldValidator.validateField(email, "email", setEmailErrors);
        }
        email === "" && setEmailErrors([]);

        if (birthdayFocus && birthday !== "") {
            fieldValidator.validateField(birthday, "birthday", setBirthdayErrors);
        }
        birthday === "" && setBirthdayErrors([]);

        if (phoneNumberFocus && phoneNumber !== "") {
            fieldValidator.validateField(phoneNumber, "phoneNumber", setPhoneNumberErrors);
        }
        phoneNumber === "" && setPhoneNumberErrors([]);
    }, [firstName, firstNameFocus, lastName, lastNameFocus, email, emailFocus, birthday, birthdayFocus, phoneNumber, phoneNumberFocus]);

    // return the component for the Registration page
    return (
        <>
            <ImageBackground
                style={[commonStyles.image]}
                imageStyle={{
                    resizeMode: 'stretch'
                }}
                source={require('../../../assets/backgrounds/registration-background.png')}>
                <KeyboardAwareScrollView
                    enableOnAndroid={true}
                    enableAutomaticScroll={(Platform.OS === 'ios')}
                    contentContainerStyle={[commonStyles.rowContainer]}
                    keyboardShouldPersistTaps={'handled'}
                >
                    <View style={[styles.titleView, {marginTop: Dimensions.get('window').height / 6}]}>
                        <Text style={styles.stepTitle}>{stepTitles[stepNumber]}</Text>
                        <IconButton
                            icon={"triangle"}
                            iconColor={"#F2FF5D"}
                            size={Dimensions.get('window').width / 20}
                            style={styles.triangleIcon}
                        />
                    </View>
                    <Text style={styles.stepDescription}>{stepDescription[stepNumber]}</Text>
                    {registrationMainError
                        ? <Text style={styles.errorMessage}>Please fill out the information below!</Text>
                        : (firstNameErrors.length && !registrationMainError)
                            ? <Text style={styles.errorMessage}>{firstNameErrors[0]}</Text>
                            : (lastNameErrors.length && !registrationMainError)
                                ? <Text style={styles.errorMessage}>{lastNameErrors[0]}</Text>
                                : (emailErrors.length && !registrationMainError)
                                    ? <Text style={styles.errorMessage}>{emailErrors[0]}</Text>
                                    : (phoneNumberErrors.length && !registrationMainError)
                                        ? <Text style={styles.errorMessage}>{phoneNumberErrors[0]}</Text>
                                        : <Text style={styles.errorMessage}>{birthdayErrors[0]}</Text>

                    }
                    {/*switch views based on the step number*/}
                    {
                        stepNumber === 0
                            ?
                            <View>
                                <View style={styles.nameView}>
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
                                            setIsFirstNameFocus(true);
                                            setRegistrationMainError(false);
                                            setFirstName(value);
                                        }}
                                        onBlur={() => {
                                            setIsFirstNameFocus(false);
                                            setIsBackButtonShown(true);
                                        }}
                                        value={firstName}
                                        contentStyle={styles.textInputNarrowContentStyle}
                                        style={firstNameFocus ? styles.textInputNarrowFocus : styles.textInputNarrow}
                                        onFocus={() => {
                                            setIsFirstNameFocus(true);
                                            setIsBackButtonShown(false);
                                        }}
                                        placeholder={'Required'}
                                        label="First Name"
                                        textColor={"#D9D9D9"}
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
                                            setIsLastNameFocus(true);
                                            setRegistrationMainError(false);
                                            setLastName(value);
                                        }}
                                        onBlur={() => {
                                            setIsLastNameFocus(false);
                                            setIsBackButtonShown(true);
                                        }}
                                        value={lastName}
                                        contentStyle={styles.textInputNarrowContentStyle}
                                        style={[lastNameFocus ? styles.textInputNarrowFocus : styles.textInputNarrow, {marginLeft: Dimensions.get('window').width / 15}]}
                                        onFocus={() => {
                                            setIsLastNameFocus(true);
                                            setIsBackButtonShown(false);
                                        }}
                                        placeholder={'Required'}
                                        label="Last Name"
                                        textColor={"#D9D9D9"}
                                    />
                                </View>
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
                                        setRegistrationMainError(false);
                                        setEmail(value);
                                    }}
                                    onBlur={() => {
                                        setIsEmailFocus(false);
                                        setIsBackButtonShown(true);
                                    }}
                                    value={email}
                                    contentStyle={styles.textInputContentStyle}
                                    style={emailFocus ? styles.textInputFocus : styles.textInput}
                                    onFocus={() => {
                                        setIsEmailFocus(true);
                                        setIsBackButtonShown(false);
                                    }}
                                    placeholder={'Required'}
                                    label="Email"
                                    textColor={"#D9D9D9"}
                                    left={<TextInput.Icon icon="email" iconColor="#FFFFFF"/>}
                                />
                                <TextInput
                                    keyboardType={"number-pad"}
                                    placeholderTextColor={'#D9D9D9'}
                                    activeUnderlineColor={'#F2FF5D'}
                                    underlineColor={'#D9D9D9'}
                                    outlineColor={'#D9D9D9'}
                                    activeOutlineColor={'#F2FF5D'}
                                    selectionColor={'#F2FF5D'}
                                    mode={'outlined'}
                                    onChangeText={(value: React.SetStateAction<string>) => {
                                        setIsBirthdayFocus(true);
                                        setRegistrationMainError(false);

                                        // format value
                                        value = fieldValidator.formatBirthDay(birthday, value.toString());

                                        setBirthday(value.toString());
                                    }}
                                    onBlur={() => {
                                        setIsBirthdayFocus(false);
                                        setIsBackButtonShown(true);
                                    }}
                                    value={birthday}
                                    contentStyle={styles.textInputContentStyle}
                                    style={birthdayFocus ? styles.textInputFocus : styles.textInput}
                                    onFocus={() => {
                                        setIsBirthdayFocus(true);
                                        setIsBackButtonShown(false);
                                    }}
                                    placeholder={'Required MM/DD/YYYY'}
                                    label="Birthday"
                                    textColor={"#D9D9D9"}
                                    left={<TextInput.Icon icon="cake" iconColor="#FFFFFF"/>}
                                />
                                <TextInput
                                    keyboardType={"phone-pad"}
                                    placeholderTextColor={'#D9D9D9'}
                                    activeUnderlineColor={'#F2FF5D'}
                                    underlineColor={'#D9D9D9'}
                                    outlineColor={'#D9D9D9'}
                                    activeOutlineColor={'#F2FF5D'}
                                    selectionColor={'#F2FF5D'}
                                    mode={'outlined'}
                                    onChangeText={(value: React.SetStateAction<string>) => {
                                        setIsPhoneNumberFocus(true);
                                        setRegistrationMainError(false);

                                        // format value
                                        value = fieldValidator.formatPhoneNumber(phoneNumber, value.toString());

                                        setPhoneNumber(value);
                                    }}
                                    onBlur={() => {
                                        setIsPhoneNumberFocus(false);
                                        setIsBackButtonShown(true);
                                    }}
                                    value={phoneNumber}
                                    contentStyle={styles.textInputContentStyle}
                                    style={phoneNumberFocus ? styles.textInputFocus : styles.textInput}
                                    onFocus={() => {
                                        setIsPhoneNumberFocus(true);
                                        setIsBackButtonShown(false);
                                    }}
                                    placeholder={'Required +1 (XXX)-XXX-XXXX'}
                                    label="Phone Number"
                                    textColor={"#D9D9D9"}
                                    left={<TextInput.Icon icon="phone" iconColor="#FFFFFF"/>}
                                />
                                <Text
                                    style={styles.disclaimerText}>{'By creating an account with Moonbeam, you consent to our '}
                                    <Text style={styles.disclaimerTextHighlighted}
                                          onPress={() => {
                                          }}>Privacy Policy</Text>{' and/or'}
                                    <Text style={styles.disclaimerTextHighlighted}
                                          onPress={() => {
                                          }}> Terms & Conditions.</Text>
                                </Text>
                            </View>
                            :
                            <></>
                    }
                    <View style={[styles.bottomContainerButtons]}>
                        {stepNumber !== 0 && <TouchableOpacity
                            style={styles.buttonLeft}
                            onPress={
                                () => {
                                    if (stepNumber > 0) {
                                        // decrease the step number
                                        let newStepValue = stepNumber - 1;
                                        setStepNumber(newStepValue);
                                    }
                                }
                            }
                        >
                            <Text style={styles.buttonText}>Previous</Text>
                        </TouchableOpacity>}
                        <TouchableOpacity
                            style={styles.buttonRight}
                            onPress={
                                () => {
                                    if (stepNumber < 7) {
                                        // increase the step number
                                        let newStepValue = stepNumber + 1;
                                        setStepNumber(newStepValue);
                                    }
                                }
                            }
                        >
                            <Text style={styles.buttonText}>{stepNumber === 7 ? `Finish` : `Next`}</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAwareScrollView>
            </ImageBackground>
        </>
    );
};

