import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {ReimbursementsControllerStackParamList} from "../../../../../../models/props/ReimbursementsControllerProps";
import {useRecoilState, useRecoilValue, useResetRecoilState} from "recoil";
import {appDrawerHeaderShownState, drawerSwipeState} from "../../../../../../recoil/AppDrawerAtom";
import {bottomTabShownState} from "../../../../../../recoil/HomeAtom";
import {Text, TouchableOpacity, View} from "react-native";
import {styles} from "../../../../../../styles/reimbursementsController.module";
import {LinearGradient} from 'expo-linear-gradient';
import {Icon} from '@rneui/base';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {currentBalanceState} from "../../../../../../recoil/DashboardAtom";
import {Reimbursement, ReimbursementsSummary} from "./ReimbursementsSummary";
import {ReimbursementsProps} from "../../../../../../models/props/AppDrawerProps";
import {
    cardChoiceDropdownOpenState,
    cardChoiceDropdownValueState,
    reimbursementBottomSheetShownState,
    reimbursementDataState
} from "../../../../../../recoil/ReimbursementsAtom";
import {Spinner} from "../../../../../common/Spinner";
import {CardType} from "@moonbeam/moonbeam-models";
import {SplashScreen} from "../../../../../common/Splash";
import {splashStatusState} from "../../../../../../recoil/SplashAtom";

/**
 * Reimbursements Controller component. This component will be used as the main
 * component for Reimbursements.
 *
 * @constructor constructor for the component.
 */
