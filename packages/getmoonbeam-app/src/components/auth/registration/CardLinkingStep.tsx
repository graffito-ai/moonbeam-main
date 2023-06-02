import React, {useEffect, useState} from "react";
import {TextInput} from "react-native-paper";
import {styles} from "../../../styles/registration.module";
import {Text, View} from "react-native";
import {useRecoilState} from "recoil";
import {
    cardLinkingDisclaimerCheckState,
    cardNumberErrorsState,
    cardNumberState,
    expirationDateErrorsState,
    expirationDateState,
    issuingCountryDropdownState,
    issuingCountryErrorsState,
    issuingCountryState,
    registrationMainErrorState
} from "../../../recoil/AuthAtom";
import DropDownPicker from "react-native-dropdown-picker";
import {issuingCountrySelectionItems} from "../../../models/Constants";
import {FieldValidator} from "../../../utils/FieldValidator";
import {Checkbox} from "expo-checkbox";

/**
 * CardLinkingStep component.
 */
export const CardLinkingStep = () => {
    // constants used to keep track of local component state
    const [issuingCountryItems, setIssuingCountryItems] = useState(issuingCountrySelectionItems);
    const [cardNumberFocus, setIsCreditCardNumberFocus] = useState<boolean>(false);
    const [expirationDateFocus, setIsExpirationDateFocus] = useState<boolean>(false);
    // constants used to keep track of shared states
    const [cardNumber, setCardNumber] = useRecoilState(cardNumberState);
    const [expirationDate, setExpirationDate] = useRecoilState(expirationDateState);
    const [cardNumberErrors, setCardNumberErrors] = useRecoilState(cardNumberErrorsState);
    const [expirationDateErrors, setExpirationDateErrors] = useRecoilState(expirationDateErrorsState);
    const [issuingCountryErrors, setIssuingCountryErrors] = useRecoilState(issuingCountryErrorsState);
    const [issuingCountry, setIssuingCountry] = useRecoilState(issuingCountryState);
    const [dropdownIssuingCountryState, setDropdownIssuingCountryState] = useRecoilState(issuingCountryDropdownState);
    const [registrationMainError, setRegistrationMainError] = useRecoilState(registrationMainErrorState);
    const [cardLinkingDisclaimer, setCardLinkingDisclaimer] = useRecoilState(cardLinkingDisclaimerCheckState);

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
        if (cardNumberFocus && cardNumber !== "") {
            fieldValidator.validateField(cardNumber, "cardNumber", setCardNumberErrors);
        }
        cardNumber === "" && setCardNumberErrors([]);

        if (expirationDateFocus && expirationDate !== "") {
            fieldValidator.validateField(expirationDate, "expirationDate", setExpirationDateErrors);
        }
        expirationDate === "" && setExpirationDateErrors([]);

        if (issuingCountry !== "") {
            fieldValidator.validateField(issuingCountry, "issuingCountry", setIssuingCountryErrors);
        }
        issuingCountry === "" && setIssuingCountryErrors([]);
    }, [cardNumber, cardNumberFocus, expirationDateFocus, expirationDate, issuingCountry]);

    // return the component for the CardLinkingStep, part of the Registration page
    return (
        <>
            {registrationMainError
                ? <Text style={styles.errorMessage}>Please fill out the information below!</Text>
                : (cardNumberErrors.length !== 0 && !registrationMainError)
                    ? <Text style={styles.errorMessage}>{cardNumberErrors[0]}</Text>
                    : (expirationDateErrors.length !== 0 && !registrationMainError)
                        ? <Text style={styles.errorMessage}>{expirationDateErrors[0]}</Text>
                        : (issuingCountryErrors.length !== 0 && !registrationMainError)
                            ? <Text style={styles.errorMessage}>{issuingCountryErrors[0]}</Text>
                            : <></>
            }
            <View style={styles.cardLinkingView}>
                <DropDownPicker
                    zIndex={5000}
                    placeholder={"Country of Issue"}
                    dropDownContainerStyle={styles.issuingCountryDropdownContainer}
                    style={styles.issuingCountryDropdownPicker}
                    textStyle={[styles.textInputContentStyle, {color: '#D9D9D9'}]}
                    dropDownDirection={"BOTTOM"}
                    open={dropdownIssuingCountryState}
                    onOpen={() => {
                        setRegistrationMainError(false);
                    }}
                    onClose={() => {
                        setDropdownIssuingCountryState(false);
                    }}
                    value={issuingCountry === "" ? null : issuingCountry}
                    items={issuingCountryItems}
                    setOpen={setDropdownIssuingCountryState}
                    setValue={setIssuingCountry}
                    setItems={setIssuingCountryItems}
                    onSelectItem={(item) => {
                        setIssuingCountry(item.value!);

                        // validate value
                        fieldValidator.validateField(item.value!, "issuingCountry", setIssuingCountryErrors);
                    }}
                    theme="DARK"
                    multiple={false}
                    mode="SIMPLE"
                    searchable={true}
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
                        setIsCreditCardNumberFocus(true);
                        setRegistrationMainError(false);

                        // format value
                        value = fieldValidator.formatCardNumberEntry(cardNumber, value.toString());

                        setCardNumber(value.toString());
                    }}
                    onBlur={() => {
                        setIsCreditCardNumberFocus(false);
                    }}
                    value={cardNumber}
                    contentStyle={styles.textInputContentStyle}
                    style={[cardNumberFocus ? styles.textInputFocus : styles.textInput, {zIndex: 6000}]}
                    onFocus={() => {
                        setIsCreditCardNumberFocus(true);

                        // close the dropdown if opened
                        dropdownIssuingCountryState && setDropdownIssuingCountryState(false);
                    }}
                    placeholder={'15 or 16 digit Card Number'}
                    label="Card Number"
                    textColor={"#FFFFFF"}
                    right={
                        <TextInput.Icon
                            size={100}
                            style={styles.cardGroupImage}
                            icon={require('../../../../assets/art/credit-card-logo-group.png')}
                            iconColor="#FFFFFF"/>
                    }
                />
                <View style={styles.inputColumnViewCardDetails}>
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
                            setIsExpirationDateFocus(true);
                            setRegistrationMainError(false);

                            // format value
                            value = fieldValidator.formatExpirationDate(expirationDate, value.toString());

                            setExpirationDate(value.toString());
                        }}
                        onBlur={() => {
                            setIsExpirationDateFocus(false);
                        }}
                        value={expirationDate}
                        contentStyle={styles.textInputNarrowContentStyle}
                        style={[expirationDateFocus ? styles.textInputNarrowFocus : styles.textInputNarrow]}
                        onFocus={() => {
                            setIsExpirationDateFocus(true);

                            // close the dropdown if opened
                            dropdownIssuingCountryState && setDropdownIssuingCountryState(false);
                        }}
                        placeholder={'MM/YYYY'}
                        label="Expiration"
                        textColor={"#FFFFFF"}
                        left={<TextInput.Icon icon="calendar-remove" iconColor="#FFFFFF"/>}
                    />
                </View>
                <View style={styles.cardLinkingDisclaimerView}>
                    <Checkbox
                        style={styles.disclaimerCheckbox}
                        color={cardLinkingDisclaimer ? 'blue' : '#F2FF5D'}
                        value={cardLinkingDisclaimer}
                        onValueChange={(newValue) => {
                            setCardLinkingDisclaimer(newValue);

                            // clear any errors (if any)
                            setRegistrationMainError(false);
                        }}
                    />
                    <Text
                        style={styles.disclaimerText}>{'By submitting your card information you authorize Visa, MasterCard, or American Express' +
                        ' (depending on linked card), to monitor and share transaction data with Fidel (our service provider), in order to participate in merchant offers/programs through Moonbeam.' +
                        ' You acknowledge and agree that Fidel may share certain details of your qualifying transactions with Moonbeam, to enable this participation, and for other purposes.' +
                        ' You may opt-out of transaction monitoring at any time, via the Settings menu. Any transaction monitoring or data sharing is done, in accordance with our'}
                        <Text style={styles.disclaimerTextHighlighted}
                              onPress={() => {
                              }}> Privacy Policy, </Text>{"and"}
                        <Text style={styles.disclaimerTextHighlighted}
                              onPress={() => {
                              }}> Terms & Conditions, </Text>
                    </Text>
                </View>
            </View>
        </>
    );
}
