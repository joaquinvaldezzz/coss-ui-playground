import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import type { SyntheticEvent } from "react";
import type { BaseUIEvent } from "@base-ui/react";
import { seo } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toastManager } from "@/components/ui/toast";

const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }).trim(),
  lastName: z.string().min(1, { message: "Last name is required." }).trim(),
  acceptTerms: z.boolean().refine((value) => value, {
    message: "You must accept the terms and conditions.",
  }),
});

type FormSchema = z.infer<typeof formSchema>;

function ControlledForm() {
  const form = useForm<FormSchema>({
    defaultValues: {
      firstName: "",
      lastName: "",
      acceptTerms: false,
    },
    resolver: zodResolver(formSchema),
  });

  function handleSubmit(event: BaseUIEvent<SyntheticEvent<HTMLFormElement>>) {
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
          <Form className="flex w-full flex-col gap-4" onSubmit={(event) => handleSubmit(event)}>
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

            <Controller
              name="acceptTerms"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field invalid={fieldState.invalid}>
                  <FieldLabel>
                    <Checkbox onCheckedChange={field.onChange} />
                    <span>Accept terms and conditions</span>
                  </FieldLabel>
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

export const Route = createFileRoute("/controlled-form/")({
  component: ControlledForm,
  head: seo({
    title: "Controlled Form",
    description: "An example of a controlled form built with react-hook-form.",
  }),
});
