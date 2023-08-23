import 'react-native-get-random-values';
import React, {useEffect} from "react";
import {Dimensions, SafeAreaView, ScrollView, StyleSheet, View} from "react-native";
import {commonStyles} from "../../../../styles/common.module";
import {Divider, List} from "react-native-paper";
import {styles} from "../../../../styles/documentsCenter.module";
import {DocumentsCenterProps} from '../../../../models/props/DocumentsProps';
import {useRecoilState} from "recoil";
import {drawerSwipeState} from "../../../../recoil/AppDrawerAtom";

/**
 * DocumentsCenter component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component
 */
export const DocumentsCenter = ({navigation}: DocumentsCenterProps) => {
    // constants used to keep track of shared states
    const [, setDrawerSwipeEnabled] = useRecoilState(drawerSwipeState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // enable the swipe for the drawer
        setDrawerSwipeEnabled(true);
    }, []);

    // return the component for the DocumentsCenter page
    return (
        <SafeAreaView style={commonStyles.rowContainer}>
            <View style={[styles.documentsContentView, StyleSheet.absoluteFill]}>
                <ScrollView scrollEnabled={false}
                            persistentScrollbar={false}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps={'handled'}>
                    <List.Section style={styles.listSectionView}>
                        <List.Subheader
                            style={styles.subHeaderTitle}>Membership Agreements</List.Subheader>
                        <Divider style={styles.divider}/>
                        <Divider style={styles.divider}/>
                        <List.Item
                            rippleColor={'transparent'}
                            style={styles.documentsItemStyle}
                            titleStyle={styles.documentsItemTitle}
                            descriptionStyle={styles.documentsItemDescription}
                            titleNumberOfLines={2}
                            descriptionNumberOfLines={3}
                            title="Terms and Conditions"
                            description='Review what was agreed upon your sign up process.'
                            onPress={async () => {
                                navigation.navigate('DocumentsViewer', {
                                    name: 'terms-and-conditions.pdf',
                                    privacyFlag: false
                                });
                            }}
                            left={() => <List.Icon color={'#F2FF5D'} icon="text"/>}
                            right={() => <List.Icon style={{left: Dimensions.get('window').width / 60}}
                                                    color={'#F2FF5D'} icon="chevron-right"/>}
                        />
                        <Divider style={[styles.divider, {backgroundColor: '#313030'}]}/>
                        <Divider style={[styles.divider, {backgroundColor: '#313030'}]}/>
                        <List.Item
                            rippleColor={'transparent'}
                            style={styles.documentsItemStyle}
                            titleStyle={styles.documentsItemTitle}
                            descriptionStyle={styles.documentsItemDescription}
                            titleNumberOfLines={2}
                            descriptionNumberOfLines={3}
                            title="Privacy Policy"
                            description='Get details about how we store, share and use your information.'
                            onPress={async () => {
                                navigation.navigate('DocumentsViewer', {
                                    name: 'privacy-policy.pdf',
                                    privacyFlag: false
                                });
                            }}
                            left={() => <List.Icon color={'#F2FF5D'} icon="eye-off"/>}
                            right={() => <List.Icon style={{left: Dimensions.get('window').width / 60}}
                                                    color={'#F2FF5D'} icon="chevron-right"/>}
                        />
                    </List.Section>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}
