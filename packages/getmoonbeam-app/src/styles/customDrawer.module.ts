import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

// styles to be used within the CustomDrawer component
export const styles = StyleSheet.create({
    avatarStyle: {
        alignSelf: 'flex-start',
        left: wp(6),
        backgroundColor: 'white',
        top: hp(1)
    },
    avatarAccessoryStyle: {
        left: '72%',
        top: hp(11),
        backgroundColor: '#303030'
    },
    userNameStyle: {
        alignSelf: 'flex-start',
        fontFamily: 'Saira-Medium',
        color: '#FFFFFF',
        textAlign: 'left',
        fontSize: hp(3),
        top: hp(2),
        marginBottom: hp(4),
        left: wp(7),
        width: wp(50)
    },
    titleStyle: {
        fontFamily: 'Raleway-Regular',
        color: 'grey',
        fontSize: hp(5)
    },
    drawerItemListView: {
        flex: 1,
        backgroundColor: '#5B5A5A',
        padding: 5
    },
    bottomDrawerItemListView: {
        backgroundColor: '#5B5A5A',
        marginBottom: hp(3)
    },
    drawerItemLabel: {
        fontSize: hp(2),
        fontFamily: 'Raleway-Medium',
        color: '#FFFFFF'
    }
});
