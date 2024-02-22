import React, {useEffect, useRef, useState} from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import {heightPercentageToDP as hp} from "react-native-responsive-screen";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    cardChoiceDropdownOpenState, cardChoiceDropdownValueState,
    reimbursementBottomSheetShownState
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
import {currentBalanceState} from "../../../../../../recoil/DashboardAtom";
import {CardType} from "@moonbeam/moonbeam-models";
import DropDownPicker from "react-native-dropdown-picker";
import {Icon} from "react-native-paper";
import {splashStatusState} from "../../../../../../recoil/SplashAtom";

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
    // constants used to keep track of shared states
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
        }
        // populate the card choice items, accordingly
        if (cardChoices.length === 0 && userInformation["linkedCard"] && userInformation["linkedCard"]["cards"] && userInformation["linkedCard"]["cards"].length > 0) {
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
            setCardChoices([...cardChoices, ...newCardChoices]);
        }
    }, [bottomSheetRef, showReimbursementBottomSheet, cardChoices]);

    /**
     * Function used to execute the cashing out, by:
     *
     * 1) calling our internal API for reimbursements, which will mark the necessary transactions
     * as CREDITED, and also update the status through Olive.
     *
     * 2) since we have a subscription for any transaction status updates, the front-end related
     * transactions will get updated automatically and the current available balance will be updated
     * accordingly as well.
     *
     * @returns a {@link boolean} representing a flag indicating whether the cashing out was successful
     * or not.
     */
    const cashOut = async (): Promise<boolean> => {
        // ToDo: need to get this button action to call a cashout API, and reset available balance and change status of specific transactions
        // ToDo: add a new cashback as PENDING in the list of reimbursements, close modal and show a pop-up confirming successful reimbursement
        return false;
    }

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
                                                // reset the card choice dropdown value and open state
                                                setCardChoiceDropdownValue("");
                                                setIsCardChoiceDropdownOpen(false);

                                                // close the bottom sheet
                                                setShowReimbursementBottomSheet(false);

                                                // execute the cashing out, and display a Splash Screen accordingly
                                                const cashOutFlag = await cashOut();
                                                if (cashOutFlag) {
                                                    setSplashState({
                                                        splashTitle: `Successfully cashed out!`,
                                                        splashDescription: `It might take 1-3 business days to see your cashback reflected as statement credit.`,
                                                        splashButtonText: `Ok`,
                                                        splashArtSource: MoonbeamCashOutOk
                                                    });
                                                } else {
                                                    setSplashState({
                                                        splashTitle: `Houston we got a problem!`,
                                                        splashDescription: `There was an error while cashing out.`,
                                                        splashButtonText: `Try Again`,
                                                        splashArtSource: MoonbeamErrorImage
                                                    });
                                                }
                                            }
                                        }}
                                    >
                                        <Text
                                            style={cardChoiceDropdownValue === "" ? styles.cashoutTextDisabled : styles.cashoutTextEnabled}>Cash
                                            Out</Text>
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
