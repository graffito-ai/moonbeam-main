import {Dimensions, StyleSheet} from "react-native";

// styles to be used within the AppOverview component
export const styles = StyleSheet.create({
    topContainer: {
        flex: 0.52,
        width: '100%'
    },
    topContainerImage: {
        height: '85%',
        marginTop: Dimensions.get('window').height/10
    },
    bottomContainer: {
        backgroundColor: '#313030',
        flex: 0.48,
        width: '100%'
    },
    bottomContainerTitle: {
        fontFamily: 'Saira-Medium',
        marginTop: Dimensions.get('window').height/22,
        fontSize: Dimensions.get('window').height/32,
        textAlign: 'center',
        width: Dimensions.get('window').width/1.25,
        alignSelf: 'center',
        color: '#FFFFFF'
    },
    bottomContainerContent: {
        fontFamily: 'Raleway-Regular',
        marginTop: Dimensions.get('window').height/32,
        fontSize: Dimensions.get('window').height/52,
        textAlign: 'center',
        width: Dimensions.get('window').width/1.15,
        alignSelf: 'center',
        color: '#FFFFFF'
    },
    progressSteps: {
        marginTop: Dimensions.get('window').height/25
    },
    progressStepsCenter: {
        height: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    activeStep: {
        backgroundColor: '#F2FF5D',
        width: Dimensions.get('window').width/35,
        height: Dimensions.get('window').height/65,
        marginLeft: Dimensions.get('window').width/30,
        marginRight: Dimensions.get('window').width/30,
        borderRadius: Math.round(Dimensions.get('window').width + Dimensions.get('window').height) / 2,
    },
    inactiveStep: {
        backgroundColor: '#D9D9D9',
        width: Dimensions.get('window').width/35,
        height: Dimensions.get('window').height/65,
        marginLeft: Dimensions.get('window').width/30,
        marginRight: Dimensions.get('window').width/30,
        borderRadius: Math.round(Dimensions.get('window').width + Dimensions.get('window').height) / 2,
    },
    buttonLeft: {
        backgroundColor: '#F2FF5D',
        width: Dimensions.get('window').width/3,
        height: Dimensions.get('window').height/20,
        marginRight: Dimensions.get('window').width/5,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonRight: {
        backgroundColor: '#F2FF5D',
        width: Dimensions.get('window').width/3,
        height: Dimensions.get('window').height/20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: '#313030',
        fontFamily: 'Saira-Medium',
        fontSize: Dimensions.get('window').height/45,
        marginTop: Dimensions.get('window').height / 90
    },
    bottomContainerButtons: {
        marginBottom: Dimensions.get('window').width/12,
        alignItems: "center",
        alignContent: 'center',
        justifyContent: 'center'
    }
});
