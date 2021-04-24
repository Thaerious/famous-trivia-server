CREATE TABLE games (userId varchar(64) primary key, hash varchar(32) unique, game text);
CREATE TABLE contestants (contestant_name varchar(64), game_hash varchar(32));