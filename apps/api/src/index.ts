import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";

import auth from "./routers/auth.ts";
import posts from "./routers/posts.ts";

const app = new Hono();

// @TODO: Enable and setup cors and csrf
// app.use(
// 	cors({ origin: process.env.ORIGIN }),
// 	csrf({ origin: process.env.ORIGIN }),
// );

app.route("/auth", auth);
app.route("/api/posts", posts);

const server = serve(
	{
		fetch: app.fetch,
		port: 3000,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
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
