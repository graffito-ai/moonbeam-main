import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across the Home stack props.
 */
export type HomeStackParamList = {
    Dashboard: {},
    Marketplace: {},
    Cards: {}
};

// the Dashboard component props, within the Home stack
export type DashboardProps = NativeStackScreenProps<HomeStackParamList, 'Dashboard'>;
// the Marketplace component props, within the Home stack
export type MarketplaceProps = NativeStackScreenProps<HomeStackParamList, 'Marketplace'>;
// the Cards component props, within the Home stack
export type CardsProps = NativeStackScreenProps<HomeStackParamList, 'Cards'>;
