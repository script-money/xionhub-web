import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSetAtom } from "jotai";

import { useCreateHub } from "~/hooks/useCreateHub";
import { showAlertAtom } from "./hub-alert";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Card } from "../ui/card";
import { Input } from "~/components/ui/input";

const formSchema = z.object({
  hubName: z.string().min(2).max(50),
});

const HubCreateForm: React.FC<{ client: any; account: any }> = ({
  client,
  account,
}) => {
  const { handleCreateHub, error, loading } = useCreateHub(client, account);
  const setShowAlert = useSetAtom(showAlertAtom);

  useEffect(() => {
    if (loading || error) {
      setShowAlert({ errorMessage: error, isConfirming: loading });
    }
  }, [loading, error]);

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      hubName: "",
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    handleCreateHub(values.hubName).catch((err) =>
      console.error("handleCreateHub error: ", err),
    );
  };

  const isSubmitDisabled = !form.formState.isValid || loading;

  return (
    <form
      className="container flex items-center justify-center "
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Card className="w-full p-2 md:w-[618px]">
        <h1 className="text-3xl">Create Hub</h1>
        <Form {...form}>
          <FormField
            control={form.control}
            name="hubName"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Hub Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  This is public display hub name.
                </FormDescription>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />
          <Button type="submit" variant="outline" disabled={isSubmitDisabled}>
            Create Hub
          </Button>
        </Form>
      </Card>
    </form>
  );
};

export default HubCreateForm;
