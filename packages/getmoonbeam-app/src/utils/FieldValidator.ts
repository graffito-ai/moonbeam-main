import dayjs from "dayjs";
import {stateItems} from "../models/Constants";
import {LoggingLevel, MilitaryBranch, MilitaryDutyStatus, VerificationDocument} from "@moonbeam/moonbeam-models";
import {logEvent} from "./AppSync";

/**
 * File used as a utility class, for validating field values for forms
 */
export class FieldValidator {

    /**
     * Utility constructor
     */
    constructor() {
    }

    /**
     * Function used to format birthday value for text input field
     *
     * @param birthday original birthday value
     * @param value new birthday value obtained while typing
     */
    public formatBirthDay = (birthday: string, value: string): string => {
        // for formatting the date to MM/DD/YYYY
        try {
            // detect deletion
            let deletion: boolean = false;
            if (birthday.length > value.length) {
                deletion = true;
            }

            if (!deletion) {
                const cleaned = ("" + value).replace(/\D/g, "");
                const match = cleaned.match(/^(\d{0,2})?(\d{0,2})?(\d{0,4})?$/);

                return match
                    ? [
                        match[1]! ? (match[1].length == 2 ? `${match[1]}/` : match[1]) : "",
                        match[2]! ? (match[2].length == 2 ? `${match[2]}/` : match[2]) : "",
                        match[3]! ? match[3] : ""
                    ].join("")
                    : "";
            } else {
                return value;
            }
        } catch (err) {
            return "";
        }
    }

    /**
     * Function used to format the expiration date value for text input field
     *
     * @param expirationDate original expiration date value
     * @param value new expiration date value obtained while typing
     */
    public formatExpirationDate = (expirationDate: string, value: string): string => {
        // for formatting the date to MM/YYYY
        try {
            // detect deletion
            let deletion: boolean = false;
            if (expirationDate.length > value.length) {
                deletion = true;
            }

            if (!deletion) {
                const cleaned = ("" + value).replace(/\D/g, "");
                const match = cleaned.match(/^(\d{0,2})?(\d{0,4})?$/);

                return match
                    ? [
                        match[1]! ? (match[1].length == 2 ? `${match[1]}/` : match[1]) : "",
                        match[2]! ? match[2] : ""
                    ].join("")
                    : "";
            } else {
                return value;
            }
        } catch (err) {
            return "";
        }
    }

    /**
     * Function used to format a code verification digit's value for text input field
     *
     * @param newDigit new digit value obtained while typing
     */
    public formatCodeDigit = (newDigit: string): string => {
        // for formatting the code verification digit to one single number digit
        try {
            // we are just adding a new digit to an empty value
            if (newDigit.length !== 0 ) {
                // we are just adding one digit
                if (newDigit.length === 1) {
                    const match = newDigit.charAt(0).match(/^(\d)?$/);
                    return match
                        ? [
                            match[0]! ? `${match[0]}` : ""
                        ].join("")
                        : "";
                }
                // we are adding something on top of the old one
                else if (newDigit.length === 2) {
                    const match = newDigit.charAt(1).match(/^(\d)?$/);
                    return match
                        ? [
                            match[0]! ? `${match[0]}` : ""
                        ].join("")
                        : newDigit.charAt(0);
                } else {
                    // we should never get here
                    return '';
                }
            } else {
                // it's just an empty value somehow
                return '';
            }
        } catch (err) {
            return "";
        }
    }

    /**
     * Function used to format a year entry for text input field
     *
     * @param year original year value
     * @param value new year value obtained while typing
     */
    public formatYearEntry = (year: string, value: string): string => {
        // for formatting the date to a valid XXXX year
        try {
            // detect deletion
            let deletion: boolean = false;
            if (year.length > value.length) {
                deletion = true;
            }

            if (!deletion) {
                let cleaned = ("" + value).replace(/\D/g, "");
                const match = cleaned.match(/^(\d{0,4})?$/);

                return match
                    ? [
                        match[1]! ? match[1] : "",
                        match[2]! ? match[2] : "",
                        match[3]! ? match[3] : "",
                        match[4]! ? match[4] : ""
                    ].join("")
                    : "";
            } else {
                return value;
            }
        } catch (err) {
            return "";
        }
    }

