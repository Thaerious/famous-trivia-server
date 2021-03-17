call browserify src/client/home.js -o public/scripts/home.js -d
call browserify src/client/editor.js -o public/scripts/editor.js -d
call sass src/styles/editor.scss:public/styles/generated/editor.css
call sass src/styles/game_board.scss:public/styles/generated/game_board.css
call sass src/styles/multiple_choice_pane.scss:public/styles/generated/multiple_choice_pane.css