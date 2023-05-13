import {Dimensions, View} from "react-native";
import {styles} from "../../../styles/registration.module";
import {Text, TextInput} from "react-native-paper";
import React, {useEffect, useState} from "react";
import {useRecoilState} from "recoil";
import {
    birthdayState,
    emailState,
    firstNameState,
    lastNameState,
    phoneNumberState,
    registrationBackButtonShown,
    registrationMainErrorState,
    firstNameErrorsState,
    lastNameErrorsState,
    birthdayErrorState,
    emailErorrsState, phoneNumberErrorsState
} from "../../../recoil/AuthAtom";
import {FieldValidator} from "../../../utils/FieldValidator";

/**
 * ProfileRegistrationStep component.
 */
export const ProfileRegistrationStep = () => {
    // constants used to keep track of local component state
    const [firstNameFocus, setIsFirstNameFocus] = useState<boolean>(false);
    const [lastNameFocus, setIsLastNameFocus] = useState<boolean>(false);
    const [birthdayFocus, setIsBirthdayFocus] = useState<boolean>(false);
    const [phoneNumberFocus, setIsPhoneNumberFocus] = useState<boolean>(false);
    const [emailFocus, setIsEmailFocus] = useState<boolean>(false);
    // constants used to keep track of shared states
    const [firstName, setFirstName] = useRecoilState(firstNameState);
    const [firstNameErrors, setFirstNameErrors] = useRecoilState(firstNameErrorsState);
    const [lastName, setLastName] = useRecoilState(lastNameState);
    const [lastNameErrors, setLastNameErrors] = useRecoilState(lastNameErrorsState);
    const [birthday, setBirthday] = useRecoilState(birthdayState);
    const [birthdayErrors, setBirthdayErrors] = useRecoilState(birthdayErrorState);
    const [phoneNumber, setPhoneNumber] = useRecoilState(phoneNumberState);
    const [phoneNumberErrors, setPhoneNumberErrors] = useRecoilState(phoneNumberErrorsState);
    const [email, setEmail] = useRecoilState(emailState);
    const [emailErrors, setEmailErrors] = useRecoilState(emailErorrsState);
    const [registrationMainError, setRegistrationMainError] = useRecoilState(registrationMainErrorState);
    const [, setIsBackButtonShown] = useRecoilState(registrationBackButtonShown);

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

    // return the component for the ProfileRegistrationStep, part of the Registration page
    return (
        <>
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
        </>
    );
}