export const ReimbursementsController = ({navigation}: ReimbursementsProps) => {
    // constants used to keep track of local component state
    const [reimbursementsRetrieved, setAreReimbursementsRetrieved] = useState<boolean>(false);
    const [isReady, setIsReady] = useState<boolean>(false);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    // constants used to keep track of shared states
    const splashStateReset = useResetRecoilState(splashStatusState);
    const [splashState,] = useRecoilState(splashStatusState);
    const [reimbursements, setReimbursements] = useRecoilState(reimbursementDataState);
    const [, setIsCardChoiceDropdownOpen] = useRecoilState(cardChoiceDropdownOpenState);
    const [, setCardChoiceDropdownValue] = useRecoilState(cardChoiceDropdownValueState);
    const currentBalance = useRecoilValue(currentBalanceState);
    const [appDrawerHeaderShown, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [drawerSwipeEnabled, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);
    const [bottomTabShown, setBottomTabShown] = useRecoilState(bottomTabShownState);
    const [showReimbursementBottomSheet, setShowReimbursementBottomSheet] = useRecoilState(reimbursementBottomSheetShownState);

    // create a native stack navigator, to be used for our Dashboard Controller application navigation
    const ReimbursementsStack = createNativeStackNavigator<ReimbursementsControllerStackParamList>();

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // first retrieve the reimbursements data
        if (!reimbursementsRetrieved) {
            retrieveReimbursements().then(() => {
                setAreReimbursementsRetrieved(true);
            });
        }
        // do not show the app drawer or bottom bar, and disable and swipe-based navigation for screen
        if (navigation.getState().index === 5) {
            appDrawerHeaderShown && setAppDrawerHeaderShown(false);
            drawerSwipeEnabled && setDrawerSwipeEnabled(false);
            bottomTabShown && setBottomTabShown(false);
        }
    }, [reimbursementsRetrieved, navigation.getState(), appDrawerHeaderShown,
        drawerSwipeEnabled, bottomTabShown]);

    /**
     * Function used to retrieve the reimbursements, by calling our back-end API.
     */
    const retrieveReimbursements = async () => {
        // ToDo: replace this with the actual API call.
        const newReimbursements: Reimbursement[] = [
            {
                id: 'd062ba64-e7ab-4ddb-addc-d7424e1a1980',
                timestamp: 1705280633000,
                status: 'PROCESSED',
                amount: 55.30,
                cardId: 'e8b005d4-77c6-40e8-16b0-08dc113119af',
                cardLast4: '3456',
                cardType: CardType.Mastercard,
                transactions: []
            },
            {
                id: 'd062ba64-e7ab-4ddb-addc-d7424e1a1980',
                timestamp: 1705280633000,
                status: 'PROCESSED',
                amount: 20.02,
                cardId: 'e8b005d4-77c6-40e8-16b0-08dc113119af',
                cardLast4: '8999',
                cardType: CardType.Visa,
                transactions: []
            },
            {
                id: 'd062ba64-e7ab-4ddb-addc-d7424e1a1980',
                timestamp: 1705280633000,
                status: 'PENDING',
                amount: 23.09,
                cardId: 'e8b005d4-77c6-40e8-16b0-08dc113119af',
                cardLast4: '3456',
                cardType: CardType.Mastercard,
                transactions: []
            },
            {
                id: 'd062ba64-e7ab-4ddb-addc-d7424e1a1980',
                timestamp: 1705280633000,
                status: 'PROCESSED',
                amount: 35.98,
                cardId: 'e8b005d4-77c6-40e8-16b0-08dc113119af',
                cardLast4: '3456',
                cardType: CardType.Mastercard,
                transactions: []
            },
            {
                id: 'd062ba64-e7ab-4ddb-addc-d7424e1a1980',
                timestamp: 1705280633000,
                status: 'PENDING',
                amount: 25.18,
                cardId: 'e8b005d4-77c6-40e8-16b0-08dc113119af',
                cardLast4: '8999',
                cardType: CardType.Visa,
                transactions: []
            },
            {
                id: 'd062ba64-e7ab-4ddb-addc-d7424e1a1980',
                timestamp: 1705280633000,
                status: 'PROCESSED',
                amount: 35.98,
                cardId: 'e8b005d4-77c6-40e8-16b0-08dc113119af',
                cardLast4: '8999',
                cardType: CardType.Visa,
                transactions: []
            },
            {
                id: 'd062ba64-e7ab-4ddb-addc-d7424e1a1980',
                timestamp: 1705280633000,
                status: 'PENDING',
                amount: 25.18,
                cardId: 'e8b005d4-77c6-40e8-16b0-08dc113119af',
                cardLast4: '8999',
                cardType: CardType.Visa,
                transactions: []
            },
            {
                id: 'd062ba64-e7ab-4ddb-addc-d7424e1a1980',
                timestamp: 1705280633000,
                status: 'PROCESSED',
                amount: 35.98,
                cardId: 'e8b005d4-77c6-40e8-16b0-08dc113119af',
                cardLast4: '8999',
                cardType: CardType.Visa,
                transactions: []
            }
        ]
        setTimeout(() => {
            setReimbursements([...reimbursements, ...newReimbursements]);
            setIsReady(true);
        }, 1000);
    }

    /**
     * return the component for the ReimbursementsController page
     */
    return (
        <>
            {
                !isReady ?
                    <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                    :
                    <View style={[{flex: 1}, (splashState.splashTitle !== undefined && splashState.splashTitle !== "" && splashState.splashDescription !== undefined &&
                        splashState.splashDescription !== "" && splashState.splashArtSource !== undefined && splashState.splashArtSource !== "") && {backgroundColor: '#313030'}]}>
                        {
                            (splashState.splashTitle !== undefined && splashState.splashTitle !== "" && splashState.splashDescription !== undefined &&
                                splashState.splashDescription !== "" && splashState.splashArtSource !== undefined && splashState.splashArtSource !== "")
                                ?
                                <>
                                    <SplashScreen
                                        //@ts-ignore
                                        splashArtSource={splashState.splashArtSource}
                                        splashButtonText={splashState.splashButtonText}
                                        splashTitle={splashState.splashTitle}
                                        splashDescription={splashState.splashDescription}
                                    />
                                    <TouchableOpacity
                                        style={styles.splashButtonDismiss}
                                        onPress={async () => {
                                            // dismiss Splash screen by resetting the splash state
                                            splashStateReset();
                                        }}
                                    >
                                        <Text
                                            style={styles.splashButtonDismissText}>{splashState.splashButtonText}</Text>
                                    </TouchableOpacity>
                                </>
                                :
                                <ReimbursementsStack.Navigator
                                    initialRouteName={'ReimbursementsSummary'}
                                    screenOptions={({}) => ({
                                        headerShown: true,
                                        gestureEnabled: false,
                                        header: () =>
                                            <>
                                                <TouchableOpacity
                                                    activeOpacity={1}
                                                    disabled={!showReimbursementBottomSheet}
                                                    onPress={() => {
                                                        // reset the card choice dropdown value and open state
                                                        setCardChoiceDropdownValue("");
                                                        setIsCardChoiceDropdownOpen(false);

                                                        // close the bottom sheet
                                                        setShowReimbursementBottomSheet(false);
                                                    }}
                                                >
                                                    <LinearGradient
                                                        start={{x: 0.2, y: 1}}
                                                        end={{x: 1, y: 0}}
                                                        colors={['#181818', '#313030']}
                                                        style={styles.headerView}>
                                                        <View
                                                            {...showReimbursementBottomSheet && {pointerEvents: "none"}}
                                                            style={[styles.topHeaderView, showReimbursementBottomSheet && {
                                                                backgroundColor: 'transparent',
                                                                opacity: 0.3
                                                            }]}>
                                                            <View style={styles.headerBalanceView}>
                                                                <Text style={styles.headerAvailableBalanceTop}>
                                                                    Available Balance
                                                                </Text>
                                                                <Text style={styles.headerAvailableBalanceBottom}>
                                                                    <Text
                                                                        style={styles.headerAvailableBalanceBottomDollarSign}>
                                                                        {'$ '}
                                                                    </Text>
                                                                    {`${currentBalance.toFixed(2)}`}
                                                                </Text>
                                                            </View>
                                                            <TouchableOpacity
                                                                disabled={showReimbursementBottomSheet}
                                                                onPress={() => {
                                                                    // go back to the Home/Dashboard screen
                                                                    setAppDrawerHeaderShown(true);
                                                                    setDrawerSwipeEnabled(true);
                                                                    setBottomTabShown(true);
                                                                    navigation.goBack();
                                                                }}
                                                                activeOpacity={0.65}
                                                                style={styles.headerCloseIcon}>
                                                                <Icon
                                                                    type={"antdesign"}
                                                                    name={"close"}
                                                                    color={"#FFFFFF"}
                                                                    size={hp(3.75)}
                                                                />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </LinearGradient>
                                                    <View
                                                        {...showReimbursementBottomSheet && {pointerEvents: "none"}}
                                                        style={styles.headerButtonView}>
                                                        <TouchableOpacity
                                                            disabled={showReimbursementBottomSheet}
                                                            style={[styles.headerButton, showReimbursementBottomSheet && {
                                                                backgroundColor: '#F2FF5D99'
                                                            }]}
                                                            onPress={() => {
                                                                // show the reimbursements bottom sheet container
                                                                setShowReimbursementBottomSheet(true);
                                                            }}
                                                        >
                                                            <Icon
                                                                style={styles.cashOutIcon}
                                                                type={"antdesign"}
                                                                name={"plus"}
                                                                color={"#313030"}
                                                                size={hp(3)}
                                                            />
                                                            <Text style={styles.cashOutText}>
                                                                Cash Out
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </TouchableOpacity>
                                            </>
                                    })}
                                >
                                    <ReimbursementsStack.Screen
                                        name="ReimbursementsSummary"
                                        component={ReimbursementsSummary}
                                        initialParams={{}}
                                    />
                                </ReimbursementsStack.Navigator>
                        }
                    </View>
            }
        </>
    );
};
