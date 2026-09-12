import { RotateCcw } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

export default function ReviewPage() {
  return (
    <>
      <PageHeader eyebrow="0 due" title="Review" description="Recall first. Reveal second. Rate honestly." />
      <EmptyState
        icon={RotateCcw}
        title="Nothing due yet"
        body="New words enter review the day after you save them."
        action="Add a word"
      />
    </>
  );
}
