import React, {useEffect, useState} from 'react';
import {SafeAreaView} from "react-native";
import {Dialog, Portal, Text} from "react-native-paper";
import {styles} from "../../../../../../styles/dashboard.module";
import {useRecoilState} from "recoil";
import {appUrlState, currentUserInformation} from "../../../../../../recoil/AuthAtom";
import {Spinner} from "../../../../../common/Spinner";
// @ts-ignore
import DashboardBackgroundImage from "../../../../../../../assets/backgrounds/dashboard-background.png";
import {Button} from "@rneui/base";
import {commonStyles} from "../../../../../../styles/common.module";
import {LoggingLevel, MoonbeamTransaction} from "@moonbeam/moonbeam-models";
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {BiometricsPopUp} from "../biometrics/Biometrics";
// @ts-ignore
import MoonbeamStorePlaceholder from "../../../../../../../assets/art/moonbeam-store-placeholder.png";
import * as StoreReview from 'expo-store-review';
import {createOrUpdateAppReviewRecord, getAppReviewEligibilityCheck, logEvent} from "../../../../../../utils/AppSync";
import {DashboardMain} from "./DashboardMain";
import {DashboardBottomSheet} from "./DashboardBottomSheet";

/**
 * DashboardController component. This component will be used as the dashboard for the application,
 * where the Home tab is highlighted from.
 *
 * @constructor constructor for the component.
 */
