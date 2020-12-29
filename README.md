# A3FL Twitter Scraper

This tool was designed as a practice project but ended up being used within the ArmA 3 Fishers Life community. This tool will repeatedly check for any text containing a phone number from the ArmA 3 Fishers Life in-game Twitter API and once found, will add the phone number and associated name to a Google Sheet. This tool was used to develop a 'phonebook' of sorts.

For metrics, this tool was being hosted by me from the 24th of June 2020, to the 28th of December 2020, which means this script ran roughly 26,928 times in its lifetime.

## Getting Started

These are the instructions on how you can get this package up and running on your project locally.

You should clone this repository locally and deploy somewhere which can support a constantly running application.

### Prerequisites

If you are installing using npm, you should have the latest version of npm which can be obtained by running the following:

```sh
npm install npm@latest -g
```

### Installation

Clone repository using Git:
```sh
git clone https://github.com/Phire0/A3FL-Twitter-Scraper.git
```

Install dependencies using npm:
```sh
npm install
```

## Usage

After an initial setup involving Google API authentication, this tool can be left to run on its own.

To use this application as is, you must provide the tool with a Google token.json and credentials.json file so that your API usage can be authenticated. You can read about this here: https://developers.google.com/identity/protocols/oauth2/service-account

## Contact

Jamie Connelly – [@Phire0](https://twitter.com/Phire0)

Distributed under the MIT license. See ``LICENSE`` for more information.

[https://github.com/Phire0](https://github.com/Phire0/)

## Contributing

I am no longer developing this tool, but I welcome you to fork it and work on it as you desire.