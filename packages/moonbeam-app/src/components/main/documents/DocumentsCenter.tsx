import 'react-native-get-random-values';
import React, {useEffect} from "react";
import {Dimensions, SafeAreaView, Text, TouchableHighlight, View} from "react-native";
import {commonStyles} from "../../../styles/common.module";
import {Divider, List} from "react-native-paper";
import {styles} from "../../../styles/documentsCenter.module";
import {DocumentsCenterProps} from "../../../models/DocumentsStackProps";

/**
 * DocumentsCenter component.
 */
export const DocumentsCenter = ({route, navigation}: DocumentsCenterProps) => {
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

    // return the component for the DocumentsCenter page
    return (
        <SafeAreaView style={[commonStyles.rowContainer, commonStyles.androidSafeArea]}>
            <View>
                <View style={[styles.mainView]}>
                    <View style={styles.titleView}>
                        <Text style={styles.mainTitle}>Documents Center</Text>
                    </View>
                    <View style={styles.content}>
                        <List.Section style={styles.listSectionView}>
                            <List.Subheader style={styles.subHeaderTitle}>Membership Agreements</List.Subheader>
                            <Divider
                                style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <TouchableHighlight
                                onPress={async () => {
                                    navigation.navigate('DocumentViewer', {
                                        name: 'cardAgreement.pdf',
                                        privacyFlag: true
                                    });
                                }}
                                underlayColor="transparent">
                                <List.Item
                                    style={styles.documentItemStyle}
                                    titleStyle={styles.documentItemTitle}
                                    descriptionStyle={styles.documentItemDetails}
                                    titleNumberOfLines={2}
                                    descriptionNumberOfLines={3}
                                    title="Card member agreement"
                                    description='View your Alpha card details, including your member terms.'
                                    onPress={async () => {
                                        navigation.navigate('DocumentViewer', {
                                            name: 'cardAgreement.pdf',
                                            privacyFlag: true
                                        });
                                    }}
                                    left={() => <List.Icon color={'#2A3779'} icon="signature"/>}
                                    right={() => <List.Icon color={'#2A3779'} icon="chevron-right"/>}
                                />
                            </TouchableHighlight>
                            <Divider
                                style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <TouchableHighlight
                                onPress={async () => {
                                    navigation.navigate('DocumentViewer', {
                                        name: 'termsAndConditions.pdf',
                                        privacyFlag: false
                                    });
                                }}
                                underlayColor="transparent">
                                <List.Item
                                    style={styles.documentItemStyle}
                                    titleStyle={styles.documentItemTitle}
                                    descriptionStyle={styles.documentItemDetails}
                                    titleNumberOfLines={2}
                                    descriptionNumberOfLines={3}
                                    title="Terms and Conditions"
                                    description='Review what was agreed upon your sign up process.'
                                    onPress={async () => {
                                        navigation.navigate('DocumentViewer', {
                                            name: 'termsAndConditions.pdf',
                                            privacyFlag: false
                                        });
                                    }}
                                    left={() => <List.Icon color={'#2A3779'} icon="text"/>}
                                    right={() => <List.Icon color={'#2A3779'} icon="chevron-right"/>}
                                />
                            </TouchableHighlight>
                            <Divider
                                style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <TouchableHighlight
                                onPress={async () => {
                                    navigation.navigate('DocumentViewer', {
                                        name: 'privacyPolicy.pdf',
                                        privacyFlag: false
                                    });
                                }}
                                underlayColor="transparent">
                                <List.Item
                                    style={styles.documentItemStyle}
                                    titleStyle={styles.documentItemTitle}
                                    descriptionStyle={styles.documentItemDetails}
                                    titleNumberOfLines={2}
                                    descriptionNumberOfLines={3}
                                    title="Privacy Policy"
                                    description='Get details about how we store, share and use your information.'
                                    onPress={async () => {
                                        navigation.navigate('DocumentViewer', {
                                            name: 'privacyPolicy.pdf',
                                            privacyFlag: false
                                        });
                                    }}
                                    left={() => <List.Icon color={'#2A3779'} icon="eye-off"/>}
                                    right={() => <List.Icon color={'#2A3779'} icon="chevron-right"/>}
                                />
                            </TouchableHighlight>
                        </List.Section>
                        <List.Section style={styles.listSectionView}>
                            <List.Subheader style={styles.subHeaderTitle}>Statements</List.Subheader>
                            <Divider
                                style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            <TouchableHighlight
                                onPress={() => {

                                }}
                                underlayColor="transparent">
                                <List.Item
                                    style={styles.documentItemStyle}
                                    titleStyle={styles.documentItemTitle}
                                    descriptionStyle={styles.documentItemDetails}
                                    titleNumberOfLines={2}
                                    descriptionNumberOfLines={3}
                                    title="February - March 2023"
                                    description='Retrieve your March 2023 statement.'
                                    onPress={async () => {

                                    }}
                                    left={() => <List.Icon color={'#2A3779'} icon="file-document"/>}
                                    right={() => <List.Icon color={'#2A3779'} icon="chevron-right"/>}
                                />
                            </TouchableHighlight>
                        </List.Section>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
