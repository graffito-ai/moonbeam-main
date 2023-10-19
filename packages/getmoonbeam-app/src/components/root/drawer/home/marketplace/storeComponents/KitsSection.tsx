import React, {useEffect, useMemo, useState} from "react";
import {styles} from "../../../../../../styles/store.module";
import {View} from "react-native";
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
import {ImageBackground} from 'expo-image'

/**
 * Enum representing the Moonbeam kit type
 */
enum MoonbeamKitType {
    FOOD,
    RETAIL,
    ENTERTAINMENT,
    ELECTRONICS,
    HOME,
    HEALTH_AND_BEAUTY,
    OFFICE_AND_BUSINESS,
    SERVICES_AND_SUBSCRIPTIONS
}

/**
 * Interface representing the Moonbeam kit object
 */
interface MoonbeamKit {
    type: MoonbeamKitType,
    backgroundPictureSource: any,
    title: String,
    titleButton: String
}

/**
 * Array representing the Moonbeam available Kits
 */
const moonbeamKits: MoonbeamKit[] = [
    {
        type: MoonbeamKitType.FOOD,
        backgroundPictureSource: MoonbeamFoodKitPicture,
        title: 'Food',
        titleButton: 'View All'
    },
    {
        type: MoonbeamKitType.RETAIL,
        backgroundPictureSource: MoonbeamRetailKitPicture,
        title: 'Retail',
        titleButton: 'View All'
    },
    {
        type: MoonbeamKitType.ENTERTAINMENT,
        backgroundPictureSource: MoonbeamEntertainmentKitPicture,
        title: 'Entertainment',
        titleButton: 'View All'
    },
    {
        type: MoonbeamKitType.ELECTRONICS,
        backgroundPictureSource: MoonbeamElectronicsKitPicture,
        title: 'Electronics',
        titleButton: 'View All'
    },
    {
        type: MoonbeamKitType.HOME,
        backgroundPictureSource: MoonbeamHomeKitPicture,
        title: 'Home',
        titleButton: 'View All'
    },
    {
        type: MoonbeamKitType.HEALTH_AND_BEAUTY,
        backgroundPictureSource: MoonbeamHealthAndBeautyKitPicture,
        title: 'Health & Beauty',
        titleButton: 'View All'
    },
    {
        type: MoonbeamKitType.OFFICE_AND_BUSINESS,
        backgroundPictureSource: MoonbeamOfficeAndBusinessKitPicture,
        title: 'Office',
        titleButton: 'View All'
    },
    {
        type: MoonbeamKitType.SERVICES_AND_SUBSCRIPTIONS,
        backgroundPictureSource: MoonbeamServicesAndSubscriptionsKitPicture,
        title: 'Subscriptions',
        titleButton: 'View All'
    }
]

/**
 * KitsSection component.
 *
 * @constructor constructor for the component.
 */
export const KitsSection = () => {
    // constants used to keep track of local component state
    const [dataProvider, setDataProvider] = useState<DataProvider | null>(null);
    const [layoutProvider, setLayoutProvider] = useState<LayoutProvider | null>(null);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        if (moonbeamKits.length > 0 && layoutProvider === null && dataProvider === null) {
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
            if (moonbeamKits.length !== 0) {
                return (
                    <>
                        <Card
                            style={styles.kitsCard}
                            onPress={() => {

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
            <View style={styles.kitsView}>
                <Text style={styles.kitsTitleMain}>
                    <Text style={styles.kitsTitle}>
                        Everyday Kits
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
