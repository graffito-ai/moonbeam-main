import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";

// styles to be used within the ServiceOfferings component
export const styles = StyleSheet.create({
    topSection: {
        height: hp(33),
        width: wp(100),
        flexDirection: 'column',
        backgroundColor: '#5B5A5A',
        // shadowColor: 'black',
        // shadowOffset: {width: -2, height: 10},
        // shadowOpacity: 0.35,
        // shadowRadius: 12,
        // elevation: 15,
        shadowColor: 'black',
        shadowOffset: {width: -2, height: 5},
        shadowOpacity: 0.55,
        shadowRadius: 5,
        elevation: 6
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
        right: wp(3.5),
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
        width: wp(65),
        color: '#FFFFFF',
    },
    mainSubtitle: {
        alignSelf: 'flex-start',
        bottom: hp(1),
        fontSize: hp(2),
        fontFamily: 'Raleway-Regular',
        color: '#FFFFFF'
    },

    noElementsAllView: {
        bottom: hp(1),
        height: hp(10),
        width: wp(100),
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    noElementsEventSeriesImage: {
        height: hp(9),
        width: hp(13),
        alignSelf: 'flex-start'
    },
    noElementsText: {
        bottom: hp(0.5),
        alignSelf: 'center',
        right: wp(25),
        textAlign: 'center',
        fontFamily: 'Raleway-Bold',
        fontSize: hp(2.00),
        color: '#F2FF5D'
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
    noEventSeriesImage: {
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
    sectionTextTop: {
        alignSelf: 'flex-start',
        left: wp(5),
        top: hp(1),
        marginBottom: hp(5),
        width: wp(45),
        textAlign: 'left',
        fontSize: hp(2.50),
        fontFamily: 'Saira-SemiBold',
        color: '#FFFFFF'
    },
    sectionTextBottom: {
        alignSelf: 'flex-start',
        left: wp(5),
        top: hp(1),
        marginBottom: hp(5),
        width: wp(90),
        textAlign: 'left',
        fontSize: hp(2.50),
        fontFamily: 'Saira-SemiBold',
        color: '#FFFFFF'
    },
    servicePartnerCardItemView: {
        alignSelf: 'center',
        width: wp(93),
        height: hp(27),
        top: hp(2),
        backgroundColor: '#5B5A5A',
        shadowColor: 'black',
        shadowOffset: {width: -2, height: 5},
        shadowOpacity: 0.65,
        shadowRadius: 5,
        elevation: 4,
        borderRadius: 20,
        flexDirection: 'column'
    },
    servicePartnerCardImage: {
        alignSelf: 'flex-start',
        top: hp(1.5),
        left: wp(5),
        height: hp(12),
        width: wp(50),
        borderTopRightRadius: 20
    },
    servicePartnerCardTitle: {
        fontFamily: 'Raleway-Medium',
        fontSize: hp(2.25),
        width: wp(40),
        lineHeight: hp(2.4),
        alignSelf: 'flex-start',
        textAlign: 'left',
        left: wp(5),
        top: hp(3),
        color: '#F2FF5D'
    },
    servicePartnerCardParagraph: {
        top: hp(1),
        left: wp(5),
        fontFamily: 'Raleway-Bold',
        width: wp(46),
        fontSize: hp(1.5),
        lineHeight: hp(2),
        color: '#FFFFFF'
    },
    viewServicePartnerButton: {
        top: hp(1),
        left: wp(12),
        alignSelf: 'flex-end',
        backgroundColor: '#F2FF5D',
        width: wp(25),
        height: hp(4),
        borderRadius: 5
    },
    viewServicePartnerButtonContent: {
        color: '#313030',
        fontFamily: 'Changa-Medium',
        fontSize: hp(1.6),
        marginTop: hp(0.5),
        alignItems: 'center',
        alignSelf: 'center'
    },

    upcomingEventCard: {
        right: wp(2),
        backgroundColor: 'transparent',
        width: wp(33),
        height: hp(25),
        shadowColor: 'transparent',
        shadowOffset: {width: -2, height: 1},
        shadowOpacity: 0.6,
        shadowRadius: 2,
        elevation: 15
    },
    upcomingEventCardCoverBackground: {
        backgroundColor: '#FFFFFF',
        width: wp(21),
        height: wp(21),
        borderRadius: 70,
        alignSelf: 'center',
        borderColor: 'transparent',
        borderWidth: hp(0.2)
    },
    upcomingEventCardCover: {
        width: wp(20),
        height: wp(20),
        borderRadius: 70,
        alignSelf: 'center'
    },
    upcomingEventCardTitle: {
        top: hp(0.5),
        fontFamily: 'Raleway-Bold',
        fontSize: hp(1.75),
        lineHeight: hp(2.2),
        width: wp(25),
        alignSelf: 'center',
        textAlign: 'center',
        color: '#FFFFFF'
    },
    upcomingEventCardSubtitle: {
        lineHeight: hp(2),
        fontSize: hp(1.65),
        fontFamily: 'Raleway-Bold',
        alignSelf: 'center',
        textAlign: 'center',
        color: '#F2FF5D'
    },
    seeAllUpcomingEventsButton: {
        top: hp(1.90),
        left: wp(38),
        fontSize: hp(1.75),
        fontFamily: 'Raleway-Bold',
        color: '#F2FF5D',
        textDecorationLine: 'underline',
        alignSelf: 'flex-end'
    },
    calendarEventCardItemView: {
        alignSelf: 'flex-start',
        width: wp(95),
        height: hp(20),
        flexDirection: 'column'
    },
    calendarEventContentView: {
        width: wp(95),
        height: hp(15.5),
        bottom: hp(2),
        flexDirection: 'row'
    },
    calendarEventsGroupingTitle: {
        alignSelf: 'flex-start',
        left: wp(3),
        top: hp(1),
        marginBottom: hp(3),
        width: wp(45),
        textAlign: 'left',
        fontSize: hp(2.25),
        fontFamily: 'Saira-Bold',
        color: '#FFFFFF'
    },
    calendarEventImageBackground: {
        backgroundColor: '#FFFFFF',
        width: wp(26),
        height: wp(26),
        borderRadius: 20,
        alignSelf: 'center',
        borderColor: 'transparent',
        borderWidth: hp(0.2),
        left: hp(1)
    },
    calendarEventImage: {
        width: wp(25),
        height: wp(25),
        alignSelf: 'center',
        borderRadius: 20
    },
    calendarEventInformationView: {
        width: wp(61),
        height: wp(30),
        alignSelf: 'center',
        left: wp(3),
        flexDirection: 'column'
    },
    calendarEventsInformationTitle: {
        alignSelf: 'flex-start',
        left: wp(3),
        top: hp(1),
        width: wp(25),
        textAlign: 'left',
        fontSize: hp(1.85),
        fontFamily: 'Saira-Bold',
        color: '#F2FF5D'
    },
    calendarEventsInformationSubTitle: {
        alignSelf: 'flex-start',
        left: wp(3),
        top: hp(0.25),
        width: wp(20),
        textAlign: 'left',
        fontSize: hp(1.65),
        fontFamily: 'Saira-Bold',
        color: '#F2FF5D'
    },
    calendarEventsInformationEventName: {
        alignSelf: 'flex-start',
        left: wp(3),
        top: hp(1),
        width: wp(45),
        textAlign: 'left',
        fontSize: hp(2),
        fontFamily: 'Raleway-SemiBold',
        color: '#FFFFFF'
    },
    calendarEventsRightIcon: {
        left: wp(1),
        top: hp(5)
    },
});
