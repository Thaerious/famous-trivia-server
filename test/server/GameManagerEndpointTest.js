import GameManagerEndpoint from "../../src/server/game/GameManagerEndpoint.js";
import assert from 'assert';
import fs from 'fs';
import GameModel from '../../src/server/game/GameModel.js';
import {Game, Timer} from '../../src/server/game/Game.js';
import NameValidator from "../../src/server/game/NameValidator.js";
import GameManager from "../../src/server/game/GameManager.js";

const file = fs.readFileSync('test/data/test-data-00.json');
const gameDescriptor = JSON.parse(file);

function verify(token) {
    if (token.startsWith("abc")) {
        return {
            userId: token,
            userName: token
        }
    }
}

await describe(`GameManagerEndpoint Unit Tests`, async () => {
    /**
     * <b>Launch a new game from a game description model.</b>
     * The 'body' requires a model field and a token field (Google auth token),
     * The token will be tested against the 'verify' function passed into the constructor.
     * The model will be used to instantiate the GameModel object which is returned by
     * subsequent calls to the api, using the returned game hash as a key.
     *
     * @param {Object} body with parameters token, model
     * @returns {Promise<SuccessGameHashResponse|ErrorResponse>}
     */
    await describe("#launch", async () => {
        it("verify function returns an object without userId & userName throws an error", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), (t) => t === "abc");
            const body = {model: gameDescriptor, token: "abc"}
            let response = await gme.launch(body);

            assert.strictEqual(response.object['result'], "error");
        });

        it("game-hash & success on a valid launch", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const body = {model: gameDescriptor, token: "abc"}
            let response = await gme.launch(body);

            assert.strictEqual(typeof response.object['game-hash'], "string");
            assert.strictEqual(response.object['result'], "success");
        });

        it("game-hash & success on a second valid launch", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            await gme.launch({model: gameDescriptor, token: "abc1"});
            let response = await gme.launch({model: gameDescriptor, token: "abc2"});

            assert.strictEqual(typeof response.object['game-hash'], "string");
            assert.strictEqual(response.object['result'], "success");
        });

        it("an error when the token is invalid", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const body = {model: gameDescriptor, token: ""}
            let response = await gme.launch(body);

            assert.strictEqual(response.object['result'], "error");
        });

        it("an error when a game has already been launched with the provided token", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const body = {model: gameDescriptor, token: "abc"}
            await gme.launch(body);
            let response = await gme.launch(body);

            assert.strictEqual(response.object['result'], "error");
        });

        it("an error when the token is missing", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const body = {model: gameDescriptor}
            await gme.launch(body);
            let response = await gme.launch(body);

            assert.strictEqual(response.object['result'], "error");
        });

        it("an error when the model is missing", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const body = {token: "abc"}
            await gme.launch(body);
            let response = await gme.launch(body);

            assert.strictEqual(response.object['result'], "error");
        });
    });

    /**
     * <b>Retrieve the game-hash for a launched game.</b>
     * The 'body' requires a token field (Google auth token).
     * The token will be tested against the 'verify' function passed into the constructor.
     * If a game has not been launched the a rejected response will be sent.
     * Will send an error response if the token is rejected.
     * @param body {token}
     * @returns {Promise<RejectedResponse|SuccessGameHashResponse|ErrorResponse>}
     */

    await describe("#get-hosted-game-hash", async () => {
        it("the game-hash of a launched game", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const body = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(body);
            const expected = launchResponse.object['game-hash'];

            const response = await gme['get-hosted-game-hash']({token: "abc"});

            assert.strictEqual(response.object['game-hash'], expected);
        });

        it("an error when the token is invalid", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const body = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(body);
            const expected = launchResponse.object['game-hash'];

            const response = await gme['get-hosted-game-hash']({token: ""});

            assert.strictEqual(response.object['result'], "error");
        });

        it("rejected when no game has been launched", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const response = await gme['get-hosted-game-hash']({token: "abc"});
            assert.strictEqual(response.object['result'], "rejected");
        });

        it("an error when the token is missing", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const body = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(body);
            const expected = launchResponse.object['game-hash'];

            const response = await gme['get-hosted-game-hash']({});

            assert.strictEqual(response.object['result'], "error");
        });
    })

    /**
     * <b>Join a contestant to a launched game.</b>
     * The 'body' requires a name and a game-hash field.
     * The name will be tested against the Validator class-object passed into the
     * constructor.  Invalid names & already used names will receive a rejected response.
     * Unknown game hashes will receive an error response.
     * Users that have already joined a game will return an error; use 'get-game-hash' to determine
     * if the user has joined before calling 'join-game'.
     * @param body {name, game-hash}
     * @param sessionHash
     * @returns {Promise<InvalidNameResponse|SuccessResponse|ErrorResponse|NameInUseResponse>}
     */
    await describe("#join-game", async () => {
        it("success when the user first joins", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];
            const joinBody = {'game-hash': gameHash, 'name': 'adam'};
            const sessionHash = '1A2B3C';

            const response = await gme['join-game'](joinBody, sessionHash);
            assert.strictEqual(response.object['result'], "success");
        });

        it("rejected when the user joins again", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];
            const joinBody = {'game-hash': gameHash, 'name': 'adam'};
            const sessionHash = '1A2B3C';

            await gme['join-game'](joinBody, sessionHash);
            const response = await gme['join-game'](joinBody, sessionHash);
            assert.strictEqual(response.object['result'], "rejected");
        });

        it("rejected when the name is not valid", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];
            const joinBody = {'game-hash': gameHash, 'name': 'ad--am'};
            const sessionHash = '1A2B3C';

            const response = await gme['join-game'](joinBody, sessionHash);
            assert.strictEqual(response.object['result'], "rejected");
        });

        it("rejected when the name is in use", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];
            const joinBody = {'game-hash': gameHash, 'name': 'adam'};

            await gme['join-game'](joinBody, '1A2B3C');
            const response = await gme['join-game'](joinBody, '4D5E6F');
            assert.strictEqual(response.object['result'], "rejected");
        });

        it("an error when a different game has already been joined", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const response1 = await gme.launch({model: gameDescriptor, token: "abc1"});
            const response2 = await gme.launch({model: gameDescriptor, token: "abc2"});
            const gameHash1 = response1.object['game-hash'];
            const gameHash2 = response2.object['game-hash'];

            await gme['join-game']({'game-hash': gameHash1, 'name': 'adam'}, '1A2B3C');
            const response = await gme['join-game']({'game-hash': gameHash2, 'name': 'adam'}, '1A2B3C');
            assert.strictEqual(response.object['result'], "rejected");
        });

        it("an error when game hasn't been launched (unknown game hash)", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchResponse = await gme.launch({model: gameDescriptor, token: "abc1"});
            const gameHash = launchResponse.object['game-hash'];

            const response = await gme['join-game']({'game-hash': "", 'name': 'adam'}, '1A2B3C');
            assert.strictEqual(response.object['result'], "error");
        });

        it("an error when the game-hash is missing", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchResponse = await gme.launch({model: gameDescriptor, token: "abc1"});
            const gameHash = launchResponse.object['game-hash'];

            const response = await gme['join-game']({'name': 'adam'}, '1A2B3C');
            assert.strictEqual(response.object['result'], "error");
        });

        it("an error when the name is missing", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchResponse = await gme.launch({model: gameDescriptor, token: "abc1"});
            const gameHash = launchResponse.object['game-hash'];

            const response = await gme['join-game']({'game-hash': gameHash}, '1A2B3C');
            assert.strictEqual(response.object['result'], "error");
        });
    })

    /**
     * <b>Retrieve a game-hash using a contestant session-hash as the key.</b>
     * No 'body' is read for this method.
     * Unknown session hashes will emit a rejected response.
     * Known session hashes will emit a success response with the 'game-hash' field.
     * @param sessionHash
     * @returns {Promise<SuccessResponse|RejectedResponse>}
     */
    await describe("#get-game-hash", async () => {
        it("success with game-hash when game has been joined", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];
            const joinBody = {'game-hash': gameHash, 'name': 'adam'};

            await gme['join-game'](joinBody, '1A2B3C');
            const response = await gme['get-game-hash'](null, '1A2B3C');
            assert.strictEqual(response.object['result'], "success");
            assert.strictEqual(response.object['game-hash'], gameHash);
        });

        it("rejected when game has not been joined", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];
            const joinBody = {'game-hash': gameHash, 'name': 'adam'};

            const response = await gme['get-game-hash'](null, '1A2B3C');
            assert.strictEqual(response.object['result'], "rejected");
        });
    })

    /**
     * <b>Associate a session with a game as host.</b>
     * The 'body' requires a token field (Google auth token),
     * The token will be tested against the 'verify' function passed into the constructor.
     * If a game has not been launched an error will be emitted.
     * On success emits a success with a game-hash.
     * @param body
     * @param sessionHash
     * @returns {Promise<SuccessResponse|ErrorResponse>}
     */
    await describe("#connect-host", async () => {
        it("game-hash on success", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];

            const response = await gme['connect-host']({token: "abc"}, '1A2B3C');
            assert.strictEqual(response.object['result'], "success");
            assert.strictEqual(response.object['game-hash'], gameHash);
        });

        it("isHostSession emits true on success", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];

            const response = await gme['connect-host']({token: "abc"}, '1A2B3C');
            assert.strictEqual(gme.isHostSession(gameHash, '1A2B3C'), true);
        });

        it("can reassign session hash as long as the token is valid", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];

            await gme['connect-host']({token: "abc"}, '1A2B3C');
            const response = await gme['connect-host']({token: "abc"}, '2A3B4F');
            assert.strictEqual(response.object['result'], "success");
            assert.strictEqual(response.object['game-hash'], gameHash);
        });

        it("isHostSession emits true for new hash reassign", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];

            await gme['connect-host']({token: "abc"}, '1A2B3C');
            const response = await gme['connect-host']({token: "abc"}, '2A3B4F');
            assert.strictEqual(gme.isHostSession(gameHash, '2A3B4F'), true);
        });

        it("isHostSession emits false for old hash reassign", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];

            await gme['connect-host']({token: "abc"}, '1A2B3C');
            const response = await gme['connect-host']({token: "abc"}, '2A3B4F');
            assert.strictEqual(gme.isHostSession(gameHash, '1A2B3C'), false);
        });

        it("emits error with invalid token", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];

            await gme['connect-host']({token: "abc"}, '1A2B3C');
            const response = await gme['connect-host']({token: "---"}, '2A3B4F');
            assert.strictEqual(response.object['result'], "error");
        });

        it("emits error with missing token", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];

            await gme['connect-host']({token: "abc"}, '1A2B3C');
            const response = await gme['connect-host']({}, '2A3B4F');
            assert.strictEqual(response.object['result'], "error");
        });
    });

    /**
     * <b>Remove a game from the game manager and update all records</b>
     * Removes host and contestants from current games.
     * Body requires a token which will be verified against verify function passed
     * into the constructor.
     * If the game hash doesn't exist an error is emitted.
     * If the token isn't verified then an error is emitted.
     *
     * @param {Object} body {game-hash}
     * @returns {Promise<SuccessResponse|ErrorResponse>}
     */
    await describe("#terminate", async () => {
        it("success when game terminated", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];
            const joinBody = {'game-hash': gameHash, 'name': 'adam'};
            await gme['connect-host']({token: "abc"}, '1A2B3C');

            const terminateResponse = await gme['terminate']({token: "abc"})
            assert.strictEqual(terminateResponse.object['result'], "success");
        });

        it("error when token unknown", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];
            const joinBody = {'game-hash': gameHash, 'name': 'adam'};
            await gme['connect-host']({token: "abc"}, '1A2B3C');

            const terminateResponse = await gme['terminate']({token: ""})
            assert.strictEqual(terminateResponse.object['result'], "error");
        });

        it("error when token missing", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];
            const joinBody = {'game-hash': gameHash, 'name': 'adam'};
            await gme['connect-host']({token: "abc"}, '1A2B3C');

            const terminateResponse = await gme['terminate']({})
            assert.strictEqual(terminateResponse.object['result'], "error");
        });

        it("isHostSession false", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];
            const joinBody = {'game-hash': gameHash, 'name': 'adam'};
            await gme['connect-host']({token: "abc"}, '1A2B3C');

            const terminateResponse = await gme['terminate']({token: "abc"});
            assert.strictEqual(gme.isHostSession(gameHash, '1A2B3C'), false);
        });

        it("isContestantSession false", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];
            const joinBody = {'game-hash': gameHash, 'name': 'adam'};
            await gme['join-game'](joinBody, 'aa11aa11');
            await gme['connect-host']({token: "abc"}, '1A2B3C');

            const terminateResponse = await gme['terminate']({token: "abc"});
            assert.strictEqual(gme.isContestantSession(gameHash, 'aa11aa11'), false);
        });
    });

    await describe("#isContestantSession", async () => {
        it("true when successfully joined", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];
            const joinBody = {'game-hash': gameHash, 'name': 'adam'};
            const sessionHash = '1A2B3C';

            const response = await gme['join-game'](joinBody, sessionHash);
            assert.strictEqual(gme.isContestantSession(gameHash, '1A2B3C'), true);
        });

        it("false for unknown session", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];
            const joinBody = {'game-hash': gameHash, 'name': 'adam'};
            const sessionHash = '1A2B3C';

            const response = await gme['join-game'](joinBody, sessionHash);
            assert.strictEqual(gme.isContestantSession(gameHash, '121245'), false);
        });

        it("false for unknown game", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];
            const joinBody = {'game-hash': gameHash, 'name': 'adam'};
            const sessionHash = '1A2B3C';

            const response = await gme['join-game'](joinBody, sessionHash);
            assert.strictEqual(gme.isContestantSession("xxx", '121245'), false);
        });
    });

    await describe("#isHostSession", async () => {
        it("true when successfully joined", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];
            const joinBody = {'game-hash': gameHash, 'name': 'adam'};
            const sessionHash = '1A2B3C';

            await gme['connect-host']({token: "abc"}, '1A2B3C');
            assert.strictEqual(gme.isHostSession(gameHash, '1A2B3C'), true);
        });

        it("false for unknown session", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];
            const joinBody = {'game-hash': gameHash, 'name': 'adam'};
            const sessionHash = '1A2B3C';

            await gme['connect-host']({token: "abc"}, '1A2B3C');
            assert.strictEqual(gme.isHostSession(gameHash, '121245'), false);
        });

        it("false for unknown game", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];
            const joinBody = {'game-hash': gameHash, 'name': 'adam'};
            const sessionHash = '1A2B3C';

            const response = await gme['join-game'](joinBody, sessionHash);
            assert.strictEqual(gme.isHostSession("xxx", '121245'), false);
        });
    });

    await describe("#getName", async () => {
        it("when successfully joined returns name", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];
            const joinBody = {'game-hash': gameHash, 'name': 'adam'};
            const sessionHash = '1A2B3C';

            const response = await gme['join-game'](joinBody, sessionHash);
            assert.strictEqual(gme.getName('1A2B3C'), "ADAM");
        });

        it("error for unknown session", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];
            const joinBody = {'game-hash': gameHash, 'name': 'adam'};
            const sessionHash = '1A2B3C';

            await gme['join-game'](joinBody, sessionHash);
            assert.throws(() => gme.getName('121245'));
        });
    });

    await describe("#getRole", async () => {
        it("contestant role", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];
            const joinBody = {'game-hash': gameHash, 'name': 'adam'};
            const sessionHash = '1A2B3C';

            await gme['join-game'](joinBody, sessionHash);
            assert.strictEqual(gme.getRole('1A2B3C'), "contestant");
        });

        it("host role", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];
            const joinBody = {'game-hash': gameHash, 'name': 'adam'};
            const sessionHash = '1A2B3C';

            await gme['connect-host']({token: "abc"}, 'AABBCC');
            await gme['join-game'](joinBody, sessionHash);
            assert.strictEqual(gme.getRole('AABBCC'), "host");
        });

        it("error for unknown session", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];
            const joinBody = {'game-hash': gameHash, 'name': 'adam'};
            const sessionHash = '1A2B3C';

            const response = await gme['join-game'](joinBody, sessionHash);
            assert.throws(() => gme.getRole('121245'));
        });
    });
    await describe("#getGameHash", async () => {
        it("contestant hash", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];
            const joinBody = {'game-hash': gameHash, 'name': 'adam'};
            const sessionHash = '1A2B3C';

            await gme['join-game'](joinBody, sessionHash);
            assert.strictEqual(gme.getGameHash('1A2B3C'), gameHash);
        });

        it("host hash", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];
            const joinBody = {'game-hash': gameHash, 'name': 'adam'};
            const sessionHash = '1A2B3C';

            await gme['connect-host']({token: "abc"}, 'AABBCC');
            await gme['join-game'](joinBody, sessionHash);
            assert.strictEqual(gme.getGameHash('AABBCC'), gameHash);
        });

        it("error for unknown session", async () => {
            const gme = new GameManagerEndpoint(new GameManager(), new NameValidator(), verify);
            const launchBody = {model: gameDescriptor, token: "abc"}
            const launchResponse = await gme.launch(launchBody);
            const gameHash = launchResponse.object['game-hash'];
            const joinBody = {'game-hash': gameHash, 'name': 'adam'};
            const sessionHash = '1A2B3C';

            const response = await gme['join-game'](joinBody, sessionHash);
            assert.throws(() => gme.getGameHash('121245'));
        });
    });
});
