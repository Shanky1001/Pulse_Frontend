import type { Dashboard } from "@/types/dashboard";
import { sleep } from "@/lib/sleep";
import { baseApi } from "./baseApi";

const STORAGE_KEY = "formbuilder.dashboards.v1";

const USE_MOCKS =
	import.meta.env.VITE_USE_MOCKS === "true" ||
	(typeof window !== "undefined" &&
		window.localStorage?.getItem("pulse.localTestSession.v1") === "1");

function readAll(): Dashboard[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? (parsed as Dashboard[]) : [];
	} catch {
		return [];
	}
}

function writeAll(dashboards: Dashboard[]): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
	} catch {
		// ignore quota errors in mock layer
	}
}

export const dashboardsApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		listDashboards: builder.query<Dashboard[], void>(
			USE_MOCKS
				? {
						queryFn: async () => {
							await sleep(80);
							return { data: readAll() };
						},
						providesTags: ["Dashboards"],
					}
				: {
						query: () => ({ url: "/dashboards", method: "GET" }),
						providesTags: ["Dashboards"],
					},
		),
		getDashboard: builder.query<Dashboard | null, string>(
			USE_MOCKS
				? {
						queryFn: async (id) => {
							await sleep(60);
							const found =
								readAll().find((d) => d.id === id) ?? null;
							return { data: found };
						},
						providesTags: (_r, _e, id) => [
							{ type: "Dashboard", id },
						],
					}
				: {
						query: (id) => ({
							url: `/dashboards/${encodeURIComponent(id)}`,
							method: "GET",
						}),
						providesTags: (_r, _e, id) => [
							{ type: "Dashboard", id },
						],
					},
		),
		saveDashboard: builder.mutation<Dashboard, Dashboard>(
			USE_MOCKS
				? {
						queryFn: async (dashboard) => {
							await sleep(120);
							const all = readAll();
							const next: Dashboard = {
								...dashboard,
								updatedAt: new Date().toISOString(),
							};
							const idx = all.findIndex(
								(d) => d.id === dashboard.id,
							);
							if (idx >= 0) all[idx] = next;
							else all.push(next);
							writeAll(all);
							return { data: next };
						},
						invalidatesTags: (_r, _e, arg) => [
							"Dashboards",
							{ type: "Dashboard", id: arg.id },
						],
					}
				: {
						query: (dashboard) => ({
							url: `/dashboards/${encodeURIComponent(dashboard.id)}`,
							method: "PUT",
							body: dashboard,
						}),
						invalidatesTags: (_r, _e, arg) => [
							"Dashboards",
							{ type: "Dashboard", id: arg.id },
						],
					},
		),
		deleteDashboard: builder.mutation<{ id: string }, string>(
			USE_MOCKS
				? {
						queryFn: async (id) => {
							await sleep(60);
							writeAll(readAll().filter((d) => d.id !== id));
							return { data: { id } };
						},
						invalidatesTags: (_r, _e, id) => [
							"Dashboards",
							{ type: "Dashboard", id },
						],
					}
				: {
						query: (id) => ({
							url: `/dashboards/${encodeURIComponent(id)}`,
							method: "DELETE",
						}),
						invalidatesTags: (_r, _e, id) => [
							"Dashboards",
							{ type: "Dashboard", id },
						],
					},
		),
	}),
	overrideExisting: false,
});

export const {
	useListDashboardsQuery,
	useGetDashboardQuery,
	useLazyGetDashboardQuery,
	useSaveDashboardMutation,
	useDeleteDashboardMutation,
} = dashboardsApi;
