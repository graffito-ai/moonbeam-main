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
    registrationCodeTimerValue,
    registrationVerificationDigit1,
    registrationVerificationDigit2,
    registrationVerificationDigit3,
    registrationVerificationDigit4,
    registrationVerificationDigit5,
    registrationVerificationDigit6,
    registrationStepNumber,
    registrationBackButtonShown,
    registrationMainErrorState,
    firstNameState,
    lastNameState,
    emailState,
    birthdayState,
    phoneNumberState
} from '../../recoil/AuthAtom';
import {registrationStepDescription, registrationStepTitles} from "../../models/Content";

/**
 * RegistrationComponent component.
 */
export const RegistrationComponent = ({}: RegistrationProps) => {
    // constants used to keep track of local component state
    const [verificationCodeDigit1Focus, setIsVerificationCodeDigit1Focus] = useState<boolean>(false);
    const [verificationCodeDigit2Focus, setIsVerificationCodeDigit2Focus] = useState<boolean>(false);
    const [verificationCodeDigit3Focus, setIsVerificationCodeDigit3Focus] = useState<boolean>(false);
    const [verificationCodeDigit4Focus, setIsVerificationCodeDigit4Focus] = useState<boolean>(false);
    const [verificationCodeDigit5Focus, setIsVerificationCodeDigit5Focus] = useState<boolean>(false);
    const [verificationCodeDigit6Focus, setIsVerificationCodeDigit6Focus] = useState<boolean>(false);
    const [verificationCodeErrors, setVerificationCodeErrors] = useState<any[]>([]);
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
    const [countDownValue, setCountDownValue] = useRecoilState(registrationCodeTimerValue);
    const [verificationCodeDigit1, setVerificationCodeDigit1] = useRecoilState(registrationVerificationDigit1);
    const [verificationCodeDigit2, setVerificationCodeDigit2] = useRecoilState(registrationVerificationDigit2);
    const [verificationCodeDigit3, setVerificationCodeDigit3] = useRecoilState(registrationVerificationDigit3);
    const [verificationCodeDigit4, setVerificationCodeDigit4] = useRecoilState(registrationVerificationDigit4);
    const [verificationCodeDigit5, setVerificationCodeDigit5] = useRecoilState(registrationVerificationDigit5);
    const [verificationCodeDigit6, setVerificationCodeDigit6] = useRecoilState(registrationVerificationDigit6);
    const [stepNumber, setStepNumber] = useRecoilState(registrationStepNumber);
    const [registrationMainError, setRegistrationMainError] = useRecoilState(registrationMainErrorState);
    const [_, setIsBackButtonShown] = useRecoilState(registrationBackButtonShown);
    const [firstName, setFirstName] = useRecoilState(firstNameState);
    const [lastName, setLastName] = useRecoilState(lastNameState);
    const [birthday, setBirthday] = useRecoilState(birthdayState);
    const [phoneNumber, setPhoneNumber] = useRecoilState(phoneNumberState);
    const [email, setEmail] = useRecoilState(emailState);

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

    /**
     * Callback function used to decrease the value of the countdown by 1,
     * given a number of seconds passed in.
     *
     * @param seconds number of seconds passed in
     */
    function startCountdown(seconds) {
        let counter = seconds;

        const interval = setInterval(() => {
            setCountDownValue(counter !== 10 ? `0${counter}` : counter);
            counter--;

            if (counter < 0) {
                clearInterval(interval);
            }
        }, 1000);
    }

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
                        <Text style={styles.stepTitle}>{registrationStepTitles[stepNumber]}</Text>
                        <IconButton
                            icon={"triangle"}
                            iconColor={"#F2FF5D"}
                            size={Dimensions.get('window').width / 20}
                            style={styles.triangleIcon}
                        />
                    </View>
                    <Text style={styles.stepDescription}>{registrationStepDescription[stepNumber]}</Text>
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
                                <View style={styles.inputColumnView}>
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
                                        textColor={"#FFFFFF"}
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
                                        textColor={"#FFFFFF"}
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
                                    textColor={"#FFFFFF"}
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
                                    textColor={"#FFFFFF"}
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
                                    textColor={"#FFFFFF"}
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
                            : stepNumber === 7
                                ?
                                <View>
                                    <View style={styles.codeInputColumnView}>
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
                                                setIsVerificationCodeDigit1Focus(true);
                                                setRegistrationMainError(false);

                                                // format value
                                                value = fieldValidator.formatCodeDigit(verificationCodeDigit1, value.toString());

                                                setVerificationCodeDigit1(value);
                                            }}
                                            onBlur={() => {
                                                setIsVerificationCodeDigit1Focus(false);
                                                setIsBackButtonShown(true);
                                            }}
                                            value={verificationCodeDigit1}
                                            contentStyle={styles.textInputCodeContentStyle}
                                            style={verificationCodeDigit1Focus ? styles.textInputCodeFocus : styles.textInputCode}
                                            onFocus={() => {
                                                setIsVerificationCodeDigit1Focus(true);
                                                setIsBackButtonShown(false);
                                            }}
                                            placeholder={'-'}
                                            label=""
                                            textColor={"#FFFFFF"}
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
                                                setIsVerificationCodeDigit2Focus(true);
                                                setRegistrationMainError(false);

                                                // format value
                                                value = fieldValidator.formatCodeDigit(verificationCodeDigit2, value.toString());

                                                setVerificationCodeDigit2(value);
                                            }}
                                            onBlur={() => {
                                                setIsVerificationCodeDigit2Focus(false);
                                                setIsBackButtonShown(true);
                                            }}
                                            value={verificationCodeDigit2}
                                            contentStyle={styles.textInputCodeContentStyle}
                                            style={verificationCodeDigit2Focus ? styles.textInputCodeFocus : styles.textInputCode}
                                            onFocus={() => {
                                                setIsVerificationCodeDigit2Focus(true);
                                                setIsBackButtonShown(false);
                                            }}
                                            placeholder={'-'}
                                            label=""
                                            textColor={"#FFFFFF"}
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
                                                setIsVerificationCodeDigit3Focus(true);
                                                setRegistrationMainError(false);

                                                // format value
                                                value = fieldValidator.formatCodeDigit(verificationCodeDigit3, value.toString());

                                                setVerificationCodeDigit3(value);
                                            }}
                                            onBlur={() => {
                                                setIsVerificationCodeDigit3Focus(false);
                                                setIsBackButtonShown(true);
                                            }}
                                            value={verificationCodeDigit3}
                                            contentStyle={styles.textInputCodeContentStyle}
                                            style={verificationCodeDigit3Focus ? styles.textInputCodeFocus : styles.textInputCode}
                                            onFocus={() => {
                                                setIsVerificationCodeDigit3Focus(true);
                                                setIsBackButtonShown(false);
                                            }}
                                            placeholder={'-'}
                                            label=""
                                            textColor={"#FFFFFF"}
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
                                                setIsVerificationCodeDigit4Focus(true);
                                                setRegistrationMainError(false);

                                                // format value
                                                value = fieldValidator.formatCodeDigit(verificationCodeDigit4, value.toString());

                                                setVerificationCodeDigit4(value);
                                            }}
                                            onBlur={() => {
                                                setIsVerificationCodeDigit4Focus(false);
                                                setIsBackButtonShown(true);
                                            }}
                                            value={verificationCodeDigit4}
                                            contentStyle={styles.textInputCodeContentStyle}
                                            style={verificationCodeDigit4Focus ? styles.textInputCodeFocus : styles.textInputCode}
                                            onFocus={() => {
                                                setIsVerificationCodeDigit4Focus(true);
                                                setIsBackButtonShown(false);
                                            }}
                                            placeholder={'-'}
                                            label=""
                                            textColor={"#FFFFFF"}
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
                                                setIsVerificationCodeDigit5Focus(true);
                                                setRegistrationMainError(false);

                                                // format value
                                                value = fieldValidator.formatCodeDigit(verificationCodeDigit5, value.toString());

                                                setVerificationCodeDigit5(value);
                                            }}
                                            onBlur={() => {
                                                setIsVerificationCodeDigit5Focus(false);
                                                setIsBackButtonShown(true);
                                            }}
                                            value={verificationCodeDigit5}
                                            contentStyle={styles.textInputCodeContentStyle}
                                            style={verificationCodeDigit5Focus ? styles.textInputCodeFocus : styles.textInputCode}
                                            onFocus={() => {
                                                setIsVerificationCodeDigit5Focus(true);
                                                setIsBackButtonShown(false);
                                            }}
                                            placeholder={'-'}
                                            label=""
                                            textColor={"#FFFFFF"}
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
                                                setIsVerificationCodeDigit6Focus(true);
                                                setRegistrationMainError(false);

                                                // format value
                                                value = fieldValidator.formatCodeDigit(verificationCodeDigit6, value.toString());

                                                setVerificationCodeDigit6(value);
                                            }}
                                            onBlur={() => {
                                                setIsVerificationCodeDigit6Focus(false);
                                                setIsBackButtonShown(true);
                                            }}
                                            value={verificationCodeDigit6}
                                            contentStyle={styles.textInputCodeContentStyle}
                                            style={verificationCodeDigit6Focus ? styles.textInputCodeFocus : styles.textInputCode}
                                            onFocus={() => {
                                                setIsVerificationCodeDigit6Focus(true);
                                                setIsBackButtonShown(false);
                                            }}
                                            placeholder={'-'}
                                            label=""
                                            textColor={"#FFFFFF"}
                                        />
                                    </View>
                                    <View style={styles.resendCodeView}>
                                        {countDownValue > 0
                                            ? <Text style={styles.countdownTimer}>{`00:${countDownValue}`}</Text>
                                            :
                                            <TouchableOpacity
                                                onPress={
                                                    () => {
                                                    }
                                                }
                                            >
                                                <Text style={styles.resendCode}>Resend Code</Text>
                                            </TouchableOpacity>
                                        }
                                    </View>
                                </View>
                                : <></>
                    }
                    <View style={[styles.bottomContainerButtons]}>
                        {stepNumber !== 0 && <TouchableOpacity
                            style={styles.buttonLeft}
                            onPress={
                                () => {
                                    // show back button on previous step
                                    setIsBackButtonShown(true);

                                    // decrease the step number
                                    if (stepNumber > 0) {
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
                                async () => {
                                    // show back button on next step
                                    setIsBackButtonShown(true);

                                    // verify if we can move to the next stage
                                    let checksPassed = true;
                                    switch (stepNumber) {
                                        case 0:
                                            if (firstName === "" || lastName === "" || email === "" || birthday === "" || phoneNumber === ""
                                                || firstNameErrors.length !== 0 || lastNameErrors.length !== 0 ||
                                                emailErrors.length !== 0 || birthdayErrors.length !== 0 || phoneNumberErrors.length !== 0) {
                                                checksPassed = false;

                                                // only populate main error if there are no other errors showing
                                                if (firstNameErrors.length === 0 && lastNameErrors.length === 0 &&
                                                    emailErrors.length === 0 && birthdayErrors.length === 0 && phoneNumberErrors.length === 0) {
                                                    setRegistrationMainError(true);
                                                }
                                            } else {

                                                // clear the next step's old values
                                                setVerificationCodeDigit1("");
                                                setVerificationCodeDigit2("");
                                                setVerificationCodeDigit3("");
                                                setVerificationCodeDigit4("");
                                                setVerificationCodeDigit5("");
                                                setVerificationCodeDigit6("");

                                                checksPassed = true;
                                            }
                                            break;
                                        case 6:
                                            // initiate the countdown
                                            setCountDownValue(10);
                                            startCountdown(10);

                                            break;
                                        case 7:
                                            if (verificationCodeDigit1 === "" || verificationCodeDigit2 === "" || verificationCodeDigit3 === "" ||
                                                verificationCodeDigit4 === "" || verificationCodeDigit5 === "" || verificationCodeDigit6 === "") {
                                                checksPassed = false;
                                                setRegistrationMainError(true);
                                            } else {
                                                // check on the code validity through Amplify

                                                // clear the next step's old values

                                                checksPassed = true;
                                            }
                                            break;
                                        default:
                                            break;
                                    }

                                    // increase the step number
                                    if (stepNumber < 7 && checksPassed) {
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

