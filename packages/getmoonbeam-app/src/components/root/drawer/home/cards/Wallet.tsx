import React, {useEffect, useMemo, useState} from 'react';
import {Dimensions, ImageBackground, SafeAreaView, TouchableOpacity, View} from "react-native";
import {CardsProps} from "../../../../../models/props/HomeProps";
import {IconButton, List, Text} from "react-native-paper";
import {useRecoilState} from "recoil";
import {appDrawerHeaderShownState} from "../../../../../recoil/AppDrawerAtom";
import {styles} from '../../../../../styles/wallet.module';
import {commonStyles} from "../../../../../styles/common.module";
import {Divider} from "@rneui/base";
import BottomSheet from "@gorhom/bottom-sheet";
import {bottomTabShownState} from "../../../../../recoil/HomeAtom";
import {CardLinkingBottomSheet} from "./CardLinkingBottomSheet";
import {Spinner} from "../../../../common/Spinner";
import {currentUserInformation} from "../../../../../recoil/AuthAtom";

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
    const [isReady, setIsReady] = useState<boolean>(true);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const snapPoints = useMemo(() => ['80%', '80%'], []);
    const [bottomSheetIndex, setBottomSheetIndex] = useState<number>(-1);
    // constants used to keep track of shared states
    const [, setAppDrawerHeaderShown] = useRecoilState(appDrawerHeaderShownState);
    const [, setBottomTabShown] = useRecoilState(bottomTabShownState);
    const [userInformation, setUserInformation] = useRecoilState(currentUserInformation);

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
        // manipulate the bottom bar navigation accordingly, depending on the bottom sheet being shown or not
        if (bottomSheetIndex === -1) {
            setBottomTabShown(true);
        } else {
            setBottomTabShown(false);
        }
    }, [navigation.getState(), bottomSheetIndex]);


    // return the component for the Wallet page
    return (
        <>
            {!isReady ?
                <Spinner loadingSpinnerShown={loadingSpinnerShown} setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                :
                <ImageBackground
                    style={commonStyles.image}
                    resizeMethod={'scale'}
                    imageStyle={{
                        resizeMode: 'stretch'
                    }}
                    source={require('../../../../../../assets/backgrounds/moonbeam-card-linking-background.png')}>
                    <SafeAreaView style={styles.walletView}>
                        <View style={styles.walletTextView}>
                            <Text style={styles.walletTitle}>
                                Wallet
                            </Text>
                            <Text style={styles.walletSubtitle}>
                                Link your debit or credit card, and earn discounts on every transaction at qualifying
                                merchant
                                locations.
                            </Text>
                        </View>
                        <List.Section style={styles.listSectionView}>
                            <List.Subheader
                                style={styles.subHeaderTitle}>Connected Card</List.Subheader>
                            <Divider
                                style={[commonStyles.divider, {width: Dimensions.get('window').width / 1.15}]}/>
                            {/*<List.Item*/}
                            {/*    style={styles.cardItemStyle}*/}
                            {/*    titleStyle={styles.cardItemTitle}*/}
                            {/*    descriptionStyle={styles.cardItemDetails}*/}
                            {/*    titleNumberOfLines={1}*/}
                            {/*    descriptionNumberOfLines={2}*/}
                            {/*    title="Hurry!"*/}
                            {/*    description='Connect your first card below.'*/}
                            {/*    right={() =>*/}
                            {/*        <List.Icon color={'#F2FF5D'} icon="exclamation"/>*/}
                            {/*    }*/}
                            {/*/>*/}
                            <List.Item
                                style={styles.cardItemStyle}
                                titleStyle={styles.cardItemTitle}
                                descriptionStyle={styles.cardItemDetails}
                                titleNumberOfLines={2}
                                descriptionNumberOfLines={2}
                                title={'Test Card'}
                                description={'MASTERCARD ••••9974'}
                                left={() =>
                                    <IconButton
                                        icon={require('../../../../../../assets/moonbeam-mastercard-icon.png')}
                                        iconColor={'#F2FF5D'}
                                        rippleColor={'transparent'}
                                        size={Dimensions.get('window').height/20}
                                        onPress={async () => {
                                            // do nothing, we chose an icon button for styling purposes here
                                        }}
                                    />}
                                right={() =>
                                    <IconButton
                                        icon="delete"
                                        iconColor={'#FFFFFF'}
                                        style={{marginTop: Dimensions.get('window').height/70, left: Dimensions.get('window').width/25}}
                                        size={Dimensions.get('window').height/35}
                                        onPress={async () => {
                                            // need to call the delete API here
                                        }}
                                    />}
                            />
                        </List.Section>
                        <View style={styles.disclaimerTextView}>
                            <TouchableOpacity
                                style={styles.linkingButton}
                                onPress={
                                    () => {
                                        /**
                                         * open up the bottom sheet, where the linking action will take place. Any linked cards and/or errors will be
                                         * handled by the CardLinkingBottomSheet component
                                         */
                                        setBottomSheetIndex(1);
                                    }
                                }
                            >
                                <Text style={styles.buttonText}>Connect new card</Text>
                            </TouchableOpacity>
                            <Text style={styles.disclaimerText}>
                                Limited to <Text style={styles.highlightedText}>one</Text> linked card per customer at a time.
                                To link a new card, first <Text style={styles.highlightedText}>disconnect the existing one</Text>. Only <Text style={styles.highlightedText}>Visa</Text> or <Text style={styles.highlightedText}>MasterCard</Text> allowed.
                            </Text>
                        </View>
                        <BottomSheet
                            backgroundStyle={styles.bottomSheet}
                            enablePanDownToClose={true}
                            index={bottomSheetIndex}
                            snapPoints={snapPoints}
                            onChange={(index) => {
                                setBottomSheetIndex(index);
                            }}
                        >
                            <CardLinkingBottomSheet/>
                        </BottomSheet>
                    </SafeAreaView>
                </ImageBackground>
            }
        </>
    );
};
