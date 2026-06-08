# Card Nest

This project has been created as part of a school curriculum by 
[Lycoris Bellua](https://github.com/LycorisBellua), 
[Joshw34](https://github.com/joshw34), 
[Cngogang](https://github.com/cngogang), 
[Hong-CHP](https://github.com/Hong-CHP) and 
[Romtry](https://github.com/Romtry).  

## Description

*Card Nest* is a web app where multiple users can chat and play together. The 
game is *Black Crown*, a version of Blackjack between 2 to 4 players, without 
gambling mechanics and where only one person can win.  

## Instructions

To run the project, we have put Docker containers at your disposal. It has only 
been tested on Linux, so we do not guarantee it would work on another system.  

- Create a `containers/variable_imports.txt` file and complete the values:
```
GMAIL_EMAIL="example@gmail.com"
GMAIL_PASSWORD="nodemailer gmail token"
ADMIN_USER="admin username"
```
For mailing to work, create a Gmail account, and follow the 
[instructions here](https://github.com/LycorisBellua/web_card-nest/pull/31) to 
get the token. As for the admin user, it's optional and you can leave the value 
empty.  
- Run `make` or `make prod_up` from the root of the project to build a 
production version of the project. It will be available from your browser at 
`https://localhost:8080`. That's it!
- If you run into any trouble, it might be because the app is not finished 
building. Run `make logs` to see how it's going. Once you see lots of green 
text, you're good to go. If you feel like trying again, run `make clean` first.
- To run a development build instead, run `make backend_up` or 
`make frontend_up` depending on whether you want to modify the backend or the 
frontend. The backend version would be available at `http://localhost:3000` and 
the frontend version at `http://localhost:5173`.
- A development build also allows you to manually access the DB at 
`http://localhost:5555`.
- No matter the version, instead of `locahost` you can use your IP as the 
domain name. It allows other machines on the same network to access the website 
at `https://127.0.0.1:8080` for example. To find your IP, run 
`ip route get 1 | awk '/src/ {print $7; exit}'`.

If you want to run the project yourself, without our containers, look at the 
`backend/.env.example` file which describes the environment variables you need. 
Then, find more information about how to install and run the project here:
- [Install the TypeScript version of React and NestJS](https://github.com/LycorisBellua/web_card-nest/issues/3)
- [SSR for first paint then SPA](https://github.com/LycorisBellua/web_card-nest/issues/6)

## Resources

Here are some classic references which can help you develop a similar project:
- https://react.dev/
- https://docs.nestjs.com/
- https://docs.nestjs.com/recipes/prisma
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status

And as for how we've used AI in this project, it has been useful in helping us 
find ideas for the visual identity of the app, as well as unblocking tricky 
situations with frameworks and tools we were not familiar with.  

## Team Information

**Assigned roles**

| Name | Role(s) |
|---|---|
| Lycoris Bellua | Product Owner + Developer |
| Joshw34 | Project Manager + Developer |
| Cngogang | Technical Lead + Developer |
| Hong-CHP | Developer |
| Romtry | Developer |

**Responsibilities**
- Product Owner: defines the product vision, decides on features and 
priorities, and validates completed work.
- Project Manager: organizes team meetings, ensures team communication, and 
manages risks and blockers.
- Technical Lead: makes technology stack decisions, and ensures code quality 
and best practices. 
- Developer: implements features, and participates in code reviews.

## Project Management

To organize our work, we communicated through a Discord server created and 
handled by Joshw34, as well as through Discord DMs and face-to-face.  

As for how we distributed the tasks, it was simply up to personal interests. As 
long as progress was being made and everyone could contribute, it didn't matter 
much who worked on what.  

And, finally, to track this progress we've used GitHub Project. It allowed us 
to discover GitHub Issues and PRs, and facilitated the tracking of ongoing 
tasks. The project was also configured so as to have someone else in the team 
review our work.  

## Technical Stack

This web app was written in TypeScript, and made with NestJS (backend), React 
(frontend), PostgreSQL (database), and Prisma (ORM).  

As for why TypeScript, it's because we're used to strongly typed languages and 
deem it safer and more robust. Then, NestJS and React were picked because we 
deem them complete enough, suggesting good practices, without doing all the 
work for us. And PostgreSQL instead of a no-SQL database for example, was so 
that we get the strength of a relational database. As for an ORM such as 
Prisma, it's a layer between us and the DB, so that not only do we have the 
comfort of using TypeScript to interact with the DB, we also avoid the SQL 
injection attack.  

For a more detailed list of the stack, see below:  

| Category | Tool / Technology |
|---|---|
| Git Platform | GitHub |
| Deployment | Docker |
| Formatter | Prettier |
| Linter | ESLint |
| Language | TypeScript |
| Frontend - Framework | React (with Vite) |
| Frontend - Routing | React Router v6+ |
| Frontend - CSS Solution | Styled Components |
| Backend - Framework | NestJS |
| Backend - Frontend Rendering | SSR with hydration |
| Backend - Input Validation | class-validator, class-transformer |
| Backend - Password Hashing | Bcrypt |
| Backend - Authentication | JSON Web Tokens & Cookies |
| Backend - Mailing | Nodemailer |
| Backend - Data Export | JSZip |
| Database - DB | PostgreSQL |
| Database - ORM | Prisma |
| Database - GUI | Prisma Studio |
| Real-Time | WebSockets |

## Database Schema

The DB schema file can be found at `backend/prisma/schema.prisma`. As for the 
overview...  

**Enums**  

- `Ranks`: `PENDING`, `USER`, `MODERATOR`, `ADMIN`
- `FriendStatus`: `PENDING`, `ACCEPTED`

**Models**  

| Model | Primary Key | Purpose |
|---|---|---|
| `User` | UUID v7 | Core entity - holds auth, profile, and rank data |
| `Friend` | UUID v7 | Friend request between two users, with status |
| `Block` | `(blockerId, blockedId)` | One user blocking another |
| `DMChat` | UUID v7 | Private chat thread, tied 1-to-1 to a friendship |
| `DMMessage` | UUID v7 | A single message within a `DMChat` |
| `LobbyMessage` | UUID v7 | Public lobby chat message, sender nullable on delete |
| `LobbyBan` | `userId` | Marks a user as banned from the lobby |

**Key Fields**  

- `User`: `username` (unique), `email` / `email_unverified`, `password`, 
`avatar` (bytes), `rank`, token/timeout pairs for verify, refresh, and reset 
flows.
- `Friend`: `requesterId`, `addresseeId`, `status` - pair is unique.
- `DMChat`: `userAId`, `userBId`, `friendshipId` (unique) - one chat per 
friendship.
- `DMMessage` / `LobbyMessage`: `message` (max 500 chars), `senderId`, `date`.

**Relationships**  

```
User -> Friend (requester / addressee)
User -> Block (blocker / blocked)
User -> DMChat (userA / userB)
User -> DMMessage, LobbyMessage (sender)
User <-> LobbyBan (1-to-1)
Friend <->  DMChat (1-to-1)
DMChat -> DMMessage
```

All foreign keys cascade on user deletion, except `LobbyMessage.senderId` which 
is set to `null`.  

## Features List

TODO  
*- Complete list of implemented features.*  
*- Which team member(s) worked on each feature.*  
*- Brief description of each feature's functionality.*  

## Modules

TODO  
*- List of all chosen modules (Major and Minor).*  
*- Point calculation (Major = 2pts, Minor = 1pt).*  
*- Justification for each module choice, especially for custom "Modules of 
choice".*  
*- How each module was implemented.*  
*- Which team member(s) worked on each module.*  

## Individual Contributions

TODO  
*- Detailed breakdown of what each team member contributed.*  
*- Specific features, modules, or components implemented by each person.*  
*- Any challenges faced and how they were overcome.*  

TODO - TMP
- Firefox requests favicon.ico. Even though the favicon could be displayed 
anyway, there was an error in the browser, so I renamed the favicon from 
"joker.svg" to "favicon.svg" and I've added an .ico alternative.
- Firefox limitation: The border animation was displayed weirdly. Explain the 
first so that it's consistent on both Firefox and Chrome.
