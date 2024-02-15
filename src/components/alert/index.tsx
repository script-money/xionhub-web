import React from "react";
import { atom } from "jotai";
import { toast, ToastOptions } from "react-toastify";

import { Cross1Icon } from "@radix-ui/react-icons";
import { Alert } from "../ui/alert";

export interface AlertProps {
  isSuccess: boolean;
  message: string;
  isConfirming: boolean;
}

export interface Alert {
  message: string;
  learnMoreUrl?: string;
}

export const enum ToastType {
  SUCCESS,
  ERROR,
  LOADING,
}

export const showAlertAtom = atom<AlertProps | null>(null);

const SuccessToast = ({ message, learnMoreUrl }: Alert) => (
  <div className="flex items-center gap-3 md:gap-2">
    <div className="text-green-500">
      <h6 className="text-lg md:text-base">{message}</h6>
      {learnMoreUrl && <p className="text-sm md:text-xs">{learnMoreUrl}</p>}
    </div>
  </div>
);

const ErrorToast = ({ message, learnMoreUrl }: Alert) => (
  <div className="flex items-center gap-3 md:gap-2">
    <div className="text-red-500">
      <h6 className="text-lg md:text-base">{message}</h6>
      {learnMoreUrl && <p className="text-sm md:text-xs">{learnMoreUrl}</p>}
    </div>
  </div>
);

const LoadingToast = ({ message, learnMoreUrl }: Alert) => (
  <div className="flex items-center gap-3 md:gap-2">
    <div>
      <h6 className="text-lg md:text-base">{message}</h6>
      {learnMoreUrl && <p className="text-sm md:text-xs">{learnMoreUrl}</p>}
    </div>
  </div>
);

export const displayAlert = (alert: Alert, type: ToastType) => {
  const toastOptions: ToastOptions = {
    position: "top-right",
    autoClose: 7000,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: false,
    progress: undefined,
    pauseOnFocusLoss: false,
  };
  switch (type) {
    case ToastType.SUCCESS:
      toast(<SuccessToast {...alert} />, toastOptions);
      break;
    case ToastType.ERROR:
      toast(<ErrorToast {...alert} />, toastOptions);
      break;
    case ToastType.LOADING:
      toast(<LoadingToast {...alert} />, toastOptions);
      break;
  }
};
