import React, {useEffect, useRef, useState} from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import {heightPercentageToDP as hp} from "react-native-responsive-screen";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    cardChoiceDropdownOpenState,
    cardChoiceDropdownValueState,
    isReimbursementsControllerReadyState,
    reimbursementBottomSheetShownState, reimbursementDataState
} from "../../../../../../recoil/ReimbursementsAtom";
import {currentUserInformation} from "../../../../../../recoil/AuthAtom";
// @ts-ignore
import CardLinkingImage from '../../../../../../../assets/art/moonbeam-card-linking.png';
// @ts-ignore
import MoonbeamNoReimbursements from "../../../../../../../assets/art/moonbeam-no-reimbursements.png";
// @ts-ignore
import MoonbeamMoneyCatch from "../../../../../../../assets/art/moonbeam-money-catch.png";
// @ts-ignore
import MoonbeamVisa2 from "../../../../../../../assets/art/moonbeam-visa-2.png";
// @ts-ignore
import MoonbeamMaster2 from "../../../../../../../assets/art/moonbeam-master-2.png";
// @ts-ignore
import MoonbeamPiggyBank from "../../../../../../../assets/art/moonbeam-piggy-bank.png";
// @ts-ignore
import MoonbeamErrorImage from "../../../../../../../assets/art/moonbeam-error.png";
// @ts-ignore
import MoonbeamCashOutOk from "../../../../../../../assets/art/moonbeam-cash-out-ok.png";
import {Image as ExpoImage} from "expo-image/build/Image";
import {styles} from "../../../../../../styles/reimbursementsController.module";
import {Text, TouchableOpacity, View} from "react-native";
import {bottomBarNavigationState, bottomTabShownState, drawerNavigationState} from "../../../../../../recoil/HomeAtom";
import {currentBalanceState, sortedTransactionDataState} from "../../../../../../recoil/DashboardAtom";
import {CardType, ReimbursementStatus, TransactionsStatus} from "@moonbeam/moonbeam-models";
import DropDownPicker from "react-native-dropdown-picker";
import {Icon} from "react-native-paper";
import {splashStatusState} from "../../../../../../recoil/SplashAtom";
import {createNewReimbursement} from "../../../../../../utils/AppSync";

/**
 * Object representing the choice of card to be displayed in the
 * dropdown.
 */
export interface CardChoice {
    label: string,
    value: string,
    icon: () => React.JSX.Element,
    cardType: CardType,
    last4: number,
    cardId: string
}

/**
 * ReimbursementBottomSheet component.
 *
 * @constructor constructor for the component.
 */
