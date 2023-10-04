import React, {useEffect} from "react";
import {View} from "react-native";
import {styles} from "../../../../../../styles/store.module";
import {Chip, Searchbar, Text, ToggleButton} from "react-native-paper";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {Icon} from "@rneui/base";
import {useRecoilState, useRecoilValue} from "recoil";
import {
    filteredByDiscountPressedState, filtersActiveState,
    resetSearchState,
    searchQueryState,
    toggleViewPressedState, uniqueNearbyOffersListState,
    verticalSectionActiveState
} from "../../../../../../recoil/StoreOfferAtom";

/**
 * SearchSection component.
 *
 * @param props properties to be passed into the component
 * @constructor constructor for the component.
 */
export const SearchSection = (props: {
    setNoFilteredOffersAvailable: React.Dispatch<React.SetStateAction<boolean>>,
    setModalVisible: React.Dispatch<React.SetStateAction<boolean>>
    setShouldCacheImages: React.Dispatch<React.SetStateAction<boolean>>,
    setFilteredOffersSpinnerShown: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    // constants used to keep track of shared states
    const deDupedNearbyOfferList = useRecoilValue(uniqueNearbyOffersListState);
    const [toggleViewPressed, setToggleViewPressed] = useRecoilState(toggleViewPressedState);
    const [searchQuery, setSearchQuery] = useRecoilState(searchQueryState);
    const [whichVerticalSectionActive, setWhichVerticalSectionActive] = useRecoilState(verticalSectionActiveState);
    const [, setResetSearch] = useRecoilState(resetSearchState);
    const [, setFilteredByDiscountPressed] = useRecoilState(filteredByDiscountPressedState);
    const [, setAreFiltersActive] = useRecoilState(filtersActiveState);

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
                            if (value === 'horizontal') {
                                setToggleViewPressed(value);
                                setWhichVerticalSectionActive(null);
                                if (searchQuery !== '') {
                                    setSearchQuery('');

                                    // set the no filtered offers available flag accordingly
                                    props.setNoFilteredOffersAvailable(false);

                                    // reset the search state
                                    setResetSearch(true);

                                    // set the caching flag for images accordingly
                                    props.setShouldCacheImages(false);
                                }
                            }

                            if (value === 'vertical') {
                                setToggleViewPressed(value);
                                setWhichVerticalSectionActive('online');
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
                value={searchQuery}
                placeholder="Search for a merchant partner"
                onKeyPress={({nativeEvent}) => {
                    if (nativeEvent.key === 'Backspace') {
                        // reset the search on backspace
                        setResetSearch(true);

                        // set the no filtered offers available flag accordingly
                        props.setNoFilteredOffersAvailable(false);
                    }
                }}
                onClearIconPress={(_) => {
                    // reset the search state
                    setResetSearch(true);

                    // set the no filtered offers available flag accordingly
                    props.setNoFilteredOffersAvailable(false);

                    // set the caching flag for images accordingly
                    props.setShouldCacheImages(false);
                }}
                onSubmitEditing={async (event) => {
                    // reset the search state
                    setResetSearch(true);

                    setSearchQuery(event.nativeEvent.text);
                }}
                onChangeText={(query) => {
                    {
                        setToggleViewPressed('vertical');
                        setWhichVerticalSectionActive('online');

                        // reset the search state
                        setResetSearch(true);

                        setSearchQuery(query);
                    }
                }}
            />
            <View
                style={[styles.filterChipView]}>
                <Chip mode={'flat'}
                      style={[styles.verticalSectionActiveChip, whichVerticalSectionActive === 'fidelis' ? {backgroundColor: '#F2FF5D'} : {backgroundColor: '#5B5A5A'}]}
                      textStyle={[styles.verticalSectionActiveChipText, whichVerticalSectionActive === 'fidelis' ? {color: '#5B5A5A'} : {color: '#F2FF5D'}]}
                      icon={() => (
                          <Icon name="star"
                                type={'material-community'}
                                size={hp(2.5)}
                                color={whichVerticalSectionActive === 'fidelis' ? '#5B5A5A' : '#F2FF5D'}/>
                      )}
                      onPress={() => {
                          // reset the search state
                          setResetSearch(true);

                          // reset the filters
                          setFilteredByDiscountPressed(false);
                          setAreFiltersActive(false);

                          if (whichVerticalSectionActive === 'fidelis') {
                              // set the no filtered offers available flag accordingly
                              props.setNoFilteredOffersAvailable(false);

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
                                size={hp(2.5)}
                                color={whichVerticalSectionActive === 'online' ? '#5B5A5A' : '#F2FF5D'}/>
                      )}
                      onPress={() => {
                          // reset the search state
                          setResetSearch(true);

                          // reset the filters
                          setFilteredByDiscountPressed(false);
                          setAreFiltersActive(false);

                          if (whichVerticalSectionActive === 'online') {
                              // set the no filtered offers available flag accordingly
                              props.setNoFilteredOffersAvailable(false);

                              setSearchQuery('');
                              setWhichVerticalSectionActive(null);
                              setToggleViewPressed('horizontal');
                          } else {
                              setWhichVerticalSectionActive('online');
                              setToggleViewPressed('vertical');
                          }
                      }}>Online</Chip>
                {deDupedNearbyOfferList.length !== 0 &&
                    <Chip mode={'outlined'}
                          style={[styles.verticalSectionActiveChip, whichVerticalSectionActive === 'nearby' ? {backgroundColor: '#F2FF5D'} : {backgroundColor: '#5B5A5A'}]}
                          icon={() => (
                              <Icon name="map-marker"
                                    type={'material-community'}
                                    size={hp(2.5)}
                                    color={whichVerticalSectionActive === 'nearby' ? '#5B5A5A' : '#F2FF5D'}/>
                          )}
                          textStyle={[styles.verticalSectionActiveChipText, whichVerticalSectionActive === 'nearby' ? {color: '#5B5A5A'} : {color: '#F2FF5D'}]}
                          onPress={() => {
                              // reset the search state
                              setResetSearch(true);

                              // reset the filters
                              setFilteredByDiscountPressed(false);
                              setAreFiltersActive(false);

                              if (whichVerticalSectionActive === 'nearby') {
                                  // set the no filtered offers available flag accordingly
                                  props.setNoFilteredOffersAvailable(false);

                                  setSearchQuery('');
                                  setWhichVerticalSectionActive(null);
                                  setToggleViewPressed('horizontal');
                              } else {
                                  setWhichVerticalSectionActive('nearby');
                                  setToggleViewPressed('vertical');
                              }
                          }}>Nearby</Chip>
                }
            </View>
        </>
    );
};
