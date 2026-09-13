import { AddHub } from "@/components/add-hub";
import { PageHeader } from "@/components/page-header";

export default async function AddPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const mode = (await searchParams).mode === "article" ? "article" : "word";
  return (
    <>
      <PageHeader
        eyebrow="Make it yours"
        title="Add to your English"
        description="Save one word or turn a whole article into a personal study pack."
      />
      <AddHub initialMode={mode} />
    </>
  );
}
