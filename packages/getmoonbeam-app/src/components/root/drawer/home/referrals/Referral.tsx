import React, {useEffect, useState} from "react";
import {ReferralProps} from "../../../../../models/props/AppDrawerProps";
import {useRecoilState} from "recoil";
import {appDrawerHeaderShownState, drawerDashboardState, drawerSwipeState} from "../../../../../recoil/AppDrawerAtom";
import {Platform, Share, Text, TouchableOpacity, View} from "react-native";
import {Icon} from "@rneui/base";
import {heightPercentageToDP as hp} from "react-native-responsive-screen";
import {styles} from "../../../../../styles/referral.module";
import {Image} from 'expo-image';
// @ts-ignore
import MoonbeamContentReferral from "../../../../../../assets/art/moonbeam-referral-gifts.png";
import {currentUserInformation, userIsAuthenticatedState} from "../../../../../recoil/AuthAtom";
import * as crc32 from 'crc-32';
import {branchRootUniversalObjectState} from "../../../../../recoil/BranchAtom";
import * as envInfo from "./../../../../../../local-env-info.json";
import {LoggingLevel, MarketingCampaignCode} from "@moonbeam/moonbeam-models";
import * as Clipboard from 'expo-clipboard';
import {logEvent} from "../../../../../utils/AppSync";

