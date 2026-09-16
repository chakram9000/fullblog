import { hc, type ClientResponse } from "hono/client";
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

export async function fetchProtected<
	TRes extends ClientResponse<any, any, any>,
>(cb: () => Promise<TRes>) {
	const res = await cb();

	if (res.status === 401) {
		localStorage.removeItem("jwt");
		window.location.href = "/login";
		return null;
	}

	return res;
}
