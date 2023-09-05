import {StyleSheet} from "react-native";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';

// styles to be used within the DocumentsViewer component
export const styles = StyleSheet.create({
    topBar: {
        height: hp(13),
        width: wp(100),
        backgroundColor: '#313030',
        flexDirection: 'column',
    },
    containerView: {
        height: hp(12),
        width: wp(100),
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    backButton: {
        alignItems: 'flex-start'
    },
    shareButton: {
        top: hp(0.5),
        alignItems: 'flex-end'
    }
});
