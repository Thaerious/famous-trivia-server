=====
Tests
=====


Client Side Coverage
--------------------

Overview
^^^^^^^^

* Added dev packages "NYC", and "babel-plugin-istanbul".
* Added ["istanbul"] to the .babelrc plugins under 'env.test'.
* Added 'unsafe-eval' to cors.  Istanbul failed without it.
* Created a new server endpoint '/report-coverage' see src/server/mechanics/ReportCoverage.js.
* Created a new client script 'public/scripts/static/coverage_report.js'.

Instructions
^^^^^^^^^^^^

Set the 'NODE_ENV' environment variable to 'test'.

Run the server ("node .") normally.
Babel will add Istanbul (nyc) markup to all pages when they are compiled.
The .ejs renderer will inject a page unload listener into all the pages (see /view/partials/head.ejs).
This listener will call the /report-coverage service and pass it the coverage file.

To generate reports enter ``npx nyc report --report-dir coverage/client -r html`` on the command line.

Setting NODE_ENV
^^^^^^^^^^^^^^^^

Set the NODE_ENV variable to enable client side code coverage.  This need to be set before running the
browserify flag (-b).

* linux & mac: export NODE_ENV=test
* windows: $env:NODE_ENV = 'test'

Server Side Coverage
--------------------

Overview
^^^^^^^^

The server uses c8 instead of nyc because nyc doesn't handle imports, but rather
handles require.

* Added dev packages "c8"
* Requires interactive mode (-i)

Run the server with this command:

``npx c8 --temp-directory ./.c8_output/ node . -i``

Create the report with this command:

``npx c8 report --temp-directory .c8_output/ --report-dir coverage/server -r html``