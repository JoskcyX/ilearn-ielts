import { serverFetch } from "@/lib/server-api";
import type { AudioResponse } from "@/lib/types/admin-content";
import { UploadAudioForm } from "@/components/admin/questions/UploadAudioForm";
import { ContentStatusControl } from "@/components/admin/questions/ContentStatusControl";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export default async function AdminAudioPage() {
  const { audio: orgAudio } = await serverFetch<AudioResponse>("/api/admin/audio");

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-foreground">
        Audio
      </h1>

      <Card className="space-y-2 p-5">
        <h2 className="text-sm font-semibold text-foreground">
          Upload Listening audio
        </h2>
        <UploadAudioForm />
      </Card>

      {orgAudio.length === 0 ? (
        <EmptyState title="No audio uploaded yet" description="Upload one above." />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Transcript</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgAudio.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.title}</TableCell>
                  <TableCell>
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <audio controls src={`/uploads/${a.storageKey}`} className="h-9" />
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted">
                    {a.transcript || "—"}
                  </TableCell>
                  <TableCell>
                    <ContentStatusControl
                      id={a.id}
                      status={a.status}
                      endpoint="/api/admin/audio"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
