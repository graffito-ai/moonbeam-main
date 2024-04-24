import React, {useEffect, useState} from "react";
import {styles} from "../../../../../../../styles/roundupsDashboard.module";
import {Text, TouchableOpacity, View} from "react-native";
import {Avatar, Icon} from "@rneui/base";
import {heightPercentageToDP as hp} from "react-native-responsive-screen";
import {Image as ExpoImage} from "expo-image/build/Image";
// @ts-ignore
import MoonbeamProfilePlaceholder from "../../../../../../../../assets/art/moonbeam-profile-placeholder.png";
import {useRecoilState} from "recoil";
import {currentUserInformation} from "../../../../../../../recoil/AuthAtom";
import {drawerNavigationState} from "../../../../../../../recoil/HomeAtom";
import {profilePictureURIState} from "../../../../../../../recoil/AppDrawerAtom";
import {showRoundupTransactionBottomSheetState} from "../../../../../../../recoil/DashboardAtom";

/**
 * RoundupsDashboardTopBar component.
 *
 * @constructor constructor for the component.
 */
export const RoundupsDashboardTopBar = () => {
    // constants used to keep track of local component state
    const [currentUserTitle, setCurrentUserTitle] = useState<string>("N/A");

    // constants used to keep track of shared states
    const [showRoundupTransactionsBottomSheet, ] = useRecoilState(showRoundupTransactionBottomSheetState);
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
    }, [userInformation["given_name"], userInformation["family_name"], currentUserTitle]);

    // return the component for the RoundupsDashboardTopBar, part of the Dashboard page
    return (
        <View
            style={[
                showRoundupTransactionsBottomSheet && {pointerEvents: "none"},
                showRoundupTransactionsBottomSheet && {
                    backgroundColor: 'black', opacity: 0.75
                },
                styles.topView
            ]}>
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
    );
}
