CREATE TABLE games
(
    userId varchar(64),
    game   text
);

CREATE TABLE users
(
    userId varchar(64),
    name   varchar(64)
);

CREATE TABLE hashes
(
    userId     varchar(64),
    host       varchar(32),
    contestant varchar(32)
);