// constants used to keep track of the registration steps content
import {DutyStatus} from "@moonbeam/moonbeam-models";
import {MilitaryBranches} from "@moonbeam/moonbeam-models";

export const registrationStepTitles = [
    "Personal Info",
    "Military Status",
    "Documentation",
    "Card Linking",
    "Account Security",
    "Code Verification",
];
export const registrationStepDescription = [
    "Enter your full name, email, birthday, phone number, enlisting year and duty status to continue.",
    "Enter your address, duty status and military branch, to help us verify your eligibility.",
    "Upload or capture additional supporting documentation, to help aid with your eligibility.",
    "Link your favorite Visa, American Express, or MasterCard card, and earn rewards with every transaction at qualifying merchant locations.",
    "Secure your account by setting an account password. You will use this paired with the email that you previously entered, in order to access your new account.",
    "Enter the 6 digit verification code (OTP) we just sent to your email."
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
        label: DutyStatus.ACTIVE_DUTY,
        value: DutyStatus.ACTIVE_DUTY
    },
    {
        label: DutyStatus.NATIONAL_GUARD,
        value: DutyStatus.NATIONAL_GUARD
    },
    {
        label: DutyStatus.RESERVIST,
        value: DutyStatus.RESERVIST
    },
    {
        label: DutyStatus.VETERAN,
        value: DutyStatus.VETERAN
    }
]
// constants used to keep track of the military branch dropdown values
export const militaryBranchItems = [
    {
        label: MilitaryBranches.AIR_FORCE,
        value: MilitaryBranches.AIR_FORCE
    },
    {
        label: MilitaryBranches.ARMY,
        value: MilitaryBranches.ARMY
    },
    {
        label: MilitaryBranches.COAST_GUARD,
        value: MilitaryBranches.COAST_GUARD
    },
    {
        label: MilitaryBranches.MARINE_CORPS,
        value: MilitaryBranches.MARINE_CORPS
    },
    {
        label: MilitaryBranches.NAVY,
        value: MilitaryBranches.NAVY
    },
    {
        label: MilitaryBranches.SPACE_FORCE,
        value: MilitaryBranches.SPACE_FORCE
    }
];
// constants used to keep track of the US states
export const stateItems = [
    "Alaska", "Alabama", "Arkansas", "American Samoa", "Arizona", "California", "Colorado", "Connecticut", "District of Columbia", "Delaware", "Florida", "Georgia", "Guam", "Hawaii", "Iowa", "Idaho", "Illinois", "Indiana", "Kansas", "Kentucky", "Louisiana", "Massachusetts", "Maryland", "Maine", "Michigan", "Minnesota", "Missouri", "Mississippi", "Montana", "North Carolina", "North Dakota", "Nebraska", "New Hampshire", "New Jersey", "New Mexico", "Nevada", "New York", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Puerto Rico", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Virginia", "Virgin Islands", "Vermont", "Washington", "Wisconsin", "West Virginia", "Wyoming"
]
