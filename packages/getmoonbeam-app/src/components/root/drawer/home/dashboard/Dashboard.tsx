import React, {useEffect, useRef, useState} from 'react';
import {ImageBackground, SafeAreaView, ScrollView, TouchableOpacity, View} from "react-native";
import {Dialog, List, Portal, SegmentedButtons, Text} from "react-native-paper";
import {styles} from "../../../../../styles/dashboard.module";
import {useRecoilState, useRecoilValue} from "recoil";
import {appUrlState, currentUserInformation} from "../../../../../recoil/AuthAtom";
import {Spinner} from "../../../../common/Spinner";
// @ts-ignore
import DashboardBackgroundImage from "../../../../../../assets/backgrounds/dashboard-background.png";
import {drawerSwipeState, profilePictureURIState} from "../../../../../recoil/AppDrawerAtom";
import {Avatar, Button, Divider, Icon} from "@rneui/base";
import {commonStyles} from "../../../../../styles/common.module";
import {CustomBanner} from "../../../../common/CustomBanner";
import {customBannerState} from "../../../../../recoil/CustomBannerAtom";
import BottomSheet from '@gorhom/bottom-sheet';
import {TransactionsBottomSheet} from "./transactions/TransactionsBottomSheet";
import {MoonbeamTransaction} from "@moonbeam/moonbeam-models";
import {
    currentBalanceState,
    lifetimeSavingsState,
    showTransactionBottomSheetState,
    sortedTransactionDataState
} from "../../../../../recoil/DashboardAtom";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {BiometricsPopUp} from "./biometrics/Biometrics";
import {Image as ExpoImage} from 'expo-image';
// @ts-ignore
import MoonbeamProfilePlaceholder from "../../../../../../assets/art/moonbeam-profile-placeholder.png";
// @ts-ignore
import MoonbeamStorePlaceholder from "../../../../../../assets/art/moonbeam-store-placeholder.png";
import {bottomTabShownState} from "../../../../../recoil/HomeAtom";
import * as StoreReview from 'expo-store-review';


/**
 * DashboardController component. This component will be used as the dashboard for the application,
 * where the Home tab is highlighted from.
 *
 * @constructor constructor for the component.
 */
