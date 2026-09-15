import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";

import auth from "./routers/auth.ts";
import posts from "./routers/posts.ts";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";

// @TODO: change key of "message" to "error" in all error messages.
const app = (
	process.env.DEBUG
		? new Hono().use(cors({ origin: "*" }))
		: new Hono().use(
				cors({
					origin: [process.env.ORIGIN_ADMIN!, process.env.ORIGIN_PUBLIC!],
				}),
				csrf({
					origin: [process.env.ORIGIN_ADMIN!, process.env.ORIGIN_PUBLIC!],
				}),
			)
)
	.route("/auth", auth)
	.route("/api/posts", posts);

export type AppType = typeof app;

const server = serve(
	{
		fetch: app.fetch,
		port: 3000,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
		console.log(`Debug: ${process.env.DEBUG}`);
	},
);

// graceful shutdown
process.on("SIGINT", () => {
	server.close();
	process.exit(0);
});
process.on("SIGTERM", () => {
	server.close((err) => {
		if (err) {
			console.error(err);
			process.exit(1);
		}
		process.exit(0);
	});
});
