import dayjs from "dayjs";
import {stateItems} from "../models/Content";

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
     * Function used to format a code verification digit's value for text input field
     *
     * @param codeDigit original digit value
     * @param value new digit value obtained while typing
     */
    public formatCodeDigit = (codeDigit: string, value: string): string => {
        // for formatting the code verification digit to one single number digit
        try {
            // detect deletion
            let deletion: boolean = false;
            if (codeDigit.length > value.length) {
                deletion = true;
            }

            if (!deletion) {
                const cleaned = ("" + value).replace(/\D/g, "");
                const match = cleaned.match(/^(\d)?$/);

                return match
                    ? [
                        match[1]! ? `${match[1]}` : ""
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
     * Function used to format phone number value for text input field
     *
     * @param phoneNumber original phone number value
     * @param value new birthday value obtained while typing
     */
    public formatPhoneNumber = (phoneNumber: string, value: string): string => {
        // for formatting the date to +1 (XXX)-XXX-XXXX
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
     */
    public validateField = (fieldValue: string, fieldName: string, setErrorsArray: any) => {
        switch (fieldName) {
            case 'firstName':
                if (!/^[^\s\t\n0123456789±!@£$%^&*_+§¡€#¢§¶•ªº«\\\/<>?:;|=.,]{2,100}$/.test(fieldValue)) {
                    setErrorsArray(["Invalid First Name."]);
                } else {
                    setErrorsArray([]);
                }
                break;
            case 'lastName':
                if (!/^[^\s\t\n0123456789±!@£$%^&*_+§¡€#¢§¶•ªº«\\\/<>?:;|=.,]{2,500}$/.test(fieldValue)) {
                    setErrorsArray(["Invalid Last Name."]);
                } else {
                    setErrorsArray([]);
                }
                break;
            case 'email':
                if (!/^([^\s@]+@[^\s@]+\.[^\s@]+)$/.test(fieldValue)) {
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
            case 'enlistingYear':
                if (!/^(\d{4})$/.test(fieldValue)) {
                    setErrorsArray(["Invalid Enlisting Year."]);
                } else {
                    setErrorsArray([]);
                }
                break;
            case 'dutyStatus':
                if (fieldValue !== "Active Duty" && fieldValue !== "National Guard" &&
                    fieldValue !== "Reservist" && fieldValue !== "Veteran") {
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
                if (fieldValue !== "Air Force" && fieldValue !== "Army" &&
                    fieldValue !== "Coast Guard" && fieldValue !== "Marine Corps" &&
                    fieldValue !== "Navy" && fieldValue !== "Space Force") {
                    setErrorsArray(["Invalid Duty Status."]);
                } else {
                    setErrorsArray([]);
                }
                break;
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
                break;
            case 'confirmPassword':
                break;
            default:
                console.log(fieldName);
                console.log('Unexpected field name!');
        }
    };
}
