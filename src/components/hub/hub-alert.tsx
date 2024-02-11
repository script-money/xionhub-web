import React, { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { CheckIcon, Cross2Icon, GlobeIcon } from "@radix-ui/react-icons";

interface AlertProps {
  error?: string;
  isConfirming?: boolean; // Added prop to track confirmation status
}

export const HubAlert = ({ error, isConfirming = false }: AlertProps) => {
  const [showAlert, setShowAlert] = useState<boolean>(false);

  useEffect(() => {
    if (error || isConfirming) {
      setShowAlert(true); // Show alert when there is an error or is confirming
    } else {
      const timer = setTimeout(() => {
        setShowAlert(false); // Hide alert after 3 seconds if there is no error and not confirming
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, isConfirming]);

  const isError = error != null && error !== "";

  if (!showAlert) return null;

  let alertTitle;
  let IconComponent;
  if (isConfirming) {
    alertTitle = "Confirming...";
    IconComponent = GlobeIcon; // Use the loading icon for confirming state
  } else if (error) {
    alertTitle = "Broadcast failed";
    IconComponent = Cross2Icon; // Use the cross icon for error state
  } else {
    alertTitle = "Broadcast success";
    IconComponent = CheckIcon; // Use the check icon for success state
  }

  // Apply color based on the state
  const titleColor = isError ? "text-red-500" : "text-green-500";

  return (
    <Alert
      variant={isError ? "destructive" : "default"}
      className="fixed right-0 top-0 z-50 m-8 w-[200px]"
    >
      <AlertTitle className={isConfirming ? "" : titleColor}>
        <IconComponent className="mr-2 inline-block" /> {alertTitle}
      </AlertTitle>
      {isError && <AlertDescription>{error}</AlertDescription>}
    </Alert>
  );
};
