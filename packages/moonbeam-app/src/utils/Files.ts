import {FileAccessLevel, FileType, getStorage} from "@moonbeam/moonbeam-models";
import {API, graphqlOperation} from "aws-amplify";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

/**
 * Function used to fetch a document from CloudFront, given its name, and privacy level,
 * and allow for opening it with a partner application.
 *
 * @param name name of the document to fetch
 * @param privateFlag privacy level flag
 */
export const fetchDocument = async (name: string, privateFlag: boolean): Promise<boolean> => {
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
                level: privateFlag ? FileAccessLevel.Private : FileAccessLevel.Public,
                type: FileType.Main,
                name: name
            }
        }));
        // @ts-ignore
        if (fetchFileResult && fetchFileResult.data.getStorage.errorMessage === null) {
            // @ts-ignore
            const fileDownloadResult = await FileSystem.downloadAsync(fetchFileResult.data.getStorage.data.url, fileUri);
            await Sharing.shareAsync(fileDownloadResult.uri);

            return true;
        } else {
            console.log(`Unexpected error while fetching file ${name} ${JSON.stringify(fetchFileResult)}`);
            return false;
        }
    }
    console.log(`${name} is cached locally.`);
    // file exists, just share given the local cached URI
    await Sharing.shareAsync(fileUri);
    return true;
}
