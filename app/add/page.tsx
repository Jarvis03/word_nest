import { AddWordForm } from "@/components/add-word-form";
import { PageHeader } from "@/components/page-header";

export default function AddPage() {
  return (
    <>
      <PageHeader
        eyebrow="Make it yours"
        title="Add to My Words"
        description="Give the word a little context. We’ll turn it into one focused, memorable card."
      />
      <AddWordForm />
    </>
  );
}
