import 'react-native-get-random-values';
import React, {useEffect} from "react";
import {Dimensions, Image, SafeAreaView, ScrollView, Text, View} from "react-native";
import {commonStyles} from "../../../styles/common.module";
import {FAQProps} from '../../../models/SupportStackProps';
import {Divider, List} from "react-native-paper";
import {styles} from "../../../styles/faq.module";

/**
 * FAQ component.
 */
export const FAQ = ({route}: FAQProps) => {
    // state driven key-value pairs for UI related elements

    // state driven key-value pairs for any specific data values

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        route.params.setIsDrawerHeaderShown(false);
    }, [route]);

    // return the component for the FAQ page
    return (
        <SafeAreaView style={[styles.rowContainer, styles.androidSafeArea]}>
            <ScrollView
                scrollEnabled={true}
                keyboardShouldPersistTaps={'handled'}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.mainView]}>
                    <View style={styles.titleView}>
                        <Text style={styles.mainTitle}>FAQ Center</Text>
                    </View>
                    <View style={styles.content}>
                        <List.Section style={styles.listSectionView}>
                            <List.Accordion
                                style={styles.faqAccordionStyle}
                                titleStyle={styles.faqAccordionTitle}
                                titleNumberOfLines={2}
                                descriptionNumberOfLines={5}
                                title="Benefits and Perks"
                                left={() =>
                                    <List.Icon color={'#2A3779'} icon="information-outline"/>}>
                                <List.Item
                                    style={styles.faqItemStyle}
                                    titleStyle={styles.faqItemTitle}
                                    descriptionStyle={styles.faqItemDetails}
                                    titleNumberOfLines={2}
                                    descriptionNumberOfLines={10}
                                    title="• Discounts"
                                    description={"The Alpha card currently accounts for discounts at the point of sale. The amount for each discount applied, depends on what our merchant partners offer." +
                                        " For more information on our partners, visit our Shopping Center."}/>
                                <List.Item
                                    style={styles.faqItemStyle}
                                    titleStyle={styles.faqItemTitle}
                                    descriptionStyle={styles.faqItemDetails}
                                    titleNumberOfLines={2}
                                    descriptionNumberOfLines={10}
                                    title="• Rewards"
                                    description={'You earn different rewards, based on the shopping categories that your card purchases fit into, as follows:\n\n- 7x on subscriptions\n- 5x Travel & Dining\n- 3.5x Uniforms & Commissary\n- 3x Grocery & Clothing\n- 1x Everything Else'}/>
                                <List.Item
                                    style={styles.faqItemStyle}
                                    titleStyle={styles.faqItemTitle}
                                    descriptionStyle={styles.faqItemDetails}
                                    titleNumberOfLines={2}
                                    descriptionNumberOfLines={10}
                                    title="• Rewards Redemption"
                                    description={'You can redeem your rewards as cash back.'}/>
                            </List.Accordion>
                            <Divider
                                style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <List.Accordion
                                style={styles.faqAccordionStyle}
                                titleStyle={styles.faqAccordionTitle}
                                titleNumberOfLines={2}
                                descriptionNumberOfLines={5}
                                title="Contact Information"
                                left={() =>
                                    <List.Icon color={'#2A3779'} icon="information-outline"/>}>
                                <List.Item
                                    style={styles.faqItemStyle}
                                    titleStyle={styles.faqItemTitle}
                                    descriptionStyle={styles.faqItemDetails}
                                    titleNumberOfLines={2}
                                    descriptionNumberOfLines={10}
                                    title="• Support"
                                    description={"You can get in contact with one of our team members by messaging us."}/>
                            </List.Accordion>
                            <Divider
                                style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <List.Accordion
                                style={styles.faqAccordionStyle}
                                titleStyle={styles.faqAccordionTitle}
                                titleNumberOfLines={2}
                                descriptionNumberOfLines={5}
                                title="Credit Limits"
                                left={() =>
                                    <List.Icon color={'#2A3779'} icon="information-outline"/>}>
                                <List.Item
                                    style={styles.faqItemStyle}
                                    titleStyle={styles.faqItemTitle}
                                    descriptionStyle={styles.faqItemDetails}
                                    titleNumberOfLines={2}
                                    descriptionNumberOfLines={10}
                                    title="• Credit Limit Increases"
                                    description={"Your account will reviewed for limit increases periodically based on your payment history and income. Upon an increase, you will get a notification and be prompted to the new terms of your Alpha card."}/>
                            </List.Accordion>
                            <Divider
                                style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <List.Accordion
                                style={styles.faqAccordionStyle}
                                titleStyle={styles.faqAccordionTitle}
                                titleNumberOfLines={2}
                                descriptionNumberOfLines={5}
                                title="Credit Score"
                                left={() =>
                                    <List.Icon color={'#2A3779'} icon="information-outline"/>}>
                                <List.Item
                                    style={styles.faqItemStyle}
                                    titleStyle={styles.faqItemTitle}
                                    descriptionStyle={styles.faqItemDetails}
                                    titleNumberOfLines={2}
                                    descriptionNumberOfLines={10}
                                    title="• Credit Reporting"
                                    description={"Moonbeam will report to all three major bureaus:\n\n- TransUnion\n- Equifax\n- Experian"}/>
                            </List.Accordion>
                            <Divider
                                style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <List.Accordion
                                onPress={() => {

                                }}
                                style={styles.faqAccordionStyle}
                                titleStyle={styles.faqItemTitleFaceID}
                                titleNumberOfLines={2}
                                descriptionNumberOfLines={5}
                                title="Lost or Stolen Card"
                                left={() =>
                                    <List.Icon style={{bottom: '3%'}} color={'#2A3779'} icon="information-outline"/>}
                                right={() =>
                                    <View style={styles.faqItemRightView}>
                                        <Image style={styles.faqItemRightFaceID}
                                               source={require('../../../../assets/face-id.png')}/>
                                        <List.Icon icon="chevron-right"/>
                                    </View>
                                }>
                            </List.Accordion>
                            <Divider
                                style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <List.Accordion
                                style={styles.faqAccordionStyle}
                                titleStyle={styles.faqAccordionTitle}
                                titleNumberOfLines={2}
                                descriptionNumberOfLines={5}
                                title="Payments"
                                left={() =>
                                    <List.Icon color={'#2A3779'} icon="information-outline"/>}>
                                <List.Item
                                    style={styles.faqItemStyle}
                                    titleStyle={styles.faqItemTitle}
                                    descriptionStyle={styles.faqItemDetails}
                                    titleNumberOfLines={2}
                                    descriptionNumberOfLines={10}
                                    title="• Bank Accounts"
                                    description={"You can set up the bank accounts, via which you can set-up automatic, and/or one-time payments towards your Alpha card."}/>
                                <List.Item
                                    style={styles.faqItemStyle}
                                    titleStyle={styles.faqItemTitle}
                                    descriptionStyle={styles.faqItemDetails}
                                    titleNumberOfLines={2}
                                    descriptionNumberOfLines={10}
                                    title="• Payment Frequency"
                                    description={"At the moment, you can make one-time payments at any time, however, your automatic payments can be set up either on a daily and/or bi-monthly cadence."}/>
                            </List.Accordion>
                            <Divider
                                style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <List.Accordion
                                style={styles.faqAccordionStyle}
                                titleStyle={styles.faqAccordionTitle}
                                titleNumberOfLines={2}
                                descriptionNumberOfLines={5}
                                title="Refunds"
                                left={() =>
                                    <List.Icon color={'#2A3779'} icon="information-outline"/>}>
                                <List.Item
                                    style={styles.faqItemStyle}
                                    titleStyle={styles.faqItemTitle}
                                    descriptionStyle={styles.faqItemDetails}
                                    titleNumberOfLines={2}
                                    descriptionNumberOfLines={10}
                                    title="• Transaction Refunds"
                                    description={"Refunds on disputed transactions can take up to 7-15 days, to be applied to your accounts, and reflected towards your balance."}/>
                            </List.Accordion>
                            <Divider
                                style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <List.Accordion
                                style={styles.faqAccordionStyle}
                                titleStyle={styles.faqAccordionTitle}
                                titleNumberOfLines={2}
                                descriptionNumberOfLines={5}
                                title="Spending"
                                left={() =>
                                    <List.Icon color={'#2A3779'} icon="information-outline"/>}>
                                <List.Item
                                    style={styles.faqItemStyle}
                                    titleStyle={styles.faqItemTitle}
                                    descriptionStyle={styles.faqItemDetails}
                                    titleNumberOfLines={2}
                                    descriptionNumberOfLines={10}
                                    title="• Spending Limits"
                                    description={"There are no spending limits on your Moonbeam account, provided you have the available balance."}/>
                            </List.Accordion>
                            <Divider
                                style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <List.Accordion
                                onPress={() => {

                                }}
                                style={styles.faqAccordionStyle}
                                titleStyle={styles.faqItemTitleFaceID}
                                titleNumberOfLines={2}
                                descriptionNumberOfLines={5}
                                title="Statements"
                                left={() =>
                                    <List.Icon style={{bottom: '3%'}} color={'#2A3779'} icon="information-outline"/>}
                                right={() =>
                                    <View style={styles.faqItemRightView}>
                                        <Image style={styles.faqItemRightFaceID}
                                               source={require('../../../../assets/face-id.png')}/>
                                        <List.Icon icon="chevron-right"/>
                                    </View>
                                }>
                            </List.Accordion>
                        </List.Section>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
