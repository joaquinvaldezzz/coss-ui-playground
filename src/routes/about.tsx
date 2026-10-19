import { createFileRoute } from "@tanstack/react-router";

import { seo } from "@/lib/seo";

function About() {
  return (
    <div className="p-8">
      <h1>Hello</h1>
    </div>
  );
}

export const Route = createFileRoute("/about")({
  component: About,
  head: seo({
    title: "About",
    description: "This is the about page of the application.",
  }),
});
