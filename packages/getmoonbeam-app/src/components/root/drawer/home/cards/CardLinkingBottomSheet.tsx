import React, {useEffect, useState} from "react";
import {Dimensions, SafeAreaView, StyleSheet} from "react-native";
import WebView from "react-native-webview";
import {useRecoilState} from "recoil";
import {currentUserInformation, globalAmplifyCacheState} from "../../../../../recoil/AuthAtom";
import {Dialog, Portal, Text} from "react-native-paper";
import {commonStyles} from '../../../../../styles/common.module';
import {styles} from '../../../../../styles/wallet.module';
import {Spinner} from "../../../../common/Spinner";
import {API, graphqlOperation} from "aws-amplify";
import {addCard, CardLink, CardLinkErrorType, CardType, createCardLink} from "@moonbeam/moonbeam-models";
import {cardLinkingStatusState, customBannerShown} from "../../../../../recoil/AppDrawerAtom";
import {cardLinkingBottomSheetState} from "../../../../../recoil/WalletAtom";
import {deviceTypeState} from "../../../../../recoil/RootAtom";
import * as Device from "expo-device";
import {DeviceType} from "expo-device";
import {Button} from "@rneui/base";

/**
 * CardLinkingBottomSheet component.
 *
 * @constructor constructor for the component.
 */
