import React, {useEffect, useMemo} from 'react';
import {NativeStackHeaderProps} from "@react-navigation/native-stack";
import {commonStyles} from "../../styles/common.module";
import {styles} from '../../styles/navBar.module';
import {Dimensions, Image, ImageBackground, View} from "react-native";
import {Text} from "react-native-paper";
import * as Progress from 'react-native-progress';
// @ts-ignore
import HomeDashboardLogo from "../../../assets/login-logo.png";
import {IconButton} from "react-native-paper/";
import {HomeStackParamList} from "../../models/HomeStackProps";
import Icon from "react-native-vector-icons/Ionicons";

/**
 * NavBar component.
 */
export const Navbar = (props: NativeStackHeaderProps & (HomeStackParamList["HomeDash"])) => {
    // state driven key-value pairs for any specific data values
    const creditBalance = useMemo(() => Math.floor(Math.random() * (5000 - 2500 + 1) + 2500), []);
    const availableBalance = useMemo(() => Math.floor(Math.random() * creditBalance), [creditBalance]);
    const dashboardCircleProgress = useMemo(() => Math.round(availableBalance / creditBalance * 100) / 100, [creditBalance, availableBalance]);

    /**
     * Function used to be trigger once a user presses on the `Refer` button.
     */
    const referAction = () => {
        // redirect to the referral page
        props.navigation.navigate('HomeReferral', {currentUserInformation: props.currentUserInformation!});
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

    // return the component for the NavBar component
    return (
        <View>
            {props.route.name !== 'HomeDash' ?
                <View style={commonStyles.topNavbarView}>
                    <ImageBackground
                        imageStyle={{
                            resizeMode: 'stretch',
                            opacity: 0.6,
                            alignSelf: 'center'
                        }}
                        source={require('../../../assets/top-bar-background.png')}>
                        <View style={commonStyles.insideNavbarBarView}>
                            <Text style={commonStyles.insideNavbarBarText}>
                                {props.options.headerTitle}
                            </Text>
                        </View>
                    </ImageBackground>
                </View> :
                <View style={styles.topDashboardView}>
                    <ImageBackground
                        imageStyle={{
                            resizeMode: 'stretch',
                            opacity: 0.6,
                            alignSelf: 'center'
                        }}
                        source={require('../../../assets/home-top-bar-background.png')}>
                        <View style={styles.insideDashboardView}>
                            <View style={styles.dashboardColumnItemFirst}>
                                <Icon size={28} name={'menu'} color={'#2A3779'} onPress={() => {
                                    props.setIsDrawerOpen !== undefined && props.setIsDrawerOpen(true);
                                }}/>
                            </View>
                            <View style={styles.dashboardColumnItemMiddle}>
                                <Progress.Circle
                                    direction={"counter-clockwise"}
                                    size={Dimensions.get('window').width / 1.75}
                                    strokeCap={"butt"}
                                    thickness={Dimensions.get('window').width / 40}
                                    progress={dashboardCircleProgress}
                                    color={"#2A3779"}
                                    showsText={true}
                                    formatText={() => {
                                        return (
                                            <View>
                                                <View style={styles.dashboardBalanceTopView}>
                                                    <Text style={styles.balanceDashboardTitle}>Credit</Text>
                                                    <Text
                                                        style={styles.balanceDashboardBalanceTotal}>${creditBalance}</Text>
                                                </View>
                                                <View>
                                                    <Image source={HomeDashboardLogo} style={styles.homeDashboardLogo}/>
                                                </View>
                                                <View>
                                                    <Text
                                                        style={styles.balanceDashboardBalanceAvailable}>${availableBalance + props.pointValueRedeemed!}
                                                        <Text
                                                            style={styles.balanceDashboardBalanceAvailableText}> Available</Text></Text>
                                                </View>
                                            </View>
                                        )
                                    }}
                                />
                            </View>
                            <View style={styles.dashboardColumnItemLast}>
                                <IconButton
                                    icon="bell"
                                    iconColor={"#A2B000"}
                                    size={30}
                                    onPress={() => console.log('Notifications Pressed')}
                                />
                            </View>
                        </View>
                    </ImageBackground>
                    <View style={[styles.dashboardButtonView, {marginTop: Dimensions.get('window').width / 6.75}]}>
                        <View style={styles.dashboardButtonLeft}>
                            <IconButton
                                mode={'contained-tonal'}
                                containerColor={'#DDDDDD'}
                                icon="credit-card"
                                iconColor={'#A2B000'}
                                size={40}
                                onPress={() => console.log('Pressed')}
                            />
                            <Text style={styles.dashboardButtonText}>Pay</Text>
                        </View>
                        {/*divider for buttons, spacing them out*/}
                        <View style={{width: 50}}></View>
                        <View style={styles.dashboardButtonRight}>
                            <IconButton
                                mode={'contained-tonal'}
                                containerColor={'#DDDDDD'}
                                icon="account-cash"
                                iconColor={'#A2B000'}
                                size={40}
                                onPress={() => referAction()}
                            />
                            <Text style={styles.dashboardButtonText}>Refer</Text>
                        </View>
                    </View>
                </View>
            }
        </View>
    );
};
