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

- For the prod build, the project includes an Adminer container to inspect the
  database. This is only accessible from the host machine and can be found at:
  http://localhost:54245. The login data can be found the containers/.env:
  - System: PostgreSQL
  - Server: db
  - Username: $POSTGRES_USER
  - Password: $POSTGRES_PASSWORD
  - Database: $POSTGRES_DB

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

- [react.dev](https://react.dev/)
- [docs.nestjs.com](https://docs.nestjs.com/)
- [NestJS - Prisma recipe](https://docs.nestjs.com/recipes/prisma)
- [MDN - HTTP Status reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)

And as for how we've used AI in this project, it has been useful in helping us
find ideas for the visual identity of the app, as well as unblocking tricky
situations with frameworks and tools we were not familiar with.

## Team Information

**Assigned roles**

| Name | Role(s) |
|---|---|
| Lycoris | Product Owner + Developer |
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

## Modules

Because this is a school project, we get a mark at the end. After a small set
of requirements, there is a list of modules we can choose from. There are two
types of module: major and minor. A major module is worth 2 points, and a minor
module is worth 1. We need 14 points to reach a mark of 100% and validate the
project, with 19 points to reach 125%, which is the maximum possible mark. We
can also do more modules than needed so as to compensate for a failing one and
still get the mark we want.

The modules we've picked were chosen to fit into the concept we had decided on,
which is a simple friendly website where people can play games together. It
could have been anything else, such as a blog, a messaging board, or a
collaborative platform to name a few. All that was asked, concept-wise, was
that the website must support multiple users simultaneously.

Here is the list of our chosen modules, for 20 points total:

| Module | Type | Team member(s) |
|---|---|---|
| Frontend framework | Minor | Lycoris, Hong-CHP |
| Backend framework | Minor | Lycoris, Joshw34, Cngogang, Romtry |
| ORM | Minor | Joshw34, Cngogang |
| SSR | Minor | Lycoris |
| Standard user management and authentication | Major | Lycoris, Joshw34, Cngogang, Hong-CHP, Romtry |
| User interaction | Major | Lycoris, Joshw34, Cngogang |
| Advanced permissions system | Major | Lycoris, Joshw34 |
| GDPR compliance features | Minor | Lycoris, Joshw34, Cngogang, Romtry |
| Implement real-time features | Major | Joshw34, Cngogang |
| Support for additional browsers | Minor | Lycoris |
| First game | Major | Lycoris, Hong-CHP |
| Remote players | Major | Lycoris, Joshw34 |
| More than two players | Major | Lycoris, Joshw34, Hong-CHP |

### Module descriptions and justifications

**[Minor] Frontend framework**

- *Description:* Use a frontend framework (React, Vue, Angular, Svelte, etc).
- *Justification:* Instead of writing the frontend in vanilla JavaScript or
  TypeScript, we use a framework. The reasoning is explained in the "Technical
  Stack" section.

**[Minor] Backend framework**

- *Description:* Use a backend framework (Express, Fastify, NestJS, Django, etc).
- *Justification:* Instead of writing the backend in a vanilla language, we use a
  framework. The reasoning is explained in the "Technical Stack" section.

**[Minor] ORM**

- *Description:* Use an ORM for the database.
- *Justification:* Instead of using SQL string queries directly, we went for an
  ORM. The reasoning is explained in the "Technical Stack" section.

**[Minor] SSR**

- *Description:* Server-Side Rendering (SSR) for improved performance and SEO.
- *Justification:* SSR with hydration renders the initial page on the server,
  then hands over rendering to the client for subsequent navigation. This
  improves perceived performance, enables proper SEO and social media previews,
  and avoids the overhead of fully server-rendered navigation. As a result, SSR
  has become a standard practice for modern web applications, and an obvious pick
  for us.

**[Major] Standard user management and authentication**

- *Description:* Users can update their profile information, upload an avatar
  (with a default avatar if none is provided), have a profile page displaying
  their information, add other users as friends and see their online status.
- *Justification:* Since users are required, we might as well create a user
  profile and allow people to form friendships.

**[Major] User interaction**

- *Description:* Allow users to interact with other users. The minimum
  requirements are a profile system (view user information), a friends system
  (add/remove friends, see friends list), and a basic chat system (send/receive
  messages between users).
- *Justification:* Since the previous module is already about profiles and
  friends, the new feature is really the chat system. And about this, it makes
  sense to allow people not only to chat in a public room, but also to have DMs
  with friends so as to justify the existence of the friendship feature.

**[Major] Advanced permissions system**

- *Description:* Have roles management (admin, moderator, user, guest, etc),
  different views and actions based on user role, and these actions being
  viewing, editing and deleting users.
- *Justification:* If we have users and a chat system, we need moderation. Also,
  if the user was to request edition or deletion of their data, it's friendlier
  to have a proper interface for this, both for them and for us.

**[Minor] GDPR compliance features**

- *Description:* Allow users to request their data and export it in a readable
  format, and also to delete their data. Send confirmation emails for data
  operations.
- *Justification:* Sending emails is a basic website feature. For example, it's
  already relevant when someone forgot their password, so the mailing requirement
  of this module is no reason to avoid it. And as for data export, it's only
  polite to allow a user to request their own data. And then, it's a GDPR
  requirement, and we are located in Europe.

**[Major] Implement real-time features**

- *Description:* Using WebSockets or similar technology, have real-time updates
  across clients, efficient message broadcasting and handle
  connection/disconnection gracefully.
- *Justification:* The chat system is already a real-time feature, we will not
  demand that users refresh the page to see if anything new got posted. It's also
  needed to allow users to see others' online status, as per the "Standard user
  management and authentication" module.

**[Minor] Support for additional browsers**

- *Description:* On top of Google Chrome, have full compatibility with at least 2
  additional browsers (Firefox, Safari, Edge, etc). Test and fix all features in
  each browser, document any browser-specific limitations, and have consistent
  UI/UX across all supported browsers.
- *Justification:* For accessibility reasons, the app shouldn't only be working
  within one browser. It makes sense to check that it's consistent within more
  browsers.

**[Major] First game**

- *Description:* Implement a complete web-based game where users can play against
  each other in live matches (e.g., Pong, Chess, Tic-Tac-Toe, Card games, etc).
  The game can be in 2D or 3D, turn-based or real-time, and it must have clear
  rules and win/loss conditions.
- *Justification:* A game is a good way to engage people and get them to
  interact. A chat is well and all, but we wanted to go a bit further.

**[Major] Remote players**

- *Description:* Enable two players on separate computers to play the same game
  in real-time. Handle network latency and disconnections gracefully, provide a
  smooth user experience for remote gameplay, and implement reconnection logic.
- *Justification:* The "First game" module could be about a local mode, where
  different people share the same machine. It makes sense to allow users of the
  app to play together as well.

**[Major] More than two players**

- *Description:* Support for three or more players simultaneously, with fair
  gameplay mechanics for all participants, and proper synchronization across all
  clients.
- *Justification:* If the game concept can support more than two players, then
  it's more fun this way. The more, the merrier.

## Features List

### 1. Infrastructure & Tooling

| Feature | Member(s) |
|---|---|
| Install TypeScript-flavored React (frontend) and NestJS (backend) as the project's core frameworks. | Lycoris |
| Set up the PostgreSQL database with the Prisma ORM - define the schema, run migrations, and configure the DB connection. | Cngogang |
| Containerize the dev environment (Docker Compose for local development, hot-reload, and environment variable management). | Joshw34 |
| Containerize the production environment (Docker Compose with Nginx reverse proxy, enforcing HTTPS and serving the built frontend). | Joshw34 |
| Configure the email-sending service on the backend (SMTP provider, mailer module, reusable email templates). | Romtry |
| Introduce WebSockets to the project via a dedicated gateway, with connection and disconnection lifecycle management. | Cngogang |

### 2. Rendering & Frontend Foundation

| Feature | Member(s) |
|---|---|
| Implement SSR with client-side hydration so the initial HTML is rendered on the server and subsequent navigation is handled by React. | Lycoris |
| Establish the visual identity of the app, ensuring the UI is readable, accessible, and responsive across screen sizes. | Lycoris |
| Define and enforce frontend input sanitization and validation rules. | Hong-CHP |
| Align backend input validation and sanitization to match the rules enforced on the frontend. | Lycoris |
| Wire all frontend pages to their corresponding backend API endpoints. | Lycoris |
| Test and validate full compatibility on at least two browsers beyond Chrome (namely Firefox and Brave). | Lycoris |

### 3. Authentication

| Feature | Member(s) |
|---|---|
| Design and migrate the User database model. | Joshw34 |
| Implement password hashing with bcrypt for secure storage of user credentials. | Romtry |
| Implement JWT-based authentication with secure cookie storage, including token issuance, refresh, and expiry handling. | Joshw34 |
| Backend: sign-up endpoint (validate input, check for duplicate email/username, hash password, create user, send verification email). | Joshw34 |
| Backend: email verification flow (generate token, send verification link by email, validate token on click, mark account as verified). | Joshw34 |
| Backend: log-in endpoint (validate credentials, issue JWT, set cookie). | Joshw34 |
| Backend: log-out endpoint (invalidate session/cookie). | Joshw34 |
| Backend: password reset flow for forgotten passwords (request reset by email, generate time-limited token, send reset link, validate token, update password). | Romtry |
| Frontend: sign-up page (form with validation, feedback on errors and success). | Hong-CHP |
| Frontend: log-in page (form with validation, redirect on success). | Hong-CHP |
| Frontend: forgotten password page (email submission form) and password reset page (new password form, opened from the email link). | Hong-CHP |

### 4. User Profiles

| Feature | Member(s) |
|---|---|
| Serve a default avatar for registered users who have not uploaded one, and a distinct default avatar for unauthenticated guests. | Lycoris |
| Backend: user update endpoints (change username, email, password, avatar and description). | Joshw34 |
| Frontend: user private and public profile pages. | Hong-CHP |
| Frontend: display friends list, requests and blocked users. | Lycoris |

### 5. Roles & Permissions

| Feature | Member(s) |
|---|---|
| Define the roles hierarchy: guest, user, moderator, admin. Seed the admin account on startup from an environment variable. | Joshw34 |
| Backend: role-based access control guards - protect endpoints based on role, and expose different views of user data depending on the caller's role. | Joshw34 |
| Backend: admin and moderator actions - view all users, edit user details, change user roles, and delete users. | Joshw34 |
| Backend: user list endpoint - return a paginated list of users, filtered and shaped according to the caller's role permissions. | Joshw34 |
| Frontend: admin/moderator - see a given user, view their details, perform moderation actions (edit, role change, ban) with appropriate confirmation steps. | Lycoris |

### 6. Social Features

| Feature | Member(s) |
|---|---|
| Backend: friendship system (send friend request, accept/decline, remove friend, list friends and pending requests). | Joshw34 |
| Backend: block system (block a user from messaging you, unblock, and reflect blocked status in friend and chat features). | Joshw34 |
| Real-time online status - broadcast and receive user presence events (online/offline) via WebSocket, visible on friend lists, chat and profiles. | Cngogang |
| Frontend: friends panel (friends list with online status indicators, pending requests with accept/decline actions, ability to navigate to a friend's profile or start a DM). | Lycoris |

### 7. Chat System

| Feature | Member(s) |
|---|---|
| Backend: chat system over WebSocket - real-time message broadcasting to the lobby chat or relevant DM thread, with efficient pub/sub handling for multiple simultaneous conversations. | Cngogang |
| Backend: chat history persistence - store messages in the database so users can retrieve conversation history on load. | Joshw34 |
| Backend: lobby chat accessible to all authenticated users, alongside private DM threads between two users (only available when neither has blocked the other). | Cngogang |
| Frontend: message input, real-time message rendering, and graceful handling of WebSocket disconnection and reconnection. | Cngogang |
| Frontend: chat interface - lobby chat, DM threads list, message input. | Lycoris |
| Frontend: access to user profiles from within the chat interface. | Lycoris |

### 8. Game

| Feature | Member(s) |
|---|---|
| Frontend: implement the complete game (UI, rendering, controls, game loop) for local play. | Hong-CHP |
| Support for between 2 and 4 simultaneous players. | Hong-CHP |
| Backend: game session management - create, join, and track game sessions with their state (waiting, in-progress, finished). | Joshw34 |
| Remote multiplayer over WebSocket - synchronize game state in real time between two and four players on separate machines, handling network latency. | Joshw34 |
| Handling of player disconnection and reconnection during a game. | Joshw34 |
| Frontend: implement online mode interface. | Lycoris |

### 9. GDPR & Data Management

| Feature | Member(s) |
|---|---|
| Backend: data export endpoint for user profile and social data (profile fields, friends list, sent and received friend requests, blocked users list) - returned as a structured JSON file. | Cngogang |
| Backend: data export endpoint for chat history (all DM threads and public chat messages sent by the user) - returned as a structured JSON file. | Joshw34 |
| Backend: account deletion endpoint - hard-delete all user data and send a confirmation email upon completion. | Joshw34 |
| Frontend: data management page - let users trigger each export independently (profile data, chat data) and initiate account deletion. Bundle all export files into a single ZIP archive for download. | Lycoris |

### 10. Legal & Miscellaneous

| Feature | Member(s) |
|---|---|
| Privacy Policy page - outlining what data is collected, how it is used, and users' rights (required for GDPR compliance). | Lycoris |
| Terms of Service page - covering acceptable use, moderation rules, and account termination conditions. | Lycoris |

## Individual Contributions

The detailed breakdown of what each team member contributed can be seen in the
"Modules" and "Features List" sections.

As for any particular challenge we've faced, the project wasn't particularly
difficult, it was mostly long. And AI helped with any minute details we were
struggling with in our learning of new technology. That, and asking other team
member for help.

And as for any limitations in supporting other browsers, Firefox had a few
quirks:

- The favicon could be displayed properly, and yet there was an error in the
  browser console because Firefox was requesting for `favicon.ico` specifically.
  So the favicon was renamed from `joker.svg` to `favicon.svg`, and the `.ico`
  alternative was added.
- The website has a glowing and animated border which was glitchy on Firefox.
  The border was then written differently, for a similar result, so that Firefox
  could handle it no problem.
