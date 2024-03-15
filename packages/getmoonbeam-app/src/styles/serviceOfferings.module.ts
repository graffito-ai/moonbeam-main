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
    activeTileLeft: {
        backgroundColor: '#F2FF5D',
        width: wp(46),
        height: hp(6.5),
        alignSelf: 'flex-end',
        left: wp(2),
        borderRadius: 30,
        borderWidth: hp(0.07),
        borderColor: '#F2FF5D',
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
    activeTileRight: {
        backgroundColor: '#F2FF5D',
        width: wp(46),
        height: hp(6.5),
        alignSelf: 'flex-end',
        right: wp(2),
        borderRadius: 30,
        borderWidth: hp(0.07),
        borderColor: '#F2FF5D',
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
    activeTileTextLeft: {
        alignSelf: 'center',
        fontSize: hp(1.80),
        right: wp(3.5),
        fontFamily: 'Raleway-Bold',
        color: '#313030'
    },
    inactiveTileTextLeft: {
        alignSelf: 'center',
        fontSize: hp(1.80),
        right: wp(3.5),
        fontFamily: 'Raleway-Bold',
        color: 'white'
    },
    activeTileTextRight: {
        alignSelf: 'center',
        fontSize: hp(1.80),
        right: wp(7.5),
        fontFamily: 'Raleway-Bold',
        color: '#313030'
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
    servicePartnerItemView: {
        width: wp(80),
        height: hp(40),
        backgroundColor: '#313030',
        shadowColor: 'black',
        shadowOffset: {width: -2, height: 10},
        shadowOpacity: 0.95,
        shadowRadius: 15,
        elevation: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },

    noServicePartnersView: {
        top: hp(4),
        height: hp(40),
        width: wp(100),
        alignSelf: 'center',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    noServicePartnersImage: {
        right: wp(4),
        height: hp(35),
        width: hp(25),
        alignSelf: 'center'
    },
    noServicePartnersText: {
        alignSelf: 'center',
        top: hp(2),
        width: wp(100),
        textAlign: 'center',
        fontFamily: 'Raleway-Bold',
        fontSize: hp(2.25),
        color: '#F2FF5D'
    },
});
