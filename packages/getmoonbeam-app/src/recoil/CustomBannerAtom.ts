import {atom} from "recoil";

/**
 * Atom used to keep track of the custom banner visibility, to be used for displaying a custom
 * banner or not.
 */
const bannerVisibilityState = atom({
    key: "bannerVisibilityState",
    default: false
});

/**
 * Atom used to keep track of the custom banner state, to be used for displaying a custom
 * banner.
 */
const customBannerState = atom({
    key: "customBannerState",
    default: {
        bannerVisibilityState: bannerVisibilityState,
        bannerMessage: "",
        bannerButtonLabel: "",
        bannerButtonLabelActionSource: "",
        bannerArtSource: "",
        dismissing: false
    }
});

/**
 * Export all atoms and/or selectors
 */
export {
    customBannerState
};
