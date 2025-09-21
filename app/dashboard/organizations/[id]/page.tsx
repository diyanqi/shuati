import { OrganizationDetailClient } from "./client";

// Generate static params for build-time generation
export async function generateStaticParams() {
  // For static export, we return an empty array
  // In a real app, you would fetch organization IDs from your API
  return [];
}

export default function OrganizationDetailPage() {
  return <OrganizationDetailClient />;
}
