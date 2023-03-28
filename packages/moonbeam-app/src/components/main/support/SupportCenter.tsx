import 'react-native-get-random-values';
import React, {useEffect} from "react";
import {Dimensions, SafeAreaView, ScrollView, Text, TouchableHighlight, View} from "react-native";
import {commonStyles} from "../../../styles/common.module";
import {Button, Divider, IconButton, List} from "react-native-paper";
import {styles} from "../../../styles/support.module";
import {SupportCenterProps} from '../../../models/SupportStackProps';

/**
 * SupportCenter component.
 */
export const SupportCenter = ({route, navigation}: SupportCenterProps) => {
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
        route.params.setIsDrawerHeaderShown(true);
    }, [route]);

    // return the component for the SupportCenter page
    return (
        <SafeAreaView style={[commonStyles.rowContainer, commonStyles.androidSafeArea]}>
            <View>
                <ScrollView
                    scrollEnabled={false}
                    keyboardShouldPersistTaps={'handled'}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.mainView]}>
                        <View style={styles.titleView}>
                            <Text style={styles.mainTitle}>Support Center</Text>
                        </View>
                        <View style={styles.content}>
                            <List.Section style={styles.listSectionView}>
                                <List.Subheader style={styles.subHeaderTitle}>Help</List.Subheader>
                                <Divider
                                    style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                                <TouchableHighlight
                                    onPress={() => {

                                    }}
                                    underlayColor="transparent">
                                    <List.Item
                                        style={styles.bankItemStyle}
                                        titleStyle={styles.bankItemTitle}
                                        descriptionStyle={styles.bankItemDetails}
                                        titleNumberOfLines={2}
                                        descriptionNumberOfLines={3}
                                        title={'Contact'}
                                        description={`You will be redirected to a live agent whom will be able to answer your questions.`}
                                        left={() =>
                                            <List.Icon color={'#2A3779'} icon="message"/>}
                                        right={() =>
                                            <IconButton
                                                style={styles.bankItemRightIcon}
                                                icon="chevron-right"
                                                iconColor={'black'}
                                                size={25}
                                                onPress={() => {
                                                }}
                                            />}
                                    />
                                </TouchableHighlight>
                            </List.Section>
                            <List.Section style={styles.listSectionView}>
                                <List.Subheader style={styles.subHeaderTitle}>Knowledge Base</List.Subheader>
                                <Divider
                                    style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                                <TouchableHighlight
                                    onPress={() => {
                                        navigation.navigate('FAQ', {
                                            setIsDrawerHeaderShown: route.params.setIsDrawerHeaderShown
                                        });
                                    }}
                                    underlayColor="transparent">
                                    <List.Item
                                        style={styles.bankItemStyle}
                                        titleStyle={styles.bankItemTitle}
                                        descriptionStyle={styles.bankItemDetails}
                                        titleNumberOfLines={2}
                                        descriptionNumberOfLines={3}
                                        title={'FAQ'}
                                        description={`Access our most frequently asked questions and answers.`}
                                        left={() =>
                                            <List.Icon color={'#2A3779'} icon="frequently-asked-questions"/>}
                                        right={() =>
                                            <IconButton
                                                style={styles.bankItemRightIcon}
                                                icon="chevron-right"
                                                iconColor={'black'}
                                                size={25}
                                                onPress={() => {
                                                    navigation.navigate('FAQ', {
                                                        setIsDrawerHeaderShown: route.params.setIsDrawerHeaderShown
                                                    });
                                                }}
                                            />}
                                    />
                                </TouchableHighlight>
                            </List.Section>
                        </View>
                    </View>
                </ScrollView>
                <View style={styles.bottomView}>
                    <Divider style={[commonStyles.divider, {width: Dimensions.get('window').width}]}/>
                    <Button
                        onPress={async () => {
                        }}
                        uppercase={false}
                        style={styles.connectButton}
                        textColor={"#f2f2f2"}
                        buttonColor={"#2A3779"}
                        mode="outlined"
                        labelStyle={{fontSize: 18}}
                        icon={"timeline-help"}>
                        Get more help
                    </Button>
                    <View style={styles.bottomTextView}>
                        <Text numberOfLines={3} style={styles.bottomText}>Get more help by
                            <Text numberOfLines={3} style={styles.bottomTextButton}
                                  onPress={() => {
                                  }}> leaving feedback or engaging with our team</Text>
                        </Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
