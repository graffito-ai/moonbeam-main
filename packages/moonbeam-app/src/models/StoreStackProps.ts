import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across all Store derived stack props.
 */
export type StoreStackParamList = {
    Marketplace: {
        currentUserInformation: any;
    }
};

// the Store/Marketplace component props, within the Store stack
export type MarketplaceProps = NativeStackScreenProps<StoreStackParamList, 'Marketplace'>
