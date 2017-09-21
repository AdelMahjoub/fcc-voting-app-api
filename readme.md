# Api
---

**A detailed description of the implemented routes is available [here](https://documenter.getpostman.com/view/1662201/voting-app/6tgW29i)**

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

## Responses
### Format
```js
{
  "requested": String,                 // Requested route
  "success"  : Boolean,                // Requested action success or fails
  "errors"   : String[],               // If the requested action fails, should contains error messages
  "data"     : Array || Object || null // Payload depending on the requested action, null if success is false
  "timestamp": String                  // Current server's timestamp
}

```
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
| isAdmin      | tinyint(1)       | YES  |     | 0                 |                |
+--------------+------------------+------+-----+-------------------+----------------+

```
### Polls
```sql
+----------+------------------+------+-----+-------------------+----------------+
| Field    | Type             | Null | Key | Default           | Extra          |
+----------+------------------+------+-----+-------------------+----------------+
| id       | int(11) unsigned | NO   | PRI | NULL              | auto_increment |
| title    | varchar(255)     | NO   | MUL | NULL              |                |
| userId   | int(11) unsigned | NO   | MUL | NULL              |                |
| postDate | timestamp        | NO   |     | CURRENT_TIMESTAMP |                |
+----------+------------------+------+-----+-------------------+----------------+

```
### Options
```sql
+--------+------------------+------+-----+---------+----------------+
| Field  | Type             | Null | Key | Default | Extra          |
+--------+------------------+------+-----+---------+----------------+
| id     | int(11) unsigned | NO   | PRI | NULL    | auto_increment |
| pollId | int(11) unsigned | NO   | MUL | NULL    |                |
| label  | varchar(255)     | NO   |     | NULL    |                |
| voted  | int(11) unsigned | YES  |     | 0       |                |
+--------+------------------+------+-----+---------+----------------+

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

```

