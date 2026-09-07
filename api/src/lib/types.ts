export type JWTPayloadValidators = {
	exp: number;
	iat: number;
	nbf: number;
	iss: string;
};

export type JWTPayload = {
	id: number;
	email: string;
	display_name: string;
} & JWTPayloadValidators;
