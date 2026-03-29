import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';

const localConvexUrl = import.meta.env.VITE_CONVEX_URL;
const localConvexSiteUrl = import.meta.env.VITE_CONVEX_SITE_URL;

export const CONVEX_URL = dev && localConvexUrl ? localConvexUrl : env.PUBLIC_CONVEX_URL;
export const CONVEX_SITE_URL =
	dev && localConvexSiteUrl ? localConvexSiteUrl : env.PUBLIC_CONVEX_SITE_URL;
