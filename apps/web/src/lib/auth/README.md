# Authentication boundary

Better Auth will own sessions, cookie security, customer/admin identities, and account linking. The Next.js application is the authentication HTTP boundary; the NestJS API will verify the same Better Auth session through a focused auth guard once auth is implemented.

Guest carts and checkout records must use nullable customer ownership plus a separate opaque guest identifier. They must never depend on a registered session. After purchase, a guest order can be claimed through a verified, single-use flow.

No custom token format is introduced in this foundation. The concrete Better Auth database adapter and admin authorization policy are intentionally deferred until the user/account schema is implemented.
