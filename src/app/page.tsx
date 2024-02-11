"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Abstraxion,
  useAbstraxionAccount,
  useAbstraxionSigningClient,
  useModal,
} from "@burnt-labs/abstraxion";
import { hubContractAddress } from "./layout";
import type { ExecuteResult } from "@cosmjs/cosmwasm-stargate";
import { EncodeObject } from "@cosmjs/proto-signing";
import { MsgGrant } from "cosmjs-types/cosmos/authz/v1beta1/tx";
import {
  ContractExecutionAuthorization,
  MaxCallsLimit,
} from "cosmjs-types/cosmwasm/wasm/v1/authz";
import { atom, useAtom } from "jotai";
import { extractErrorName } from "~/lib/utils";
import { Button } from "~/components/ui/button"

const executeResultAtom = atom<ExecuteResult | undefined>(undefined);
const inProgressAtom = atom(false);

export default function Page(): JSX.Element {
  // Abstraxion hooks
  const { data: account } = useAbstraxionAccount();
  const { client } = useAbstraxionSigningClient();

  // General state hooks
  const [, setShowModal]: [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
  ] = useModal();

  const [loading, setLoading] = useState(false);
  const [executeResult, setExecuteResult] = useAtom(executeResultAtom);
  const [isInProgress, setInProgress] = useAtom(inProgressAtom);

  const blockExplorerUrl = `https://explorer.burnt.com/xion-testnet-1/tx/${executeResult?.transactionHash}`;

  async function createHub(
    hub_name: string,
    need_pay: { amount: string; denom: string },
  ) {
    setLoading(true);
    const msg = {
      create_hub: {
        hub_name,
        need_pay,
      },
    };

    try {
      const createHubRes = await client?.execute(
        account.bech32Address,
        hubContractAddress,
        msg,
        {
          amount: [{ amount: "0", denom: "uxion" }],
          gas: "500000",
        },
        "", // memo is ""
        [],
      );
      console.log(
        "createHubRes event: ",
        createHubRes?.events ?? "No create event",
      );
      setExecuteResult(createHubRes);
    } catch (error) {
      console.error("Error message:", extractErrorName(error as Error));
    } finally {
      setLoading(false);
    }
  }

  const generateContractGrant = (granter: string, grantee: string) => {
    const timestampThreeMonthsFromNow = Math.floor(
      new Date(new Date().setMonth(new Date().getMonth() + 3)).getTime() / 1000,
    );

    const contractExecutionAuthorizationValue =
      ContractExecutionAuthorization.encode(
        ContractExecutionAuthorization.fromPartial({
          grants: [hubContractAddress].map((contractAddress) => ({
            contract: contractAddress,
            limit: {
              typeUrl: "/cosmwasm.wasm.v1.MaxCallsLimit",
              value: MaxCallsLimit.encode(
                MaxCallsLimit.fromPartial({
                  remaining: 255,
                }),
              ).finish(),
            },
            filter: {
              typeUrl: "/cosmwasm.wasm.v1.AllowAllMessagesFilter",
            },
          })),
        }),
      ).finish();

    const grantValue = MsgGrant.fromPartial({
      grant: {
        authorization: {
          typeUrl: "/cosmwasm.wasm.v1.ContractExecutionAuthorization",
          value: contractExecutionAuthorizationValue,
        },
        expiration: {
          seconds: timestampThreeMonthsFromNow,
        },
      },
      grantee,
      granter,
    });

    return {
      typeUrl: "/cosmos.authz.v1beta1.MsgGrant",
      value: grantValue,
    };
  };

  const grant = async () => {
    setInProgress(true);
    if (!client) {
      throw new Error("no client");
    }

    if (!account) {
      throw new Error("no account");
    }

    const granter = account.bech32Address;
    const msg = generateContractGrant(granter, hubContractAddress);

    try {
      const foo = await client?.signAndBroadcast(
        account.bech32Address,
        [msg as EncodeObject],
        {
          amount: [{ amount: "0", denom: "uxion" }],
          gas: "500000",
        },
      );
      setInProgress(false);
    } catch (error) {
      setInProgress(false);
      console.log("something went wrong: ", error);
    }
  };

  return (
    <main className="m-auto flex min-h-screen max-w-xs flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold tracking-tighter text-white">
        ABSTRAXION
      </h1>
      <Button
        onClick={() => {
          setShowModal(true);
        }}
      >
        {account.bech32Address ? (
          <div className="flex items-center justify-center">VIEW ACCOUNT</div>
        ) : (
          "CONNECT"
        )}
      </Button>
      {account.bech32Address && <Button onClick={() => account}></Button>}
      <p>{account.bech32Address ?? "not connect"}</p>
      {client ? (
        <Button
          disabled={loading}
          onClick={() => {
            void grant();
          }}
        >
          {loading ? "LOADING..." : "GRANT"}
        </Button>
      ) : null}
      {client ? (
        <Button
          disabled={loading}
          onClick={() => {
            void createHub("Test Hub", { amount: "0", denom: "uxion" });
          }}
        >
          {loading ? "LOADING..." : "CREATE HUB"}
        </Button>
      ) : null}
      <Abstraxion
        onClose={() => {
          setShowModal(false);
        }}
      />
      {executeResult ? (
        <div className="flex flex-col rounded border-2 border-black p-2 dark:border-white">
          <div className="mt-2">
            <p className="text-zinc-500">
              <span className="font-bold">Transaction Hash</span>
            </p>
            <p className="text-sm">{executeResult.transactionHash}</p>
          </div>
          <div className="mt-2">
            <p className=" text-zinc-500">
              <span className="font-bold">Block Height:</span>
            </p>
            <p className="text-sm">{executeResult.height}</p>
          </div>
          <div className="mt-2">
            <Link
              className="text-black underline visited:text-purple-600 dark:text-white"
              href={blockExplorerUrl}
              target="_blank"
            >
              View in Block Explorer
            </Link>
          </div>
        </div>
      ) : null}
    </main>
  );
}
