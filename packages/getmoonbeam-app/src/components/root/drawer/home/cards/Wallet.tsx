import React, {useEffect, useState} from 'react';
import {Dimensions, ImageBackground, SafeAreaView, TouchableOpacity, View} from "react-native";
import {CardsProps} from "../../../../../models/props/HomeProps";
import {IconButton, List, Text} from "react-native-paper";
import {useRecoilState} from "recoil";
import {
    appDrawerHeaderShownState,
    cardLinkingStatusState,
    customBannerShown
} from "../../../../../recoil/AppDrawerAtom";
import {styles} from '../../../../../styles/wallet.module';
import {commonStyles} from "../../../../../styles/common.module";
import {Divider} from "@rneui/base";
import BottomSheet from "@gorhom/bottom-sheet";
import {bottomTabShownState} from "../../../../../recoil/HomeAtom";
import {CardLinkingBottomSheet} from "./CardLinkingBottomSheet";
import {Spinner} from "../../../../common/Spinner";
import {currentUserInformation} from "../../../../../recoil/AuthAtom";
import {Card, CardType, deleteCard} from "@moonbeam/moonbeam-models";
import {API, graphqlOperation} from "aws-amplify";
import {SplashScreen} from "../../../../common/Splash";
import {splashStatusState} from "../../../../../recoil/SplashAtom";
import {customBannerState} from "../../../../../recoil/CustomBannerAtom";
import {cardLinkingBottomSheetState} from "../../../../../recoil/WalletAtom";

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
    const [bottomSheetIndex, setBottomSheetIndex] = useState<number>(-1);
    const [splashShown, setSplashShown] = useState<boolean>(false);
    // constants used to keep track of shared states
    const [, setCardLinkingStatus] = useRecoilState(cardLinkingStatusState);
    const [, setBannerState] = useRecoilState(customBannerState);
    const [, setBannerShown] = useRecoilState(customBannerShown);
    const [, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [, setBottomTabShown] = useRecoilState(bottomTabShownState);
    const [userInformation, setUserInformation] = useRecoilState(currentUserInformation);
    const [splashState, setSplashState] = useRecoilState(splashStatusState);
    const [cardLinkingBottomSheet, setCardLinkingBottomSheet] = useRecoilState(cardLinkingBottomSheetState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // set the app drawer status accordingly && set the custom banner visibility accordingly
        if (navigation.getState().index === 2) {
            setAppDrawerHeaderShown(false);
            setBannerShown(false);
        }
        // manipulate the bottom bar navigation accordingly, depending on the bottom sheet being shown or not
        if (bottomSheetIndex === -1 && !splashShown) {
            setBottomTabShown(true);
        } else {
            setBottomTabShown(false);
        }
        // manipulate the card linking success splash screen, with an external action coming from the Olive enrollment form
        if (cardLinkingBottomSheet) {
            // if the card deletion was not successful, then display the appropriate splash screen
            setSplashState({
                splashTitle: `Great!`,
                splashDescription: `You have successfully linked your card.`,
                splashButtonText: `Continue`,
                splashArtSource: require('../../../../../../assets/art/moonbeam-card-linking.png')
            });
            setSplashShown(true);
            setBottomTabShown(false);
            // hide the bottom sheet for deletion, to show splash message
            setBottomSheetIndex(-1);
        }
    }, [navigation.getState(), bottomSheetIndex, userInformation, cardLinkingBottomSheet]);

    /**
     * Function used to handle the delete card action, from the bottom sheet
     * button press.
     */
    const deleteCardAction = async () => {
        // need to call the delete API here
        const deleteCardFlag = await deactivateCard(
            userInformation["custom:userId"],
            userInformation["linkedCard"]["memberId"],
            userInformation["linkedCard"]["cards"][0]["id"]);

        // check the delete card flag, and display a splash screen accordingly
        if (deleteCardFlag) {
            // hide the bottom sheet for deletion, to show splash message
            setBottomSheetIndex(-1);
            // if the card deletion was successful, then show the link card banner, and display the appropriate splash screen
            setSplashState({
                splashTitle: `Card successfully unlinked!`,
                splashDescription: `Don't forget to link a new card if you want to participate in our discount programs.`,
                splashButtonText: `Ok`,
                splashArtSource: require('../../../../../../assets/art/moonbeam-card-deletion.png')
            });
            setSplashShown(true);
            setBottomTabShown(false);
        } else {
            // hide the bottom sheet for deletion, to show splash message
            setBottomSheetIndex(-1);
            // if the card deletion was not successful, then display the appropriate splash screen
            setSplashState({
                splashTitle: `Houston we got a problem!`,
                splashDescription: `There was an error while unlinking your card.`,
                splashButtonText: `Try Again`,
                splashArtSource: require('../../../../../../assets/art/moonbeam-error.png')
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

                // set the user information object's card list accordingly - need to delete this but we will leave it here for now
                setUserInformation({
                    ...userInformation,
                    linkedCard: {
                        ...userInformation["linkedCard"],
                        cards: []
                    }
                })

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
                    <List.Item
                        style={styles.cardItemStyle}
                        titleStyle={styles.cardItemTitle}
                        descriptionStyle={styles.cardItemDetails}
                        titleNumberOfLines={1}
                        descriptionNumberOfLines={2}
                        title="Hurry!"
                        description='Connect your first card below.'
                        right={() =>
                            <List.Icon color={'#F2FF5D'} icon="exclamation"/>
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
                        left={() =>
                            <IconButton
                                icon={
                                    card["type"] === CardType.Visa
                                        ? require('../../../../../../assets/moonbeam-visa-icon.png')
                                        : require('../../../../../../assets/moonbeam-mastercard-icon.png')
                                }
                                iconColor={'#F2FF5D'}
                                rippleColor={'transparent'}
                                size={Dimensions.get('window').height / 20}
                                onPress={async () => {
                                    // do nothing, we chose an icon button for styling purposes here
                                }}
                            />}
                        right={() =>
                            <IconButton
                                icon="delete"
                                iconColor={'#FFFFFF'}
                                style={{
                                    marginTop: Dimensions.get('window').height / 70,
                                    left: Dimensions.get('window').width / 25
                                }}
                                size={Dimensions.get('window').height / 35}
                                onPress={async () => {
                                    setBottomSheetIndex(1);
                                }}
                            />}
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
                <ImageBackground
                    style={commonStyles.image}
                    resizeMethod={'scale'}
                    imageStyle={{
                        resizeMode: 'stretch'
                    }}
                    source={require('../../../../../../assets/backgrounds/moonbeam-card-linking-background.png')}>
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
                                        <Text style={styles.walletTitle}>
                                            Wallet
                                        </Text>
                                        <Text style={styles.walletSubtitle}>
                                            Link your debit or credit card, and earn discounts on every transaction at
                                            qualifying
                                            merchant
                                            locations.
                                        </Text>
                                    </View>
                                    <List.Section style={styles.listSectionView}>
                                        <List.Subheader
                                            style={styles.subHeaderTitle}>Connected Card</List.Subheader>
                                        <Divider
                                            style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                                        {
                                            filterCards()
                                        }
                                    </List.Section>
                                </>
                        }
                        <View style={styles.disclaimerTextView}>
                            <TouchableOpacity
                                disabled={!splashShown && (userInformation["linkedCard"] && userInformation["linkedCard"]["cards"].length !== 0)}
                                style={
                                    splashShown
                                        ? styles.splashButton
                                        : (userInformation["linkedCard"] && userInformation["linkedCard"]["cards"].length !== 0)
                                            ? styles.linkingButtonDisabled
                                            : styles.linkingButton
                                }
                                onPress={
                                    () => {
                                        // if there is no error and/or success to show, then this button will open up the bottom sheet
                                        if (!splashShown) {
                                            /**
                                             * open up the bottom sheet, where the linking action will take place. Any linked cards and/or errors will be
                                             * handled by the CardLinkingBottomSheet component
                                             */
                                            setBottomSheetIndex(1);
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
                                                    bannerArtSource: require('../../../../../../assets/art/moonbeam-card-linking.png'),
                                                    dismissing: false
                                                });
                                            }

                                            // close the previously opened bottom sheet, and reset the splash shown flag, to return to the default wallet view
                                            setBottomSheetIndex(-1);
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
                                        : (userInformation["linkedCard"] && userInformation["linkedCard"]["cards"].length !== 0)
                                            ? `One card allowed`
                                            : `Connect new card`
                                }</Text>
                            </TouchableOpacity>
                            {
                                !splashShown &&
                                <Text style={styles.disclaimerText}>
                                    Limited to <Text style={styles.highlightedText}>one</Text> linked card per customer
                                    at a
                                    time.
                                    To link a new card, first <Text style={styles.highlightedText}>disconnect the
                                    existing
                                    one</Text>. Only <Text style={styles.highlightedText}>Visa</Text> or <Text
                                    style={styles.highlightedText}>MasterCard</Text> allowed.
                                </Text>
                            }
                        </View>
                        {
                            !cardLinkingBottomSheet &&
                            <BottomSheet
                                backgroundStyle={styles.bottomSheet}
                                enablePanDownToClose={true}
                                index={bottomSheetIndex}
                                snapPoints={
                                    (userInformation["linkedCard"] && userInformation["linkedCard"]["cards"].length !== 0)
                                        ? ['40%', '40%']
                                        : ['80%', '80%']
                                }
                                onChange={(index) => {
                                    setBottomSheetIndex(index);
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
                                            <Text style={styles.cardRemovalTitle}>
                                                Card Removal
                                            </Text>
                                            <Text style={styles.cardRemovalDetails}>
                                                {userInformation["linkedCard"]["cards"][0]["type"] === CardType.Visa ? 'VISA' : 'MASTERCARD'} ••••{userInformation["linkedCard"]["cards"][0]["last4"]}
                                            </Text>
                                            <Text style={styles.cardRemovalSubtitle}>
                                                Once you remove this card, you will no longer be eligible to participate
                                                in
                                                previously linked programs and/or offers. Do you wish to continue ?
                                            </Text>
                                            <TouchableOpacity
                                                style={styles.cardRemovalButton}
                                                onPress={
                                                    async () => {
                                                        // delete the card
                                                        await deleteCardAction();

                                                        // change the card linking status
                                                        setCardLinkingStatus(false);

                                                        // set the custom banner state for future screens accordingly
                                                        setBannerState({
                                                            bannerVisibilityState: cardLinkingStatusState,
                                                            bannerMessage: "You currently do not have a linked card to your Moonbeam account. Get started now!",
                                                            bannerButtonLabel: "Link Now",
                                                            bannerButtonLabelActionSource: "",
                                                            bannerArtSource: require('../../../../../../assets/art/moonbeam-card-linking.png'),
                                                            dismissing: false
                                                        });
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
                </ImageBackground>
            }
        </>
    );
};
