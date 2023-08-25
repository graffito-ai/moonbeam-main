import React, {useEffect, useState} from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {StoreProps} from "../../../../../models/props/MarketplaceProps";
import {Spinner} from '../../../../common/Spinner';
import {Dimensions, Platform, SafeAreaView, ScrollView, TouchableOpacity, View} from "react-native";
import {commonStyles} from "../../../../../styles/common.module";
import {Button, Card, Chip, Dialog, List, Paragraph, Portal, Searchbar, Text, ToggleButton} from 'react-native-paper';
import {styles} from '../../../../../styles/store.module';
import {Avatar, Icon} from '@rneui/base';
import * as Location from "expo-location";
import {LocationObject} from "expo-location";
import {
    CountryCode,
    FidelisPartner,
    getFidelisPartners,
    getOffers,
    Offer,
    OfferAvailability,
    OfferFilter,
    OfferState,
    RedemptionType,
    RewardType
} from "@moonbeam/moonbeam-models";
import {API, graphqlOperation} from "aws-amplify";
import {currentUserInformation} from "../../../../../recoil/AuthAtom";
import {useRecoilState} from "recoil";
import {storeOfferState} from "../../../../../recoil/StoreOfferAtom";
import { dynamicSort } from '../../../../../utils/Main';

/**
 * Store component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const Store = ({navigation}: StoreProps) => {
    // constants used to keep track of local component state
    const [isReady, setIsReady] = useState<boolean>(false);
    const [loadingSpinnerShown, setLoadingSpinnerShown] = useState<boolean>(true);
    const [filteredOffersSpinnerShown, setFilteredOffersSpinnerShown] = useState<boolean>(false);
    const [onlineOffersSpinnerShown, setOnlineOffersSpinnerShown] = useState<boolean>(false);
    const [nearbyOffersSpinnerShown, setNearbyOffersSpinnerShown] = useState<boolean>(false);
    const [toggleViewPressed, setToggleViewPressed] = useState<'horizontal' | 'vertical'>('horizontal');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [offersNearUserLocationFlag, setOffersNearUserLocationFlag] = useState<boolean>(false);
    const [noFilteredOffersAvailable, setNoFilteredOffersAvailable] = useState<boolean>(false);
    const [fidelisOfferList, ] = useState<Offer[]>([]);
    const [nearbyOfferList, setNearbyOfferList] = useState<Offer[]>([]);
    const [onlineOfferList, setOnlineOfferList] = useState<Offer[]>([]);
    const [fidelisPartnerList, setFidelisPartnerList] = useState<FidelisPartner[]>([]);
    const [filteredOfferList, setFilteredOfferList] = useState<Offer[]>([]);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [nearbyOffersPageNumber, setNearbyOffersPageNumber] = useState<number>(1);
    const [onlineOffersPageNumber, setOnlineOffersPageNumber] = useState<number>(1);
    const [userLatitude, setUserLatitude] = useState<number>(1);
    const [userLongitude, setUserLongitude] = useState<number>(1);
    const [shouldCacheImages, setShouldCacheImages] = useState<boolean>(true);
    // constants used to keep track of shared states
    const [userInformation,] = useRecoilState(currentUserInformation);
    const [, setStoreOfferClicked] = useRecoilState(storeOfferState);

    /**
     * Function used to retrieve the list of preferred (Fidelis) partners
     * and their offers, that we will display in the first category of the
     * marketplace.
     *
     * @returns a {@link Promise} of {@link void} since this function will set the
     * React state of the preferred partners.
     */
    const retrieveFidelisPartnerList = async (): Promise<void> => {
        try {
            // call the getFidelisPartners API
            const fidelisPartnersResult = await API.graphql(graphqlOperation(getFidelisPartners));

            // retrieve the data block from the response
            // @ts-ignore
            const responseData = fidelisPartnersResult ? fidelisPartnersResult.data : null;

            // check if there are any errors in the returned response
            if (responseData && responseData.getFidelisPartners.errorMessage === null) {
                // retrieve the array of Fidelis partners from the API call
                const fidelisPartners: FidelisPartner[] = responseData.getFidelisPartners.data;

                // ensure that there is at least one featured partner in the list
                if (fidelisPartners.length > 0) {
                    setFidelisPartnerList(fidelisPartners.sort(dynamicSort("brandName")));
                } else {
                    console.log(`No Fidelis partners to display ${JSON.stringify(fidelisPartnersResult)}`);
                    setModalVisible(true);
                }
            } else {
                console.log(`Unexpected error while retrieving Fidelis partner offers ${JSON.stringify(fidelisPartnersResult)}`);
                setModalVisible(true);
            }
        } catch (error) {
            console.log(`Unexpected error while attempting to retrieve the Fidelis partner offers ${JSON.stringify(error)} ${error}`);
            setModalVisible(true);
        }
    }

    /**
     * Function used to populate the Fidelis partners.
     *
     * @return a {@link React.ReactNode} or {@link React.ReactNode[]} representing the
     * React node and/or nodes, representing the Fidelis partners.
     */
    const populateFidelisPartners = (): React.ReactNode | React.ReactNode[] => {
        let results: React.ReactNode[] = [];
        let fidelisPartnerNumber = 0;
        if (fidelisPartnerList.length !== 0) {
            for (const fidelisPartner of fidelisPartnerList) {
                // retrieve appropriate offer for partner (everyday)
                let offer: Offer | null = null;
                for (const matchedOffer of fidelisPartner.offers) {
                    if (matchedOffer!.title!.includes("Military Discount")) {
                        offer = matchedOffer!;
                        break;
                    }
                }
                const subtitle =
                    offer!.reward!.type! === RewardType.RewardPercent
                        ? `Starting at ${offer!.reward!.value}% Off`
                        : `Starting at $${offer!.reward!.value} Off`;

                offer && results.push(
                    <>
                        <Card
                            style={styles.featuredPartnerCard}>
                            <Card.Content>
                                <View style={{flexDirection: 'column'}}>
                                    <View style={{
                                        flexDirection: 'row',
                                        marginTop: -10
                                    }}>
                                        <View>
                                            <Card.Title
                                                title={fidelisPartner.brandName}
                                                subtitle={subtitle}
                                                titleStyle={styles.featuredPartnerCardTitle}
                                                subtitleStyle={styles.featuredPartnerCardSubtitle}
                                                titleNumberOfLines={3}
                                                subtitleNumberOfLines={3}/>
                                            <Button
                                                uppercase={false}
                                                disabled={false}
                                                onPress={() => {
                                                    // set the clicked offer/partner accordingly
                                                    setStoreOfferClicked(fidelisPartner);
                                                    navigation.navigate('StoreOffer', {})
                                                }}
                                                style={[styles.featuredPartnerCardActionButton]}
                                                textColor={"#313030"}
                                                buttonColor={"#F2FF5D"}
                                                mode="outlined"
                                                labelStyle={styles.featuredPartnerCardActionButtonLabel}>
                                                {fidelisPartner.numberOfOffers === 1 ? 'View Offer' : 'View Offers'}
                                            </Button>
                                        </View>
                                        <View>
                                            <Avatar
                                                containerStyle={styles.featuredPartnerCardCover}
                                                imageProps={{
                                                    resizeMode: 'contain'
                                                }}
                                                source={{uri: fidelisPartner.offers[0]!.brandLogoSm!, cache: 'force-cache'}}
                                            />
                                        </View>
                                    </View>
                                    <Paragraph
                                        style={styles.featuredPartnerCardParagraph}
                                    >
                                        {fidelisPartner.offers[0]!.brandStubCopy!}
                                    </Paragraph>
                                </View>
                            </Card.Content>
                        </Card>
                        <View
                            style={{width: fidelisPartnerNumber === fidelisPartnerList.length - 1 ? Dimensions.get('window').width / 10 : Dimensions.get('window').width / 20}}/>

                    </>
                );
                fidelisPartnerNumber += 1;
            }
        }
        return results;
    }

    /**
     * Function used to retrieve the list of online offers, that we will
     * display in the third category of the marketplace.
     *
     * @returns a {@link Promise} of {@link void} since this function will set the
     * React state of the online offers.
     */
    const retrieveOnlineOffersList = async (): Promise<void> => {
        try {
            // call the getOffers API
            const onlineOffersResult = await API.graphql(graphqlOperation(getOffers, {
                getOffersInput: {
                    availability: OfferAvailability.Global,
                    countryCode: CountryCode.Us,
                    filterType: OfferFilter.Online,
                    offerStates: [OfferState.Active, OfferState.Scheduled],
                    pageNumber: onlineOffersPageNumber,
                    pageSize: 7, // load 7 nearby offers at a time
                    redemptionType: RedemptionType.Cardlinked
                }
            }));

            // retrieve the data block from the response
            // @ts-ignore
            const responseData = onlineOffersResult ? onlineOffersResult.data : null;

            // check if there are any errors in the returned response
            if (responseData && responseData.getOffers.errorMessage === null) {
                // retrieve the array of online offers from the API call
                const onlineOffers: Offer[] = responseData.getOffers.data.offers;

                // ensure that there is at least one online offer in the list
                if (onlineOffers.length > 0) {
                    // increase the page number
                    setOnlineOffersPageNumber(onlineOffersPageNumber + 1);

                    // push any old offers into the list to return
                    setOnlineOfferList(onlineOfferList.concat(onlineOffers));
                } else {
                    console.log(`No online offers to display ${JSON.stringify(onlineOffersResult)}`);
                    setModalVisible(true);
                }
            } else {
                console.log(`Unexpected error while retrieving online offers ${JSON.stringify(onlineOffersResult)}`);
                setModalVisible(true);
            }
        } catch (error) {
            console.log(`Unexpected error while attempting to retrieve online offers ${JSON.stringify(error)} ${error}`);
            setModalVisible(true);
        }
    }

    /**
     * Function used to populate the online offers.
     *
     * @return a {@link React.ReactNode} or {@link React.ReactNode[]} representing the
     * React node and/or nodes, representing the online offers.
     */
    const populateOnlineOffers = (): React.ReactNode | React.ReactNode[] => {
        let results: React.ReactNode[] = [];
        let onlineOfferNumber = 0;
        if (onlineOfferList.length !== 0) {
            for (const onlineOffer of onlineOfferList) {
                results.push(
                    <>
                        {onlineOfferNumber !== onlineOfferList.length - 1
                            ?
                            <TouchableOpacity style={{left: '3%'}}
                                              onPress={() => {
                                                  // set the clicked offer/partner accordingly
                                                  setStoreOfferClicked(onlineOffer);
                                                  navigation.navigate('StoreOffer', {});
                                              }}>
                                <Card style={styles.onlineOfferCard}>
                                    <Card.Content>
                                        <View style={{flexDirection: 'column'}}>
                                            <Avatar
                                                containerStyle={styles.onlineOfferCardCover}
                                                imageProps={{
                                                    resizeMode: 'stretch'
                                                }}
                                                size={25}
                                                source={{uri: onlineOffer.brandLogoSm!, cache: 'force-cache'}}
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
                                    style={{width: Dimensions.get('window').width / 15}}/>
                            </TouchableOpacity>
                            :
                            <>
                                <TouchableOpacity style={{left: '3%'}}
                                                  onPress={() => {
                                                      // set the clicked offer/partner accordingly
                                                      setStoreOfferClicked(onlineOffer);
                                                      navigation.navigate('StoreOffer', {});
                                                  }}>
                                    <Card style={styles.onlineOfferCard}>
                                        <Card.Content>
                                            <View style={{flexDirection: 'column'}}>
                                                <Avatar
                                                    containerStyle={styles.onlineOfferCardCover}
                                                    imageProps={{
                                                        resizeMode: 'stretch'
                                                    }}
                                                    size={25}
                                                    source={{uri: onlineOffer.brandLogoSm!, cache: 'force-cache'}}
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
                                    <View style={{width: Dimensions.get('window').width / 15}}/>
                                </TouchableOpacity>
                                <TouchableOpacity style={{left: '3%'}}
                                                  onPress={() => {
                                                      // set the clicked offer/partner accordingly
                                                      setStoreOfferClicked(onlineOffer);
                                                      navigation.navigate('StoreOffer', {});
                                                  }}>
                                    <Card style={styles.onlineOfferCard}>
                                        <Card.Content>
                                            <Button
                                                uppercase={false}
                                                disabled={false}
                                                onPress={async () => {
                                                    // set the loader
                                                    setOnlineOffersSpinnerShown(true);

                                                    // retrieve additional offers
                                                    await retrieveOnlineOffersList();

                                                    // release the loader
                                                    setOnlineOffersSpinnerShown(false);
                                                }}
                                                style={[styles.loadOnlineCardActionButton]}
                                                textColor={"#313030"}
                                                buttonColor={"#F2FF5D"}
                                                mode="outlined"
                                                labelStyle={styles.featuredPartnerCardActionButtonLabel}>{'More'}
                                            </Button>
                                        </Card.Content>
                                    </Card>
                                    <View
                                        style={{width: Dimensions.get('window').width / 15}}/>
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
     * Function used to retrieve the list of offers near the user's home location, that we will
     * display in the second category of the marketplace (to be used as a fallback to the nearby
     * offers).
     *
     * @returns a {@link Promise} of {@link void} since this function will set the
     * React state of the offers near the user's home location.
     */
    const retrieveOffersNearLocation = async (address: string): Promise<void> => {
        try {
            // first retrieve the necessary geolocation information based on the user's home address
            const geoLocationArray = await Location.geocodeAsync(address);
            /**
             * get the first location point in the array of geolocation returned
             */
            const geoLocation = geoLocationArray && geoLocationArray.length !== 0 ? geoLocationArray[0] : null;
            if (!geoLocation) {
                console.log(`Unable to retrieve user's home location's geolocation ${address}`);
            } else {
                // call the getOffers API
                const nearbyOffersResult = await API.graphql(graphqlOperation(getOffers, {
                    getOffersInput: {
                        availability: OfferAvailability.Global,
                        countryCode: CountryCode.Us,
                        filterType: OfferFilter.Nearby,
                        offerStates: [OfferState.Active, OfferState.Scheduled],
                        pageNumber: nearbyOffersPageNumber,
                        pageSize: 7, // load 7 nearby offers at a time
                        radiusIncludeOnlineStores: false, // do not include online offers in nearby offers list
                        radius: 50000, // radius of 50 km (50,000 meters) roughly equal to 25 miles
                        radiusLatitude: geoLocation.latitude,
                        radiusLongitude: geoLocation.longitude,
                        redemptionType: RedemptionType.Cardlinked
                    }
                }));

                // retrieve the data block from the response
                // @ts-ignore
                const responseData = nearbyOffersResult ? nearbyOffersResult.data : null;

                // check if there are any errors in the returned response
                if (responseData && responseData.getOffers.errorMessage === null) {
                    // retrieve the array of nearby offers from the API call
                    const nearbyOffers: Offer[] = responseData.getOffers.data.offers;

                    // ensure that there is at least one nearby offer in the list
                    if (nearbyOffers.length > 0) {
                        // increase page number
                        setNearbyOffersPageNumber(nearbyOffersPageNumber + 1);

                        // push any old offers into the list to return
                        setNearbyOfferList(nearbyOfferList.concat(nearbyOffers));

                        // set the nearby user location flag
                        setOffersNearUserLocationFlag(true);

                        // set the user geolocation information
                        setUserLatitude(geoLocation.latitude);
                        setUserLongitude(geoLocation.longitude);
                    } else {
                        console.log(`No offers near user's home location to display ${JSON.stringify(nearbyOffersResult)}`);
                    }
                } else {
                    console.log(`Unexpected error while retrieving offers near user's home location ${JSON.stringify(nearbyOffersResult)}`);
                    setModalVisible(true);
                }
            }
        } catch (error) {
            console.log(`Unexpected error while attempting to retrieve offers near user's home location ${JSON.stringify(error)} ${error}`);
            setModalVisible(true);
        }
    }

    /**
     * Function used to retrieve the list of offers nearby, that we will
     * display in the second category of the marketplace.
     *
     * @returns a {@link Promise} of {@link void} since this function will set the
     * React state of the nearby offers.
     */
    const retrieveNearbyOffersList = async (): Promise<void> => {
        try {
            // first retrieve the necessary permissions for location purposes
            const foregroundPermissionStatus = await Location.requestForegroundPermissionsAsync();
            // const backgroundPermissionStatus = await Location.requestBackgroundPermissionsAsync(); || backgroundPermissionStatus.status !== 'granted'
            if (foregroundPermissionStatus.status !== 'granted') {
                console.log(`Necessary location permissions not granted`);
            } else {
                // first retrieve the latitude and longitude of the current user
                const currentUserLocation: LocationObject = await Location.getCurrentPositionAsync();
                if (currentUserLocation && currentUserLocation.coords && currentUserLocation.coords.latitude && currentUserLocation.coords.longitude) {
                    // call the getOffers API
                    const nearbyOffersResult = await API.graphql(graphqlOperation(getOffers, {
                        getOffersInput: {
                            availability: OfferAvailability.Global,
                            countryCode: CountryCode.Us,
                            filterType: OfferFilter.Nearby,
                            offerStates: [OfferState.Active, OfferState.Scheduled],
                            pageNumber: nearbyOffersPageNumber,
                            pageSize: 7, // load 7 nearby offers at a time
                            radiusIncludeOnlineStores: false, // do not include online offers in nearby offers list
                            radius: 50000, // radius of 50 km (50,000 meters) roughly equal to 25 miles
                            radiusLatitude: currentUserLocation.coords.latitude,
                            radiusLongitude: currentUserLocation.coords.longitude,
                            redemptionType: RedemptionType.Cardlinked
                        }
                    }));

                    // retrieve the data block from the response
                    // @ts-ignore
                    const responseData = nearbyOffersResult ? nearbyOffersResult.data : null;

                    // check if there are any errors in the returned response
                    if (responseData && responseData.getOffers.errorMessage === null) {
                        // retrieve the array of nearby offers from the API call
                        const nearbyOffers: Offer[] = responseData.getOffers.data.offers;

                        // ensure that there is at least one nearby offer in the list
                        if (nearbyOffers.length > 0) {
                            // increase page number
                            setNearbyOffersPageNumber(nearbyOffersPageNumber + 1);

                            // push any old offers into the list to return
                            setNearbyOfferList(nearbyOfferList.concat(nearbyOffers));

                            // set the user geolocation information
                            setUserLatitude(currentUserLocation.coords.latitude);
                            setUserLongitude(currentUserLocation.coords.longitude);
                        } else {
                            console.log(`No nearby offers to display ${JSON.stringify(nearbyOffersResult)}`);
                            // fallback to offers near their home address
                            userInformation["address"] && userInformation["address"]["formatted"] && await retrieveOffersNearLocation(userInformation["address"]["formatted"]);
                        }
                    } else {
                        console.log(`Unexpected error while retrieving nearby offers ${JSON.stringify(nearbyOffersResult)}`);
                        setModalVisible(true);
                    }
                } else {
                    console.log(`Unable to retrieve the current user's location coordinates!`);
                    setModalVisible(true);
                }
            }
        } catch (error) {
            console.log(`Unexpected error while attempting to retrieve nearby offers ${JSON.stringify(error)} ${error}`);

            // @ts-ignore
            if (!error.code || error.code !== 'ERR_LOCATION_INFO_PLIST') {
                setModalVisible(true);
            } else {
                // fallback to offers near their home address
                userInformation["address"] && userInformation["address"]["formatted"] && await retrieveOffersNearLocation(userInformation["address"]["formatted"]);
            }
        }
    }

    /**
     * Function used to populate the nearby offers.
     *
     * @return a {@link React.ReactNode} or {@link React.ReactNode[]} representing the
     * React node and/or nodes, representing the nearby offers.
     */
    const populateNearbyOffers = (): React.ReactNode | React.ReactNode[] => {
        let results: React.ReactNode[] = [];
        let nearbyOffersNumber = 0;
        if (nearbyOfferList.length !== 0) {
            for (const nearbyOffer of nearbyOfferList) {
                // get the physical location of this offer
                let physicalLocation: string = '';
                nearbyOffer.storeDetails!.forEach(store => {
                     physicalLocation = store!.isOnline === false ? store!.address1! : '';
                });

                // only get the true nearby offers (since this is an Olive bug
                physicalLocation !== '' && results.push(
                    <>
                        {
                            nearbyOffersNumber !== nearbyOfferList.length - 1
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
                                                            title={`${nearbyOffer.brandDba}`}
                                                            subtitle={nearbyOffer.reward!.type! === RewardType.RewardPercent
                                                                ? `${nearbyOffer.reward!.value}% Off`
                                                                : `$${nearbyOffer.reward!.value} Off`}
                                                            titleStyle={styles.nearbyOfferCardTitle}
                                                            subtitleStyle={styles.nearbyOfferCardSubtitle}
                                                            titleNumberOfLines={3}
                                                            subtitleNumberOfLines={3}/>
                                                        <Button
                                                            uppercase={false}
                                                            disabled={false}
                                                            onPress={() => {
                                                                // set the clicked offer/partner accordingly
                                                                setStoreOfferClicked(nearbyOffer);
                                                                navigation.navigate('StoreOffer', {})
                                                            }}
                                                            style={[styles.nearbyOfferCardActionButton]}
                                                            textColor={"#313030"}
                                                            buttonColor={"#F2FF5D"}
                                                            mode="outlined"
                                                            labelStyle={styles.nearbyOfferCardActionButtonLabel}>
                                                            {'View Offer'}
                                                        </Button>
                                                    </View>
                                                    <View style={{left: Dimensions.get('window').width / 20}}>
                                                        <Avatar
                                                            containerStyle={styles.nearbyOfferCardCover}
                                                            imageProps={{
                                                                resizeMode: 'contain'
                                                            }}
                                                            source={{uri: nearbyOffer.brandLogoSm!, cache: 'force-cache'}}
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
                                        style={{width: nearbyOffersNumber === nearbyOfferList.length - 1 ? Dimensions.get('window').width / 10 : Dimensions.get('window').width / 20}}/>
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
                                                            title={`${nearbyOffer.brandDba}`}
                                                            subtitle={nearbyOffer.reward!.type! === RewardType.RewardPercent
                                                                ? `${nearbyOffer.reward!.value}% Off`
                                                                : `$${nearbyOffer.reward!.value} Off`}
                                                            titleStyle={styles.nearbyOfferCardTitle}
                                                            subtitleStyle={styles.nearbyOfferCardSubtitle}
                                                            titleNumberOfLines={3}
                                                            subtitleNumberOfLines={3}/>
                                                        <Button
                                                            uppercase={false}
                                                            disabled={false}
                                                            onPress={() => {
                                                                // set the clicked offer/partner accordingly
                                                                setStoreOfferClicked(nearbyOffer);
                                                                navigation.navigate('StoreOffer', {})
                                                            }}
                                                            style={[styles.nearbyOfferCardActionButton]}
                                                            textColor={"#313030"}
                                                            buttonColor={"#F2FF5D"}
                                                            mode="outlined"
                                                            labelStyle={styles.nearbyOfferCardActionButtonLabel}>
                                                            {'View Offer'}
                                                        </Button>
                                                    </View>
                                                    <View style={{left: Dimensions.get('window').width / 20}}>
                                                        <Avatar
                                                            containerStyle={styles.nearbyOfferCardCover}
                                                            imageProps={{
                                                                resizeMode: 'contain'
                                                            }}
                                                            source={{uri: nearbyOffer.brandLogoSm!, cache: 'force-cache'}}
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
                                        style={{width: nearbyOffersNumber === nearbyOfferList.length - 1 ? Dimensions.get('window').width / 10 : Dimensions.get('window').width / 20}}/>
                                    <Card
                                        style={styles.loadCard}>
                                        <Card.Content>
                                            <View style={{flexDirection: 'column'}}>
                                                <View style={{
                                                    flexDirection: 'row',
                                                    marginTop: -10
                                                }}>
                                                    <View>
                                                        <Button
                                                            uppercase={false}
                                                            disabled={false}
                                                            onPress={async () => {
                                                                // set the loader
                                                                setNearbyOffersSpinnerShown(true);

                                                                // retrieve additional offers (either nearby, or near user's home location)
                                                                !offersNearUserLocationFlag
                                                                    ? await retrieveNearbyOffersList()
                                                                    : await retrieveOffersNearLocation(userInformation["address"]["formatted"]);

                                                                // release the loader
                                                                setNearbyOffersSpinnerShown(false);
                                                            }}
                                                            style={[styles.loadNearbyCardActionButton]}
                                                            textColor={"#313030"}
                                                            buttonColor={"#F2FF5D"}
                                                            mode="outlined"
                                                            labelStyle={styles.featuredPartnerCardActionButtonLabel}>
                                                            {'More'}
                                                        </Button>
                                                    </View>
                                                </View>
                                            </View>
                                        </Card.Content>
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
     * Function used to populate the nearby offers.
     *
     * @param filtered flag indicating whether we are to display the filtered
     * offers or not
     *
     * @return a {@link React.ReactNode} or {@link React.ReactNode[]} representing the
     * React node and/or nodes, representing the vertical offers.
     */
    const populateVerticalOffers = (filtered: boolean): React.ReactNode | React.ReactNode[] => {
        let results: React.ReactNode[] = [];
        let verticalOffersNumber = 0;

        // check which offer arrays to observe (filtered or all the other ones)
        const offerList: Offer[] = filtered ? filteredOfferList : nearbyOfferList.concat(onlineOfferList);

        // fidelis partner listing
        if (!filtered && !noFilteredOffersAvailable) {
            for (const fidelisPartner of fidelisPartnerList) {
                // retrieve appropriate offer for partner (everyday)
                let offer: Offer | null = null;
                for (const matchedOffer of fidelisPartner.offers) {
                    if (matchedOffer!.title!.includes("Military Discount")) {
                        offer = matchedOffer!;
                        break;
                    }
                }
                offer && results.push(
                    <>
                        <List.Item
                            onPress={() => {
                                // set the clicked offer/partner accordingly
                                setStoreOfferClicked(fidelisPartner);
                                navigation.navigate('StoreOffer', {});
                            }}
                            style={{marginLeft: '3%'}}
                            titleStyle={styles.verticalOfferName}
                            descriptionStyle={styles.verticalOfferBenefits}
                            titleNumberOfLines={1}
                            descriptionNumberOfLines={1}
                            title={fidelisPartner.brandName}
                            description={
                                <>
                                    {"Starting at "}
                                    <Text style={styles.verticalOfferBenefit}>
                                        {offer!.reward!.type! === RewardType.RewardPercent
                                            ? `${offer!.reward!.value}%`
                                            : `$${offer!.reward!.value}`}
                                    </Text>
                                    {" Off "}
                                </>
                            }
                            left={() =>
                                <Avatar
                                    containerStyle={{
                                        marginRight: '5%'
                                    }}
                                    imageProps={{
                                        resizeMode: 'stretch'
                                    }}
                                    size={60}
                                    source={{uri: offer!.brandLogoSm!, cache: !shouldCacheImages ? 'reload': 'force-cache'}}
                                />}
                            right={() => <List.Icon color={'#F2FF5D'}
                                                    icon="chevron-right"/>}
                        />
                    </>
                )
            }
        }

        // offer listing
        if (offerList.length !== 0 && !noFilteredOffersAvailable) {
            for (const verticalOffer of offerList) {
                results.push(
                    <>
                        {
                            verticalOffersNumber !== offerList.length - 1
                                ?
                                <>
                                    <List.Item
                                        onPress={() => {
                                            // set the clicked offer/partner accordingly
                                            setStoreOfferClicked(verticalOffer);
                                            navigation.navigate('StoreOffer', {});
                                        }}
                                        style={{marginLeft: '3%'}}
                                        titleStyle={styles.verticalOfferName}
                                        descriptionStyle={styles.verticalOfferBenefits}
                                        titleNumberOfLines={1}
                                        descriptionNumberOfLines={1}
                                        title={verticalOffer.brandDba}
                                        description={
                                            <>
                                                <Text style={styles.verticalOfferBenefit}>
                                                    {verticalOffer.reward!.type! === RewardType.RewardPercent
                                                        ? `${verticalOffer.reward!.value}%`
                                                        : `$${verticalOffer.reward!.value}`}
                                                </Text>
                                                {" Off "}
                                            </>
                                        }
                                        left={() =>
                                            <Avatar
                                                containerStyle={{
                                                    marginRight: '5%'
                                                }}
                                                imageProps={{
                                                    resizeMode: 'stretch'
                                                }}
                                                size={60}
                                                source={{uri: verticalOffer.brandLogoSm!, cache: !shouldCacheImages ? 'reload': 'force-cache'}}
                                            />}
                                        right={() => <List.Icon color={'#F2FF5D'}
                                                                icon="chevron-right"/>}
                                    />
                                </>
                                :
                                <>
                                    <List.Item
                                        onPress={() => {
                                            // set the clicked offer/partner accordingly
                                            setStoreOfferClicked(verticalOffer);
                                            navigation.navigate('StoreOffer', {});
                                        }}
                                        style={{marginLeft: '3%'}}
                                        titleStyle={styles.verticalOfferName}
                                        descriptionStyle={styles.verticalOfferBenefits}
                                        titleNumberOfLines={1}
                                        descriptionNumberOfLines={1}
                                        title={verticalOffer.brandDba}
                                        description={
                                            <>
                                                <Text style={styles.verticalOfferBenefit}>
                                                    {verticalOffer.reward!.type! === RewardType.RewardPercent
                                                        ? `${verticalOffer.reward!.value}%`
                                                        : `$${verticalOffer.reward!.value}`}
                                                </Text>
                                                {" Off "}
                                            </>
                                        }
                                        left={() =>
                                            <Avatar
                                                containerStyle={{
                                                    marginRight: '5%'
                                                }}
                                                imageProps={{
                                                    resizeMode: 'stretch'
                                                }}
                                                size={60}
                                                source={{uri: verticalOffer.brandLogoSm!, cache: !shouldCacheImages ? 'reload': 'force-cache'}}
                                            />}
                                        right={() => <List.Icon color={'#F2FF5D'}
                                                                icon="chevron-right"/>}
                                    />
                                    {!filtered &&
                                        <List.Item
                                            rippleColor={'transparent'}
                                            onPress={async () => {
                                                // set the loader
                                                setFilteredOffersSpinnerShown(true);

                                                // retrieve additional offers (either nearby, or near user's home location)
                                                await retrieveOnlineOffersList();
                                                !offersNearUserLocationFlag
                                                    ? await retrieveNearbyOffersList()
                                                    : await retrieveOffersNearLocation(userInformation["address"]["formatted"]);

                                                // release the loader
                                                setFilteredOffersSpinnerShown(false);
                                            }}
                                            style={{
                                                marginLeft: Dimensions.get('window').width / 2.8,
                                                top: Dimensions.get('window').height / 50
                                            }}
                                            titleStyle={[styles.verticalOfferName, {color: '#F2FF5D'}]}
                                            titleNumberOfLines={1}
                                            title={'See More'}
                                        />
                                    }
                                    {
                                        (searchQuery === 'sort by: online'
                                            || searchQuery === 'sort by: nearby locations'
                                            || searchQuery === 'sort by: discount percentage') &&
                                        <List.Item
                                            rippleColor={'transparent'}
                                            onPress={async () => {
                                                // set the loader
                                                setFilteredOffersSpinnerShown(true);

                                                // retrieve additional offers (either nearby, or near user's home location)
                                                await retrieveOnlineOffersList();
                                                !offersNearUserLocationFlag
                                                    ? await retrieveNearbyOffersList()
                                                    : await retrieveOffersNearLocation(userInformation["address"]["formatted"]);

                                                // release the loader
                                                setFilteredOffersSpinnerShown(false);
                                            }}
                                            style={{
                                                marginLeft: Dimensions.get('window').width / 2.8,
                                                top: Dimensions.get('window').height / 50
                                            }}
                                            titleStyle={[styles.verticalOfferName, {color: '#F2FF5D'}]}
                                            titleNumberOfLines={1}
                                            title={'See More'}
                                        />
                                    }
                                </>
                        }
                    </>
                );
                verticalOffersNumber += 1;
            }
        } else {
            results.push(
                <>
                    <List.Item
                        style={{marginLeft: Dimensions.get('window').width / 3.5, top: '1%'}}
                        titleStyle={[styles.verticalOfferName, {color: '#F2FF5D'}]}
                        titleNumberOfLines={1}
                        title={'No offers found!'}
                    />
                </>
            )
        }
        return results;
    }

    /**
     * Function used to retrieve the list of online offers for a given brand name.
     *
     * @param brandName brand name to query for.
     *
     * @returns a {@link Promise} of {@link void} since this function will set the
     * React state of the queried.
     */
    const retrieveOnlineOffersForBrand = async (brandName: string): Promise<void> => {
        try {
            // call the getOffers API
            const onlineOffersResult = await API.graphql(graphqlOperation(getOffers, {
                getOffersInput: {
                    availability: OfferAvailability.Global,
                    countryCode: CountryCode.Us,
                    filterType: OfferFilter.Online,
                    offerStates: [OfferState.Active, OfferState.Scheduled],
                    pageNumber: 1,
                    pageSize: 7, // load 7 nearby offers at a time
                    redemptionType: RedemptionType.Cardlinked,
                    brandName: brandName
                }
            }));

            // retrieve the data block from the response
            // @ts-ignore
            const responseData = onlineOffersResult ? onlineOffersResult.data : null;

            // check if there are any errors in the returned response
            if (responseData && responseData.getOffers.errorMessage === null) {
                // retrieve the array of online offers from the API call
                const onlineOffers: Offer[] = responseData.getOffers.data.offers;

                // ensure that there is at least one online offer in the list
                if (onlineOffers.length > 0) {
                    console.log(`Online offers found for brand ${brandName}`);

                    // push any old offers into the list to return
                    setFilteredOfferList(filteredOfferList.concat(onlineOffers));

                    // set the no filtered offers available flag accordingly
                    setNoFilteredOffersAvailable(false);
                } else {
                    console.log(`No online offers to display for brand name ${brandName} ${JSON.stringify(onlineOffersResult)}`);

                    // set the no filtered offers available flag accordingly
                    setNoFilteredOffersAvailable(true);
                }
            } else {
                console.log(`Unexpected error while retrieving online offers ${JSON.stringify(onlineOffersResult)}`);
                setModalVisible(true);
            }
        } catch (error) {
            console.log(`Unexpected error while attempting to retrieve online offers ${JSON.stringify(error)} ${error}`);
            setModalVisible(true);
        }
    }

    /**
     * Function used to retrieve the list of offers nearby for a given brand name.
     *
     * @param brandName brand name to query for.
     *
     * @returns a {@link Promise} of {@link void} since this function will set the
     * React state of the queried offers.
     */
    const retrieveNearbyOffersListForBrand = async (brandName: string): Promise<void> => {
        try {
            // call the getOffers API
            const nearbyOffersResult = await API.graphql(graphqlOperation(getOffers, {
                getOffersInput: {
                    availability: OfferAvailability.Global,
                    countryCode: CountryCode.Us,
                    filterType: OfferFilter.Nearby,
                    offerStates: [OfferState.Active, OfferState.Scheduled],
                    pageNumber: 1,
                    pageSize: 7, // load 7 nearby offers at a time
                    radiusIncludeOnlineStores: false, // do not include online offers in nearby offers list
                    radius: 50000, // radius of 50 km (50,000 meters) roughly equal to 25 miles
                    radiusLatitude: userLatitude,
                    radiusLongitude: userLongitude,
                    redemptionType: RedemptionType.Cardlinked,
                    brandName: brandName
                }
            }));

            // retrieve the data block from the response
            // @ts-ignore
            const responseData = nearbyOffersResult ? nearbyOffersResult.data : null;

            // check if there are any errors in the returned response
            if (responseData && responseData.getOffers.errorMessage === null) {
                // retrieve the array of nearby offers from the API call
                const nearbyOffers: Offer[] = responseData.getOffers.data.offers;

                // ensure that there is at least one nearby offer in the list
                if (nearbyOffers.length > 0) {
                    console.log(`Nearby offers found for brand ${brandName}`);

                    // push any old offers into the list to return
                    setFilteredOfferList(filteredOfferList.concat(nearbyOffers));

                    // set the no filtered offers available flag accordingly
                    setNoFilteredOffersAvailable(false);
                } else {
                    console.log(`No nearby offers to display for brand name ${brandName} ${JSON.stringify(nearbyOffersResult)}`);

                    // set the no filtered offers available flag accordingly
                    setNoFilteredOffersAvailable(true);

                    await retrieveOnlineOffersForBrand(brandName);
                }
            } else {
                console.log(`Unexpected error while attempting to retrieve nearby offers for brand name ${brandName} ${JSON.stringify(nearbyOffersResult)}`);
                setModalVisible(true);
            }
        } catch (error) {
            console.log(`Unexpected error while attempting to retrieve nearby offers for brand name ${brandName} ${JSON.stringify(error)} ${error}`);

            setModalVisible(true);
        }
    }

    /**
     * Function used to retrieve the list of queried offers (by brand name), that we will
     * display based on a search-based query in the marketplace.
     *
     * @returns a {@link Promise} of {@link void} since this function will set the
     * React state of the queried offers (by brand name).
     */
    const retrieveQueriedOffers = async (query: string): Promise<void> => {
        try {
            /**
             * check to see if we have valid latitude and longitude values
             * then we need to first query for nearby offers for brand.
             */
            if (userLatitude !== 1 && userLongitude !== 1) {
                await retrieveNearbyOffersListForBrand(query);
            } else {
                /**
                 * we will look up online offers for brand.
                 */
                await retrieveOnlineOffersForBrand(query);
            }
        } catch (error) {
            console.log(`Unexpected error while attempting to retrieve queried offers ${JSON.stringify(error)} ${error}`);
            setModalVisible(true);
        }
    }

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        const loadData = async (): Promise<void> => {
            await retrieveFidelisPartnerList();
            await retrieveNearbyOffersList();
            await retrieveOnlineOffersList();
        }
        fidelisPartnerList.length === 0 && nearbyOfferList.length === 0 && onlineOfferList.length === 0 && loadData().then(_ => {
            // release the loader on button press
            !isReady && setIsReady(true);
        });

        // change the filtered list, based on the search query
        if (searchQuery !== '') {
            switch (searchQuery) {
                case 'sort by: online':
                    setFilteredOfferList(onlineOfferList);
                    setToggleViewPressed('vertical');
                    break;
                case 'sort by: nearby locations':
                    setFilteredOfferList(nearbyOfferList);
                    setToggleViewPressed('vertical');
                    break;
                case 'sort by: discount percentage':
                    // get the Fidelis offers to filter
                    for (const fidelisPartner of fidelisPartnerList) {
                        for (const matchedOffer of fidelisPartner.offers) {
                            // push the Fidelis offer in the list of Fidelis offers, later to be able to use in filtering
                            fidelisOfferList.push(matchedOffer!);
                        }
                    }
                    const offersToSort = nearbyOfferList.concat(onlineOfferList).concat(fidelisOfferList);
                    setFilteredOfferList(offersToSort.sort((a, b) =>
                        a.reward!.value! > b.reward!.value! ? -1 : a.reward!.value! < b.reward!.value! ? 1 : 0));
                    setToggleViewPressed('vertical');
                    break
                default:
                    break;
            }
        }

    }, [fidelisPartnerList, onlineOfferList, nearbyOfferList, searchQuery]);

    // return the component for the Store page
    return (
        <>
            {
                !isReady ?
                    <Spinner loadingSpinnerShown={loadingSpinnerShown}
                             setLoadingSpinnerShown={setLoadingSpinnerShown}/>
                    :
                    <>
                        <Portal>
                            <Dialog style={commonStyles.dialogStyle} visible={modalVisible}
                                    onDismiss={() => setModalVisible(false)}>
                                <Dialog.Icon icon="alert" color={"#F2FF5D"}
                                             size={Dimensions.get('window').height / 14}/>
                                <Dialog.Title
                                    style={commonStyles.dialogTitle}>{'Marketplace Crashing'}</Dialog.Title>
                                <Dialog.Content>
                                    <Text
                                        style={commonStyles.dialogParagraph}>{'Unexpected error while loading offers for marketplace!'}</Text>
                                </Dialog.Content>
                                <Dialog.Actions>
                                    <Button style={commonStyles.dialogButton}
                                            labelStyle={commonStyles.dialogButtonText}
                                            onPress={() => {
                                                setModalVisible(false);
                                            }}>
                                        {'Try Again'}
                                    </Button>
                                </Dialog.Actions>
                            </Dialog>
                        </Portal>
                        <KeyboardAwareScrollView
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                            enableAutomaticScroll={(Platform.OS === 'ios')}
                            contentContainerStyle={commonStyles.rowContainer}
                            keyboardShouldPersistTaps={'handled'}
                        >
                            <SafeAreaView style={[styles.mainView]}>
                                <View style={styles.titleView}>
                                    <View style={{
                                        paddingRight: Dimensions.get('window').width / 4.5
                                    }}>
                                        <Text style={styles.mainTitle}>
                                            Shop
                                        </Text>
                                        <Text style={styles.mainSubtitle}>
                                            at select merchant partners.
                                        </Text>
                                    </View>
                                    <ToggleButton.Group
                                        onValueChange={(value) => {
                                            value === 'horizontal' && searchQuery !== '' && setSearchQuery('');
                                            value !== null && setToggleViewPressed(value);

                                            // clear the filtered list and set appropriate flags
                                            if (value === 'horizontal' && filteredOfferList.length !== 0) {
                                                setFilteredOfferList([]);

                                                // set the no filtered offers available flag accordingly
                                                setNoFilteredOffersAvailable(false);
                                            }
                                        }}
                                        value={toggleViewPressed}>
                                        <ToggleButton
                                            style={styles.toggleViewButton}
                                            size={toggleViewPressed === 'horizontal' ? Dimensions.get('window').width / 13 : Dimensions.get('window').width / 15}
                                            icon="collage"
                                            value="horizontal"
                                            iconColor={toggleViewPressed === 'horizontal' ? '#F2FF5D' : '#5B5A5A'}
                                        />
                                        <ToggleButton
                                            style={styles.toggleViewButton}
                                            size={toggleViewPressed === 'vertical' ? Dimensions.get('window').width / 13 : Dimensions.get('window').width / 15}
                                            icon="format-list-bulleted-type"
                                            value="vertical"
                                            iconColor={toggleViewPressed === 'vertical' ? '#F2FF5D' : '#5B5A5A'}
                                        />
                                    </ToggleButton.Group>
                                </View>
                                <Searchbar
                                    selectionColor={'#F2FF5D'}
                                    iconColor={'#F2FF5D'}
                                    inputStyle={styles.searchBarInput}
                                    style={styles.searchBar}
                                    placeholder="Search for a merchant partner"
                                    onClearIconPress={(_) => {
                                        // clear the filtered list and set appropriate flags
                                        setFilteredOfferList([]);

                                        // set the no filtered offers available flag accordingly
                                        setNoFilteredOffersAvailable(false);

                                        // set the caching flag for images accordingly
                                        setShouldCacheImages(false);
                                    }}
                                    onSubmitEditing={async (event) => {
                                        console.log("searching", event.nativeEvent.text);
                                        // set the loader
                                        setFilteredOffersSpinnerShown(true);

                                        // retrieve additional offers
                                        await retrieveQueriedOffers(event.nativeEvent.text);

                                        // release the loader
                                        setFilteredOffersSpinnerShown(false);

                                        if (toggleViewPressed === 'horizontal') {
                                            setToggleViewPressed('vertical');
                                        }
                                    }}
                                    onChangeText={(query) => setSearchQuery(query)}
                                    value={searchQuery}
                                />
                                <View
                                    style={[styles.filterChipView]}>
                                    <Chip mode={'flat'}
                                          style={[styles.filterChip, searchQuery === 'sort by: online' ? {backgroundColor: '#F2FF5D'} : {backgroundColor: '#5B5A5A'}]}
                                          textStyle={[styles.filterChipText, searchQuery === 'sort by: online' ? {color: '#5B5A5A'} : {color: '#F2FF5D'}]}
                                          icon={() => (
                                              <Icon name="web"
                                                    type={'material-community'}
                                                    size={Dimensions.get('window').height / 40}
                                                    color={searchQuery === 'sort by: online' ? '#5B5A5A' : '#F2FF5D'}/>
                                          )}
                                          onPress={() => {
                                              if (searchQuery === 'sort by: online') {
                                                  // clear the filtered list and set appropriate flags
                                                  setFilteredOfferList([]);

                                                  // set the no filtered offers available flag accordingly
                                                  setNoFilteredOffersAvailable(false);

                                                  setSearchQuery('')
                                              } else {
                                                  setSearchQuery('sort by: online');
                                              }
                                          }}>Online</Chip>
                                    <Chip mode={'flat'}
                                          style={[styles.filterChip, searchQuery === 'sort by: discount percentage' ? {backgroundColor: '#F2FF5D'} : {backgroundColor: '#5B5A5A'}]}
                                          textStyle={[styles.filterChipText, searchQuery === 'sort by: discount percentage' ? {color: '#5B5A5A'} : {color: '#F2FF5D'}]}
                                          icon={() => (
                                              <Icon name="percent"
                                                    type={'material-community'}
                                                    size={Dimensions.get('window').height / 40}
                                                    color={searchQuery === 'sort by: discount percentage' ? '#5B5A5A' : '#F2FF5D'}/>
                                          )}
                                          onPress={() => {
                                              if (searchQuery === 'sort by: discount percentage') {
                                                  // clear the filtered list and set appropriate flags
                                                  setFilteredOfferList([]);

                                                  // set the no filtered offers available flag accordingly
                                                  setNoFilteredOffersAvailable(false);

                                                  setSearchQuery('')
                                              } else {
                                                  setSearchQuery('sort by: discount percentage');
                                              }
                                          }}>Discount</Chip>
                                    {nearbyOfferList.length !== 0 &&
                                        <Chip mode={'outlined'}
                                              style={[styles.filterChip, searchQuery === 'sort by: nearby locations' ? {backgroundColor: '#F2FF5D'} : {backgroundColor: '#5B5A5A'}]}
                                              icon={() => (
                                                  <Icon name="map-marker"
                                                        type={'material-community'}
                                                        size={Dimensions.get('window').height / 45}
                                                        color={searchQuery === 'sort by: nearby locations' ? '#5B5A5A' : '#F2FF5D'}/>
                                              )}
                                              textStyle={[styles.filterChipText, searchQuery === 'sort by: nearby locations' ? {color: '#5B5A5A'} : {color: '#F2FF5D'}]}
                                              onPress={() => {
                                                  if (searchQuery === 'sort by: nearby locations') {
                                                      // clear the filtered list and set appropriate flags
                                                      setFilteredOfferList([]);

                                                      // set the no filtered offers available flag accordingly
                                                      setNoFilteredOffersAvailable(false);

                                                      setSearchQuery('')
                                                  } else {
                                                      setSearchQuery('sort by: nearby locations');
                                                  }
                                              }}>Nearby</Chip>
                                    }
                                </View>
                                <View style={{
                                    height: Dimensions.get('window').height / 100,
                                    backgroundColor: '#313030'
                                }}/>
                                <Portal.Host>
                                    <Spinner loadingSpinnerShown={filteredOffersSpinnerShown}
                                             setLoadingSpinnerShown={setFilteredOffersSpinnerShown}
                                             fullScreen={false}
                                    />
                                    <View style={styles.content}>
                                        <ScrollView
                                            scrollEnabled={true}
                                            persistentScrollbar={false}
                                            showsVerticalScrollIndicator={false}
                                            keyboardShouldPersistTaps={'handled'}
                                            contentContainerStyle={{paddingBottom: Dimensions.get('window').height / 20}}
                                        >
                                            {
                                                toggleViewPressed === 'vertical' &&
                                                <>
                                                    <List.Section
                                                        style={{width: Dimensions.get('window').width}}
                                                    >
                                                        <>
                                                            {
                                                                populateVerticalOffers(filteredOfferList.length !== 0)
                                                            }
                                                        </>
                                                    </List.Section>
                                                </>
                                            }
                                            {
                                                toggleViewPressed === 'horizontal' &&
                                                <>
                                                    <View style={styles.horizontalScrollView}>
                                                        <View style={styles.featuredPartnersView}>
                                                            <Text style={styles.featuredPartnersTitleMain}>
                                                                <Text style={styles.featuredPartnersTitle}>
                                                                    Fidelis Partner Offers
                                                                </Text>{`   🎖`}️
                                                            </Text>
                                                            <ScrollView
                                                                style={[styles.featuredPartnersScrollView, nearbyOfferList.length === 0 && {left: Dimensions.get('window').width / 40}]}
                                                                horizontal={true}
                                                                decelerationRate={"fast"}
                                                                snapToInterval={Dimensions.get('window').width / 1.15 + Dimensions.get('window').width / 20}
                                                                snapToAlignment={"center"}
                                                                scrollEnabled={true}
                                                                persistentScrollbar={false}
                                                                showsHorizontalScrollIndicator={false}>
                                                                {
                                                                    <>
                                                                        {
                                                                            populateFidelisPartners()
                                                                        }
                                                                    </>
                                                                }
                                                            </ScrollView>
                                                        </View>
                                                        {nearbyOfferList.length > 0 &&
                                                            <View style={styles.nearbyOffersView}>
                                                                <View style={styles.nearbyOffersTitleView}>
                                                                    <View style={styles.nearbyOffersLeftTitleView}>
                                                                        <Text
                                                                            style={[styles.nearbyOffersTitleMain, offersNearUserLocationFlag && {left: '7%'}]}>
                                                                            <Text
                                                                                style={styles.nearbyOffersTitle}>
                                                                                {!offersNearUserLocationFlag
                                                                                    ? 'Offers near you'
                                                                                    : `Offers in ${userInformation["address"]["formatted"].split(',')[1]},${userInformation["address"]["formatted"].split(',')[2]}`}
                                                                            </Text>{`   📍️`}
                                                                        </Text>
                                                                        <Text
                                                                            style={[styles.nearbyOffersTitleSub, offersNearUserLocationFlag && {left: '7%'}]}>
                                                                            (within 25 miles)
                                                                        </Text>
                                                                    </View>
                                                                    <TouchableOpacity onPress={() => {
                                                                        setToggleViewPressed('vertical');

                                                                        // set the search query manually
                                                                        setSearchQuery('sort by: nearby locations');
                                                                    }}>
                                                                        <Text
                                                                            style={styles.nearbyOffersTitleButton}>
                                                                            See All
                                                                        </Text>
                                                                    </TouchableOpacity>
                                                                </View>
                                                                <Portal.Host>
                                                                    <Spinner
                                                                        loadingSpinnerShown={nearbyOffersSpinnerShown}
                                                                        setLoadingSpinnerShown={setNearbyOffersSpinnerShown}
                                                                        fullScreen={false}/>
                                                                    <ScrollView
                                                                        style={styles.nearbyOffersScrollView}
                                                                        horizontal={true}
                                                                        decelerationRate={"fast"}
                                                                        snapToInterval={Dimensions.get('window').width / 1.3 + Dimensions.get('window').width / 20}
                                                                        snapToAlignment={"start"}
                                                                        scrollEnabled={true}
                                                                        persistentScrollbar={false}
                                                                        showsHorizontalScrollIndicator={false}>
                                                                        {
                                                                            <>
                                                                                {
                                                                                    populateNearbyOffers()
                                                                                }
                                                                            </>
                                                                        }
                                                                    </ScrollView>
                                                                </Portal.Host>
                                                            </View>
                                                        }
                                                        <View
                                                            style={[styles.onlineOffersView, nearbyOfferList.length === 0 && {bottom: '40%'}]}>
                                                            <View style={styles.onlineOffersTitleView}>
                                                                <View style={styles.onlineOffersLeftTitleView}>
                                                                    <Text style={styles.onlineOffersTitleMain}>
                                                                        <Text style={styles.onlineOffersTitle}>
                                                                            Shop Online at
                                                                        </Text>{`   🛍️`}
                                                                    </Text>
                                                                </View>
                                                                <TouchableOpacity onPress={() => {
                                                                    setToggleViewPressed('vertical');

                                                                    // set the search query manually
                                                                    setSearchQuery('sort by: online');
                                                                }}>
                                                                    <Text style={styles.onlineOffersTitleButton}>
                                                                        See All
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                            <Portal.Host>
                                                                <Spinner
                                                                    loadingSpinnerShown={onlineOffersSpinnerShown}
                                                                    setLoadingSpinnerShown={setOnlineOffersSpinnerShown}
                                                                    fullScreen={false}/>
                                                                <ScrollView
                                                                    style={[styles.onlineOffersScrollView, nearbyOfferList.length === 0 && {left: Dimensions.get('window').width / 500}]}
                                                                    horizontal={true}
                                                                    decelerationRate={"fast"}
                                                                    snapToInterval={Dimensions.get('window').width / 3 * 3}
                                                                    snapToAlignment={"start"}
                                                                    scrollEnabled={true}
                                                                    persistentScrollbar={false}
                                                                    showsHorizontalScrollIndicator={false}
                                                                >
                                                                    {
                                                                        <>
                                                                            {
                                                                                populateOnlineOffers()
                                                                            }
                                                                        </>
                                                                    }
                                                                </ScrollView>
                                                            </Portal.Host>
                                                        </View>
                                                    </View>
                                                </>
                                            }
                                        </ScrollView>
                                    </View>
                                </Portal.Host>
                            </SafeAreaView>
                        </KeyboardAwareScrollView>
                    </>
            }
        </>
    );
};
