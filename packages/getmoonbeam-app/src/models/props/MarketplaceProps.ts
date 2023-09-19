import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across the Marketplace stack props.
 */
export type MarketplaceStackParamList = {
    Store: {},
    StoreOffer: {}
};

// the Store component props, within the Marketplace stack
export type StoreProps = NativeStackScreenProps<MarketplaceStackParamList, 'Store'>;
// the Marketplace component props, within the Home stack
export type StoreOfferProps = NativeStackScreenProps<MarketplaceStackParamList, 'StoreOffer'>;
