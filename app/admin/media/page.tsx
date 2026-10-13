import { serverFetch } from "@/lib/server-api";
import type { MediaResponse } from "@/lib/types/admin-content";
import { MediaLibrary } from "@/components/admin/builder/MediaLibrary";
import { PageHeader } from "@/components/dashboard/blocks";

export default async function AdminMediaPage() {
  const { images } = await serverFetch<MediaResponse>("/api/admin/media");
  return (
    <div>
      <PageHeader
        title="Media library"
        subtitle="Images for diagrams, maps and flow charts. Add them to a question group from the builder."
      />
      <MediaLibrary initialImages={images} />
    </div>
  );
}
