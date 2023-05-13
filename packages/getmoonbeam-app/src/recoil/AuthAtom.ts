import {atom} from "recoil";

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
})

/**
 * Atom used to keep track of whether the back button is shown for registration
 */
const registrationBackButtonShown = atom({
    key: "registrationBackButtonShown",
    default: true
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
    default: 10
});

/**
 * Export all atoms and/or selectors
 */
export {
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
