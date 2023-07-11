import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, Image, ImageBackground, SafeAreaView, ScrollView, View} from "react-native";
import {Dialog, List, Portal, SegmentedButtons, Text} from "react-native-paper";
import {styles} from "../../../../../styles/dashboard.module";
import {useRecoilState, useRecoilValue} from "recoil";
import {currentUserInformation} from "../../../../../recoil/AuthAtom";
import * as Device from "expo-device";
import {DeviceType} from "expo-device";
import {deviceTypeState} from "../../../../../recoil/RootAtom";
import {API, graphqlOperation} from "aws-amplify";
import {Spinner} from "../../../../common/Spinner";
// @ts-ignore
import DashboardBackgroundImage from "../../../../../../assets/backgrounds/dashboard-background.png";
import {profilePictureURIState} from "../../../../../recoil/AppDrawerAtom";
import * as Linking from "expo-linking";
import {Avatar, Button, Divider, Icon} from "@rneui/base";
import {commonStyles} from "../../../../../styles/common.module";
import {CustomBanner} from "../../../../common/CustomBanner";
import {customBannerState} from "../../../../../recoil/CustomBannerAtom";
import BottomSheet from '@gorhom/bottom-sheet';
import {bottomTabShownState} from "../../../../../recoil/HomeAtom";
import {TransactionsBottomSheet} from "./transactions/TransactionsBottomSheet";
import {getTransaction, MoonbeamTransaction, TransactionsErrorType} from "@moonbeam/moonbeam-models";
import {
    sortedTransactionDataState,
    transactionalDataRetrievedState,
    transactionDataState
} from "../../../../../recoil/DashboardAtom";

/**
 * DashboardController component. This component will be used as the dashboard for the application,
 * where the Home tab is highlighted from.
 *
 * @constructor constructor for the component.
 */
