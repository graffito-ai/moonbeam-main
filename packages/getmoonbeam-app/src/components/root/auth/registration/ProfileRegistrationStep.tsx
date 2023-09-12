import {Platform, View} from "react-native";
import {styles} from "../../../../styles/registration.module";
import {Text, TextInput} from "react-native-paper";
import React, {useEffect, useState} from "react";
import {useRecoilState} from "recoil";
import {
    birthdayErrorState,
    birthdayState,
    dutyStatusErrorsState,
    dutyStatusState,
    dutyStatusValueState,
    emailErrorsState,
    emailState,
    enlistingYearErrorsState,
    enlistingYearState,
    firstNameErrorsState,
    firstNameState,
    lastNameErrorsState,
    lastNameState,
    phoneNumberErrorsState,
    phoneNumberState,
    registrationBackButtonShown,
    registrationMainErrorState
} from "../../../../recoil/AuthAtom";
import {FieldValidator} from "../../../../utils/FieldValidator";
import DropDownPicker from "react-native-dropdown-picker";
import {dutyStatusItems} from "../../../../models/Constants";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

/**
 * ProfileRegistrationStep component.
 *
 * @constructor constructor for the component.
 */
export const ProfileRegistrationStep = () => {
    // constants used to keep track of local component state
    const [dutyItems, setDutyItems] = useState(dutyStatusItems);
    const [firstNameFocus, setIsFirstNameFocus] = useState<boolean>(false);
    const [lastNameFocus, setIsLastNameFocus] = useState<boolean>(false);
    const [birthdayFocus, setIsBirthdayFocus] = useState<boolean>(false);
    const [phoneNumberFocus, setIsPhoneNumberFocus] = useState<boolean>(false);
    const [emailFocus, setIsEmailFocus] = useState<boolean>(false);
    const [enlistingYearFocus, setIsEnlistingYearFocus] = useState<boolean>(false);
    // constants used to keep track of shared states
    const [enlistingYear, setEnlistingYear] = useRecoilState(enlistingYearState);
    const [dropdownDutyState, setDropdownDutyState] = useRecoilState(dutyStatusState);
    const [dutyStatus, setDutyStatus] = useRecoilState(dutyStatusValueState);
    const [firstName, setFirstName] = useRecoilState(firstNameState);
    const [firstNameErrors, setFirstNameErrors] = useRecoilState(firstNameErrorsState);
    const [lastName, setLastName] = useRecoilState(lastNameState);
    const [lastNameErrors, setLastNameErrors] = useRecoilState(lastNameErrorsState);
    const [birthday, setBirthday] = useRecoilState(birthdayState);
    const [birthdayErrors, setBirthdayErrors] = useRecoilState(birthdayErrorState);
    const [phoneNumber, setPhoneNumber] = useRecoilState(phoneNumberState);
    const [phoneNumberErrors, setPhoneNumberErrors] = useRecoilState(phoneNumberErrorsState);
    const [email, setEmail] = useRecoilState(emailState);
    const [emailErrors, setEmailErrors] = useRecoilState(emailErrorsState);
    const [enlistingYearErrors, setEnlistingYearErrors] = useRecoilState(enlistingYearErrorsState);
    const [dutyStatusErrors, setDutyStatusErrors] = useRecoilState(dutyStatusErrorsState);
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

        if (enlistingYearFocus && enlistingYear !== "") {
            fieldValidator.validateField(enlistingYear, "enlistingYear", setEnlistingYearErrors);
        }
        enlistingYear === "" && setEnlistingYearErrors([]);

        if (dutyStatus !== "") {
            fieldValidator.validateField(dutyStatus, "dutyStatus", setDutyStatusErrors);
        }
        dutyStatus === "" && setDutyStatusErrors([]);
    }, [firstName, firstNameFocus, lastName, lastNameFocus, email, emailFocus,
        birthday, birthdayFocus, phoneNumber, phoneNumberFocus, enlistingYear, enlistingYearFocus,
        dutyStatus]);

    // return the component for the ProfileRegistrationStep, part of the Registration page
    return (
        <>
            {registrationMainError
                ? <Text style={styles.errorMessage}>Please fill out the information below!</Text>
                : (firstNameErrors.length !== 0 && !registrationMainError)
                    ? <Text style={styles.errorMessage}>{firstNameErrors[0]}</Text>
                    : (lastNameErrors.length !== 0 && !registrationMainError)
                        ? <Text style={styles.errorMessage}>{lastNameErrors[0]}</Text>
                        : (emailErrors.length !== 0 && !registrationMainError)
                            ? <Text style={styles.errorMessage}>{emailErrors[0]}</Text>
                            : (phoneNumberErrors.length !== 0 && !registrationMainError)
                                ? <Text style={styles.errorMessage}>{phoneNumberErrors[0]}</Text>
                                : (birthdayErrors.length !== 0 && !registrationMainError)
                                    ? <Text style={styles.errorMessage}>{birthdayErrors[0]}</Text>
                                    : (enlistingYearErrors.length !== 0 && !registrationMainError)
                                        ? <Text style={styles.errorMessage}>{enlistingYearErrors[0]}</Text>
                                        : (dutyStatusErrors.length !== 0 && !registrationMainError)
                                            ? <Text style={styles.errorMessage}>{dutyStatusErrors[0]}</Text>
                                            : <></>
            }
            <View style={{zIndex: 1000}}>
                <View style={styles.inputColumnView}>
                    <TextInput
                        autoCapitalize={"sentences"}
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
                        style={[firstNameFocus ? styles.textInputNarrowFocus : styles.textInputNarrow, firstName.length === 0 && {height: hp(6)}]}
                        onFocus={() => {
                            setIsFirstNameFocus(true);
                            setIsBackButtonShown(false);

                            // close the dropdown if opened
                            dropdownDutyState && setDropdownDutyState(false);
                        }}
                        placeholder={'Required'}
                        label="First Name"
                        textColor={"#FFFFFF"}
                    />
                    <TextInput
                        autoCapitalize={"sentences"}
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
                        style={[lastNameFocus ? styles.textInputNarrowFocus : styles.textInputNarrow, {marginLeft: wp(7)}, lastName.length === 0 && {height: hp(6)}]}
                        onFocus={() => {
                            setIsLastNameFocus(true);
                            setIsBackButtonShown(false);

                            // close the dropdown if opened
                            dropdownDutyState && setDropdownDutyState(false);
                        }}
                        placeholder={'Required'}
                        label="Last Name"
                        textColor={"#FFFFFF"}
                    />
                </View>
                <TextInput
                    autoCapitalize={"none"}
                    autoCorrect={false}
                    autoComplete={"off"}
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
                    style={[emailFocus ? styles.textInputFocus : styles.textInput, email.length === 0 && {height: hp(6)}]}
                    onFocus={() => {
                        setIsEmailFocus(true);
                        setIsBackButtonShown(false);

                        // close the dropdown if opened
                        dropdownDutyState && setDropdownDutyState(false);
                    }}
                    placeholder={'Required'}
                    label="Email"
                    textColor={"#FFFFFF"}
                    left={
                        <TextInput.Icon icon="email" size={hp(3.3)} style={{marginTop: hp(1.8)}} iconColor="#FFFFFF"/>
                    }
                />
                <TextInput
                    autoCorrect={false}
                    autoComplete={"off"}
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
                    style={[birthdayFocus ? styles.textInputFocus : styles.textInput, birthday.length === 0 && {height: hp(6)}]}
                    onFocus={() => {
                        setIsBirthdayFocus(true);
                        setIsBackButtonShown(false);

                        // close the dropdown if opened
                        dropdownDutyState && setDropdownDutyState(false);
                    }}
                    placeholder={'Required MM/DD/YYYY'}
                    label="Birthday"
                    textColor={"#FFFFFF"}
                    left={
                        <TextInput.Icon icon="cake" size={hp(3)} style={{marginTop: hp(1.8)}} iconColor="#FFFFFF"/>
                    }
                />
                <TextInput
                    autoCorrect={false}
                    autoComplete={"off"}
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
                    style={[phoneNumberFocus ? styles.textInputFocus : styles.textInput, phoneNumber.length === 0 && {height: hp(6)}]}
                    onFocus={() => {
                        setIsPhoneNumberFocus(true);
                        setIsBackButtonShown(false);

                        // close the dropdown if opened
                        dropdownDutyState && setDropdownDutyState(false);
                    }}
                    placeholder={'Required +1 (XXX)-XXX-XXXX'}
                    label="Phone Number"
                    textColor={"#FFFFFF"}
                    left={
                        <TextInput.Icon icon="phone" size={hp(3)} style={{marginTop: hp(1.9)}} iconColor="#FFFFFF"/>
                    }
                />
                <TextInput
                    autoCorrect={false}
                    autoComplete={"off"}
                    keyboardType={"number-pad"}
                    placeholderTextColor={'#D9D9D9'}
                    activeUnderlineColor={'#F2FF5D'}
                    underlineColor={'#D9D9D9'}
                    outlineColor={'#D9D9D9'}
                    activeOutlineColor={'#F2FF5D'}
                    selectionColor={'#F2FF5D'}
                    mode={'outlined'}
                    onChangeText={(value: React.SetStateAction<string>) => {
                        setIsEnlistingYearFocus(true);
                        setRegistrationMainError(false);

                        // format value
                        value = fieldValidator.formatYearEntry(enlistingYear, value.toString());

                        setEnlistingYear(value);
                    }}
                    onBlur={() => {
                        setIsEnlistingYearFocus(false);
                        setIsBackButtonShown(true);
                    }}
                    value={enlistingYear}
                    contentStyle={styles.textInputContentStyle}
                    style={[enlistingYearFocus ? styles.textInputFocus : styles.textInput, enlistingYear.length === 0 && {height: hp(6)}]}
                    onFocus={() => {
                        setIsEnlistingYearFocus(true);
                        setIsBackButtonShown(false);

                        // close the dropdown if opened
                        dropdownDutyState && setDropdownDutyState(false);
                    }}
                    placeholder={'Required'}
                    label="Year of Enlistment/Commission"
                    textColor={"#FFFFFF"}
                    left={
                        <TextInput.Icon icon="calendar" size={hp(2.8)} style={{marginTop: hp(2.2)}} iconColor="#FFFFFF"/>
                    }
                />
                <View style={styles.pickerView}>
                    <DropDownPicker
                        zIndex={5000}
                        placeholder={"Duty Status"}
                        containerStyle={dropdownDutyState && Platform.OS === 'android' && {height: hp(25)}}
                        dropDownContainerStyle={[styles.dropdownContainer, Platform.OS === 'android' ? {height: hp(20)} : {height: hp(15)}]}
                        style={styles.dropdownPicker}
                        textStyle={[styles.dropdownTextInputContentStyle, {color: '#FFFFFF'}]}
                        dropDownDirection={"BOTTOM"}
                        open={dropdownDutyState}
                        value={dutyStatus === "" ? null : dutyStatus}
                        items={dutyItems}
                        setOpen={setDropdownDutyState}
                        setValue={setDutyStatus}
                        setItems={setDutyItems}
                        onOpen={() => {
                            setRegistrationMainError(false);
                            setIsBackButtonShown(false);
                        }}
                        onClose={() => {
                            setDropdownDutyState(false);
                            setIsBackButtonShown(true);
                        }}
                        onSelectItem={(item) => {
                            setDutyStatus(item.value!);

                            // validate value
                            fieldValidator.validateField(item.value!, "dutyStatus", setDutyStatusErrors);
                        }}
                        theme="DARK"
                        multiple={false}
                        listMode="SCROLLVIEW"
                    />
                </View>
            </View>
        </>
    );
}
