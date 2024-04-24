import React, {useEffect, useState} from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RoundupsDashboardProps} from "../../../../../../../models/props/RoundupsHomeProps";
import {styles} from "../../../../../../../styles/roundupsDashboard.module";
import {RoundupsBottomDashboard} from "./RoundupsBottomDashboard";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {Avatar, Icon} from "@rneui/base";
// @ts-ignore
import MoonbeamRoundupsCashOut from "../../../../../../../../assets/moonbeam-roundups-cashout.png";
// @ts-ignore
import MoonbeamRoundupsObjectives from "../../../../../../../../assets/moonbeam-roundups-objectives.png";
// @ts-ignore
import MoonbeamRoundupsNoObjectives from "../../../../../../../../assets/moonbeam-roundups-no-objectives.png";
// @ts-ignore
import MoonbeamProfilePlaceholder from "../../../../../../../../assets/art/moonbeam-profile-placeholder.png";
import {Image as ExpoImage} from "expo-image/build/Image";
import {useRecoilState} from "recoil";
import {profilePictureURIState} from "../../../../../../../recoil/AppDrawerAtom";
import {currentUserInformation} from "../../../../../../../recoil/AuthAtom";
import {drawerNavigationState} from "../../../../../../../recoil/HomeAtom";
import { LinearGradient } from 'expo-linear-gradient';

/**
 * RoundupsDashboard component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const RoundupsDashboard = ({navigation}: RoundupsDashboardProps) => {
    // constants used to keep track of local component state
    const [currentUserTitle, setCurrentUserTitle] = useState<string>("N/A");

    // constants used to keep track of shared states
    const [userInformation,] = useRecoilState(currentUserInformation);
    const [drawerNavigation,] = useRecoilState(drawerNavigationState);
    const [profilePictureURI,] = useRecoilState(profilePictureURIState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // check to see if the user information object has been populated accordingly
        if (userInformation["given_name"] && userInformation["family_name"] && currentUserTitle === 'N/A') {
            //set the title of the user's avatar in the dashboard, based on the user's information
            setCurrentUserTitle(`${Array.from(userInformation["given_name"].split(" ")[0])[0] as string}${Array.from(userInformation["family_name"].split(" ")[0])[0] as string}`);
        }
    }, [navigation.getState(), userInformation["given_name"], userInformation["family_name"], currentUserTitle]);

    // return the component for the RoundupsDashboard page
    return (
        <>
            <SafeAreaView style={{flex: 1}}>
                <LinearGradient
                    start={{x: 1, y: 0.1}}
                    end={{x: 1, y: 0.50}}
                    colors={['#5B5A5A', '#313030']}
                    style={styles.dashboardView}>
                <View style={styles.topView}>
                    <Text
                        style={styles.savingsText}>{"Total Savings\n"}
                        <Text style={styles.savingsAmountText}> {"$ 0.00"}</Text>
                    </Text>
                    <TouchableOpacity
                        onPress={() => {
                            // ToDo: Go to the referral screen
                        }}
                        style={styles.referralButton}>
                        <Text style={styles.referralButtonText}>
                            Get $100
                        </Text>
                    </TouchableOpacity>
                    <Icon
                        style={styles.roundupAccountsIcon}
                        type={"material-community"}
                        name={"bank-outline"}
                        size={hp(3.75)}
                        color={'#FFFFFF'}
                        onPress={async () => {

                        }}
                    />
                    <View style={styles.avatarView}>
                        {
                            (!profilePictureURI || profilePictureURI === "") ?
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
                                        borderWidth: hp(0.20),
                                    }}
                                    size={hp(4)}
                                    rounded
                                    title={(!profilePictureURI || profilePictureURI === "") ? currentUserTitle : undefined}
                                    {...(!profilePictureURI || profilePictureURI === "") && {
                                        titleStyle: [
                                            styles.titleStyle
                                        ]
                                    }}
                                    containerStyle={[styles.avatarStyle, {
                                        alignSelf: 'flex-end'
                                    }]}
                                    onPress={async () => {
                                        // @ts-ignore
                                        drawerNavigation && drawerNavigation.openDrawer();
                                    }}
                                />
                                :
                                <TouchableOpacity
                                    onPress={async () => {
                                        // @ts-ignore
                                        drawerNavigation && drawerNavigation.openDrawer();
                                    }}
                                >
                                    <ExpoImage
                                        style={[styles.profileImage, {
                                            alignSelf: 'flex-end',
                                        }]}
                                        source={{
                                            uri: profilePictureURI
                                        }}
                                        placeholder={MoonbeamProfilePlaceholder}
                                        placeholderContentFit={'cover'}
                                        contentFit={'cover'}
                                        transition={1000}
                                        cachePolicy={'memory-disk'}
                                    />
                                </TouchableOpacity>
                        }
                    </View>
                </View>
                <View style={styles.roundupsTopButtonView}>
                    <TouchableOpacity
                        onPress={() => {

                        }}
                        style={styles.roundupsTopLeftButton}>
                        <Image
                            style={styles.roundupsTopButtonImage}
                            source={MoonbeamRoundupsCashOut}/>
                        <Text style={styles.roundupsTopButtonText}>
                            Transfer
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {

                        }}
                        style={styles.roundupsTopRightButton}>
                        <Image
                            style={styles.roundupsTopButtonImage}
                            source={MoonbeamRoundupsObjectives}/>
                        <Text style={styles.roundupsTopButtonText}>
                            Objectives
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={{
                    top: hp(0.5),
                    height: hp(22),
                    width: wp(100),
                    flexDirection: 'column',
                }}>
                    <Text style={{
                        fontSize: hp(2.35),
                        textAlign: 'left',
                        fontFamily: 'Changa-Medium',
                        color: '#FFFFFF',
                        alignSelf: 'flex-start',
                        left: wp(4)
                    }}>
                        Status
                    </Text>
                    <TouchableOpacity style={styles.roundupsSavingsStatusView}>
                        <Image
                            style={styles.roundupsNoObjectivesImage}
                            source={MoonbeamRoundupsNoObjectives}/>
                        <View style={styles.roundupsSavingsStatusText}>
                            <Text
                                numberOfLines={2}
                                style={styles.noRoundupObjectivesText}>
                                You don't have any Objectives set up yet!
                            </Text>
                            <TouchableOpacity
                                style={styles.objectivesGetStartedButton}
                                onPress={() => {

                                }}
                            >
                                <Text
                                    style={styles.objectivesGetStartedButtonText}>{"Get Started"}</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </View>
                <RoundupsBottomDashboard setSelectedTransaction={null}/>
                </LinearGradient>
            </SafeAreaView>
        </>
    );
};