export const Dashboard = ({}) => {
    // constants used to keep track of local component state
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [statsDialogVisible, setStatsDialogVisible] = useState(false);
    const [isReady, setIsReady] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [currentUserTitle, setCurrentUserTitle] = useState<string>("N/A");
    const [currentUserName, setCurrentUserName] = useState<string>("N/A");
    const [lifetimeSavingsDialog, setIsLifetimeSavingsDialog] = useState<boolean>(false);
    const [segmentedValue, setSegmentedValue] = useState<string>('cashback');
    const [showBottomSheet, setShowBottomSheet] = useState<boolean>(false);
    const bottomSheetRef = useRef(null);
    const [selectedTransaction, setSelectedTransaction] = useState<MoonbeamTransaction | null>(null);
    // constants used to keep track of shared states
    const [deviceType, setDeviceType] = useRecoilState(deviceTypeState);
    const [userInformation,] = useRecoilState(currentUserInformation);
    const [profilePictureURI,] = useRecoilState(profilePictureURIState);
    const [bannerState,] = useRecoilState(customBannerState);
    const [bannerVisible,] = useRecoilState(bannerState.bannerVisibilityState);
    const [, setBottomTabShown] = useRecoilState(bottomTabShownState);
    const [transactionData, setTransactionData] = useRecoilState(transactionDataState);
    const sortedTransactionData = useRecoilValue(sortedTransactionDataState);
    const [transactionsRetrieved, setTransactionsRetrieved] = useRecoilState(transactionalDataRetrievedState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // check and set the type of device, to be used throughout the app
        Device.getDeviceTypeAsync().then(deviceType => {
            setDeviceType(deviceType);
        });
        if (userInformation["custom:userId"]) {
            // check to see if the user information object has been populated accordingly
            if (userInformation["given_name"] && userInformation["family_name"]) {
                setCurrentUserTitle(`${Array.from(userInformation["given_name"].split(" ")[0])[0] as string}${Array.from(userInformation["family_name"].split(" ")[0])[0] as string}`);
                setCurrentUserName(`${userInformation["given_name"]} ${userInformation["family_name"]}`);
            }
            // retrieve the transactional data for the user (if not already retrieved)
            !transactionsRetrieved && retrieveTransactionalData(userInformation["custom:userId"]);
        }
        // manipulate the bottom sheet
        if (!showBottomSheet && bottomSheetRef) {
            // reset the selected transaction on bottom sheet close
            setSelectedTransaction(null);

            // @ts-ignore
            bottomSheetRef.current?.close?.();
        }
        if (showBottomSheet && bottomSheetRef) {
            // @ts-ignore
            bottomSheetRef.current?.expand?.();
        }
        // manipulate the bottom bar navigation accordingly, depending on the bottom sheet being shown or not
        if (!showBottomSheet) {
            setBottomTabShown(true);
        } else {
            setBottomTabShown(false);
        }
    }, [deviceType, userInformation["given_name"], transactionsRetrieved,
        userInformation["family_name"], userInformation["custom:userId"],
        showBottomSheet, bottomSheetRef]);

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
                        titleNumberOfLines={2}
                        descriptionNumberOfLines={2}
                        title={"No transactions available!"}
                        description=''
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
                            left={() => <Image source={{
                                uri: transaction.transactionBrandLogoUrl
                            }}
                                               resizeMethod={"scale"}
                                               resizeMode={"contain"}
                                               style={styles.leftItemIcon}/>}
                            right={() =>
                                <View style={styles.itemRightView}>
                                    <View style={styles.itemRightDetailsView}>
                                        <Text style={styles.itemRightDetailTop}>{`+ ${transaction.rewardAmount}`}</Text>
                                        <Text
                                            style={styles.itemRightDetailBottom}>{transaction.transactionStatus}</Text>
                                    </View>
                                    <View style={styles.rightItemIcon}>
                                        <List.Icon color={'#F2FF5D'} icon="chevron-right"/>
                                    </View>
                                </View>
                            }
                            onPress={() => {
                                setSelectedTransaction(sortedTransactionData.filter((filteredTransaction) => filteredTransaction.transactionId === transaction.transactionId)[0]);
                                // show the bottom sheet with the appropriate transaction details
                                setShowBottomSheet(true);
                            }}
                        />
                        <Divider style={styles.divider}/>
                    </>
                );
            });
        }
        return results;
    }

    /**
     * Function used to retrieve the individual's transactional data. This data will represent
     * all the user's transactions, from the current time, since they've created an account with
     * us.
     *
     * @param userId userID generated through previous steps during the sign-up process
     */
    const retrieveTransactionalData = async (userId: string): Promise<void> => {
        try {
            // set the loader
            setIsReady(false);

            // call the get transaction API
            const retrievedTransactionsResult = await API.graphql(graphqlOperation(getTransaction, {
                getTransactionInput: {
                    id: userId,
                    // retrieve the current date and time to filter transactions by
                    endDate: new Date().toISOString()
                }
            }));

            // retrieve the data block from the response
            // @ts-ignore
            const responseData = retrievedTransactionsResult ? retrievedTransactionsResult.data : null;

            // check if there are any errors in the returned response
            if (responseData && responseData.getTransaction.errorMessage === null) {
                // release the loader
                setIsReady(true);

                /**
                 * concatenating the incoming transactional data to the existing one and
                 * adding the user's transactions to the transactional object
                 */
                const updatedTransactionalData = transactionData.concat(responseData.getTransaction.data);
                setTransactionData(updatedTransactionalData);

                // set the retrieval flag of transactions accordingly
                setTransactionsRetrieved(true);
            } else {
                /**
                 * if there is are no transactions found for the user, then there won't be any displayed in the dashboard,
                 * since the transactionData array will be empty.
                 */
                if (responseData.getTransaction.errorType === TransactionsErrorType.NoneOrAbsent) {
                    // release the loader
                    setIsReady(true);

                    // set the retrieval flag of transactions accordingly
                    setTransactionsRetrieved(true);
                } else {
                    // release the loader
                    setIsReady(true);

                    console.log(`Unexpected error while retrieving transactional data through the API ${JSON.stringify(retrievedTransactionsResult)}`);
                    setModalVisible(true);

                    // set the retrieval flag of transactions accordingly
                    setTransactionsRetrieved(true);
                }
            }
        } catch (error) {
            // release the loader
            setIsReady(true);

            console.log(`Unexpected error while attempting to retrieve transactional data ${JSON.stringify(error)} ${error}`);
            setModalVisible(true);

            // set the retrieval flag of transactions accordingly
            setTransactionsRetrieved(true);
        }
    }

    // return the component for the Dashboard page
    return (
        <>
            {
                !isReady ?
                    <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                    :
                    <>
                        <Portal>
                            <Dialog style={commonStyles.dialogStyle} visible={modalVisible}
                                    onDismiss={() => setModalVisible(false)}>
                                <Dialog.Icon icon="alert" color={"#F2FF5D"}
                                             size={Dimensions.get('window').height / 14}/>
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
                                <Dialog.Icon icon="cash" color={"#F2FF5D"} size={Dimensions.get('window').height / 14}/>
                                <Dialog.Title style={commonStyles.dialogTitle}>Cashback Balances</Dialog.Title>
                                <Dialog.Content>
                                    <Text style={commonStyles.dialogParagraph}>
                                        {
                                            lifetimeSavingsDialog ?
                                                <>
                                                    Your Moonbeam <Text
                                                    style={commonStyles.dialogParagraphBold}>Cashback</Text>, is split
                                                    in two main categories,
                                                    <Text style={commonStyles.dialogParagraphBold}> Lifetime
                                                        Savings</Text> and <Text
                                                    style={commonStyles.dialogParagraphBold}>Available
                                                    Balance</Text> amounts.
                                                    In order to understand how the <Text
                                                    style={commonStyles.dialogParagraphBold}>Lifetime
                                                    Savings</Text> category works, please note the following:{"\n\n\n"}
                                                    <Text
                                                        style={commonStyles.dialogParagraphNumbered}>➊</Text> Your <Text
                                                    style={commonStyles.dialogParagraphBold}>Lifetime
                                                    Savings</Text> amount includes cashback already credited to your
                                                    account,
                                                    as well as the one currently available.{"\n\n"}
                                                    <Text style={commonStyles.dialogParagraphNumbered}>➋</Text> Moonbeam
                                                    transfers your cashback to the linked card, on a <Text
                                                    style={commonStyles.dialogParagraphBold}>monthly</Text> basis.
                                                </> :
                                                <>
                                                    Your Moonbeam <Text
                                                    style={commonStyles.dialogParagraphBold}>Cashback</Text>, is split
                                                    in two main categories,
                                                    <Text style={commonStyles.dialogParagraphBold}> Lifetime
                                                        Savings</Text> and <Text
                                                    style={commonStyles.dialogParagraphBold}>Available
                                                    Balance</Text> amounts.
                                                    In order to understand how the <Text
                                                    style={commonStyles.dialogParagraphBold}>Available
                                                    Balance</Text> category works, please note the following:{"\n\n\n"}
                                                    <Text
                                                        style={commonStyles.dialogParagraphNumbered}>➊</Text> The <Text
                                                    style={commonStyles.dialogParagraphBold}>Available
                                                    Balance</Text> amount, includes any
                                                    pending and processed cashback, redeemed through transactions made
                                                    at qualifying merchant locations (in-store or online).{"\n\n"}
                                                    <Text style={commonStyles.dialogParagraphNumbered}>➋</Text> It can
                                                    take up to <Text style={commonStyles.dialogParagraphBold}>2-3
                                                    business days</Text>, for any cashback
                                                    credits, to be reflected in your linked-card's statement
                                                    balance.{"\n\n"}
                                                    <Text style={commonStyles.dialogParagraphNumbered}>➌</Text> Moonbeam
                                                    will automatically transfer the <Text
                                                    style={commonStyles.dialogParagraphBold}>Available
                                                    Balance</Text> amount, once
                                                    it reaches <Text style={commonStyles.dialogParagraphBold}>$20</Text>,
                                                    in processed cashback amount.{"\n\n"}
                                                    <Text style={commonStyles.dialogParagraphNumbered}>➍</Text> Moonbeam
                                                    transfers your cashback to the linked card, on a <Text
                                                    style={commonStyles.dialogParagraphBold}>monthly</Text> basis.
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
                            <View style={styles.topDashboardView}>
                                <ImageBackground
                                    style={deviceType === DeviceType.TABLET ? styles.imageCoverTablet : styles.imageCover}
                                    imageStyle={{
                                        resizeMode: 'stretch'
                                    }}
                                    resizeMethod={"scale"}
                                    source={DashboardBackgroundImage}>
                                    <View style={styles.tppGreetingView}>
                                        <Text
                                            style={deviceType === DeviceType.TABLET ? styles.greetingTextTablet : styles.greetingText}>Hello,</Text>
                                        <Text
                                            style={deviceType === DeviceType.TABLET ? styles.greetingNameTextTablet : styles.greetingNameText}>{currentUserName}</Text>
                                    </View>
                                    <Avatar
                                        {...profilePictureURI && profilePictureURI !== "" && {
                                            source: {
                                                uri: profilePictureURI,
                                                cache: 'reload'
                                            }
                                        }
                                        }
                                        avatarStyle={{
                                            resizeMode: 'cover',
                                            borderColor: '#F2FF5D',
                                            borderWidth: 3
                                        }}
                                        size={deviceType === DeviceType.TABLET ? 200 : Dimensions.get('window').height / 8}
                                        rounded
                                        title={(!profilePictureURI || profilePictureURI === "") ? currentUserTitle : undefined}
                                        {...(!profilePictureURI || profilePictureURI === "") && {
                                            titleStyle: [
                                                styles.titleStyle, deviceType === DeviceType.TABLET ? {fontSize: 80} : {fontSize: Dimensions.get('window').width / 10}
                                            ]
                                        }}
                                        containerStyle={deviceType === DeviceType.TABLET ? styles.avatarStyleTablet : styles.avatarStyle}
                                        onPress={async () => {
                                            // go to the Profile screen
                                            await Linking.openURL(Linking.createURL(`settings/profile`));
                                        }}
                                    >
                                        <Avatar.Accessory
                                            size={deviceType == DeviceType.TABLET ? 55 : Dimensions.get('window').width / 15}
                                            style={styles.avatarAccessoryStyle}
                                            color={'#F2FF5D'}
                                            onPress={async () => {
                                                // go to the Profile screen
                                                await Linking.openURL(Linking.createURL(`settings/profile`));
                                            }}
                                        />
                                    </Avatar>
                                    <View style={styles.statisticsView}>
                                        <View style={styles.statLeftView}>
                                            <View style={styles.statInfoViewLeft}>
                                                <Text style={styles.statNumberCenterLeft}>$ 1,238.76</Text>
                                                <Text style={styles.statTitleLeft}>
                                                    Lifetime <Text style={styles.statTitleRegular}>Savings</Text>
                                                </Text>
                                                <Icon name={'info'}
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
                                                <Text style={styles.statNumberCenterRight}>$ 10.38</Text>
                                                <Text style={styles.statTitleRight}>
                                                    Available <Text style={styles.statTitleRegular}>Balance</Text>
                                                </Text>
                                                <Icon name={'info'}
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
                                                <Divider style={[styles.mainDivider, {backgroundColor: '#FFFFFF'}]}/>
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
                                                    titleNumberOfLines={2}
                                                    descriptionNumberOfLines={2}
                                                    title={"No payouts available!"}
                                                    description=''
                                                />
                                            </List.Section>}
                                    </ScrollView>
                                </View>
                            }

                            <BottomSheet
                                handleIndicatorStyle={{backgroundColor: '#F2FF5D'}}
                                ref={bottomSheetRef}
                                backgroundStyle={[styles.bottomSheet, selectedTransaction && selectedTransaction.transactionIsOnline && {backgroundColor: '#5B5A5A'}]}
                                enablePanDownToClose={true}
                                index={showBottomSheet ? 0 : -1}
                                snapPoints={selectedTransaction && !selectedTransaction.transactionIsOnline ? ['55%', '55%'] : ['23%', '23%']}
                                onChange={(index) => {
                                    setShowBottomSheet(index !== -1);
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
                                        transactionAmount={selectedTransaction.totalAmount.toString()}
                                        transactionDiscountAmount={selectedTransaction.rewardAmount.toString()}
                                        transactionTimestamp={selectedTransaction.timestamp.toString()}
                                        transactionStatus={selectedTransaction.transactionStatus.toString()}
                                    />
                                }
                            </BottomSheet>
                        </SafeAreaView>
                    </>
            }
        </>
    );
};

