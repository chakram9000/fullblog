import "dotenv/config";
import { Hono } from "hono";
import { type JwtVariables } from "hono/jwt";
import type { JWTPayload } from "../lib/types.ts";
import { prisma } from "../lib/prisma.ts";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { zValidatorErrorsHook } from "../lib/util.ts";
import { validateJWT } from "../lib/middlewares.ts";

import comments from "./comments.ts";

const app = new Hono<{ Variables: JwtVariables<JWTPayload> }>();

app.route("/:postId/comments", comments);

app.get("/", async (c) => {
	const posts = await prisma.post.findMany({
		where: {
			is_published: true,
		},
	});

	return c.json({ data: posts });
});

app.get("/all", validateJWT, async (c) => {
	const jwtPayload = c.get("jwtPayload");
	if (jwtPayload.role !== "AUTHOR") {
		return c.json({ message: "Unauthorized" }, 403);
	}

	const posts = await prisma.post.findMany();
	return c.json({ data: posts });
});

app.get(
	"/:postId",
	zValidator(
		"param",
		z.object({
			postId: z.coerce.number().int(),
		}),
		zValidatorErrorsHook,
	),
	async (c) => {
		const param = c.req.valid("param");
		const post = await prisma.post.findUnique({
			where: {
				id: param.postId,
			},
			include: {
				author: true,
				comments: true,
			},
		});

		if (!post) {
			return c.json({ message: "Resource not found" }, 404);
		}

		return c.json({ data: post });
	},
);

app.post(
	"/",
	validateJWT,
	zValidator(
		"form",
		z.object({
			title: z.string().trim().min(3).max(128),
			content: z.string().trim().min(3).max(2048),
			is_published: z.stringbool().optional(),
		}),
		zValidatorErrorsHook,
	),
	async (c) => {
		const jwtPayload = c.get("jwtPayload");
		if (jwtPayload.role !== "AUTHOR") {
			return c.json({ message: "Unauthorized" }, 403);
		}

		const body = c.req.valid("form");
		const newPost = await prisma.post.create({
			data: {
				title: body.title,
				content: body.content,
				authorId: jwtPayload.id,
				is_published: body.is_published,
			},
		});

		return c.json({ data: newPost });
	},
);

app.put(
	"/:postId",
	validateJWT,
	zValidator(
		"param",
		z.object({
			postId: z.coerce.number().int(),
		}),
		zValidatorErrorsHook,
	),
	zValidator(
		"form",
		z.object({
			title: z.string().trim().min(3).max(128).optional(),
			content: z.string().trim().min(3).max(2048).optional(),
			is_published: z.stringbool().optional(),
		}),
		zValidatorErrorsHook,
	),
	async (c) => {
		const jwtPayload = c.get("jwtPayload");
		if (jwtPayload.role !== "AUTHOR") {
			return c.json({ message: "Unauthorized" }, 403);
		}

		const param = c.req.valid("param");
		const existingPost = await prisma.post.findUnique({
			where: {
				id: param.postId,
			},
		});

		if (!existingPost) {
			return c.json({ message: "Resource not found" }, 404);
		}

		if (existingPost.authorId !== jwtPayload.id) {
			return c.json({ message: "You don't own this" }, 403);
		}

		const body = c.req.valid("form");
		const newPost = await prisma.post.update({
			where: {
				id: param.postId,
			},
			data: {
				title: body.title,
				content: body.content,
				is_published: body.is_published,
			},
		});

		return c.json({ data: newPost });
	},
);

app.delete(
	"/:postId",
	validateJWT,
	zValidator(
		"param",
		z.object({
			postId: z.coerce.number().int(),
		}),
		zValidatorErrorsHook,
	),
	async (c) => {
		const jwtPayload = c.get("jwtPayload");
		if (jwtPayload.role !== "AUTHOR") {
			return c.json({ message: "Unauthorized" }, 403);
		}

		const param = c.req.valid("param");
		const existingPost = await prisma.post.findUnique({
			where: {
				id: param.postId,
			},
		});

		if (!existingPost) {
			return c.json({ message: "Resource not found" }, 404);
		}

		if (existingPost.authorId !== jwtPayload.id) {
			return c.json({ message: "You don't own this" }, 403);
		}

		const post = await prisma.post.delete({
			where: {
				id: param.postId,
			},
		});

		return c.json({ data: post });
	},
);

export default app;
