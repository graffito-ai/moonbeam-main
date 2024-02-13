import React, {useEffect, useMemo, useState} from "react";
import {styles} from "../../../../../../styles/dashboard.module";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
// @ts-ignore
import DashboardBackgroundImage from "../../../../../../../assets/backgrounds/dashboard-background.png";
import {ImageBackground, View} from "react-native";
import {Text} from "react-native-paper";
import {Divider, Icon} from "@rneui/base";
import {PieChart} from "react-native-chart-kit";
import GestureRecognizer from "react-native-swipe-gestures";
import {commonStyles} from "../../../../../../styles/common.module";
import {lifetimeSavingsState, sortedTransactionDataState} from "../../../../../../recoil/DashboardAtom";
import {useRecoilValue} from "recoil";
import {MerchantCategoryCodes, TransactionsStatus} from "@moonbeam/moonbeam-models";
import * as _ from "lodash";
import {FontAwesome} from "@expo/vector-icons";

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
export const TopDashboard = (props: { currentUserName: string }) => {
    // constants used to keep track of local component state
    const [stepNumber, setStepNumber] = useState<number>(0);
    // constants used to keep track of shared states
    const lifetimeSavings = useRecoilValue(lifetimeSavingsState);
    const sortedTransactionData = useRecoilValue(sortedTransactionDataState);

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
     * Function used to calculate and return the appropriate
     * savings categories
     */
    const calculateSavingsCategories = (): SavingsCategory[] => {
        // map to ensure that we do not have duplicates
        let savingsMap: Map<string, number> = new Map<string, number>();
        const savingsCategories: SavingsCategory[] = [];

        // for each transaction populate the savings map accordingly
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

                    if (transactionCategoryName === undefined || transactionCategoryName === null) {
                        if (transactionCategory >= 3000 && transactionCategory <= 3299) {
                            transactionCategoryName = 'Airlines';
                        } else if (transactionCategory >= 3351 && transactionCategory <= 3441) {
                            transactionCategoryName = 'Car Rental';
                        } else if (transactionCategory >= 3501 && transactionCategory <= 3790) {
                            transactionCategoryName = 'Hotels';
                        }
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
                            <Text style={styles.legendItemValue}>{`$ ${dataItem.totalSavings} Saved`}
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

        return results;
    }, [sortedTransactionData]);

    // /**
    //  * Function used to calculate the next savings milestone based on the
    //  * currently available cash-out balance.
    //  */
    // const calculateNextMilestone = (): number => {
    //     // calculate milestone offset
    //     let offset: number = 0;
    //     switch (Math.floor((lifetimeSavings) / 10).toString().length) {
    //         case 1:
    //             offset = 10;
    //             break;
    //         case 2:
    //             offset = 20;
    //             break
    //         case 3:
    //             offset = 50;
    //             break;
    //         case 4:
    //             offset = 100;
    //             break;
    //         case 5:
    //             offset = 250;
    //             break;
    //     }
    //     return Math.floor((lifetimeSavings) / 10) === 0 ? 10 : Math.floor((lifetimeSavings) / 10) * 10 + offset;
    // }
    //
    // /**
    //  * Function used to calculate the previous savings milestone based on the
    //  * currently available cash-out balance.
    //  */
    // const calculatePreviousMilestone = (): number => {
    //     // calculate milestone offset
    //     let offset: number = 0;
    //     switch (Math.floor((lifetimeSavings) / 10).toString().length) {
    //         case 1:
    //             offset = 10;
    //             break;
    //         case 2:
    //             offset = 20;
    //             break
    //         case 3:
    //             offset = 50;
    //             break;
    //         case 4:
    //             offset = 100;
    //             break;
    //         case 5:
    //             offset = 250;
    //             break;
    //     }
    //     return Math.floor((lifetimeSavings) / 10) === 0 ? 0 : Math.floor((lifetimeSavings) / 10) * 10 - offset;
    // }

    // return the component for the TopDashboard, part of the Dashboard page
    return (
        <>
            <ImageBackground
                style={styles.imageCover}
                imageStyle={{
                    left: wp(70),
                    height: hp(35),
                    width: wp(30),
                    resizeMode: 'contain'
                }}
                resizeMethod={"scale"}
                source={DashboardBackgroundImage}>
                <View style={styles.topGreetingView}>
                    <Text
                        style={styles.greetingText}>Hello,
                        <Text style={styles.greetingNameText}> {props.currentUserName}</Text>
                    </Text>
                </View>
                <Divider
                    color={'#F2FF5DBF'}
                    style={{
                        top: hp(1),
                        left: wp(4),
                        width: wp(87)
                    }}/>
                <GestureRecognizer
                    onSwipeLeft={() => {
                        if (stepNumber < 2) {
                            // increase the step number
                            let newStepValue = stepNumber + 1;
                            setStepNumber(newStepValue);
                        }
                    }}
                    onSwipeRight={() => {
                        if (stepNumber > 0) {
                            // decrease the step number
                            let newStepValue = stepNumber - 1;
                            setStepNumber(newStepValue);
                        }
                    }}
                    style={styles.dotsContainer}
                >
                    {
                        stepNumber == 0 &&
                        <>
                            <View style={{alignSelf: 'flex-start', left: wp(5), marginTop: hp(2), marginBottom: -hp(15)}}>
                                <Text style={styles.totalSavingsLabel1Text}>
                                    {"Total Saved:\n"}
                                </Text>
                                <Text style={styles.totalSavingsLabel2Text}>
                                    {`$ ${lifetimeSavings}`}
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
                                    data={calculateSavingsCategories()}
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
                        </>
                    }
                    {/*{*/}
                    {/*    stepNumber == 1 &&*/}
                    {/*    <>*/}
                    {/*        <View style={{alignSelf: 'flex-start', left: wp(5), marginTop: hp(2)}}>*/}
                    {/*            <Text style={styles.totalSavingsLabel1Text}>*/}
                    {/*                {"Total Saved:\n"}*/}
                    {/*            </Text>*/}
                    {/*            <Text style={styles.totalSavingsLabel2Text}>*/}
                    {/*                {`$ ${lifetimeSavings}`}*/}
                    {/*            </Text>*/}
                    {/*        </View>*/}
                    {/*        <View style={{*/}
                    {/*            width: wp(100),*/}
                    {/*            left: hp(12),*/}
                    {/*            height: hp(10),*/}
                    {/*            flexDirection: "row",*/}
                    {/*            alignSelf: 'center',*/}
                    {/*            marginTop: -hp(15.75)*/}
                    {/*        }}>*/}
                    {/*            <LineChart*/}
                    {/*                style={{*/}
                    {/*                    right: wp(18)*/}
                    {/*                }}*/}
                    {/*                data={{*/}
                    {/*                    labels: ["", "", ""],*/}
                    {/*                    datasets: [*/}
                    {/*                        {*/}
                    {/*                            data: [*/}
                    {/*                                calculatePreviousMilestone(),*/}
                    {/*                                lifetimeSavings,*/}
                    {/*                                calculateNextMilestone()*/}
                    {/*                            ]*/}
                    {/*                        }*/}
                    {/*                    ]*/}
                    {/*                }}*/}
                    {/*                width={wp(90)}*/}
                    {/*                height={hp(20)}*/}
                    {/*                verticalLabelRotation={0}*/}
                    {/*                renderDotContent={({x, y, index, indexData}) => {*/}
                    {/*                    return (<>*/}
                    {/*                        {*/}
                    {/*                            <TextSVG*/}
                    {/*                                key={index}*/}
                    {/*                                y={y + hp(2.5)}*/}
                    {/*                                x={x}*/}
                    {/*                                fill={index === 1 ? "#F2FF5D" : (index === 0 ? "#FFFFFF" : "#00f8d7")}*/}
                    {/*                                fontSize={`${hp(1.75)}`}*/}
                    {/*                                fontWeight="bold"*/}
                    {/*                                textAnchor="middle"*/}
                    {/*                                fontFamily={"Changa-Bold"}*/}
                    {/*                            >*/}
                    {/*                                {`$ ${indexData}`}*/}
                    {/*                            </TextSVG>*/}
                    {/*                        }*/}
                    {/*                    </>);*/}
                    {/*                }}*/}
                    {/*                getDotColor={(_, dataPointIndex) => {*/}
                    {/*                    if (dataPointIndex === 0) {*/}
                    {/*                        return '#FFFFFF';*/}
                    {/*                    } else if (dataPointIndex === 2) {*/}
                    {/*                        return "#00f8d7";*/}
                    {/*                    }*/}
                    {/*                    return "#F2FF5D";*/}
                    {/*                }}*/}
                    {/*                withVerticalLines={false}*/}
                    {/*                withHorizontalLines={false}*/}
                    {/*                withVerticalLabels={false}*/}
                    {/*                withHorizontalLabels={false}*/}
                    {/*                chartConfig={{*/}
                    {/*                    backgroundGradientFromOpacity: 0,*/}
                    {/*                    backgroundGradientToOpacity: 0,*/}
                    {/*                    decimalPlaces: 2,*/}
                    {/*                    color: () => `#000000A5`,*/}
                    {/*                    labelColor: () => `transparent`,*/}
                    {/*                    propsForDots: {*/}
                    {/*                        r: "6",*/}
                    {/*                        strokeWidth: "5",*/}
                    {/*                        stroke: "transparent"*/}
                    {/*                    },*/}
                    {/*                    propsForBackgroundLines: {*/}
                    {/*                        strokeWidth: 0*/}
                    {/*                    }*/}
                    {/*                }}*/}
                    {/*                bezier*/}
                    {/*            />*/}
                    {/*        </View>*/}
                    {/*    </>*/}
                    {/*}*/}
                    <View style={[commonStyles.columnContainer, styles.progressSteps]}>
                        <View style={stepNumber === 0 ? styles.activeStep : styles.inactiveStep}></View>
                        <View style={stepNumber === 1 ? styles.activeStep : styles.inactiveStep}></View>
                    </View>
                </GestureRecognizer>
                <View style={styles.topDashboardButtonView}>
                    <View style={{flexDirection: 'row'}}>
                        <View
                            style={[styles.topDashboardButton, {alignSelf: 'flex-start'}]}>
                            <Icon name="transfer"
                                  style={{marginTop: hp(1.5)}}
                                  type={'material-community'}
                                  size={hp(4)}
                                  color={'#F2FF5D'}/>
                            <Text style={styles.topDashboardButtonText}>
                                {"Reimburse"}
                            </Text>
                        </View>
                        <View style={[styles.topDashboardButton, {alignSelf: 'flex-end'}]}>
                            <Icon name="gift"
                                  style={{marginTop: hp(1.5)}}
                                  type={'material-community'}
                                  size={hp(4)}
                                  color={'#F2FF5D'}/>
                            <Text style={styles.topDashboardButtonText}>
                                {"Refer"}
                            </Text>
                        </View>
                        <View style={[styles.topDashboardButton, {alignSelf: 'flex-end'}]}>
                            <Icon name="help"
                                  style={{marginTop: hp(1.5)}}
                                  type={'material-community'}
                                  size={hp(4)}
                                  color={'#F2FF5D'}/>
                            <Text style={styles.topDashboardButtonText}>
                                {"Help"}
                            </Text>
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </>
    );
}

