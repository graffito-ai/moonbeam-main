import React, {useEffect, useRef, useState} from 'react';
import {Image, TouchableOpacity, View} from "react-native";
import {CardsProps} from "../../../../../models/props/HomeProps";
import {IconButton, List, Text} from "react-native-paper";
import {useRecoilState} from "recoil";
import {
    appDrawerHeaderShownState,
    cardLinkingStatusState,
    customBannerShown,
    drawerSwipeState
} from "../../../../../recoil/AppDrawerAtom";
import {styles} from '../../../../../styles/wallet.module';
import BottomSheet from "@gorhom/bottom-sheet";
import {bottomTabShownState} from "../../../../../recoil/HomeAtom";
import {CardLinkingBottomSheet} from "./CardLinkingBottomSheet";
import {Spinner} from "../../../../common/Spinner";
import {currentUserInformation, userIsAuthenticatedState} from "../../../../../recoil/AuthAtom";
import {Card, CardType, deleteCard, LoggingLevel} from "@moonbeam/moonbeam-models";
import {API, graphqlOperation} from "aws-amplify";
import {SplashScreen} from "../../../../common/Splash";
import {splashStatusState} from "../../../../../recoil/SplashAtom";
import {customBannerState} from "../../../../../recoil/CustomBannerAtom";
import {
    cardLinkingBottomSheetState,
    clickOnlySectionReloadState,
    fidelisSectionReloadState,
    kitSectionReloadState,
    nearbySectionReloadState, onlineSectionReloadState,
    selectedCardIndexState,
    verticalClickOnlySectionReloadState,
    verticalFidelisSectionReloadState,
    verticalNearbySectionReloadState, verticalOnlineSectionReloadState
} from "../../../../../recoil/WalletAtom";
// @ts-ignore
import MoonbeamCardChip from '../../../../../../assets/art/moonbeam-card-chip.png';
// @ts-ignore
import NoCardImage from '../../../../../../assets/art/moonbeam-empty-wallet.png';
// @ts-ignore
import MoonbeamLogo from '../../../../../../assets/login-logo.png';
// @ts-ignore
import CardLinkingImage from '../../../../../../assets/art/moonbeam-card-linking.png';
// @ts-ignore
import CardDeletionImage from '../../../../../../assets/art/moonbeam-card-deletion.png';
// @ts-ignore
import MoonbeamErrorImage from '../../../../../../assets/art/moonbeam-error.png';
// @ts-ignore
import MoonbeamVisaImage from '../../../../../../assets/moonbeam-visa-icon.png';
// @ts-ignore
import MoonbeamMasterCardImage from '../../../../../../assets/moonbeam-mastercard-icon.png';
// @ts-ignore
import MoonbeamMembership from '../../../../../../assets/art/moonbeam-membership.png';
// @ts-ignore
import MoonbeamBasicMembership from '../../../../../../assets/art/moonbeam-e1-membership.png';
// @ts-ignore
import RegistrationBackgroundImage from '../../../../../../assets/backgrounds/registration-background.png';
import {showWalletBottomSheetState} from "../../../../../recoil/DashboardAtom";
import {LinearGradient} from "expo-linear-gradient";
import {Divider} from '@rneui/base';
import {commonStyles} from "../../../../../styles/common.module";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {logEvent} from "../../../../../utils/AppSync";
import CardsWallet from 'react-native-wallet-cards';
import {SafeAreaProvider} from 'react-native-safe-area-context';

// interface to keep track of the type of card to be selected
export interface SelectedCard {
    type: CardType,
    last4: string
}

/**
 * Wallet component. This component will be used as a place where users can manager their
 * linked cards. This will be accessible from the bottom navigation bar, as well as from
 * the drawer navigation, through settings.
 *
 * @param props component properties to be passed in.
 * @constructor constructor for the component.
 */
