import puppeteer from "puppeteer";
import assert from "assert";

async function connectContestant(url, name, headless = true){
    return new Promise(async (resolve, reject)=> {
        const browser = await puppeteer.launch({headless: headless});
        const pages = await browser.pages();
        const page = pages[0];
        await page.goto(url);

        await page.click("#name");
        await page.keyboard.type(name);
        await page.click("#join");

        browser.once("targetchanged", async (target) => {
            const page = await target.page();
            const indexOf = page.target().url().indexOf("contestant_portal.ejs");
            assert.notStrictEqual(indexOf, -1);
            resolve({browser, page});
        });
    });
}

export default connectContestant;