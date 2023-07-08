import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the Dashboard component
export const styles = StyleSheet.create({
    mainDashboardView: {
        flex: 1,
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: '#313030'
    },
    topDashboardView: {
        flex: 0.50,
        width: '100%',
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: '#5B5A5A',
        shadowColor: 'black',
        shadowOffset: {width: -2, height: 8},
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 25,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    tppGreetingView: {
        left: Dimensions.get('window').width / 16,
    },
    greetingText: {
        fontFamily: 'Saira-Light',
        fontSize: Dimensions.get('window').width / 18,
        width: Dimensions.get('window').width / 1.15,
        textAlign: 'center',
        color: '#FFFFFF'
    },
    greetingTextTablet: {
        fontFamily: 'Saira-Light',
        fontSize: Dimensions.get('window').width / 24,
        width: Dimensions.get('window').width / 1.15,
        textAlign: 'center',
        color: '#FFFFFF'
    },
    greetingNameText: {
        fontFamily: 'Saira-SemiBold',
        bottom: Dimensions.get('window').width / 30,
        fontSize: Dimensions.get('window').width / 18,
        width: Dimensions.get('window').width / 1.15,
        textAlign: 'center',
        color: '#FFFFFF'
    },
    greetingNameTextTablet: {
        fontFamily: 'Saira-SemiBold',
        bottom: Dimensions.get('window').width / 40,
        fontSize: Dimensions.get('window').width / 24,
        width: Dimensions.get('window').width / 1.15,
        textAlign: 'center',
        color: '#FFFFFF'
    },
    imageCover: {
        height: '95%',
        width: '70%',
        alignSelf: 'flex-start'
    },
    imageCoverTablet: {
        height: '95%',
        width: '60%',
        alignSelf: 'flex-start'
    },
    titleStyle: {
        fontFamily: 'Raleway-Regular',
        color: 'grey'
    },
    avatarStyle: {
        left: Dimensions.get('window').width / 6.7,
        alignSelf: 'center',
        backgroundColor: 'white'
    },
    avatarStyleTablet: {
        left: Dimensions.get('window').width / 5,
        alignSelf: 'center',
        backgroundColor: 'white'
    },
    avatarAccessoryStyle: {
        left: '72%',
        top: '75%',
        backgroundColor: '#303030'
    },
    statisticsView: {
        width: Dimensions.get('window').width / 1.1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        left: Dimensions.get('window').width /7,
        top: Dimensions.get('window').height/30
    },
    statLeftView: {
        height: Dimensions.get('window').height / 15,
        width: Dimensions.get('window').width / 3.5,
        marginRight: Dimensions.get('window').width/10,
        justifyContent: 'center',
        flexDirection: 'column'
    },
    statRightView: {
        height: Dimensions.get('window').height / 15,
        width: Dimensions.get('window').width / 3.5,
        marginLeft: Dimensions.get('window').width/10,
        justifyContent: 'center',
        flexDirection: 'column'
    },
    statTitleLeft: {
        fontFamily: 'Raleway-ExtraBold',
        fontSize: Dimensions.get('window').width / 24,
        width: Dimensions.get('window').width / 1.15,
        textAlign: 'center',
        color: '#FFFFFF'
    },
    statNumberCenterLeft: {
        fontFamily: 'Changa-Medium',
        fontSize: Dimensions.get('window').width / 19,
        width: Dimensions.get('window').width / 1.15,
        textAlign: 'center',
        color: '#F2FF5D',
    },
    statNumberCenterRight: {
        fontFamily: 'Changa-Medium',
        fontSize: Dimensions.get('window').width / 19,
        width: Dimensions.get('window').width / 1.15,
        textAlign: 'center',
        color: '#F2FF5D',
    },
    statTitleRight: {
        fontFamily: 'Raleway-ExtraBold',
        fontSize: Dimensions.get('window').width / 24,
        width: Dimensions.get('window').width / 1.15,
        textAlign: 'center',
        color: '#FFFFFF'
    },
    statTitleRegular: {
        fontFamily: 'Raleway-Medium',
        color: '#FFFFFF'
    },
    statInfoViewLeft: {
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    statInfoViewRight: {
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    verticalLine: {
        height: '50%',
        width: 2,
        backgroundColor: 'white'
    },
    bottomView: {
        top: Dimensions.get('window').height/45,
    },
    segmentedButtons: {
        width: Dimensions.get('window').width/1.15,
        alignSelf: 'center'
    }
});
