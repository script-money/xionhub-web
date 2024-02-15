import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom, useSetAtom } from "jotai";

import { useCreateHub } from "~/hooks/useCreateHub";
import { ToastType, displayAlert, showAlertAtom } from "../alert";
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
import { Cross1Icon } from "@radix-ui/react-icons";
import { showCreateHubAtom } from "~/atom";

const formSchema = z.object({
  hubName: z.string().min(2).max(50),
  fee: z.number().min(0),
});

const CreateHubForm: React.FC<{ client: any; account: any }> = ({
  client,
  account,
}) => {
  const { handleCreateHub, error, loading } = useCreateHub(client, account);
  const setShowAlert = useSetAtom(showAlertAtom);
  const [showCreateHub, setShowCreateHub] = useAtom(showCreateHubAtom);

  useEffect(() => {
    if (!loading && error !== "" && error !== null) {
      displayAlert({ message: error, learnMoreUrl: "" }, ToastType.ERROR);
    } else if (!loading && error == "") {
      displayAlert({ message: "Create Hub success" }, ToastType.SUCCESS);
      setShowCreateHub(false);
    }
  }, [loading, error, setShowCreateHub]);

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      hubName: "",
      fee: 0,
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    handleCreateHub(values.hubName).catch((err) =>
      console.error("handleCreateHub error: ", err),
    );
  };

  const isSubmitDisabled = !form.formState.isValid;

  return (
    <form
      className="container flex items-center justify-center"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Card className="relative w-full p-4 md:w-[618px]">
        <Button
          variant="outline"
          size="icon"
          className="absolute right-2 top-2"
          onClick={() => setShowCreateHub(false)}
        >
          <Cross1Icon className="h-4 w-4" />
        </Button>
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
                <FormDescription>Hub name 2-50 letters</FormDescription>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fee"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Subscribe Fee (uxion)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="0 uxion"
                    disabled
                  />
                </FormControl>
                <FormDescription>
                  Cannot set hub subscription fee in testnet
                </FormDescription>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />
          <Button
            className="mt-2"
            type="submit"
            variant="outline"
            disabled={isSubmitDisabled}
          >
            Create Hub
          </Button>
        </Form>
      </Card>
    </form>
  );
};

export default CreateHubForm;
