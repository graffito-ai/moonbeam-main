import React, {useEffect, useMemo, useState} from "react";
import {styles} from "../../../../../../styles/store.module";
import {Platform, View} from "react-native";
import {Card, Text} from "react-native-paper";
import {DataProvider, LayoutProvider, RecyclerListView} from "recyclerlistview";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
// @ts-ignore
import MoonbeamElectronicsKitPicture from "../../../../../../../assets/art/moonbeam_electronics_kit.png";
// @ts-ignore
import MoonbeamEntertainmentKitPicture from "../../../../../../../assets/art/moonbeam_entertainment_kit.png";
// @ts-ignore
import MoonbeamFoodKitPicture from "../../../../../../../assets/art/moonbeam_food_kit.png";
// @ts-ignore
import MoonbeamHealthAndBeautyKitPicture from "../../../../../../../assets/art/moonbeam_health_and_beauty_kit.png";
// @ts-ignore
import MoonbeamHomeKitPicture from "../../../../../../../assets/art/moonbeam_home_kit.png";
// @ts-ignore
import MoonbeamOfficeAndBusinessKitPicture from "../../../../../../../assets/art/moonbeam_office_and_business_kit.png";
// @ts-ignore
import MoonbeamRetailKitPicture from "../../../../../../../assets/art/moonbeam_retail_kit.png";
// @ts-ignore
import MoonbeamServicesAndSubscriptionsKitPicture from "../../../../../../../assets/art/moonbeam_services_and_subscriptions_kit.png";
// @ts-ignore
import MoonbeamVeteransKitPicture from "../../../../../../../assets/art/moonbeam_veterans_kit.png"
import {ImageBackground} from 'expo-image'
import {OfferCategory} from "@moonbeam/moonbeam-models";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {MarketplaceStackParamList} from "../../../../../../models/props/MarketplaceProps";
import {currentActiveKitState} from "../../../../../../recoil/StoreOfferAtom";
import {useRecoilState} from "recoil";

/**
 * Interface representing the Moonbeam kit object
 */
interface MoonbeamKit {
    type: OfferCategory,
    backgroundPictureSource: any,
    title: String,
    secondaryTitle: String,
    titleButton: String
}

/**
 * Array representing the Moonbeam available Kits
 */
export const moonbeamKits: MoonbeamKit[] = [
    // {
    //     type: OfferCategory.VeteranDay,
    //     backgroundPictureSource: MoonbeamVeteransKitPicture,
    //     title: 'Veterans Day Kit',
    //     secondaryTitle: 'Veterans Day',
    //     titleButton: 'View All'
    // },
    {
        type: OfferCategory.Food,
        backgroundPictureSource: MoonbeamFoodKitPicture,
        title: 'Food Kit',
        secondaryTitle: 'Food',
        titleButton: 'View All'
    },
    {
        type: OfferCategory.Retail,
        backgroundPictureSource: MoonbeamRetailKitPicture,
        title: 'Retail Kit',
        secondaryTitle: 'Retail',
        titleButton: 'View All'
    },
    {
        type: OfferCategory.Entertainment,
        backgroundPictureSource: MoonbeamEntertainmentKitPicture,
        title: 'Entertainment Kit',
        secondaryTitle: 'Entertainment',
        titleButton: 'View All'
    },
    {
        type: OfferCategory.Electronics,
        backgroundPictureSource: MoonbeamElectronicsKitPicture,
        title: 'Electronics Kit',
        secondaryTitle: 'Electronics',
        titleButton: 'View All'
    },
    {
        type: OfferCategory.Home,
        backgroundPictureSource: MoonbeamHomeKitPicture,
        title: 'Home Kit',
        secondaryTitle: 'Home',
        titleButton: 'View All'
    },
    {
        type: OfferCategory.HealthAndBeauty,
        backgroundPictureSource: MoonbeamHealthAndBeautyKitPicture,
        title: 'Health & Beauty Kit',
        secondaryTitle: 'Health & Beauty',
        titleButton: 'View All'
    },
    {
        type: OfferCategory.OfficeAndBusiness,
        backgroundPictureSource: MoonbeamOfficeAndBusinessKitPicture,
        title: 'Office Kit',
        secondaryTitle: 'Office',
        titleButton: 'View All'
    },
    {
        type: OfferCategory.ServicesAndSubscriptions,
        backgroundPictureSource: MoonbeamServicesAndSubscriptionsKitPicture,
        title: 'Subscriptions Kit',
        secondaryTitle: 'Subscriptions',
        titleButton: 'View All'
    }
]

