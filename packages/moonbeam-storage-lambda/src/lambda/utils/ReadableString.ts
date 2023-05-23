import { Readable } from 'stream'

/**
 * Class used to convert a string to a Readable stream
 */
// @ts-ignore
class ReadableString extends Readable {
    private sent = false

    /**
     * Constructor for class
     *
     * @param str string to be converted to a stream
     */
    constructor(private str: string) {
        super();
    }

    /**
     * Method used to read the string and push it to a Buffer
     */
    _read() {
        if (!this.sent) {
            this.push(Buffer.from(this.str));
            this.sent = true
        }
        else {
            this.push(null)
        }
    }
}
