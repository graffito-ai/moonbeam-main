import React, {useEffect, useMemo, useState} from "react";
import {styles} from "../../../../../../styles/dashboard.module";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
// @ts-ignore
import DashboardBackgroundImage from "../../../../../../../assets/backgrounds/dashboard-background.png";
import {Animated, ImageBackground, StyleSheet, TouchableOpacity, View} from "react-native";
import {Text} from "react-native-paper";
import {Avatar, Divider, Icon} from "@rneui/base";
import {PieChart} from "react-native-chart-kit";
import GestureRecognizer from "react-native-swipe-gestures";
import {commonStyles} from "../../../../../../styles/common.module";
import {
    currentBalanceState,
    lifetimeSavingsState,
    showTransactionBottomSheetState,
    showWalletBottomSheetState,
    sortedTransactionDataState
} from "../../../../../../recoil/DashboardAtom";
import {useRecoilState, useRecoilValue} from "recoil";
import {MerchantCategoryCodes, TransactionsStatus} from "@moonbeam/moonbeam-models";
import * as _ from "lodash";
import {FontAwesome} from "@expo/vector-icons";
import {drawerNavigationState} from "../../../../../../recoil/HomeAtom";
import {Image as ExpoImage} from "expo-image/build/Image";
import {profilePictureURIState} from "../../../../../../recoil/AppDrawerAtom";
import {currentUserInformation} from "../../../../../../recoil/AuthAtom";
// @ts-ignore
import MoonbeamProfilePlaceholder from "../../../../../../../assets/art/moonbeam-profile-placeholder.png";
import {showClickOnlyBottomSheetState} from "../../../../../../recoil/StoreOfferAtom";

/**
 * Interface used to define a savings category object, part of the
 * pie chart in the analytics section.
 */
interface SavingsCategory {
    name: string,
    totalSavings: string,
    percentage: number,
    color: string,
    legendFontColor: string,
    legendFontSize: number
}

/**
 * TopDashboard component.
 *
 * @param props component properties to be passed in.
 * @constructor constructor for the component.
 */