export const Dashboard = ({}) => {
    // constants used to keep track of local component state
    const [appReviewModalShown, isAppReviewModalShown] = useState<boolean>(false);
    const [isReady,] = useState<boolean>(true);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [statsDialogVisible, setStatsDialogVisible] = useState(false);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [currentUserTitle, setCurrentUserTitle] = useState<string>("N/A");
    const [currentUserName, setCurrentUserName] = useState<string>("N/A");
    const [lifetimeSavingsDialog, setIsLifetimeSavingsDialog] = useState<boolean>(false);
    const [segmentedValue, setSegmentedValue] = useState<string>('cashback');
    const bottomSheetRef = useRef(null);
    const [selectedTransaction, setSelectedTransaction] = useState<MoonbeamTransaction | null>(null);
    // constants used to keep track of shared states
    const [appUrl,] = useRecoilState(appUrlState);
    const [userInformation,] = useRecoilState(currentUserInformation);
    const [profilePictureURI,] = useRecoilState(profilePictureURIState);
    const [bannerState,] = useRecoilState(customBannerState);
    const [bannerVisible,] = useRecoilState(bannerState.bannerVisibilityState);
    const sortedTransactionData = useRecoilValue(sortedTransactionDataState);
    const lifetimeSavings = useRecoilValue(lifetimeSavingsState);
    const currentBalance = useRecoilValue(currentBalanceState);
    const [showTransactionsBottomSheet, setShowTransactionsBottomSheet] = useRecoilState(showTransactionBottomSheetState);
    const [, setBottomTabShown] = useRecoilState(bottomTabShownState);
    const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);

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

                    /**
                     * ToDo: here we need to determine whether a user needs to review the app
                     *       meaning, if they have already reviewed the app in the past 3 months,
                     *       then they do not have to review the app again.
                     */
                    StoreReview.isAvailableAsync().then((availabilityFlag) => {
                        // if the platform has the capabilities for store review
                        if (availabilityFlag) {
                            StoreReview.hasAction().then((actionCapability) => {
                                // if the store is capable directing the user to some kind of store review flow.
                                if (actionCapability) {
                                    StoreReview.requestReview().then(() => {
                                        /**
                                         * ToDo: here we need to store a new review for the user.
                                         */
                                    });
                                }
                            });
                        }
                    });
                }
            }

            // check to see if the user information object has been populated accordingly
            if (userInformation["given_name"] && userInformation["family_name"]) {
                setCurrentUserTitle(`${Array.from(userInformation["given_name"].split(" ")[0])[0] as string}${Array.from(userInformation["family_name"].split(" ")[0])[0] as string}`);
                setCurrentUserName(`${userInformation["given_name"]} ${userInformation["family_name"]}`);
            }
            // manipulate the bottom sheet
            if (!showTransactionsBottomSheet && bottomSheetRef) {
                // reset the selected transaction on bottom sheet close
                setSelectedTransaction(null);

                // @ts-ignore
                bottomSheetRef.current?.close?.();

                // show the bottom tab
                setBottomTabShown(true);

                // enable drawer swipe
                setDrawerSwipeEnabled(true);
            }
            if (showTransactionsBottomSheet && bottomSheetRef) {
                // hide the bottom tab
                setBottomTabShown(false);

                // disable the drawer swipe
                setDrawerSwipeEnabled(false);

                // @ts-ignore
                bottomSheetRef.current?.expand?.();
            }
        }
    }, [userInformation["given_name"], userInformation["family_name"], appUrl,
        appReviewModalShown, userInformation["custom:userId"],
        showTransactionsBottomSheet, bottomSheetRef]);

    /**
     * Function used to convert a number of milliseconds to a particular time
     * (seconds, minutes, days, weeks, years), in order to help display how much
     * time elapsed since a transaction was made.
     *
     * @param milliseconds milliseconds to convert, to be passed in
     * @return a {@link string} representing the elapsed timeframe.
     */
    function convertMSToTimeframe(milliseconds: number): string {
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
                                setSelectedTransaction(Array.from(sortedTransactionData).filter((filteredTransaction) => filteredTransaction.transactionId === transaction.transactionId)[0]);
                                // show the bottom sheet with the appropriate transaction details
                                setShowTransactionsBottomSheet(true);
                            }}
                        />
                        <Divider style={styles.divider}/>
                    </>
                );
            });
        }
        return results;
    }

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
                                <Dialog.Icon icon="cash" color={"#F2FF5D"} size={hp(10)}/>
                                <Dialog.Title style={commonStyles.dialogTitle}>Cashback Balances</Dialog.Title>
                                <Dialog.Content>
                                    <Text style={commonStyles.dialogParagraph}>
                                        {
                                            lifetimeSavingsDialog ?
                                                <>
                                                    Your Moonbeam <Text
                                                    style={commonStyles.dialogParagraphBold}>Cashback</Text> is split
                                                    in two categories.
                                                    <Text style={commonStyles.dialogParagraphBold}> Lifetime
                                                        Savings</Text> and <Text
                                                    style={commonStyles.dialogParagraphBold}>Current
                                                    Balance</Text>.{"\n\n\n"}
                                                    <Text
                                                        style={commonStyles.dialogParagraphNumbered}>➊</Text> The <Text
                                                    style={commonStyles.dialogParagraphBold}>Lifetime
                                                    Savings</Text> amount includes your <Text
                                                    style={commonStyles.dialogParagraphBold}>all-time cashback.</Text>
                                                </> :
                                                <>
                                                    Your Moonbeam <Text
                                                    style={commonStyles.dialogParagraphBold}>Cashback</Text> is split
                                                    in two categories.
                                                    <Text style={commonStyles.dialogParagraphBold}> Lifetime
                                                        Savings</Text> and <Text
                                                    style={commonStyles.dialogParagraphBold}>Current
                                                    Balance</Text>.{"\n\n\n"}
                                                    <Text
                                                        style={commonStyles.dialogParagraphNumbered}>➊</Text> The <Text
                                                    style={commonStyles.dialogParagraphBold}>Current
                                                    Balance</Text> amount includes any <Text
                                                    style={commonStyles.dialogParagraphBold}>processed</Text> cashback
                                                    which can be
                                                    redeemed through the Moonbeam platform.{"\n\n"}
                                                    <Text style={commonStyles.dialogParagraphNumbered}>➋</Text> It can
                                                    take upto 30 days
                                                    for your cashback to reflect in your <Text
                                                    style={commonStyles.dialogParagraphBold}>Current
                                                    Balance</Text> amount.{"\n\n"}
                                                    <Text style={commonStyles.dialogParagraphNumbered}>➌</Text> You will
                                                    be able to transfer your
                                                    <Text style={commonStyles.dialogParagraphBold}> Current
                                                        Balance</Text> amount once it reaches $20.{"\n\n"}
                                                    <Text style={commonStyles.dialogParagraphNumbered}>➍</Text> If you
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
                            <TouchableOpacity
                                activeOpacity={1}
                                disabled={!showTransactionsBottomSheet}
                                onPress={() => setShowTransactionsBottomSheet(false)}
                            >
                                <View
                                    {...showTransactionsBottomSheet && {pointerEvents: "none"}}
                                    {...showTransactionsBottomSheet && {
                                        style: {backgroundColor: 'transparent', opacity: 0.3}
                                    }}
                                >
                                    <View style={styles.topDashboardView}>
                                        <ImageBackground
                                            style={styles.imageCover}
                                            imageStyle={{
                                                height: hp(40),
                                                width: wp(30),
                                                resizeMode: 'stretch'
                                            }}
                                            resizeMethod={"scale"}
                                            source={DashboardBackgroundImage}>
                                            <View style={styles.tppGreetingView}>
                                                <Text
                                                    style={styles.greetingText}>Hello,</Text>
                                                <Text
                                                    style={styles.greetingNameText}>{currentUserName}</Text>
                                            </View>
                                            {
                                                (!profilePictureURI || profilePictureURI === "") ?
                                                    <Avatar
                                                        {...profilePictureURI && profilePictureURI !== "" && {
                                                            source: {
                                                                uri: profilePictureURI,
                                                                cache: 'reload'
                                                            }
                                                        }}
                                                        avatarStyle={{
                                                            resizeMode: 'cover',
                                                            borderColor: '#F2FF5D',
                                                            borderWidth: 3
                                                        }}
                                                        size={hp(15)}
                                                        rounded
                                                        title={(!profilePictureURI || profilePictureURI === "") ? currentUserTitle : undefined}
                                                        {...(!profilePictureURI || profilePictureURI === "") && {
                                                            titleStyle: [
                                                                styles.titleStyle
                                                            ]
                                                        }}
                                                        containerStyle={styles.avatarStyle}
                                                        onPress={async () => {
                                                        }}
                                                    />
                                                    :
                                                    <ExpoImage
                                                        style={styles.profileImage}
                                                        source={{
                                                            uri: profilePictureURI
                                                        }}
                                                        placeholder={MoonbeamProfilePlaceholder}
                                                        placeholderContentFit={'cover'}
                                                        contentFit={'cover'}
                                                        transition={1000}
                                                        cachePolicy={'memory-disk'}
                                                    />
                                            }
                                            <View style={styles.statisticsView}>
                                                <View style={styles.statLeftView}>
                                                    <View style={styles.statInfoViewLeft}>
                                                        <Text
                                                            style={styles.statNumberCenterLeft}>$ {lifetimeSavings.toFixed(2)}</Text>
                                                        <Text style={styles.statTitleLeft}>
                                                            Lifetime <Text
                                                            style={styles.statTitleRegular}>Savings</Text>
                                                        </Text>
                                                        <Icon name={'info'}
                                                              size={hp(3)}
                                                              color={'#F2FF5D'}
                                                              onPress={() => {
                                                                  setIsLifetimeSavingsDialog(true);
                                                                  setStatsDialogVisible(true);
                                                              }}/>
                                                    </View>
                                                </View>
                                                <View style={styles.verticalLine}/>
                                                <View style={styles.statRightView}>
                                                    <View style={styles.statInfoViewRight}>
                                                        <Text
                                                            style={styles.statNumberCenterRight}>$ {currentBalance.toFixed(2)}</Text>
                                                        <Text style={styles.statTitleRight}>
                                                            Current <Text style={styles.statTitleRegular}>Balance</Text>
                                                        </Text>
                                                        <Icon name={'info'}
                                                              size={hp(3)}
                                                              color={'#F2FF5D'}
                                                              onPress={() => {
                                                                  setIsLifetimeSavingsDialog(false);
                                                                  setStatsDialogVisible(true);
                                                              }}/>
                                                    </View>
                                                </View>
                                            </View>
                                        </ImageBackground>
                                        <CustomBanner bannerVisibilityState={bannerState.bannerVisibilityState}
                                                      bannerMessage={bannerState.bannerMessage}
                                                      bannerButtonLabel={bannerState.bannerButtonLabel}
                                                      bannerButtonLabelActionSource={bannerState.bannerButtonLabelActionSource}
                                                      //@ts-ignore
                                                      bannerArtSource={bannerState.bannerArtSource}
                                                      dismissing={bannerState.dismissing}
                                        />
                                    </View>
                                    {
                                        bannerVisible &&
                                        <View style={styles.bottomView}>
                                            <SegmentedButtons
                                                density={'small'}
                                                style={[styles.segmentedButtons]}
                                                value={segmentedValue}
                                                onValueChange={(value) => {
                                                    setSegmentedValue(value);
                                                }}
                                                buttons={[
                                                    {
                                                        value: 'cashback',
                                                        label: 'Cashback',
                                                        checkedColor: 'black',
                                                        uncheckedColor: 'white',
                                                        style: {
                                                            backgroundColor: segmentedValue === 'cashback' ? '#F2FF5D' : '#5B5A5A',
                                                            borderColor: segmentedValue === 'cashback' ? '#F2FF5D' : '#5B5A5A',
                                                        },
                                                    },
                                                    {
                                                        value: 'payouts',
                                                        label: 'Payouts',
                                                        checkedColor: 'black',
                                                        uncheckedColor: 'white',
                                                        style: {
                                                            backgroundColor: segmentedValue === 'payouts' ? '#F2FF5D' : '#5B5A5A',
                                                            borderColor: segmentedValue === 'payouts' ? '#F2FF5D' : '#5B5A5A'
                                                        }
                                                    }
                                                ]}
                                            />
                                            <View style={{
                                                height: hp(0.5),
                                                backgroundColor: '#313030'
                                            }}/>
                                            <ScrollView
                                                scrollEnabled={true}
                                                persistentScrollbar={false}
                                                showsVerticalScrollIndicator={false}
                                                keyboardShouldPersistTaps={'handled'}
                                                contentContainerStyle={styles.individualTransactionContainer}
                                            >
                                                {segmentedValue === 'cashback' ?
                                                    <List.Section>
                                                        <List.Subheader style={styles.subHeaderTitle}>
                                                            Recent Cashback
                                                        </List.Subheader>
                                                        <Divider
                                                            style={[styles.mainDivider, {backgroundColor: '#FFFFFF'}]}/>
                                                        {filterTransactions()}
                                                    </List.Section>
                                                    : <List.Section>
                                                        <List.Subheader style={styles.subHeaderTitle}>
                                                            Recent Payouts
                                                        </List.Subheader>
                                                        <Divider style={styles.mainDivider}/>
                                                        <List.Item
                                                            titleStyle={styles.emptyPayoutListItemTitle}
                                                            descriptionStyle={styles.listItemDescription}
                                                            titleNumberOfLines={1}
                                                            title={"No payouts available"}
                                                        />
                                                    </List.Section>}
                                            </ScrollView>
                                        </View>
                                    }
                                </View>
                            </TouchableOpacity>
                            {
                                showTransactionsBottomSheet &&
                                <BottomSheet
                                    handleIndicatorStyle={{backgroundColor: '#F2FF5D'}}
                                    ref={bottomSheetRef}
                                    backgroundStyle={[styles.bottomSheet, selectedTransaction && selectedTransaction.transactionIsOnline && {backgroundColor: '#5B5A5A'}]}
                                    enablePanDownToClose={true}
                                    index={showTransactionsBottomSheet ? 0 : -1}
                                    snapPoints={selectedTransaction && !selectedTransaction.transactionIsOnline ? [hp(55), hp(55)] : [hp(22), hp(22)]}
                                    onChange={(index) => {
                                        setShowTransactionsBottomSheet(index !== -1);
                                    }}
                                >
                                    {
                                        selectedTransaction &&
                                        <TransactionsBottomSheet
                                            brandName={selectedTransaction.transactionBrandName}
                                            brandImage={selectedTransaction.transactionBrandLogoUrl}
                                            {...selectedTransaction.transactionIsOnline && {
                                                transactionOnlineAddress: selectedTransaction.transactionBrandURLAddress
                                            }}
                                            {...!selectedTransaction.transactionIsOnline && {
                                                transactionStoreAddress: selectedTransaction.transactionBrandAddress
                                            }}
                                            transactionAmount={selectedTransaction.totalAmount.toFixed(2).toString()}
                                            transactionDiscountAmount={selectedTransaction.rewardAmount.toFixed(2).toString()}
                                            transactionTimestamp={selectedTransaction.timestamp.toString()}
                                            transactionStatus={selectedTransaction.transactionStatus.toString()}
                                        />
                                    }
                                </BottomSheet>
                            }
                        </SafeAreaView>
                    </>
            }
        </>
    );
};

