# Authentication boundary

Better Auth owns password handling, sessions, cookie security, customer/admin identities, and account linking. The Next.js `/api/auth/*` route is the authentication HTTP boundary. NestJS validates the same database-backed Better Auth session through reusable authentication and admin guards before serving account APIs.

Guest carts and checkout records must use nullable customer ownership plus a separate opaque guest identifier. They must never depend on a registered session. After purchase, a guest order can be claimed through a verified, single-use flow.

No custom token format is used. Public registration always creates a customer; administrator assignment is database/bootstrap controlled and is never accepted from a public payload. Application profile and address records remain separate from provider-owned identity records.
