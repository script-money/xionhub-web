import React, { useEffect } from "react";
import { atom, useAtom } from "jotai";
import { CheckIcon, Cross2Icon, GlobeIcon } from "@radix-ui/react-icons";

import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export interface AlertProps {
  isSuccess: boolean;
  message: string;
  isConfirming: boolean;
}

export const showAlertAtom = atom<AlertProps | null>(null);

export const HubAlert = () => {
  const [showAlert, setShowAlert] = useAtom(showAlertAtom);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showAlert, setShowAlert]);

  if (!showAlert) return null;

  const { isSuccess, message, isConfirming } = showAlert;
  const isError = !!message;

  let alertTitle: string;
  let Icon: JSX.Element | null = null;
  if (isConfirming) {
    alertTitle = "Confirming...";
    Icon = <GlobeIcon className="mr-2 inline-block" />;
  } else if (isError) {
    alertTitle = "failed";
    Icon = <Cross2Icon className="mr-2 inline-block" />;
  } else if (isSuccess) {
    alertTitle = "success";
    Icon = <CheckIcon className="mr-2 inline-block" />;
  } else {
    return null;
  }

  const titleColor = isConfirming
    ? "text-black"
    : isError
      ? "text-red-500"
      : "text-green-500";

  const variant = isConfirming || isSuccess ? "default" : "destructive";

  return (
    <Alert variant={variant} className="fixed right-0 top-0 z-50 m-8 w-[200px]">
      <AlertTitle className={titleColor}>
        {Icon} {alertTitle}
      </AlertTitle>
      {isError && <AlertDescription>{message}</AlertDescription>}
    </Alert>
  );
};
