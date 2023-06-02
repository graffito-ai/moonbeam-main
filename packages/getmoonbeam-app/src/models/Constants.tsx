import {MilitaryBranch, MilitaryDutyStatus, VerificationDocument} from "@moonbeam/moonbeam-models";

// constants used to keep track of the registration steps content
export const registrationStepTitles = [
    "Personal Info",
    "Additional Info",
    "Account Security",
    "Code Verification",
    "App Permissions",
    "Military Status",
    "Documentation",
    "Card Linking",
    ""
];
export const registrationStepDescription = [
    "Enter your full name, email, birthday, phone number, enlisting year and duty status to continue.",
    "Enter your address, duty status and military branch, to help us verify your eligibility.",
    "Secure your account by setting an account password. You will use this paired with your email, in order to access your new account.",
    "Enter the 6 digit verification code we just sent to your email. Check your spam and trash inboxes.",
    "",
    "Continue by allowing us to verify your military service status based on the information that you provided.",
    "We need additional information to verify your military identity. Upload or capture supporting documentation, to help with your eligibility.",
    "Link your favorite Visa, American Express, or MasterCard card, and earn rewards with every transaction at qualifying merchant locations.",
    ""
];

// constants used to keep track of the app overview steps content
export const appOverviewStepTitles = [
    "Card-Linked Military\n Discounts",
    "Verify your\n Valor",
    "Link & Start Earning\n Cashback",
    "Earn Discounts\n Seamlessly"
];
export const appOverviewStepContent = [
    "Access exclusive military discounts and rewards just by linking your existing debit or credit card.",
    "Go through our secure and trusted military verification process to ensure exclusive access.",
    "Link your Visa, MasterCard or American Express debit or credit cards, and earn through qualifying transactions.",
    "Discounts are automatically applied and will show on your statements daily. No need to ask the cashier."
];
export const appOverviewStepImageSource = [
    require('../../assets/art/moonbeam-card-overview.png'),
    require('../../assets/art/moonbeam-verification-overview.png'),
    require('../../assets/art/moonbeam-linking-overview.png'),
    require('../../assets/art/moonbeam-rewards-overview.png')
];
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
