import React, {useEffect, useState} from "react";
import {ScrollView, TouchableOpacity, View} from "react-native";
import {ActivityIndicator, Card, Paragraph, Portal, Text} from "react-native-paper";
import {styles} from "../../../../../../styles/store.module";
import {Offer, RewardType} from "@moonbeam/moonbeam-models";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {MarketplaceStackParamList} from "../../../../../../models/props/MarketplaceProps";
import {useRecoilState} from "recoil";
import {noOnlineOffersToLoadState, storeOfferState} from "../../../../../../recoil/StoreOfferAtom";
import {Image} from 'expo-image';
// @ts-ignore
import MoonbeamPlaceholderImage from "../../../../../../../assets/art/moonbeam-store-placeholder.png";

/**
 * OnlineSection component.
 *
 * @param props properties to be passed into the component
 * @constructor constructor for the component.
 */
export const OnlineSection = (props: {
    onlineOfferList: Offer[],
    navigation: NativeStackNavigationProp<MarketplaceStackParamList, 'Store'>,
    retrieveOnlineOffersList: () => Promise<void>,
    areNearbyOffersReady: boolean,
    nearbyOfferList: Offer[],
    locationServicesButton: boolean,
    setToggleViewPressed: React.Dispatch<React.SetStateAction<'horizontal' | 'vertical'>>,
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>
}) => {
    // constants used to keep track of local component state
    const [onlineOffersSpinnerShown, setOnlineOffersSpinnerShown] = useState<boolean>(false);
    // constants used to keep track of shared states
    const [, setStoreOfferClicked] = useRecoilState(storeOfferState);
    const [noOnlineOffersToLoad,] = useRecoilState(noOnlineOffersToLoadState);

    /**
     * Function used to populate the online offers.
     *
     * @return a {@link React.ReactNode} or {@link React.ReactNode[]} representing the
     * React node and/or nodes, representing the online offers.
     */
    const populateOnlineOffers = (): React.ReactNode | React.ReactNode[] => {
        let results: React.ReactNode[] = [];
        let onlineOfferNumber = 0;
        if (props.onlineOfferList.length !== 0) {
            for (const onlineOffer of props.onlineOfferList) {
                results.push(
                    <>
                        {onlineOfferNumber !== props.onlineOfferList.length - 1
                            ?
                            <TouchableOpacity style={{left: '3%'}}
                                              onPress={() => {
                                                  // set the clicked offer/partner accordingly
                                                  setStoreOfferClicked(onlineOffer);
                                                  props.navigation.navigate('StoreOffer', {});
                                              }}>
                                <Card style={styles.onlineOfferCard}>
                                    <Card.Content>
                                        <View style={{flexDirection: 'column'}}>
                                            <Image
                                                style={styles.onlineOfferCardCover}
                                                source={{
                                                    uri: onlineOffer.brandLogoSm!
                                                }}
                                                placeholder={MoonbeamPlaceholderImage}
                                                placeholderContentFit={'fill'}
                                                contentFit={'fill'}
                                                transition={1000}
                                                cachePolicy={'memory-disk'}
                                            />
                                            <Paragraph
                                                style={styles.onlineOfferCardTitle}>{onlineOffer.brandDba}
                                            </Paragraph>
                                            <Paragraph
                                                style={styles.onlineOfferCardSubtitle}>
                                                {onlineOffer.reward!.type! === RewardType.RewardPercent
                                                    ? `${onlineOffer.reward!.value}% Off`
                                                    : `$${onlineOffer.reward!.value} Off`}
                                            </Paragraph>
                                        </View>
                                    </Card.Content>
                                </Card>
                                <View
                                    style={{width: wp(5)}}/>
                            </TouchableOpacity>
                            :
                            <>
                                <TouchableOpacity style={{left: wp(5)}}
                                                  onPress={() => {
                                                      // set the clicked offer/partner accordingly
                                                      setStoreOfferClicked(onlineOffer);
                                                      props.navigation.navigate('StoreOffer', {});
                                                  }}>
                                    <Card style={styles.onlineOfferCard}>
                                        <Card.Content>
                                            <View style={{flexDirection: 'column'}}>
                                                <Image
                                                    style={styles.onlineOfferCardCover}
                                                    source={{
                                                        uri: onlineOffer.brandLogoSm!
                                                    }}
                                                    placeholder={MoonbeamPlaceholderImage}
                                                    placeholderContentFit={'fill'}
                                                    contentFit={'fill'}
                                                    transition={1000}
                                                    cachePolicy={'memory-disk'}
                                                />
                                                <Paragraph
                                                    style={styles.onlineOfferCardTitle}>{onlineOffer.brandDba}
                                                </Paragraph>
                                                <Paragraph
                                                    style={styles.onlineOfferCardSubtitle}>
                                                    {onlineOffer.reward!.type! === RewardType.RewardPercent
                                                        ? `${onlineOffer.reward!.value}% Off`
                                                        : `$${onlineOffer.reward!.value} Off`}
                                                </Paragraph>
                                            </View>
                                        </Card.Content>
                                    </Card>
                                    <View style={{width: wp(5)}}/>
                                </TouchableOpacity>
                                <TouchableOpacity style={{left: wp(5)}}
                                                  onPress={() => {
                                                      // set the clicked offer/partner accordingly
                                                      setStoreOfferClicked(onlineOffer);
                                                      props.navigation.navigate('StoreOffer', {});
                                                  }}>
                                    <Card style={styles.onlineOfferCard}>
                                        <Card.Content>
                                            <View style={{top: hp(2)}}>
                                                {
                                                    onlineOffersSpinnerShown ?
                                                        <ActivityIndicator
                                                            style={{top: hp(2)}}
                                                            animating={onlineOffersSpinnerShown}
                                                            color={'#F2FF5D'}
                                                            size={hp(5)}
                                                        />
                                                        :
                                                        <TouchableOpacity
                                                            disabled={noOnlineOffersToLoad}
                                                            style={[styles.viewOfferButton, noOnlineOffersToLoad && {backgroundColor: '#D9D9D9'}]}
                                                            onPress={async () => {
                                                                // set the loader
                                                                setOnlineOffersSpinnerShown(true);

                                                                // retrieve additional offers
                                                                await props.retrieveOnlineOffersList();

                                                                // release the loader
                                                                setOnlineOffersSpinnerShown(false);
                                                            }}
                                                        >
                                                            {/*@ts-ignore*/}
                                                            <Text style={styles.viewOfferButtonContent}>More</Text>
                                                        </TouchableOpacity>
                                                }
                                            </View>
                                        </Card.Content>
                                    </Card>
                                    <View
                                        style={{width: wp(5)}}/>
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Card style={styles.onlineOfferCard}>
                                        <Card.Content>
                                        </Card.Content>
                                    </Card>
                                </TouchableOpacity>
                            </>
                        }
                    </>
                );
                onlineOfferNumber += 1;
            }
        }
        return results;
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

    // return the component for the OnlineSection page
    return (
        <>
            <View
                style={[styles.onlineOffersView,
                    !props.areNearbyOffersReady && props.nearbyOfferList.length === 0 && {bottom: hp(125)},
                    props.nearbyOfferList.length == 0 && props.areNearbyOffersReady && {bottom: hp(25)},
                    props.locationServicesButton && {bottom: hp(115)}]}>
                <View style={styles.onlineOffersTitleView}>
                    <View style={styles.onlineOffersLeftTitleView}>
                        <Text style={styles.onlineOffersTitleMain}>
                            <Text style={styles.onlineOffersTitle}>
                                Shop Online at
                            </Text>{`   🛍️`}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => {
                        props.setToggleViewPressed('vertical');

                        // set the search query manually
                        props.setSearchQuery('sort by: online');
                    }}>
                        <Text style={styles.onlineOffersTitleButton}>
                            See All
                        </Text>
                    </TouchableOpacity>
                </View>
                <Portal.Host>
                    <ScrollView
                        style={[styles.onlineOffersScrollView, props.nearbyOfferList.length === 0 && props.areNearbyOffersReady && {left: -wp(0.5)}]}
                        horizontal={true}
                        decelerationRate={"fast"}
                        snapToInterval={wp(33) * 3}
                        snapToAlignment={"start"}
                        scrollEnabled={true}
                        persistentScrollbar={false}
                        showsHorizontalScrollIndicator={false}
                    >
                        {
                            populateOnlineOffers()
                        }
                    </ScrollView>
                </Portal.Host>
            </View>
        </>
    );
};
