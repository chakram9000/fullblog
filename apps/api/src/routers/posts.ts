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
import likes from "./likes.ts";
import { some } from "hono/combine";

const app = new Hono<{ Variables: JwtVariables<JWTPayload> }>()
	.route("/:postId/comments", comments)
	.route("/:postId/likes", likes)

	.get("/", async (c) => {
		const posts = await prisma.post.findMany({
			where: { is_published: true },
			orderBy: { created_at: "desc" },
			include: {
				_count: {
					select: {
						likes: true,
					},
				},
			},
		});

		return c.json({ data: posts });
	})

	.get("/own", validateJWT, async (c) => {
		const jwtPayload = c.get("jwtPayload");
		if (jwtPayload.role !== "AUTHOR") {
			return c.json({ message: "Unauthorized" }, 403);
		}

		const posts = await prisma.post.findMany({
			where: { authorId: jwtPayload.id },
			orderBy: { edited_at: "desc" },
			include: {
				_count: {
					select: {
						likes: true,
					},
				},
			},
		});

		return c.json({ data: posts });
	})

	.get(
		"/:postId",
		some(validateJWT, () => true),
		zValidator(
			"param",
			z.object({
				postId: z.coerce.number().int(),
			}),
			zValidatorErrorsHook,
		),
		async (c) => {
			const jwt = c.get("jwtPayload") as JWTPayload | undefined; // see some() middleware
			const param = c.req.valid("param");

			// We don't include likes here because the client will have it's own state for it anyway, and would use /:postId/likes.
			const post = await prisma.post.findUnique({
				where: { id: param.postId },
				include: { author: true },
			});

			if (!post) {
				return c.json({ message: "Resource not found" }, 404);
			}

			if (!post.is_published) {
				// @NOTE: seperate these checks for different status codes, as 401 will invalidate the jwt on the client side.
				if (!jwt) {
					return c.json({ message: "Unauthorized" }, 401);
				}
				if (post.authorId !== jwt.id) {
					return c.json({ message: "Unauthorized" }, 403);
				}
			}

			return c.json({ data: post });
		},
	)

	.post(
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
	)

	.put(
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
					edited_at: new Date(Date.now()),
				},
			});

			return c.json({ data: newPost });
		},
	)

	.delete(
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
