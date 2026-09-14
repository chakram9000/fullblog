import { useQuery, type QueryKey } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { ClientResponse } from "hono/client";
import { useEffect } from "react";

export class UnauthenticatedError extends Error {}

type ProtectedQueryOptions<TRes extends ClientResponse<any, any, any>> = {
	queryKey: QueryKey;
	queryFn: () => Promise<TRes>;
};
// this hook aims to prevent repeated jwt removal code when fetching protected routes, and is NOT necessary for public ones.
export function useProtectedQuery<TRes extends ClientResponse<any, any, any>>({
	queryKey,
	queryFn: cb,
}: ProtectedQueryOptions<TRes>) {
	type TData = TRes extends ClientResponse<infer D, any, any> ? D : never;
	const navigate = useNavigate();

	const query = useQuery<TData>({
		queryKey,
		queryFn: async () => {
			const res = await cb();

			if (res.status === 401) {
				throw new UnauthenticatedError("Unauthorized");
			}

			return await res.json();
		},
		retry: 1,
	});

	useEffect(() => {
		if (query.error instanceof UnauthenticatedError) {
			localStorage.removeItem("jwt");
			navigate({ to: "/login" });
		}
	}, [query.error, navigate]);

	return query;
}
