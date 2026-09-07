import "dotenv/config";
import { Hono } from "hono";
import { sign } from "hono/jwt";

const app = new Hono();

app.get("/login", async (c) => {
	const payload = {
		name: "jwt sux",
		exp: Math.floor(Date.now() / 1000) + 60 * 5, // Token expires in 5 minutes
		iat: Math.floor(Date.now() / 1000),
		nbf: Math.floor(Date.now() / 1000),
		iss: process.env.JWT_ISSUER!,
	};
	const token = await sign(payload, process.env.JWT_SECRET!, "HS256");

	return c.json({ "auth?": "yep!", token });
});

export default app;
