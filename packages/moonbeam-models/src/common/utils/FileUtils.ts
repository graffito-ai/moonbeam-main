/**
 * Utility function used to convert a passed in string (usually corresponding to a file),
 * to a string.
 *
 * @param stream stream to be passed in
 */
export const streamToString = (stream: NodeJS.ReadableStream): Promise<string> => {
    const chunks: Array<any> = []
    return new Promise((resolve, reject) => {
        stream.on('data', chunk => chunks.push(chunk))
        stream.on('error', reject)
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    })
}
