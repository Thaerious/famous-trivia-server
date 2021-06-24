import ParseArgs from "@thaerious/parseargs";
import puppeteer from "puppeteer";
import {QueryHandler} from 'query-selector-shadow-dom/plugins/puppeteer/index.js';

await puppeteer.registerCustomQueryHandler('shadow', QueryHandler);

let args = new ParseArgs().loadOptions().run();

let globals = {
    args: args,
    host: {},
    host_portal : {},
    players: []
};

export default globals;