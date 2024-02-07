"use client";
import {
  Abstraxion,
  useAbstraxionAccount,
  useAbstraxionSigningClient,
  useModal,
} from "@burnt-labs/abstraxion";
import "@burnt-labs/ui/dist/index.css";
import { atom, useAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import useQueryHubList from "~/hooks/useQueryHubList";
import { XIONHUB_ADDRESS } from "~/constant";
import { extractErrorName } from "~/utils";
import { useCreateHub } from "~/hooks/useCreateHub";

const DraftPage = () => {
  const { data: account } = useAbstraxionAccount();
  const { client } = useAbstraxionSigningClient();

  const [, setShowModal]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
  ] = useModal();

  const queryHubList = useQueryHubList(client);
  const {
    nameInputRef,
    handleCreateHub,
    error: createHubError,
  } = useCreateHub(client, account);

  // capture create hub error in Effect
  useEffect(() => {
    if (createHubError) {
      console.error("createhub error:", createHubError);
    }
  }, [createHubError]);

  // TODO: show query automaticly and render the result
  const handleQueryHubs = async () => {
    if (!client) {
      console.log("client is not ready");
      return;
    }
    try {
      const data = await queryHubList(1, 10);
      console.log("HubInfoList:", data);
    } catch (error) {
      console.error("Error querying hub list:", error);
    }
  };

  return (
    <main className="flex flex-col items-start gap-y-2">
      <Abstraxion
        onClose={() => {
          setShowModal(false);
        }}
      />

      <h1 className="text-3xl text-red-500">
        This page for contract interaction test
      </h1>
      {account.bech32Address ? (
        <button className="border text-xl" onClick={() => setShowModal(true)}>
          Got To Dashboard
        </button>
      ) : (
        <button onClick={() => setShowModal(true)} className="border text-xl">
          Click To Login
        </button>
      )}
      <div>
        address: <span>{account.bech32Address}</span>
      </div>
      <h1 className="text-3xl">Query Channels</h1>
      {account.bech32Address ? (
        <button className="border text-xl" onClick={handleQueryHubs}>
          Query Hubs
        </button>
      ) : (
        <button className="border text-xl text-gray-500" disabled>
          Login to query
        </button>
      )}

      <h1 className="text-3xl">Create Hub</h1>
      <div>
        <label>Hub Name: </label>
        <input
          className="ms-1"
          type="text"
          placeholder="Hub Name"
          ref={nameInputRef}
        />
      </div>
      <button onClick={handleCreateHub} className="border text-xl">
        Create Hub
      </button>
    </main>
  );
};

export default DraftPage;
