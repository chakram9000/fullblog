import "dotenv/config";
import type { Context } from "hono";
import type { JWTPayloadValidators } from "./types.ts";
import { jwt } from "hono/jwt";
import type { SignatureAlgorithm } from "hono/utils/jwt/jwa";

export function zValidatorErrorsHook(result: any, c: Context) {
	if (!result.success) {
		const errorFields = result.error.issues.map((value: any) => value.path[0]);
		return c.json(
			{
				message: `Invalid fields: ${errorFields.join(", ")}.`,
			},
			401,
		);
	}
}

export const validateJwtMiddleware = jwt({
	secret: process.env.JWT_SECRET!,
	alg: process.env.JWT_ALG as SignatureAlgorithm,
	verification: {
		iss: process.env.JWT_ISSUER!,
	},
});

export function generateJwtPayloadValidators(): JWTPayloadValidators {
	return {
		exp: Math.floor(Date.now() / 1000) + 60 * 60, // Token expires in 1 hour
		iat: Math.floor(Date.now() / 1000),
		nbf: Math.floor(Date.now() / 1000),
		iss: process.env.JWT_ISSUER!,
	};
}
