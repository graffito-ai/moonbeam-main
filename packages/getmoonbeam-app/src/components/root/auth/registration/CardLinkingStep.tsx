import React, {useEffect, useState} from "react";
import {Dimensions, SafeAreaView, StyleSheet} from "react-native";
import WebView from "react-native-webview";
import {useRecoilState} from "recoil";
import {cardLinkingRegistrationStatusState, currentUserInformation} from "../../../../recoil/AuthAtom";
import {Dialog, Portal, Text} from "react-native-paper";
import {commonStyles} from '../../../../styles/common.module';
import {styles} from '../../../../styles/registration.module';
import {Spinner} from "../../../common/Spinner";
import {API, graphqlOperation} from "aws-amplify";
import {CardLinkErrorType, CardType, createCardLink} from "@moonbeam/moonbeam-models";
import {Button} from "@rneui/base";

/**
 * CardLinkingStep component.
 *
 * @constructor constructor for the component.
 */
export const CardLinkingStep = () => {
    // constants used to keep track of shared states
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalCustomMessage, setModalCustomMessage] = useState<string>("");
    const [isReady, setIsReady] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);

    // constants used to keep track of shared states
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
                return [true];
            } else {
                console.log(`Unexpected error while signing a new member up through the card linking API ${JSON.stringify(cardLinkingResult)}`);
                return [false, [responseData.createCardLink.errorMessage, responseData.createCardLink.errorType]];
            }
        } catch (error) {
            console.log(`Unexpected error while attempting to sign a new member up through the card linking API ${JSON.stringify(error)} ${error}`);
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
                            grid-template-columns: repeat(auto-fill, calc(100vw*0.50));
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
                        src="https://moonbeam-public-files-bucket-dev-us-west-2.s3.us-west-2.amazonaws.com/olive-custom-script-version1.js"
                        data-public-key=Zlltp0W5jB09Us0kkOPN6edVwfy1JYGO
                        data-container-div="olive-sdk-container"
                        data-environment="sandbox"
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
                            <Dialog.Icon icon="alert" color={"#F2FF5D"} size={Dimensions.get('window').height / 14}/>
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
                            style={styles.cardLinkingIframeView}
                            scalesPageToFit={true}
                            setSupportMultipleWindows={false}
                            nestedScrollEnabled={true}
                            startInLoadingState={true}
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
