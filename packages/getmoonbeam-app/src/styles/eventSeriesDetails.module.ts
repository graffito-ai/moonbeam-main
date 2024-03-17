import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";

// styles to be used within the EventSeriesDetails component
export const styles = StyleSheet.create({
    topSectionView: {
        alignSelf: 'center',
        height: hp(30),
        width: wp(100),
    },
    topSectionBackground: {
        flex: 1, opacity: 0.50
    },
    eventTitle: {
        fontFamily: 'Raleway-Bold',
        fontSize: hp(2.75),
        color: '#FFFFFF',
        top: hp(3),
        textAlign: 'left',
        alignSelf: 'flex-start',
        left: wp(5),
        width: wp(80)
    },
    eventRegistrationButton: {
        position: 'absolute',
        bottom: hp(2),
        marginBottom: hp(1.5),
        alignSelf: 'center',
        backgroundColor: '#F2FF5D',
        width: wp(55),
        height: hp(4.75),
        borderRadius: 10
    },
    eventRegistrationButtonContent: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: hp(2.30),
        marginTop: hp(0.5),
        alignItems: 'center',
        alignSelf: 'center'
    },
    calendarEventAboutSectionView: {
        top: hp(5)
    },
    calendarEventSectionTitle: {
        fontFamily: 'Raleway-Bold',
        fontSize: hp(2.00),
        color: '#F2FF5D',
        top: hp(2),
        textAlign: 'left',
        alignSelf: 'flex-start',
        left: wp(5),
        width: wp(80)
    },
    calendarEventSectionContent: {
        fontFamily: 'Raleway-Medium',
        fontSize: hp(1.80),
        color: '#FFFFFF',
        top: hp(3),
        textAlign: 'left',
        alignSelf: 'flex-start',
        left: wp(5),
        width: wp(90)
    },
    calendarEventContentView: {
        height: hp(60),
        width: wp(100)
    },
    calendarEventDetailsView: {
        top: hp(5),
        height: hp(15),
        width: wp(100),
        flexDirection: 'column'
    },
    calendarEventDetailContentView: {
        height: hp(7.5),
        width: wp(100),
        alignSelf: 'flex-start',
        flexDirection: 'row'
    },
    calendarEventDetailImage: {
        left: wp(5),
        height: hp(7.5),
        width: wp(15)
    },
    calendarEventDivider: {
        left: wp(10)
    },
    calendarEventDetailTextTop: {
        fontFamily: 'Raleway-SemiBold',
        fontSize: hp(1.95),
        color: '#F2FF5D',
        top: hp(1.25),
        textAlign: 'left',
        alignSelf: 'flex-start',
        left: wp(3),
        width: wp(65)
    },
    calendarEventDetailTextBottom: {
        fontFamily: 'Raleway-SemiBold',
        fontSize: hp(1.90),
        color: '#FFFFFF',
        top: hp(1.25),
        textAlign: 'left',
        alignSelf: 'flex-start',
        left: wp(3),
        width: wp(65)
    },
    calendarEventDetailsText: {
        left: wp(11.5),
        height: hp(7.5),
        width: wp(74),
        flexDirection: 'column'
    }
});
