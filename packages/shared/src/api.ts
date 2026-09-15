import { hc } from "hono/client";
import type { AppType } from "api/src/index";

export const createHonoClient = (api_url: string) =>
	hc<AppType>(api_url, {
		headers: () => {
			const jwt = localStorage.getItem("jwt");
			return jwt
				? { Authorization: `Bearer ${jwt}` }
				: ({} as Record<string, string>);
		},
	});
export type HonoClient = ReturnType<typeof createHonoClient>;
