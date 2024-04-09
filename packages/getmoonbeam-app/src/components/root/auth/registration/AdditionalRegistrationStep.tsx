import {Platform, Text, TouchableOpacity, View} from "react-native";
import React, {useEffect, useMemo, useRef, useState} from "react";
import {styles} from "../../../../styles/registration.module";
import {useRecoilState} from "recoil";
import {
    addressCityErrorsState,
    addressCityState,
    addressLineErrorsState,
    addressLineFocusState,
    addressLineState,
    addressStateErrorsState,
    addressStateState,
    addressZipErrorsState,
    addressZipState,
    currentMemberAffiliationState,
    militaryBranchErrorsState,
    militaryBranchState,
    militaryBranchValueState,
    registrationBackButtonShown,
    registrationMainErrorState
} from "../../../../recoil/AuthAtom";
import {militaryBranchItems} from "../../../../models/Constants";
import {TextInput} from "react-native-paper";
import {FieldValidator} from "../../../../utils/FieldValidator";
import {LocationPredictionType, MilitaryAffiliation, OsType} from "@moonbeam/moonbeam-models";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import DropDownPicker from "react-native-dropdown-picker";
import {DataProvider, LayoutProvider, RecyclerListView} from "recyclerlistview";
import { searchAddressPredictions } from "../../../../utils/AppSync";

/**
 * AdditionalRegistrationStep component.
 *
 * @constructor constructor for the component.
 */
