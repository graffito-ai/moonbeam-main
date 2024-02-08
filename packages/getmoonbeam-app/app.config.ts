import {ExpoConfig, ConfigContext} from 'expo/config';

/**
 * Exporting the custom configuration for App for Expo.
 *
 * @param config default config context passed in
 */
export default ({config}: ConfigContext): ExpoConfig => ({
    ...config,
    name: "Moonbeam Finance",
    owner: "moonbeamfin",
    slug: "moonbeam-app",
    version: "0.0.18",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    backgroundColor: "#313030",
    splash: {
        image: "./assets/splash.png",
        resizeMode: "cover"
    },
    scheme: "moonbeamfin",
    assetBundlePatterns: [
        "**/*",
        "./amplify/.config/local-env-info.json"
    ],
    notification: {
        color: "#313030",
        androidMode: "default",
        androidCollapsedTitle: "Updates from Moonbeam",
        iosDisplayInForeground: true
    },
    androidStatusBar: {
        backgroundColor: "#313030"
    },
    ios: {
        buildNumber: "3",
        bundleIdentifier: process.env.IOS_BUNDLE_IDENTIFIER,
        supportsTablet: false,
        infoPlist: {
            "NSFaceIDUsageDescription": "$(PRODUCT_NAME) will access and use Face ID, in order to allow you to easily authenticate, either for the purposes of accessing your account, or for various protected account-related functionalities. Please note that Moonbeam will not store any of your biometric information.",
            "NSUserTrackingUsageDescription": "$(PRODUCT_NAME) will collect data, such as your Precise Location and Physical Address, that can be used for tracking you or your device. This data, will enable us to provide you with more personalized military offers.",
            "NSContactsUsageDescription": "$(PRODUCT_NAME) will access your contacts, in order to automatically add our support information in your list of contacts, for ease of access. Please note that Moonbeam will not store any of your contact information.",
            "NSLocationWhenInUseUsageDescription": "$(PRODUCT_NAME) will access your location once, while using the app, in order to provide you with accurate military offers nearby. Please note that any location information will be stored according to our Privacy Policy and Terms and Conditions, which are presented during account registration, and can also be accessed in the Documents section of our app.",
            "NSLocationAlwaysAndWhenInUseUsageDescription": "$(PRODUCT_NAME) will access your location while using the app, in order to provide you with accurate military offers nearby. Please note that any location information will be stored according to our Privacy Policy and Terms and Conditions, which are presented during account registration, and can also be accessed in the Documents section of our app.",
            "NSLocationAlwaysUsageDescription": "$(PRODUCT_NAME) will always have access to your location, in order to provide you with accurate military offers nearby. Please note that any location information will be stored according to our Privacy Policy and Terms and Conditions, which are presented during account registration, and can also be accessed in the Documents section of our app."
        },
        config: {
            googleMapsApiKey: process.env.GOOGLE_MAPS_APIS_IOS_KEY,
            branch: {
                apiKey: process.env.BRANCH_API_KEY
            },
            usesNonExemptEncryption: false
        }
    },
    android: {
        versionCode: 35,
        package: process.env.ANDROID_PACKAGE,
        googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
        softwareKeyboardLayoutMode: "pan",
        adaptiveIcon: {
            foregroundImage: "./assets/adaptive-icon.png",
            backgroundColor: "#ffffff"
        },
        permissions: [
            "android.permission.INTERNET",
            "android.permission.READ_CONTACTS",
            "android.permission.WRITE_CONTACTS",
            "android.permission.ACCESS_COARSE_LOCATION",
            "android.permission.ACCESS_FINE_LOCATION",
            "android.permission.FOREGROUND_SERVICE"
        ],
        blockedPermissions: [
            "com.google.android.gms.permission.AD_ID"
        ],
        config: {
            googleMaps: {
                apiKey: process.env.GOOGLE_MAPS_APIS_ANDROID_KEY
            },
            branch: {
                apiKey: process.env.BRANCH_API_KEY
            }
        }
    },
    web: {
        favicon: "./assets/favicon.png"
    },
    extra: {
        eas: {
            projectId: "c3b0411c-168c-4e25-b525-9499a4277c8f"
        },
        android: {
            mapSha: process.env.GOOGLE_MAPS_ANDROID_SHA
        }
    },
    runtimeVersion: {
        policy: "nativeVersion"
    },
    updates: {
        url: process.env.EAS_UPDATES_URL
    },
    plugins: [
        [
            "expo-updates",
            {
                "username": "moonbeamfin"
            }
        ],
        [
            "@config-plugins/react-native-branch",
            {
                "apiKey": "key_live_dCiEy5Jy3M9LvuF3YtBmXogiEtfJdz6J"
            }
        ],
        [
            "expo-tracking-transparency",
            {
                "userTrackingPermission": "$(PRODUCT_NAME) will collect data, such as your Precise Location and Physical Address, that can be used for tracking you or your device. This data, will enable us to provide you with more personalized military offers."
            }
        ],
        [
            "expo-contacts",
            {
                "contactsPermission": "$(PRODUCT_NAME) will access your contacts, in order to automatically add our support information in your list of contacts, for ease of access. Please note that Moonbeam will not store any of your contact information."
            }
        ],
        [
            "expo-location",
            {
                "locationAlwaysAndWhenInUsePermission": "$(PRODUCT_NAME) will always have access to your location, in order to provide you with accurate military offers nearby. Please note that any location information will be stored according to our Privacy Policy and Terms and Conditions, which are presented during account registration, and can also be accessed in the Documents section of our app.",
                "locationWhenInUsePermission": "$(PRODUCT_NAME) will access your location while using the app, in order to provide you with accurate military offers nearby. Please note that any location information will be stored according to our Privacy Policy and Terms and Conditions, which are presented during account registration, and can also be accessed in the Documents section of our app.",
                "isIosBackgroundLocationEnabled": false,
                "isAndroidBackgroundLocationEnabled": false
            }
        ],
        [
            "expo-document-picker",
            {
                "iCloudContainerEnvironment": "Production"
            }
        ],
        [
            "expo-image-picker",
            {
                "photosPermission": "$(PRODUCT_NAME) will access your photos, in order to allow you to either upload pictures of documentation necessary for verifying your military identity, or to help you set a profile picture. Please note that any media will be stored according to our Privacy Policy and Terms and Conditions, which are presented during account registration, and can also be accessed in the Documents section of our app.",
                "cameraPermission": "$(PRODUCT_NAME) will access your camera, in order to allow you to either take pictures of documentation necessary for verifying your military identity, or to help you set a profile picture. Please note that any media will be stored according to our Privacy Policy and Terms and Conditions, which are presented during account registration, and can also be accessed in the Documents section of our app."
            }
        ],
        [
            "expo-local-authentication",
            {
                "faceIDPermission": "$(PRODUCT_NAME) will access and use Face ID, in order to allow you to easily authenticate, either for the purposes of accessing your account, or for various protected account-related functionalities. Please note that Moonbeam will not store any of your biometric information."
            }
        ],
        "expo-font",
        "expo-secure-store"
    ]
});
