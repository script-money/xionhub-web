import React, { useEffect } from "react";
import { atom, useAtom } from "jotai";
import { CheckIcon, Cross2Icon, GlobeIcon } from "@radix-ui/react-icons";

import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

interface AlertProps {
  isSuccess: boolean;
  errorMessage?: string;
  isConfirming?: boolean;
}

export const showAlertAtom = atom<AlertProps>({
  isSuccess: false,
  errorMessage: "",
  isConfirming: false,
});

export const HubAlert = () => {
  const [showAlert, setShowAlert] = useAtom(showAlertAtom);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showAlert.errorMessage || showAlert.isSuccess) {
      timer = setTimeout(() => {
        setShowAlert((prev) => ({
          ...prev,
          errorMessage: "",
          isSuccess: false,
        }));
      }, 5000);
    }
    return () => timer && clearTimeout(timer);
  }, [showAlert, setShowAlert]);

  const isError = showAlert.errorMessage !== "";
  const isConfirming = showAlert.isConfirming;

  let alertTitle;
  let IconComponent;
  if (isConfirming) {
    alertTitle = "Confirming...";
    IconComponent = GlobeIcon;
  } else if (isError) {
    alertTitle = "Broadcast failed";
    IconComponent = Cross2Icon;
  } else if (showAlert.isSuccess) {
    alertTitle = "Broadcast success";
    IconComponent = CheckIcon;
  } else {
    return null;
  }

  const titleColor = isConfirming
    ? "text-black"
    : isError
      ? "text-red-500"
      : "text-green-500";

  return (
    <>
      {(isConfirming || isError || showAlert.isSuccess) && (
        <Alert
          variant={
            isConfirming ? "default" : isError ? "destructive" : "default"
          }
          className="fixed right-0 top-0 z-50 m-8 w-[200px]"
        >
          <AlertTitle className={titleColor}>
            <IconComponent className="mr-2 inline-block" /> {alertTitle}
          </AlertTitle>
          {isError && !isConfirming && (
            <AlertDescription>{showAlert.errorMessage}</AlertDescription>
          )}
        </Alert>
      )}
    </>
  );
};
