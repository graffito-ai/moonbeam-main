import {atom} from "recoil";
import {MilitaryVerificationStatusType} from "@moonbeam/moonbeam-models";

/**
 * Atom used to keep track of the information for the current authenticated
 * user.
 */
const currentUserInformation = atom({
    key: "currentUserInformation",
    default: {}
});

/**
 * Atom used to keep track of whether the authentication component has
 * rendered before or not.
 */
const initialAuthenticationScreen = atom({
    key: "initialAuthenticationScreen",
    default: "SignIn"
});

/**
 * Atom used to keep track of the registration main error
 */
const registrationMainErrorState = atom({
    key: "registrationMainErrorState",
    default: false
});

/**
 * Atom used to keep track of the registration verification code errors
 */
const verificationCodeErrorsState = atom({
    key: "verificationCodeErrorsState",
    default: []
});

/**
 * Atom used to keep track of the registration duty status errors
 */
const dutyStatusErrorsState = atom({
    key: "dutyStatusErrorsState",
    default: []
});

/**
 * Atom used to keep track of the registration military branch errors
 */
const militaryBranchErrorsState = atom({
    key: "militaryBranchErrorsState",
    default: []
});

/**
 * Atom used to keep track of the registration enlisting year errors
 */
const enlistingYearErrorsState = atom({
    key: "enlistingYearErrorsState",
    default: []
});

/**
 * Atom used to keep track of the registration address line errors
 */
const addressLineErrorsState = atom({
    key: "addressLineErrorsState",
    default: []
});

/**
 * Atom used to keep track of the registration address city errors
 */
const addressCityErrorsState = atom({
    key: "addressCityErrorsState",
    default: []
});

/**
 * Atom used to keep track of the registration address state errors
 */
const addressStateErrorsState = atom({
    key: "addressStateErrorsState",
    default: []
});

/**
 * Atom used to keep track of the registration address zip errors
 */
const addressZipErrorsState = atom({
    key: "addressZipErrorsState",
    default: []
});

/**
 * Atom used to keep track of the registration first name errors
 */
const firstNameErrorsState = atom({
    key: "firstNameErrorsState",
    default: []
});

/**
 * Atom used to keep track of the registration last name errors
 */
const lastNameErrorsState = atom({
    key: "lastNameErrorsState",
    default: []
});

/**
 * Atom used to keep track of the registration birthday errors
 */
const birthdayErrorState = atom({
    key: "birthdayErrorState",
    default: []
});

/**
 * Atom used to keep track of the registration email errors
 */
const emailErrorsState = atom({
    key: "emailErrorsState",
    default: []
});

/**
 * Atom used to keep track of the registration phone number errors
 */
const phoneNumberErrorsState = atom({
    key: "phoneNumberErrorsState",
    default: []
});

/**
 * Atom used to keep track of whether the back button is shown for registration
 */
const registrationBackButtonShown = atom({
    key: "registrationBackButtonShown",
    default: true
});

/**
 * Atom used to keep track of the registration enlisting year
 */
const enlistingYearState = atom({
    key: "enlistingYearState",
    default: ""
});

/**
 * Atom used to keep track of the address line for registration
 */
const addressLineState = atom({
    key: "addressLineState",
    default: ""
});

/**
 * Atom used to keep track of the address city for registration
 */
const addressCityState = atom({
    key: "addressCityState",
    default: ""
});

/**
 * Atom used to keep track of the address state for registration
 */
const addressStateState = atom({
    key: "addressStateState",
    default: ""
});

/**
 * Atom used to keep track of the address zip for registration
 */
const addressZipState = atom({
    key: "addressZipState",
    default: ""
});

/**
 * Atom used to keep track of the first name for registration
 */
const firstNameState = atom({
    key: "firstNameState",
    default: ""
});

/**
 * Atom used to keep track of the last name for registration
 */
const lastNameState = atom({
    key: "lastNameState",
    default: ""
});

/**
 * Atom used to keep track of the email for registration
 */
const emailState = atom({
    key: "emailState",
    default: ""
});

/**
 * Atom used to keep track of the birthday for registration
 */
const birthdayState = atom({
    key: "birthdayState",
    default: ""
});

/**
 * Atom used to keep track of the phone number for registration
 */
const phoneNumberState = atom({
    key: "phoneNumberState",
    default: ""
});

/**
 * Atom used to keep track of the registration step number
 */
const registrationStepNumber = atom({
    key: "registrationStepNumber",
    default: 0
});

/**
 * Atom used to keep track of the registration code's first digit
 */
const registrationVerificationDigit1 = atom({
    key: "registrationVerificationDigit1",
    default: ""
});

/**
 * Atom used to keep track of the registration code's second digit
 */
const registrationVerificationDigit2 = atom({
    key: "registrationVerificationDigit2",
    default: ""
});

/**
 * Atom used to keep track of the registration code's third digit
 */
const registrationVerificationDigit3 = atom({
    key: "registrationVerificationDigit3",
    default: ""
});

