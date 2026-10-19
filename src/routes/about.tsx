import { createFileRoute } from "@tanstack/react-router";

function About() {
  return (
    <div className="p-8">
      <h1>Hello</h1>
    </div>
  );
}

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      {
        title: "About",
      },
      {
        name: "description",
        content: "This is the about page of the application.",
      },
      {
        property: "og:title",
        content: "About",
      },
      {
        property: "og:description",
        content: "This is the about page of the application.",
      },
      {
        property: "og:url",
        content: "/",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "About",
      },
      {
        name: "twitter:description",
        content: "This is the about page of the application.",
      },
      {
        name: "twitter:url",
        content: "/",
      },
    ],
  }),
});
