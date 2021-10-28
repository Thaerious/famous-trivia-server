import assert from "assert";
import Logger from "../../src/server/Logger.js";

Logger.traceOffset = 3;

const cl = console.log;
console.lg = console.log;
let lastMessage = null;

function redirectLog(string) {
    lastMessage = string;
}

describe(`Logger Test - Logger.js`, () => {
    before(() => {
        console.log = redirectLog;
    });

    beforeEach(() => {
        lastMessage = null;
    });

    after(() => {
        console.log = cl;
    });

    describe(`#channel`, () => {
      it(`numbered channels are permitted`, () => {
            const logger = new Logger();
            logger.channel(1).prefix = "one: ";
            logger.channel(1).log("hello world!");
            assert.strictEqual(lastMessage, "one: hello world!");
        });          
        it(`unnammed channels default to 'log'`, () => {
            const logger = new Logger();
            logger.channel('log').prefix = "log: ";
            logger.channel().log("hello world!");
            assert.strictEqual(lastMessage, "log: hello world!");
        });
        it(`null channels default to 'log'`, () => {
            const logger = new Logger();
            logger.channel('log').prefix = "log: ";
            logger.channel(null).log("hello world!");
            assert.strictEqual(lastMessage, "log: hello world!");
        });        

        describe(`#channel - channels are enabled by default`, () => {
            it(`channel 'log' is enabled`, () => {
                const logger = new Logger();
                logger.channel("log").log("hello world!");
                assert.strictEqual(lastMessage, "hello world!");
            });
            it(`channel 'apple' is enabled`, () => {
                const logger = new Logger();
                logger.channel("apple").log("hello apple!");
                assert.strictEqual(lastMessage, "hello apple!");
            });
        });
        describe(`each channel can have one prefix`, () => {
            it(`channel 'log' gets function prefix`, () => {
                const logger = new Logger();
                logger.channel("log").prefix = () => {
                    return "log: ";
                };
                logger.channel("log").log("hello world!");
                assert.strictEqual(lastMessage, "log: hello world!");
            });
            it(`channel 'log' gets string prefix`, () => {
                const logger = new Logger();
                logger.channel("log").prefix = "log: ";
                logger.channel("log").log("hello world!");
                assert.strictEqual(lastMessage, "log: hello world!");
            });
            it(`prefix prints filename, line, offset`, () => {
                  const logger = new Logger();
                  logger.channel("log").prefix = (f, l, o) => {
                      return `${f}:${l}:${o} `;
                  };
                  logger.channel("log").log("hello world!");
                  assert.strictEqual(lastMessage, "LoggerTest.js:79:41 hello world!");
              });
        });
        describe(`#enabled - enabled controls output`, () => {
            it(`#enabled = false prevents output`, () => {
                const logger = new Logger();
                logger.channel("log").enabled = false;
                logger.channel("log").log("hello world!");
                assert.strictEqual(lastMessage, null);
            });
            it(`#enabled = true reenables`, () => {
                const logger = new Logger();
                logger.channel("log").enabled = false;
                logger.channel("log").log("hello world!");
                logger.channel("log").enabled = true;
                logger.channel("log").log("world hello?");
                assert.strictEqual(lastMessage, "world hello?");
            });
        });
        describe(`logger remembers last channel requested (or log if none)`, () => {
            it(`channel 'log' is default`, () => {
                const logger = new Logger();
                logger.log("hello world!");
                assert.strictEqual(lastMessage, "hello world!");
            });
            it(`logger uses last channel called for default calls`, () => {
                const logger = new Logger();

                logger.channel("log").prefix = "log: ";
                logger.channel("apple").prefix = "apple: ";

                logger.channel("apple");
                logger.log("hello apple!");
                assert.strictEqual(lastMessage, "apple: hello apple!");
            });
        });
    });
});
