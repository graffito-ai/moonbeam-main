import * as FileSystem from "expo-file-system";
import {API, graphqlOperation} from "aws-amplify";
import {FileAccessLevel, FileType, getStorage} from "@moonbeam/moonbeam-models";

/**
 * Function used to fetch a file from CloudFront, given its name, and privacy level,
 * and store it and/or retrieve it from the local file system (if it is cached).
 *
 * @param name name of the document to fetch
 * @param privacyFlag privacy level flag
 *
 * @return an instance of {@link Promise} of a tuple containing a {@link boolean} and a {@link string}
 */
export const fetchFile = async (name: string, privacyFlag: boolean): Promise<[boolean, string | null]> => {
    // first check if the base directory exists or not
    const baseDir = `${FileSystem.documentDirectory!}` + `files/`;
    const baseDirInfo = await FileSystem.getInfoAsync(baseDir);
    if (!baseDirInfo.exists) {
        await FileSystem.makeDirectoryAsync(baseDir);
    }
    // then check if the file exists in the local file system storage
    const fileUri = baseDir + name;
    const fileInfo = await FileSystem.getInfoAsync(fileUri);

    // if the file already exists in local file system cache
    // ToDo: re-download the file after a certain time
    if (!fileInfo.exists) {
        console.log(`${name} isn't cached locally. Downloading...`);
        // perform the query to fetch a file
        const fetchFileResult = await API.graphql(graphqlOperation(getStorage, {
            getStorageInput: {
                level: privacyFlag ? FileAccessLevel.Private : FileAccessLevel.Public,
                type: FileType.Main,
                name: name
            }
        }));
        // @ts-ignore
        if (fetchFileResult && fetchFileResult.data.getStorage.errorMessage === null) {
            // @ts-ignore
            const retrievedURI = fetchFileResult.data.getStorage.data.url;
            const fileDownloadResult = await FileSystem.downloadAsync(retrievedURI, fileUri);

            // file did not exist, downloaded the file and return the newly locally cached URI
            return [true, fileDownloadResult.uri];
        } else {
            console.log(`Unexpected error while fetching file ${name} ${JSON.stringify(fetchFileResult)}`);
            return [false, null];
        }
    }
    console.log(`${name} is cached locally.`);

    // file exists, just return the locally cached URI
    return [true, fileUri];
}
