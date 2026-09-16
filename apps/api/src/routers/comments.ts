import "dotenv/config";
import { Hono } from "hono";
import { type JwtVariables } from "hono/jwt";
import type { JWTPayload } from "../lib/types.ts";
import { prisma } from "../lib/prisma.ts";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { zValidatorErrorsHook } from "../lib/util.ts";
import { validateJWT } from "../lib/middlewares.ts";

const app = new Hono<{ Variables: JwtVariables<JWTPayload> }>()
	.get(
		"/",
		zValidator(
			"param",
			z.object({
				postId: z.coerce.number().int(),
			}),
			zValidatorErrorsHook,
		),
		async (c) => {
			const { postId } = c.req.valid("param");
			const comments = await prisma.comment.findMany({
				where: { postId },
				orderBy: { created_at: "desc" },
				include: { author: true },
			});

			return c.json({ data: comments });
		},
	)

	.post(
		"/",
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
				content: z.string().trim().min(1).max(256),
			}),
			zValidatorErrorsHook,
		),
		async (c) => {
			const jwtPayload = c.get("jwtPayload");
			const body = c.req.valid("form");
			const param = c.req.valid("param");

			// @NOTE:	probably only need to check the post existing here, not in PUT or DELETE.
			const doesPostExist = !!(await prisma.post.findUnique({
				where: {
					id: param.postId,
				},
			}));

			if (!doesPostExist) {
				return c.json({ message: "Resource not found" }, 404);
			}

			const newComment = await prisma.comment.create({
				data: {
					content: body.content,
					authorId: jwtPayload.id,
					postId: param.postId,
				},
			});

			return c.json({ data: newComment });
		},
	)

	.put(
		"/:commentId",
		validateJWT,
		zValidator(
			"param",
			z.object({
				postId: z.coerce.number().int(),
				commentId: z.coerce.number().int(),
			}),
			zValidatorErrorsHook,
		),
		zValidator(
			"form",
			z.object({
				content: z.string().trim().min(1).max(256),
			}),
			zValidatorErrorsHook,
		),
		async (c) => {
			const jwtPayload = c.get("jwtPayload");
			const param = c.req.valid("param");

			const existingComment = await prisma.comment.findUnique({
				where: {
					id: param.commentId,
					postId: param.postId,
				},
			});

			if (!existingComment) {
				return c.json({ message: "Resource not found" }, 404);
			}

			if (existingComment.authorId !== jwtPayload.id) {
				return c.json({ message: "You don't own this" }, 403);
			}

			const body = c.req.valid("form");
			const newComment = await prisma.comment.update({
				where: {
					id: param.commentId,
				},
				data: {
					content: body.content,
				},
			});

			return c.json({ data: newComment });
		},
	)

	.delete(
		"/:commentId",
		validateJWT,
		zValidator(
			"param",
			z.object({
				postId: z.coerce.number().int(),
				commentId: z.coerce.number().int(),
			}),
			zValidatorErrorsHook,
		),
		async (c) => {
			const jwtPayload = c.get("jwtPayload");
			const param = c.req.valid("param");

			const existingComment = await prisma.comment.findUnique({
				where: {
					id: param.commentId,
					postId: param.postId,
				},
			});

			if (!existingComment) {
				return c.json({ message: "Resource not found" }, 404);
			}

			if (existingComment.authorId !== jwtPayload.id) {
				return c.json({ message: "You don't own this" }, 403);
			}

			const comment = await prisma.comment.delete({
				where: {
					id: param.commentId,
				},
			});

			return c.json({ data: comment });
		},
	);

export default app;
