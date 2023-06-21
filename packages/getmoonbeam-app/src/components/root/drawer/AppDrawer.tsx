import React, {useEffect, useState} from 'react';
import {createDrawerNavigator} from "@react-navigation/drawer";
import {NavigationContainer} from "@react-navigation/native";
import {AppDrawerProps} from "../../../models/props/AuthenticationProps";
import {AppDrawerStackParamList} from "../../../models/props/AppDrawerProps";
import {CustomDrawer} from "../../common/CustomDrawer";
import {Animated, Dimensions, Text} from "react-native";
import {useRecoilState} from "recoil";
import {appDrawerHeaderShownState, cardLinkingStatusState, customBannerShown} from "../../../recoil/AppDrawerAtom";
import {Home} from "./home/Home";
import {Ionicons} from "@expo/vector-icons";
import * as Device from "expo-device";
import {DeviceType} from "expo-device";
import {deviceTypeState} from "../../../recoil/RootAtom";
import {
    getMilitaryVerificationStatus,
    MilitaryVerificationErrorType,
    MilitaryVerificationStatusType,
    updatedMilitaryVerificationStatus,
    UpdateMilitaryVerificationResponse
} from "@moonbeam/moonbeam-models";
import {API, graphqlOperation} from "aws-amplify";
import {Observable} from "zen-observable-ts";
import {currentUserInformation} from "../../../recoil/AuthAtom";
import {Spinner} from "../../common/Spinner";
import {IconButton, Modal, Portal} from "react-native-paper";
import {commonStyles} from "../../../styles/common.module";
import {AppWall} from "./home/wall/AppWall";
import {getCardLink} from "@moonbeam/moonbeam-models/lib";
import {customBannerState} from "../../../recoil/CustomBannerAtom";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Image = Animated.Image;

/**
 * AppDrawer component.
 *
 * @constructor constructor for the component
 */
