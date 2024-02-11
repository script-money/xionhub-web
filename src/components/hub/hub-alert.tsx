import React, { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

interface AlertProps {
  error?: string;
}

export const HubAlert = ({ error }: AlertProps) => {
  const [showAlert, setShowAlert] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAlert(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    if (error) {
      setShowAlert(true);
    }
  }, [error]);

  const isError = error != null && error !== "";

  if (!showAlert) return null; // Render nothing if showAlert is false

  return (
    <Alert
      variant={isError ? "destructive" : "default"}
      className="fixed right-0 top-0 z-50 m-8 w-[200px]"
    >
      <AlertTitle>{isError ? "Tx failed" : "Tx success"}</AlertTitle>
      {isError && <AlertDescription>{error}</AlertDescription>}
    </Alert>
  );
};
