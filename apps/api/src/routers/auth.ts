import "dotenv/config";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import type { JWTPayload } from "../lib/types.ts";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../lib/prisma.ts";
import bcrypt from "bcryptjs";
import {
	generateJwtPayloadValidators,
	zValidatorErrorsHook,
} from "../lib/util.ts";
import type { SignatureAlgorithm } from "hono/utils/jwt/jwa";

// @TODO: route for getting a fresh token when already authorized, for use in header and stuff (currently no way to get the jwt user's info)
const app = new Hono()
	.post(
		"/signup",
		zValidator(
			"form",
			z.object({
				email: z.email(),
				display_name: z.string().trim().min(2).max(32),
				password: z.string().min(8),
			}),
			zValidatorErrorsHook,
		),
		async (c) => {
			const body = c.req.valid("form");

			const isUserExists = !!(await prisma.user.findUnique({
				where: { email: body.email },
			}));
			if (isUserExists) {
				return c.json({ message: "Email already used." }, 401);
			}

			const hashedPassword = await bcrypt.hash(body.password, 10);
			const newUser = await prisma.user.create({
				data: {
					email: body.email,
					display_name: body.display_name,
					password: hashedPassword,
				},
				omit: {
					password: false,
					role: false,
				},
			});

			const payload: JWTPayload = {
				id: newUser.id,
				email: newUser.email,
				display_name: newUser.display_name,
				role: newUser.role,
				...generateJwtPayloadValidators(),
			};

			const token = await sign(
				payload,
				process.env.JWT_SECRET!,
				process.env.JWT_ALG as SignatureAlgorithm,
			);

			return c.json({ token });
		},
	)

	.post(
		"/login",
		zValidator(
			"form",
			z.object({
				email: z.email(),
				password: z.string().min(8),
			}),
			zValidatorErrorsHook,
		),
		async (c) => {
			const body = c.req.valid("form");
			const user = await prisma.user.findUnique({
				where: { email: body.email },
				omit: {
					password: false,
					role: false,
				},
			});

			if (!user) {
				return c.json({ message: "Email incorrect or doesn't exist." }, 401);
			}

			if (!(await bcrypt.compare(body.password, user.password))) {
				return c.json({ message: "Password incorrect." }, 401);
			}

			const payload: JWTPayload = {
				id: user.id,
				email: user.email,
				display_name: user.display_name,
				role: user.role,
				...generateJwtPayloadValidators(),
			};
			const token = await sign(
				payload,
				process.env.JWT_SECRET!,
				process.env.JWT_ALG as SignatureAlgorithm,
			);

			return c.json({ token, role: user.role });
		},
	);

export default app;