/**
 * KitsSection component.
 *
 * @param props properties to be passed into the component
 * @constructor constructor for the component.
 */
export const KitsSection = (props: {
    navigation: NativeStackNavigationProp<MarketplaceStackParamList, 'Store'>
}) => {
    // constants used to keep track of local component state
    const [dataProvider, setDataProvider] = useState<DataProvider | null>(null);
    const [layoutProvider, setLayoutProvider] = useState<LayoutProvider | null>(null);
    // constants used to keep track of shared states
    const [, setCurrentActiveKit] = useRecoilState(currentActiveKitState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        if (moonbeamKits !== undefined && moonbeamKits !== null && moonbeamKits.length > 0 && layoutProvider === null && dataProvider === null) {
            setDataProvider(new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(moonbeamKits));
            setLayoutProvider(new LayoutProvider(
                _ => 0,
                (_, dim) => {
                    dim.width = wp(85);
                    dim.height = hp(30);
                }
            ));
        }
    }, [dataProvider, layoutProvider, moonbeamKits]);

    /**
     * Function used to populate the rows containing the Moonbeam Kits data.
     *
     * @param type row type to be passed in
     * @param data data to be passed in for the row
     * @param index row index
     *
     * @return a {@link JSX.Element} or an {@link Array} of {@link JSX.Element} representing the
     * React node and/or nodes containing the Moonbeam Kits.
     */
        // @ts-ignore
    const renderRowData = useMemo(() => (type: string | number, data: MoonbeamKit, index: number): JSX.Element | JSX.Element[] => {
            if (moonbeamKits !== undefined && moonbeamKits !== null && moonbeamKits.length !== 0) {
                return (
                    <>
                        <Card
                            style={styles.kitsCard}
                            onPress={() => {
                                // navigate to the appropriate Kit, depending on the type of offer/kit displayed
                                props.navigation.navigate('Kit', {
                                    kitType: data.type
                                });
                                // set the kit appropriately
                                setCurrentActiveKit(data.type);
                            }}
                        >
                            <ImageBackground
                                style={styles.kitsPicture}
                                source={data.backgroundPictureSource}
                                contentFit={'contain'}
                                cachePolicy={'memory-disk'}
                            >
                                <Card.Content>
                                    <View style={{
                                        flexDirection: 'column',
                                        width: wp(60),
                                        top: hp(7),
                                        alignSelf: 'center'
                                    }}>
                                        <Text style={styles.kitsCardTitle}>{data.title}</Text>
                                        <Text style={styles.kitsCardTitleButton}>{data.titleButton}</Text>
                                    </View>
                                </Card.Content>
                            </ImageBackground>
                        </Card>
                    </>
                );
            } else {
                return (<></>);
            }
        }, [moonbeamKits]);

    // return the component for the KitsSection page
    return (
        <>
            <View style={[styles.kitsView, Platform.OS === 'android' && {top: hp(5), marginBottom: hp(7)}]}>
                <Text style={[styles.kitsTitleMain, Platform.OS === 'android' && {marginBottom: hp(2)}]}>
                    <Text style={styles.kitsTitle}>
                        {"Shop by Category"}
                    </Text>️
                </Text>
                {
                    dataProvider !== null && layoutProvider !== null &&
                    <RecyclerListView
                        style={styles.kitsScrollView}
                        layoutProvider={layoutProvider!}
                        dataProvider={dataProvider!}
                        rowRenderer={renderRowData}
                        isHorizontal={true}
                        forceNonDeterministicRendering={true}
                        scrollViewProps={{
                            decelerationRate: "fast",
                            snapToInterval: wp(75),
                            snapToAlignment: "center",
                            persistentScrollbar: false,
                            showsHorizontalScrollIndicator: false
                        }}
                    />
                }
            </View>
        </>
    );
};
