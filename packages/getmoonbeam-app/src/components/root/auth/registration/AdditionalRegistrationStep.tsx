import {Platform, Text, View} from "react-native";
import React, {useEffect, useState} from "react";
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
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {GooglePlacesAutocomplete} from "react-native-google-places-autocomplete";
import DropDownPicker from "react-native-dropdown-picker";

/**
 * AdditionalRegistrationStep component.
 *
 * @constructor constructor for the component.
 */
export const AdditionalRegistrationStep = () => {
    // constants used to keep track of local component state
    const [autoFilledAddressLine, setAutoFilledAddressLine] = useState<boolean>(false);
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
                ? <Text style={[styles.errorMessage, {bottom: hp(2.4)}]}>Please fill out the information below!</Text>
                : (addressLineErrors.length !== 0 && !registrationMainError)
                    ? <Text style={[styles.errorMessage, {bottom: hp(2.4)}]}>{addressLineErrors[0]}</Text>
                    : (addressCityErrors.length !== 0 && !registrationMainError)
                        ? <Text style={[styles.errorMessage, {bottom: hp(2.4)}]}>{addressCityErrors[0]}</Text>
                        : (addressStateErrors.length !== 0 && !registrationMainError)
                            ? <Text style={[styles.errorMessage, {bottom: hp(2.4)}]}>{addressStateErrors[0]}</Text>
                            : (addressZipErrors.length !== 0 && !registrationMainError)
                                ? <Text style={[styles.errorMessage, {bottom: hp(2.4)}]}>{addressZipErrors[0]}</Text>
                                : (militaryBranchErrors.length !== 0 && !registrationMainError)
                                    ? <Text style={[styles.errorMessage, {bottom: hp(2.4)}]}>{militaryBranchErrors[0]}</Text>
                                    : <></>
            }
            <GooglePlacesAutocomplete
                ref={ref => {
                    ref?.setAddressText('Required (1 West Example Street)')
                }}
                placeholder="Required (1 West Example Street)"
                query={{
                    key: Platform.OS === 'android'
                        ? 'AIzaSyB8OpXoKULaEO8t46npUBbmIAM-ranxVfk'
                        : 'AIzaSyBlj5BVB9ZxZS0V_Usf9pAhuCnw2mQhcaQ',
                    language: 'en',
                    types: 'address',
                    components: 'country:us'
                }}
                keyboardShouldPersistTaps={"handled"}
                enablePoweredByContainer={false}
                fetchDetails={true}
                onPress={(_, details) => {
                    if (details && details.address_components && details.address_components.length !== 0) {
                        setAutoFilledAddressLine(true);
                        // autofilled address details
                        let autoFilledAddressLine = '';
                        let autoFilledCity = '';
                        let autoFilledState = '';
                        let autoFilledZip = '';
                        details.address_components.forEach(component => {
                            // autofill the address according to the details
                            if (component.types.includes('street_number')) {
                                autoFilledAddressLine += autoFilledAddressLine.length !== 0
                                    ? ` ${component.long_name}`
                                    : `${component.long_name}`;
                            } else if (component.types.includes('route')) {
                                autoFilledAddressLine += autoFilledAddressLine.length !== 0
                                    ? ` ${component.long_name}`
                                    : `${component.long_name}`;
                            } else if (component.types.includes('locality')) {
                                autoFilledCity += autoFilledCity.length !== 0
                                    ? ` ${component.long_name}`
                                    : `${component.long_name}`;
                            } else if (component.types.includes('administrative_area_level_1')) {
                                autoFilledState += autoFilledState.length !== 0
                                    ? ` ${component.long_name}`
                                    : `${component.long_name}`;
                            } else if (component.types.includes('postal_code')) {
                                autoFilledZip += autoFilledZip.length !== 0
                                    ? ` ${component.long_name}`
                                    : `${component.long_name}`;
                            }
                        });
                        console.log(autoFilledAddressLine);
                        setAddressCity(autoFilledCity);
                        setAddressState(autoFilledState);
                        setAddressZip(autoFilledZip);
                        setAddressLine(autoFilledAddressLine);
                        setAddressCityErrors([]);
                        setAddressLineErrors([]);
                        setAddressStateErrors([]);
                        setAddressZipErrors([]);
                    }
                }}
                styles={{
                    container: {
                        ...(addressLineErrors.length !== 0 || registrationMainError ||
                        addressCityErrors.length !== 0 || addressStateErrors.length !== 0 || addressZipErrors.length !== 0 ? {
                            bottom: hp(1.75),
                        } : {
                            top: hp(1.4),
                        }),
                        left: wp(5),
                        ...(addressLineFocus && addressLine.length !== 0) && {
                            zIndex: 1000000
                        }
                    },
                    listView: {
                        height: hp(10),
                        width: wp(87)
                    },
                    separator: {
                        height: hp(0.05),
                        backgroundColor: '#FFFFFF'
                    },
                    row: {
                        backgroundColor: '#808080',
                        width: wp(87),
                        height: hp(7.5)
                    },
                    description: {
                        paddingTop: hp(0.5),
                        paddingBottom: hp(0.5),
                        fontSize: hp(1.45),
                        width: wp(87),
                        fontFamily: 'Raleway-Bold',
                        color: '#FFFFFF'
                    }
                }}
                textInputProps={{
                    InputComp: TextInput,
                    autoCapitalize: "sentences",
                    autoCorrect: false,
                    autoComplete: "off",
                    keyboardType: "default",
                    placeholderTextColor: '#D9D9D9',
                    activeUnderlineColor: '#F2FF5D',
                    underlineColor: '#D9D9D9',
                    outlineColor: '#D9D9D9',
                    activeOutlineColor: '#F2FF5D',
                    selectionColor: '#F2FF5D',
                    mode: 'outlined',
                    value: addressLine,
                    contentStyle: styles.textInputContentStyle,
                    style: [addressLineFocus ? styles.textInputFocusAddressLine : styles.textInputAddressLine, addressLine.length === 0 && {height: hp(6)}],
                    placeholder: 'Required (1 West Example Street)',
                    label: "Street Address",
                    textColor: "#FFFFFF",
                    left: <TextInput.Icon icon="home-map-marker" size={hp(3)}
                                          style={{marginTop: hp(2)}} iconColor="#FFFFFF"/>,
                    onChangeText: (value: React.SetStateAction<string>) => {
                        setIsAddressLineFocus(true);
                        setRegistrationMainError(false);
                        !autoFilledAddressLine && setAddressLine(value.toString());
                    },
                    onBlur: () => {
                        setIsAddressLineFocus(false);
                        setIsBackButtonShown(true);
                    },
                    onFocus: () => {
                        setAutoFilledAddressLine(false);

                        setIsAddressLineFocus(true);
                        setIsBackButtonShown(false);

                        // close the dropdown if opened
                        dropdownBranchState && setDropdownBranchState(false);
                    },
                    clearTextOnFocus: true,
                    clearButtonMode: 'never'
                }}
            />
            <View style={[styles.additionalRegistrationView, addressLineFocus && addressLine.length !== 0 && {display: 'none'}]}>
                <View style={styles.additionalRegistrationBottomInputsView}>
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
                        style={[addressCityFocus ? styles.textInputFocus : styles.textInput, addressCity.length === 0 && {height: hp(6)}]}
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
                            <TextInput.Icon icon="home-city" size={hp(2.8)} style={{marginTop: hp(2)}}
                                            iconColor="#FFFFFF"/>
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
                            style={[addressStateFocus ? styles.textInputNarrowFocus : styles.textInputNarrow, addressState.length === 0 && {height: hp(6)}]}
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
                                <TextInput.Icon icon="flag" size={hp(2.8)} style={{marginTop: hp(2)}}
                                                iconColor="#FFFFFF"/>
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
                            style={[addressZipFocus ? styles.textInputNarrowFocus : styles.textInputNarrow, {marginLeft: wp(7)}, addressZip.length === 0 && {height: hp(6)}]}
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
                                <TextInput.Icon icon="dialpad" size={hp(2.8)} style={{marginTop: hp(2)}}
                                                iconColor="#FFFFFF"/>
                            }
                        />
                    </View>
                    <View style={styles.pickerView}>
                        <DropDownPicker
                            zIndex={5000}
                            placeholder={"Military Branch"}
                            // containerStyle={dropdownBranchState && Platform.OS === 'android' && {height: hp(25)}}
                            dropDownContainerStyle={[styles.dropdownContainer, Platform.OS === 'android' ? {height: hp(35)} : {height: hp(35)}]}
                            style={styles.dropdownPicker}
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
                            listMode="MODAL"
                            modalAnimationType="slide"
                            modalContentContainerStyle={{
                                backgroundColor: '#313030'
                            }}
                            modalTitleStyle={{
                                fontSize: hp(2.3),
                                fontFamily: 'Raleway-Regular',
                                color: '#F2FF5D'
                            }}
                            listItemContainerStyle={{
                                top: hp(1.5)
                            }}
                            listItemLabelStyle={styles.dropdownTextInputContentStyle}
                            modalTitle={"Select your Military Branch"}
                            // @ts-ignore
                            arrowIconStyle={{tintColor: '#FFFFFF'}}
                            // @ts-ignore
                            closeIconStyle={{tintColor: '#FFFFFF'}}
                            placeholderStyle={styles.dropdownTextInputContentStyle}
                            // @ts-ignore
                            tickIconStyle={{tintColor: '#313030'}}
                            selectedItemLabelStyle={[styles.dropdownTextInputContentStyle, {color: '#313030'}]}
                            selectedItemContainerStyle={{backgroundColor: '#D9D9D9'}}
                            itemSeparator={false}
                            labelStyle={styles.dropdownTextInputContentStyle}
                        />
                    </View>
                </View>
            </View>
        </>
    );
}
