Client Side
-----------

Coverage
^^^^^^^^

To enable code coverage, set the 'NODE_ENV' environment variable to 'test'.
After enabling the test environment, re-render the files ``node . -r``.

**Linux & Mac**

``export NODE_ENV=test``

**Windows**

``$env:NODE_ENV="test"``

Babel will add Istanbul (nyc) markup to all scripts when they are rendered by browserify.
The .ejs renderer will inject a page unload listener into all the pages (see /view/partials/head.ejs).
This listener will call the /report-coverage service and pass it the coverage file.

**Create the report**

``npx nyc report --report-dir coverage/client -r html``

Live Tests
^^^^^^^^^^

The live tests simulate a game on a live server.  A google account is needed with the appropriate game description file.
A copy of this file can be found at */test/data/demonstration_game.json*.

Start the index with custom timeouts:

``node . -ta 5 -tb 5``

Execute the following to run the tests.

``npx mocha .\test\client\TEST_NAME -ep EMAIL PASSWORD --bail``

GUI Tests
^^^^^^^^^

The GUI tests are similar to the live tests except they do not use Google.
The tests run on a single game instance.

``npx mocha .\test\client\single_instance_host_play_test.js``

Server Side
-----------

Coverage
^^^^^^^^

The index uses c8 instead of nyc because nyc doesn't handle imports, but rather
handles require.

* Added dev packages "c8"
* Requires interactive mode (-i)

Instructions
^^^^^^^^^^^^

Running the server with coverage (requires interactive mode -i).

``npx c8 --temp-directory ./.c8_output/ node . -i``

Create the report.

``npx c8 report --temp-directory .c8_output/ --report-dir coverage/server -r html``

Tests
^^^^^

Run tests with coverage.

``npx c8 --temp-directory .c8_output mocha [TEST]``

````