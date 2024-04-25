import React, {useEffect} from "react";
// @ts-ignore
import MoonbeamStorePlaceholder from "../../../../../../../../assets/art/moonbeam-store-placeholder.png";
import {
    CurrencyCodeType,
    MoonbeamRoundupTransaction,
    PlaidTransactionsStatus,
    RoundupTransactionsStatus,
    TransactionType
} from "@moonbeam/moonbeam-models";
import {styles} from "../../../../../../../styles/roundupsDashboard.module";
import {Platform, ScrollView, View} from "react-native";
import {heightPercentageToDP as hp} from "react-native-responsive-screen";
import {List, Text} from "react-native-paper";
import {Divider} from "@rneui/base";
import {convertMSToTimeframe} from "../../../../../../../utils/Util";
import {Image as ExpoImage} from "expo-image/build/Image";
import {useRecoilState} from "recoil";
import {showRoundupTransactionBottomSheetState} from "../../../../../../../recoil/DashboardAtom";

/**
 * RoundupsBottomDashboard component.
 *
 * @param props component properties to be passed in.
 * @constructor constructor for the component.
 */
export const RoundupsBottomDashboard = (props: {
    setSelectedRoundupTransaction: React.Dispatch<React.SetStateAction<MoonbeamRoundupTransaction | null>>,
}) => {
    // constants used to keep track of local component state

    // constants used to keep track of shared states
    const [showRoundupTransactionsBottomSheet,] = useRecoilState(showRoundupTransactionBottomSheetState);
    // const sortedRoundupTransactionData = useRecoilValue(sortedRoundupTransactionDataState);
    const sortedRoundupTransactionData = [{
        accountId: "BxBXxLj1m4HMXBm9WZZmCWVbPjX16EHwv99vp",
        availableRoundupAmount: 0,
        brandId: "O5W5j4dN9OR3E6ypQmjdkWZZRoXEzVMz2ByWM",
        category: "19046000",
        categoryLogoURL: "https://plaid-category-icons.plaid.com/PFC_GENERAL_MERCHANDISE.png",
        createdAt: "2023-09-24T11:01:01Z",
        creditedRoundupAmount: 0,
        currencyCode: CurrencyCodeType.Usd,
        id: "moonbeam_user_id",
        memberId: "BxBXxLj1m4HMXBm9WZZmCWVbPjX16EHwv99vp", // member id = account id ?
        pendingRoundupAmount: 0.77,
        plaidTransactionStatus: PlaidTransactionsStatus.Added,
        storeId: "O5W5j4dN9OR3E6ypQmjdkWZZRoXEzVMz2ByWM",
        storeLocation: {
            addressLine: "13425 Community Rd",
            city: "Poway",
            countryCode: "US",
            latitude: "32.959068",
            longitude: "-117.037666",
            onlineStore: false,
            region: "CA",
            storeNumber: "1700",
            zipCode: "92064"
        },
        timestamp: 1695378890000,
        totalAmount: 19.23,
        transactionBrandAddress: "", // get rid of brand address since we got store location
        transactionBrandLogoUrl: "https://plaid-merchant-logos.plaid.com/walmart_1100.png",
        transactionBrandName: "Walmart",
        transactionBrandURLAddress: "https://www.walmart.com",
        transactionId: "lPNjeW1nR6CDn5okmGQ6hEpMo4lLNoSrzqDje",
        transactionIsOnline: false,
        transactionStatus: RoundupTransactionsStatus.Pending,
        transactionType: TransactionType.Roundup,
        updatedAt: "2023-09-22T10:34:50Z"
    },
        {
            accountId: "BxBXxLj1m4HMXBm9WZZmCWVbPjX16EHwv99vp",
            availableRoundupAmount: 0,
            brandId: "O5W5j4dN9OR3E6ypQmjdkWZZRoXEzVMz2ByWM",
            category: "19046000",
            categoryLogoURL: "https://plaid-category-icons.plaid.com/PFC_GENERAL_MERCHANDISE.png",
            createdAt: "2023-09-24T11:01:01Z",
            creditedRoundupAmount: 0,
            currencyCode: CurrencyCodeType.Usd,
            id: "moonbeam_user_id",
            memberId: "BxBXxLj1m4HMXBm9WZZmCWVbPjX16EHwv99vp", // member id = account id ?
            pendingRoundupAmount: 0.93,
            plaidTransactionStatus: PlaidTransactionsStatus.Added,
            storeId: "O5W5j4dN9OR3E6ypQmjdkWZZRoXEzVMz2ByWM",
            storeLocation: {
                addressLine: "13425 Community Rd",
                city: "Poway",
                countryCode: "US",
                latitude: "32.959068",
                longitude: "-117.037666",
                onlineStore: false,
                region: "CA",
                storeNumber: "1700",
                zipCode: "92064"
            },
            timestamp: 1695378890000,
            totalAmount: 23.07,
            transactionBrandAddress: "", // get rid of brand address since we got store location
            transactionBrandLogoUrl: "https://plaid-merchant-logos.plaid.com/walmart_1100.png",
            transactionBrandName: "Walmart",
            transactionBrandURLAddress: "https://www.walmart.com",
            transactionId: "lPNjeW1nR6CDn5okmGQ6hEpMo4lLNoSrzqDjes",
            transactionIsOnline: true,
            transactionStatus: RoundupTransactionsStatus.Pending,
            transactionType: TransactionType.Roundup,
            updatedAt: "2023-09-22T10:34:50Z"
        }
    ];
    const [, setShowRoundupTransactionBottomSheet] = useRecoilState(showRoundupTransactionBottomSheetState);

    /**
     * Function used to filter roundups transactional data and return the roundups transactions.
     *
     * @return {@link React.ReactNode} or {@link React.ReactNode[]}
     */
    const filterRoundupTransactions = (): React.ReactNode | React.ReactNode[] => {
        let results: React.ReactNode[] = [];

        // check if there's no transactional data to be retrieved for the current user
        if (sortedRoundupTransactionData.length === 0) {
            results.push(
                <>
                    <List.Item
                        titleStyle={styles.emptyTransactionsListItemTitle}
                        descriptionStyle={styles.listItemDescription}
                        titleNumberOfLines={11}
                        title={"No Savings Available!"}
                    />
                </>
            );
        } else {
            /**
             * sort the transactional data from most to least recent
             * loop through the transactional data object, and populate each transaction accordingly
             */
            sortedRoundupTransactionData.forEach(transaction => {
                // get the transaction location (city and state for in person, and online for online purchases)
                let transactionPurchaseLocation;
                if (transaction.transactionIsOnline) {
                    transactionPurchaseLocation = 'Online';
                } else {
                    // check if we have a unit number
                    if (!transaction.storeLocation.onlineStore && transaction.storeLocation.addressLine && transaction.storeLocation.addressLine.length !== 0 &&
                        transaction.storeLocation.city && transaction.storeLocation.city.length !== 0 &&
                        transaction.storeLocation.region && transaction.storeLocation.region.length !== 0 &&
                        transaction.storeLocation.zipCode && transaction.storeLocation.zipCode.length !== 0
                    ) {
                        transactionPurchaseLocation = `${transaction.storeLocation.city}, ${transaction.storeLocation.region}`;
                    } else {
                        transactionPurchaseLocation = `In Person`;
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
                                            style={styles.itemRightDetailTop}>{
                                            transaction.transactionStatus === RoundupTransactionsStatus.Pending
                                                ? `+ $ ${transaction.pendingRoundupAmount.toFixed(2)}`
                                                : transaction.transactionStatus === RoundupTransactionsStatus.Processed
                                                    ? `+ $ ${transaction.availableRoundupAmount.toFixed(2)}`
                                                    : `+ $ ${transaction.creditedRoundupAmount.toFixed(2)}`
                                        }</Text>
                                        <Text
                                            style={styles.itemRightDetailBottom}>
                                            {
                                                transaction.transactionStatus
                                            }
                                        </Text>
                                    </View>
                                    <View style={styles.rightItemIcon}>
                                        <List.Icon color={'#F2FF5D'} icon="chevron-right"/>
                                    </View>
                                </View>
                            }
                            onPress={() => {
                                props.setSelectedRoundupTransaction(Array.from(sortedRoundupTransactionData).filter((filteredTransaction) => filteredTransaction.transactionId === transaction.transactionId)[0]);
                                // show the bottom sheet with the appropriate roundup transaction details
                                setShowRoundupTransactionBottomSheet(true);
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

    // return the component for the RoundupsBottomDashboard, part of the Dashboard page
    return (
        <>
            <View
                style={[
                    showRoundupTransactionsBottomSheet && {pointerEvents: "none"},
                    showRoundupTransactionsBottomSheet && {
                        backgroundColor: 'black', opacity: 0.75
                    }
                ]}
            >
                <View style={[styles.bottomView, Platform.OS === 'android' && {
                    borderTopColor: '#0000000D',
                    borderLeftColor: '#0000000D',
                    borderRightColor: '#0000000D',
                    borderTopWidth: hp(0.65),
                    borderLeftWidth: hp(0.65),
                    borderRightWidth: hp(0.65)
                }]}>
                    <List.Subheader style={styles.subHeaderTitle}>
                        Savings Activity
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
                            {filterRoundupTransactions()}
                        </List.Section>
                    </ScrollView>
                </View>
            </View>
        </>
    );
}
