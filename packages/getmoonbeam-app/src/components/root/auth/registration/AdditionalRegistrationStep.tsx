import {Platform, Text, View} from "react-native";
import React, {useEffect, useState} from "react";
import DropDownPicker from "react-native-dropdown-picker";
import {styles} from "../../../../styles/registration.module";
import {useRecoilState} from "recoil";
import {
    addressCityErrorsState,
    addressCityState,
    addressLineErrorsState,
    addressLineState,
    addressStateErrorsState,
    addressStateState,
    addressZipErrorsState,
    addressZipState,
    militaryBranchErrorsState,
    militaryBranchState,
    militaryBranchValueState,
    registrationBackButtonShown,
    registrationMainErrorState
} from "../../../../recoil/AuthAtom";
import {militaryBranchItems} from "../../../../models/Constants";
import {TextInput} from "react-native-paper";
import {FieldValidator} from "../../../../utils/FieldValidator";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

/**
 * AdditionalRegistrationStep component.
 *
 * @constructor constructor for the component.
 */
export const AdditionalRegistrationStep = () => {
    // constants used to keep track of local component state
    const [branchItems, setBranchItems] = useState(militaryBranchItems);
    const [addressLineFocus, setIsAddressLineFocus] = useState<boolean>(false);
    const [addressCityFocus, setIsAddressCityFocus] = useState<boolean>(false);
    const [addressStateFocus, setIsAddressStateFocus] = useState<boolean>(false);
    const [addressZipFocus, setIsAddressZipFocus] = useState<boolean>(false);
    // constants used to keep track of shared states
    const [addressLine, setAddressLine] = useRecoilState(addressLineState);
    const [addressCity, setAddressCity] = useRecoilState(addressCityState);
    const [addressState, setAddressState] = useRecoilState(addressStateState);
    const [addressZip, setAddressZip] = useRecoilState(addressZipState);
    const [addressLineErrors, setAddressLineErrors] = useRecoilState(addressLineErrorsState);
    const [addressCityErrors, setAddressCityErrors] = useRecoilState(addressCityErrorsState);
    const [addressStateErrors, setAddressStateErrors] = useRecoilState(addressStateErrorsState);
    const [addressZipErrors, setAddressZipErrors] = useRecoilState(addressZipErrorsState);
    const [dropdownBranchState, setDropdownBranchState] = useRecoilState(militaryBranchState);
    const [militaryBranch, setMilitaryBranch] = useRecoilState(militaryBranchValueState);
    const [militaryBranchErrors, setMilitaryBranchErrors] = useRecoilState(militaryBranchErrorsState);
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
        if (addressLineFocus && addressLine !== "") {
            fieldValidator.validateField(addressLine, "addressLine", setAddressLineErrors);
        }
        addressLine === "" && setAddressLineErrors([]);

        if (addressCityFocus && addressCity !== "") {
            fieldValidator.validateField(addressCity, "addressCity", setAddressCityErrors);
        }
        addressCity === "" && setAddressCityErrors([]);

        if (addressStateFocus && addressState !== "") {
            fieldValidator.validateField(addressState, "addressState", setAddressStateErrors);
        }
        addressState === "" && setAddressStateErrors([]);

        if (addressZipFocus && addressZip !== "") {
            fieldValidator.validateField(addressZip, "addressZip", setAddressZipErrors);
        }
        addressZip === "" && setAddressZipErrors([]);

        if (militaryBranch !== "") {
            fieldValidator.validateField(militaryBranch, "militaryBranch", setMilitaryBranchErrors);
        }
        militaryBranch === "" && setMilitaryBranchErrors([]);
    }, [addressLineFocus, addressLine, addressCityFocus, addressCity,
        addressStateFocus, addressState,
        addressZipFocus, addressZip]);

    // return the component for the AdditionalRegistrationStep, part of the Registration page
    return (
        <>
            {registrationMainError
                ? <Text style={styles.errorMessage}>Please fill out the information below!</Text>
                : (addressLineErrors.length !== 0 && !registrationMainError)
                    ? <Text style={styles.errorMessage}>{addressLineErrors[0]}</Text>
                    : (addressCityErrors.length !== 0 && !registrationMainError)
                        ? <Text style={styles.errorMessage}>{addressCityErrors[0]}</Text>
                        : (addressStateErrors.length !== 0 && !registrationMainError)
                            ? <Text style={styles.errorMessage}>{addressStateErrors[0]}</Text>
                            : (addressZipErrors.length !== 0 && !registrationMainError)
                                ? <Text style={styles.errorMessage}>{addressZipErrors[0]}</Text>
                                : (militaryBranchErrors.length !== 0 && !registrationMainError)
                                    ? <Text style={styles.errorMessage}>{militaryBranchErrors[0]}</Text>
                                    : <></>
            }
            <View style={styles.militaryRegistrationView}>
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
                        setIsAddressLineFocus(true);
                        setRegistrationMainError(false);
                        setAddressLine(value);
                    }}
                    onBlur={() => {
                        setIsAddressLineFocus(false);
                        setIsBackButtonShown(true);
                    }}
                    value={addressLine}
                    contentStyle={styles.textInputContentStyle}
                    style={addressLineFocus ? styles.textInputFocus : styles.textInput}
                    onFocus={() => {
                        setIsAddressLineFocus(true);
                        setIsBackButtonShown(false);

                        // close the dropdown if opened
                        dropdownBranchState && setDropdownBranchState(false);
                    }}
                    placeholder={'Required (1 West Example Street)'}
                    label="Street Address"
                    textColor={"#FFFFFF"}
                    left={
                        <TextInput.Icon icon="home-map-marker" size={hp(2.8)} style={{marginTop: hp(2)}} iconColor="#FFFFFF"/>
                    }
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
                        setIsAddressCityFocus(true);
                        setRegistrationMainError(false);
                        setAddressCity(value);
                    }}
                    onBlur={() => {
                        setIsAddressCityFocus(false);
                        setIsBackButtonShown(true);
                    }}
                    value={addressCity}
                    contentStyle={styles.textInputContentStyle}
                    style={addressCityFocus ? styles.textInputFocus : styles.textInput}
                    onFocus={() => {
                        setIsAddressCityFocus(true);
                        setIsBackButtonShown(false);

                        // close the dropdown if opened
                        dropdownBranchState && setDropdownBranchState(false);
                    }}
                    placeholder={'Required'}
                    label="City"
                    textColor={"#FFFFFF"}
                    left={
                        <TextInput.Icon icon="home-city" size={hp(2.8)} style={{marginTop: hp(2)}} iconColor="#FFFFFF"/>
                    }
                />
                <View style={styles.inputColumnViewAddress}>
                    <TextInput
                        autoCapitalize={"characters"}
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
                            setIsAddressStateFocus(true);
                            setRegistrationMainError(false);

                            setAddressState(value);
                        }}
                        onBlur={() => {
                            setIsAddressStateFocus(false);
                            setIsBackButtonShown(true);
                        }}
                        value={addressState}
                        contentStyle={styles.textInputNarrowContentStyle}
                        style={[addressStateFocus ? styles.textInputNarrowFocus : styles.textInputNarrow]}
                        onFocus={() => {
                            setIsAddressStateFocus(true);
                            setIsBackButtonShown(false);

                            // close the dropdown if opened
                            dropdownBranchState && setDropdownBranchState(false);
                        }}
                        placeholder={'Required'}
                        label="State"
                        textColor={"#FFFFFF"}
                        left={
                            <TextInput.Icon icon="flag" size={hp(2.8)} style={{marginTop: hp(2)}} iconColor="#FFFFFF"/>
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
                            setIsAddressZipFocus(true);
                            setRegistrationMainError(false);
                            setAddressZip(value);
                        }}
                        onBlur={() => {
                            setIsAddressZipFocus(false);
                            setIsBackButtonShown(true);
                        }}
                        value={addressZip}
                        contentStyle={styles.textInputNarrowContentStyle}
                        style={[addressZipFocus ? styles.textInputNarrowFocus : styles.textInputNarrow, {marginLeft: wp(7)}]}
                        onFocus={() => {
                            setIsAddressZipFocus(true);
                            setIsBackButtonShown(false);

                            // close the dropdown if opened
                            dropdownBranchState && setDropdownBranchState(false);
                        }}
                        placeholder={'Required'}
                        label="Zip Code"
                        textColor={"#FFFFFF"}
                        left={
                            <TextInput.Icon icon="dialpad" size={hp(2.8)} style={{marginTop: hp(2)}} iconColor="#FFFFFF"/>
                        }
                    />
                </View>
                <View style={styles.pickerView}>
                    <DropDownPicker
                        zIndex={5000}
                        placeholder={"Military Branch"}
                        containerStyle={dropdownBranchState && Platform.OS === 'android' && {height: hp(25)}}
                        dropDownContainerStyle={[styles.dropdownContainer, Platform.OS === 'android' ? {height: hp(20)} : {height: hp(15)}]}
                        style={styles.dropdownPicker}
                        textStyle={[styles.dropdownTextInputContentStyle, {color: '#FFFFFF'}]}
                        dropDownDirection={"BOTTOM"}
                        open={dropdownBranchState}
                        onOpen={() => {
                            setRegistrationMainError(false);
                            setIsBackButtonShown(false);
                        }}
                        onClose={() => {
                            setDropdownBranchState(false);
                            setIsBackButtonShown(true);
                        }}
                        value={militaryBranch === "" ? null : militaryBranch}
                        items={branchItems}
                        setOpen={setDropdownBranchState}
                        setValue={setMilitaryBranch}
                        setItems={setBranchItems}
                        onSelectItem={(item) => {
                            setMilitaryBranch(item.value!);

                            // validate value
                            fieldValidator.validateField(item.value!, "militaryBranch", setMilitaryBranchErrors);
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
