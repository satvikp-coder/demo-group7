# Middleware

JWT verification requires HS256, a UUID subject, expiration, and a supported role. Decoded claims and an id alias are attached to req.user. requireRoles enforces explicit server-side authorization; the admin router requires tour_operator. Zod registration/login schemas validate input and normalize emails. Password strength and bcrypt byte-length limits are checked before storage. Centralized errors return sanitized JSON.
