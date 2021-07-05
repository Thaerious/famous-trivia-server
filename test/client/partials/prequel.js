import ParseArgs from "@thaerious/parseargs";
import puppeteer from "puppeteer";
import {QueryHandler} from 'query-selector-shadow-dom/plugins/puppeteer/index.js';

await puppeteer.registerCustomQueryHandler('shadow', QueryHandler);

let args = new ParseArgs().loadOptions("test/client/.parseArgs").run();

let globals = {
    args: args,        // command line arguments
    host: {},          // host launch_using_google console page
    host_portal : {},  // host portal page
    players: []        // contestant portal pages
};

export default globals;