    /**
     * Function used to format a card number entry for text input field
     *
     * @param cardNumber original card number value
     * @param value new card number value obtained while typing
     */
    public formatCardNumberEntry = (cardNumber: string, value: string): string => {
        // for formatting the date to a valid card number format
        try {
            // detect deletion
            let deletion: boolean = false;
            if (cardNumber.length > value.length) {
                deletion = true;
            }

            if (!deletion) {
                let cleaned = ("" + value).replace(/\D/g, "");
                const match = cleaned.match(/^(\d{0,20})?$/);

                return match
                    ? [
                        match[1]! ? match[1] : "",
                        match[2]! ? match[2] : "",
                        match[3]! ? match[3] : "",
                        match[4]! ? match[4] : "",
                        match[5]! ? match[5] : "",
                        match[6]! ? match[6] : "",
                        match[7]! ? match[7] : "",
                        match[8]! ? match[8] : "",
                        match[9]! ? match[9] : "",
                        match[10]! ? match[10] : "",
                        match[11]! ? match[11] : "",
                        match[12]! ? match[12] : "",
                        match[13]! ? match[13] : "",
                        match[14]! ? match[14] : "",
                        match[15]! ? match[15] : "",
                        match[16]! ? match[16] : "",
                        match[17]! ? match[17] : "",
                        match[18]! ? match[18] : "",
                        match[19]! ? match[19] : "",
                        match[20]! ? match[20] : ""
                    ].join("")
                    : "";
            } else {
                return value;
            }
        } catch (err) {
            return "";
        }
    }

    /**
     * Function used to format SSN for text input field
     *
     * @param ssnValue original ssn value passed in
     * @param value new SSN value obtained while typing
     */
    public formatSSNValue = (ssnValue: string, value: string): string => {
        // for formatting the SSN value to XXX-XX-XXXX
        try {
            // detect deletion
            let deletion: boolean = false;
            if (ssnValue.length > value.length) {
                deletion = true;
            }

            if (!deletion) {
                let cleaned = ("" + value).replace(/\D/g, "");
                const match = cleaned.match(/^(\d{0,3})?(\d{0,2})?(\d{0,4})?$/);

                return match
                    ? [
                        match[1]! ? (match[1].length == 3 ? `${match[1]} - ` : `${match[1]}`) : "",
                        match[2]! ? (match[2].length == 2 ? `${match[2]} - ` : match[2]) : "",
                        match[3]! ? match[3] : ""
                    ].join("")
                    : "";
            } else {
                return value;
            }
        } catch (err) {
            return "";
        }
    }

    /**
     * Function used to format phone number value for text input field
     *
     * @param phoneNumber original phone number value
     * @param value new phone number value obtained while typing
     */
    public formatPhoneNumber = (phoneNumber: string, value: string): string => {
        // for formatting the phone number to +1 (XXX)-XXX-XXXX
        try {
            // detect deletion
            let deletion: boolean = false;
            if (phoneNumber.length > value.length) {
                deletion = true;
            }

            if (!deletion) {
                let cleaned = ("" + value).replace('+1', "").replace(/\D/g, "");
                cleaned = `+1 ${cleaned}`;
                const match = cleaned.match(/^(\+1)\s(\d{0,3})?(\d{0,3})?(\d{0,4})?$/);

                return match
                    ? [
                        match[1]! ? `${match[1]} ` : "",
                        match[2]! ? (match[2].length == 3 ? `(${match[2]}) - ` : `(${match[2]}`) : "",
                        match[3]! ? (match[3].length == 3 ? `${match[3]} - ` : match[3]) : "",
                        match[4]! ? match[4] : ""
                    ].join("")
                    : "";
            } else {
                return value;
            }
        } catch (err) {
            return "";
        }
    }

