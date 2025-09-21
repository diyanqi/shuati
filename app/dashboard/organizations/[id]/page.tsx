import { OrganizationDetailClient } from "./client";

export default function OrganizationDetailPage() {
  return <OrganizationDetailClient />;
}

// For `output: "export"`, dynamic routes must provide static params.
// Currently returns an empty list so build can succeed; fill with real IDs to pre-render details pages.
export function generateStaticParams(): { id: string }[] {
  return [];
}

// Only the above generated params are valid; others 404 in static export
export const dynamicParams = false;
