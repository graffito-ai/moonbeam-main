import {
    DrawerContentComponentProps,
    DrawerContentScrollView,
    DrawerItem,
    DrawerItemList
} from '@react-navigation/drawer';
import {ImageBackground, Text, View} from 'react-native';
import {Avatar, Divider} from "@rneui/base";
import React, {useEffect, useState} from "react";
import {commonStyles} from "../../styles/common.module";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {styles} from '../../styles/customDrawer.module';
import {useRecoilState} from "recoil";
import {currentUserInformation, isLoadingAppOverviewNeededState, mainRootNavigationState} from '../../recoil/AuthAtom';
// @ts-ignore
import SideBarImage from '../../../assets/art/sidebar.png';
import {profilePictureURIState} from "../../recoil/AppDrawerAtom";
import {Spinner} from "./Spinner";
import {Auth} from "aws-amplify";
import {drawerNavigationState} from "../../recoil/HomeAtom";
import {goToProfileSettingsState} from "../../recoil/Settings";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

/**
 * CustomDrawer component. This component will be used to further tailor our sidebar navigation drawer, mainly
 * used by the AppDrawer parent component.
 *
 * @param props component properties to be passed in.
 * @constructor constructor for the component.
 */
export const CustomDrawer = (props: DrawerContentComponentProps) => {
    // constants used to keep track of local component state
    const [currentUserTitle, setCurrentUserTitle] = useState<string>("N/A");
    const [currentUserName, setCurrentUserName] = useState<string>("N/A");
    const [isReady,] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    // constants used to keep track of shared states
    const [, setGoToProfileSettings] = useRecoilState(goToProfileSettingsState);
    const [drawerNavigation,] = useRecoilState(drawerNavigationState);
    const [, setIsLoadingAppOverviewNeeded] = useRecoilState(isLoadingAppOverviewNeededState);
    const [mainRootNavigation,] = useRecoilState(mainRootNavigationState);
    const [userInformation, setUserInformation] = useRecoilState(currentUserInformation);
    const [profilePictureURI,] = useRecoilState(profilePictureURIState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        if (userInformation["custom:userId"]) {
            // check to see if the user information object has been populated accordingly
            if (userInformation["given_name"] && userInformation["family_name"]) {
                //set the title of the user's avatar in the dashboard, based on the user's information
                setCurrentUserTitle(`${Array.from(userInformation["given_name"].split(" ")[0])[0] as string}${Array.from(userInformation["family_name"].split(" ")[0])[0] as string}`);
                setCurrentUserName(`${userInformation["given_name"]} ${userInformation["family_name"]}`);
            }
        }
    }, [userInformation["custom:userId"], userInformation["given_name"],
        userInformation["family_name"], profilePictureURI]);


    // return the component for the CustomDrawer component, part of the AppDrawer pages.
    return (
        <>
            {
                !isReady ?
                    <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                    :
                    <View style={{flex: 1}}>
                        <DrawerContentScrollView
                            {...props}
                            scrollEnabled={false}
                            contentContainerStyle={{backgroundColor: '#5B5A5A', flexDirection: 'column'}}
                        >
                            <ImageBackground
                                resizeMethod={"scale"}
                                imageStyle={{
                                    left: wp(40),
                                    height: hp(30),
                                    width: wp(30),
                                    resizeMode: 'stretch'
                                }}
                                source={SideBarImage}>
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
                                        // go to the Profile screen
                                        setGoToProfileSettings(true);
                                        drawerNavigation && drawerNavigation!.navigate('Settings', {});
                                    }}
                                >
                                    <Avatar.Accessory
                                        size={hp(3.5)}
                                        style={styles.avatarAccessoryStyle}
                                        color={'#F2FF5D'}
                                        onPress={async () => {
                                            // go to the Profile screen
                                            setGoToProfileSettings(true);
                                            drawerNavigation && drawerNavigation!.navigate('Settings', {});
                                        }}
                                    />
                                </Avatar>
                                <Text numberOfLines={3} textBreakStrategy={"simple"}
                                      style={[styles.userNameStyle]}>{currentUserName}</Text>
                            </ImageBackground>
                            <Divider
                                style={[commonStyles.divider]}/>
                            <View style={styles.drawerItemListView}>
                                <DrawerItemList {...props}/>
                            </View>
                        </DrawerContentScrollView>
                        <View style={styles.bottomDrawerItemListView}>
                            <Divider
                                style={[commonStyles.divider]}/>
                            {/*@ts-ignore*/}
                            <DrawerItem
                                activeBackgroundColor={'transparent'}
                                activeTintColor={'#F2FF5D'}
                                icon={() => <Icon
                                    size={hp(3)}
                                    name={'logout'}
                                    color={'#F2FF5D'}/>}
                                labelStyle={[styles.drawerItemLabel]}
                                label={'Log Out'}
                                onPress={async () => {
                                    try {
                                        // navigate to the Login Screen
                                        setIsLoadingAppOverviewNeeded(true);
                                        mainRootNavigation && mainRootNavigation!.navigate('AppOverview', {});

                                        // set the user information to an empty object
                                        setUserInformation({});

                                        // performing the Sign-Out action through Amplify
                                        await Auth.signOut();
                                    } catch (error) {
                                        console.log('error while signing out: ', error);
                                    }
                                }}>
                            </DrawerItem>
                        </View>
                    </View>
            }
        </>
    )
}
