import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";

import auth from "./routers/auth.ts";
import posts from "./routers/posts.ts";

const app = new Hono();

/* @TODO: Enable and setup cors and csrf
app.use(
	cors({ origin: process.env.ORIGIN }),
	csrf({ origin: process.env.ORIGIN }),
); */

app.route("/auth", auth);
app.route("/api/posts", posts);

serve(
	{
		fetch: app.fetch,
		port: 3000,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