/**
 * Referral component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const Referral = ({navigation}: ReferralProps) => {
    // constants used to keep track of local component state
    const [campaignMarketingCode, setCampaignMarketingCode] = useState<MarketingCampaignCode | "">("");
    const [userReferralLink, setUserReferralLink] = useState<string>("");
    const [nextDrawingDate, setNextDrawingDate] = useState<string>("");
    const [userReferralCode, setUserReferralCode] = useState<string>("");
    // constants used to keep track of shared states
    const [userIsAuthenticated, ] = useRecoilState(userIsAuthenticatedState);
    const [,setDrawerInDashboard] = useRecoilState(drawerDashboardState);
    const [userInformation,] = useRecoilState(currentUserInformation);
    const [appDrawerHeaderShown, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [drawerSwipeEnabled, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);
    const [branchUniversalRootObject,] = useRecoilState(branchRootUniversalObjectState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // generate the next drawing date
        nextDrawingDate.length === 0 && getNextDrawingDate();

        // generate the referral link for the user
        campaignMarketingCode !== "" && (userReferralLink === undefined || userReferralLink.length === 0) &&
        generateUserReferralLink(campaignMarketingCode).then(referralLink => {
            setUserReferralLink(referralLink);
        });

        // generate a referral code that will be appended everywhere in the referral links and will be used to track the user during the referral process
        (userReferralCode === undefined || userReferralCode.length === 0) &&
        setUserReferralCode(
            crc32.str(userInformation["custom:userId"]).toString().includes('-')
                ? `${userInformation["family_name"].toUpperCase()}-${userInformation["given_name"].charAt(0).toUpperCase()}-${crc32.str(userInformation["custom:userId"]).toString().split('-')[1]}`
                : `${userInformation["family_name"].toUpperCase()}-${userInformation["given_name"].charAt(0).toUpperCase()}-${crc32.str(userInformation["custom:userId"]).toString()}`
        );

        if (navigation.getState().index === 4) {
            appDrawerHeaderShown && setAppDrawerHeaderShown(false);
            drawerSwipeEnabled && setDrawerSwipeEnabled(false);
        }
    }, [campaignMarketingCode, nextDrawingDate, userReferralCode, userReferralLink,
        appDrawerHeaderShown, drawerSwipeEnabled, navigation.getState()
    ]);


    /**
     * Function used to get the next date for our raffle drawing
     * (it will happen every 2 weeks, starting on 12/22/2023)
     */
    const getNextDrawingDate = () => {
        const currentDate = new Date();

        // these are the next dates for the raffle that will determine the next raffle drawing date
        const firstRaffle = new Date('2023-12-22');
        const secondRaffle = new Date('2024-01-10');
        const thirdRaffle = new Date('2024-01-24');
        const fourthRaffle = new Date('2024-02-07');

        // depending on the current date, determine which raffle drawing date we will show
        if (currentDate < firstRaffle) {
            setNextDrawingDate(`12/22/2023`);
            setCampaignMarketingCode(MarketingCampaignCode.Raffleregdec23);
        } else if (currentDate < secondRaffle) {
            setNextDrawingDate(`01/10/2024`);
            setCampaignMarketingCode(MarketingCampaignCode.Raffleregjan24);
        } else if (currentDate < thirdRaffle) {
            setNextDrawingDate(`01/24/2024`);
            setCampaignMarketingCode(MarketingCampaignCode.Raffleregjan24);
        } else if (currentDate < fourthRaffle) {
            setNextDrawingDate(`02/07/2024`);
            setCampaignMarketingCode(MarketingCampaignCode.Raffleregfeb24);
        } else {
            setNextDrawingDate(`03/01/2024`);
            setCampaignMarketingCode(MarketingCampaignCode.Raffleregmar24);
        }
    }

    /**
     * Function used to generate a user referral link, to be displayed and used by this user all the time.
     *
     * If the referral link generation fails, that means that the link has been generated before with the
     * customer's unique code, in which case we will just hardcode the link since we know what each user's
     * code is made up of, and also what the structure of the link should be.
     *
     * @param campaignMarketingCode the campaign market code to be passed in when creating the link
     *
     * @return a {@link Promise} of a {@link string} representing the user referral link
     */
    const generateUserReferralLink = async (campaignMarketingCode: MarketingCampaignCode | ""): Promise<string> => {
        // referral code generation
        const referralCode =
            crc32.str(userInformation["custom:userId"]).toString().includes('-')
                ? `${userInformation["family_name"].toUpperCase()}-${userInformation["given_name"].charAt(0).toUpperCase()}-${crc32.str(userInformation["custom:userId"]).toString().split('-')[1]}`
                : `${userInformation["family_name"].toUpperCase()}-${userInformation["given_name"].charAt(0).toUpperCase()}-${crc32.str(userInformation["custom:userId"]).toString()}`;

        // first attempt to generate a user referral link. This might have been generated before, so we'll just reuse that in case it was already generated, so we avoid duplicates
        try {
            // @ts-ignore
            let {url} = await branchUniversalRootObject.generateShortUrl({
                alias: `${referralCode}`,
                campaign: campaignMarketingCode,
                feature: 'referrals',
                channel: `in-app`,
                stage: envInfo.envName,
                tags: [
                    `${referralCode}`,
                    campaignMarketingCode
                ]
            });

            return url;
        } catch (error) {
            // check to see if we have a duplicate link, in which case we will just re-use that, otherwise we error out
            // @ts-ignore
            if (error.message !== null && error.message !== undefined && (error.message.includes('A resource with this identifier already exists.') || (error.message !== null && error.message !== undefined && error.code.includes('DuplicateResourceError')))) {
                return `https://app.moonbeam.vet/${referralCode}`;
            } else {
                const message = `Error while generating a referral code for the user`;
                console.log(message);
                await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                return `Error while generating referral code`;
            }
        }
    }

    // return the component for the Referral page
    return (
        <>
            <View style={styles.mainReferralView}>
                <Icon
                    name={'close'}
                    size={hp(4.5)}
                    color={'#FFFFFF'}
                    style={styles.closeIcon}
                    onPress={async () => {
                        setAppDrawerHeaderShown(true);
                        setDrawerSwipeEnabled(true);
                        setDrawerInDashboard(true);
                        navigation.goBack();
                    }}
                />
                <View style={styles.contentView}>
                    <Image
                        style={styles.referralMainImage}
                        source={MoonbeamContentReferral}
                        placeholderContentFit={'contain'}
                        contentFit={'contain'}
                        cachePolicy={'memory-disk'}
                    />
                    <View style={styles.referralContentMessageView}>
                        <Text style={styles.referralContentMessageTitle}>
                            {"Win a $100\nAmazon Gift Card"}
                        </Text>
                        <Text style={styles.referralContentMessageTitleValidity}>
                            {`Next drawing on ${nextDrawingDate}`}
                        </Text>
                        <Text style={styles.referralContentMessageSubtitle}>
                            {"Share your member code with your friends. Once they sign up for an account and link a card, you will both earn a chance at winning a $100 gift card.\n\n"}
                        </Text>
                    </View>
                    {
                        userReferralLink !== undefined && userReferralLink.length !== 0 &&
                        <TouchableOpacity
                            style={styles.referralCodeView}
                            onPress={async () => {
                                // copy to clipboard
                                await Clipboard.setStringAsync(userReferralLink);
                            }}
                        >
                            <View style={styles.referralCodeInnerView}>
                                <Icon
                                    style={styles.referralCodeIcon}
                                    name={'content-copy'}
                                    size={hp(3)}
                                    color={'#F2FF5D'}
                                />
                                {/*@ts-ignore*/}
                                <Text style={styles.referralCode}>{`${userReferralLink}`}</Text>
                            </View>
                        </TouchableOpacity>
                    }
                    {
                        campaignMarketingCode !== "" &&
                        <TouchableOpacity
                            style={styles.shareButton}
                            onPress={
                                async () => {
                                    const referralLink = await generateUserReferralLink(campaignMarketingCode);

                                    // share the referral code with other apps through a Branch.io universal link
                                    try {
                                        await Share.share({
                                            title: 'Fight Bad Guys, Get Money! 🪖🪖🪖',
                                            message: `Here\'s my personal invite code for you to join Moonbeam, the first automatic military discounts platform!\n\nRegister for an account, link your Visa or MasterCard and earn a chance at a $100 Amazon Gift card.\n${Platform.OS === 'android' ? `\n${referralLink}` : ''}`,
                                            ...(Platform.OS === 'ios' && {
                                                // @ts-ignore
                                                url: `${referralLink}`
                                            }),
                                        }, {
                                            dialogTitle: 'Fight Bad Guys, Get Money! 🪖🪖🪖',
                                            subject: 'Moonbeam | Automatic Discounts Platform',
                                        })
                                    } catch (error) {
                                        console.error(`Error sharing referral code ${error}`);
                                    }
                                }
                            }
                        >
                            <Icon
                                name={'ios-share'}
                                size={hp(2.3)}
                                color={'#1e1e21'}
                            />
                            <Text style={styles.shareButtonText}>Share Code</Text>
                        </TouchableOpacity>
                    }
                    {/*<Text style={styles.referralContentMessageSubtitleHighlighted}>*/}
                    {/*    Increase your chances of winning with unlimited referrals*/}
                    {/*</Text>*/}
                </View>
            </View>
        </>
    );
}
