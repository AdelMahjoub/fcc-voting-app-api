# Api
---
## Routes
### `/api/users`

| Verb  | Description         | Privilege   |
|--     |---                  |---          |
| GET   | get all users       | admins only |
| POST  | register a new user | public      |

### `/api/users/confirm`

| Verb  | Description                | Privilege   |
|--     |---                         |---          |
| POST  | confirm user registration  | public      |

### `/api/users/authenticate`

| Verb  | Description                   | Privilege   |
|--     |---                            |---          |
| POST  | authenticate a registred user | public      |


### `/api/users/:id`

| Verb   | Description      | Privilege 	                   |
|--      |---               |---                             |
| GET    | get a user by id | authenticated user and admins  |
| PATCH  | update a user    | authenticated user and admins  |
| DELETE | delete a user    | admins only                    |

### `/api/polls`

| Verb   | Description      | Privilege 	                   |
|--      |---               |---                             |
| GET    | get all polls    | public                         |
| POST   | add a poll       | authenticated users and admins |

### `/api/polls/:id`

| Verb   | Description      | Privilege 	                   |
|--      |---               |---                             |
| GET    | get a poll by id | public                         |
| PATCH  | update a poll    | authenticated user and admins  |
| DELETE | delete a poll    | authenticated user and admins  |

### `/api/votes`

| Verb   | Description      | Privilege 	                   |
|--      |---               |---                             |
| GET    | get all votes    | admins only                    |

### `/api/votes/users/:userId`

| Verb   | Description             |Privilege 	                   |
|--      |---                      |---                            |
| GET    | get all votes of a user | authenticated user and admins |
| DELETE | retract all votes       | authenticated user and admins |

### `/api/votes/users/:userId/polls/:pollId`

| Verb   | Description                         | Privilege 	                  |
|--      |---                                  |---                           |
| GET    | return the voted option in the poll | authenticated user and admins|
| DELETE | retract a vote from a poll          | authenticated user and admins|

### `/api/votes/users/:userId/polls/:pollId/options/:optionId`

| Verb   | Description      |Privilege 	                     |
|--      |---               |---                             |
| POST   | vote in a poll   | authenticated users and admins |

## Tables
```sql
+----------------------+
| Tables_in_VOTING_APP |
+----------------------+
| Options              |
| Polls                |
| Users                |
| Votes                |
+----------------------+
```
### Users
```sql
+--------------+------------------+------+-----+-------------------+----------------+
| Field        | Type             | Null | Key | Default           | Extra          |
+--------------+------------------+------+-----+-------------------+----------------+
| id           | int(11) unsigned | NO   | PRI | NULL              | auto_increment |
| username     | varchar(255)     | NO   | UNI | NULL              |                |
| email        | varchar(255)     | NO   | UNI | NULL              |                |
| password     | varchar(255)     | NO   |     | NULL              |                |
| confirmToken | varchar(255)     | NO   |     | NULL              |                |
| confirmed    | tinyint(1)       | NO   |     | 0                 |                |
| registerDate | timestamp        | NO   |     | CURRENT_TIMESTAMP |                |
+--------------+------------------+------+-----+-------------------+----------------+

CREATE TABLE `Users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `confirmToken` varchar(255) NOT NULL,
  `confirmed` tinyint(1) NOT NULL DEFAULT '0',
  `registerDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
### Polls
```sql
+----------+------------------+------+-----+-------------------+----------------+
| Field    | Type             | Null | Key | Default           | Extra          |
+----------+------------------+------+-----+-------------------+----------------+
| id       | int(11) unsigned | NO   | PRI | NULL              | auto_increment |
| title    | varchar(255)     | NO   | UNI | NULL              |                |
| authorId | int(11) unsigned | NO   | MUL | NULL              |                |
| postDate | timestamp        | NO   |     | CURRENT_TIMESTAMP |                |
+----------+------------------+------+-----+-------------------+----------------+
CREATE TABLE IF NOT EXISTS `Polls` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `authorId` int(11) unsigned NOT NULL,
  `postDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `title` (`title`),
  FOREIGN KEY (`authorId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
### Options
```sql
+----------+------------------+------+-----+---------+----------------+
| Field    | Type             | Null | Key | Default | Extra          |
+----------+------------------+------+-----+---------+----------------+
| id       | int(11) unsigned | NO   | PRI | NULL    | auto_increment |
| belongTo | int(11) unsigned | NO   | MUL | NULL    |                |
| label    | varchar(255)     | NO   |     | NULL    |                |
| voted    | int(11) unsigned | YES  |     | 0       |                |
+----------+------------------+------+-----+---------+----------------+
CREATE TABLE IF NOT EXISTS `Options` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `belongTo` int(11) unsigned NOT NULL,
  `label` varchar(255) NOT NULL,
  `voted` int(11) unsigned DEFAULT '0',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`belongTo`) REFERENCES `Polls` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
### Votes
```sql
+----------+------------------+------+-----+---------+----------------+
| Field    | Type             | Null | Key | Default | Extra          |
+----------+------------------+------+-----+---------+----------------+
| id       | int(11) unsigned | NO   | PRI | NULL    | auto_increment |
| userId   | int(11) unsigned | NO   | MUL | NULL    |                |
| pollId   | int(11) unsigned | NO   | MUL | NULL    |                |
| optionId | int(11) unsigned | NO   | MUL | NULL    |                |
+----------+------------------+------+-----+---------+----------------+
CREATE TABLE IF NOT EXISTS `Votes` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `userId` int(11) unsigned NOT NULL,
  `pollId` int(11) unsigned NOT NULL,
  `optionId` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`pollId`) REFERENCES `Polls` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`optionId`) REFERENCES `Options` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

