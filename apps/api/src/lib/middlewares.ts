import { jwt } from "hono/jwt";
import type { SignatureAlgorithm } from "hono/utils/jwt/jwa";

export const validateJWT = jwt({
	secret: process.env.JWT_SECRET!,
	alg: process.env.JWT_ALG as SignatureAlgorithm,
	verification: {
		iss: process.env.JWT_ISSUER!,
	},
});
