import {Dimensions, Image, ImageBackground, SafeAreaView, ScrollView, Text, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {styles} from "../styles/homeDash.module";
import React, {useEffect, useMemo, useState} from 'react';
// @ts-ignore
import HomeDashboardLogo from '../../assets/login-logo.png';
import {Divider, IconButton, List, SegmentedButtons} from 'react-native-paper';
import * as Progress from 'react-native-progress';
import {Avatar} from '@rneui/themed';
import {commonStyles} from '../styles/common.module';
import {Auth} from "aws-amplify";
import {HomeDashProps} from "../models/HomeStackProps";

/**
 * Home component.
 */
export const HomeDash = ({navigation, route}: HomeDashProps) => {
    // state driven key-value pairs for UI related elements
    const [segmentedValue, setSegmentedValue] = useState<string>('transactions');
    const [currentUserTitle, setCurrentUserTitle] = useState<string>("N/A");

    // state driven key-value pairs for any specific data values
    const creditBalance = useMemo(() => Math.floor(Math.random() * (5000 - 2500 + 1) + 2500), []);
    const availableBalance = useMemo(() => Math.floor(Math.random() * creditBalance), [creditBalance]);
    const dashboardCircleProgress = useMemo(() => Math.round(availableBalance / creditBalance * 100) / 100, [creditBalance, availableBalance]);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        Auth.currentUserInfo().then((userInfo) => {
            const secondInitial = userInfo.attributes["name"].split(" ").length > 2 ? 2 : 1;
            setCurrentUserTitle(`${Array.from(userInfo.attributes["name"].split(" ")[0])[0] as string}${Array.from(userInfo.attributes["name"].split(" ")[secondInitial])[0] as string}`);
        });
        route.params.setCurrentScreenKey(route.key);
    }, [route]);

    /**
     * Function used to be trigger once a user presses on the `Refer` button.
     */
    const referAction = () => {
        // redirect to the referral page
        navigation.navigate('HomeReferral', {});
    }

    return (
        <SafeAreaView style={[commonStyles.rowContainer, commonStyles.androidSafeArea]}>
            <KeyboardAwareScrollView
                enableOnAndroid={true}
                scrollEnabled={true}
                persistentScrollbar={false}
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps={'handled'}
            >
                <View style={styles.topBarView}>
                    <ImageBackground
                        style={commonStyles.image}
                        imageStyle={{
                            resizeMode: 'stretch',
                            opacity: 0.6
                        }}
                        source={require('../../assets/home-top-bar-background.png')}>
                        <View style={styles.insideBarView}>
                            <View style={styles.dashboardColumnItemFirst}>
                                <Avatar
                                    size={38}
                                    rounded
                                    title={currentUserTitle}
                                    containerStyle={{backgroundColor: 'grey'}}
                                >
                                    <Avatar.Accessory onPress={() => console.log("PRESSSEd")} size={12}/>
                                </Avatar>
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
                                                        style={styles.balanceDashboardBalanceAvailable}>${availableBalance + route.params.pointValueRedeemed}
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
                </View>
                <View style={[styles.dashboardButtonView, {marginTop: Dimensions.get('window').width / 1.75}]}>
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
                <View style={{marginTop: Dimensions.get('window').height / 12}}>
                    <SegmentedButtons
                        density={'small'}
                        style={[styles.segmentedButtons]}
                        value={segmentedValue}
                        onValueChange={(value) => {
                            setSegmentedValue(value);
                        }}
                        theme={{colors: {primary: '#313030'}}}
                        buttons={[
                            {
                                value: 'transactions',
                                label: 'Transactions',
                                style: {
                                    backgroundColor: segmentedValue === 'transactions' ? '#A2B000' : '#f2f2f2',
                                    borderColor: segmentedValue === 'transactions' ? '#A2B000' : '#313030'
                                }
                            },
                            {
                                value: 'payments',
                                label: 'Payments',
                                style: {
                                    backgroundColor: segmentedValue === 'payments' ? '#A2B000' : '#f2f2f2',
                                    borderColor: segmentedValue === 'payments' ? '#A2B000' : '#313030'
                                }
                            }
                        ]}
                    />
                    <ScrollView scrollEnabled={true}
                                persistentScrollbar={false}
                                showsHorizontalScrollIndicator={false}>
                        {segmentedValue === 'transactions' ?
                            <List.Section>
                                <List.Subheader style={styles.subHeaderTitle}>
                                    Recent Transactions
                                </List.Subheader>
                                <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
                                <List.Item
                                    titleStyle={styles.dashboardItemTitle}
                                    descriptionStyle={styles.dashboardItemDescription}
                                    titleNumberOfLines={2}
                                    descriptionNumberOfLines={2}
                                    title="Oakley"
                                    description='Phoenix, AZ - 8m ago'
                                    left={() => <List.Icon color={'#2A3779'} icon="store"/>}
                                    right={() =>
                                        <View style={styles.topListItemRightView}>
                                            <View style={styles.topPriceView}>
                                                <Text style={styles.listItemPrice}>$295.50</Text>
                                                <Text style={styles.listItemDiscount}>1X | 10%</Text>
                                            </View>
                                            <View style={styles.listItemIcon}>
                                                <List.Icon color={'#2A3779'} icon="chevron-right"/>
                                            </View>
                                        </View>
                                    }
                                />
                                <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
                                <List.Item
                                    titleStyle={styles.dashboardItemTitle}
                                    descriptionStyle={styles.dashboardItemDescription}
                                    titleNumberOfLines={2}
                                    descriptionNumberOfLines={2}
                                    title="Walgreens"
                                    description='Peoria, AZ - 1d ago'
                                    left={() => <List.Icon color={'#2A3779'} icon="store"/>}
                                    right={() =>
                                        <View style={styles.topListItemRightView}>
                                            <View style={styles.topPriceView}>
                                                <Text style={styles.listItemPrice}>$32.01</Text>
                                                <Text style={styles.listItemDiscount}>1X | 0%</Text>
                                            </View>
                                            <View style={styles.listItemIcon}>
                                                <List.Icon color={'#2A3779'} icon="chevron-right"/>
                                            </View>
                                        </View>
                                    }
                                />
                                <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
                                <List.Item
                                    titleStyle={styles.dashboardItemTitle}
                                    descriptionStyle={styles.dashboardItemDescription}
                                    titleNumberOfLines={2}
                                    descriptionNumberOfLines={2}
                                    title="Samsung"
                                    description='Austin, TX - 3d ago'
                                    left={() => <List.Icon color={'#2A3779'} icon="store"/>}
                                    right={() =>
                                        <View style={styles.topListItemRightView}>
                                            <View style={styles.topPriceView}>
                                                <Text style={styles.listItemPrice}>$1022.99</Text>
                                                <Text style={styles.listItemDiscount}>1X | 10%</Text>
                                            </View>
                                            <View style={styles.listItemIcon}>
                                                <List.Icon color={'#2A3779'} icon="chevron-right"/>
                                            </View>
                                        </View>
                                    }
                                />
                                <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
                                <List.Item
                                    titleStyle={styles.dashboardItemTitle}
                                    descriptionStyle={styles.dashboardItemDescription}
                                    titleNumberOfLines={2}
                                    descriptionNumberOfLines={2}
                                    title="Nike"
                                    description='Austin, TX - 1w ago'
                                    left={() => <List.Icon color={'#2A3779'} icon="store"/>}
                                    right={() =>
                                        <View style={styles.topListItemRightView}>
                                            <View style={styles.topPriceView}>
                                                <Text style={styles.listItemPrice}>$192.00</Text>
                                                <Text style={styles.listItemDiscount}>3X | 20%</Text>
                                            </View>
                                            <View style={styles.listItemIcon}>
                                                <List.Icon color={'#2A3779'} icon="chevron-right"/>
                                            </View>
                                        </View>
                                    }
                                />
                                <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
                            </List.Section>
                            : <List.Section>
                                <List.Subheader style={styles.subHeaderTitle}>
                                    Recent Payments
                                </List.Subheader>
                                <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
                                <List.Item
                                    titleStyle={styles.dashboardItemTitle}
                                    descriptionStyle={styles.dashboardItemDescription}
                                    titleNumberOfLines={2}
                                    descriptionNumberOfLines={2}
                                    title="AutoPay"
                                    description='Bank of America ****2975 - 02/10/2023'
                                    left={() => <List.Icon color={'#2A3779'} icon="cash"/>}
                                    right={() =>
                                        <View style={styles.topPaymentView}>
                                            <Text style={styles.listItemPaymentAmount}>$500.00</Text>
                                            <List.Icon color={'#2A3779'} icon="chevron-right"/>
                                        </View>
                                    }
                                />
                                <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
                                <List.Item
                                    titleStyle={styles.dashboardItemTitle}
                                    descriptionStyle={styles.dashboardItemDescription}
                                    titleNumberOfLines={2}
                                    descriptionNumberOfLines={2}
                                    title="AutoPay"
                                    description='Wells Fargo ****5133 - 01/10/2023'
                                    left={() => <List.Icon color={'#2A3779'} icon="cash"/>}
                                    right={() =>
                                        <View style={styles.topPaymentView}>
                                            <Text style={styles.listItemPaymentAmount}>$500.00</Text>
                                            <List.Icon color={'#2A3779'} icon="chevron-right"/>
                                        </View>
                                    }
                                />
                                <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
                                <List.Item
                                    titleStyle={styles.dashboardItemTitle}
                                    descriptionStyle={styles.dashboardItemDescription}
                                    titleNumberOfLines={2}
                                    descriptionNumberOfLines={2}
                                    title="Regular Payment"
                                    description='Bank of America ****2975 - 01/05/2023'
                                    left={() => <List.Icon color={'#2A3779'} icon="cash"/>}
                                    right={() =>
                                        <View style={styles.topPaymentView}>
                                            <Text style={styles.listItemPaymentAmount}>$150.00</Text>
                                            <List.Icon color={'#2A3779'} icon="chevron-right"/>
                                        </View>
                                    }
                                />
                                <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
                                <List.Item
                                    titleStyle={styles.dashboardItemTitle}
                                    descriptionStyle={styles.dashboardItemDescription}
                                    titleNumberOfLines={2}
                                    descriptionNumberOfLines={2}
                                    title="AutoPay"
                                    description='Bank of America ****2975 - 12/10/2023'
                                    left={() => <List.Icon color={'#2A3779'} icon="cash"/>}
                                    right={() =>
                                        <View style={styles.topPaymentView}>
                                            <Text style={styles.listItemPaymentAmount}>$500.00</Text>
                                            <List.Icon color={'#2A3779'} icon="chevron-right"/>
                                        </View>
                                    }
                                />
                                <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
                            </List.Section>}
                    </ScrollView>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}
