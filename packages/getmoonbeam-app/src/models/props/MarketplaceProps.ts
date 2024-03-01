import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OfferCategory} from "@moonbeam/moonbeam-models";

/**
 * The default list of params, to be used across the Marketplace stack props.
 */
export type MarketplaceStackParamList = {
    Store: {},
    StoreOffer: {
        bottomTabNeedsShowingFlag: boolean
    },
    Kit: {
        kitType: OfferCategory
    }
};

// the Store component props, within the Marketplace stack
export type StoreProps = NativeStackScreenProps<MarketplaceStackParamList, 'Store'>;
// the Marketplace component props, within the Marketplace stack
export type StoreOfferProps = NativeStackScreenProps<MarketplaceStackParamList, 'StoreOffer'>;
// the Kit component props. within the Marketplace stack
export type KitProps = NativeStackScreenProps<MarketplaceStackParamList, 'Kit'>;
