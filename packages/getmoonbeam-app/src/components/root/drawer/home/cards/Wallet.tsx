import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, Image, SafeAreaView, TouchableOpacity, View} from "react-native";
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
import {currentUserInformation, globalAmplifyCacheState} from "../../../../../recoil/AuthAtom";
import {Card, CardType, deleteCard} from "@moonbeam/moonbeam-models";
import {API, graphqlOperation} from "aws-amplify";
import {SplashScreen} from "../../../../common/Splash";
import {splashStatusState} from "../../../../../recoil/SplashAtom";
import {customBannerState} from "../../../../../recoil/CustomBannerAtom";
import {cardLinkingBottomSheetState} from "../../../../../recoil/WalletAtom";
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
import {deviceTypeState} from "../../../../../recoil/RootAtom";
import * as Device from "expo-device";
import {DeviceType} from "expo-device";
import {showWalletBottomSheetState} from "../../../../../recoil/DashboardAtom";
import {LinearGradient} from "expo-linear-gradient";
import {Divider} from '@rneui/base';
import {commonStyles} from "../../../../../styles/common.module";

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
    // constants used to keep track of shared states
    const [globalCache, ] = useRecoilState(globalAmplifyCacheState);
    const [, setCardLinkingStatus] = useRecoilState(cardLinkingStatusState);
    const [, setBannerState] = useRecoilState(customBannerState);
    const [, setBannerShown] = useRecoilState(customBannerShown);
    const [appDrawerHeaderShown, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [, setBottomTabShown] = useRecoilState(bottomTabShownState);
    const [userInformation, setUserInformation] = useRecoilState(currentUserInformation);
    const [splashState, setSplashState] = useRecoilState(splashStatusState);
    const [cardLinkingBottomSheet, setCardLinkingBottomSheet] = useRecoilState(cardLinkingBottomSheetState);
    const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);
    const [deviceType, setDeviceType] = useRecoilState(deviceTypeState);
    const [showBottomSheet, setShowBottomSheet] = useRecoilState(showWalletBottomSheetState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // check and set the type of device, to be used throughout the app
        Device.getDeviceTypeAsync().then(deviceType => {
            setDeviceType(deviceType);
        });
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
        }
        if (showBottomSheet && bottomSheetRef) {
            // @ts-ignore
            bottomSheetRef.current?.expand?.();
        }
    }, [navigation.getState(), showBottomSheet, bottomSheetRef, userInformation, cardLinkingBottomSheet, deviceType]);

    /**
     * Function used to handle the delete card action, from the bottom sheet
     * button press.
     */
    const deleteCardAction = async (): Promise<void> => {
        // need to call the delete API here
        const deleteCardFlag = await deactivateCard(
            userInformation["custom:userId"],
            userInformation["linkedCard"]["memberId"],
            userInformation["linkedCard"]["cards"][0]["id"]);

        // check the delete card flag, and display a splash screen accordingly
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

            // change the card linking status
            setCardLinkingStatus(false);

            // set the custom banner state for future screens accordingly
            setBannerState({
                bannerVisibilityState: cardLinkingStatusState,
                bannerMessage: "You currently do not have a linked card to your Moonbeam account. In order to see more dashboard details, you will need to have a card in your wallet. Get started now!",
                bannerButtonLabel: "Link Now",
                bannerButtonLabelActionSource: "home/wallet",
                bannerArtSource: CardLinkingImage,
                dismissing: false
            });

            // if the card was successfully removed, then we can cache it accordingly
            const newCardLink = {
                ...userInformation["linkedCard"],
                cards: []
            }
            if (globalCache && await globalCache!.getItem(`${userInformation["custom:userId"]}-linkedCardFlag`) !== null) {
                console.log('old card is cached, needs cleaning up');
                await globalCache!.removeItem(`${userInformation["custom:userId"]}-linkedCard`);
                await globalCache!.removeItem(`${userInformation["custom:userId"]}-linkedCardFlag`);
                await globalCache!.setItem(`${userInformation["custom:userId"]}-linkedCard`, newCardLink);
                await globalCache!.setItem(`${userInformation["custom:userId"]}-linkedCardFlag`, true);
            } else {
                console.log('card is not cached');
                globalCache && globalCache!.setItem(`${userInformation["custom:userId"]}-linkedCard`, newCardLink);
                globalCache && await globalCache!.setItem(`${userInformation["custom:userId"]}-linkedCardFlag`, true);
            }
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
                        cards: []
                    }
                })

                return true;
            } else {
                // release the loader on button press
                setIsReady(true);

                console.log(`Unexpected error while deleting a card through the delete card API ${JSON.stringify(deleteCardResult)}`);
                return false;
            }
        } catch (error) {
            // release the loader on button press
            setIsReady(true);

            console.log(`Unexpected error while attempting to delete a card through the delete card API ${JSON.stringify(error)} ${error}`);
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
                            bottom: Dimensions.get('window').height/15
                        }}
                        size={Dimensions.get('window').height / 20}
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
                    />
                </>
            );
        } else {
            // there is at least one card in the user information object
            const card = userInformation["linkedCard"]["cards"][0] as Card;

            results.push(
                <>
                    <List.Item
                        style={styles.cardItemStyle}
                        titleStyle={styles.cardItemTitle}
                        descriptionStyle={styles.cardItemDetails}
                        titleNumberOfLines={2}
                        descriptionNumberOfLines={2}
                        title={card["name"]}
                        description={`${card["type"] === CardType.Visa ? 'VISA' : 'MASTERCARD'} ••••${card["last4"]}`}
                        right={() =>
                            <View style={styles.cardView}>
                                <IconButton
                                    icon={MoonbeamLogo}
                                    iconColor={'#313030'}
                                    rippleColor={'transparent'}
                                    size={Dimensions.get('window').height / 25}
                                    onPress={async () => {
                                        // do nothing, we chose an icon button for styling purposes here
                                    }}
                                />
                                <IconButton
                                    style={{top: Dimensions.get('window').height / 13}}
                                    icon={card["type"] === CardType.Visa
                                        ? MoonbeamVisaImage
                                        : MoonbeamMasterCardImage
                                    }
                                    iconColor={'#313030'}
                                    rippleColor={'transparent'}
                                    size={Dimensions.get('window').height / 18}
                                    onPress={async () => {
                                        // do nothing, we chose an icon button for styling purposes here
                                    }}
                                />
                            </View>
                        }
                        left={() =>
                            <View style={styles.cardView}>
                                <IconButton
                                    icon={MoonbeamCardChip}
                                    iconColor={'#313030'}
                                    rippleColor={'transparent'}
                                    style={{bottom: Dimensions.get('window').height / 65}}
                                    size={Dimensions.get('window').height / 35}
                                    onPress={async () => {
                                        // do nothing, we chose an icon button for styling purposes here
                                    }}
                                />
                                <IconButton
                                    icon='trash-can-outline'
                                    iconColor={'#313030'}
                                    style={{top: Dimensions.get('window').height / 12.5}}
                                    size={Dimensions.get('window').height / 35}
                                    onPress={async () => {
                                        // show the bottom sheet which will handle the card deletion
                                        setShowBottomSheet(true);
                                    }}
                                />
                            </View>
                        }
                    />
                </>
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
                                            style={deviceType === DeviceType.TABLET ? styles.walletTitleTablet : styles.walletTitle}>
                                            Wallet
                                        </Text>
                                        <IconButton
                                            icon={userInformation["linkedCard"] && userInformation["linkedCard"]["cards"].length !== 0 ? 'trash-can' : 'plus'}
                                            iconColor={'#F2FF5D'}
                                            style={{
                                                alignSelf: 'flex-end',
                                                left: Dimensions.get('window').width / 1.8
                                            }}
                                            size={Dimensions.get('window').height / 32}
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
                                        />
                                    </View>
                                    <Divider
                                        style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
                                </View>
                                <LinearGradient
                                    colors={['transparent', '#5b5b5b']}
                                    style={styles.mainCardView}>
                                    <List.Section style={styles.listSectionView}>
                                        {
                                            filterCards()
                                        }
                                    </List.Section>
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
                            <Text
                                style={styles.buttonText}>{
                                splashShown
                                    ? splashState.splashButtonText
                                    : `Connect new card`
                            }</Text>
                        </TouchableOpacity>
                        {
                            !splashShown &&
                            userInformation["linkedCard"] && userInformation["linkedCard"]["cards"].length === 0
                                ? <Text
                                    style={deviceType === DeviceType.TABLET ? styles.disclaimerTextTablet : styles.disclaimerText}>
                                    Connect your <Text
                                    style={styles.highlightedText}>Visa</Text> or <Text
                                    style={styles.highlightedText}>MasterCard</Text> debit or credit card.
                                </Text>
                                :
                                splashShown
                                    ?
                                    <></>
                                    :
                                    <Text
                                        style={deviceType === DeviceType.TABLET ? styles.disclaimerTextTablet : styles.disclaimerText}>
                                        Earn discounts on <Text style={styles.highlightedText}>every
                                        transaction</Text> at <Text
                                        style={styles.highlightedText}>qualifying</Text> merchant locations.
                                    </Text>
                        }
                    </View>
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
                                (userInformation["linkedCard"] && userInformation["linkedCard"]["cards"].length !== 0)
                                    ? ['40%', '40%']
                                    : ['70%', '70%']
                            }
                            onChange={(index) => {
                                setShowBottomSheet(index !== -1);
                            }}
                        >
                            {
                                (userInformation["linkedCard"] && userInformation["linkedCard"]["cards"].length !== 0)
                                    ?
                                    <View style={{
                                        flexDirection: 'column',
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'center'
                                    }}>
                                        <Text
                                            style={deviceType === DeviceType.TABLET ? styles.cardRemovalTitleTablet : styles.cardRemovalTitle}>
                                            Card Removal
                                        </Text>
                                        <Text
                                            style={deviceType === DeviceType.TABLET ? styles.cardRemovalDetailsTablet : styles.cardRemovalDetails}>
                                            {userInformation["linkedCard"]["cards"][0]["type"] === CardType.Visa ? 'VISA' : 'MASTERCARD'} ••••{userInformation["linkedCard"]["cards"][0]["last4"]}
                                        </Text>
                                        <Text
                                            style={deviceType === DeviceType.TABLET ? styles.cardRemovalSubtitleTablet : styles.cardRemovalSubtitle}>
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