    /**
     * Helper function used to validate fields
     *
     * @param fieldValue value of the field to validate
     * @param fieldName name of the field to validate
     * @param setErrorsArray method to popular the array of errors for that state
     * @param comparisonFieldValue value of the field to compare the field value to (optional, and specifically
     * applicable to comparisons lke password and confirmation password)
     */
    public validateField = (fieldValue: string, fieldName: string, setErrorsArray: any, comparisonFieldValue?: string) => {
        switch (fieldName) {
            case 'firstName':
                if (!/^[^\t\n0123456789±!@£$%^&*_+§¡€#¢§¶•ªº«\\\/<>?:;|=.,]{2,100}$/.test(fieldValue)) {
                    setErrorsArray(["Invalid First Name."]);
                } else {
                    setErrorsArray([]);
                }
                break;
            case 'lastName':
                if (!/^[^\t\n0123456789±!@£$%^&*_+§¡€#¢§¶•ªº«\\\/<>?:;|=.,]{2,500}$/.test(fieldValue)) {
                    setErrorsArray(["Invalid Last Name."]);
                } else {
                    setErrorsArray([]);
                }
                break;
            case 'email':
                if (!/^([^\s@]+@[^\s@]+\.[^\s@]+)$/.test(fieldValue.trimStart().trimEnd())) {
                    setErrorsArray(["Invalid Email."]);
                } else {
                    setErrorsArray([]);
                }
                break;
            case 'birthday':
                // use to calculate the difference in years
                const birthdayValue = `${fieldValue.split("/")[2]}-${fieldValue.split("/")[0]}-${fieldValue.split("/")[1]}`;

                if (!/^(\d{2})(\/)(\d{2})(\/)(\d{4})$/.test(fieldValue)) {
                    setErrorsArray(["Invalid Birthday."]);
                } else if (Math.abs(dayjs(Date.parse(birthdayValue)).diff(Date.now(), "years")) > 100) {
                    // maximum age is 100, and minimum age is 17
                    setErrorsArray(["You must be at most 100 years old."]);
                } else if (Math.abs(dayjs(Date.parse(birthdayValue)).diff(Date.now(), "years")) < 17) {
                    // maximum age is 100, and minimum age is 17
                    setErrorsArray(["You must be at least 17 years old."]);
                } else {
                    setErrorsArray([]);
                }
                break;
            case 'phoneNumber':
                if (!/^(\+1)(\s)(\()(\d{3})(\))(\s)(-)(\s)(\d{3})(\s)(-)(\s)(\d{4})$/.test(fieldValue)) {
                    setErrorsArray(["Invalid Phone Number."]);
                } else {
                    setErrorsArray([]);
                }
                break;
            case 'ssn':
                if (!/^(\d{3})(\s)(-)(\s)(\d{2})(\s)(-)(\s)(\d{4})$/.test(fieldValue)) {
                    setErrorsArray(["Invalid SSN Value."]);
                } else {
                    setErrorsArray([]);
                }
                break;
            case 'enlistingYear':
                // get current year value
                const currentYear = new Date().getFullYear();

                if (!/^(\d{4})$/.test(fieldValue)) {
                    setErrorsArray(["Invalid Enlisting Year."]);
                } else if (Math.abs(currentYear - Number(fieldValue)) > 83 || currentYear < Number(fieldValue)) {
                    // the enlisting year can't be more than 83 years in the past (since you can enlist at 17-18), or in the future
                    setErrorsArray(["Invalid Enlisting Year."]);
                } else {
                    setErrorsArray([]);
                }
                break;
            case 'dutyStatus':
                if (fieldValue !== MilitaryDutyStatus.ActiveDuty && fieldValue !== MilitaryDutyStatus.NationalGuard &&
                    fieldValue !== MilitaryDutyStatus.Reservist && fieldValue !== MilitaryDutyStatus.Veteran) {
                    setErrorsArray(["Invalid Duty Status."]);
                } else {
                    setErrorsArray([]);
                }
                break;
            case 'addressLine':
                if (!/^((\d{1,})+(\,)?) (([a-zA-Z0-9\s]{1,})+(\,)?) ([a-zA-Z0-9\s]{1,})$/.test(fieldValue)) {
                    setErrorsArray(["Invalid Street Address."]);
                } else {
                    setErrorsArray([]);
                }
                break;
            case 'addressCity':
                if (!/^([a-zA-Z\s]{2,})$/.test(fieldValue)) {
                    setErrorsArray(["Invalid City."]);
                } else {
                    setErrorsArray([]);
                }
                break;
            case 'addressState':
                if (!/^(([Aa][EeLlKkSsZzRr])|([Cc][AaOoTt])|([Dd][EeCc])|([Ff][MmLl])|([Gg][AaUu])|([Hh][Ii])|([Ii][DdLlNnAa])|([Kk][SsYy])|([Ll][Aa])|([Mm][EeHhDdAaIiNnSsOoTt])|([Nn][EeVvHhJjMmYyCcDd])|([Mm][Pp])|([Oo][HhKkRr])|([Pp][WwAaRr])|([Rr][Ii])|([Ss][CcDd])|([Tt][NnXx])|([Uu][Tt])|([Vv][TtIiAa])|([Ww][AaVvIiYy]))$/.test(fieldValue) &&
                    stateItems.filter((state) => state.toLowerCase() === fieldValue.toLowerCase()).length !== 1) {
                    setErrorsArray(["Invalid State."]);
                } else {
                    setErrorsArray([]);
                }
                break;
            case 'addressZip':
                if (!/^\d{5}(?:[-\s]\d{4})?$/.test(fieldValue)) {
                    setErrorsArray(["Invalid Zip Code."]);
                } else {
                    setErrorsArray([]);
                }
                break;
            case 'militaryBranch':
                if (fieldValue !== MilitaryBranch.AirForce && fieldValue !== MilitaryBranch.Army &&
                    fieldValue !== MilitaryBranch.CoastGuard && fieldValue !== MilitaryBranch.MarineCorps &&
                    fieldValue !== MilitaryBranch.Navy && fieldValue !== MilitaryBranch.SpaceForce) {
                    setErrorsArray(["Invalid Military Branch."]);
                } else {
                    setErrorsArray([]);
                }
                break;
            case 'verificationDocument':
                if (fieldValue !== VerificationDocument.DD214 && fieldValue !== VerificationDocument.LICENSE &&
                    fieldValue !== VerificationDocument.VETERAN_ID && fieldValue !== VerificationDocument.VA_ELIGIBILITY_LETTER &&
                    fieldValue !== VerificationDocument.ERB_ORB && fieldValue !== VerificationDocument.LES &&
                    fieldValue !== VerificationDocument.NGB_22 && fieldValue !== VerificationDocument.VHIC &&
                    fieldValue !== VerificationDocument.VIC && fieldValue !== VerificationDocument.VA_DISABILITY_LETTER &&
                    fieldValue !== VerificationDocument.MARRIAGE_LICENSE_OR_CERTIFICATE) {
                    setErrorsArray(["Invalid Verification Document."]);
                } else {
                    setErrorsArray([]);
                }
                break;
            /**
             * !/^((?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{12,72})$/ - old password regex
             * 12 - 72 chars, 1 special char, 1 number, 1 lowerCase, 1 UpperCase.
             */
            // password during login
            case 'password':
                if (fieldValue === null || fieldValue === undefined || fieldValue.length === 0) {
                    setErrorsArray(["Invalid Password."]);
                } else {
                    setErrorsArray([]);
                }
                break;
            // password during signup
            case 'newPassword':
                if (!/^.{8,}$/.test(fieldValue)) {
                    setErrorsArray(["Invalid Password - minimum 8 characters long."]);
                } else {
                    setErrorsArray([]);
                }
                break;
            case 'confirmPassword':
                if (!/^.{8,}$/.test(fieldValue)
                    || !/^.{8,}$/.test(comparisonFieldValue!)) {
                    setErrorsArray(["Invalid Password - minimum 8 characters long."]);
                } else if (fieldValue !== comparisonFieldValue!) {
                    setErrorsArray(["Passwords do not match."]);
                } else {
                    setErrorsArray([]);
                }
                break;
            default:
                const errorMessage = `Unexpected field name! ${fieldName}`;
                console.log(errorMessage);
                logEvent(errorMessage, LoggingLevel.Error, true).then(() => {});
        }
    };
}
