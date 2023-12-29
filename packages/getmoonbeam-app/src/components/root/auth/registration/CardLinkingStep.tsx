import React, {useEffect, useState} from "react";
import {Linking, SafeAreaView} from "react-native";
import WebView from "react-native-webview";
import {useRecoilState} from "recoil";
import {
    cardLinkingRegistrationStatusState,
    currentUserInformation,
    globalAmplifyCacheState, isReadyRegistrationState, userIsAuthenticatedState
} from "../../../../recoil/AuthAtom";
import {Dialog, Portal, Text} from "react-native-paper";
import {commonStyles} from '../../../../styles/common.module';
import {styles} from '../../../../styles/registration.module';
import {Spinner} from "../../../common/Spinner";
import {API, graphqlOperation} from "aws-amplify";
import {CardLinkErrorType, CardType, createCardLink, LoggingLevel, Stages} from "@moonbeam/moonbeam-models";
import {Button} from "@rneui/base";
import * as envInfo from "../../../../../local-env-info.json";
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {logEvent} from "../../../../utils/AppSync";

/**
 * CardLinkingStep component.
 *
 * @constructor constructor for the component.
 */
export const CardLinkingStep = () => {
    // constants used to keep track of local component state
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalCustomMessage, setModalCustomMessage] = useState<string>("");
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    // constants used to keep track of shared states
    const [userIsAuthenticated, ] = useRecoilState(userIsAuthenticatedState);
    const [isReady, setIsReady] = useRecoilState(isReadyRegistrationState);
    const [globalCache,] = useRecoilState(globalAmplifyCacheState);
    const [, setCardLinkingStatus] = useRecoilState(cardLinkingRegistrationStatusState);
    const [userInformation,] = useRecoilState(currentUserInformation);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
    }, []);

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

            const message = `Unsupported card linked. Only MasterCard and/or Visa available to link!`;
            console.log(`${message} ${linkingData.data.card_type}`);
            await logEvent(`${message} ${linkingData.data.card_type}`, LoggingLevel.Error, userIsAuthenticated);

            setCardLinkingStatus(false);
            // set a custom message for the modal message
            setModalCustomMessage(message);
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
                const message = `Error with initial token structure ${linkingData.error}`;
                console.log(message);
                await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                setCardLinkingStatus(false);
                setModalVisible(true);
            } else {
                /**
                 * If there are no errors to display, then retrieve the token, card nickname, last 4 digits for the card, the type,
                 * and the unique user ID for the signup process. Use that information to then call our internal card linking API to
                 * complete the account creation/member signup linking process.
                 */
                const [signupCardLinkedMemberResult, errorObject] = await signupCardLinkedMember(userInformation["userId"], linkingData.data.full_name,
                    cardType, linkingData.data.last_four_digits, linkingData.data.token);

                // check if there was an error
                if (errorObject || !signupCardLinkedMemberResult) {
                    // filter through errors and determine whether a custom modal message is needed
                    if (errorObject && errorObject[1] === CardLinkErrorType.InvalidCardScheme) {
                        // release the loader on button press
                        setIsReady(true);

                        const message = `Unsupported card linked. Only MasterCard and/or Visa available to link!`;
                        console.log(`${message} ${linkingData.data.card_type}`);
                        await logEvent(`${message} ${linkingData.data.card_type}`, LoggingLevel.Error, userIsAuthenticated);

                        setCardLinkingStatus(false);
                        // set a custom message for the modal message
                        setModalCustomMessage(message);
                        setModalVisible(true);
                    } else {
                        // release the loader on button press
                        setIsReady(true);

                        // if there were errors, then display a modal prompting the user to retry linking their card
                        const message = `Error while linking card ${JSON.stringify(errorObject)}`;
                        console.log(message);
                        await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                        setCardLinkingStatus(false);
                        setModalVisible(true);
                    }
                } else {
                    // release the loader on button press
                    setIsReady(true);

                    setCardLinkingStatus(true);
                }
            }
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
     * @return a {@link Promise}, containing a pair of a {@link Boolean}, and a {@link {String, CardLinkErrorType}},
     * representing whether the card was successfully linked or not, and implicitly, if it was not, what
     * the error message and code for that error was.
     */
    const signupCardLinkedMember = async (userId: string, cardNickname: string, cardType: CardType,
                                          last4Digits: string, cardToken: string): Promise<[boolean, [string, CardLinkErrorType]?]> => {
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
                // if the card was successfully linked, then we can cache it accordingly
                if (globalCache && await globalCache!.getItem(`${userInformation["custom:userId"]}-linkedCardFlag`) !== null) {
                    const message = 'old card is cached, needs cleaning up';
                    console.log(message);
                    await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                    await globalCache!.removeItem(`${userInformation["custom:userId"]}-linkedCard`);
                    await globalCache!.removeItem(`${userInformation["custom:userId"]}-linkedCardFlag`);
                    await globalCache!.setItem(`${userInformation["custom:userId"]}-linkedCard`, responseData.createCardLink.data);
                    await globalCache!.setItem(`${userInformation["custom:userId"]}-linkedCardFlag`, true);
                } else {
                    const message = 'card is not cached';
                    console.log(message);
                    await logEvent(message, LoggingLevel.Info, userIsAuthenticated);

                    globalCache && globalCache!.setItem(`${userInformation["custom:userId"]}-linkedCard`, responseData.createCardLink.data);
                    globalCache && await globalCache!.setItem(`${userInformation["custom:userId"]}-linkedCardFlag`, true);
                }
                return [true];
            } else {
                const message = `Unexpected error while signing a new member up through the card linking API ${JSON.stringify(cardLinkingResult)}`;
                console.log(message);
                await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

                return [false, [responseData.createCardLink.errorMessage, responseData.createCardLink.errorType]];
            }
        } catch (error) {
            const message = `Unexpected error while attempting to sign a new member up through the card linking API ${JSON.stringify(error)} ${error}`;
            console.log(message);
            await logEvent(message, LoggingLevel.Error, userIsAuthenticated);

            return [false, [`Unexpected error`, CardLinkErrorType.UnexpectedError]];
        }
    }

    /**
     * Content of the Olive iFrame, used to display the card linking form.
     * More information can be found at {@link https://developer.oliveltd.com/docs/2-enroll-your-customer-in-olive-programs}.
     *
     * We use a custom script, which wraps the script mentioned in their documentation,
     * and we store it in S3 to make Olive's IFrame more UI/UX friendly.
     */
    let olivePublicKey = ``;
    let oliveIframeContainer = ``;
    // set the appropriate Olive card linking container configuration according to the environment that we're in
    switch (envInfo.envName) {
        case Stages.DEV:
            olivePublicKey = 'data-public-key="Zlltp0W5jB09Us0kkOPN6edVwfy1JYGO"';
            oliveIframeContainer += `data-environment="sandbox"`;
            break;
        case Stages.PROD:
            olivePublicKey = ' data-public-key="ECXIbQePFvImh0xHUMpr5Sj8XKbcwGev"';
            oliveIframeContainer += `data-environment=""`
            break;
        // ToDo: add more environments representing our stages in here
        default:
            const message = `Invalid environment passed in from Amplify ${envInfo.envName}`;
            console.log(message);
            logEvent(message, LoggingLevel.Error, userIsAuthenticated).then(() => {});
            break;
    }
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
                        ${olivePublicKey}
                        data-container-div="olive-sdk-container"
                        ${oliveIframeContainer}
                        data-include-header="true"
                        data-form-background-color="#313030"
                        data-background-color="#313030"
                        data-auto-open=true>
                </script>
        </body>    
        </html>
        `;

    // return the component for the CardLinkinStep, part of the Registration page
    return (
        <>
            {!isReady ?
                <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                :
                <>
                    <Portal>
                        <Dialog style={commonStyles.dialogStyle} visible={modalVisible}
                                onDismiss={() => setModalVisible(false)}>
                            <Dialog.Icon icon="alert" color={"#F2FF5D"} size={hp(10)}/>
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
                        style={[styles.cardLinkingParentView]}>
                        <WebView
                            onMessage={onCardLinkAction}
                            scrollEnabled={false}
                            originWhitelist={['*']}
                            source={{html: oliveIframeContent}}
                            style={styles.cardLinkingIframeView}
                            scalesPageToFit={true}
                            setSupportMultipleWindows={false}
                            nestedScrollEnabled={true}
                            startInLoadingState={true}
                            onShouldStartLoadWithRequest={(request) => {
                                // redirect to browser for terms and conditions and privacy policy clicks
                                if (request.url === 'https://www.moonbeam.vet/terms-and-conditions' || request.url === 'https://www.moonbeam.vet/privacy-policy') {
                                    Linking.canOpenURL(request.url).then(supported => {
                                        if (supported) {
                                            Linking.openURL(request.url).then(() => {});
                                        } else {
                                            const message = `Don't know how to open URI: ${request.url}`;
                                            console.log(message);
                                            logEvent(message, LoggingLevel.Warning, userIsAuthenticated).then(() => {});
                                        }
                                    });
                                    return false;
                                } else {
                                    return true;
                                }
                            }}
                            renderLoading={() => {
                                return (
                                    <Spinner loadingSpinnerShown={loadingSpinnerShown}
                                             setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                                )
                            }}
                        />
                    </SafeAreaView>
                </>
            }
        </>
    );
}