export const ReimbursementBottomSheet = () => {
    // constants used to keep track of local component state
    const bottomSheetRef = useRef(null);
    const [cardChoices, setCardChoices] = useState<CardChoice[]>([]);
    const [cardChoicesPopulated, setCardChoicesPopulated] = useState<boolean>(false);
    // constants used to keep track of shared states
    const [, setReimbursements] = useRecoilState(reimbursementDataState);
    const transactions = useRecoilValue(sortedTransactionDataState);
    const [, setIsReady] = useRecoilState(isReimbursementsControllerReadyState);
    const [, setSplashState] = useRecoilState(splashStatusState);
    const [cardChoiceDropdownOpen, setIsCardChoiceDropdownOpen] = useRecoilState(cardChoiceDropdownOpenState);
    const [cardChoiceDropdownValue, setCardChoiceDropdownValue] = useRecoilState(cardChoiceDropdownValueState);
    const [bottomTabShown, setBottomTabShown] = useRecoilState(bottomTabShownState);
    const currentBalance = useRecoilValue(currentBalanceState);
    const [drawerNavigation,] = useRecoilState(drawerNavigationState);
    const [bottomBarNavigation,] = useRecoilState(bottomBarNavigationState);
    const [userInformation,] = useRecoilState(currentUserInformation);
    const [showReimbursementBottomSheet, setShowReimbursementBottomSheet] = useRecoilState(reimbursementBottomSheetShownState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // manipulate the bottom sheet
        if (!showReimbursementBottomSheet && bottomSheetRef) {
            // @ts-ignore
            bottomSheetRef.current?.close?.();
        }
        if (showReimbursementBottomSheet && bottomSheetRef) {
            // @ts-ignore
            bottomSheetRef.current?.expand?.();

            // used for updating cards in real time when opening up bottom sheet
            if (userInformation["linkedCard"]["cards"].length !== cardChoices.length) {
                setCardChoicesPopulated(false);
            }
        }
        // populate the card choice items, accordingly
        if (userInformation["linkedCard"] && userInformation["linkedCard"]["cards"] && userInformation["linkedCard"]["cards"].length > 0 && !cardChoicesPopulated) {
            let newCardChoices: CardChoice[] = [];
            userInformation["linkedCard"]["cards"].forEach(card => {
                newCardChoices.push({
                    label: `${card["type"]}••••${card["last4"]}`,
                    icon: () =>
                        <Icon
                            size={hp(5)}
                            source={
                                card["type"] === CardType.Visa
                                    ? MoonbeamVisa2
                                    : MoonbeamMaster2
                            }
                            color={'#F2FF5D'}
                        />,
                    value: card["id"],
                    cardType: card["type"] as CardType,
                    last4: card["last4"],
                    cardId: card["id"]
                });
            });
            setCardChoices(newCardChoices);
            setCardChoicesPopulated(true);
        }
    }, [bottomSheetRef, showReimbursementBottomSheet, cardChoices, cardChoicesPopulated, cardChoiceDropdownValue]);

    // return the component for the DashboardBottomSheet, part of the Dashboard page
    return (
        <>
            {
                showReimbursementBottomSheet &&
                <BottomSheet
                    handleIndicatorStyle={{backgroundColor: '#F2FF5D'}}
                    ref={bottomSheetRef}
                    backgroundStyle={{backgroundColor: '#5B5A5A'}}
                    enablePanDownToClose={true}
                    index={showReimbursementBottomSheet ? 0 : -1}
                    snapPoints={[hp(50), hp(50)]}
                    onChange={(index) => {
                        setShowReimbursementBottomSheet(index !== -1);
                    }}
                >
                    <>
                        {
                            // @ts-ignore
                            !userInformation["linkedCard"] || (userInformation["linkedCard"] && userInformation["linkedCard"]["cards"] && userInformation["linkedCard"]["cards"].length === 0) &&
                            <>
                                <View>
                                    <ExpoImage
                                        style={styles.noCardLinkedImage}
                                        source={CardLinkingImage}
                                        contentFit={'contain'}
                                        transition={1000}
                                        cachePolicy={'memory-disk'}
                                    />
                                    <Text style={styles.noCardLinkedText}>
                                        {"You have no linked cards.\nYou need a linked card to cash out!"}
                                    </Text>
                                    <TouchableOpacity
                                        activeOpacity={0.5}
                                        onPress={() => {
                                            // go to the wallet
                                            bottomBarNavigation && bottomBarNavigation!.navigate('Cards', {});
                                            drawerNavigation && drawerNavigation!.navigate('Home', {});

                                            // close the bottom sheet
                                            // @ts-ignore
                                            bottomSheetRef.current?.close?.();
                                        }}
                                    >
                                        <Text style={styles.linkNowButtonText}>
                                            {"Link Now"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        }
                        {
                            // @ts-ignore
                            userInformation["linkedCard"] && userInformation["linkedCard"]["cards"] && userInformation["linkedCard"]["cards"].length > 0 &&
                            Number(currentBalance.toFixed(2)) >= 20.00 &&
                            <>
                                <View style={{bottom: hp(4.5)}}>
                                    <ExpoImage
                                        style={styles.cardLinkedImage}
                                        source={MoonbeamPiggyBank}
                                        contentFit={'contain'}
                                        transition={1000}
                                        cachePolicy={'memory-disk'}
                                    />
                                    <View style={{bottom: hp(3.5)}}>
                                        <Text style={styles.noCardLinkedText}>
                                            {"Confirm the"}
                                            <Text style={styles.noCardLinkedTextHighlight}>
                                                {" Linked Card"}
                                            </Text>
                                            {" that you would like to get your"}
                                            <Text style={styles.noCardLinkedTextHighlight}>
                                                {` $ ${currentBalance.toFixed(2)}`}
                                            </Text>
                                            {" in cashback as statement credit to."}
                                        </Text>
                                    </View>
                                    <View style={{bottom: hp(2)}}>
                                        <DropDownPicker
                                            textStyle={styles.dropdownText}
                                            labelStyle={styles.dropdownText}
                                            // @ts-ignore
                                            arrowIconStyle={styles.dropdownIcon}
                                            // @ts-ignore
                                            tickIconStyle={styles.dropdownIcon}
                                            zIndex={5000}
                                            placeholder={"Select a card"}
                                            dropDownContainerStyle={styles.dropdownContainer}
                                            style={styles.dropdownPicker}
                                            open={cardChoiceDropdownOpen}
                                            value={cardChoiceDropdownValue}
                                            items={cardChoices}
                                            setOpen={setIsCardChoiceDropdownOpen}
                                            setValue={setCardChoiceDropdownValue}
                                            setItems={setCardChoices}
                                            onClose={() => {
                                                setIsCardChoiceDropdownOpen(false);
                                            }}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        disabled={cardChoiceDropdownValue === ""}
                                        style={cardChoiceDropdownValue === "" ? styles.cashoutButtonDisabled : styles.cashoutButtonEnabled}
                                        onPress={async () => {
                                            if (cardChoiceDropdownValue !== "") {
                                                // show the Reimbursements Controller loader
                                                setIsReady(false);

                                                // reset the card choice dropdown value and open state
                                                setCardChoiceDropdownValue("");
                                                setIsCardChoiceDropdownOpen(false);

                                                // close the bottom sheet
                                                setShowReimbursementBottomSheet(false);

                                                // retrieve the selected card from the list of card choices that the user pressed
                                                let selectedCardChoice: CardChoice | null = null;
                                                cardChoices.forEach(choice => {
                                                    if (choice.cardId === cardChoiceDropdownValue) {
                                                        selectedCardChoice = choice;
                                                    }
                                                });
                                                // retrieve the list of transactions mapped to the new reimbursement to be created
                                                const mappedTransactions = transactions.filter(transaction =>
                                                    transaction.transactionStatus === TransactionsStatus.Processed || transaction.transactionStatus === TransactionsStatus.Funded
                                                );

                                                /**
                                                 * if we could retrieve a valid card choice and we have appropriate mapped transactions,
                                                 * then we execute the cash-out/reimbursement accordingly
                                                 */
                                                if (selectedCardChoice !== null && mappedTransactions.length !== 0) {
                                                    selectedCardChoice = selectedCardChoice as CardChoice;
                                                    // execute the cashing out, and display a Splash Screen accordingly
                                                    const createNewReimbursementPair = await createNewReimbursement({
                                                        status: ReimbursementStatus.Pending, // ToDO: in the future we will need to see what we do with this status
                                                        id: userInformation["custom:userId"],
                                                        cardId: selectedCardChoice.cardId!,
                                                        cardLast4: selectedCardChoice.last4!.toString(),
                                                        cardType: selectedCardChoice.cardType,
                                                        amount: currentBalance,
                                                        transactions: mappedTransactions
                                                    });
                                                    if (createNewReimbursementPair[0]) {
                                                        // add the new reimbursement in the list of reimbursements
                                                        setReimbursements(oldReimbursements => {
                                                           return [...oldReimbursements, ...createNewReimbursementPair[1]];
                                                        });

                                                        // display a successful message
                                                        setSplashState({
                                                            splashTitle: `Successfully cashed out!`,
                                                            splashDescription: `It might take 1-3 business days to see your cashback reflected as statement credit.`,
                                                            splashButtonText: `Ok`,
                                                            splashArtSource: MoonbeamCashOutOk
                                                        });
                                                    } else {
                                                        // display an error message
                                                        setSplashState({
                                                            splashTitle: `Houston we got a problem!`,
                                                            splashDescription: `There was an error while cashing out.`,
                                                            splashButtonText: `Try Again`,
                                                            splashArtSource: MoonbeamErrorImage
                                                        });
                                                    }
                                                }

                                                // hide the Reimbursements Controller loader
                                                setIsReady(true);
                                            }
                                        }}
                                    >
                                        <Text
                                            style={cardChoiceDropdownValue === "" ? styles.cashoutTextDisabled : styles.cashoutTextEnabled}>
                                            Cash Out
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        }
                        {
                            // @ts-ignore
                            userInformation["linkedCard"] && userInformation["linkedCard"]["cards"] && userInformation["linkedCard"]["cards"].length > 0 &&
                            Number(currentBalance.toFixed(2)) < 20.00 &&
                            <>
                                <View>
                                    <ExpoImage
                                        style={styles.noCardLinkedImage}
                                        source={MoonbeamMoneyCatch}
                                        contentFit={'contain'}
                                        transition={1000}
                                        cachePolicy={'memory-disk'}
                                    />
                                    <Text style={styles.noCardLinkedText}>
                                        {"You need at least"}
                                        <Text style={styles.noCardLinkedTextHighlight}>
                                            {" $ 20.00"}
                                        </Text>
                                        {" in your"}
                                        <Text style={styles.noCardLinkedTextHighlight}>
                                            {" Available Balance"}
                                        </Text>
                                        {" in order to cash out!"}
                                    </Text>
                                    <TouchableOpacity
                                        activeOpacity={0.5}
                                        onPress={() => {
                                            // go to the Marketplace
                                            bottomBarNavigation && bottomBarNavigation!.navigate('Marketplace', {});
                                            drawerNavigation && drawerNavigation!.navigate('Home', {});

                                            // show the bottom bar
                                            !bottomTabShown && setBottomTabShown(true);

                                            // close the bottom sheet
                                            // @ts-ignore
                                            bottomSheetRef.current?.close?.();
                                        }}
                                    >
                                        <Text style={styles.linkNowButtonText}>
                                            {"Shop Now"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        }
                    </>
                </BottomSheet>
            }
        </>
    );
}
