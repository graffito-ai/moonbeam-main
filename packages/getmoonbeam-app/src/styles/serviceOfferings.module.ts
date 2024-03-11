import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";

// styles to be used within the ServiceOfferings component
export const styles = StyleSheet.create({
    topSection: {
        height: hp(33),
        width: wp(100),
        flexDirection: 'column',
        backgroundColor: '#5B5A5A',
        shadowColor: 'black',
        shadowOffset: {width: -2, height: 10},
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 15
    },
    topTitleSection: {
        flexDirection: 'row'
    },
    topActiveTileSection: {
        top: hp(5),
        width: wp(100),
        height: hp(8),
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    inactiveTileLeft: {
        backgroundColor: 'transparent',
        width: wp(46),
        height: hp(6.5),
        alignSelf: 'flex-end',
        left: wp(2),
        borderRadius: 30,
        borderWidth: hp(0.07),
        borderColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    inactiveTileRight: {
        backgroundColor: 'transparent',
        width: wp(46),
        height: hp(6.5),
        alignSelf: 'flex-end',
        right: wp(2),
        borderRadius: 30,
        borderWidth: hp(0.07),
        borderColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    inactiveTileImageLeft: {
        alignSelf: 'center',
        height: hp(12),
        width: wp(12),
        left: wp(3.5)
    },
    inactiveTileImageRight: {
        alignSelf: 'center',
        height: hp(12),
        width: wp(12),
        left: wp(6)
    },
    inactiveTileTextLeft: {
        alignSelf: 'center',
        fontSize: hp(1.80),
        right: wp(3.5),
        fontFamily: 'Raleway-Bold',
        color: 'white'
    },
    inactiveTileTextRight: {
        alignSelf: 'center',
        fontSize: hp(1.80),
        right: wp(7.5),
        fontFamily: 'Raleway-Bold',
        color: 'white'
    },
    servicesPhoto: {
        top: hp(3.5),
        right: wp(7),
        height: hp(18),
        width: wp(40),
        alignSelf: 'center'
    },
    mainTitle: {
        left: wp(5),
        top: hp(6.5),
        alignSelf: 'flex-start',
        fontSize: hp(4.5),
        fontFamily: 'Saira-SemiBold',
        width: wp(70),
        color: '#FFFFFF',
    },
    mainSubtitle: {
        alignSelf: 'flex-start',
        bottom: hp(1),
        fontSize: hp(2),
        fontFamily: 'Raleway-Regular',
        color: '#FFFFFF'
    },
});
