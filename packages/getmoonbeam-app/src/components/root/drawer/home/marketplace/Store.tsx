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

/**
 * Interface to be used for determining the location of a nearby
 * offer's store, to be used when displaying it on a map.
 */
interface NearbyOfferStoreLocation {
    latitude: number,
    longitude: number,
    latitudeDelta: number,
    longitudeDelta: number
}

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
    const [onlineOffersSpinnerShown, setOnlineOffersSpinnerShown] = useState<boolean>(false);
    const [nearbyOffersSpinnerShown, setNearbyOffersSpinnerShown] = useState<boolean>(false);
    const [toggleViewPressed, setToggleViewPressed] = useState<'horizontal' | 'vertical'>('horizontal');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [nearbyOfferList, setNearbyOfferList] = useState<Offer[]>([]);
    const [onlineOfferList, setOnlineOfferList] = useState<Offer[]>([]);
    const [fidelisPartnerList, setFidelisPartnerList] = useState<FidelisPartner[]>([]);
    const [filteredOfferList, setFilteredOfferList] = useState<[]>([]);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [nearbyOffersPageNumber, setNearbyOffersPageNumber] = useState<number>(1);
    const [onlineOffersPageNumber, setOnlineOffersPageNumber] = useState<number>(1);

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
     * @param marketplaceListType the type of marketplace list organization to return
     *
     * @return a {@link React.ReactNode} or {@link React.ReactNode[]} representing the
     * React node and/or nodes, representing the Fidelis partners.
     */
    const populateFidelisPartners = (marketplaceListType: 'horizontal' | 'vertical'): React.ReactNode | React.ReactNode[] => {
        let results: React.ReactNode[] = [];
        let fidelisPartnerNumber = 0;
        if (fidelisPartnerList.length !== 0) {
            for (const fidelisPartner of fidelisPartnerList) {
                results.push(
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
                                                subtitle={fidelisPartner.numberOfOffers === 1
                                                    ? `${fidelisPartner.numberOfOffers} Offer Available`
                                                    : `${fidelisPartner.numberOfOffers} Offers Available`}
                                                titleStyle={styles.featuredPartnerCardTitle}
                                                subtitleStyle={styles.featuredPartnerCardSubtitle}
                                                titleNumberOfLines={3}
                                                subtitleNumberOfLines={3}/>
                                            <Button
                                                uppercase={false}
                                                disabled={false}
                                                onPress={() => {
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
                                                source={{uri: fidelisPartner.offers[0]!.brandLogoSm!}}
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
                    pageSize: 5, // load 5 nearby offers at a time
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
     * @param marketplaceListType the type of marketplace list organization to return
     *
     * @return a {@link React.ReactNode} or {@link React.ReactNode[]} representing the
     * React node and/or nodes, representing the online offers.
     */
    const populateOnlineOffers = (marketplaceListType: 'horizontal' | 'vertical'): React.ReactNode | React.ReactNode[] => {
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
                                                source={{uri: onlineOffer.brandLogoSm!}}
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
                                                    source={{uri: onlineOffer.brandLogoSm!}}
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
            const backgroundPermissionStatus = await Location.requestBackgroundPermissionsAsync();
            if (foregroundPermissionStatus.status !== 'granted' || backgroundPermissionStatus.status !== 'granted') {
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
                            pageSize: 5, // load 5 nearby offers at a time
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
                            setNearbyOfferList(nearbyOfferList.concat(nearbyOffers))
                        } else {
                            console.log(`No nearby offers to display ${JSON.stringify(nearbyOffersResult)}`);
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
            }
        }
    }

    /**
     * Function used to populate the nearby offers.
     *
     * @param marketplaceListType the type of marketplace list organization to return
     *
     * @return a {@link React.ReactNode} or {@link React.ReactNode[]} representing the
     * React node and/or nodes, representing the nearby offers.
     */
    const populateNearbyOffers = (marketplaceListType: 'horizontal' | 'vertical'): React.ReactNode | React.ReactNode[] => {
        let results: React.ReactNode[] = [];
        let nearbyOffersNumber = 0;
        if (nearbyOfferList.length !== 0) {
            for (const nearbyOffer of nearbyOfferList) {
                results.push(
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
                                                    flexDirection: 'row',
                                                    marginTop: -10
                                                }}>
                                                    <View>
                                                        <Card.Title
                                                            title={nearbyOffer.brandDba}
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
                                                    <View>
                                                        <Avatar
                                                            containerStyle={styles.nearbyOfferCardCover}
                                                            imageProps={{
                                                                resizeMode: 'contain'
                                                            }}
                                                            source={{uri: nearbyOffer.brandLogoSm!}}
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
                                </>
                                :
                                <>
                                    <Card
                                        style={styles.nearbyOfferCard}>
                                        <Card.Content>
                                            <View style={{flexDirection: 'column'}}>
                                                <View style={{
                                                    flexDirection: 'row',
                                                    marginTop: -10
                                                }}>
                                                    <View>
                                                        <Card.Title
                                                            title={nearbyOffer.brandDba}
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
                                                    <View>
                                                        <Avatar
                                                            containerStyle={styles.nearbyOfferCardCover}
                                                            imageProps={{
                                                                resizeMode: 'contain'
                                                            }}
                                                            source={{uri: nearbyOffer.brandLogoSm!}}
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

                                                                // retrieve additional offers
                                                                await retrieveNearbyOffersList();

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
    }, [fidelisPartnerList, onlineOfferList, nearbyOfferList]);

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
                                    onSubmitEditing={(event) => {
                                        console.log("searching", event.nativeEvent.text);
                                    }}
                                    onChangeText={(query) => setSearchQuery(query)}
                                    value={searchQuery}
                                />
                                <View
                                    style={[styles.filterChipView, nearbyOfferList.length === 0 && {right: Dimensions.get('window').width / 6.4}]}>
                                    <Chip mode={'flat'}
                                          style={[styles.filterChip, searchQuery === 'sort by: points' ? {backgroundColor: '#F2FF5D'} : {backgroundColor: '#5B5A5A'}]}
                                          textStyle={[styles.filterChipText, searchQuery === 'sort by: points' ? {color: '#5B5A5A'} : {color: '#F2FF5D'}]}
                                          icon={() => (
                                              <Icon name="web"
                                                    type={'material-community'}
                                                    size={Dimensions.get('window').height / 40}
                                                    color={searchQuery === 'sort by: points' ? '#5B5A5A' : '#F2FF5D'}/>
                                          )}
                                          onPress={() => {
                                              searchQuery === 'sort by: points' ? setSearchQuery('') : setSearchQuery('sort by: points');
                                          }}>Online</Chip>
                                    <Chip mode={'outlined'}
                                          style={[styles.filterChip, searchQuery === 'sort by: discount percentage' ? {backgroundColor: '#F2FF5D'} : {backgroundColor: '#5B5A5A'}]}
                                          textStyle={[styles.filterChipText, searchQuery === 'sort by: discount percentage' ? {color: '#5B5A5A'} : {color: '#F2FF5D'}]}
                                          icon={() => (
                                              <Icon name="percent-outline"
                                                    type={'material-community'}
                                                    size={Dimensions.get('window').height / 45}
                                                    color={searchQuery === 'sort by: discount percentage' ? '#5B5A5A' : '#F2FF5D'}/>
                                          )}
                                          onPress={() => {
                                              searchQuery === 'sort by: discount percentage' ? setSearchQuery('') : setSearchQuery('sort by: discount percentage');
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
                                                  searchQuery === 'sort by: nearby locations' ? setSearchQuery('') : setSearchQuery('sort by: nearby locations');
                                              }}>Nearby</Chip>
                                    }
                                </View>
                                <View style={{
                                    height: Dimensions.get('window').height / 100,
                                    backgroundColor: '#313030'
                                }}/>
                                <View style={styles.content}>
                                    <ScrollView
                                        scrollEnabled={true}
                                        persistentScrollbar={false}
                                        showsVerticalScrollIndicator={false}
                                        keyboardShouldPersistTaps={'handled'}
                                        contentContainerStyle={{paddingBottom: Dimensions.get('window').height / 10}}
                                    >
                                        {
                                            (toggleViewPressed === 'vertical' || filteredOfferList.length !== 0) &&
                                            <>
                                                <List.Section
                                                    style={{width: Dimensions.get('window').width}}
                                                >
                                                    <List.Item
                                                        onPress={() => {
                                                            navigation.navigate('StoreOffer', {});
                                                        }}
                                                        style={{marginLeft: '2%'}}
                                                        titleStyle={styles.verticalOfferName}
                                                        descriptionStyle={styles.verticalOfferBenefits}
                                                        titleNumberOfLines={1}
                                                        descriptionNumberOfLines={1}
                                                        title={'Amigo Provisions Co.'}
                                                        description={
                                                            <>
                                                                <Text
                                                                    style={styles.verticalOfferBenefit}>{'15'}%</Text>
                                                                {" Discount "}
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
                                                                rounded
                                                                source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                            />}
                                                        right={() => <List.Icon color={'#F2FF5D'}
                                                                                icon="chevron-right"/>}
                                                    />
                                                    <List.Item
                                                        onPress={() => {
                                                            navigation.navigate('StoreOffer', {});
                                                        }}
                                                        style={{marginLeft: '2%'}}
                                                        titleStyle={styles.verticalOfferName}
                                                        descriptionStyle={styles.verticalOfferBenefits}
                                                        titleNumberOfLines={1}
                                                        descriptionNumberOfLines={1}
                                                        title={'Amigo Provisions Co.'}
                                                        description={
                                                            <>
                                                                <Text
                                                                    style={styles.verticalOfferBenefit}>{'15'}%</Text>
                                                                {" Discount "}
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
                                                                rounded
                                                                source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                            />}
                                                        right={() => <List.Icon color={'#F2FF5D'}
                                                                                icon="chevron-right"/>}
                                                    />
                                                    <List.Item
                                                        onPress={() => {
                                                            navigation.navigate('StoreOffer', {});
                                                        }}
                                                        style={{marginLeft: '2%'}}
                                                        titleStyle={styles.verticalOfferName}
                                                        descriptionStyle={styles.verticalOfferBenefits}
                                                        titleNumberOfLines={1}
                                                        descriptionNumberOfLines={1}
                                                        title={'Amigo Provisions Co.'}
                                                        description={
                                                            <>
                                                                <Text
                                                                    style={styles.verticalOfferBenefit}>{'15'}%</Text>
                                                                {" Discount "}
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
                                                                rounded
                                                                source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                            />}
                                                        right={() => <List.Icon color={'#F2FF5D'}
                                                                                icon="chevron-right"/>}
                                                    />
                                                    <List.Item
                                                        onPress={() => {
                                                            navigation.navigate('StoreOffer', {});
                                                        }}
                                                        style={{marginLeft: '2%'}}
                                                        titleStyle={styles.verticalOfferName}
                                                        descriptionStyle={styles.verticalOfferBenefits}
                                                        titleNumberOfLines={1}
                                                        descriptionNumberOfLines={1}
                                                        title={'Amigo Provisions Co.'}
                                                        description={
                                                            <>
                                                                <Text
                                                                    style={styles.verticalOfferBenefit}>{'15'}%</Text>
                                                                {" Discount "}
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
                                                                rounded
                                                                source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                            />}
                                                        right={() => <List.Icon color={'#F2FF5D'}
                                                                                icon="chevron-right"/>}
                                                    />
                                                    <List.Item
                                                        onPress={() => {
                                                            navigation.navigate('StoreOffer', {});
                                                        }}
                                                        style={{marginLeft: '2%'}}
                                                        titleStyle={styles.verticalOfferName}
                                                        descriptionStyle={styles.verticalOfferBenefits}
                                                        titleNumberOfLines={1}
                                                        descriptionNumberOfLines={1}
                                                        title={'Amigo Provisions Co.'}
                                                        description={
                                                            <>
                                                                <Text
                                                                    style={styles.verticalOfferBenefit}>{'15'}%</Text>
                                                                {" Discount "}
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
                                                                rounded
                                                                source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                            />}
                                                        right={() => <List.Icon color={'#F2FF5D'}
                                                                                icon="chevron-right"/>}
                                                    />
                                                    <List.Item
                                                        onPress={() => {
                                                            navigation.navigate('StoreOffer', {});
                                                        }}
                                                        style={{marginLeft: '2%'}}
                                                        titleStyle={styles.verticalOfferName}
                                                        descriptionStyle={styles.verticalOfferBenefits}
                                                        titleNumberOfLines={1}
                                                        descriptionNumberOfLines={1}
                                                        title={'Amigo Provisions Co.'}
                                                        description={
                                                            <>
                                                                <Text
                                                                    style={styles.verticalOfferBenefit}>{'15'}%</Text>
                                                                {" Discount "}
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
                                                                rounded
                                                                source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                            />}
                                                        right={() => <List.Icon color={'#F2FF5D'}
                                                                                icon="chevron-right"/>}
                                                    />
                                                    <List.Item
                                                        onPress={() => {
                                                            navigation.navigate('StoreOffer', {});
                                                        }}
                                                        style={{marginLeft: '2%'}}
                                                        titleStyle={styles.verticalOfferName}
                                                        descriptionStyle={styles.verticalOfferBenefits}
                                                        titleNumberOfLines={1}
                                                        descriptionNumberOfLines={1}
                                                        title={'Amigo Provisions Co.'}
                                                        description={
                                                            <>
                                                                <Text
                                                                    style={styles.verticalOfferBenefit}>{'15'}%</Text>
                                                                {" Discount "}
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
                                                                rounded
                                                                source={{uri: 'https://www.flaticon.com/free-icon/facebook_5968764?term=logo&page=1&position=4&origin=search&related_id=5968764'}}
                                                            />}
                                                        right={() => <List.Icon color={'#F2FF5D'}
                                                                                icon="chevron-right"/>}
                                                    />
                                                </List.Section>
                                            </>
                                        }
                                        {
                                            (toggleViewPressed === 'horizontal' && filteredOfferList.length === 0) &&
                                            <>
                                                <View style={styles.horizontalScrollView}>
                                                    <View style={styles.featuredPartnersView}>
                                                        <Text style={styles.featuredPartnersTitleMain}>
                                                            <Text style={styles.featuredPartnersTitle}>
                                                                Fidelis Partner Offers
                                                            </Text>{`       🎖`}️
                                                        </Text>
                                                        <ScrollView
                                                            style={[styles.featuredPartnersScrollView, nearbyOfferList.length === 0 && { left: Dimensions.get('window').width/40}]}
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
                                                                        populateFidelisPartners('horizontal')
                                                                    }
                                                                </>
                                                            }
                                                        </ScrollView>
                                                    </View>
                                                    {nearbyOfferList.length > 0 &&
                                                        <View style={styles.nearbyOffersView}>
                                                            <View style={styles.nearbyOffersTitleView}>
                                                                <View style={styles.nearbyOffersLeftTitleView}>
                                                                    <Text style={styles.nearbyOffersTitleMain}>
                                                                        <Text style={styles.nearbyOffersTitle}>
                                                                            Offers near you
                                                                        </Text>{`       📍️`}
                                                                    </Text>
                                                                    <Text style={styles.nearbyOffersTitleSub}>
                                                                        (within 25 miles)
                                                                    </Text>
                                                                </View>
                                                                <TouchableOpacity onPress={() => {
                                                                    setToggleViewPressed('vertical');
                                                                }}>
                                                                    <Text style={styles.nearbyOffersTitleButton}>
                                                                        See All
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                            <Portal.Host>
                                                                <Spinner loadingSpinnerShown={nearbyOffersSpinnerShown}
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
                                                                                populateNearbyOffers('horizontal')
                                                                            }
                                                                        </>
                                                                    }
                                                                </ScrollView>
                                                            </Portal.Host>
                                                        </View>
                                                    }
                                                    <View style={[styles.onlineOffersView, nearbyOfferList.length === 0 && {bottom: '40%'}]}>
                                                        <View style={styles.onlineOffersTitleView}>
                                                            <View style={styles.onlineOffersLeftTitleView}>
                                                                <Text style={styles.onlineOffersTitleMain}>
                                                                    <Text style={styles.onlineOffersTitle}>
                                                                        Shop Online at
                                                                    </Text>{`       🛍️`}
                                                                </Text>
                                                            </View>
                                                            <TouchableOpacity onPress={() => {
                                                                setToggleViewPressed('vertical');
                                                            }}>
                                                                <Text style={styles.onlineOffersTitleButton}>
                                                                    See All
                                                                </Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                        <Portal.Host>
                                                            <Spinner loadingSpinnerShown={onlineOffersSpinnerShown}
                                                                     setLoadingSpinnerShown={setOnlineOffersSpinnerShown}
                                                                     fullScreen={false}/>
                                                            <ScrollView
                                                                style={[styles.onlineOffersScrollView, nearbyOfferList.length === 0 && { left: Dimensions.get('window').width/500}]}
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
                                                                            populateOnlineOffers("horizontal")
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
                            </SafeAreaView>
                        </KeyboardAwareScrollView>
                    </>
            }
        </>
    );
};


/**
 * Function to sort alphabetically an array of objects by some specific key.
 *
 * @param property Key of the object to sort.
 */
const dynamicSort = (property: string) => {
    let sortOrder = 1;

    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substring(1);
    }

    return function (a, b) {
        if (sortOrder == -1) {
            return b[property].localeCompare(a[property]);
        } else {
            return a[property].localeCompare(b[property]);
        }
    }
}
