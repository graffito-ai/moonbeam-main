import {Dimensions, SafeAreaView, ScrollView, Text, View} from 'react-native';
import {styles} from "../styles/homeDash.module";
import React, {useEffect, useState} from 'react';
import {Divider, List, SegmentedButtons} from 'react-native-paper';
import {commonStyles} from '../styles/common.module';
import {HomeDashProps} from "../models/HomeStackProps";

/**
 * HomeDash component.
 */
export const HomeDash = ({route}: HomeDashProps) => {
    // state driven key-value pairs for UI related elements
    const [segmentedValue, setSegmentedValue] = useState<string>('transactions');

    // state driven key-value pairs for any specific data values

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        route.params.setCurrentScreenKey!(route.key);
    }, [route.name]);

    // return the component for the HomeDash component
    return (
        <SafeAreaView style={[commonStyles.rowContainer, commonStyles.androidSafeArea]}>
            <View style={styles.listItemView}>
                <View>
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
                </View>
                <ScrollView
                    scrollEnabled={true}
                    persistentScrollbar={false}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps={'handled'}
                >
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
        </SafeAreaView>
    );
}
