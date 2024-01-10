import React, {useEffect, useRef, useState} from 'react';
import {Image, SafeAreaView, TouchableOpacity, View} from "react-native";
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
import {cardLinkingBottomSheetState, selectedCardIndexState} from "../../../../../recoil/WalletAtom";
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
import RegistrationBackgroundImage from '../../../../../../assets/backgrounds/registration-background.png';
import {showWalletBottomSheetState} from "../../../../../recoil/DashboardAtom";
import {LinearGradient} from "expo-linear-gradient";
import {Divider} from '@rneui/base';
import {commonStyles} from "../../../../../styles/common.module";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {logEvent} from "../../../../../utils/AppSync";
import CardsWallet from 'react-native-wallet-cards';

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
    const [bottomSheetType, setBottomSheetType] = useState<"unlink" | "link">("link");
    const [selectedCard, setSelectedCard] = useState<SelectedCard | null>(null);
    // constants used to keep track of shared states
    const [selectedCardIndex,setSelectedCardIndex] = useRecoilState(selectedCardIndexState);
    const [userIsAuthenticated,] = useRecoilState(userIsAuthenticatedState);
    const [, setCardLinkingStatus] = useRecoilState(cardLinkingStatusState);
    const [, setBannerState] = useRecoilState(customBannerState);
    const [, setBannerShown] = useRecoilState(customBannerShown);
    const [appDrawerHeaderShown, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [, setBottomTabShown] = useRecoilState(bottomTabShownState);
    const [userInformation, setUserInformation] = useRecoilState(currentUserInformation);
    const [splashState, setSplashState] = useRecoilState(splashStatusState);
    const [cardLinkingBottomSheet, setCardLinkingBottomSheet] = useRecoilState(cardLinkingBottomSheetState);
    const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);
    const [showBottomSheet, setShowBottomSheet] = useRecoilState(showWalletBottomSheetState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // only display a banner if the number of cards left is 0
        if (userInformation["linkedCard"] && userInformation["linkedCard"]["cards"] && userInformation["linkedCard"]["cards"].length === 0)  {
            // change the card linking status
            setCardLinkingStatus(false);

            // set the custom banner state for future screens accordingly
            setBannerState({
                bannerVisibilityState: cardLinkingStatusState,
                bannerMessage: "You do not have a linked card. You will need to have a card in your wallet to see more details.",
                bannerButtonLabel: "Link Now",
                bannerButtonLabelActionSource: "home/wallet",
                bannerArtSource: CardLinkingImage,
                dismissing: false
            });
        }

        // set the app drawer status accordingly, custom banner visibility and drawer swipe actions accordingly
        if (navigation.getState().index === 2) {
            setAppDrawerHeaderShown(false);
            setBannerShown(false);
            setDrawerSwipeEnabled(false);
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
                })

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
                        style={styles.noCardImage}
                        resizeMethod={'scale'}
                        resizeMode={'contain'}
                        source={NoCardImage}
                    />
                    <IconButton
                        icon={'plus-circle-outline'}
                        iconColor={'#F2FF5D'}
                        style={{
                            alignSelf: 'center',
                            bottom: hp(11)
                        }}
                        size={hp(5.5)}
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
                    />
                </>
            );
        } else {
            // different background colors available
            const cardBackgroundColors: string[] = ['#394fa6', '#F2FF5D', '#252629'];
            const cardContentColor: string[] = ['#FFFFFF', '#313030', '#FFFFFF', '#FFFFFF'];

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
                            titleStyle={[styles.cardItemTitle, {color: cardContentColor[cardCount]}]}
                            descriptionStyle={[styles.cardItemDetails, {color: cardContentColor[cardCount]}]}
                            titleNumberOfLines={1}
                            descriptionNumberOfLines={1}
                            title={`••••${card["last4"]}`}
                            description={`${card["name"]}`}
                            right={() =>
                                <View style={styles.cardView}>
                                    <IconButton
                                        icon='trash-can-outline'
                                        iconColor={contentColor}
                                        rippleColor={'transparent'}
                                        style={{bottom: hp(0.8), left: wp(4)}}
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
                                        style={{top: hp(9), left: wp(4)}}
                                        icon={MoonbeamCardChip}
                                        iconColor={contentColor}
                                        rippleColor={'transparent'}
                                        size={hp(4)}
                                        onPress={async () => {
                                            // do nothing, we chose an icon button for styling purposes here
                                        }}
                                    />
                                </View>
                            }
                            left={() =>
                                <View style={styles.cardView}>
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
                                    <IconButton
                                        icon={MoonbeamLogo}
                                        iconColor={contentColor}
                                        style={{top: hp(8)}}
                                        size={hp(4)}
                                        onPress={async () => {
                                            // do nothing, we chose an icon button for styling purposes here
                                        }}
                                    />
                                </View>
                            }
                        />
                    </View>
                );
                cardCount++;
            }

            // return another information card for the wallet if there's less than 3 cards available
            if (userInformation["linkedCard"] && userInformation["linkedCard"]["cards"].length < 3) {
                cardData.push(
                    <View style={{flex: 1}}>
                        <List.Item
                            style={[styles.cardItemStyle, {backgroundColor: cardBackgroundColors[2]}]}
                            titleStyle={[styles.cardItemTitle, {
                                left: wp(2),
                                color: cardContentColor[3],
                                bottom: hp(0),
                                top: hp(0)
                            }]}
                            descriptionStyle={[styles.cardItemDetails, {
                                top: hp(2),
                                color: cardContentColor[3],
                                width: wp(90),
                                marginLeft: wp(2)
                            }]}
                            titleNumberOfLines={1}
                            descriptionNumberOfLines={3}
                            title={`Earn more!`}
                            description={`You can now link up to 3 favorite cards in your wallet!`}
                            left={() =>
                                <View style={styles.cardView}>
                                    <IconButton
                                        icon={MoonbeamLogo}
                                        iconColor={'#F2FF5D'}
                                        rippleColor={'transparent'}
                                        style={{
                                            left: wp(1.25),
                                            bottom: hp(3)
                                        }}
                                        size={hp(5)}
                                        onPress={async () => {
                                            // do nothing, we chose an icon button for styling purposes here
                                        }}
                                    />
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
                                        <Text style={styles.infoCardButtonContentStyle}>Link card</Text>
                                    </TouchableOpacity>
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
                <SafeAreaView style={styles.walletView}>
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
                            {...showBottomSheet && {
                                style: {backgroundColor: 'transparent', opacity: 0.3}
                            }}
                        >
                            {
                                splashShown ?
                                    <SplashScreen splashTitle={splashState.splashTitle}
                                                  splashDescription={splashState.splashDescription}
                                                  splashButtonText={splashState.splashButtonText}
                                                  splashArtSource={splashState.splashArtSource}
                                    />
                                    :
                                    <>
                                        <View style={styles.walletTextView}>
                                            <View style={styles.walletTopTitleView}>
                                                <Text
                                                    style={styles.walletTitle}>
                                                    Wallet
                                                </Text>
                                                {
                                                    userInformation["linkedCard"] && userInformation["linkedCard"]["cards"].length !== 3 &&
                                                    <IconButton
                                                        icon={'plus'}
                                                        iconColor={'#F2FF5D'}
                                                        style={{
                                                            alignSelf: 'flex-end',
                                                            bottom: hp(6.5),
                                                            right: wp(3)
                                                        }}
                                                        size={hp(3.5)}
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
                                                    />
                                                }
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
                            <View style={styles.disclaimerTextView}>
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
                                            }
                                        }
                                    }
                                >
                                    <Text style={styles.buttonText}>{splashState.splashButtonText}</Text>
                                </TouchableOpacity>
                                {
                                    !splashShown &&
                                    userInformation["linkedCard"] && userInformation["linkedCard"]["cards"].length === 0
                                        && <Text
                                            style={styles.disclaimerText}>
                                            Connect your <Text
                                            style={styles.highlightedText}>Visa</Text> or <Text
                                            style={styles.highlightedText}>MasterCard</Text> debit or credit card.
                                        </Text>
                                }
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
                                (userInformation["linkedCard"] && bottomSheetType === 'unlink')
                                    ? [hp(35), hp(35)]
                                    : ['70%', '70%']
                            }
                            onChange={(index) => {
                                setShowBottomSheet(index !== -1);
                            }}
                        >
                            {
                                (userInformation["linkedCard"] && bottomSheetType === 'unlink')
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
                                    : <CardLinkingBottomSheet/>
                            }
                        </BottomSheet>
                    }
                </SafeAreaView>
            }
        </>
    );
};
// userInformation["linkedCard"]["cards"][0]
