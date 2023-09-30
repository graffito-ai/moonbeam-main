import React, {useEffect} from "react";
import {ActivityIndicator, Card, Paragraph, Portal, Text} from "react-native-paper";
import {styles} from "../../../../../../styles/store.module";
import {Image, Platform, ScrollView, TouchableOpacity, View} from "react-native";
import {Offer, RewardType} from "@moonbeam/moonbeam-models";
import {Avatar} from "@rneui/base";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {MarketplaceStackParamList} from "../../../../../../models/props/MarketplaceProps";
import {useRecoilState} from "recoil";
import {
    noNearbyOffersToLoadState,
    storeOfferPhysicalLocationState,
    storeOfferState
} from "../../../../../../recoil/StoreOfferAtom";
import {currentUserInformation} from "../../../../../../recoil/AuthAtom";
import {Image as ExpoImage} from 'expo-image';
// @ts-ignore
import MoonbeamLocationServices from "../../../../../../../assets/art/moonbeam-location-services-1.png";
// @ts-ignore
import MoonbeamOffersLoading from "../../../../../../../assets/art/moonbeam-offers-loading.png";
// @ts-ignore
import MoonbeamPlaceholderImage from "../../../../../../../assets/art/moonbeam-store-placeholder.png";

/**
 * NearbySection component.
 *
 * @param props properties to be passed into the component
 * @constructor constructor for the component.
 */
