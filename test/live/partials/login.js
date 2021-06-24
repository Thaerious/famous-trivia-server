import puppeteer from "puppeteer";

const SELECTORS = {
    EMAIL_FIELD : "input[type='email']",
    PASSWORD_FIELD : "input[type='password']",
    SUBMIT_EMAIL_BUTTON : "#identifierNext > div > button > span",
    SUBMIT_PW_BUTTON : "#passwordNext > div > button > div"
};

async function login(url, email, password){
    return new Promise(async (resolve, reject)=> {
        const browser = await puppeteer.launch({headless: false});
        const pages = await browser.pages();
        const page = pages[0];
        await page.goto(url);

        page.once("popup", async (popup) => {
            await loginToGoogle(popup, email, password);
            popup.on("close", ()=>resolve({browser, page}));
        });

        await page.click("#sign-in");
    });
}

async function loginToGoogle(popup, email, password){
        await popup.waitForSelector(SELECTORS.EMAIL_FIELD);
        await popup.click(SELECTORS.EMAIL_FIELD);
        await popup.type(SELECTORS.EMAIL_FIELD, email);
        await popup.click(SELECTORS.SUBMIT_EMAIL_BUTTON);

        await popup.waitForSelector(SELECTORS.PASSWORD_FIELD, {visible: true});
        await popup.click(SELECTORS.PASSWORD_FIELD);
        await popup.type(SELECTORS.PASSWORD_FIELD, password);
        await popup.click(SELECTORS.SUBMIT_PW_BUTTON);

        return popup;
}

export default login;