export const CardLinkingBottomSheet = () => {
    // constants used to keep track of local component state
    const [isReady, setIsReady] = useState<boolean>(true);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalCustomMessage, setModalCustomMessage] = useState<string>("");
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    // constants used to keep track of shared states
    const [globalCache,] = useRecoilState(globalAmplifyCacheState);
    const [, setCardLinkingStatus] = useRecoilState(cardLinkingStatusState);
    const [, setBannerShown] = useRecoilState(customBannerShown);
    const [userInformation, setUserInformation] = useRecoilState(currentUserInformation);
    const [, setCardLinkingBottomSheetState] = useRecoilState(cardLinkingBottomSheetState);
    const [deviceType, setDeviceType] = useRecoilState(deviceTypeState);

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
    }, [deviceType]);

    /**
     * Function used to keep track of the card linking action executed inside
     * the card linking form, once a user attempt to link a card.
     *
     * @param data data to be passed in from the webview form.
     */
    const onCardLinkAction = async (data): Promise<void> => {
        // reset previously modal error message
        setModalCustomMessage("");

        // set a loader on button press
        setIsReady(false);

        // parse the incoming form data
        const linkingData = JSON.parse(data.nativeEvent.data);

        /**
         * ensure that the incoming tokenized card, is for a valid/support card network. Even though
         * this is also verified on the back-end, it is important to do it on the front-end, as well, to
         * avoid making an extra network call if possible.
         */
        if (linkingData.data.card_type !== "visa" && linkingData.data.card_type !== "master") {
            // release the loader on button press
            setIsReady(true);

            const errorMessage = `Unsupported card linked. Only MasterCard and/or Visa available to link!`;
            console.log(`${errorMessage} ${linkingData.data.card_type}`);

            setCardLinkingStatus(false);
            // set a custom message for the modal message
            setModalCustomMessage(errorMessage);
            setModalVisible(true);
        } else {
            // set the card type to be sent in to the API, accordingly
            let cardType: CardType;
            switch (linkingData.data.card_type) {
                case 'visa':
                    cardType = CardType.Visa;
                    break;
                case 'master':
                    cardType = CardType.Mastercard;
                    break;
                default:
                    cardType = CardType.Invalid;
                    break;
            }

            // check to see if there were any errors during the card linking step
            if (!linkingData.data || linkingData.error || !linkingData.success
                || !linkingData.data.card_type || !linkingData.data.full_name
                || !linkingData.data.last_four_digits || !linkingData.data.token) {
                // release the loader on button press
                setIsReady(true);

                // if there were errors, then display a modal prompting the user to retry linking their card
                console.log(`Error with initial token structure ${linkingData.error}`);
                setCardLinkingStatus(false);
                setModalVisible(true);
            } else {
                /**
                 * check to see which type of call to perform. Whether we need a new enrollment call in case a user has skipped the
                 * card enrollment process at signup, or an add card call in case we are just attempting to add a new card for an
                 * existing user, who already has completed that process.
                 */
                if (userInformation["linkedCard"]) {
                    /**
                     * If there are no errors to display, then retrieve the token, the member id, card nickname, last 4 digits for the card, the type,
                     * and the unique user ID for the signup process. Use that information to then call our internal card addition API to
                     * add a card to an existing member.
                     */
                    const [addCardResult, errorObject] = await addCardToMember(userInformation["custom:userId"], userInformation["linkedCard"]["memberId"],
                        linkingData.data.full_name, cardType, linkingData.data.last_four_digits, linkingData.data.token);

                    // check if there was an error
                    if (errorObject || !addCardResult) {
                        // filter through errors and determine whether a custom modal message is needed
                        if (errorObject && errorObject[1] === CardLinkErrorType.InvalidCardScheme) {
                            // release the loader on button press
                            setIsReady(true);

                            const errorMessage = `Unsupported card added. Only MasterCard and/or Visa available to be added!`;
                            console.log(`${errorMessage} ${linkingData.data.card_type}`);

                            setCardLinkingStatus(false);
                            // set a custom message for the modal message
                            setModalCustomMessage(errorMessage);
                            setModalVisible(true);
                        } else {
                            // release the loader on button press
                            setIsReady(true);

                            // if there were errors, then display a modal prompting the user to retry adding their card
                            console.log(`Error while adding new card ${JSON.stringify(errorObject)}`);
                            setCardLinkingStatus(false);
                            setModalVisible(true);
                        }
                    } else {
                        // release the loader on button press
                        setIsReady(true);

                        // set the banner and card linking status accordingly
                        setCardLinkingStatus(true);
                        setBannerShown(false);

                        // if the card was successfully linked, then we can cache it accordingly
                        if (globalCache && await globalCache!.getItem(`${userInformation["custom:userId"]}-linkedCardFlag`) !== null) {
                            console.log('old card is cached, needs cleaning up');
                            await globalCache!.removeItem(`${userInformation["custom:userId"]}-linkedCard`);
                            await globalCache!.removeItem(`${userInformation["custom:userId"]}-linkedCardFlag`);
                            await globalCache!.setItem(`${userInformation["custom:userId"]}-linkedCard`, addCardResult);
                            await globalCache!.setItem(`${userInformation["custom:userId"]}-linkedCardFlag`, true);
                        } else {
                            console.log('card is not cached');
                            globalCache && globalCache!.setItem(`${userInformation["custom:userId"]}-linkedCard`, addCardResult);
                            globalCache && await globalCache!.setItem(`${userInformation["custom:userId"]}-linkedCardFlag`, true);
                        }

                        // update the user information object accordingly
                        setUserInformation({
                            ...userInformation,
                            linkedCard: addCardResult
                        });

                        // update the bottom sheet state for the wallet
                        setCardLinkingBottomSheetState(true);
                    }
                } else {
                    /**
                     * If there are no errors to display, then retrieve the token, card nickname, last 4 digits for the card, the type,
                     * and the unique user ID for the signup process. Use that information to then call our internal card linking API to
                     * complete the account creation/member signup linking process.
                     */
                    const [signupCardLinkedMemberResult, errorObject] = await signupCardLinkedMember(userInformation["custom:userId"], linkingData.data.full_name,
                        cardType, linkingData.data.last_four_digits, linkingData.data.token);

                    // check if there was an error
                    if (errorObject || !signupCardLinkedMemberResult) {
                        // filter through errors and determine whether a custom modal message is needed
                        if (errorObject && errorObject[1] === CardLinkErrorType.InvalidCardScheme) {
                            // release the loader on button press
                            setIsReady(true);

                            const errorMessage = `Unsupported card linked. Only MasterCard and/or Visa available to link!`;
                            console.log(`${errorMessage} ${linkingData.data.card_type}`);

                            setCardLinkingStatus(false);
                            // set a custom message for the modal message
                            setModalCustomMessage(errorMessage);
                            setModalVisible(true);
                        } else {
                            // release the loader on button press
                            setIsReady(true);

                            // if there were errors, then display a modal prompting the user to retry linking their card
                            console.log(`Error while linking card ${JSON.stringify(errorObject)}`);
                            setCardLinkingStatus(false);
                            setModalVisible(true);
                        }
                    } else {
                        // release the loader on button press
                        setIsReady(true);

                        // set the banner and card linking status accordingly
                        setCardLinkingStatus(true);
                        setBannerShown(false);

                        // update the user information object accordingly
                        setUserInformation({
                            ...userInformation,
                            linkedCard: signupCardLinkedMemberResult
                        });

                        // update the bottom sheet state for the wallet
                        setCardLinkingBottomSheetState(true);
                    }
                }
            }
        }
    }

    /**
     * Function used to add a card to an individual's card linked object.
     *
     * @param userId uniquely generated user identifier.
     * @param memberId member id obtained from Olive during the signup process.
     * @param cardNickname the name/nickname of the card, inputted by the user.
     * @param cardType the type of the card, auto-detected upon user linking via the enrollment form.
     * @param last4Digits the last 4 digits of the card, inputted by the user, obtained from the card number.
     * @param cardToken the card linking token, generated via the card vault, via the enrollment form.
     *
     * @return a {@link Promise}, containing a pair of a {@link CardLink}, and a {@link {String, CardLinkErrorType}},
     * representing the card link object if it was successfully added, and implicitly,
     * if it was not, what the error message and code for that error was.
     */
    const addCardToMember = async (userId: string, memberId: string, cardNickname: string, cardType: CardType,
                                   last4Digits: string, cardToken: string): Promise<[CardLink | null, [string, CardLinkErrorType]?]> => {
        try {
            // call the internal add card API
            const addCardResult = await API.graphql(graphqlOperation(addCard, {
                addCardInput: {
                    id: userId,
                    memberId: memberId,
                    card: {
                        token: cardToken,
                        type: cardType,
                        name: cardNickname,
                        last4: last4Digits
                    }
                }
            }));

            // retrieve the data block from the response
            // @ts-ignore
            const responseData = addCardResult ? addCardResult.data : null;

            // check if there are any errors in the returned response
            if (responseData && responseData.addCard.errorMessage === null) {
                return [responseData.addCard.data];
            } else {
                console.log(`Unexpected error while adding a new card through the add card API ${JSON.stringify(addCardResult)}`);
                return [null, [responseData.addCard.errorMessage, responseData.addCard.errorType]];
            }
        } catch (error) {
            console.log(`Unexpected error while attempting to add a new card through the add card API ${JSON.stringify(error)} ${error}`);
            return [null, [`Unexpected error`, CardLinkErrorType.UnexpectedError]];
        }
    }

    /**
     * Function used to link an individual's card, and signup a new member during the signup process.
     *
     * @param userId uniquely generated user identifier.
     * @param cardNickname the name/nickname of the card, inputted by the user.
     * @param cardType the type of the card, auto-detected upon user linking via the enrollment form.
     * @param last4Digits the last 4 digits of the card, inputted by the user, obtained from the card number.
     * @param cardToken the card linking token, generated via the card vault, via the enrollment form.
     *
     * @return a {@link Promise}, containing a pair of a {@link CardLink}, and a {@link {String, CardLinkErrorType}},
     * representing the card link object if it was successfully linked, and implicitly,
     * if it was not, what the error message and code for that error was.
     */
    const signupCardLinkedMember = async (userId: string, cardNickname: string, cardType: CardType,
                                          last4Digits: string, cardToken: string): Promise<[CardLink | null, [string, CardLinkErrorType]?]> => {
        try {
            // call the internal card linking API
            const cardLinkingResult = await API.graphql(graphqlOperation(createCardLink, {
                createCardLinkInput: {
                    id: userId,
                    card: {
                        token: cardToken,
                        type: cardType,
                        name: cardNickname,
                        last4: last4Digits
                    }
                }
            }));

            // retrieve the data block from the response
            // @ts-ignore
            const responseData = cardLinkingResult ? cardLinkingResult.data : null;

            // check if there are any errors in the returned response
            if (responseData && responseData.createCardLink.errorMessage === null) {
                return [responseData.createCardLink.data];
            } else {
                console.log(`Unexpected error while signing a new member up through the card linking API ${JSON.stringify(cardLinkingResult)}`);
                return [null, [responseData.createCardLink.errorMessage, responseData.createCardLink.errorType]];
            }
        } catch (error) {
            console.log(`Unexpected error while attempting to sign a new member up through the card linking API ${JSON.stringify(error)} ${error}`);
            return [null, [`Unexpected error`, CardLinkErrorType.UnexpectedError]];
        }
    }

    /**
     * Content of the Olive iFrame, used to display the card linking form.
     * More information can be found at {@link https://developer.oliveltd.com/docs/2-enroll-your-customer-in-olive-programs}.
     *
     * We use a custom script, which wraps the script mentioned in their documentation,
     * and we store it in S3 to make Olive's IFrame more UI/UX friendly.
     */
    const oliveIframeContent =
        `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8" />
            <title></title>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0')">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        </head>
        <body>
                <div id="olive-sdk-container" 
                     style="display: grid;
                            grid-template-rows: repeat(auto-fit, calc(100vh));
                     "
                 />
                <script>
                    function callback(pmData, error, successFlag) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            data: pmData,
                            error: error,
                            success: successFlag 
                        }));
                    }
                </script>
                <script type="application/javascript"
                        id="olive-link-card-form"
                        src="https://oliveaddcardsdkjs.blob.core.windows.net/script/olive-add-card-sdk.js"
                        data-public-key=Zlltp0W5jB09Us0kkOPN6edVwfy1JYGO
                        data-container-div="olive-sdk-container"
                        data-environment="sandbox"
                        data-include-header="false"
                        data-form-background-color="#5B5A5A"
                        data-background-color="#5B5A5A"
                        data-auto-open=true>
                </script>
        </body>    
        </html>
        `;

    // return the component for the CardLinkingBottomSheet, part of the Registration page
    return (
        <>
            {!isReady ?
                <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                :
                <>
                    <Portal>
                        <Dialog style={commonStyles.dialogStyle} visible={modalVisible}
                                onDismiss={() => setModalVisible(false)}>
                            <Dialog.Icon icon="alert" color={"#F2FF5D"}
                                         size={Dimensions.get('window').height / 14}/>
                            <Dialog.Title style={commonStyles.dialogTitle}>We hit a snag!</Dialog.Title>
                            <Dialog.Content>
                                <Text
                                    style={commonStyles.dialogParagraph}>{`Error while linking your card! ${modalCustomMessage}`}</Text>
                            </Dialog.Content>
                            <Dialog.Actions>
                                <Button buttonStyle={commonStyles.dialogButton}
                                        titleStyle={commonStyles.dialogButtonText}
                                        onPress={() => {
                                            setModalVisible(false);
                                        }}>
                                    Try Again!
                                </Button>
                            </Dialog.Actions>
                        </Dialog>
                    </Portal>
                    <SafeAreaView
                        style={[StyleSheet.absoluteFill, styles.cardLinkingParentView]}>
                        <WebView
                            onMessage={onCardLinkAction}
                            scrollEnabled={false}
                            originWhitelist={['*']}
                            source={{html: oliveIframeContent}}
                            style={[styles.cardLinkingIframeView, deviceType === DeviceType.TABLET && {bottom: Dimensions.get('window').height / 20}]}
                            scalesPageToFit={true}
                            setSupportMultipleWindows={false}
                            nestedScrollEnabled={true}
                            startInLoadingState={true}
                        />
                    </SafeAreaView>
                </>
            }
        </>
    );
}
