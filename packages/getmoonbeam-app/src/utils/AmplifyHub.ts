import { Hub } from '@aws-amplify/core';
// current list of listeners
const busListeners = {};

/**
 * Adds a listener to under th UNIQUE name, to the channel.
 * If the listener with the name already exists, it will be removed
 * before a new one is added.
 *
 * @param channel channel that the hub listens to
 * @param name name of the hub listener
 * @param callback callback function
 */
export function registerListener(channel, name, callback) {
    const previousListener = busListeners[name];
    if (!!previousListener) {
        Hub.remove(channel, previousListener);
    }
    busListeners[name] = callback;
    Hub.listen(channel, busListeners[name]);
}

/**
 * Removes a listener with the UNIQUE name, from the channel.
 *
 * @param channel channel that the hub listens to
 * @param name name of the hub listener
 */
export function removeListener(channel, name) {
    const listener = busListeners[name];
    if (!!listener) {
        Hub.remove(channel, listener);
    }
}
