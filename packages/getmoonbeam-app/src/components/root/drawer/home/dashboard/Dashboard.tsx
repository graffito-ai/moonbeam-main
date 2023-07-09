import React, {useEffect, useState} from 'react';
import {Dimensions, ImageBackground, SafeAreaView, ScrollView, View} from "react-native";
import {Dialog, List, Portal, SegmentedButtons, Text} from "react-native-paper";
import {styles} from "../../../../../styles/dashboard.module";
import {useRecoilState} from "recoil";
import {currentUserInformation} from "../../../../../recoil/AuthAtom";
import * as Device from "expo-device";
import {DeviceType} from "expo-device";
import {deviceTypeState} from "../../../../../recoil/RootAtom";
import {Auth} from "aws-amplify";
import {fetchFile} from "../../../../../utils/File";
import {Spinner} from "../../../../common/Spinner";
// @ts-ignore
import DashboardBackgroundImage from "../../../../../../assets/backgrounds/dashboard-background.png";
import {profilePictureURIState} from "../../../../../recoil/AppDrawerAtom";
import * as Linking from "expo-linking";
import {Avatar, Button, Divider, Icon} from "@rneui/base";
import {commonStyles} from "../../../../../styles/common.module";

/**
 * DashboardController component. This component will be used as the dashboard for the application,
 * where the Home tab is highlighted from.
 *
 * @constructor constructor for the component.
 */
