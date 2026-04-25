function normalizeBaseUrl(url: string): string {
	// Remove trailing slash for safe concatenation.
	return url.endsWith("/") ? url.slice(0, -1) : url;
}

export const API_BASE_URL = normalizeBaseUrl(
	import.meta.env.VITE_API_BASE_URL || "/api",
);

export function apiUrl(path: string): string {
	if (!path.startsWith("/")) return `${API_BASE_URL}/${path}`;
	return `${API_BASE_URL}${path}`;
}
