import React, {useEffect} from "react";
import {List, Text} from "react-native-paper";
import {styles} from "../../../../../../styles/dashboard.module";
import {Platform, ScrollView, View} from "react-native";
import {Image as ExpoImage} from "expo-image/build/Image";
// @ts-ignore
import MoonbeamStorePlaceholder from "../../../../../../../assets/art/moonbeam-store-placeholder.png";
import {Divider} from "@rneui/base";
import {useRecoilState, useRecoilValue} from "recoil";
import {customBannerState} from "../../../../../../recoil/CustomBannerAtom";
import {showTransactionBottomSheetState, sortedTransactionDataState} from "../../../../../../recoil/DashboardAtom";
import {MoonbeamTransaction, TransactionsStatus} from "@moonbeam/moonbeam-models";
import {convertMSToTimeframe} from "../../../../../../utils/Util";
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';

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
                        titleNumberOfLines={10}
                        title={"No transactions available!"}
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
                                            style={styles.itemRightDetailTop}>{`+ $ ${transaction.rewardAmount.toFixed(2)}`}</Text>
                                        <Text
                                            style={styles.itemRightDetailBottom}>
                                            {
                                                transaction.transactionStatus === TransactionsStatus.Funded
                                                    ? TransactionsStatus.Processed
                                                    : (transaction.transactionStatus === TransactionsStatus.Fronted
                                                            ? TransactionsStatus.Credited
                                                            : transaction.transactionStatus
                                                    )
                                            }
                                        </Text>
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
                <View style={[styles.bottomView, Platform.OS === 'android' && {
                    borderTopColor: '#0000000D',
                    borderLeftColor: '#0000000D',
                    borderRightColor: '#0000000D',
                    borderTopWidth: hp(0.65),
                    borderLeftWidth: hp(0.65),
                    borderRightWidth: hp(0.65)
                }]}>
                    <List.Subheader style={styles.subHeaderTitle}>
                        Military Discounts
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