export const Dashboard = ({}) => {
    // constants used to keep track of local component state
    const [statsDialogVisible, setStatsDialogVisible] = useState(false);
    const [isReady, setIsReady] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [currentUserTitle, setCurrentUserTitle] = useState<string>("N/A");
    const [currentUserName, setCurrentUserName] = useState<string>("N/A");
    const [lifetimeSavingsDialog, setIsLifetimeSavingsDialog] = useState<boolean>(false);
    const [segmentedValue, setSegmentedValue] = useState<string>('transactions');
    // constants used to keep track of shared states
    const [deviceType, setDeviceType] = useRecoilState(deviceTypeState);
    const [userInformation,] = useRecoilState(currentUserInformation);
    const [profilePictureURI, setProfilePictureURI] = useRecoilState(profilePictureURIState);

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
            // retrieve the profile picture (if existent)
            (!profilePictureURI || profilePictureURI === "") && retrieveProfilePicture();
        }
    }, [deviceType, userInformation["given_name"], userInformation["family_name"], profilePictureURI]);

    /**
     * Function used to retrieve the new profile picture, after picking a picture through
     * the photo picker and uploading it into storage.
     */
    const retrieveProfilePicture = async (): Promise<void> => {
        try {
            // set the loader on button press
            setIsReady(false);

            // retrieve the identity id for the current user
            const userCredentials = await Auth.currentUserCredentials();

            // fetch the profile picture URI from storage and/or cache
            const [returnFlag, profilePictureURI] = await fetchFile('profile_picture.png', true,
                true, false, userCredentials["identityId"]);
            if (!returnFlag || profilePictureURI === null) {
                // release the loader on button press
                setIsReady(true);

                // for any error we just want to print them out, and not set any profile picture, and show the default avatar instead
                console.log(`Unable to retrieve new profile picture!`);
            } else {
                // release the loader on button press
                setIsReady(true);

                // update the global profile picture state
                setProfilePictureURI(profilePictureURI);
            }
        } catch (error) {
            // release the loader on button press
            setIsReady(true);

            // for any error we just want to print them out, and not set any profile picture, and show the default avatar instead
            const errorMessage = `Error while retrieving profile picture!`;
            console.log(`${errorMessage} - ${error}`);
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
                            <Dialog style={commonStyles.dialogStyle} visible={statsDialogVisible} onDismiss={() => {setStatsDialogVisible(false)}}>
                                <Dialog.Icon icon="cash" color={"#F2FF5D"} size={Dimensions.get('window').height/14}/>
                                <Dialog.Title style={commonStyles.dialogTitle}>Cashback Balances</Dialog.Title>
                                <Dialog.Content>
                                    <Text style={commonStyles.dialogParagraph}>
                                        {
                                            lifetimeSavingsDialog ?
                                                <>
                                                    Your Moonbeam <Text style={commonStyles.dialogParagraphBold}>Cashback</Text>, is split in two main categories,
                                                    <Text style={commonStyles.dialogParagraphBold}> Lifetime Savings</Text> and <Text style={commonStyles.dialogParagraphBold}>Available Balance</Text> amounts.
                                                    In order to understand how the <Text style={commonStyles.dialogParagraphBold}>Lifetime Savings</Text> category works, please note the following:{"\n\n\n"}
                                                    <Text style={commonStyles.dialogParagraphNumbered}>➊</Text> Your <Text style={commonStyles.dialogParagraphBold}>Lifetime Savings</Text> amount includes cashback already credited to your account,
                                                    as well as the one currently available.
                                                </> :
                                                <>
                                                    Your Moonbeam <Text style={commonStyles.dialogParagraphBold}>Cashback</Text>, is split in two main categories,
                                                    <Text style={commonStyles.dialogParagraphBold}> Lifetime Savings</Text> and <Text style={commonStyles.dialogParagraphBold}>Available Balance</Text> amounts.
                                                    In order to understand how the <Text style={commonStyles.dialogParagraphBold}>Available Balance</Text> category works, please note the following:{"\n\n\n"}
                                                    <Text style={commonStyles.dialogParagraphNumbered}>➊</Text> The <Text style={commonStyles.dialogParagraphBold}>Available Balance</Text> amount, includes any
                                                    pending and processed cashback, redeemed through transactions made at qualifying merchant locations (in-store or online).{"\n\n"}
                                                    <Text style={commonStyles.dialogParagraphNumbered}>➋</Text> It can take up to <Text style={commonStyles.dialogParagraphBold}>2-3 business days</Text>, for any cashback
                                                    credits, to be reflected in your linked-card's statement balance.{"\n\n"}
                                                    <Text style={commonStyles.dialogParagraphNumbered}>➌</Text> Moonbeam will automatically transfer the <Text style={commonStyles.dialogParagraphBold}>Available Balance</Text> amount, once
                                                    it reaches <Text style={commonStyles.dialogParagraphBold}>$20</Text>, in processed cashback amount.{"\n\n"}
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
                                                <Text style={styles.statNumberCenterLeft}>$ 100,000</Text>
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
                                                <Text style={styles.statNumberCenterRight}>$ 1.38</Text>
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
                            </View>
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
                                            value: 'transactions',
                                            label: 'Transactions',
                                            checkedColor: 'black',
                                            uncheckedColor: 'white',
                                            style: {
                                                backgroundColor: segmentedValue === 'transactions' ? '#F2FF5D' : '#5B5A5A',
                                                borderColor: segmentedValue === 'transactions' ? '#F2FF5D' : '#5B5A5A',
                                            }
                                        },
                                        {
                                            value: 'cashback',
                                            label: 'Cashback',
                                            checkedColor: 'black',
                                            uncheckedColor: 'white',
                                            style: {
                                                backgroundColor: segmentedValue === 'cashback' ? '#F2FF5D' : '#5B5A5A',
                                                borderColor: segmentedValue === 'cashback' ? '#F2FF5D' : '#5B5A5A'
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
                                    {segmentedValue === 'transactions' ?
                                        <List.Section>
                                            <List.Subheader style={styles.subHeaderTitle}>
                                                Recent Transactions
                                            </List.Subheader>
                                            <Divider style={[styles.mainDivider, {backgroundColor: '#FFFFFF'}]}/>
                                            <List.Item
                                                titleStyle={styles.listItemTitle}
                                                descriptionStyle={styles.listItemDescription}
                                                titleNumberOfLines={2}
                                                descriptionNumberOfLines={2}
                                                title="Oakley"
                                                description='Phoenix, AZ - 8m ago'
                                                left={() => <List.Icon color={'#F2FF5D'} icon="store" style={styles.leftItemIcon}/>}
                                                right={() =>
                                                    <View style={styles.itemRightView}>
                                                        <View style={styles.itemRightDetailsView}>
                                                            <Text style={styles.itemRightDetailTop}>+ $5.50</Text>
                                                            <Text style={styles.itemRightDetailBottom}>Pending</Text>
                                                        </View>
                                                        <View style={styles.rightItemIcon}>
                                                            <List.Icon color={'#F2FF5D'} icon="chevron-right"/>
                                                        </View>
                                                    </View>
                                                }
                                            />
                                            <Divider style={styles.divider}/>
                                            <List.Item
                                                titleStyle={styles.listItemTitle}
                                                descriptionStyle={styles.listItemDescription}
                                                titleNumberOfLines={2}
                                                descriptionNumberOfLines={2}
                                                title="Oakley"
                                                description='Phoenix, AZ - 8m ago'
                                                left={() => <List.Icon color={'#F2FF5D'} icon="store" style={styles.leftItemIcon}/>}
                                                right={() =>
                                                    <View style={styles.itemRightView}>
                                                        <View style={styles.itemRightDetailsView}>
                                                            <Text style={styles.itemRightDetailTop}>+ $5.50</Text>
                                                            <Text style={styles.itemRightDetailBottom}>Pending</Text>
                                                        </View>
                                                        <View style={styles.rightItemIcon}>
                                                            <List.Icon color={'#F2FF5D'} icon="chevron-right"/>
                                                        </View>
                                                    </View>
                                                }
                                            />
                                            <Divider style={styles.divider}/>
                                            <List.Item
                                                titleStyle={styles.listItemTitle}
                                                descriptionStyle={styles.listItemDescription}
                                                titleNumberOfLines={2}
                                                descriptionNumberOfLines={2}
                                                title="Oakley"
                                                description='Phoenix, AZ - 8m ago'
                                                left={() => <List.Icon color={'#F2FF5D'} icon="store" style={styles.leftItemIcon}/>}
                                                right={() =>
                                                    <View style={styles.itemRightView}>
                                                        <View style={styles.itemRightDetailsView}>
                                                            <Text style={styles.itemRightDetailTop}>+ $5.50</Text>
                                                            <Text style={styles.itemRightDetailBottom}>Pending</Text>
                                                        </View>
                                                        <View style={styles.rightItemIcon}>
                                                            <List.Icon color={'#F2FF5D'} icon="chevron-right"/>
                                                        </View>
                                                    </View>
                                                }
                                            />
                                            <Divider style={styles.divider}/>
                                            <List.Item
                                                titleStyle={styles.listItemTitle}
                                                descriptionStyle={styles.listItemDescription}
                                                titleNumberOfLines={2}
                                                descriptionNumberOfLines={2}
                                                title="Oakley"
                                                description='Phoenix, AZ - 8m ago'
                                                left={() => <List.Icon color={'#F2FF5D'} icon="store" style={styles.leftItemIcon}/>}
                                                right={() =>
                                                    <View style={styles.itemRightView}>
                                                        <View style={styles.itemRightDetailsView}>
                                                            <Text style={styles.itemRightDetailTop}>+ $5.50</Text>
                                                            <Text style={styles.itemRightDetailBottom}>Pending</Text>
                                                        </View>
                                                        <View style={styles.rightItemIcon}>
                                                            <List.Icon color={'#F2FF5D'} icon="chevron-right"/>
                                                        </View>
                                                    </View>
                                                }
                                            />
                                            <Divider style={styles.divider}/>
                                            <List.Item
                                                titleStyle={styles.listItemTitle}
                                                descriptionStyle={styles.listItemDescription}
                                                titleNumberOfLines={2}
                                                descriptionNumberOfLines={2}
                                                title="Oakley"
                                                description='Phoenix, AZ - 8m ago'
                                                left={() => <List.Icon color={'#F2FF5D'} icon="store" style={styles.leftItemIcon}/>}
                                                right={() =>
                                                    <View style={styles.itemRightView}>
                                                        <View style={styles.itemRightDetailsView}>
                                                            <Text style={styles.itemRightDetailTop}>+ $5.50</Text>
                                                            <Text style={styles.itemRightDetailBottom}>Pending</Text>
                                                        </View>
                                                        <View style={styles.rightItemIcon}>
                                                            <List.Icon color={'#F2FF5D'} icon="chevron-right"/>
                                                        </View>
                                                    </View>
                                                }
                                            />
                                            <Divider style={styles.divider}/>
                                            <List.Item
                                                titleStyle={styles.listItemTitle}
                                                descriptionStyle={styles.listItemDescription}
                                                titleNumberOfLines={2}
                                                descriptionNumberOfLines={2}
                                                title="Oakley"
                                                description='Phoenix, AZ - 8m ago'
                                                left={() => <List.Icon color={'#F2FF5D'} icon="store" style={styles.leftItemIcon}/>}
                                                right={() =>
                                                    <View style={styles.itemRightView}>
                                                        <View style={styles.itemRightDetailsView}>
                                                            <Text style={styles.itemRightDetailTop}>+ $5.50</Text>
                                                            <Text style={styles.itemRightDetailBottom}>Pending</Text>
                                                        </View>
                                                        <View style={styles.rightItemIcon}>
                                                            <List.Icon color={'#F2FF5D'} icon="chevron-right"/>
                                                        </View>
                                                    </View>
                                                }
                                            />
                                            <Divider style={styles.divider}/>
                                        </List.Section>
                                        : <List.Section>
                                            <List.Subheader style={styles.subHeaderTitle}>
                                                Recent Cashback
                                            </List.Subheader>
                                            <Divider style={styles.mainDivider}/>
                                            <List.Item
                                                titleStyle={styles.listItemTitle}
                                                descriptionStyle={styles.listItemDescription}
                                                titleNumberOfLines={2}
                                                descriptionNumberOfLines={2}
                                                title="Cashback Credit"
                                                description={"VISA ••••3922"}
                                                left={() => <List.Icon color={'#F2FF5D'} icon="currency-usd" style={styles.leftItemIcon}/>}
                                                right={() =>
                                                    <View style={styles.itemRightView}>
                                                        <View style={styles.itemRightDetailsView}>
                                                            <Text style={styles.itemRightDetailTop}>+ $25.98</Text>
                                                            <Text style={styles.itemRightDetailBottom}>June 2023</Text>
                                                        </View>
                                                        <View style={styles.rightItemIcon}>
                                                            <List.Icon color={'#F2FF5D'} icon="chevron-right"/>
                                                        </View>
                                                    </View>
                                                }
                                            />
                                            <Divider style={styles.divider}/>
                                        </List.Section>}
                                </ScrollView>
                            </View>
                        </SafeAreaView>
                    </>
            }
        </>
    );
};

