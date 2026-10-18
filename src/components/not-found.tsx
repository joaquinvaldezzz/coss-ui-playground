import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function NotFound() {
  return (
    <Empty>
      <EmptyMedia />
      <EmptyContent>
        <EmptyHeader>
          <EmptyTitle>404</EmptyTitle>
          <EmptyDescription>Page not found</EmptyDescription>
        </EmptyHeader>
      </EmptyContent>
    </Empty>
  );
}
