import "dotenv/config";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import type { JWTPayload, JWTPayloadValidators } from "../lib/types.ts";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../lib/prisma.ts";
import bcrypt from "bcryptjs";
import { zValidatorErrorsHook } from "../lib/util.ts";

const jwtPayloadValidators: JWTPayloadValidators = {
	exp: Math.floor(Date.now() / 1000) + 60 * 60, // Token expires in 1 hour
	iat: Math.floor(Date.now() / 1000),
	nbf: Math.floor(Date.now() / 1000),
	iss: process.env.JWT_ISSUER!,
};

const app = new Hono();

app.post(
	"/signup",
	zValidator(
		"form",
		z.object({
			email: z.email(),
			display_name: z.string().min(3).max(32).trim(),
			password: z.string().min(8),
		}),
		zValidatorErrorsHook,
	),
	async (c) => {
		const body = c.req.valid("form");
		/* if (body.password !== body.confirm_password) {
			return c.json({ message: "Passwords don't match" }, 401);
		}*/

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
		});

		const payload: JWTPayload = {
			id: newUser.id,
			email: newUser.email,
			display_name: newUser.display_name,
			...jwtPayloadValidators,
		};

		const token = await sign(payload, process.env.JWT_SECRET!, "HS256");

		return c.json({ token });
	},
);

app.post(
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
			...jwtPayloadValidators,
		};
		const token = await sign(payload, process.env.JWT_SECRET!, "HS256");

		return c.json({ token });
	},
);

export default app;