export const AppDrawer = ({}: AppDrawerProps) => {
    // constants used to keep track of local component state
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [isReady, setIsReady] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [militaryStatusUpdatesSubscription, setMilitaryStatusUpdatesSubscription] = useState<ZenObservable.Subscription | null>(null);
    const [militaryStatusUpdatesSubscribed, setMilitaryStatusUpdatesSubscribed] = useState<boolean>(false);
    // constants used to keep track of shared states
    const [userInformation, setUserInformation] = useRecoilState(currentUserInformation);
    const [drawerHeaderShown,] = useRecoilState(appDrawerHeaderShownState);
    const [deviceType, setDeviceType] = useRecoilState(deviceTypeState);
    const [cardLinkingStatus, setCardLinkingStatus] = useRecoilState(cardLinkingStatusState);
    const [, setBannerState] = useRecoilState(customBannerState);
    const [, setBannerShown] = useRecoilState(customBannerShown);

    /**
     * create a drawer navigator, to be used for our sidebar navigation, which is the main driving
     * navigation of our application.
     */
    const ApplicationDrawer = createDrawerNavigator<AppDrawerStackParamList>();

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
        })
        // subscribe to receiving military status updates
        if (!militaryStatusUpdatesSubscribed && userInformation && userInformation["custom:userId"]) {
            setMilitaryStatusUpdatesSubscribed(true);
            subscribeToMilitaryStatusUpdates(userInformation["custom:userId"]);
        }
        // retrieve an application wall accordingly (if needed)
        !userInformation["militaryStatus"] && retrieveMilitaryVerification(userInformation["custom:userId"]);
        // retrieve a custom banner accordingly (if needed)
        !cardLinkingStatus && userInformation["militaryStatus"] && !userInformation["linkedCard"]
        && userInformation["militaryStatus"] === MilitaryVerificationStatusType.Verified
        && retrieveLinkedCard(userInformation["custom:userId"]);
    }, [militaryStatusUpdatesSubscription, userInformation, cardLinkingStatus]);


    /**
     * Function used to retrieve an individual's card linked object.
     *
     * @param userId userID generated through the previous steps during the sign-up process
     */
    const retrieveLinkedCard = async (userId: string): Promise<void> => {
        try {
            // set the loader
            setIsReady(false);

            // call the internal card linking status API
            const retrievedCardLinkingResult = await API.graphql(graphqlOperation(getCardLink, {
                getCardLinkInput: {
                    id: userId
                }
            }));

            // retrieve the data block from the response
            // @ts-ignore
            const responseData = retrievedCardLinkingResult ? retrievedCardLinkingResult.data : null;

            // check if there are any errors in the returned response
            if (responseData && responseData.getCardLink.errorMessage === null) {
                // release the loader
                setIsReady(true);

                /**
                 * if there are no linked cards for an existing object, then display the banner accordingly.
                 * Whenever a new card is linked successfully, then the status of the card linking will be changed,
                 * and thus, the banner will be hidden.
                 */
                if (responseData.getCardLink.data.cards.length === 0) {
                    // adding the card linking status accordingly
                    setCardLinkingStatus(false);

                    // set the banner state accordingly
                    setBannerState({
                        bannerVisibilityState: cardLinkingStatusState,
                        bannerMessage: "You currently do not have a linked card to your Moonbeam account. Get started now!",
                        bannerButtonLabel: "Link Now",
                        bannerButtonLabelActionSource: "",
                        bannerArtSource: require('../../../../assets/art/moonbeam-card-linking.png'),
                        dismissing: false
                    });
                    setBannerShown(true);

                    // adding the linked card object to the user information object
                    setUserInformation({
                        ...userInformation,
                        linkedCard: responseData.getCardLink.data
                    });
                } else {
                    // adding the card linking status accordingly
                    setCardLinkingStatus(true);

                    // set the banner state accordingly
                    setBannerState({
                        bannerVisibilityState: cardLinkingStatusState,
                        bannerMessage: "",
                        bannerButtonLabel: "",
                        bannerButtonLabelActionSource: "",
                        bannerArtSource: require('../../../../assets/art/moonbeam-card-linking.png'),
                        dismissing: false
                    });
                    setBannerShown(false);

                    // adding the linked card object to the user information object
                    setUserInformation({
                        ...userInformation,
                        linkedCard: responseData.getCardLink.data
                    });
                }
            } else {
                // release the loader
                setIsReady(true);

                /**
                 * if there is no card linking object retrieved for the user id, then display the banner accordingly.
                 * Whenever a new card is linked successfully, then the status of the card linking will be changed, and thus,
                 * the banner will be hidden.
                 */
                if (responseData.getCardLink.errorType === MilitaryVerificationErrorType.NoneOrAbsent) {
                    // adding the card linking status accordingly
                    setCardLinkingStatus(false);

                    // set the banner state accordingly
                    setBannerState({
                        bannerVisibilityState: cardLinkingStatusState,
                        bannerMessage: "You currently do not have a linked card to your Moonbeam account. Get started now!",
                        bannerButtonLabel: "Link Now",
                        bannerButtonLabelActionSource: "",
                        bannerArtSource: require('../../../../assets/art/moonbeam-card-linking.png'),
                        dismissing: false
                    });
                    setBannerShown(true);
                } else {
                    console.log(`Unexpected error while retrieving the card linking through the API ${JSON.stringify(retrievedCardLinkingResult)}`);
                    setModalVisible(true);
                }
            }
        } catch (error) {
            // release the loader
            setIsReady(true);

            console.log(`Unexpected error while attempting to retrieve the card linking object ${JSON.stringify(error)} ${error}`);
            setModalVisible(true);
        }
    }

    /**
     * Function used to retrieve the individual's eligibility by checking their
     * military verification status.
     *
     * @param userId userID generated through previous steps during the sign-up process
     */
    const retrieveMilitaryVerification = async (userId: string): Promise<void> => {
        try {
            // set the loader
            setIsReady(false);

            // call the internal military verification status API
            const retrievedMilitaryVerificationResult = await API.graphql(graphqlOperation(getMilitaryVerificationStatus, {
                getMilitaryVerificationInput: {
                    id: userId
                }
            }));

            // retrieve the data block from the response
            // @ts-ignore
            const responseData = retrievedMilitaryVerificationResult ? retrievedMilitaryVerificationResult.data : null;

            // check if there are any errors in the returned response
            if (responseData && responseData.getMilitaryVerificationStatus.errorMessage === null) {
                // release the loader
                setIsReady(true);

                // adding the military status to the user information object
                setUserInformation({
                    ...userInformation,
                    militaryStatus: responseData.getMilitaryVerificationStatus.data.militaryVerificationStatus
                });
            } else {
                /**
                 * if there is no military object found for the passed in user id, instead of showing the error modal, set the status in
                 * the user information object to an unknown status, which then triggers the application wall accordingly
                 * in the useEffect() method above.
                 */
                if (responseData.getMilitaryVerificationStatus.errorType === MilitaryVerificationErrorType.NoneOrAbsent) {
                    // release the loader
                    setIsReady(true);

                    // adding the military status to the user information object
                    setUserInformation({
                        ...userInformation,
                        militaryStatus: 'UNKNOWN'
                    });
                } else {
                    // release the loader
                    setIsReady(true);

                    console.log(`Unexpected error while retrieving the military verification status through the API ${JSON.stringify(retrievedMilitaryVerificationResult)}`);
                    setModalVisible(true);
                }
            }
        } catch (error) {
            // release the loader
            setIsReady(true);

            console.log(`Unexpected error while attempting to retrieve the military verification object ${JSON.stringify(error)} ${error}`);
            setModalVisible(true);
        }
    }

    /**
     * Function used to start subscribing to any military status updates, made through the
     * "updateMilitaryVerificationStatus" mutation, for a specific user id.
     *
     * @param userId userID generated through previous steps during the sign-up process
     * @return a {@link Promise} of a {@link Boolean} representing a flag indicating whether the subscription
     * was successful or not.
     */
    const subscribeToMilitaryStatusUpdates = (userId: string): void => {
        try {
            // set the loader
            setIsReady(false);

            const militaryStatusUpdates = API.graphql(graphqlOperation(updatedMilitaryVerificationStatus, {id: userId})) as unknown as Observable<any>;
            // @ts-ignore
            setMilitaryStatusUpdatesSubscription(militaryStatusUpdates.subscribe({
                // function triggering on the next military verification status update
                next: ({value}) => {
                    // check to ensure that there is a value and a valid data block to parse the message from
                    if (value && value.data && value.data.updatedMilitaryVerificationStatus) {
                        // parse the military status data from the subscription message received
                        const messageData: UpdateMilitaryVerificationResponse = value.data.updatedMilitaryVerificationStatus;

                        // adding the military status to the user information object
                        setUserInformation({
                            ...userInformation,
                            militaryStatus: messageData.militaryVerificationStatus
                        });
                    } else {
                        console.log(`Unexpected error while parsing subscription message for military status update ${JSON.stringify(value)}`);
                        setModalVisible(true);
                    }
                },
                // function triggering in case there are any errors
                error: (error) => {
                    console.log(`Unexpected error while subscribing to military status updates ${JSON.stringify(error)} ${error}`);
                    setModalVisible(true);
                }
            }));

            // release the loader
            setIsReady(true);
        } catch (error) {
            // release the loader
            setIsReady(true);

            console.log(`Unexpected error while building a subscription to observe military status updates ${JSON.stringify(error)} ${error}`);
            setModalVisible(true);
        }
    }

    // return the component for the AppDrawer page
    return (
        <>
            {
                !isReady ?
                    <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                    :
                    <>
                        <Portal>
                            <Modal dismissable={false} visible={modalVisible} onDismiss={() => setModalVisible(false)}
                                   contentContainerStyle={commonStyles.modalContainer}>
                                <Text
                                    style={commonStyles.modalParagraph}>{`Unexpected error while loading application!`}</Text>
                            </Modal>
                        </Portal>
                        <NavigationContainer independent={true}>
                            <ApplicationDrawer.Navigator
                                drawerContent={
                                    props =>
                                        <CustomDrawer {...props} />
                                }
                                initialRouteName={"Home"}
                                screenOptions={({ navigation }) => ({
                                    headerLeft: () => <IconButton icon={'menu'} iconColor={'#FFFFFF'} size={30} onPress={navigation.toggleDrawer} />,
                                    headerTitle: () =>
                                        <Image  resizeMode={"contain"}
                                                style={{alignSelf: 'center', width: Dimensions.get('window').width/12, height: Dimensions.get('window').height/12}}
                                                source={require('../../../../assets/moonbeam-navigation-logo.png')}
                                        />,
                                    headerStyle: {
                                        backgroundColor: '#313030'
                                    },
                                    drawerLabelStyle: {
                                        fontFamily: 'Raleway-Medium',
                                        fontSize: deviceType === DeviceType.TABLET ? Dimensions.get('window').width / 35 : Dimensions.get('window').width / 25
                                    },
                                    drawerActiveBackgroundColor: 'transparent',
                                    drawerActiveTintColor: '#F2FF5D',
                                    drawerInactiveTintColor: 'white',
                                    swipeEnabled: false,
                                    drawerStyle: {
                                        width: deviceType === DeviceType.TABLET ? Dimensions.get('window').width / 2 : Dimensions.get('window').width / 1.5,
                                        backgroundColor: '#5B5A5A'
                                    }
                                })}
                            >
                                <ApplicationDrawer.Screen
                                    name={"Home"}
                                    component={Home}
                                    options={{
                                        swipeEnabled: true,
                                        drawerItemStyle: {marginBottom: deviceType === DeviceType.TABLET ? 20 : 0},
                                        drawerIcon: () => (
                                            <Icon
                                                size={deviceType === DeviceType.TABLET ? Dimensions.get('window').width / 25 : Dimensions.get('window').width / 15}
                                                name={'home-variant-outline'} color={'#F2FF5D'}/>
                                        ),
                                        headerShown: drawerHeaderShown
                                    }}
                                    initialParams={{}}
                                />
                                <ApplicationDrawer.Screen
                                    name={"Documents"}
                                    component={() => <></>}
                                    initialParams={{}}
                                    options={{
                                        swipeEnabled: true,
                                        drawerItemStyle: {marginBottom: deviceType === DeviceType.TABLET ? 20 : 0},
                                        drawerIcon: () => (
                                            <Icon
                                                size={deviceType === DeviceType.TABLET ? Dimensions.get('window').width / 25 : Dimensions.get('window').width / 15}
                                                name={'file-document-multiple-outline'} color={'#F2FF5D'}/>
                                        ),
                                        headerShown: drawerHeaderShown
                                    }}
                                />
                                <ApplicationDrawer.Screen
                                    name={"Settings"}
                                    component={() => <></>}
                                    options={{
                                        swipeEnabled: true,
                                        drawerItemStyle: {marginBottom: deviceType === DeviceType.TABLET ? 20 : 0},
                                        drawerIcon: () => (
                                            <Ionicons
                                                size={deviceType === DeviceType.TABLET ? Dimensions.get('window').width / 25 : Dimensions.get('window').width / 15}
                                                name={'settings-outline'} color={'#F2FF5D'}/>
                                        ),
                                        headerShown: drawerHeaderShown
                                    }}
                                    initialParams={{}}
                                />
                                <ApplicationDrawer.Screen
                                    name={"Support"}
                                    component={() => <></>}
                                    initialParams={{}}
                                    options={{
                                        swipeEnabled: true,
                                        drawerItemStyle: {marginBottom: deviceType === DeviceType.TABLET ? 20 : 0},
                                        drawerIcon: () => (
                                            <Icon
                                                size={deviceType === DeviceType.TABLET ? Dimensions.get('window').width / 25 : Dimensions.get('window').width / 15}
                                                name={'help-circle-outline'} color={'#F2FF5D'}/>
                                        ),
                                        headerShown: drawerHeaderShown
                                    }}
                                />
                                {
                                    userInformation["militaryStatus"] !== MilitaryVerificationStatusType.Verified &&
                                    <ApplicationDrawer.Screen
                                        name={"AppWall"}
                                        component={AppWall}
                                        initialParams={{}}
                                        options={{
                                            swipeEnabled: false,
                                            drawerItemStyle: {marginBottom: deviceType === DeviceType.TABLET ? 20 : 0},
                                            drawerIcon: () => (
                                                <Icon
                                                    size={deviceType === DeviceType.TABLET ? Dimensions.get('window').width / 25 : Dimensions.get('window').width / 15}
                                                    name={'wall'} color={'#F2FF5D'}/>
                                            ),
                                            header: () => {
                                                return (<></>)
                                            },
                                            headerShown: false
                                        }}
                                    />
                                }
                            </ApplicationDrawer.Navigator>
                        </NavigationContainer>
                    </>
            }
        </>
    );
};
