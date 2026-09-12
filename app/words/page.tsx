import { BookOpen } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

export default function WordsPage() {
  return (
    <>
      <PageHeader title="My Words" description="Every word you choose to keep, in one quiet place." />
      <EmptyState
        icon={BookOpen}
        title="Your word list is waiting"
        body="Generate a card first. Persistence and search are the next build slice."
        action="Add a word"
      />
    </>
  );
}
