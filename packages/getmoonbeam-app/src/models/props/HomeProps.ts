import type {NativeStackScreenProps} from '@react-navigation/native-stack';

/**
 * The default list of params, to be used across the Home stack props.
 */
export type HomeStackParamList = {
    DashboardController: {},
    Roundups: {},
    Services: {},
    Marketplace: {},
    Cards: {}
};

// the Dashboard component props, within the Home stack
export type DashboardHomeProps = NativeStackScreenProps<HomeStackParamList, 'DashboardController'>;
// the Roundups component props, within the Home stack
export type RoundupsProps = NativeStackScreenProps<HomeStackParamList, 'Roundups'>;
// the Services component props, within the Home stack
export type ServicesProps = NativeStackScreenProps<HomeStackParamList, 'Services'>;
// the Marketplace component props, within the Home stack
export type MarketplaceProps = NativeStackScreenProps<HomeStackParamList, 'Marketplace'>;
// the Cards component props, within the Home stack
export type CardsProps = NativeStackScreenProps<HomeStackParamList, 'Cards'>;