export const AdditionalRegistrationStep = () => {
    // constants used to keep track of local component state
    const predictionsListView = useRef();
    const [predictions, setPredictions] = useState<LocationPredictionType[]>([]);
    const [dataProvider, setDataProvider] = useState<DataProvider | null>(null);
    const [layoutProvider, setLayoutProvider] = useState<LayoutProvider | null>(null);
    const [autoFilledAddressLine, setAutoFilledAddressLine] = useState<boolean>(false);
    const [branchItems, setBranchItems] = useState(militaryBranchItems);
    const [addressCityFocus, setIsAddressCityFocus] = useState<boolean>(false);
    const [addressStateFocus, setIsAddressStateFocus] = useState<boolean>(false);
    const [addressZipFocus, setIsAddressZipFocus] = useState<boolean>(false);
    // constants used to keep track of shared states
    const [addressLineFocus, setIsAddressLineFocus] = useRecoilState(addressLineFocusState);
    const [currentMemberAffiliation,] = useRecoilState(currentMemberAffiliationState);
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

        // populate the address line predictions data provider and list view
        if (predictions !== undefined && predictions !== null && predictions.length > 0 && layoutProvider === null && dataProvider === null) {
            setDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(predictions));
            setLayoutProvider(new LayoutProvider(
                _ => 0,
                (_, dim) => {
                    dim.width = wp(87);
                    dim.height = hp(7.5);
                }
            ));
        }
        if (predictions.length === 0) {
            setIsAddressLineFocus(false);
        }
    }, [dataProvider, layoutProvider, predictions,
        addressLineFocus, addressLine, addressCityFocus, addressCity,
        addressStateFocus, addressState,
        addressZipFocus, addressZip]);

    /**
     * Function used to populate the rows containing address line prediction data.
     *
     * @param type row type to be passed in
     * @param data data to be passed in for the row
     * @param index row index
     *
     * @return a {@link React.JSX.Element} or an {@link Array} of {@link React.JSX.Element} representing the
     * React node and/or nodes containing the address line predictions.
     */
    const renderPredictionData = useMemo(() => (_type: string | number, data: LocationPredictionType, index: number): React.JSX.Element | React.JSX.Element[] => {
        if (predictions !== undefined && predictions !== null && predictions.length !== 0) {
            // format location prediction data accordingly
            const locationPredictionData = {
                address_components: JSON.parse(data.address_components!),
                description: data.description,
                matched_substrings: JSON.parse(data.matched_substrings!),
                place_id: data.place_id,
                reference: data.reference,
                structured_formatting: JSON.parse(data.structured_formatting!),
                terms: JSON.parse(data.terms!),
                types: data.types
            }
            return (
                <>
                    <TouchableOpacity
                        style={[styles.addressLinePredictionItem, index !== predictions.length - 1 && {
                            borderBottomColor: '#FFFFFF',
                            borderBottomWidth: hp(0.15)
                        }]}
                        onPress={() => {
                            if (locationPredictionData && locationPredictionData.address_components && locationPredictionData.address_components.length !== 0) {
                                setAutoFilledAddressLine(true);
                                // autofilled address details
                                let autoFilledAddressLine = '';
                                let autoFilledCity = '';
                                let autoFilledState = '';
                                let autoFilledZip = '';
                                locationPredictionData.address_components.forEach(component => {
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
                                setAddressCity(autoFilledCity);
                                setAddressState(autoFilledState);
                                setAddressZip(autoFilledZip);
                                setAddressLine(autoFilledAddressLine);
                                setAddressCityErrors([]);
                                setAddressLineErrors([]);
                                setAddressStateErrors([]);
                                setAddressZipErrors([]);
                                setPredictions([]);
                                setIsAddressLineFocus(false);
                            }
                        }}>
                        <Text style={styles.addressLinePredictionDescription}>{locationPredictionData.description}</Text>
                    </TouchableOpacity>
                </>
            );
        } else {
            return (<></>);
        }
    }, [predictions]);

    // return the component for the AdditionalRegistrationStep, part of the Registration page
    return (
        <>
            {currentMemberAffiliation === MilitaryAffiliation.ServiceMember
                ? (registrationMainError
                    ?
                    <Text style={[styles.errorMessage, {bottom: hp(2.4)}]}>Please fill out the information below!</Text>
                    : (addressLineErrors.length !== 0 && !registrationMainError)
                        ? <Text style={[styles.errorMessage, {bottom: hp(2.4)}]}>{addressLineErrors[0]}</Text>
                        : (addressCityErrors.length !== 0 && !registrationMainError)
                            ? <Text style={[styles.errorMessage, {bottom: hp(2.4)}]}>{addressCityErrors[0]}</Text>
                            : (addressStateErrors.length !== 0 && !registrationMainError)
                                ? <Text style={[styles.errorMessage, {bottom: hp(2.4)}]}>{addressStateErrors[0]}</Text>
                                : (addressZipErrors.length !== 0 && !registrationMainError)
                                    ?
                                    <Text style={[styles.errorMessage, {bottom: hp(2.4)}]}>{addressZipErrors[0]}</Text>
                                    : (militaryBranchErrors.length !== 0 && !registrationMainError)
                                        ? <Text
                                            style={[styles.errorMessage, {bottom: hp(2.4)}]}>{militaryBranchErrors[0]}</Text>
                                        : <></>)
                : (registrationMainError
                    ?
                    <Text style={[styles.errorMessage, {bottom: hp(2.4)}]}>Please fill out the information below!</Text>
                    : (addressLineErrors.length !== 0 && !registrationMainError)
                        ? <Text style={[styles.errorMessage, {bottom: hp(2.4)}]}>{addressLineErrors[0]}</Text>
                        : (addressCityErrors.length !== 0 && !registrationMainError)
                            ? <Text style={[styles.errorMessage, {bottom: hp(2.4)}]}>{addressCityErrors[0]}</Text>
                            : (addressStateErrors.length !== 0 && !registrationMainError)
                                ? <Text style={[styles.errorMessage, {bottom: hp(2.4)}]}>{addressStateErrors[0]}</Text>
                                : (addressZipErrors.length !== 0 && !registrationMainError)
                                    ?
                                    <Text style={[styles.errorMessage, {bottom: hp(2.4)}]}>{addressZipErrors[0]}</Text>
                                    : <></>)
            }
            <View style={{left: wp(5), top: hp(1)}}>
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
                    value={addressLine}
                    contentStyle={styles.textInputContentStyle}
                    style={[addressLineFocus ? styles.textInputFocusAddressLine : styles.textInputAddressLine, addressLine.length === 0 && {height: hp(6)}]}
                    placeholder={'Required (1 West Example Street)'}
                    label={"Street Address"}
                    textColor={"#FFFFFF"}
                    left={<TextInput.Icon icon="home-map-marker" size={hp(3)}
                                          style={{marginTop: hp(2)}} color="#FFFFFF"/>}
                    onChangeText={async (value: React.SetStateAction<string>) => {
                        setIsAddressLineFocus(true);
                        setRegistrationMainError(false);
                        if (!autoFilledAddressLine) {
                            setAddressLine(value.toString());
                            if (value.toString().length >= 5) {
                                const addressPredictionsResult =
                                    await searchAddressPredictions(value.toString(), Platform.OS === 'ios' ? OsType.Ios : OsType.Android);
                                const addressPredictions = (addressPredictionsResult.data !== null && addressPredictionsResult.data !== undefined)
                                    ? addressPredictionsResult.data as LocationPredictionType[]
                                    : [];
                                setPredictions(addressPredictions);
                                setDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(addressPredictions));
                                setLayoutProvider(new LayoutProvider(
                                    _ => 0,
                                    (_, dim) => {
                                        dim.width = wp(87);
                                        dim.height = hp(7.5);
                                    }
                                ));
                            }
                        }
                    }}
                    onBlur={() => {
                        setIsAddressLineFocus(false);
                        setIsBackButtonShown(true);
                    }}
                    onFocus={() => {
                        setAutoFilledAddressLine(false);

                        setIsAddressLineFocus(true);
                        setIsBackButtonShown(false);

                        // close the dropdown if opened
                        dropdownBranchState && setDropdownBranchState(false);
                    }}
                    onPressIn={() => {
                        setAddressLine('');
                    }}
                    clearTextOnFocus={true}
                    clearButtonMode={'never'}
                    returnKeyType={'search'}
                />
            </View>
            {
                dataProvider !== null && layoutProvider !== null && predictions.length !== 0 && addressLineFocus &&
                <View style={[
                    styles.addressLinePredictionsDropdownView,
                    (addressLineErrors.length !== 0 || registrationMainError ||
                        addressCityErrors.length !== 0 || addressStateErrors.length !== 0 || addressZipErrors.length !== 0) ? {
                        bottom: hp(1.2),
                    } : {
                        top: hp(1.2),
                    },
                ]}>
                    <RecyclerListView
                        // @ts-ignore
                        ref={predictionsListView}
                        style={{}}
                        layoutProvider={layoutProvider!}
                        dataProvider={dataProvider!}
                        rowRenderer={renderPredictionData}
                        isHorizontal={false}
                        forceNonDeterministicRendering={true}
                        {
                            ...(Platform.OS === 'ios') ?
                                {onEndReachedThreshold: 0} :
                                {onEndReachedThreshold: 1}
                        }
                        scrollViewProps={{
                            keyboardShouldPersistTaps: 'always',
                            pagingEnabled: "true",
                            decelerationRate: "fast",
                            // snapToAlignment: "start",
                            persistentScrollbar: false,
                            showsVerticalScrollIndicator: false,
                        }}
                    />
                </View>
            }
            {
                (!addressLineFocus || predictions.length === 0) &&
                <View
                    style={[styles.additionalRegistrationView]}>
                    <View style={[styles.additionalRegistrationBottomInputsView,
                        currentMemberAffiliation !== MilitaryAffiliation.ServiceMember && {bottom: hp(0.5)}
                    ]}>
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
                                                color="#FFFFFF"/>
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
                                                    color="#FFFFFF"/>
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
                                                    color="#FFFFFF"/>
                                }
                            />
                        </View>
                        {
                            currentMemberAffiliation === MilitaryAffiliation.ServiceMember &&
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
                        }
                    </View>
                </View>
            }
        </>
    );
}
