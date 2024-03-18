import React, {useEffect, useState} from 'react';
import {SafeAreaProvider} from "react-native-safe-area-context";
import {ServicePartnerDetailsProps} from "../../../../../../models/props/ServicePartnerProps";
import {useRecoilState} from "recoil";
import {servicePartnerState} from "../../../../../../recoil/ServicesAtom";
import {Text, TouchableOpacity, View} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {Image} from "expo-image";
import {styles} from "../../../../../../styles/servicePartnerDetails.module";
// @ts-ignore
import MoonbeamPlaceholderImage from "../../../../../../../assets/art/moonbeam-store-placeholder.png";
import {LinearGradient} from 'expo-linear-gradient';
import {Icon} from "@rneui/base";

/**
 * ServicePartnerDetails component.
 *
 * @param navigation navigation object passed in from the parent navigator.
 * @constructor constructor for the component.
 */
export const ServicePartnerDetails = ({navigation}: ServicePartnerDetailsProps) => {
    // constants used to keep track of local component state
    const [activeSelectionState, setActiveSelectionState] = useState<'about' | 'services'>('about');
    // constants used to keep track of shared states
    const [servicePartner,] = useRecoilState(servicePartnerState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {

    }, []);

    /**
     * Function used to filter the services offered by the selected
     * service partner.
     *
     * @return {@link React.ReactNode} or {@link React.ReactNode[]}
     */
    const filterServices = (): React.ReactNode | React.ReactNode[] => {
        let results: React.ReactNode[] = [];

        // render the services offered
        if (servicePartner && servicePartner!.services && servicePartner!.services!.length !== 0) {
            servicePartner!.services!.forEach(service => {
                service !== null && results.push(
                    <View style={styles.partnerContentAboutSectionView}>
                        <Text style={styles.partnerContentSectionTitle}>
                            {service!.title}
                        </Text>
                        <Text style={styles.partnerContentSectionContent}>
                            {service!.description}
                        </Text>
                    </View>
                );
            });
        } else {
            return (<></>);
        }

        return results;
    }

    // return the component for the ServicePartnerDetails page
    return (
        <SafeAreaProvider style={{flex: 1, backgroundColor: '#313030'}}>
            <View style={styles.topSectionView}>
                <LinearGradient
                    start={{x: 5, y: 1}}
                    end={{x: 0, y: 1}}
                    colors={['transparent', '#313030']}
                    style={styles.topCurvedView}/>
                <View style={styles.topCurvedViewContent}>
                    <Image
                        style={styles.brandLogo}
                        // @ts-ignore
                        source={{uri: servicePartner!.logoUrl!}}
                        placeholder={MoonbeamPlaceholderImage}
                        placeholderContentFit={'contain'}
                        contentFit={'contain'}
                        transition={1000}
                        cachePolicy={'memory-disk'}
                    />
                    <View style={styles.topCurvedViewLogoContent}>
                        <Icon name="map-marker-outline"
                              type={'material-community'}
                              size={hp(3.5)}
                              color={'#F2FF5D'}
                              style={{alignSelf: 'center'}}
                        />
                        <Text style={styles.topCurvedViewLogoText}>{`${servicePartner!.city}, ${servicePartner!.state}`}</Text>
                    </View>
                </View>
            </View>
            <View
                style={styles.activeSelectionTabButtonView}>
                <TouchableOpacity
                    onPress={() => {
                        // set the appropriate active selection state
                        setActiveSelectionState('about');
                    }}
                    style={activeSelectionState === 'about'
                        ? styles.selectionTabButtonActive
                        : styles.selectionTabButton}>
                    <Text style={activeSelectionState === 'about'
                        ? styles.selectionTabButtonTextActive
                        : styles.selectionTabButtonText}>
                        About
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        // set the appropriate active selection state
                        setActiveSelectionState('services');
                    }}
                    style={activeSelectionState === 'services'
                        ? styles.selectionTabButtonActive
                        : styles.selectionTabButton}>
                    <Text style={activeSelectionState === 'services'
                        ? styles.selectionTabButtonTextActive
                        : styles.selectionTabButtonText}>
                        Services
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={{
                height: hp(50),
                width: wp(100),
                marginTop: hp(3),
                flexDirection: 'column'
            }}>
                {
                    activeSelectionState === 'about' &&
                    <>
                        <View style={styles.partnerContentAboutSectionView}>
                            <Text
                                numberOfLines={1}
                                style={styles.partnerContentSectionTitle}>
                                Mission
                            </Text>
                            <Text
                                numberOfLines={10}
                                style={styles.partnerContentSectionContent}>
                                {servicePartner!.description!}
                            </Text>
                        </View>
                        <View style={styles.partnerContentAboutSectionView}>
                            <Text
                                numberOfLines={1}
                                style={styles.partnerContentSectionTitle}>
                                Address
                            </Text>
                            <Text
                                numberOfLines={2}
                                style={styles.partnerContentSectionContent}>
                                {`${servicePartner!.addressLine!}, ${servicePartner!.city!}, ${servicePartner!.state!}, ${servicePartner!.zipCode!}`}
                            </Text>
                        </View>
                        <View style={styles.partnerContentAboutSectionView}>
                            <Text
                                numberOfLines={1}
                                style={styles.partnerContentSectionTitle}>
                                Contact
                            </Text>
                            <Text
                                numberOfLines={2}
                                style={styles.partnerContentSectionContent}>
                                {`${servicePartner!.website!}`}
                            </Text>
                        </View>
                    </>
                }
                {
                    activeSelectionState === 'services' &&
                    <>
                        {filterServices()}
                    </>
                }
            </View>
            <TouchableOpacity
                style={styles.partnerWebsiteButton}
                onPress={async () => {
                    // go to the Service Partner Web View component
                    navigation.navigate("ServicePartnerWebView", {});
                }}
            >
                <Text style={styles.partnerWebsiteButtonContent}>Visit Website</Text>
            </TouchableOpacity>
        </SafeAreaProvider>
    );
};
