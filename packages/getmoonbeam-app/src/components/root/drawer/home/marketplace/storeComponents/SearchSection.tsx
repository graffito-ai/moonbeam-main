import React, {useEffect} from "react";
import {Keyboard, TouchableOpacity, View} from "react-native";
import {styles} from "../../../../../../styles/store.module";
import {Chip, Searchbar, Text, ToggleButton} from "react-native-paper";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {Icon} from "@rneui/base";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    filteredByDiscountPressedState, filteredOffersListState,
    filtersActiveState, noFilteredOffersToLoadState,
    searchQueryState,
    toggleViewPressedState,
    uniqueNearbyOffersListState,
    verticalSectionActiveState
} from "../../../../../../recoil/StoreOfferAtom";
import {bottomTabShownState} from "../../../../../../recoil/HomeAtom";
import {searchQueryExecute} from "../../../../../../utils/AppSync";
import {filteredOffersSpinnerShownState} from "../../../../../../recoil/AuthAtom";
import {currentUserLocationState} from "../../../../../../recoil/RootAtom";

/**
 * SearchSection component.
 *
 * @constructor constructor for the component.
 */
export const SearchSection = () => {
    // constants used to keep track of shared states
    const [, setBottomTabShown] = useRecoilState(bottomTabShownState);
    const deDupedNearbyOfferList = useRecoilValue(uniqueNearbyOffersListState);
    const [toggleViewPressed, setToggleViewPressed] = useRecoilState(toggleViewPressedState);
    const [searchQuery, setSearchQuery] = useRecoilState(searchQueryState);
    const [whichVerticalSectionActive, setWhichVerticalSectionActive] = useRecoilState(verticalSectionActiveState);
    const [, setFilteredByDiscountPressed] = useRecoilState(filteredByDiscountPressedState);
    const [, setAreFiltersActive] = useRecoilState(filtersActiveState);
    const [noFilteredOffersToLoad, setNoFilteredOffersToLoad] = useRecoilState(noFilteredOffersToLoadState);
    const [, setFilteredOffersList] = useRecoilState(filteredOffersListState);
    const [, setFilteredOffersSpinnerShown] = useRecoilState(filteredOffersSpinnerShownState);
    const [currentUserLocation,] = useRecoilState(currentUserLocationState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        if (toggleViewPressed === 'horizontal') {
            setWhichVerticalSectionActive(null);
        }
    }, [toggleViewPressed, whichVerticalSectionActive]);

    // return the component for the SearchSection page
    return (
        <>
            <View style={styles.titleView}>
                <View style={{alignSelf: 'flex-start'}}>
                    <Text style={styles.mainTitle}>
                        {
                            toggleViewPressed === 'map'
                                ? 'Find'
                                : 'Shop'
                        }
                    </Text>
                    <Text style={styles.mainSubtitle}>
                        {
                            toggleViewPressed === 'map'
                                ? 'your favorite brands.'
                                : 'at select merchants.'
                        }
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
                            // close keyboard if opened
                            Keyboard.dismiss();

                            if (value === 'horizontal') {
                                setBottomTabShown(true);
                                setToggleViewPressed(value);
                                setWhichVerticalSectionActive(null);

                                // reset any filtered offers
                                setNoFilteredOffersToLoad(false);
                                setFilteredOffersList([]);

                                // reset search query
                                setSearchQuery("");
                            }

                            if (value === 'vertical') {
                                setBottomTabShown(true);
                                setToggleViewPressed(value);
                                setWhichVerticalSectionActive('online');
                            }

                            if (value === 'map') {
                                setBottomTabShown(false);
                                setToggleViewPressed(value);

                                // reset any filtered offers
                                setNoFilteredOffersToLoad(false);
                                setFilteredOffersList([]);

                                // reset search query
                                setSearchQuery("");
                            }
                        }}
                        value={toggleViewPressed}>
                        <ToggleButton
                            style={styles.toggleViewButton}
                            size={toggleViewPressed === 'horizontal' ? hp(4) : hp(4)}
                            icon="collage"
                            value="horizontal"
                            iconColor={toggleViewPressed === 'horizontal' ? '#F2FF5D' : '#5B5A5A'}
                        />
                        <ToggleButton
                            style={styles.toggleViewButton}
                            size={toggleViewPressed === 'vertical' ? hp(4) : hp(4)}
                            icon="format-list-bulleted-type"
                            value="vertical"
                            iconColor={toggleViewPressed === 'vertical' ? '#F2FF5D' : '#5B5A5A'}
                        />
                        <ToggleButton
                            style={styles.toggleViewButton}
                            size={toggleViewPressed === 'map' ? hp(4) : hp(4)}
                            icon="map-legend"
                            value="map"
                            iconColor={toggleViewPressed === 'map' ? '#F2FF5D' : '#5B5A5A'}
                        />
                    </ToggleButton.Group>
                </View>
            </View>
            {
                toggleViewPressed !== 'map' &&
                <>
                    <View style={{flexDirection: 'row'}}>
                        {
                            whichVerticalSectionActive === 'search' &&
                            <TouchableOpacity
                                style={styles.searchBarBackButton}
                                onPress={() => {
                                    // set the appropriate vertical view
                                    setWhichVerticalSectionActive(null);
                                    setToggleViewPressed('horizontal');

                                    // reset any filtered offers
                                    setNoFilteredOffersToLoad(false);
                                    setFilteredOffersList([]);

                                    // reset search query
                                    setSearchQuery("");

                                    // dismiss keyboard
                                    Keyboard.dismiss();
                                }}
                            >
                                <Icon
                                    name="arrow-left"
                                    type={'octicon'}
                                    size={hp(3.5)}
                                    color={'#F2FF5D'}/>
                            </TouchableOpacity>
                        }
                        <Searchbar
                            blurOnSubmit={false}
                            autoFocus={whichVerticalSectionActive === 'search' && !noFilteredOffersToLoad}
                            selectionColor={'#F2FF5D'}
                            iconColor={'#F2FF5D'}
                            placeholderTextColor={'#FFFFFF'}
                            cursorColor={'#F2FF5D'}
                            inputStyle={styles.searchBarInput}
                            style={[styles.searchBar, whichVerticalSectionActive === 'search' && {
                                width: wp(85.3),
                                alignSelf: 'flex-end',
                                right: wp(0.5),
                            }]}
                            value={searchQuery}
                            placeholder={whichVerticalSectionActive === 'search' ? "" : "Search for anything (e.g \"Nike\" or \"food\")"}
                            onTouchEndCapture={() => {
                                // reset any filtered offers
                                setNoFilteredOffersToLoad(false);
                                setFilteredOffersList([]);

                                // set the appropriate vertical view
                                setWhichVerticalSectionActive('search');
                                setToggleViewPressed('vertical');
                            }}
                            onKeyPress={({nativeEvent}) => {
                                if (nativeEvent.key === 'Backspace') {
                                    // reset any filtered offers
                                    setNoFilteredOffersToLoad(false);
                                    setFilteredOffersList([]);
                                }
                            }}
                            onClearIconPress={(_) => {
                                // reset any filtered offers
                                setNoFilteredOffersToLoad(false);
                                setFilteredOffersList([]);

                                // reset search query
                                setSearchQuery("");
                            }}
                            onSubmitEditing={async (event) => {
                                setSearchQuery(event.nativeEvent.text);

                                // clean any previous offers
                                setFilteredOffersList([]);

                                // execute the search query
                                setFilteredOffersSpinnerShown(true);
                                const queriedOffers =
                                    (currentUserLocation !== null && currentUserLocation.coords.latitude !== null && currentUserLocation.coords.latitude !== undefined &&
                                    currentUserLocation.coords.longitude !== null && currentUserLocation.coords.longitude !== undefined)
                                        ? await searchQueryExecute(event.nativeEvent.text, currentUserLocation.coords.latitude, currentUserLocation.coords.longitude)
                                        : await searchQueryExecute(event.nativeEvent.text);
                                if (queriedOffers.length == 0) {
                                    setNoFilteredOffersToLoad(true);
                                    setFilteredOffersSpinnerShown(false);
                                } else {
                                    setNoFilteredOffersToLoad(false);
                                    setFilteredOffersList([...queriedOffers]);
                                }

                                // dismiss keyboard
                                Keyboard.dismiss();
                            }}
                            onChangeText={(query) => {
                                {
                                    // reset any filtered offers
                                    setNoFilteredOffersToLoad(false);
                                    setFilteredOffersList([]);

                                    // set the appropriate vertical view
                                    setWhichVerticalSectionActive('search');
                                    setToggleViewPressed('vertical');

                                    setSearchQuery(query);
                                }
                            }}
                        />
                    </View>
                    <View
                        style={[styles.filterChipView]}>
                        {
                            whichVerticalSectionActive !== 'search' &&
                            <>
                                <Chip mode={'flat'}
                                      style={[styles.verticalSectionActiveChip, whichVerticalSectionActive === 'click-only-online' ? {backgroundColor: '#F2FF5D'} : {backgroundColor: '#5B5A5A'}]}
                                      textStyle={[styles.verticalSectionActiveChipText, whichVerticalSectionActive === 'click-only-online' ? {color: '#5B5A5A'} : {color: '#F2FF5D'}]}
                                      icon={() => (
                                          <Icon name="star"
                                                type={'material-community'}
                                                size={hp(2)}
                                                color={whichVerticalSectionActive === 'click-only-online' ? '#5B5A5A' : '#F2FF5D'}/>
                                      )}
                                      onPress={() => {
                                          // reset the filters
                                          setFilteredByDiscountPressed(false);
                                          setAreFiltersActive(false);

                                          if (whichVerticalSectionActive === 'click-only-online') {
                                              setSearchQuery('');
                                              setWhichVerticalSectionActive(null);
                                              setToggleViewPressed('horizontal');
                                          } else {
                                              setWhichVerticalSectionActive('click-only-online');
                                              setToggleViewPressed('vertical');
                                          }
                                      }}>Premier</Chip>
                                <Chip mode={'flat'}
                                      style={[styles.verticalSectionActiveChip, whichVerticalSectionActive === 'fidelis' ? {backgroundColor: '#F2FF5D'} : {backgroundColor: '#5B5A5A'}]}
                                      textStyle={[styles.verticalSectionActiveChipText, whichVerticalSectionActive === 'fidelis' ? {color: '#5B5A5A'} : {color: '#F2FF5D'}]}
                                      icon={() => (
                                          <Icon name="military-tech"
                                                type={'material'}
                                                size={hp(2)}
                                                color={whichVerticalSectionActive === 'fidelis' ? '#5B5A5A' : '#F2FF5D'}/>
                                      )}
                                      onPress={() => {
                                          // reset the filters
                                          setFilteredByDiscountPressed(false);
                                          setAreFiltersActive(false);

                                          if (whichVerticalSectionActive === 'fidelis') {
                                              setSearchQuery('');
                                              setWhichVerticalSectionActive(null);
                                              setToggleViewPressed('horizontal');
                                          } else {
                                              setWhichVerticalSectionActive('fidelis');
                                              setToggleViewPressed('vertical');
                                          }
                                      }}>Fidelis</Chip>
                                <Chip mode={'flat'}
                                      style={[styles.verticalSectionActiveChip, whichVerticalSectionActive === 'online' ? {backgroundColor: '#F2FF5D'} : {backgroundColor: '#5B5A5A'}]}
                                      textStyle={[styles.verticalSectionActiveChipText, whichVerticalSectionActive === 'online' ? {color: '#5B5A5A'} : {color: '#F2FF5D'}]}
                                      icon={() => (
                                          <Icon name="web"
                                                type={'material-community'}
                                                size={hp(2)}
                                                color={whichVerticalSectionActive === 'online' ? '#5B5A5A' : '#F2FF5D'}/>
                                      )}
                                      onPress={() => {
                                          // reset the filters
                                          setFilteredByDiscountPressed(false);
                                          setAreFiltersActive(false);

                                          if (whichVerticalSectionActive === 'online') {
                                              setSearchQuery('');
                                              setWhichVerticalSectionActive(null);
                                              setToggleViewPressed('horizontal');
                                          } else {
                                              setWhichVerticalSectionActive('online');
                                              setToggleViewPressed('vertical');
                                          }
                                      }}>Online</Chip>
                            </>
                        }
                        {whichVerticalSectionActive !== 'search' && deDupedNearbyOfferList.length !== 0 &&
                            <>
                                <Chip mode={'outlined'}
                                      style={[styles.verticalSectionActiveChip, whichVerticalSectionActive === 'nearby' ? {backgroundColor: '#F2FF5D'} : {backgroundColor: '#5B5A5A'}]}
                                      icon={() => (
                                          <Icon name="map-marker"
                                                type={'material-community'}
                                                size={hp(2)}
                                                color={whichVerticalSectionActive === 'nearby' ? '#5B5A5A' : '#F2FF5D'}/>
                                      )}
                                      textStyle={[styles.verticalSectionActiveChipText, whichVerticalSectionActive === 'nearby' ? {color: '#5B5A5A'} : {color: '#F2FF5D'}]}
                                      onPress={() => {
                                          // reset the filters
                                          setFilteredByDiscountPressed(false);
                                          setAreFiltersActive(false);

                                          if (whichVerticalSectionActive === 'nearby') {
                                              setSearchQuery('');
                                              setWhichVerticalSectionActive(null);
                                              setToggleViewPressed('horizontal');
                                          } else {
                                              setWhichVerticalSectionActive('nearby');
                                              setToggleViewPressed('vertical');
                                          }
                                      }}>Nearby
                                </Chip>
                            </>
                        }
                    </View>
                </>
            }
        </>
    );
};
