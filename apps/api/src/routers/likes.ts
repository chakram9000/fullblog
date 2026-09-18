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
			const likes = await prisma.like.count({
				where: { postId },
			});

			return c.json({ data: likes });
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
		async (c) => {
			const jwtPayload = c.get("jwtPayload");
			const param = c.req.valid("param");

			const doesLikeAlreadyExist = !!(await prisma.like.findUnique({
				where: {
					userId_postId: {
						postId: param.postId,
						userId: jwtPayload.id,
					},
				},
			}));

			if (doesLikeAlreadyExist) {
				await prisma.like.delete({
					where: {
						userId_postId: {
							postId: param.postId,
							userId: jwtPayload.id,
						},
					},
				});
			} else {
				await prisma.like.create({
					data: {
						postId: param.postId,
						userId: jwtPayload.id,
					},
				});
			}

			// returns the current like state
			return c.json({ data: !doesLikeAlreadyExist });
		},
	);

export default app;
