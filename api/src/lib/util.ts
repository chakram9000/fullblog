import type { Context } from "hono";

export function zValidatorErrorsHook(result: any, c: Context) {
	if (!result.success) {
		console.log(result);
		const errorFields = result.error.issues.map((value: any) => value.path[0]);
		return c.json(
			{
				message: `Invalid fields: ${errorFields.join(", ")}.`,
			},
			401,
		);
	}
}
