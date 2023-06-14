import {
    DrawerContentComponentProps,
    DrawerContentScrollView,
    DrawerItem,
    DrawerItemList
} from '@react-navigation/drawer';
import {Dimensions, ImageBackground, Text, View} from 'react-native';
import {Avatar, Divider} from "@rneui/base";
import React, {useEffect, useState} from "react";
import {commonStyles} from "../../styles/common.module";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {styles} from '../../styles/customDrawer.module';
import {useRecoilState} from "recoil";
import {currentUserInformation} from "../../recoil/AuthAtom";

/**
 * CustomDrawer component. This component will be used to further tailor our sidebar navigation drawer, mainly
 * used by the AppDrawer parent component.
 *
 * @param props component properties to be passed in.
 * @constructor constructor for the component.
 */
export const CustomDrawer = (props: DrawerContentComponentProps) => {
    // constants used to keep track of local component state
    const [currentUserTitle,] = useState<string>("N/A");
    const [currentUserName,] = useState<string>("N/A");
    // constants used to keep track of shared states
    const [,] = useRecoilState(currentUserInformation);

    /**
     * Entrypoint UseEffect will be used as a block of code where we perform specific tasks (such as
     * auth-related functionality for example), as well as any afferent API calls.
     *
     * Generally speaking, any functionality imperative prior to the full page-load should be
     * included in here.
     */
    useEffect(() => {
    }, []);

    return (
        <>
            <View style={{flex: 1}}>
                <DrawerContentScrollView
                    {...props}
                    scrollEnabled={false}
                    contentContainerStyle={{backgroundColor: '#f2f2f2', flexDirection: 'column'}}
                >
                    <ImageBackground
                        imageStyle={{
                            resizeMode: 'cover'
                        }}
                        style={{padding: `${Dimensions.get('window').width / 25}%`}}
                        source={require('../../../assets/sidebar.png')}>
                        <Avatar
                            size={Dimensions.get('window').width / 4.5}
                            rounded
                            title={currentUserTitle}
                            containerStyle={styles.avatarStyle}
                            onPress={() => {
                                console.log('go to profile');
                            }}
                        >
                            <Avatar.Accessory
                                size={20}
                                style={styles.avatarAccessoryStyle}
                                onPress={() => {
                                    console.log('go to profile');
                                }}
                            />
                        </Avatar>
                        {/*@ts-ignore*/}
                        <Text numberOfLines={2} style={styles.userNameStyle}>{currentUserName}</Text>
                    </ImageBackground>
                    <View style={styles.drawerItemListView}>
                        <DrawerItemList {...props}/>
                    </View>
                </DrawerContentScrollView>
                <View style={styles.bottomDrawerItemListView}>
                    <Divider
                        style={[commonStyles.divider]}/>
                    {/*@ts-ignore*/}
                    <DrawerItem
                        activeBackgroundColor={'transparent'}
                        activeTintColor={'#A2B000'}
                        icon={() => <Icon size={25} name={'logout'}/>}
                        labelStyle={styles.drawerItemLabel}
                        label={'Log Out'}
                        onPress={() => {
                            console.log('sign out');

                            // ToDo: implement the Sign out mechanism here and cleanup any recoil states and object, as well as caches
                            //       and/or local store items.
                        }}>
                    </DrawerItem>
                </View>
            </View>
        </>
    )
}
