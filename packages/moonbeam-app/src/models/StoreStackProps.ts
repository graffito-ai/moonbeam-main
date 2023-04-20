import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from "react";
import {PartnerStore} from "../../../moonbeam-models";

/**
 * The default list of params, to be used across all Store derived stack props.
 */
export type StoreStackParamList = {
    Marketplace: {
        currenUserInformation: any,
        setBottomTabNavigationShown?: React.Dispatch<React.SetStateAction<boolean>>,
        storeDismissed?: boolean
    },
    PartnerMerchant: {
        currenUserInformation: any,
        setBottomTabNavigationShown?: React.Dispatch<React.SetStateAction<boolean>>,
        partnerStore: PartnerStore
    }
};

// the Store/Marketplace component props, within the Store stack
export type MarketplaceProps = NativeStackScreenProps<StoreStackParamList, 'Marketplace'>
// the PartnerMerchant component props, within the Store stack
export type PartnerMerchantProps = NativeStackScreenProps<StoreStackParamList, 'PartnerMerchant'>

