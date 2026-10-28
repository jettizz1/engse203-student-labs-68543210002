# Database choices

## 1. Why SQLite instead of MongoDB?

The information we save has a clear shape: each request has a requester, type, location, priority, and status. A requester can have multiple requests, so a relational key and foreign-key constraint express that relationship directly. SQLite gives us transactions and SQL queries without requiring a separate database server for this small local application. MongoDB could store this data, but its flexible documents do not provide a useful advantage for these stable relationships.

## 2. What changes if we move to MongoDB?

The database implementation and the service layer would definitely change because SQL statements, joins, and SQLite-specific IDs would be replaced by document queries. The controller would also need changes because a network-backed MongoDB driver is asynchronous, while the current controller expects synchronous service results. We would make service calls and controller handlers awaitable and preserve the same API response shape. The frontend could remain unchanged if the API contract stays stable.

## 3. When is async needed?

An in-process SQLite operation is synchronous in this project, so a service can return its result immediately and the controller can respond without awaiting it. A remote database has network latency, so waiting for it synchronously would block the server from handling other requests. Async lets Node.js continue working while the network operation is pending. Async is not inherently needed just because code uses a database; it is useful when an operation can take time without blocking, especially remote I/O.
