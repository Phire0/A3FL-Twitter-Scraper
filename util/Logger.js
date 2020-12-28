// Colour codes for logging
// https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
const colours = {
    reset: "\x1b[0m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
    green: "\x1b[32m"
}

/**
 * Creates and returns a timestamp in HH:MM:SS format.
 * @returns {string} The created timestamp string
 */
const getTimestamp = () => {   
    // Date object
    const date = new Date()

    // Build the individual components of the string 
    // slicing is used to ensure we have the correct number of characters
    const hours = ("0" + date.getHours()).slice(-2)
    const minutes = ("0" + date.getMinutes()).slice(-2)
    const seconds = ("0" + date.getSeconds()).slice(-2)

    // Return the string, format: HH:MM:SS
    return `${hours}:${minutes}:${seconds}`
}


/**
 * A class used for console logging
 * @class Logger
 */
class Logger {
    
    /**
     * @constructor
     * @param {string} prefix The prefix to display before console messages
     */
    constructor(prefix) {
        // Set the loggers prefix
        this.prefix = prefix || "Logger"

        // Tell the server that the logger has been constructed
        this.log("Logger initialised")
    }

    /**
     * Display a regular message in the console
     * @param {string} msg The message to be displayed in the console
     */
    log(msg) {
        // Format: [12:34:56] [<CYAN>Prefix</CYAN>] [Hello World]
        console.log(`[${getTimestamp()}] [${colours.cyan}${this.prefix}${colours.reset}] ${msg}`)
    }

    /**
     * Display a success message in the console
     * @param {string} msg The message to be displayed in the console
     */
    success(msg) {
        // Format: [12:34:56] [<CYAN>Prefix</CYAN>] [<GREEN>Mission Successful!</GREEN>]
        console.log(`[${getTimestamp()}] [${colours.cyan}${this.prefix}${colours.reset}] ${colours.green}${msg}${colours.reset}`)
    }

    /**
     * Display a warning message in the console
     * @param {string} msg The message to be displayed in the console
     */
    warn(msg) {
        // Format: [12:34:56] [<CYAN>Prefix</CYAN>] [<YELLOW>Something weird is happening</YELLOW>]
        console.warn(`[${getTimestamp()}] [${colours.cyan}${this.prefix}${colours.reset}] ${colours.yellow}${msg}${colours.reset}`)
    }

    /**
     * Display an error message in the console
     * @param {string} msg The message to be displayed in the console
     */
    error(msg) {
        // Format: [12:34:56] [<CYAN>Prefix</CYAN>] [<RED>Something terrible is happening</RED>]
        console.error(`[${getTimestamp()}] [${colours.cyan}${this.prefix}${colours.reset}] ${colours.red}${msg}${colours.reset}`)
    }
}

module.exports = Logger