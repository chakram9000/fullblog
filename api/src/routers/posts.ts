import "dotenv/config";
import { Hono } from "hono";
import { type JwtVariables } from "hono/jwt";
import type { JWTPayload } from "../lib/types.ts";
import { prisma } from "../lib/prisma.ts";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { zValidatorErrorsHook } from "../lib/util.ts";

const app = new Hono<{ Variables: JwtVariables<JWTPayload> }>();

app.get("/", async (c) => {
	const posts = await prisma.post.findMany();
	return c.json({ data: posts });
});

app.get(
	"/:id",
	zValidator(
		"param",
		z.object({
			id: z.int(),
		}),
		zValidatorErrorsHook,
	),
	async (c) => {
		const param = c.req.valid("param");
		const post = await prisma.post.findUnique({
			where: {
				id: param.id,
			},
		});

		if (!post) {
			return c.json({ message: "Resource not found" }, 404);
		}

		return c.json({ data: post });
	},
);

export default app;
