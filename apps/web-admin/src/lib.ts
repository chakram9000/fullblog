import type { ClientResponse } from "hono/client";

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