export const NearbySection = (props: {
    nearbyOfferList: Offer[],
    navigation: NativeStackNavigationProp<MarketplaceStackParamList, 'Store'>,
    nearbyOffersSpinnerShown: boolean,
    setNearbyOffersSpinnerShown: React.Dispatch<React.SetStateAction<boolean>>,
    retrieveOffersNearLocation: (string) => Promise<void>,
    retrieveNearbyOffersList: () => Promise<void>,
    offersNearUserLocationFlag: boolean,
    locationServicesButton: boolean,
    setPermissionsModalCustomMessage: React.Dispatch<React.SetStateAction<string>>,
    setPermissionsInstructionsCustomMessage: React.Dispatch<React.SetStateAction<string>>,
    areNearbyOffersReady: boolean,
    setPermissionsModalVisible: React.Dispatch<React.SetStateAction<boolean>>,
    setToggleViewPressed: React.Dispatch<React.SetStateAction<'horizontal' | 'vertical'>>,
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>,
}) => {
    // constants used to keep track of shared states
    const [, setStoreOfferClicked] = useRecoilState(storeOfferState);
    const [, setStoreOfferPhysicalLocation] = useRecoilState(storeOfferPhysicalLocationState);
    const [userInformation,] = useRecoilState(currentUserInformation);
    const [noNearbyOffersToLoad,] = useRecoilState(noNearbyOffersToLoadState);

    /**
     * Function used to populate the nearby offers.
     *
     * @return a {@link React.ReactNode} or {@link React.ReactNode[]} representing the
     * React node and/or nodes, representing the nearby offers.
     */
    const populateNearbyOffers = (): React.ReactNode | React.ReactNode[] => {
        let results: React.ReactNode[] = [];
        let nearbyOffersNumber = 0;
        if (props.nearbyOfferList.length !== 0) {
            for (const nearbyOffer of props.nearbyOfferList) {
                // get the physical location of this offer
                let physicalLocation: string = '';
                nearbyOffer.storeDetails!.forEach(store => {
                    /**
                     * there are many possible stores with physical locations.
                     * We want to get the one closest (within 25 miles from the user,
                     * which is equivalent to approximately 50 km, which is 50000 meters)
                     */
                    if (physicalLocation === '' && store!.isOnline === false && store!.distance && store!.distance! <= 50000) {
                        // Olive needs to get better at displaying the address. For now, we will do this input sanitization
                        if (store!.address1 && store!.address1!.length !== 0 && store!.city && store!.city!.length !== 0 &&
                            store!.state && store!.state!.length !== 0 && store!.postCode && store!.postCode!.length !== 0) {
                            physicalLocation =
                                (store!.address1!.toLowerCase().includes(store!.city!.toLowerCase())
                                    && store!.address1!.toLowerCase().includes(store!.state!.toLowerCase())
                                    && store!.address1!.toLowerCase().includes(store!.postCode!.toLowerCase()))
                                    ? store!.address1!
                                    : `${store!.address1!}, ${store!.city!}, ${store!.state!}, ${store!.postCode!}`;
                        } else {
                            physicalLocation = store!.address1!;
                        }
                    }
                });

                // only get the true nearby offers (since this is an Olive bug
                physicalLocation !== '' && results.push(
                    <>
                        {
                            nearbyOffersNumber !== props.nearbyOfferList.length - 1
                                ?
                                <>
                                    <Card
                                        style={styles.nearbyOfferCard}>
                                        <Card.Content>
                                            <View style={{flexDirection: 'column'}}>
                                                <View style={{
                                                    flexDirection: 'row'
                                                }}>
                                                    <View>
                                                        <Card.Title
                                                            title={
                                                                <Text style={styles.nearbyOfferCardTitle}>
                                                                    {`${nearbyOffer.brandDba}\n`}
                                                                    <Text style={styles.nearbyOfferCardSubtitle}>
                                                                        {nearbyOffer.reward!.type! === RewardType.RewardPercent
                                                                            ? `${nearbyOffer.reward!.value}% Off`
                                                                            : `$${nearbyOffer.reward!.value} Off`}
                                                                    </Text>
                                                                </Text>
                                                            }
                                                            titleStyle={styles.nearbyOfferCardTitleMain}
                                                            titleNumberOfLines={10}/>
                                                        <TouchableOpacity
                                                            style={styles.viewOfferButton}
                                                            onPress={() => {
                                                                // set the clicked offer/partner accordingly
                                                                setStoreOfferClicked(nearbyOffer);

                                                                // set the clicked offer physical location
                                                                setStoreOfferPhysicalLocation(physicalLocation);

                                                                props.navigation.navigate('StoreOffer', {})
                                                            }}
                                                        >
                                                            {/*@ts-ignore*/}
                                                            <Text style={styles.viewOfferButtonContent}>View
                                                                Offer</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                    <View>
                                                        <ExpoImage
                                                            style={styles.nearbyOfferCardCover}
                                                            source={{
                                                                uri: nearbyOffer.brandLogoSm!
                                                            }}
                                                            placeholder={MoonbeamPlaceholderImage}
                                                            placeholderContentFit={'contain'}
                                                            contentFit={'contain'}
                                                            transition={1000}
                                                            cachePolicy={'memory-disk'}
                                                        />
                                                    </View>
                                                </View>
                                                <Paragraph
                                                    style={styles.nearbyOfferCardParagraph}
                                                >
                                                    {`📌 Address:\n${physicalLocation}`}
                                                </Paragraph>
                                            </View>
                                        </Card.Content>
                                    </Card>
                                    <View
                                        style={{width: nearbyOffersNumber === props.nearbyOfferList.length - 1 ? wp(10) : wp(5)}}/>
                                </>
                                :
                                <>
                                    <Card
                                        style={styles.nearbyOfferCard}>
                                        <Card.Content>
                                            <View style={{flexDirection: 'column'}}>
                                                <View style={{
                                                    flexDirection: 'row'
                                                }}>
                                                    <View>
                                                        <Card.Title
                                                            title={
                                                                <Text style={styles.nearbyOfferCardTitle}>
                                                                    {`${nearbyOffer.brandDba}\n`}
                                                                    <Text style={styles.nearbyOfferCardSubtitle}>
                                                                        {nearbyOffer.reward!.type! === RewardType.RewardPercent
                                                                            ? `${nearbyOffer.reward!.value}% Off`
                                                                            : `$${nearbyOffer.reward!.value} Off`}
                                                                    </Text>
                                                                </Text>
                                                            }
                                                            titleStyle={styles.nearbyOfferCardTitleMain}
                                                            titleNumberOfLines={10}/>
                                                        <TouchableOpacity
                                                            style={styles.viewOfferButton}
                                                            onPress={() => {
                                                                // set the clicked offer/partner accordingly
                                                                setStoreOfferClicked(nearbyOffer);
                                                                props.navigation.navigate('StoreOffer', {})
                                                            }}
                                                        >
                                                            {/*@ts-ignore*/}
                                                            <Text style={styles.viewOfferButtonContent}>View
                                                                Offer</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                    <View>
                                                        <ExpoImage
                                                            style={styles.nearbyOfferCardCover}
                                                            source={{
                                                                uri: nearbyOffer.brandLogoSm!
                                                            }}
                                                            placeholder={MoonbeamPlaceholderImage}
                                                            placeholderContentFit={'contain'}
                                                            contentFit={'contain'}
                                                            transition={1000}
                                                            cachePolicy={'memory-disk'}
                                                        />
                                                    </View>
                                                </View>
                                                <Paragraph
                                                    style={styles.nearbyOfferCardParagraph}
                                                >
                                                    {`📌 Address:\n${nearbyOffer.storeDetails![0]!.address1!}`}
                                                </Paragraph>
                                            </View>
                                        </Card.Content>
                                    </Card>
                                    <View
                                        style={{width: nearbyOffersNumber === props.nearbyOfferList.length - 1 ? wp(10) : wp(5)}}/>
                                    <Card
                                        style={styles.loadCard}>
                                        {
                                            <Card.Content>
                                                <View style={{flexDirection: 'column'}}>
                                                    <View style={{
                                                        flexDirection: 'row'
                                                    }}>
                                                        <View style={{top: hp(5)}}>
                                                            {
                                                                props.nearbyOffersSpinnerShown ?
                                                                    <ActivityIndicator
                                                                        style={{
                                                                            top: hp(2),
                                                                            left: wp(10)
                                                                        }}
                                                                        animating={props.nearbyOffersSpinnerShown}
                                                                        color={'#F2FF5D'}
                                                                        size={hp(5)}
                                                                    />
                                                                    :
                                                                    <TouchableOpacity
                                                                        disabled={noNearbyOffersToLoad}
                                                                        style={[styles.viewOfferButton, noNearbyOffersToLoad && {backgroundColor: '#D9D9D9'}]}
                                                                        onPress={async () => {
                                                                            // set the loader
                                                                            props.setNearbyOffersSpinnerShown(true);

                                                                            // retrieve additional offers (either nearby, or near user's home location)
                                                                            !props.offersNearUserLocationFlag
                                                                                ? await props.retrieveNearbyOffersList()
                                                                                : await props.retrieveOffersNearLocation(userInformation["address"]["formatted"]);

                                                                            // release the loader
                                                                            props.setNearbyOffersSpinnerShown(false);
                                                                        }}
                                                                    >
                                                                        {/*@ts-ignore*/}
                                                                        <Text
                                                                            style={styles.viewOfferButtonContent}>More</Text>
                                                                    </TouchableOpacity>
                                                            }
                                                        </View>
                                                    </View>
                                                </View>
                                            </Card.Content>
                                        }
                                    </Card>
                                </>
                        }
                    </>
                );
                nearbyOffersNumber += 1;
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

    // return the component for the NearbySection page
    return (
        <>
            {
                props.locationServicesButton ?
                    <>
                        <View
                            style={[styles.nearbyOffersView, {bottom: hp(60)}]}>
                            <View style={styles.nearbyOffersTitleView}>
                                <View
                                    style={styles.nearbyOffersLeftTitleView}>
                                    <Text
                                        style={[styles.nearbyLoadingOffersTitleMain]}>
                                        <Text
                                            style={styles.nearbyLoadingOffersTitle}>
                                            {'Offers near you'}
                                        </Text>{`   🌎️`}
                                    </Text>
                                </View>
                            </View>
                            <ScrollView
                                style={styles.nearbyOffersScrollView}
                                horizontal={true}
                                decelerationRate={"fast"}
                                snapToAlignment={"start"}
                                scrollEnabled={true}
                                persistentScrollbar={false}
                                showsHorizontalScrollIndicator={false}>
                                {
                                    <>
                                        <Card
                                            style={styles.nearbyLoadingOfferCard}>
                                            <Card.Content>
                                                <View
                                                    style={styles.locationServicesEnableView}>
                                                    <Image
                                                        style={styles.locationServicesImage}
                                                        source={MoonbeamLocationServices}/>
                                                    <TouchableOpacity
                                                        style={styles.locationServicesButton}
                                                        onPress={
                                                            async () => {
                                                                const errorMessage = `Permission to access location was not granted!`;
                                                                console.log(errorMessage);

                                                                props.setPermissionsModalCustomMessage(errorMessage);
                                                                props.setPermissionsInstructionsCustomMessage(Platform.OS === 'ios'
                                                                    ? "In order to display the closest offers near your location, go to Settings -> Moonbeam Finance, and allow Location Services access by tapping on the \'Location\' option."
                                                                    : "In order to display the closest offers near your location, go to Settings -> Apps -> Moonbeam Finance -> Permissions, and allow Location Services access by tapping on the \"Location\" option.");
                                                                props.setPermissionsModalVisible(true);
                                                            }
                                                        }
                                                    >
                                                        <Text
                                                            style={styles.locationServicesButtonText}>{'Enable'}</Text>
                                                    </TouchableOpacity>
                                                    <Text
                                                        style={styles.locationServicesEnableWarningMessage}>
                                                        Display transaction
                                                        location, by
                                                        enabling Location
                                                        Services
                                                        permissions!
                                                    </Text>
                                                </View>
                                            </Card.Content>
                                        </Card>
                                    </>
                                }
                            </ScrollView>
                        </View>
                    </> :
                    !props.areNearbyOffersReady && props.nearbyOfferList.length === 0 &&
                    <>
                        <View
                            style={[styles.nearbyOffersView, {bottom: hp(62)}]}>
                            <View style={styles.nearbyOffersTitleView}>
                                <View
                                    style={styles.nearbyOffersLeftTitleView}>
                                    <Text
                                        style={[styles.nearbyLoadingOffersTitleMain]}>
                                        <Text
                                            style={styles.nearbyLoadingOffersTitle}>
                                            {'Retrieving offers near you...'}
                                        </Text>{`   🌎️`}
                                    </Text>
                                </View>
                            </View>
                            <ScrollView
                                style={styles.nearbyOffersScrollView}
                                horizontal={true}
                                decelerationRate={"fast"}
                                snapToAlignment={"start"}
                                scrollEnabled={true}
                                persistentScrollbar={false}
                                showsHorizontalScrollIndicator={false}>
                                {
                                    <>
                                        <Card
                                            style={styles.nearbyLoadingOfferCard}>
                                            <Card.Content>
                                                <View
                                                    style={{flexDirection: 'column'}}>
                                                    <ActivityIndicator
                                                        style={{top: hp(10)}}
                                                        animating={props.nearbyOffersSpinnerShown}
                                                        color={'#F2FF5D'}
                                                        size={hp(6)}
                                                    />
                                                </View>
                                                <Avatar
                                                    containerStyle={styles.nearbyLoadingOfferCardCover}
                                                    imageProps={{
                                                        resizeMode: 'contain'
                                                    }}
                                                    source={MoonbeamOffersLoading}
                                                />
                                            </Card.Content>
                                        </Card>
                                    </>
                                }
                            </ScrollView>
                        </View>
                    </>
            }
            {props.nearbyOfferList.length > 0 &&
                <View style={styles.nearbyOffersView}>
                    <View style={styles.nearbyOffersTitleView}>
                        <View style={styles.nearbyOffersLeftTitleView}>
                            <Text
                                style={[styles.nearbyOffersTitleMain, props.offersNearUserLocationFlag && {left: wp(4)}]}>
                                <Text
                                    style={styles.nearbyOffersTitle}>
                                    {!props.offersNearUserLocationFlag
                                        ? 'Offers near you'
                                        : `Offers in ${userInformation["address"]["formatted"].split(',')[1].trimStart().trimEnd()}`}
                                </Text>{`   🌎️`}
                            </Text>
                            <Text
                                style={[styles.nearbyOffersTitleSub, props.offersNearUserLocationFlag && {left: wp(4)}]}>
                                (within 25 miles)
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => {
                            props.setToggleViewPressed('vertical');

                            // set the search query manually
                            props.setSearchQuery('sort by: nearby locations');
                        }}>
                            <Text
                                style={styles.nearbyOffersTitleButton}>
                                See All
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <Portal.Host>
                        <ScrollView
                            style={styles.nearbyOffersScrollView}
                            horizontal={true}
                            decelerationRate={"fast"}
                            snapToInterval={wp(70) + wp(20)}
                            snapToAlignment={"start"}
                            scrollEnabled={true}
                            persistentScrollbar={false}
                            showsHorizontalScrollIndicator={false}>
                            {
                                populateNearbyOffers()
                            }
                        </ScrollView>
                    </Portal.Host>
                </View>
            }
        </>
    );
};
