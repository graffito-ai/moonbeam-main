import React, {useEffect, useMemo, useRef, useState} from "react";
import {Dialog, List, Portal} from "react-native-paper";
import {styles} from "../../../../../../styles/dailyEarningsSummary.module";
import {Image, Text, View} from "react-native";
import {Button} from "@rneui/base";
import {Spinner} from "../../../../../common/Spinner";
import {useRecoilState} from "recoil";
import {currentUserInformation} from "../../../../../../recoil/AuthAtom";
// @ts-ignore
import MoonbeamDailyEarnings from "../../../../../../../assets/art/moonbeam-daily-earnings.png";
import {DailyEarningsSummaryStatus, MoonbeamTransaction} from "@moonbeam/moonbeam-models";
import {getDailyEarningSummaries} from "../../../../../../utils/AppSync";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {DataProvider, LayoutProvider, RecyclerListView} from "recyclerlistview";
import {Image as ExpoImage} from "expo-image/build/Image";
import {convertMSToTimeframe} from "../../../../../../utils/Util";

/**
 * DailyEarningsSummaryPopUp component. This component will be used in the dashboard for the application,
 * to help with the displaying the daily earnings summary.
 *
 * @constructor constructor for the component.
 */
export const DailyEarningsSummaryPopUp = () => {
    // constants used to keep track of local component state
    const earningsListView = useRef();
    const [isReady, setIsReady] = useState<boolean>(false);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [isDailyEarningsSummaryDisplayed, setIsDailyEarningsSummaryDisplayed] = useState<boolean>(false);
    const [isDailyEarningsSummaryRetrieved, setIsDailyEarningsSummaryRetrieved] = useState<boolean>(false);
    const [dailyEarnings, setDailyEarnings] = useState<MoonbeamTransaction[]>([]);
    const [totalSavedAmount, setTotalSavedAmount] = useState<number>(0);
    const [dailySummaryEarningsDataProvider, setDailySummaryEarningsDataProvider] = useState<DataProvider | null>(null);
    const [dailySummaryEarningsLayoutProvider, setDailySummaryEarningsLayoutProvider] = useState<LayoutProvider | null>(null);
    // constants used to keep track of shared states
    const [userInformation,] = useRecoilState(currentUserInformation);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        /**
         * first ensure that we redeemed the daily summary for the particular logged-in user,
         * and only show the daily earnings summary popup whenever we get a valid daily earnings
         * summary retrieved.
         */
        !isDailyEarningsSummaryRetrieved && getDailyEarningSummaries(userInformation["custom:userId"]).then(retrievedDailyEarningsSummaryData => {
            setIsReady(true);
            setIsDailyEarningsSummaryRetrieved(true);
            // we want to ensure that we only show the popup if the summary data has at least 1 item in it and that 1 summary is not ACKNOWLEDGED
            if (retrievedDailyEarningsSummaryData.length === 1 && retrievedDailyEarningsSummaryData[0].status === DailyEarningsSummaryStatus.Sent) {
                setDailyEarnings(retrievedDailyEarningsSummaryData[0].transactions! as MoonbeamTransaction[]);
                // compute the total amount saved for the day
                let totalAmountSaved = 0;
                retrievedDailyEarningsSummaryData[0].transactions.forEach(transaction => {
                    if (transaction !== null) {
                        totalAmountSaved += transaction.rewardAmount;
                    }
                })
                setTotalSavedAmount(totalAmountSaved);
                setIsDailyEarningsSummaryDisplayed(true);
            } else {
                setIsDailyEarningsSummaryDisplayed(false);
            }
        });
        // populate the daily earnings data provider and list view
        if (dailyEarnings.length > 0 && dailySummaryEarningsLayoutProvider === null && dailySummaryEarningsDataProvider === null) {
            setDailySummaryEarningsDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(dailyEarnings));
            setDailySummaryEarningsLayoutProvider(new LayoutProvider(
                _ => 0,
                (_, dim) => {
                    dim.width = wp(95);
                    dim.height = hp(10);
                }
            ));
        }

    }, [isDailyEarningsSummaryRetrieved, dailyEarnings, dailySummaryEarningsDataProvider, dailySummaryEarningsLayoutProvider]);

    /**
     * Function used to populate the rows containing the daily earnings data.
     *
     * @param type row type to be passed in
     * @param data data to be passed in for the row
     * @param index row index
     *
     * @return a {@link React.JSX.Element} or an {@link Array} of {@link React.JSX.Element} representing the
     * React node and/or nodes containing the daily earnings data.
     */
    const renderDailyEarningsData = useMemo(() => (_type: string | number, data: MoonbeamTransaction): React.JSX.Element | React.JSX.Element[] => {
        // render a row containing the earnings data for each one of the transactions in the earnings summary
        if (dailyEarnings.length !== 0) {
            return (
                <>
                    <View
                        style={styles.earningsItemView}>
                        <List.Item
                            titleStyle={styles.earningsItemTitle}
                            descriptionStyle={styles.earningsDescription}
                            titleNumberOfLines={2}
                            descriptionNumberOfLines={1}
                            title={`${data.transactionBrandName}`}
                            description={`${convertMSToTimeframe(Date.parse(new Date().toISOString()) - data.timestamp)}`}
                            left={() =>
                                <ExpoImage
                                    style={styles.earningsBrandLogo}
                                    source={{
                                        uri: data.transactionBrandLogoUrl
                                    }}
                                    contentFit={'contain'}
                                    transition={1000}
                                    cachePolicy={'memory-disk'}
                                />
                            }
                            right={() =>
                                <View style={styles.earningsRightView}>
                                    <View style={styles.earningsRightDetailsView}>
                                        <Text
                                            style={styles.earningsRightDetailTop}>{`$ ${data.rewardAmount.toFixed(2)}`}</Text>
                                        <Text
                                            style={styles.earningsRightDetailBottom}>{data.transactionStatus}</Text>
                                    </View>
                                </View>
                            }
                        />
                    </View>
                </>
            )
        } else {
            return (<></>);
        }
    }, [dailyEarnings]);

    // return the component for the DailyEarningsSummaryPopUp
    return (
        <>
            <Portal>
                <Portal.Host>
                    <Dialog dismissable={false}
                            style={styles.dialogStyle} visible={isDailyEarningsSummaryDisplayed}
                            onDismiss={() => {
                                setIsDailyEarningsSummaryDisplayed(false);
                            }}>
                        <>
                            {
                                !isReady ?
                                    <Spinner loadingSpinnerShown={loadingSpinnerShown}
                                             setLoadingSpinnerShown={setLoadingSpinnerShown}/> :
                                    <>
                                        <Image source={MoonbeamDailyEarnings}
                                               style={styles.topDailySummaryImage}/>
                                        <Dialog.Title
                                            style={styles.dialogTitle}>
                                            {
                                                totalSavedAmount === 0
                                                    ? `Review yesterday's earnings!`
                                                    : <>
                                                        {`Review yesterday's earnings!\n`}
                                                        {`Total Saved: `}
                                                        <Text style={{fontFamily: 'Saira-ExtraBold', color: '#FFFFFF'}}>
                                                            ${totalSavedAmount}
                                                        </Text>
                                                    </>
                                            }
                                        </Dialog.Title>
                                        <Dialog.Actions style={styles.dialogActionButtons}>
                                            <Button buttonStyle={styles.redeemButton}
                                                    titleStyle={styles.redeemButtonText}
                                                    onPress={async () => {
                                                    }}>
                                                {`Redeem All`}
                                            </Button>
                                        </Dialog.Actions>
                                        <Dialog.Content>
                                            <RecyclerListView
                                                // @ts-ignore
                                                ref={earningsListView}
                                                style={styles.earningsList}
                                                layoutProvider={dailySummaryEarningsLayoutProvider!}
                                                dataProvider={dailySummaryEarningsDataProvider!}
                                                rowRenderer={renderDailyEarningsData}
                                                isHorizontal={false}
                                                forceNonDeterministicRendering={true}
                                                scrollViewProps={{
                                                    pagingEnabled: "true",
                                                    decelerationRate: "fast",
                                                    snapToAlignment: "start",
                                                    persistentScrollbar: false,
                                                    showsVerticalScrollIndicator: false,
                                                }}
                                            />
                                        </Dialog.Content>
                                    </>
                            }
                        </>
                    </Dialog>
                </Portal.Host>
            </Portal>
        </>
    )
}