export const Wallet = ({navigation}: CardsProps) => {
    // constants used to keep track of local component state
    const [isReady, setIsReady] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [splashShown, setSplashShown] = useState<boolean>(false);
    const bottomSheetRef = useRef(null);
    const [bottomSheetType, setBottomSheetType] = useState<"link-info" | "unlink" | "link">("link");
    const [selectedCard, setSelectedCard] = useState<SelectedCard | null>(null);
    // constants used to keep track of shared states
    const [selectedCardIndex, setSelectedCardIndex] = useRecoilState(selectedCardIndexState);
    const [userIsAuthenticated,] = useRecoilState(userIsAuthenticatedState);
    const [, setCardLinkingStatus] = useRecoilState(cardLinkingStatusState);
    const [, setBannerState] = useRecoilState(customBannerState);
    const [bannerShown, setBannerShown] = useRecoilState(customBannerShown);
    const [appDrawerHeaderShown, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [, setBottomTabShown] = useRecoilState(bottomTabShownState);
    const [userInformation, setUserInformation] = useRecoilState(currentUserInformation);
    const [splashState, setSplashState] = useRecoilState(splashStatusState);
    const [cardLinkingBottomSheet, setCardLinkingBottomSheet] = useRecoilState(cardLinkingBottomSheetState);
    const [drawerSwipeEnabled, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);
    const [showBottomSheet, setShowBottomSheet] = useRecoilState(showWalletBottomSheetState);
    const [, setClickOnlySectionReload] = useRecoilState(clickOnlySectionReloadState);
    const [, setVerticalClickOnlySectionReload] = useRecoilState(verticalClickOnlySectionReloadState);
    const [, setKitSectionReload] = useRecoilState(kitSectionReloadState);
    const [, setFidelisSectionReload] = useRecoilState(fidelisSectionReloadState);
    const [, setVerticalFidelisSectionReload] = useRecoilState(verticalFidelisSectionReloadState);
    const [, setNearbySectionReload] = useRecoilState(nearbySectionReloadState);
    const [, setVerticalNearbySectionReload] = useRecoilState(verticalNearbySectionReloadState);
    const [, setOnlineSectionReload] = useRecoilState(onlineSectionReloadState);
    const [, setVerticalOnlineSectionReload] = useRecoilState(verticalOnlineSectionReloadState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // only display a banner if the number of cards left is 0
        if (!userInformation["linkedCard"] || (userInformation["linkedCard"] && userInformation["linkedCard"]["cards"] && userInformation["linkedCard"]["cards"].length === 0)) {
            // change the card linking status
            setCardLinkingStatus(false);

            // set the custom banner state for future screens accordingly
            setBannerState({
                bannerVisibilityState: cardLinkingStatusState,
                bannerMessage: "You do not have a linked card. You will need to have a linked-card in your wallet to see more transaction details.",
                bannerButtonLabel: "Link Now",
                bannerButtonLabelActionSource: "home/wallet",
                bannerArtSource: CardLinkingImage,
                dismissing: false
            });
        }

        // set the app drawer status accordingly, custom banner visibility and drawer swipe actions accordingly
        if (navigation.getState().index === 3) {
            appDrawerHeaderShown && setAppDrawerHeaderShown(false);
            bannerShown && setBannerShown(false);
            drawerSwipeEnabled && setDrawerSwipeEnabled(false);
        }
        // manipulate the card linking success splash screen, with an external action coming from the Olive enrollment form
        if (cardLinkingBottomSheet) {
            // if the card deletion was not successful, then display the appropriate splash screen
            setSplashState({
                splashTitle: `Great!`,
                splashDescription: `You have successfully linked your card.`,
                splashButtonText: `Continue`,
                splashArtSource: CardLinkingImage
            });
            setSplashShown(true);
            setBottomTabShown(false);
            // hide the bottom sheet for deletion, to show splash message
            setShowBottomSheet(false);
        }
        // manipulate the bottom sheet
        if (!showBottomSheet && bottomSheetRef) {
            // @ts-ignore
            bottomSheetRef.current?.close?.();

            // show the bottom tab
            setBottomTabShown(true);
        }
        if (showBottomSheet && bottomSheetRef) {
            // hide the bottom tab
            setBottomTabShown(false);

            // @ts-ignore
            bottomSheetRef.current?.expand?.();
        }
        if (splashShown) {
            setBottomTabShown(false);
            setCardLinkingBottomSheet(false);
            setShowBottomSheet(false);
        }
    }, [navigation.getState(), showBottomSheet, bottomSheetRef, userInformation, cardLinkingBottomSheet, splashShown]);

    /**
     * Function used to handle the delete card action, from the bottom sheet
     * button press.
     */
    const deleteCardAction = async (): Promise<void> => {
        // need to call the delete API here
        const deleteCardFlag = await deactivateCard(
            userInformation["custom:userId"],
            userInformation["linkedCard"]["memberId"],
            userInformation["linkedCard"]["cards"][selectedCardIndex]["id"]);

        // check the delete card flag, and display a splash screen accordingly (if applicable)
        if (deleteCardFlag) {
            // hide the bottom sheet for deletion, to show splash message
            setShowBottomSheet(false);
            // if the card deletion was successful, then show the link card banner, and display the appropriate splash screen
            setSplashState({
                splashTitle: `Card successfully unlinked!`,
                splashDescription: `Don't forget to link a new card if you want to participate in our discount programs.`,
                splashButtonText: `Ok`,
                splashArtSource: CardDeletionImage
            });
            setSplashShown(true);
            setBottomTabShown(false);
        } else {
            // hide the bottom sheet for deletion, to show splash message
            setShowBottomSheet(false);
            // if the card deletion was not successful, then display the appropriate splash screen
            setSplashState({
                splashTitle: `Houston we got a problem!`,
                splashDescription: `There was an error while unlinking your card.`,
                splashButtonText: `Try Again`,
                splashArtSource: MoonbeamErrorImage
            });
            setSplashShown(true);
            setBottomTabShown(false);
        }
    }

    /**
     * Function used to deactivate a card from an individual's card linked object.
     *
     * @param userId uniquely generated user identifier.
     * @param memberId member id obtained from Olive during the signup process.
     * @param cardId card id obtained from Olive during the signup and/or card addition process.
     */
    const deactivateCard = async (userId: string, memberId: string, cardId: string): Promise<boolean> => {
        try {
            // set a loader on button press
            setIsReady(false);

            // call the internal delete card API
            const deleteCardResult = await API.graphql(graphqlOperation(deleteCard, {
                deleteCardInput: {
                    id: userId,
                    memberId: memberId,
                    cardId: cardId
                }
            }));

            // retrieve the data block from the response
            // @ts-ignore
            const responseData = deleteCardResult ? deleteCardResult.data : null;

            // check if there are any errors in the returned response
            if (responseData && responseData.deleteCard.errorMessage === null) {
                // release the loader on button press
                setIsReady(true);

                // set the user information object's card list accordingly
                setUserInformation({
                    ...userInformation,
                    linkedCard: {
                        ...userInformation["linkedCard"],
                        cards: userInformation["linkedCard"]["cards"].filter((_, index) => selectedCardIndex !== index)
                    }
                });

                // reset the card linking status only if there are no cards left
                if (userInformation["linkedCard"]["cards"].filter((_, index) => selectedCardIndex !== index).length === 0) {
                    setCardLinkingStatus(false);
                    // set all the reload flags accordingly
                    setClickOnlySectionReload(true);
                    setVerticalClickOnlySectionReload(true);
                    setKitSectionReload(true);
                    setFidelisSectionReload(true);
                    setVerticalFidelisSectionReload(true);
                    setNearbySectionReload(true);
                    setVerticalNearbySectionReload(true);
                    setOnlineSectionReload(true);
                    setVerticalOnlineSectionReload(true);
                }

                return true;
            } else {
                // release the loader on button press
                setIsReady(true);

                const message = `Unexpected error while deleting a card through the delete card API ${JSON.stringify(deleteCardResult)}`;
                console.log(message);
                await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                return false;
            }
        } catch (error) {
            // release the loader on button press
            setIsReady(true);

            const message = `Unexpected error while attempting to delete a card through the delete card API ${JSON.stringify(error)} ${error}`;
            console.log(message);
            await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

            return false;
        }
    }

    /**
     * Function used to filter and return the linked cards.
     *
     * @return {@link React.ReactNode} or {@link React.ReactNode[]}
     */
    const filterCards = (): React.ReactNode | React.ReactNode[] => {
        let results: React.ReactNode[] = [];

        // check if there's no card linked object OR if there is no cards in the retrieved object
        if (!userInformation["linkedCard"] || (userInformation["linkedCard"] && userInformation["linkedCard"]["cards"].length === 0)) {
            results.push(
                <>
                    <Image
                        style={[styles.membershipImage,
                            showBottomSheet && {
                                backgroundColor: 'transparent', opacity: 0.3
                            }
                        ]}
                        resizeMethod={'scale'}
                        resizeMode={'contain'}
                        source={MoonbeamMembership}
                    />
                    <Text style={[styles.membershipTitle, showBottomSheet && {
                        backgroundColor: 'transparent', opacity: 0.3
                    }]}>
                        Membership
                    </Text>
                    <View style={[styles.membershipCard, showBottomSheet && {
                        backgroundColor: 'transparent', opacity: 0.3
                    }]}>
                        <View style={styles.membershipCardTitleView}>
                            <Image
                                style={[styles.basicMembershipImage,
                                    showBottomSheet && {
                                        backgroundColor: 'transparent', opacity: 0.3
                                    }
                                ]}
                                resizeMethod={'scale'}
                                resizeMode={'contain'}
                                source={MoonbeamBasicMembership}
                            />
                            <Text
                                numberOfLines={2}
                                style={styles.basicMembershipTitle}>
                                {"First Class\nMembership"}
                            </Text>
                        </View>
                        <View style={{bottom: hp(2), alignSelf: 'flex-start'}}>
                            <View style={{top: hp(2), width: wp(80)}}>
                                <Text
                                    numberOfLines={1}
                                    style={styles.membershipPerkNumberText}>
                                    🎲
                                </Text>
                                <Text
                                    numberOfLines={2}
                                    style={styles.membershipPerkText}>
                                    {"Automatic military discounts\nMarketplace access"}
                                </Text>
                            </View>
                            <View style={{bottom: hp(1), width: wp(80)}}>
                                <Text
                                    numberOfLines={1}
                                    style={styles.membershipPerkNumberText}>
                                    🛍️
                                </Text>
                                <Text
                                    numberOfLines={2}
                                    style={styles.membershipPerkText}>
                                    {"1 cent cashback on every\npurchase"}
                                </Text>
                            </View>
                            <View style={{bottom: hp(3.5), width: wp(80)}}>
                                <Text
                                    numberOfLines={1}
                                    style={styles.membershipPerkNumberText}>
                                    💰
                                </Text>
                                <Text
                                    numberOfLines={2}
                                    style={styles.membershipPerkText}>
                                    {"5-50% off purchases at\nqualifying merchants"}
                                </Text>
                            </View>
                            <View style={{bottom: hp(6), width: wp(80)}}>
                                <Text
                                    numberOfLines={1}
                                    style={styles.membershipPerkNumberText}>
                                    💳
                                </Text>
                                <Text
                                    numberOfLines={2}
                                    style={styles.membershipPerkText}>
                                    {"Up to 3 Visa and Mastercard,\ndebit or credit cards"}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.membershipCardActions}>
                            <Text
                                numberOfLines={1}
                                style={styles.priceTitle}>
                                {"FREE"}
                            </Text>
                            <TouchableOpacity
                                style={styles.startMembershipButton}
                                onPress={
                                    async () => {
                                        // set the type of bottom sheet to show
                                        setBottomSheetType("link-info");
                                        setShowBottomSheet(true);
                                    }}
                            >
                                <Text style={styles.startMembershipButtonContentStyle}>Activate</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            );
        } else {
            // different background and content colors available
            let cardBackgroundColors: string[] = ['#394fa6', '#F2FF5D', '#252629'];
            let cardContentColor: string[] = ['#FFFFFF', '#313030', '#F2FF5D', '#FFFFFF'];

            // different background and content colors available for dimming purposes
            const cardBackgroundColorsDimmed: string[] = ['#172042', '#808b00', '#0f0f10'];
            const cardContentColorDimmed: string[] = ['#666666', '#141313', '#808b00', '#666666'];

            if (showBottomSheet) {
                cardBackgroundColors = cardBackgroundColorsDimmed;
                cardContentColor = cardContentColorDimmed;
            }

            // card data to populate the dynamic animated wallet with
            const cardData: any[] = []
            /**
             * if there is at least one card in the user information object,
             * then filter through the linked cards and display them accordingly
             * in the list of cards
             */
            let cardCount = 0;
            for (let card of userInformation["linkedCard"]["cards"]) {
                card = card as Card;

                const contentColor = cardContentColor[cardCount];
                cardData.push(
                    <View style={{flex: 1}}>
                        <List.Item
                            style={[styles.cardItemStyle, {backgroundColor: cardBackgroundColors[cardCount]}]}
                            title={''}
                            right={() =>
                                <View style={styles.cardView}>
                                    <View style={{flexDirection: 'column', right: wp(12), bottom: hp(1.5)}}>
                                        <IconButton
                                            icon='trash-can-outline'
                                            iconColor={contentColor}
                                            rippleColor={'transparent'}
                                            style={{bottom: hp(1), left: wp(4)}}
                                            size={hp(4)}
                                            onPress={async () => {
                                                // set the selected card accordingly to be used when showing the bottom sheet
                                                setSelectedCard({
                                                    type: card["type"] as CardType,
                                                    last4: card["last4"]
                                                });

                                                // set the selected card index accordingly to be used when interacting with Olive
                                                let count = 0;
                                                for (let observedCard of userInformation["linkedCard"]["cards"]) {
                                                    observedCard = observedCard as Card;
                                                    if (card["last4"] === observedCard.last4 && card["name"] === observedCard.name &&
                                                        card["type"] === observedCard.type) {
                                                        setSelectedCardIndex(count);
                                                    }
                                                    count++;
                                                }

                                                // set the type of bottom sheet to show
                                                setBottomSheetType("unlink");

                                                // show the bottom sheet which will handle the card deletion
                                                setShowBottomSheet(true);
                                            }}
                                        />
                                        <IconButton
                                            style={{top: hp(8.2), left: wp(4)}}
                                            icon={MoonbeamCardChip}
                                            iconColor={contentColor}
                                            rippleColor={'transparent'}
                                            size={hp(4)}
                                            onPress={async () => {
                                                // do nothing, we chose an icon button for styling purposes here
                                            }}
                                        />
                                    </View>
                                </View>
                            }
                            left={() =>
                                <View style={styles.cardView}>
                                    <View style={{flexDirection: 'column'}}>
                                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                            <IconButton
                                                icon={card["type"] === CardType.Visa
                                                    ? MoonbeamVisaImage
                                                    : MoonbeamMasterCardImage
                                                }
                                                iconColor={contentColor}
                                                rippleColor={'transparent'}
                                                style={{bottom: hp(1)}}
                                                size={hp(6)}
                                                onPress={async () => {
                                                    // do nothing, we chose an icon button for styling purposes here
                                                }}
                                            />
                                            <Text
                                                numberOfLines={1}
                                                style={[styles.cardItemTitle, {color: contentColor, top: hp(1.7)}]}>
                                                {`••••${card["last4"]}`}
                                            </Text>
                                        </View>
                                        <View>
                                            <Text
                                                numberOfLines={1}
                                                style={[styles.cardItemDetails, {color: contentColor}]}>
                                                {`${card["name"]}`}
                                            </Text>
                                            <IconButton
                                                icon={MoonbeamLogo}
                                                iconColor={contentColor}
                                                style={{top: hp(4)}}
                                                size={hp(4)}
                                                onPress={async () => {
                                                    // do nothing, we chose an icon button for styling purposes here
                                                }}
                                            />
                                        </View>
                                    </View>
                                </View>
                            }
                        />
                    </View>
                );
                cardCount++;
            }

            // return another information card for the wallet if there's less than 3 cards available
            if (userInformation["linkedCard"] && userInformation["linkedCard"]["cards"].length < 3) {
                const contentColor = cardBackgroundColors[1];
                cardData.push(
                    <View style={{flex: 1}}>
                        <List.Item
                            style={[styles.cardItemStyle, {backgroundColor: cardBackgroundColors[2]}]}
                            title={''}
                            right={() =>
                                <TouchableOpacity
                                    style={styles.infoCardButton}
                                    onPress={async () => {
                                        // set the type of bottom sheet to show
                                        setBottomSheetType("link");

                                        // if there is no error and/or success to show, then this button will open up the bottom sheet
                                        if (!splashShown) {
                                            /**
                                             * open up the bottom sheet, where the linking action will take place. Any linked cards and/or errors will be
                                             * handled by the CardLinkingBottomSheet component
                                             */
                                            setShowBottomSheet(true);
                                        } else {
                                            // reset the success linking flag, in case it is true, as well as hide the custom banner accordingly
                                            if (cardLinkingBottomSheet) {
                                                setCardLinkingBottomSheet(false);

                                                // change the card linking status
                                                setCardLinkingStatus(true);

                                                // set the custom banner state for future screens accordingly
                                                setBannerState({
                                                    bannerVisibilityState: cardLinkingStatusState,
                                                    bannerMessage: "",
                                                    bannerButtonLabel: "",
                                                    bannerButtonLabelActionSource: "",
                                                    bannerArtSource: CardLinkingImage,
                                                    dismissing: false
                                                });
                                            }

                                            // close the previously opened bottom sheet, and reset the splash shown flag, to return to the default wallet view
                                            setShowBottomSheet(false);
                                            setBottomTabShown(true);
                                            setSplashShown(false);
                                        }
                                    }}
                                >
                                    <Text style={[styles.infoCardButtonContentStyle, {color: contentColor}]}>Link
                                        card</Text>
                                </TouchableOpacity>
                            }
                            left={() =>
                                <View style={styles.cardView}>
                                    <View style={{flexDirection: 'column'}}>
                                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                            <IconButton
                                                icon={MoonbeamLogo}
                                                iconColor={contentColor}
                                                rippleColor={'transparent'}
                                                style={{bottom: hp(1), left: wp(1)}}
                                                size={hp(5)}
                                                onPress={async () => {
                                                    // do nothing, we chose an icon button for styling purposes here
                                                }}
                                            />
                                            <Text numberOfLines={1}
                                                  style={[styles.cardItemTitle, {
                                                      color: cardContentColor[3],
                                                      top: hp(1)
                                                  }]}>
                                                {`Earn more!`}
                                            </Text>
                                        </View>
                                        <Text
                                            numberOfLines={2}
                                            style={[styles.cardItemDetails, {
                                                top: hp(1),
                                                color: cardContentColor[3],
                                                width: wp(85)
                                            }]}>
                                            {`You can now link up to 3 favorite cards in your wallet!`}
                                        </Text>
                                    </View>
                                </View>
                            }
                        />
                    </View>
                );
            }

            // return the dynamic wallet contents
            results.push(
                <CardsWallet
                    cardSeparation={75}
                    cardBorderRadius={20}
                    cardShadowColor={"black"}
                    showCardShadow={true}
                    cardBgColor={"transparent"}
                    cardHeight={hp(27)}
                    data={cardData}
                />
            );
        }
        return results;
    }

    // return the component for the Wallet page
    return (
        <>
            {!isReady ?
                <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                :
                <SafeAreaProvider style={styles.walletView}>
                    <TouchableOpacity
                        activeOpacity={1}
                        disabled={!showBottomSheet}
                        onPress={() => {
                            // @ts-ignore
                            bottomSheetRef.current?.close?.();
                            setShowBottomSheet(true);
                        }}
                    >
                        <View
                            {...showBottomSheet && {pointerEvents: "none"}}
                        >
                            {
                                splashShown ?
                                    <SplashScreen splashTitle={splashState.splashTitle}
                                                  splashDescription={splashState.splashDescription}
                                                  splashButtonText={splashState.splashButtonText}
                                        //@ts-ignore
                                                  splashArtSource={splashState.splashArtSource}
                                    />
                                    :
                                    <>
                                        <View style={[styles.walletTextView,
                                            showBottomSheet && {
                                                backgroundColor: 'transparent', opacity: 0.3
                                            }
                                        ]}>
                                            <View style={styles.walletTopTitleView}>
                                                <Text
                                                    style={styles.walletTitle}>
                                                    Wallet
                                                </Text>
                                            </View>
                                            <Divider
                                                style={[commonStyles.divider, {width: wp(100)}]}/>
                                        </View>
                                        <LinearGradient
                                            colors={['transparent', '#5b5b5b']}
                                            style={styles.mainCardView}>
                                            {
                                                filterCards()
                                            }
                                        </LinearGradient>
                                    </>
                            }
                            <View style={[styles.disclaimerTextView,
                                showBottomSheet && {
                                    backgroundColor: 'transparent', opacity: 0.3
                                }
                            ]}>
                                <TouchableOpacity
                                    disabled={!splashShown && (userInformation["linkedCard"] && userInformation["linkedCard"]["cards"].length !== 0)}
                                    style={
                                        splashShown
                                            ? styles.splashButton
                                            : styles.linkingButtonDisabled
                                    }
                                    onPress={
                                        async () => {
                                            // if there is no error and/or success to show, then this button will open up the bottom sheet
                                            if (!splashShown) {
                                                /**
                                                 * open up the bottom sheet, where the linking action will take place. Any linked cards and/or errors will be
                                                 * handled by the CardLinkingBottomSheet component
                                                 */
                                                setShowBottomSheet(true);
                                            } else {
                                                // reset the success linking flag, in case it is true, as well as hide the custom banner accordingly
                                                if (cardLinkingBottomSheet) {
                                                    setCardLinkingBottomSheet(false);

                                                    // change the card linking status
                                                    setCardLinkingStatus(true);

                                                    // set the custom banner state for future screens accordingly
                                                    setBannerState({
                                                        bannerVisibilityState: cardLinkingStatusState,
                                                        bannerMessage: "",
                                                        bannerButtonLabel: "",
                                                        bannerButtonLabelActionSource: "",
                                                        bannerArtSource: CardLinkingImage,
                                                        dismissing: false
                                                    });
                                                }

                                                // close the previously opened bottom sheet, and reset the splash shown flag, to return to the default wallet view
                                                setShowBottomSheet(false);
                                                setBottomTabShown(true);
                                                setSplashShown(false);

                                                // reset the splash state accordingly
                                                setSplashState({
                                                    splashTitle: "",
                                                    splashDescription: "",
                                                    splashButtonText: "",
                                                    splashArtSource: ""
                                                });
                                            }
                                        }
                                    }
                                >
                                    <Text style={styles.buttonText}>{splashState.splashButtonText}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                    {
                        !cardLinkingBottomSheet && !appDrawerHeaderShown &&
                        <BottomSheet
                            handleIndicatorStyle={{backgroundColor: '#F2FF5D'}}
                            enableHandlePanningGesture={true}
                            ref={bottomSheetRef}
                            backgroundStyle={styles.bottomSheet}
                            enablePanDownToClose={true}
                            index={showBottomSheet ? 0 : -1}
                            snapPoints={
                                bottomSheetType === 'link-info'
                                    ? [hp(55), hp(55)]
                                    : ((userInformation["linkedCard"] && bottomSheetType === 'unlink')
                                        ? [hp(35), hp(35)]
                                        : ['70%', '70%'])
                            }
                            onChange={(index) => {
                                setShowBottomSheet(index !== -1);
                            }}
                        >
                            {
                                bottomSheetType === 'link-info' ?
                                    <View style={{
                                        flexDirection: 'column',
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'center'
                                    }}>
                                        <Text
                                            style={styles.cardRemovalTitle}>
                                            Card Linking
                                        </Text>
                                        <Text
                                            style={[styles.cardRemovalSubtitle, {marginBottom: hp(4)}]}>
                                            To take advantage of automatic military discounts please link a Visa or
                                            MasterCard, debit or credit card.
                                        </Text>
                                        <Text
                                            numberOfLines={2}
                                            style={[styles.cardRemovalSubtitle, {color: '#F2FF5D', textAlign: 'left'}]}>
                                            {"➊ This service is completely free. Your card will not be charged."}
                                        </Text>
                                        <Text
                                            numberOfLines={2}
                                            style={[styles.cardRemovalSubtitle, {
                                                color: '#F2FF5D',
                                                textAlign: 'left',
                                                marginTop: hp(1.5)
                                            }]}>
                                            ➋ We will not store your card information.
                                        </Text>
                                        <Text
                                            numberOfLines={2}
                                            style={[styles.cardRemovalSubtitle, {
                                                color: '#F2FF5D',
                                                textAlign: 'left',
                                                marginTop: hp(1.5)
                                            }]}>
                                            {"➌ We Are Secured by a PCI-compliant\nCard Vault."}
                                        </Text>
                                        <Text
                                            numberOfLines={2}
                                            style={[styles.cardRemovalSubtitle, {
                                                color: '#F2FF5D',
                                                textAlign: 'left',
                                                marginTop: hp(1.5)
                                            }]}>
                                            {"➍ We do not sell your data."}
                                        </Text>

                                        <TouchableOpacity
                                            style={styles.cardRemovalButton}
                                            onPress={
                                                async () => {
                                                    // set the type of bottom sheet to show
                                                    setBottomSheetType("link");

                                                    // if there is no error and/or success to show, then this button will open up the bottom sheet
                                                    if (!splashShown) {
                                                        /**
                                                         * open up the bottom sheet, where the linking action will take place. Any linked cards and/or errors will be
                                                         * handled by the CardLinkingBottomSheet component
                                                         */
                                                        setShowBottomSheet(true);
                                                    } else {
                                                        // reset the success linking flag, in case it is true, as well as hide the custom banner accordingly
                                                        if (cardLinkingBottomSheet) {
                                                            setCardLinkingBottomSheet(false);

                                                            // change the card linking status
                                                            setCardLinkingStatus(true);

                                                            // set the custom banner state for future screens accordingly
                                                            setBannerState({
                                                                bannerVisibilityState: cardLinkingStatusState,
                                                                bannerMessage: "",
                                                                bannerButtonLabel: "",
                                                                bannerButtonLabelActionSource: "",
                                                                bannerArtSource: CardLinkingImage,
                                                                dismissing: false
                                                            });
                                                        }

                                                        // close the previously opened bottom sheet, and reset the splash shown flag, to return to the default wallet view
                                                        setShowBottomSheet(false);
                                                        setBottomTabShown(true);
                                                        setSplashShown(false);
                                                    }
                                                }
                                            }
                                        >
                                            <Text style={styles.buttonText}>{`Continue`}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    : ((userInformation["linkedCard"] && bottomSheetType === 'unlink')
                                        ?
                                        <View style={{
                                            flexDirection: 'column',
                                            alignContent: 'center',
                                            alignItems: 'center',
                                            alignSelf: 'center'
                                        }}>
                                            <Text
                                                style={styles.cardRemovalTitle}>
                                                Card Removal
                                            </Text>
                                            <Text
                                                style={styles.cardRemovalDetails}>
                                                {selectedCard!.type === CardType.Visa ? 'VISA' : 'MASTERCARD'} ••••{selectedCard!.last4}
                                            </Text>
                                            <Text
                                                style={styles.cardRemovalSubtitle}>
                                                Once you remove this card, you will no longer be eligible to
                                                participate
                                                in
                                                previously linked programs and/or offers. Do you wish to continue ?
                                            </Text>
                                            <TouchableOpacity
                                                style={styles.cardRemovalButton}
                                                onPress={
                                                    async () => {
                                                        // delete the card
                                                        await deleteCardAction();
                                                    }
                                                }
                                            >
                                                <Text style={styles.buttonText}>{`Continue`}</Text>
                                            </TouchableOpacity>
                                        </View>
                                        : <CardLinkingBottomSheet/>)
                            }
                        </BottomSheet>
                    }
                </SafeAreaProvider>
            }
        </>
    );
};
