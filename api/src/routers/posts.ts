import "dotenv/config";
import { Hono } from "hono";
import { jwt, type JwtVariables } from "hono/jwt";

const app = new Hono<{ Variables: JwtVariables }>();

app.get(
	"/",
	jwt({
		secret: process.env.JWT_SECRET!,
		alg: "HS256",
		verification: {
			iss: process.env.JWT_ISSUER!,
		},
	}),
	async (c) => {
		const payload = c.get("jwtPayload");
		return c.json({ authorized: "true!", payload });
	},
);

export default app;
