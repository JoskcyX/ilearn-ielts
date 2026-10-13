"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "./Modal";
import { CreateQuestionGroupForm } from "@/components/admin/questions/CreateQuestionGroupForm";

export function NewGroupButton({
  passages,
  audioAssets,
}: {
  passages: { id: string; title: string }[];
  audioAssets: { id: string; title: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="brand" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" aria-hidden /> New question group
      </Button>
      <Modal open={open} onOpenChange={setOpen} title="New question group" description="Set the basics now. You add content and questions in the builder next.">
        <CreateQuestionGroupForm passages={passages} audioAssets={audioAssets} onCancel={() => setOpen(false)} />
      </Modal>
    </>
  );
}
