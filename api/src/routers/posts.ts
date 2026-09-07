import "dotenv/config";
import { Hono } from "hono";
import { jwt, type JwtVariables } from "hono/jwt";
import type { JWTPayload } from "../lib/types.ts";

const validateJwt = jwt({
	secret: process.env.JWT_SECRET!,
	alg: "HS256",
	verification: {
		iss: process.env.JWT_ISSUER!,
	},
});

const app = new Hono<{ Variables: JwtVariables<JWTPayload> }>();

app.get("/", validateJwt, async (c) => {
	const payload = c.get("jwtPayload");
	return c.json({ posts: [] });
});

export default app;
