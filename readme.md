# Api
---
## Route
### `/api/users`

| Verb  | Description       | Privilege   |
|:-:    |---                |---          |
| GET   | get all users     | admins only |
| POST  | add a new user    | public      |

### `/api/users/:id`

| Verb   | Description      |Privilege 	                     |
|:-:     |---               |---                             |
| GET    | get a user by id | authenticated user and admins  |
| PATCH  | update a user    | authenticated user and admins  |
| DELETE | delete a user    | admins only                    |

### `/api/polls`

| Verb   | Description      |Privilege 	                     |
|:-:     |---               |---                             |
| GET    | get all polls    | public                         |
| POST   | add a poll       | authenticated users and admins |

### `/api/polls/:id`

| Verb   | Description      |Privilege 	                     |
|:-:     |---               |---                             |
| GET    | get a poll by id | public                         |
| PATCH  | update a poll    | authenticated user and admins  |
| DELETE | delete a poll    | authenticated user and admins  |

### `/api/votes`

| Verb   | Description      |Privilege 	                     |
|:-:     |---               |---                             |
| GET    | get all votes    | admins only                    |

### `/api/votes/users/:userId`

| Verb   | Description             |Privilege 	                   |
|:-:     |---                      |---                            |
| GET    | get all votes of a user | authenticated user and admins |
| DELETE | retract all votes       | authenticated user and admins |

### `/api/votes/users/:userId/polls/:pollId`

| Verb   | Description                         | Privilege 	                  |
|:-:     |---                                  |---                           |
| GET    | return the voted option in the poll | authenticated user and admins|
| DELETE | retract a vote from a poll          | authenticated user and admins|

### `/api/votes/users/:userId/polls/:pollId/options/:optionId`

| Verb   | Description      |Privilege 	                     |
|:-:     |---               |---                             |
| POST   | vote in a poll   | authenticated users and admins |

