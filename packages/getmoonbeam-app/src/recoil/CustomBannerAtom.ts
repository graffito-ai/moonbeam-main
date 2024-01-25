import {atom} from "recoil";

/**
 * Atom used to keep track of the custom banner state, to be used for displaying a custom
 * banner.
 */
const bannerVisibilityState = atom({
    key: "bannerVisibilityState",
    default: false
});
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
