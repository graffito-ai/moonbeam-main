import {MilitaryBranch, MilitaryDutyStatus, VerificationDocument} from "@moonbeam/moonbeam-models";
// @ts-ignore
import CardOverviewImage from '../../assets/art/moonbeam-card-overview.png';
// @ts-ignore
import VerificationOverviewImage from '../../assets/art/moonbeam-verification-overview.png';
// @ts-ignore
import LinkingOverviewImage from '../../assets/art/moonbeam-linking-overview.png';
// @ts-ignore
import RewardsOverviewImage from '../../assets/art/moonbeam-rewards-overview.png';

// constants used to keep track of the email code verification steps content
export const emailCodeVerificationSteps = [
    {
        stepTitle: "Verification",
        stepSubtitle: "We identified that you want to change your ",
        stepSubtitleHighlighted: "email",
        contentDescription: "We will send you a one-time pass code, to confirm it.",
        stepButtonText: "Send Code"
    },
    {
        stepTitle: "Code Verification",
        stepSubtitle: "Verify your ",
        stepSubtitleHighlighted: "code",
        contentDescription: "Enter the 6 digit verification code (OTP) we just sent to your email, in order to confirm your identity.",
        stepButtonText: "Confirm"
    }
]
// constants used to keep track of the account recovery steps content
export const accountRecoverySteps = [
    {
        stepTitle: "Verification",
        stepSubtitle: "First confirm your ",
        stepSubtitleHighlighted: "identity",
        contentTitle: "Forgot Password ?",
        contentDescription: "Enter the email address associated with your account. We will send you a one-time pass code (OTP), to reset your password.",
        stepButtonText: "Send Code"
    },
    {
        stepTitle: "Password",
        stepSubtitle: "Set a new ",
        stepSubtitleHighlighted: "password",
        contentTitle: "Create a new Password",
        contentDescription: "Please create your new password below.",
        stepButtonText: "Continue"
    },
    {
        stepTitle: "Code",
        stepSubtitle: "Verify your ",
        stepSubtitleHighlighted: "code",
        contentTitle: "Code Verification",
        contentDescription: "Enter the 6 digit verification code (OTP) we just sent to your email, in order to finish your password reset.",
        stepButtonText: "Confirm"
    },
]
// constants used to keep track of the registration steps content
export const registrationSteps = [
    {
        stepTitle: "Personal Info",
        stepDescription: "Enter your full name, email, birthday, phone number, enlisting year and duty status to continue.",
    },
    {
        stepTitle: "Additional Info",
        stepDescription: "Enter your address, duty status and military branch, to help us verify your eligibility.",
    },
    {
        stepTitle: "Account Security",
        stepDescription: "Secure your account by setting an account password. You will use this paired with your email, in order to access your new account.",
    },
    {
        stepTitle: "Code Verification",
        stepDescription: "Enter the 6 digit verification code we just sent to your email. Check your spam and trash inboxes.",
    },
    {
        stepTitle: "App Permissions",
        stepDescription: "",
    },
    {
        stepTitle: "Military Status",
        stepDescription: "Continue by allowing us to verify your military service status based on the information that you provided.",
    },
    {
        stepTitle: "Documentation",
        stepDescription: "We need additional information to verify your military identity. Upload or capture supporting documentation, to help with your eligibility.",
    },
    {
        stepTitle: "Card Linking",
        stepDescription: "Link your favorite MasterCard or Visa card, and earn rewards with every transaction at qualifying merchant locations.",
    },
    {
        stepTitle: "",
        stepDescription: ""
    }
]
// constants used to keep track of the application wall steps
export const applicationWallSteps = [
    {
        stepTitle: "",
        stepDescription: ""
    },
    {
        stepTitle: "Military Status",
        stepDescription: "Allow us to verify your military service status based on the information that you provided during signup.",
    },
    {
        stepTitle: "Documentation",
        stepDescription: "We need additional information to verify your military identity. Upload or capture supporting documentation, to help with your eligibility."
    },
    {
        stepTitle: "",
        stepDescription: ""
    }
]
// constants used to keep track of the app overview steps content
export const appOverviewSteps = [
    {
        stepTitle: "Card-Linked Military\n Discounts",
        stepDescription: "Access unique military discounts and rewards just by linking your existing debit or credit card.",
        stepImageSource: CardOverviewImage
    },
    {
        stepTitle: "Verify your\n Valor",
        stepDescription: "Go through our secure and trusted military verification process to ensure secure access.",
        stepImageSource: VerificationOverviewImage
    },
    {
        stepTitle: "Link & Start Earning\n Cashback",
        stepDescription: "Link your MasterCard or Visa debit or credit cards, and earn through qualifying transactions.",
        stepImageSource: LinkingOverviewImage
    },
    {
        stepTitle: "Earn Discounts\n Seamlessly",
        stepDescription: "Discounts are automatically applied and will show on your statements monthly. No need to ask the cashier.",
        stepImageSource: RewardsOverviewImage
    }
]
// constants used to keep track of the duty status dropdown values
export const dutyStatusItems = [
    {
        label: "Active Duty",
        value: MilitaryDutyStatus.ActiveDuty
    },
    {
        label: "National Guard",
        value: MilitaryDutyStatus.NationalGuard
    },
    {
        label: "Reservist",
        value: MilitaryDutyStatus.Reservist
    },
    {
        label: "Veteran",
        value: MilitaryDutyStatus.Veteran
    }
]
// constants used to keep track of the military branch dropdown values
export const militaryBranchItems = [
    {
        label: "Air Force",
        value: MilitaryBranch.AirForce
    },
    {
        label: "Army",
        value: MilitaryBranch.Army
    },
    {
        label: "Coast Guard",
        value: MilitaryBranch.CoastGuard
    },
    {
        label: "Marine Corps",
        value: MilitaryBranch.MarineCorps
    },
    {
        label: "Navy",
        value: MilitaryBranch.Navy
    },
    {
        label: "Space Force",
        value: MilitaryBranch.SpaceForce
    }
];
// constants used to keep track of the document selection dropdown value
export const documentSelectionItems = [
    {
        label: VerificationDocument.DD214,
        value: VerificationDocument.DD214
    },
    {
        label: VerificationDocument.LICENSE,
        value: VerificationDocument.LICENSE
    },
    {
        label: VerificationDocument.VETERAN_ID,
        value: VerificationDocument.VETERAN_ID
    },
    {
        label: VerificationDocument.VA_ELIGIBILITY_LETTER,
        value: VerificationDocument.VA_ELIGIBILITY_LETTER,
    },
    {
        label: VerificationDocument.ERB_ORB,
        value: VerificationDocument.ERB_ORB
    },
    {
        label: VerificationDocument.LES,
        value: VerificationDocument.LES
    },
    {
        label: VerificationDocument.NGB_22,
        value: VerificationDocument.NGB_22
    },
    {
        label: VerificationDocument.VHIC,
        value: VerificationDocument.VHIC
    },
    {
        label: VerificationDocument.VIC,
        value: VerificationDocument.VIC
    },
    {
        label: VerificationDocument.VA_DISABILITY_LETTER,
        value: VerificationDocument.VA_DISABILITY_LETTER
    }
];
// constants used to keep track of the issuing country selection dropdown value
export const issuingCountrySelectionItems = [
    {
        label: 'United States of America',
        value: 'US'
    },
    {
        label: 'United Kingdom',
        value: 'UK'
    }
];
// constants used to keep track of the US states
export const stateItems = [
    "Alaska", "Alabama", "Arkansas", "American Samoa", "Arizona", "California", "Colorado", "Connecticut", "District of Columbia", "Delaware", "Florida", "Georgia", "Guam", "Hawaii", "Iowa", "Idaho", "Illinois", "Indiana", "Kansas", "Kentucky", "Louisiana", "Massachusetts", "Maryland", "Maine", "Michigan", "Minnesota", "Missouri", "Mississippi", "Montana", "North Carolina", "North Dakota", "Nebraska", "New Hampshire", "New Jersey", "New Mexico", "Nevada", "New York", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Puerto Rico", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Virginia", "Virgin Islands", "Vermont", "Washington", "Wisconsin", "West Virginia", "Wyoming"
];
// enum for the CodeVerification screen
export enum CodeVerificationType {
    EMAIL = 'EMAIL',
    PHONE = 'PHONE'
}
