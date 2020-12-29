/* Copyright (C) 2020 Jamie Connelly - All Rights Reserved
 * You may use, distribute and modify this code under the
 * terms of the MIT license.
 */

const axios = require("axios");
const fs = require("fs");
const { google } = require("googleapis");
const jsdom = require("jsdom");
const readline = require("readline");

// Express in this context is being used as a method to keep
// the platform this application was originally hosted on from sleeping.
// If you are not hosting on Heroku like I did, this can likely be removed,
// alongside the Express references throughout this code.
const app = require("express")();

// Logger object
const logger = new (require("./util/Logger"))("A3FL Twitter Scraper");

// Google Sheets API Authentication Information
// You MUST install the token and credential files for this application to function.
// See https://developers.google.com/identity/protocols/oauth2/service-account
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const TOKEN_PATH = "token.json";
const CREDENTIALS_PATH = "credentials.json";

// Google Sheet ID
const SHEET_ID = "";

// How often will we execute this
const YIELD_TIME = 600000; // time in miliseconds, default 10 minutes

/**
 * Application entry point
 */
function main() {
    // Production target URL
    const siteUrl = "https://arma3fisherslife.net/api/twitter/twitterChat.php";

    // Get the page contents and send it off so we can gather the information required
    axios(siteUrl)
        .then(response => scrapeMessages(response))
        .catch(e => logger.error(`Error occurred while grabbing HTML content - ${e}`));
}

/**
 * Scrape the passed HTML content for Twitter advertisements and send it for logging
 * @param {Object} response The HTML response retrieved when the website is queried
 */
async function scrapeMessages(response) {
    // Convert the HTML into a DOM object so that we can manipulate it
    const dom = new jsdom.JSDOM(response.data);

    // Store all of the divs in an array so we can search through them
    const divs = dom.window.document.querySelectorAll("div");

    // Iterate over the divs array
    for (let i = 0; i < divs.length; i++) {
        // Get the innerHTML element of the current div
        let currentMessage = divs[i].innerHTML;
        
        // This regex will check for any message containing a phone number, for example:
        // 06.15 07:48 <FACTION IMG> Firstname Lastname [1234567] This is my advertisement! - PASS
        if (/\[[0-9]+\]/.test(currentMessage)) {
            // Remove the associated faction image from the message, trim the whitespace and split it by spaces
            const sendMessage = currentMessage.replace(/\<img([\s\S]*)>/g, "").trim().split(" ");

            // Set up the message data variables
            const name = `${sendMessage[0]} ${sendMessage[1]}`;
            const number = sendMessage[2].substr(1, sendMessage[2].length - 2);

            logger.log(`Received data on [${name} - ${number}].`);

            // Send the data to be imported in the Google Sheet
            insertDataToSheet(name, number)
                .then(() => logger.success(`Successfully appended the Google Sheet.`))
                .catch((e) => logger.error(`There was an error while trying to append the Google Sheet: ${e}`))

            // Pause for 1000 miliseconds, don't want to overwhelm the API
            await sleep(1000);
        }
    }

    logger.warn("Scrape complete, yielding until next execution.\n");
}

/**
 * A cheat to sleep for a little bit to allow the API to catch up
 * @param {number} ms The number of miliseconds to sleep for
 */
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    })
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    })
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
    });

    logger.log(`Authorize this application by visiting this URL: ${authUrl}`);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question("Enter the code from that page here: ", (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return logger.error(`Error while trying to retrieve access token: ${err}`);
            oAuth2Client.setCredentials(token);

            // Store the token to disk
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return logger.error(`Error storing token to disk: ${err}`);
                logger.success(`Token stored to disk: ${TOKEN_PATH}`);
            });

            callback(oAuth2Client);
        })
    })
}

/**
 * Insert data to the Google Sheet
 * @param {string} name The name of the person whose number is being logged
 * @param {string} number The phone number of the person whose number is being logged
 */
function insertDataToSheet(name, number) {
    return new Promise((resolve, reject) => {
        // Load the client secrets from the local credentials file
        fs.readFile(CREDENTIALS_PATH, (err, content) => {
            if (err) reject(err);

            // Authorize a client with credentials, then call the Google Sheets API
            authorize(JSON.parse(content), (auth) => {
                // Setup our sheet object
                const sheets = google.sheets({
                    version: "v4",
                    auth
                });

                // Append our data to the sheet
                sheets.spreadsheets.values.append({
                    spreadsheetId: SHEET_ID,
                    range: "Data",
                    valueInputOption: "RAW",
                    resource: {values: [[name, number]]}
                }, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                })
            })
        })
    })
}

/**
 * Controls the application flow
 */
async function flow() {
    while (true) {
        main();
        await sleep(YIELD_TIME);
    }
}

logger.log("Checking for Google authentication files...");

// Check for the token.json file
fs.access(TOKEN_PATH, fs.F_OK, (err) => {
    if (err) {
        logger.error("Google authentication file token.json could not be found.");
        logger.error("You must install this file so that you can be authenticated through Google's API.");
        logger.error("More info can be found here: https://developers.google.com/identity/protocols/oauth2/service-account");
        process.exit(1);
    }
});

// Check for the credentials.json file
fs.access(CREDENTIALS_PATH, fs.F_OK, (err) => {
    if (err) {
        logger.error("Google authentication file credentials.json could not be found.");
        logger.error("You must install this file so that you can be authenticated through Google's API.");
        logger.error("More info can be found here: https://developers.google.com/identity/protocols/oauth2/service-account");
        process.exit(1);
    }
});

logger.log("Check passed, starting application...");

// Start the main application flow
flow();

// Heroku Express trick as detailed above
app.get("/", (req, res) => res.send(`Application is running...`));
app.listen(process.env.PORT || 5000);