/**
 * Atom used to keep track of the registration code's fourth digit
 */
const registrationVerificationDigit4 = atom({
    key: "registrationVerificationDigit4",
    default: ""
});

/**
 * Atom used to keep track of the registration code's fifth digit
 */
const registrationVerificationDigit5 = atom({
    key: "registrationVerificationDigit5",
    default: ""
});

/**
 * Atom used to keep track of the registration code's sixth digit
 */
const registrationVerificationDigit6 = atom({
    key: "registrationVerificationDigit6",
    default: ""
});

/**
 * Atom used to keep track of the registration code timer value
 */
const registrationCodeTimerValue = atom({
    key: "registrationCodeTimerValue",
    default: 30
});

/**
 * Atom used to keep track of the registration duty status dropdown
 * state.
 */
const dutyStatusState = atom({
    key: "dutyStatusState",
    default: false
});

/**
 * Atom used to keep track of the registration duty status value.
 */
const dutyStatusValueState = atom({
    key: "dutyStatusValueState",
    default: ""
});

/**
 * Atom used to keep track of the registration military branch dropdown state.
 */
const militaryBranchState = atom({
    key: "militaryBranchState",
    default: false
});

/**
 * Atom used to keep track of the registration military branch value.
 */
const militaryBranchValueState = atom({
    key: "militaryBranchValueState",
    default: ""
});

/**
 * Atom used to keep track of the registration verification disclaimer checkbox state.
 */
const militaryRegistrationDisclaimerCheckState = atom({
    key: "militaryRegistrationDisclaimerCheckState",
    default: false
});

/**
 * Atom used to keep track of the account creation disclaimer checkbox state.
 */
const accountCreationDisclaimerCheckState = atom({
    key: "accountCreationDisclaimerCheckState",
    default: false
});

/**
 * Atom used to keep track of the registration password, used for registration
 */
const registrationPasswordState = atom({
    key: "registrationPasswordState",
    default: ""
});

/**
 * Atom used to keep track of the registration confirmation password, used for registration
 */
const registrationConfirmationPasswordState = atom({
    key: "registrationConfirmationPasswordState",
    default: ""
});


/**
 * Atom used to keep track of the registration password errors
 */
const registrationPasswordErrorsState = atom({
    key: "registrationPasswordErrorsState",
    default: []
});

/**
 * Atom used to keep track of the registration confirmation password errors
 */
const registrationConfirmationPasswordErrorsState = atom({
    key: "registrationConfirmationPasswordErrorsState",
    default: []
});

/**
 * Atom used ot keep track of the registration Amplify Sign Up errors
 */
const amplifySignUpProcessErrorsState = atom({
    key: "amplifySignUpProcessErrorsState",
    default: []
});

/**
 * Atom used to keep track of the military verification status of a registering
 * user.
 */
const militaryVerificationStatus = atom({
    key: "militaryVerificationStatus",
    default: MilitaryVerificationStatusType.Rejected
});

/**
 * Atom used to keep track of whether additional documentation is needed, in
 * order to verify military eligibility.
 */
const additionalDocumentationNeeded = atom({
    key: "additionalDocumentationNeeded",
    default: false
});

/**
 * Atom used to keep track of the military verification specific, additional documentation errors
 */
const additionalDocumentationErrors = atom({
    key: "additionalDocumentationErrors",
    default: []
});

/**
 * Export all atoms and/or selectors
 */
export {
    additionalDocumentationErrors,
    additionalDocumentationNeeded,
    militaryVerificationStatus,
    amplifySignUpProcessErrorsState,
    registrationPasswordState,
    registrationPasswordErrorsState,
    registrationConfirmationPasswordState,
    registrationConfirmationPasswordErrorsState,
    dutyStatusErrorsState,
    militaryBranchErrorsState,
    enlistingYearState,
    militaryRegistrationDisclaimerCheckState,
    accountCreationDisclaimerCheckState,
    addressStateState,
    addressCityState,
    addressLineState,
    addressZipState,
    enlistingYearErrorsState,
    addressLineErrorsState,
    addressCityErrorsState,
    addressZipErrorsState,
    addressStateErrorsState,
    militaryBranchState,
    militaryBranchValueState,
    dutyStatusValueState,
    dutyStatusState,
    verificationCodeErrorsState,
    firstNameErrorsState,
    lastNameErrorsState,
    birthdayErrorState,
    emailErrorsState,
    phoneNumberErrorsState,
    registrationCodeTimerValue,
    registrationVerificationDigit1,
    registrationVerificationDigit2,
    registrationVerificationDigit3,
    registrationVerificationDigit4,
    registrationVerificationDigit5,
    registrationVerificationDigit6,
    registrationStepNumber,
    currentUserInformation,
    initialAuthenticationScreen,
    registrationBackButtonShown,
    registrationMainErrorState,
    firstNameState,
    lastNameState,
    emailState,
    birthdayState,
    phoneNumberState
}