export const TopDashboard = (props: {
    currentUserName: string,
    setStatsDialogVisible: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    // constants used to keep track of local component state
    const [currentUserTitle, setCurrentUserTitle] = useState<string>("N/A");
    const [scaleAnim] = useState(new Animated.Value(0))
    const [savingsCategories, setSavingsCategories] = useState<SavingsCategory[]>([]);
    const [longestCategoryNameLength, setLongestCategoryNameLength] = useState<number>(0);
    const [pieChartOffset, setPieChartOffset] = useState<number>(0);
    const [stepNumber, setStepNumber] = useState<number>(0);
    // constants used to keep track of shared states
    const [userInformation,] = useRecoilState(currentUserInformation);
    const [profilePictureURI,] = useRecoilState(profilePictureURIState);
    const [drawerNavigation,] = useRecoilState(drawerNavigationState);
    const lifetimeSavings = useRecoilValue(lifetimeSavingsState);
    const currentBalance = useRecoilValue(currentBalanceState);
    const sortedTransactionData = useRecoilValue(sortedTransactionDataState);
    const [showTransactionsBottomSheet, setShowTransactionsBottomSheet] = useRecoilState(showTransactionBottomSheetState);
    const [, setShowWalletBottomSheet] = useRecoilState(showWalletBottomSheetState);
    const [, setShowClickOnlyBottomSheet] = useRecoilState(showClickOnlyBottomSheetState);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
        // check to see if the user information object has been populated accordingly
        if (userInformation["given_name"] && userInformation["family_name"] && currentUserTitle === 'N/A') {
            //set the title of the user's avatar in the dashboard, based on the user's information
            setCurrentUserTitle(`${Array.from(userInformation["given_name"].split(" ")[0])[0] as string}${Array.from(userInformation["family_name"].split(" ")[0])[0] as string}`);
        }
        // set the offset of the pie chart, according to the length of the longest category name
        if (pieChartOffset === 0 && longestCategoryNameLength !== 0) {
            if (longestCategoryNameLength <= 15) {
                setPieChartOffset(wp(10));
            } else if (longestCategoryNameLength > 15 && longestCategoryNameLength <= 20) {
                setPieChartOffset(wp(7));
            } else if (longestCategoryNameLength > 20 && longestCategoryNameLength <= 25) {
                setPieChartOffset(wp(6));
            } else if (longestCategoryNameLength > 25 && longestCategoryNameLength <= 30) {
                setPieChartOffset(wp(4));
            } else {
                setPieChartOffset(wp(0));
            }
        }
        // set the savings categories accordingly, used for the Pie Chart
        if (savingsCategories.length === 0 && sortedTransactionData.length !== 0) {
            setSavingsCategories(calculateSavingsCategories());
        }
        // set the animation scale for the "water-tank" reimbursement progress animation
        Animated.spring(
            scaleAnim,
            {
                toValue: 1,
                friction: 10,
                useNativeDriver: true
            }
        ).start();
    }, [longestCategoryNameLength, pieChartOffset, savingsCategories, userInformation["custom:userId"],
        userInformation["given_name"], userInformation["family_name"], currentUserTitle]);

    /**
     * Function used to calculate and return the appropriate
     * savings categories
     */
    const calculateSavingsCategories = (): SavingsCategory[] => {
        // map to ensure that we do not have duplicates
        let savingsMap: Map<string, number> = new Map<string, number>();
        const savingsCategories: SavingsCategory[] = [];

        // for each transaction populate the savings map accordingly
        let longestCategoryName = 0;
        sortedTransactionData.forEach(transaction => {
            if (transaction !== undefined && transaction !== null &&
                transaction.category !== undefined && transaction.category !== null) {
                /**
                 * ONLY look at transactions that are in PENDING, PROCESSED or CREDITED state
                 * (do not look at REJECTED).
                 */
                if (transaction.transactionStatus !== TransactionsStatus.Rejected) {
                    // get the transaction category name
                    let transactionCategoryName = _.findKey(MerchantCategoryCodes, (o) => o === transaction.category);
                    const transactionCategory = Number(transaction.category);

                    // for some categories, we have a range, so we got to set the transaction category name accordingly
                    if (transactionCategoryName === undefined || transactionCategoryName === null) {
                        if (transactionCategory >= 3000 && transactionCategory <= 3299) {
                            transactionCategoryName = 'Airlines';
                        } else if (transactionCategory >= 3351 && transactionCategory <= 3441) {
                            transactionCategoryName = 'Car Rental';
                        } else if (transactionCategory >= 3501 && transactionCategory <= 3790) {
                            transactionCategoryName = 'Hotels';
                        }
                    }

                    // for unknown transaction categories, set them to Other
                    if (transactionCategoryName === undefined || transactionCategoryName === null) {
                        transactionCategoryName = 'Other';
                    }

                    // set the longest category's name length
                    if (longestCategoryName < transactionCategoryName.length) {
                        longestCategoryName = transactionCategoryName.length;
                    }

                    /**
                     * check to see if there's a specific category with that
                     * code in the map already.
                     */
                    if (savingsMap.has(transactionCategoryName)) {
                        // add the new transaction reward to existing total and push in the map
                        savingsMap.set(transactionCategoryName, Number((savingsMap.get(transactionCategoryName)! + transaction.rewardAmount).toFixed(2)));
                    } else {
                        // add the new transaction reward and a new category in the map
                        savingsMap.set(transactionCategoryName, transaction.rewardAmount);
                    }
                }
            }
        });

        // set the longest category name length accordingly
        if (longestCategoryNameLength === 0) {
            setLongestCategoryNameLength(longestCategoryName);
        }

        // sort savings map by category value
        savingsMap = new Map([...savingsMap.entries()].sort((a, b) => b[1] - a[1]));

        // build the savings category data array for the Pie Chart
        let numberOfCategories = 0;
        const othersCategory: SavingsCategory = {
            name: "Other",
            totalSavings: "0.00",
            percentage: 0,
            color: `#000000A5`,
            legendFontColor: "#FFFFFF",
            legendFontSize: Number(hp(1.25).toFixed(2))
        }
        savingsMap.forEach((rewardAmount, savingsCategory) => {
            // handle the others category for anything that's over 2 categories (for display purposes).
            if (numberOfCategories >= 2) {
                othersCategory.totalSavings = Number(Number(othersCategory.totalSavings) + rewardAmount).toString();
                othersCategory.percentage += Number(rewardAmount) / Number(lifetimeSavings) * 100;

                if (numberOfCategories === savingsMap.size - 1) {
                    othersCategory.percentage = Number(othersCategory.percentage.toFixed(2));
                    savingsCategories.push(othersCategory);
                }
            } else if (numberOfCategories < 2) {
                // push the category in the list of categories
                savingsCategories.push({
                    name: savingsCategory,
                    totalSavings: `${Number(rewardAmount).toString()}`,
                    percentage: Number(Number(Number(rewardAmount) / Number(lifetimeSavings) * 100).toFixed(2)),
                    color: numberOfCategories === 0 ? "#F2FF5D" : "#00f8d7",
                    legendFontColor: "#FFFFFF",
                    legendFontSize: Number(hp(1.25).toFixed(2))
                });
            }
            numberOfCategories += 1;
        });

        return savingsCategories;
    }

    /**
     * Function used to generate the Pie Chart Legend
     */
    const generateLegend = useMemo((): React.ReactNode[] => {
        const results: React.ReactNode[] = [];

        if (sortedTransactionData.length !== 0) {
            const data = calculateSavingsCategories();

            let percentageCount = 0;
            let items = 0;
            data.map((dataItem) => {
                    percentageCount += dataItem.percentage;
                    if (items === data.length - 1) {
                        dataItem.percentage = 100 - percentageCount === 0 ? dataItem.percentage : Number(Number(dataItem.percentage + 100 - percentageCount).toFixed(2));
                    }

                    results.push(
                        <View style={styles.legendItem} key={dataItem.name}>
                            <FontAwesome name="circle" size={20} color={dataItem.color}/>
                            <View>
                                <Text style={styles.legendItemValue}>{`$ ${Number(Number(dataItem.totalSavings).toFixed(2))} Saved`}
                                </Text>
                                <Text
                                    numberOfLines={1}
                                    style={styles.legendItemCategoryValue}>
                                    {dataItem.name}
                                </Text>
                            </View>
                        </View>
                    );
                    items += 1;
                }
            );
        }

        return results;
    }, [sortedTransactionData]);

    /**
     * Function used to calculate the reimbursement limit to be displayed
     * in the "water-tank" analytics view.
     *
     * @return a {@link number} representing the reimbursement upper-limit for the
     * "water-tank".
     */
    const calculateReimbursementLimit = (): number => {
        let offset: number;

        // calculate offset depending on whether we are past the $20 savings mark or not.
        if (currentBalance === 0) {
            offset = 20.00;
        } else if (currentBalance <= 20.00) {
            offset = 25.00;
        } else {
            offset = currentBalance + 5 * Number(Number(currentBalance / 10).toFixed(1));
        }

        return offset;
    }

    // return the component for the TopDashboard, part of the Dashboard page
    return (
        <>
            <ImageBackground
                style={styles.imageCover}
                imageStyle={{
                    left: wp(70),
                    height: hp(45),
                    width: wp(30),
                    resizeMode: 'contain'
                }}
                resizeMethod={"scale"}
                source={DashboardBackgroundImage}>
                <View style={{
                    zIndex: 100000,
                    top: -hp(1)
                }}>
                    <View style={styles.topGreetingView}>
                        <View style={{
                            width: wp(55),
                            flexDirection: 'row',
                            height: hp(5)
                        }}>
                            <Text
                                style={styles.greetingText}>Hello,
                                <Text style={styles.greetingNameText}> {props.currentUserName}</Text>
                            </Text>
                            <Icon
                                size={hp(2.5)}
                                style={{
                                    marginLeft: hp(3),
                                    top: hp(2),
                                }}
                                name={"info"}
                                color={"#F2FF5D"}
                                onPress={() => {
                                    // display the stats dialog
                                    props.setStatsDialogVisible(true);
                                }}
                            />
                        </View>
                        <View
                            pointerEvents={showTransactionsBottomSheet ? "none" : "auto"}
                            style={[showTransactionsBottomSheet && {
                                opacity: 0.75
                            }, {
                                width: wp(20),
                                top: (!profilePictureURI || profilePictureURI === "") ? -hp(0.5) : hp(1)
                            }]}>
                            {
                                (!profilePictureURI || profilePictureURI === "") ?
                                    <Avatar
                                        {...profilePictureURI && profilePictureURI !== "" && {
                                            source: {
                                                uri: profilePictureURI,
                                                cache: 'reload'
                                            }
                                        }
                                        }
                                        avatarStyle={{
                                            resizeMode: 'cover',
                                            borderColor: '#F2FF5D',
                                            borderWidth: hp(0.20),
                                        }}
                                        size={hp(4)}
                                        rounded
                                        title={(!profilePictureURI || profilePictureURI === "") ? currentUserTitle : undefined}
                                        {...(!profilePictureURI || profilePictureURI === "") && {
                                            titleStyle: [
                                                styles.titleStyle
                                            ]
                                        }}
                                        containerStyle={[styles.avatarStyle, {
                                            alignSelf: 'flex-end'
                                        }]}
                                        onPress={async () => {
                                            setShowTransactionsBottomSheet(false);
                                            setShowWalletBottomSheet(false);
                                            setShowClickOnlyBottomSheet(false);
                                            // @ts-ignore
                                            drawerNavigation && drawerNavigation.openDrawer();
                                        }}
                                    />
                                    :
                                    <TouchableOpacity
                                        onPress={async () => {
                                            setShowTransactionsBottomSheet(false);
                                            setShowWalletBottomSheet(false);
                                            setShowClickOnlyBottomSheet(false);
                                            // @ts-ignore
                                            drawerNavigation && drawerNavigation.openDrawer();
                                        }}
                                    >
                                        <ExpoImage
                                            style={[styles.profileImage, {
                                                alignSelf: 'flex-end',
                                            }]}
                                            source={{
                                                uri: profilePictureURI
                                            }}
                                            placeholder={MoonbeamProfilePlaceholder}
                                            placeholderContentFit={'cover'}
                                            contentFit={'cover'}
                                            transition={1000}
                                            cachePolicy={'memory-disk'}
                                        />
                                    </TouchableOpacity>
                            }
                        </View>
                    </View>
                    <Divider
                        color={'#F2FF5DBF'}
                        style={{
                            left: wp(4),
                            width: wp(80)
                        }}/>
                </View>
                <GestureRecognizer
                    onSwipeLeft={() => {
                        if (Number(lifetimeSavings.toFixed(2)) > 0.00 && sortedTransactionData.length > 0) {
                            if (stepNumber < 1) {
                                // increase the step number
                                let newStepValue = stepNumber + 1;
                                setStepNumber(newStepValue);
                            }
                        }
                    }}
                    onSwipeRight={() => {
                        if (Number(lifetimeSavings.toFixed(2)) > 0.00 && sortedTransactionData.length > 0) {
                            if (stepNumber > 0) {
                                // decrease the step number
                                let newStepValue = stepNumber - 1;
                                setStepNumber(newStepValue);
                            }
                        }
                    }}
                    style={styles.dotsContainer}
                >
                    {
                        stepNumber === 0 &&
                        <>
                            <View style={{alignSelf: 'center'}}>
                                <View style={[{
                                    top: hp(3),
                                    alignSelf: 'center',
                                    width: wp(30),
                                    height: hp(20),
                                    backgroundColor: '#1E1E1E72',
                                    marginBottom: -hp(6.85)
                                }, calculateReimbursementLimit() === 20 && {
                                    borderTopColor: '#F2FF5D',
                                    borderTopWidth: hp(0.35)
                                }, Number(currentBalance.toFixed(2)) === 0.00 && {
                                    borderBottomColor: '#00f8d7',
                                    borderBottomWidth: hp(0.35)
                                }]}>
                                    <View style={{
                                        top: hp(20) - 20 / calculateReimbursementLimit() * hp(20),
                                        zIndex: 10
                                    }}>
                                        {
                                            calculateReimbursementLimit() !== 20 &&
                                            <Divider
                                                inset={true}
                                                insetType={"middle"}
                                                color={'#F2FF5D'}
                                                width={hp(0.35)}
                                                style={{
                                                    width: wp(30),
                                                    alignSelf: 'center'
                                                }}
                                            />
                                        }
                                        <Text style={{
                                            fontFamily: 'Raleway-Bold',
                                            fontSize: hp(1.75),
                                            color: '#F2FF5D',
                                            textAlign: 'center',
                                            right: wp(20),
                                            bottom: hp(1),
                                            width: wp(20)
                                        }}>{"$ 20.00\nCashout\nMinimum"}</Text>
                                    </View>
                                    <View style={{
                                        zIndex: 10
                                    }}>
                                        <Text style={{
                                            fontFamily: 'Raleway-Bold',
                                            fontSize: hp(1.75),
                                            color: '#00f8d7',
                                            textAlign: 'center',
                                            left: wp(31),
                                            width: wp(20),
                                            top: Number(currentBalance.toFixed(2)) > 0.00
                                                ? hp(10.5) - currentBalance / calculateReimbursementLimit() * hp(20)
                                                : hp(10)
                                        }}>{`Available\n$ ${Number(currentBalance.toFixed(2))}`}</Text>
                                    </View>
                                    {
                                        Number(currentBalance.toFixed(2)) > 0.00 &&
                                        <Animated.View
                                            style={[StyleSheet.absoluteFill, {
                                                backgroundColor: "#FFFFFF33",
                                                top: hp(20) - currentBalance / calculateReimbursementLimit() * hp(20),
                                                width: wp(30),
                                                height: currentBalance / calculateReimbursementLimit() * hp(20),
                                                transform: [{scale: scaleAnim}],
                                                borderTopWidth: hp(0.35),
                                                borderTopColor: '#00f8d7'
                                            }]}>
                                        </Animated.View>
                                    }
                                </View>
                            </View>
                        </>
                    }
                    {
                        stepNumber == 1 &&
                        <>
                            <View style={{marginLeft: pieChartOffset}}>
                                <View style={{
                                    alignSelf: 'flex-start',
                                    left: wp(5),
                                    marginTop: hp(2),
                                    marginBottom: -hp(9.1)
                                }}>
                                    <Text style={styles.totalSavingsLabel1Text}>{"Total Saved:"}
                                    </Text>
                                    <Text
                                        numberOfLines={1}
                                        style={styles.totalSavingsLabel2Text}>
                                        {`$ ${Number(lifetimeSavings.toFixed(2))}`}
                                    </Text>
                                </View>
                                <View style={{
                                    width: wp(100),
                                    right: hp(4),
                                    height: hp(10),
                                    flexDirection: "row",
                                    marginTop: hp(4)
                                }}>
                                    <PieChart
                                        hasLegend={false}
                                        avoidFalseZero={true}
                                        style={{
                                            marginTop: hp(3)
                                        }}
                                        width={wp(100)}
                                        height={hp(17)}
                                        chartConfig={{
                                            backgroundGradientFromOpacity: 0,
                                            backgroundGradientToOpacity: 0,
                                            decimalPlaces: 2,
                                            color: () => `#000000A5`,
                                            labelColor: () => `transparent`
                                        }}
                                        data={savingsCategories}
                                        accessor={"percentage"}
                                        backgroundColor={"transparent"}
                                        paddingLeft={`${-wp(3)}`}
                                        center={[wp(7), wp(3)]}
                                    />
                                    <View style={styles.legend}>
                                        {
                                            generateLegend
                                        }
                                    </View>
                                </View>
                            </View>
                        </>
                    }
                    <View style={[commonStyles.columnContainer, styles.progressSteps]}>
                        <View style={stepNumber === 0 ? styles.activeStep : styles.inactiveStep}></View>
                        {
                            Number(lifetimeSavings.toFixed(2)) > 0.00 && sortedTransactionData.length > 0 &&
                            <View style={stepNumber === 1 ? styles.activeStep : styles.inactiveStep}></View>
                        }
                    </View>
                </GestureRecognizer>
                <View style={styles.topDashboardButtonView}>
                    <View style={{flexDirection: 'row', alignSelf: 'center', right: wp(6.5)}}>
                        <TouchableOpacity
                            activeOpacity={0.75}
                            onPress={() => {
                                drawerNavigation && drawerNavigation.navigate("Reimbursements", {});
                            }}
                            style={[styles.topDashboardButton, {alignSelf: 'flex-start'}]}>
                            <Icon name="transfer"
                                  style={{marginTop: hp(1.5)}}
                                  type={'material-community'}
                                  size={hp(4)}
                                  color={'#F2FF5D'}/>
                            <Text style={styles.topDashboardButtonText}>
                                {"Cash Out"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.75}
                            onPress={() => {
                                drawerNavigation && drawerNavigation.navigate("Referral", {});
                            }}
                            style={[styles.topDashboardButton, {alignSelf: 'flex-end'}]}>
                            <Icon name="gift"
                                  style={{marginTop: hp(1.5)}}
                                  type={'material-community'}
                                  size={hp(4)}
                                  color={'#F2FF5D'}
                            />
                            <Text style={styles.topDashboardButtonText}>
                                {"Refer"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.75}
                            style={[styles.topDashboardButton, {alignSelf: 'flex-end'}]}>
                            <Icon name="help"
                                  style={{marginTop: hp(1.5)}}
                                  type={'material-community'}
                                  size={hp(4)}
                                  color={'#F2FF5D'}
                                  onPress={() => {
                                      drawerNavigation && drawerNavigation.navigate("Support", {});
                                  }}
                            />
                            <Text style={styles.topDashboardButtonText}>
                                {"Help"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </>
    );
}
