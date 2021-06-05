systemctl status nginx
systemctl start nginx
systemctl stop nginx
systemctl restart nginx
systemctl enable nginx
systemctl disable nginx

npx c8 mocha [testname]
npx c8 report -r html

Project Layout
==============
 * accessory/ : Scripts and config files for setting up external services.
 * coverage/ : Created by c8 test coverage.
 * db/ : Database files.
 * public/ : Directory express exposes / target of generated files.
 * * assets/ : Images, sounds, etc.
 * * scripts/jit/ : Just-in-time target directory.
 * * scripts/static/ : User-created (not-generated) scripts.
 * * styles/font/ : css font files
 * * styles/generated/ : scss generated files
 * * src/client/ : Page files, must be located here as the jit-browserify targets this directory.
 * * src/client/modules/ : Non-nidget, not root, js files.
 * * src/client/nidgets/ : Nidget script files from ejs /views/nidgets.
 * * src/server/ : Server side source files.
 * * src/styles/ : SCSS source files.
 * * test/ : test files
 * * test/data/ : data files specifically for tests.
 * * test/doNotRun/ : old/obsolete test files.
 * view/ : embedded-java-script (ejs) files.
 * view/nidgets/ : ejs source files for Nidgets, these are embedded into 'view' files as templates.
 * view/partials/ : ejs included files
 * view/pages/ : root ejs files
 