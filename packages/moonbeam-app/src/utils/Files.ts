import {FileAccessLevel, FileType, getStorage} from "@moonbeam/moonbeam-models";
import { API, graphqlOperation } from "aws-amplify";
import {Buffer} from "buffer";
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
        const buff = Buffer.from(`${fetchFileResult.data.getStorage.data.url}`, "base64");
        const fileUri = FileSystem.documentDirectory + name;

        await FileSystem.writeAsStringAsync(fileUri, buff.toString("base64"), {
            encoding: FileSystem.EncodingType.Base64,
        });
        await Sharing.shareAsync(fileUri);

        return true;
    } else {
        console.log(`Unexpected error while fetching file ${name} ${JSON.stringify(fetchFileResult)}`);
        return false;
    }
}
