import React, {useEffect} from "react";
import {View} from "react-native";
import {styles} from "../../../../../../styles/store.module";
import {Chip, Searchbar, Text, ToggleButton} from "react-native-paper";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {Icon} from "@rneui/base";
import {
    CountryCode,
    FidelisPartner,
    getOffers,
    Offer,
    OfferAvailability,
    OfferFilter,
    OfferState, RedemptionType
} from "@moonbeam/moonbeam-models";
import {API, graphqlOperation} from "aws-amplify";

/**
 * SearchSection component.
 *
 * @param props properties to be passed into the component
 * @constructor constructor for the component.
 */
export const SearchSection = (props: {
    searchQuery: string,
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>,
    toggleViewPressed: 'horizontal' | 'vertical',
    setToggleViewPressed: React.Dispatch<React.SetStateAction<'horizontal' | 'vertical'>>,
    filteredOfferList: Offer[],
    setFilteredOfferList: React.Dispatch<React.SetStateAction<Offer[]>>,
    setFilteredFidelisList: React.Dispatch<React.SetStateAction<FidelisPartner[]>>,
    filteredFidelisList: FidelisPartner[],
    nearbyOfferList: Offer[],
    fidelisPartnerList: FidelisPartner[],
    setNoFilteredOffersAvailable: React.Dispatch<React.SetStateAction<boolean>>,
    userLatitude: number,
    userLongitude: number,
    setModalVisible: React.Dispatch<React.SetStateAction<boolean>>
    setShouldCacheImages: React.Dispatch<React.SetStateAction<boolean>>,
    setFilteredOffersSpinnerShown: React.Dispatch<React.SetStateAction<boolean>>
}) => {

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
                    props.setFilteredOfferList(props.filteredOfferList.concat(onlineOffers));

                    // set the no filtered offers available flag accordingly
                    props.setNoFilteredOffersAvailable(false);
                } else {
                    console.log(`No online offers to display for brand name ${brandName} ${JSON.stringify(onlineOffersResult)}`);

                    // set the no filtered offers available flag accordingly
                    props.setNoFilteredOffersAvailable(true);
                }
            } else {
                console.log(`Unexpected error while retrieving online offers ${JSON.stringify(onlineOffersResult)}`);
                props.setModalVisible(true);
            }
        } catch (error) {
            console.log(`Unexpected error while attempting to retrieve online offers ${JSON.stringify(error)} ${error}`);
            props.setModalVisible(true);
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
            // first we filter the list of Fidelis partners which match
            const filteredPartner = props.fidelisPartnerList.filter(fidelisPartner => fidelisPartner.brandName.toLowerCase().includes(query.toLowerCase()));

            // if there are Fidelis partner offers to return, then return those, otherwise fallback to search for more
            if (filteredPartner.length !== 0) {
                props.setFilteredOfferList([]);
                // push the filtered fidelis partner into the list to return
                filteredPartner.forEach(partner => {
                    props.setFilteredFidelisList([partner!]);
                });

                // set the no filtered offers available flag accordingly
                props.setNoFilteredOffersAvailable(false);
            } else {
                props.setFilteredFidelisList([]);
                /**
                 * check to see if we have valid latitude and longitude values
                 * then we need to first query for nearby offers for brand.
                 */
                if (props.userLatitude !== 1 && props.userLongitude !== 1) {
                    await retrieveNearbyOffersListForBrand(query);
                } else {
                    /**
                     * we will look up online offers for brand.
                     */
                    await retrieveOnlineOffersForBrand(query);
                }
            }
        } catch (error) {
            console.log(`Unexpected error while attempting to retrieve queried offers ${JSON.stringify(error)} ${error}`);
            props.setModalVisible(true);
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
                    radiusLatitude: props.userLatitude,
                    radiusLongitude: props.userLongitude,
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
                    props.setFilteredOfferList(props.filteredOfferList.concat(nearbyOffers));

                    // set the no filtered offers available flag accordingly
                    props.setNoFilteredOffersAvailable(false);
                } else {
                    console.log(`No nearby offers to display for brand name ${brandName} ${JSON.stringify(nearbyOffersResult)}`);

                    // fallback to the online offers retrieval
                    await retrieveOnlineOffersForBrand(brandName);
                }
            } else {
                console.log(`Unexpected error while attempting to retrieve nearby offers for brand name ${brandName} ${JSON.stringify(nearbyOffersResult)}`);
                props.setModalVisible(true);
            }
        } catch (error) {
            console.log(`Unexpected error while attempting to retrieve nearby offers for brand name ${brandName} ${JSON.stringify(error)} ${error}`);
            props.setModalVisible(true);
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
    }, []);

    // return the component for the SearchSection page
    return (
        <>
            <View style={styles.titleView}>
                <View style={{alignSelf: 'flex-start'}}>
                    <Text style={styles.mainTitle}>
                        Shop
                    </Text>
                    <Text style={styles.mainSubtitle}>
                        at select merchant partners.
                    </Text>
                </View>
                <View style={{
                    alignSelf: 'flex-end',
                    flexDirection: 'row',
                    bottom: hp(7),
                    right: wp(3)
                }}>
                    <ToggleButton.Group
                        onValueChange={(value) => {
                            value === 'horizontal' && props.searchQuery !== '' && props.setSearchQuery('');
                            value !== null && props.setToggleViewPressed(value);

                            // clear the filtered list and set appropriate flags
                            if (value === 'horizontal' && props.filteredOfferList.length !== 0) {
                                props.setFilteredOfferList([]);
                                props.setFilteredFidelisList([]);

                                // set the no filtered offers available flag accordingly
                                props.setNoFilteredOffersAvailable(false);
                            }
                            // reset the search query
                            if (value === 'horizontal' && props.filteredOfferList.length === 0 && props.searchQuery.length !== 0) {
                                // clear the filtered list and set appropriate flags
                                props.setFilteredOfferList([]);
                                props.setFilteredFidelisList([]);

                                // set the no filtered offers available flag accordingly
                                props.setNoFilteredOffersAvailable(false);

                                // set the caching flag for images accordingly
                                props.setShouldCacheImages(false);
                            }
                        }}
                        value={props.toggleViewPressed}>
                        <ToggleButton
                            style={styles.toggleViewButton}
                            size={props.toggleViewPressed === 'horizontal' ? hp(4) : hp(4)}
                            icon="collage"
                            value="horizontal"
                            iconColor={props.toggleViewPressed === 'horizontal' ? '#F2FF5D' : '#5B5A5A'}
                        />
                        <ToggleButton
                            style={styles.toggleViewButton}
                            size={props.toggleViewPressed === 'vertical' ? hp(4) : hp(4)}
                            icon="format-list-bulleted-type"
                            value="vertical"
                            iconColor={props.toggleViewPressed === 'vertical' ? '#F2FF5D' : '#5B5A5A'}
                        />
                    </ToggleButton.Group>
                </View>
            </View>
            <Searchbar
                selectionColor={'#F2FF5D'}
                iconColor={'#F2FF5D'}
                placeholderTextColor={'#FFFFFF'}
                cursorColor={'#F2FF5D'}
                inputStyle={styles.searchBarInput}
                style={styles.searchBar}
                placeholder="Search for a merchant partner"
                onClearIconPress={(_) => {
                    // clear the filtered list and set appropriate flags
                    props.setFilteredOfferList([]);
                    props.setFilteredFidelisList([]);

                    // set the no filtered offers available flag accordingly
                    props.setNoFilteredOffersAvailable(false);

                    // set the caching flag for images accordingly
                    props.setShouldCacheImages(false);
                }}
                onSubmitEditing={async (event) => {
                    // flag to ensure that we are not looking up a previously filtered offer/partner
                    let reSearchFlag = false;

                    // first determine whether we are searching for something that's already displayed
                    if (props.filteredOfferList.length !== 0) {
                        props.filteredOfferList.forEach(offer => {
                            if (offer.brandDba!.toLowerCase() === event.nativeEvent.text.toLowerCase()) {
                                reSearchFlag = true;
                            }
                        })
                    }
                    if (props.filteredFidelisList.length !== 0) {
                        props.filteredFidelisList.forEach(partner => {
                            if (partner.brandName.toLowerCase().includes(event.nativeEvent.text.toLowerCase())) {
                                reSearchFlag = true;
                            }
                        });
                    }

                    if (!reSearchFlag) {
                        // set the loader
                        props.setFilteredOffersSpinnerShown(true);

                        // retrieve additional offers
                        await retrieveQueriedOffers(event.nativeEvent.text);

                        // release the loader
                        props.setFilteredOffersSpinnerShown(false);

                        if (props.toggleViewPressed === 'horizontal') {
                            props.setToggleViewPressed('vertical');
                        }
                    }
                }}
                onChangeText={(query) => props.setSearchQuery(query)}
                value={props.searchQuery}
            />
            <View
                style={[styles.filterChipView]}>
                <Chip mode={'flat'}
                      style={[styles.filterChip, props.searchQuery === 'sort by: online' ? {backgroundColor: '#F2FF5D'} : {backgroundColor: '#5B5A5A'}]}
                      textStyle={[styles.filterChipText, props.searchQuery === 'sort by: online' ? {color: '#5B5A5A'} : {color: '#F2FF5D'}]}
                      icon={() => (
                          <Icon name="web"
                                type={'material-community'}
                                size={hp(2.5)}
                                color={props.searchQuery === 'sort by: online' ? '#5B5A5A' : '#F2FF5D'}/>
                      )}
                      onPress={() => {
                          if (props.searchQuery === 'sort by: online') {
                              // clear the filtered list and set appropriate flags
                              props.setFilteredOfferList([]);
                              props.setFilteredFidelisList([]);

                              // set the no filtered offers available flag accordingly
                              props.setNoFilteredOffersAvailable(false);

                              props.setSearchQuery('')
                          } else {
                              props.setSearchQuery('sort by: online');
                          }
                      }}>Online</Chip>
                <Chip mode={'flat'}
                      style={[styles.filterChip, props.searchQuery === 'sort by: discount percentage' ? {backgroundColor: '#F2FF5D'} : {backgroundColor: '#5B5A5A'}]}
                      textStyle={[styles.filterChipText, props.searchQuery === 'sort by: discount percentage' ? {color: '#5B5A5A'} : {color: '#F2FF5D'}]}
                      icon={() => (
                          <Icon name="percent"
                                type={'material-community'}
                                size={hp(2.5)}
                                color={props.searchQuery === 'sort by: discount percentage' ? '#5B5A5A' : '#F2FF5D'}/>
                      )}
                      onPress={() => {
                          if (props.searchQuery === 'sort by: discount percentage') {
                              // clear the filtered list and set appropriate flags
                              props.setFilteredOfferList([]);
                              props.setFilteredFidelisList([]);

                              // set the no filtered offers available flag accordingly
                              props.setNoFilteredOffersAvailable(false);

                              props.setSearchQuery('')
                          } else {
                              props.setSearchQuery('sort by: discount percentage');
                          }
                      }}>Discount</Chip>
                {props.nearbyOfferList.length !== 0 &&
                    <Chip mode={'outlined'}
                          style={[styles.filterChip, props.searchQuery === 'sort by: nearby locations' ? {backgroundColor: '#F2FF5D'} : {backgroundColor: '#5B5A5A'}]}
                          icon={() => (
                              <Icon name="map-marker"
                                    type={'material-community'}
                                    size={hp(2.5)}
                                    color={props.searchQuery === 'sort by: nearby locations' ? '#5B5A5A' : '#F2FF5D'}/>
                          )}
                          textStyle={[styles.filterChipText, props.searchQuery === 'sort by: nearby locations' ? {color: '#5B5A5A'} : {color: '#F2FF5D'}]}
                          onPress={() => {
                              if (props.searchQuery === 'sort by: nearby locations') {
                                  // clear the filtered list and set appropriate flags
                                  props.setFilteredOfferList([]);
                                  props.setFilteredFidelisList([]);

                                  // set the no filtered offers available flag accordingly
                                  props.setNoFilteredOffersAvailable(false);

                                  props.setSearchQuery('')
                              } else {
                                  props.setSearchQuery('sort by: nearby locations');
                              }
                          }}>Nearby</Chip>
                }
            </View>
        </>
    );
};
