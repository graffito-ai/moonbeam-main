import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

// styles to be used within the ReimbursementsController component
export const styles = StyleSheet.create({
    headerView: {
        width: wp(100),
        height: hp(19),
    },
    headerButtonView: {
        width: wp(100),
        height: hp(3),
        backgroundColor: '#FFFFFF'
    },
    topHeaderView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        top: hp(5.75)
    },
    headerBalanceView: {
        height: hp(10),
        width: wp(65),
        alignSelf: 'flex-start',
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginLeft: wp(5)
    },
    headerCloseIcon: {
        marginRight: wp(5),
        height: hp(4),
        width: hp(4),
        backgroundColor: '#5B5A5A',
        shadowColor: 'black',
        shadowOffset: {width: -2, height: 5},
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 15,
        borderRadius: 10
    },
    headerAvailableBalanceTop: {
        fontFamily: 'Saira-Regular',
        fontSize: hp(2.15),
        textAlign: 'left',
        left: wp(2.5),
        width: wp(40),
        alignSelf: 'flex-start',
        color: '#FFFFFF'
    },
    headerAvailableBalanceBottom: {
        bottom: hp(2),
        fontFamily: 'Changa-Regular',
        fontSize: hp(3),
        textAlign: 'left',
        left: wp(2.5),
        width: wp(40),
        alignSelf: 'flex-start',
        color: '#F2FF5D'
    }
});
