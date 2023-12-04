import branch from "react-native-branch";
import {Platform} from "react-native";

/**
 * Function used to initialize a new Branch Universal Object, in order to start using
 * it with Branch to track and log attribution events across the app.
 *
 * @param identifier the unique identifier for this object/content
 * @param title the title for the Branch Universal Object
 * @param description the description for the Branch Universal Object
 * @param metadata optional metadata for the Branch Universal Object
 *
 * @returns a new Branch Universal Object
 */
export const branchInitUniversalObject = async (identifier: string, title: string, description: string, metadata?: Object): Promise<Object> => {
    return await branch.createBranchUniversalObject(identifier, {
        title: title,
        contentDescription: description,
        ...(metadata !== null && metadata !== undefined && {
            contentMetadata: metadata
        })
    });
}

/**
 * Function used to initialize Branch, and set its identity based on the logged in user.
 *
 * @param userInformation the user information used to set the identity of the user with branch, used
 * for events, deep links and referrals.
 */
export const initializeBranch = async (userInformation: any): Promise<void> => {
    try {
        // sets the identity of the logged-in user
        await branch.setIdentity(`${userInformation['custom:userId']}`);

        const rootBranchUniversalObject = await branch.createBranchUniversalObject(`moonbeam-root`, {
            title: `Moonbeam Root Content`,
            contentDescription: `Represents the root Branch Universal Object used across the Moonbeam application`
        });
        // const deepLink = await rootBranchUniversalObject.generateShortUrl({
        //     campaign: MarketingCampaignCode.Raffleregdec23,
        //     feature: 'referral-sharing',
        //     channel: `facebook`,
        //     stage: envInfo.envName,
        //     tags: [
        //         'abc123',
        //         'def456'
        //     ]
        // }, {
        //     $ios_url: 'moonbeamfin://register',
        //     $android_url: 'moonbeamfin://register',
        //     $desktop_url: 'https://www.moonbeam.vet',
        //     $fallback_url: 'https://www.moonbeam.vet'
        // });
        // console.log(deepLink);
        // console.log(JSON.stringify(await branch.getLatestReferringParams()));
        // await rootBranchUniversalObject.showShareSheet({
        //     messageHeader: 'Fight Bad Guys, Get Money! 🪖🪖🪖',
        //     messageBody: 'Here\'s my personal invite code for you to join Moonbeam, the first automatic military discounts platform!\nRegister for an account, link your Visa or MasterCard and earn a chance at a $100 Amazon Gift card.\n',
        //     emailSubject: 'Get Moonbeam - The First Automatic Military Discounts Platform',
        //     title: 'Fight Bad Guys, Get Money! 🪖🪖🪖',
        //     text: 'Here\'s my personal invite code for you to join Moonbeam, the first automatic military discounts platform!\nRegister for an account, link your Visa or MasterCard and earn a chance at a $100 Amazon Gift card.\n'
        // }, {
        //     campaign: MarketingCampaignCode.Raffleregdec23,
        //     feature: 'referral-sharing',
        //     channel: `facebook`,
        //     stage: envInfo.envName,
        //     tags: [
        //         'abc123',
        //         'def456'
        //     ]
        // }, {
        //     $ios_url: `moonbeamfin://register?r=${userInformation['custom:userId']}`,
        //     $android_url: `moonbeamfin://register?r=${userInformation['custom:userId']}`,
        //     $desktop_url: 'https://www.moonbeam.vet',
        //     $fallback_url: 'https://www.moonbeam.vet'
        // });
    } catch (error) {
        const errorMessage = `Unexpected error while initializing the Branch.IO Universal Object, for OS ${Platform.OS} ${error} ${JSON.stringify(error)}`;
        console.log(errorMessage);
    }
}
