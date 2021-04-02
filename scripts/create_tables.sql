CREATE TABLE games
(
    userId varchar(64) primary key,
    game   text
);

CREATE TABLE users
(
    userId varchar(64) primary key,
    name   varchar(64)
);

CREATE TABLE hashes
(
    userId     varchar(64) primary key,
    host       varchar(32),
    contestant varchar(32)
);