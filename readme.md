# Api
---
## Routes
### `/api/users`

| Verb  | Description       | Privilege   |
|--     |---                |---          |
| GET   | get all users     | admins only |
| POST  | add a new user    | public      |

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

+----------------------+
| Tables_in_VOTING_APP |
+----------------------+
| Options              |
| Polls                |
| Users                |
| Votes                |
+----------------------+

### Users
```
+--------------+------------------+------+-----+-------------------+----------------+
| Field        | Type             | Null | Key | Default           | Extra          |
+--------------+------------------+------+-----+-------------------+----------------+
| id           | int(11) unsigned | NO   | PRI | NULL              | auto_increment |
| username     | varchar(255)     | NO   | UNI | NULL              |                |
| email        | varchar(255)     | NO   | UNI | NULL              |                |
| password     | varchar(255)     | NO   |     | NULL              |                |
| registerDate | timestamp        | NO   |     | CURRENT_TIMESTAMP |                |
+--------------+------------------+------+-----+-------------------+----------------+
```
### Polls
```
+----------+------------------+------+-----+-------------------+----------------+
| Field    | Type             | Null | Key | Default           | Extra          |
+----------+------------------+------+-----+-------------------+----------------+
| id       | int(11) unsigned | NO   | PRI | NULL              | auto_increment |
| title    | varchar(255)     | NO   | UNI | NULL              |                |
| authorId | int(11) unsigned | NO   | MUL | NULL              |                |
| postDate | timestamp        | NO   |     | CURRENT_TIMESTAMP |                |
+----------+------------------+------+-----+-------------------+----------------+
```
### Options
```
+----------+------------------+------+-----+---------+----------------+
| Field    | Type             | Null | Key | Default | Extra          |
+----------+------------------+------+-----+---------+----------------+
| id       | int(11) unsigned | NO   | PRI | NULL    | auto_increment |
| belongTo | int(11) unsigned | NO   | MUL | NULL    |                |
| label    | varchar(255)     | NO   |     | NULL    |                |
| voted    | int(11) unsigned | YES  |     | 0       |                |
+----------+------------------+------+-----+---------+----------------+
```
### Votes
```
+----------+------------------+------+-----+---------+----------------+
| Field    | Type             | Null | Key | Default | Extra          |
+----------+------------------+------+-----+---------+----------------+
| id       | int(11) unsigned | NO   | PRI | NULL    | auto_increment |
| userId   | int(11) unsigned | NO   | MUL | NULL    |                |
| pollId   | int(11) unsigned | NO   | MUL | NULL    |                |
| optionId | int(11) unsigned | NO   | MUL | NULL    |                |
+----------+------------------+------+-----+---------+----------------+
```

