import React, {useEffect} from "react";
import {List, Text} from "react-native-paper";
import {styles} from "../../../../../../styles/dashboard.module";
import {ScrollView, View} from "react-native";
import {Image as ExpoImage} from "expo-image/build/Image";
// @ts-ignore
import MoonbeamStorePlaceholder from "../../../../../../../assets/art/moonbeam-store-placeholder.png";
import {Divider} from "@rneui/base";
import {useRecoilState, useRecoilValue} from "recoil";
import {customBannerState} from "../../../../../../recoil/CustomBannerAtom";
import {showTransactionBottomSheetState, sortedTransactionDataState} from "../../../../../../recoil/DashboardAtom";
import {MoonbeamTransaction} from "@moonbeam/moonbeam-models";

/**
 * BottomDashboard component.
 *
 * @param props component properties to be passed in.
 * @constructor constructor for the component.
 */
export const BottomDashboard = (props: {
    setSelectedTransaction: React.Dispatch<React.SetStateAction<MoonbeamTransaction | null>>,
}) => {
    // constants used to keep track of shared states
    const [bannerState,] = useRecoilState(customBannerState);
    const [bannerVisible,] = useRecoilState(bannerState.bannerVisibilityState);
    const sortedTransactionData = useRecoilValue(sortedTransactionDataState);
    const [, setShowTransactionsBottomSheet] = useRecoilState(showTransactionBottomSheetState);

    /**
     * Function used to convert a number of milliseconds to a particular time
     * (seconds, minutes, days, weeks, years), in order to help display how much
     * time elapsed since a transaction was made.
     *
     * @param milliseconds milliseconds to convert, to be passed in
     * @return a {@link string} representing the elapsed timeframe.
     */
    const convertMSToTimeframe = (milliseconds: number): string => {
        let seconds = Math.floor(milliseconds / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        let days = Math.floor(hours / 24);
        let months = Math.floor(days / 30);
        let years = Math.floor(months / 12);

        seconds = seconds % 60;
        minutes = minutes % 60;
        hours = hours % 24;
        days = days % 30
        months = months % 12;

        // return the elapsed time accordingly
        if (years !== 0) {
            return years !== 1 ? `${years} years ago` : `${years} year ago`;
        } else if (months !== 0) {
            return months !== 1 ? `${months} months ago` : `${months} month ago`;
        } else if (days !== 0) {
            return days !== 1 ? `${days} days ago` : `${days} day ago`;
        } else if (hours !== 0) {
            return hours !== 1 ? `${hours} hours ago` : `${hours} hour ago`;
        } else if (minutes !== 0) {
            return minutes !== 1 ? `${minutes} minutes ago` : `${minutes} minute ago`;
        } else if (seconds !== 0) {
            return seconds !== 1 ? `${seconds} seconds ago` : `${seconds} second ago`;
        } else {
            return ''
        }
    }

    /**
     * Function used to filter transactional data and return the transactions.
     *
     * @return {@link React.ReactNode} or {@link React.ReactNode[]}
     */
    const filterTransactions = (): React.ReactNode | React.ReactNode[] => {
        let results: React.ReactNode[] = [];

        // check if there's no transactional data to be retrieved for the current user
        if (sortedTransactionData.length === 0) {
            results.push(
                <>
                    <List.Item
                        titleStyle={styles.emptyTransactionsListItemTitle}
                        descriptionStyle={styles.listItemDescription}
                        titleNumberOfLines={1}
                        title={"No transactions available"}
                    />
                </>
            );
        } else {
            /**
             * sort the transactional data from most to least recent
             * loop through the transactional data object, and populate each transaction accordingly
             */
            sortedTransactionData.forEach(transaction => {

                // get the transaction location (city and state for in person, and online for online purchases)
                let transactionPurchaseLocation;
                if (transaction.transactionIsOnline) {
                    transactionPurchaseLocation = 'Online';
                } else {
                    // get the store city and state, for cases where we have in person purchases
                    const transactionBrandAddressContents = transaction.transactionBrandAddress.split(',');

                    // check if we have a unit number
                    if (transactionBrandAddressContents.length === 6) {
                        transactionPurchaseLocation = `${transactionBrandAddressContents[2].trim()}, ${transactionBrandAddressContents[3].trim()}`;
                    } else {
                        transactionPurchaseLocation = `${transactionBrandAddressContents[1].trim()}, ${transactionBrandAddressContents[2].trim()}`;
                    }
                }

                results.push(
                    <>
                        <List.Item
                            titleStyle={styles.listItemTitle}
                            descriptionStyle={styles.listItemDescription}
                            titleNumberOfLines={2}
                            descriptionNumberOfLines={2}
                            title={transaction.transactionBrandName}
                            description={`${transactionPurchaseLocation}\n${convertMSToTimeframe(Date.parse(new Date().toISOString()) - transaction.timestamp)}`}
                            left={() =>
                                <View style={styles.leftItemIconBackground}>
                                    <ExpoImage
                                        style={styles.leftItemIcon}
                                        source={{uri: transaction.transactionBrandLogoUrl}}
                                        placeholder={MoonbeamStorePlaceholder}
                                        placeholderContentFit={'contain'}
                                        contentFit={'contain'}
                                        transition={1000}
                                        cachePolicy={'memory-disk'}
                                    />
                                </View>
                            }
                            right={() =>
                                <View style={styles.itemRightView}>
                                    <View style={styles.itemRightDetailsView}>
                                        <Text
                                            style={styles.itemRightDetailTop}>{`+ $${transaction.rewardAmount.toFixed(2)}`}</Text>
                                        <Text
                                            style={styles.itemRightDetailBottom}>{transaction.transactionStatus}</Text>
                                    </View>
                                    <View style={styles.rightItemIcon}>
                                        <List.Icon color={'#F2FF5D'} icon="chevron-right"/>
                                    </View>
                                </View>
                            }
                            onPress={() => {
                                props.setSelectedTransaction(Array.from(sortedTransactionData).filter((filteredTransaction) => filteredTransaction.transactionId === transaction.transactionId)[0]);
                                // show the bottom sheet with the appropriate transaction details
                                setShowTransactionsBottomSheet(true);
                            }}
                        />
                    </>
                );
            });
        }
        return results;
    }

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
    }, []);

    // return the component for the BottomDashboard, part of the Dashboard page
    return (
        <>
            {
                bannerVisible &&
                <View style={styles.bottomView}>
                    <List.Subheader style={styles.subHeaderTitle}>
                        Transactions
                    </List.Subheader>
                    <Divider
                        style={[styles.mainDivider, {backgroundColor: '#FFFFFF'}]}/>
                    <ScrollView
                        scrollEnabled={true}
                        persistentScrollbar={false}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps={'handled'}
                        contentContainerStyle={styles.individualTransactionContainer}
                    >
                        <List.Section>
                            {filterTransactions()}
                        </List.Section>
                    </ScrollView>
                </View>
            }
        </>
    );
}
