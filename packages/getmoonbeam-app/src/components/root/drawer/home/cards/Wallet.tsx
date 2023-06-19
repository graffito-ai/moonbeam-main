import React, {useEffect, useMemo, useState} from 'react';
import {Dimensions, ImageBackground, TouchableOpacity, View} from "react-native";
import {CardsProps} from "../../../../../models/props/HomeProps";
import {List, Text} from "react-native-paper";
import {useRecoilState} from "recoil";
import {appDrawerHeaderShownState} from "../../../../../recoil/AppDrawerAtom";
import {styles} from '../../../../../styles/wallet.module';
import {commonStyles} from "../../../../../styles/common.module";
import {Divider} from "@rneui/base";
import BottomSheet from "@gorhom/bottom-sheet";
import {bottomTabShownState} from "../../../../../recoil/HomeAtom";
import {CardLinkingBottomSheet} from "./CardLinkingBottomSheet";

/**
 * Wallet component. This component will be used as a place where users can manager their
 * linked cards. This will be accessible from the bottom navigation bar, as well as from
 * the drawer navigation, through settings.
 *
 * @param props component properties to be passed in.
 * @constructor constructor for the component.
 */
export const Wallet = ({navigation}: CardsProps) => {
    // constants used to keep track of local component state
    const snapPoints = useMemo(() => ['80%', '80%'], []);
    const [bottomSheetIndex, setBottomSheetIndex] = useState<number>(-1);
    // constants used to keep track of shared states
    const [, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [, setBottomTabShown] = useRecoilState(bottomTabShownState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // set the app drawer status accordingly
        if (navigation.getState().index === 2) {
            setAppDrawerHeaderShown(false);
        }
        // manipulate the botom bar navigation accordingly, depending on the bottom sheet being shown or not
        if (bottomSheetIndex === -1) {
            setBottomTabShown(true);
        } else {
            setBottomTabShown(false);
        }
    }, [navigation.getState(), bottomSheetIndex]);


    // return the component for the Wallet page
    return (
        <ImageBackground
            style={commonStyles.image}
            resizeMethod={'scale'}
            imageStyle={{
                resizeMode: 'stretch'
            }}
            source={require('../../../../../../assets/backgrounds/registration-background.png')}>
            <View style={styles.walletView}>
                <View style={{
                    alignSelf: 'flex-start',
                    marginTop: Dimensions.get('window').height / 10,
                    left: Dimensions.get('window').width / 20
                }}>
                    <Text style={{fontFamily: 'Saira-SemiBold', fontSize: Dimensions.get('window').width / 13}}>
                        Wallet
                    </Text>
                    <Text style={{
                        fontFamily: 'Raleway-Regular',
                        fontSize: Dimensions.get('window').width / 22,
                        width: Dimensions.get('window').width / 1.15,
                        textAlign: 'justify'
                    }}>
                        Link your debit or credit card, and earn discounts on every transaction at qualifying merchant
                        locations.
                    </Text>
                </View>
                <List.Section style={styles.listSectionView}>
                    <List.Subheader
                        style={styles.subHeaderTitle}>Connected Cards</List.Subheader>
                    <Divider
                        style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                    <List.Item
                        style={styles.cardItemStyle}
                        titleStyle={styles.cardItemTitle}
                        descriptionStyle={styles.cardItemDetails}
                        titleNumberOfLines={1}
                        descriptionNumberOfLines={2}
                        title="Hurry!"
                        description='Connect your first card below.'
                        right={() =>
                            <List.Icon color={'#F2FF5D'} icon="exclamation"/>
                        }
                    />
                </List.Section>
                <TouchableOpacity
                    style={styles.linkingButton}
                    onPress={
                        () => {
                            // open up the bottom sheet
                            setBottomSheetIndex(1);
                        }
                    }
                >
                    <Text style={styles.buttonText}>Connect new card</Text>
                </TouchableOpacity>
                <BottomSheet
                    backgroundStyle={{backgroundColor: '#5B5A5A'}}
                    enablePanDownToClose={true}
                    index={bottomSheetIndex}
                    snapPoints={snapPoints}
                    onChange={(index) => {
                        setBottomSheetIndex(index);
                    }}
                >
                    <CardLinkingBottomSheet/>
                </BottomSheet>
            </View>
        </ImageBackground>
    );
};
