import { createFileRoute } from "@tanstack/react-router";

import { seo } from "@/lib/seo";

function Home() {
  return (
    <div className="p-8">
      <h1>Hello</h1>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: Home,
  head: seo({
    title: "Home",
    description: "This is the home page of the application.",
    path: "/",
  }),
});
