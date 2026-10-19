import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toastManager } from "@/components/ui/toast";

const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }).trim(),
  lastName: z.string().min(1, { message: "Last name is required." }).trim(),
});

type FormSchema = z.infer<typeof formSchema>;

function Home() {
  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
    },
    resolver: zodResolver(formSchema),
  });

  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    form.handleSubmit((data: FormSchema) => {
      toastManager.add({
        id: "success-toast",
        title: `Hello, ${data.firstName} ${data.lastName}!`,
        description: "This is a toast notification.",
        type: "success",
      });
    })(event);
  }

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>Please provide your first and last name.</CardDescription>
        </CardHeader>

        <CardPanel>
          <Form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
            <Controller
              name="firstName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field invalid={fieldState.invalid}>
                  <FieldLabel>First name</FieldLabel>
                  <Input type="text" {...field} />
                  <FieldError match={Boolean(fieldState.error)}>
                    {fieldState.error?.message}
                  </FieldError>
                </Field>
              )}
            />

            <Controller
              name="lastName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field invalid={fieldState.invalid}>
                  <FieldLabel>Last name</FieldLabel>
                  <Input type="text" {...field} />
                  <FieldError match={Boolean(fieldState.error)}>
                    {fieldState.error?.message}
                  </FieldError>
                </Field>
              )}
            />

            <Button type="submit">Submit</Button>
          </Form>
        </CardPanel>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      {
        title: "Home",
      },
      {
        name: "description",
        content: "This is the home page of the application.",
      },
      {
        property: "og:title",
        content: "Home",
      },
      {
        property: "og:description",
        content: "This is the home page of the application.",
      },
      {
        property: "og:url",
        content: "/",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Home",
      },
      {
        name: "twitter:description",
        content: "This is the home page of the application.",
      },
      {
        name: "twitter:url",
        content: "/",
      },
    ],
  }),
});