export const Dashboard = () => {
    // constants used to keep track of local component state
    const [appReviewModalShown, isAppReviewModalShown] = useState<boolean>(false);
    const [isReady,] = useState<boolean>(true);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [statsDialogVisible, setStatsDialogVisible] = useState(false);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [selectedTransaction, setSelectedTransaction] = useState<MoonbeamTransaction | null>(null);
    // constants used to keep track of shared states
    const [appUrl,] = useRecoilState(appUrlState);
    const [userInformation,] = useRecoilState(currentUserInformation);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        if (userInformation["custom:userId"]) {
            // if we have a global app url that we opened the app from, act accordingly
            if (appUrl) {
                /**
                 * if we clicked a cashback notification, then we want to consider showing a
                 * store review pop-up.
                 */
                if (appUrl.includes('notification') && appUrl.includes('cashback') && !appReviewModalShown) {
                    isAppReviewModalShown(true);

                    // first check to see if the user is eligible to be shown the App Review Modal
                    getAppReviewEligibilityCheck(userInformation["custom:userId"]).then(appReviewEligibilityCheck => {
                        if (appReviewEligibilityCheck) {
                            const message = `User ${userInformation["custom:userId"]} is ELIGIBLE to be shown the App Review modal, proceeding!`;
                            console.log(message);
                            logEvent(message, LoggingLevel.Info).then(() => {
                            });

                            StoreReview.isAvailableAsync().then((availabilityFlag) => {
                                // if the platform has the capabilities for store review
                                if (availabilityFlag) {
                                    StoreReview.hasAction().then((actionCapability) => {
                                        // if the store is capable directing the user to some kind of store review flow.
                                        if (actionCapability) {
                                            StoreReview.requestReview().then(() => {
                                                /**
                                                 * store and/or update the App Review record for the user, so we don't show them the App Review next time
                                                 * unless it has been more than 3 months since they've last seen it (established through eligibility check).
                                                 */
                                                createOrUpdateAppReviewRecord(userInformation["custom:userId"]).then(appReviewRecordCreationOrUpdateCheck => {
                                                    const message = appReviewRecordCreationOrUpdateCheck
                                                        ? `Successfully processed App Review record for user ${userInformation["custom:userId"]}!`
                                                        : `Failed to process App Review record for user ${userInformation["custom:userId"]}!`
                                                    console.log(message);
                                                    logEvent(message, appReviewRecordCreationOrUpdateCheck ? LoggingLevel.Info : LoggingLevel.Error).then(() => {
                                                    });
                                                });
                                            });
                                        }
                                    });
                                }
                            });
                        } else {
                            const message = `User ${userInformation["custom:userId"]} is NOT ELIGIBLE to be shown the App Review modal, skipping!`;
                            console.log(message);
                            logEvent(message, LoggingLevel.Info).then(() => {
                            });
                        }
                    });
                }
            }
        }
    }, [appUrl, appReviewModalShown, userInformation["custom:userId"]]);

    // return the component for the Dashboard page
    return (
        <>
            {
                !isReady ?
                    <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                    :
                    <>
                        <BiometricsPopUp/>
                        <Portal>
                            <Dialog style={commonStyles.dialogStyle} visible={modalVisible}
                                    onDismiss={() => setModalVisible(false)}>
                                <Dialog.Icon icon="alert" color={"#F2FF5D"}
                                             size={hp(10)}/>
                                <Dialog.Title style={commonStyles.dialogTitle}>We hit a snag!</Dialog.Title>
                                <Dialog.Content>
                                    <Text
                                        style={commonStyles.dialogParagraph}>{`Unexpected error while loading dashboard!`}</Text>
                                </Dialog.Content>
                            </Dialog>
                        </Portal>
                        <Portal>
                            <Dialog style={commonStyles.dialogStyle} visible={statsDialogVisible} onDismiss={() => {
                                setStatsDialogVisible(false)
                            }}>
                                <Dialog.Icon icon="cash"
                                             color={"#F2FF5D"}
                                             size={hp(8)}
                                />
                                <Dialog.Title style={[commonStyles.dialogTitle, {
                                    bottom: hp(15),
                                    textDecorationLine: 'underline',
                                    fontSize: hp(2),
                                    textAlign: 'center',
                                    marginBottom: -hp(2)
                                }]}>Cashback Balances</Dialog.Title>
                                <Dialog.Content style={{bottom: hp(10), marginBottom: -hp(10)}}>
                                    <Text style={[commonStyles.dialogParagraph, {fontSize: hp(1.70)}]}>
                                        {
                                            <>
                                                Your Moonbeam cashback is split in two categories.
                                                <Text style={commonStyles.dialogParagraphBold}> Total
                                                    Saved</Text> and <Text
                                                style={commonStyles.dialogParagraphBold}>Available
                                                Balance</Text>.{"\n\n\n"}
                                                <Text
                                                    style={commonStyles.dialogParagraphNumbered}>➊</Text> The <Text
                                                style={commonStyles.dialogParagraphBold}>Total Saved</Text> amount are
                                                your
                                                all-time savings, including those that are not yet processed.
                                                {"\n\n"}
                                                <Text
                                                    style={commonStyles.dialogParagraphNumbered}>➋</Text> The <Text
                                                style={commonStyles.dialogParagraphBold}>Available
                                                Balance</Text> amount is the processed cashback. This is the
                                                only form of cash which can be redeemed. {"\n\n"}
                                                <Text style={commonStyles.dialogParagraphNumbered}>➌</Text> It can
                                                take up to 30 days for pending cashback to reflect in your <Text
                                                style={commonStyles.dialogParagraphBold}>Available
                                                Balance</Text>.{"\n\n"}
                                                <Text style={commonStyles.dialogParagraphNumbered}>➍</Text> You will
                                                be able to transfer your
                                                <Text style={commonStyles.dialogParagraphBold}> Available
                                                    Balance</Text> amount once it
                                                reaches $20 or more.{"\n\n"}
                                                <Text style={commonStyles.dialogParagraphNumbered}>➎</Text> If you
                                                have any issues please contact support.{"\n\n"}

                                            </>
                                        }
                                    </Text>
                                </Dialog.Content>
                                <Dialog.Actions>
                                    <Button buttonStyle={commonStyles.dialogButton}
                                            titleStyle={commonStyles.dialogButtonText}
                                            onPress={() => {
                                                setStatsDialogVisible(false);
                                            }}>
                                        Got it!
                                    </Button>
                                </Dialog.Actions>
                            </Dialog>
                        </Portal>
                        <SafeAreaView style={styles.mainDashboardView}>
                            <DashboardMain
                                setSelectedTransaction={setSelectedTransaction}
                                setStatsDialogVisible={setStatsDialogVisible}
                            />
                            <DashboardBottomSheet selectedTransaction={selectedTransaction}
                                                  setSelectedTransaction={setSelectedTransaction}/>
                        </SafeAreaView>
                    </>
            }
        </>
    );
};

