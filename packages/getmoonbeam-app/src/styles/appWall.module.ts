import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the AppWall component
export const styles = StyleSheet.create({
    titleView: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '100%',
        marginLeft: Dimensions.get('window').width/ 10,
        bottom: Dimensions.get('window').height / 10
    },
    titleViewDescription: {
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    stepTitle: {
        fontFamily: 'Saira-Medium',
        alignSelf: 'flex-start',
        fontSize: Dimensions.get('window').height / 22,
        color: '#FFFFFF'
    },
    triangleIcon: {
        marginRight: Dimensions.get('window').width/ 60
    },
    stepDescription: {
        fontFamily: 'Raleway-Regular',
        alignSelf: 'flex-start',
        marginLeft: Dimensions.get('window').width/ 18,
        bottom: Dimensions.get('window').height / 10,
        fontSize: Dimensions.get('window').height / 52,
        width: Dimensions.get('window').width/ 1.15,
        color: '#FFFFFF'
    },
    bottomContainerButtonView: {
        flexDirection: 'row',
        bottom: Dimensions.get('window').height / 10,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: Dimensions.get('window').width/ 10
    },
    buttonRightDisabled: {
        backgroundColor: '#D9D9D9',
        width: Dimensions.get('window').width/3,
        height: Dimensions.get('window').height/20,
        right: Dimensions.get('window').width/20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    bottomButton: {
        backgroundColor: '#F2FF5D',
        width: Dimensions.get('window').width/3,
        height: Dimensions.get('window').height/20,
        right: Dimensions.get('window').width/20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: Dimensions.get('window').height/45,
        marginTop: Dimensions.get('window').height / 90
    }
});
