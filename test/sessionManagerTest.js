// noinspection SqlNoDataSourceInspection,DuplicatedCode

import assert from 'assert';
import SessionManager from "../src/server/SessionManager.js";

describe(`Session Manager`, async () => {
    let sessionManager = null;
    let newHash = null;
    let secondHash = null;

    describe(`#constructor`, async () => {
        it(`sanity test`, async () => {
            // sessionManager = new SessionManager(":memory:");
            sessionManager = new SessionManager("db/test.db");
            assert.notStrictEqual(sessionManager, null);
        });
        it(`insert clean tables`, async () => {
            await sessionManager.run("DROP TABLE IF EXISTS parameters");
            await sessionManager.run("DROP TABLE IF EXISTS sessions");
            await sessionManager.run("CREATE TABLE parameters(session varchar(64), name varchar(64), value varchar(256), UNIQUE(session, name));");
            await sessionManager.run("CREATE TABLE sessions(session varchar(64) primary key, expires int)");
        });
    });

    describe(`#validateSession`, async () => {
        it(`adds a new hash if no hash is provided`, async () => {
            newHash = await sessionManager.validateSession();
            assert.notStrictEqual(newHash, null);
            assert.notStrictEqual(newHash, undefined);
        });

        it(`validated sessions can be retrieved`, async () => {
            let session = sessionManager.getSession(newHash);
            assert.notStrictEqual(session, null);
            assert.notStrictEqual(session, undefined);
        });
    });

    describe(`#set`, async () => {
        it(`add a new value to the session`, async () => {
            let session = sessionManager.getSession(newHash);
            await session.set("letter", "A");
        });
        it(`add a second value to the session`, async () => {
            let session = sessionManager.getSession(newHash);
            await session.set("number", "1");
        });
        it(`set => has`, async () => {
            let session = sessionManager.getSession(newHash);
            assert.strictEqual(session.has("letter"), true);
        });
        it(`set => get`, async () => {
            let session = sessionManager.getSession(newHash);
            assert.strictEqual(session.get("letter"), "A");
        });
        it(`new values are overwritten`, async () => {
            let session = sessionManager.getSession(newHash);
            await session.set("letter", "B");
            assert.strictEqual(session.get("letter"), "B");
        });
        it(`key values are case sensitive`, async () => {
            let session = sessionManager.getSession(newHash);
            assert.strictEqual(session.has("Letter"), false);
        });
    });

    describe(`#clearLive & #load`, async () => {
        it(`#has`, async () => {
            let session = sessionManager.getSession(newHash);
            assert.strictEqual(session.has("letter"), true);
        });
        it(`#get`, async () => {
            let session = sessionManager.getSession(newHash);
            assert.strictEqual(session.get("letter"), "B");
        });
    });

    describe(`#listKeys`, async () => {
        it(`has two values`, async () => {
            let session = sessionManager.getSession(newHash);
            assert.strictEqual(session.listKeys().length, 2);
        });
    });

    describe(`add a second session`, async () => {
        it(`adds a new hash if no hash is provided`, async () => {
            secondHash = await sessionManager.validateSession();
            assert.notStrictEqual(newHash, null);
            assert.notStrictEqual(newHash, undefined);
        });
        it(`populate second hash with values`, async () => {
            let session = sessionManager.getSession(secondHash);
            await session.set("letter", "A");
            await session.set("number", "1");
            await session.set("animal", "cat");
        });
        it(`new session has it's own values`, async () => {
            let session = sessionManager.getSession(secondHash);
            assert.strictEqual(session.get("letter"), "A");
            assert.strictEqual(session.get("number"), "1");
            assert.strictEqual(session.get("animal"), "cat");
        });
        it(`previous session has it's own values`, async () => {
            let session = sessionManager.getSession(newHash);
            assert.strictEqual(session.get("letter"), "B");
            assert.strictEqual(session.get("number"), "1");
            assert.strictEqual(session.get("animal"), undefined);
        });
    });

    describe(`#clearLive & #load (two sessions)`, async () => {
        it(`first session has it's own values`, async () => {
            let session = sessionManager.getSession(newHash);
            assert.strictEqual(session.get("letter"), "B");
            assert.strictEqual(session.get("number"), "1");
            assert.strictEqual(session.get("animal"), undefined);
        });

        it(`second session has it's own values`, async () => {
            let session = sessionManager.getSession(secondHash);
            assert.strictEqual(session.get("letter"), "A");
            assert.strictEqual(session.get("number"), "1");
            assert.strictEqual(session.get("animal"), "cat");
        });
    });

    describe(`#reverseLookup`, async () => {
        describe(`lookup just key`, async () => {
            it(`both have the key`, async () => {
                let sessions = sessionManager.reverseLookup("letter");
                assert.notStrictEqual(sessions.indexOf(newHash), -1);
                assert.notStrictEqual(sessions.indexOf(secondHash), -1);
            });
            it(`one has the key`, async () => {
                let sessions = sessionManager.reverseLookup("animal");
                assert.strictEqual(sessions.indexOf(newHash), -1);
                assert.notStrictEqual(sessions.indexOf(secondHash), -1);
            });
            it(`neither has the key`, async () => {
                let sessions = sessionManager.reverseLookup("color");
                assert.strictEqual(sessions.indexOf(newHash), -1);
                assert.strictEqual(sessions.indexOf(secondHash), -1);
            });
        });
        describe(`lookup key-value pair`, async () => {
            it(`both have the key-value pair`, async () => {
                let sessions = sessionManager.reverseLookup("number", "1");
                assert.notStrictEqual(sessions.indexOf(newHash), -1);
                assert.notStrictEqual(sessions.indexOf(secondHash), -1);
            });
            it(`both have the key one has the value`, async () => {
                let sessions = sessionManager.reverseLookup("letter", "A");
                assert.strictEqual(sessions.indexOf(newHash), -1);
                assert.notStrictEqual(sessions.indexOf(secondHash), -1);
            });
            it(`one has the key-value`, async () => {
                let sessions = sessionManager.reverseLookup("animal", "cat");
                assert.strictEqual(sessions.indexOf(newHash), -1);
                assert.notStrictEqual(sessions.indexOf(secondHash), -1);
            });
            it(`one has the key, neither has the value`, async () => {
                let sessions = sessionManager.reverseLookup("animal", "dog");
                assert.strictEqual(sessions.indexOf(newHash), -1);
                assert.strictEqual(sessions.indexOf(secondHash), -1);
            });
            it(`neither has the key`, async () => {
                let sessions = sessionManager.reverseLookup("color", "red");
                assert.strictEqual(sessions.indexOf(newHash), -1);
                assert.strictEqual(sessions.indexOf(secondHash), -1);
            });
        });
    });

    describe(`clear value`, async () => {
        it(`clear => doesn't have`, async () => {
            let session = sessionManager.getSession(newHash);
            session.clear("number");
            assert.strictEqual(session.has("number"), false);
        });
    });
});