"use client";
import {
  Abstraxion,
  useAbstraxionAccount,
  useAbstraxionSigningClient,
  useModal,
} from "@burnt-labs/abstraxion";
import "@burnt-labs/ui/dist/index.css";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import Image from "next/image";

import useQueryHubList from "~/hooks/useQueryHubList";
import { HubCover } from "~/components/hub/hub-cover";
import { formatAddress } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import CreateHubForm from "~/components/hub/create-hub-form";
import CreatePostForm from "~/components/hub/create-post-form";
import {
  hasCacheAccountAtom,
  hubInfosAtom,
  showCreateHubAtom,
  showCreatePostAtom,
  userHasHubAtom,
} from "~/atom";
import { Rocket } from "lucide-react";
import { Pencil2Icon } from "@radix-ui/react-icons";

const MainPage = () => {
  const { data: account } = useAbstraxionAccount();
  const { client } = useAbstraxionSigningClient();

  const [hubInfos, setHubInfos] = useAtom(hubInfosAtom);

  const [showCreatePost, setShowCreatePost] = useAtom(showCreatePostAtom);
  const [showCreateHub, setShowCreateHub] = useAtom(showCreateHubAtom);

  const [userHasHub, setUserHasHub] = useAtom(userHasHubAtom);
  const [hasCacheAccount, setHasCacheAccount] = useAtom(hasCacheAccountAtom);

  const [, setShowModal] = useModal();

  const { queryHubList, isQueryingHubs } = useQueryHubList(client);

  const [postIndices, setPostIndices] = useState(() => hubInfos.map(() => 0));

  const initRef = useRef(false);

  useLayoutEffect(() => {
    if (!initRef.current) {
      console.log("Initing app");
      if (localStorage.getItem("xion-authz-granter-account")) {
        setHasCacheAccount(true);
      }
      initRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (client) {
      console.log("Querying Hubs");
      handleQueryHubs();
    }
  }, [client]);

  const handleQueryHubs = async () => {
    if (!client) {
      console.log("client is not ready");
      return;
    }
    try {
      const data = await queryHubList(1, 5);
      if (data) {
        setHubInfos(data);
        if (data.map((hub) => hub.creator).includes(account.bech32Address)) {
          setUserHasHub(true);
        }
        console.log("HubInfoList:", data);
      } else {
        console.log("No data found");
      }
    } catch (error) {
      console.error("Error querying hub list:", error);
    }
  };

  if (showCreatePost || showCreateHub) {
    return (
      <div className="flex h-screen w-full bg-black opacity-75">
        {showCreateHub && <CreateHubForm client={client} account={account} />}
        {showCreatePost && <CreatePostForm client={client} account={account} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-y-2">
      <Abstraxion
        onClose={() => {
          setShowModal(false);
        }}
      />
      <div className="container flex h-16 flex-row items-center justify-between py-4">
        <Image
          style={{ filter: "invert(100%)" }}
          src="/logo.svg"
          width={128}
          height={73}
          alt="Logo"
        />
        <div className="ml-auto flex justify-end space-x-2">
          {account.bech32Address ? (
            <>
              {!userHasHub ? (
                <Button
                  variant="ghost"
                  className="hidden border text-xl md:block" // Hide on small screens
                  onClick={() => setShowCreateHub(true)}
                >
                  Create Hub
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="hidden border text-xl md:block" // Hide on small screens
                  onClick={() => setShowCreatePost(true)}
                >
                  Create Post
                </Button>
              )}
              {!userHasHub ? (
                <Button
                  className="fixed bottom-4 right-4 h-16 w-16 rounded-full border md:hidden" // Show as floating button on small screens
                  onClick={() => setShowCreateHub(true)}
                  title="Create Hub"
                >
                  <Rocket name="create-hub" />
                </Button>
              ) : (
                <Button
                  className="fixed bottom-4 right-4 h-16 w-16 rounded-full border md:hidden" // Show as floating button on small screens
                  onClick={() => setShowCreatePost(true)}
                  title="Create Post"
                >
                  <Pencil2Icon name="create-post" />
                </Button>
              )}
              <Button
                variant="secondary"
                className="border text-xl"
                onClick={() => setShowModal(true)}
              >
                {formatAddress(account.bech32Address)}
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setShowModal(true)}
              className="border text-xl"
            >
              Login
            </Button>
          )}
        </div>
      </div>

      {account.bech32Address ? (
        <>
          {isQueryingHubs ? (
            <div className="flex h-screen w-full items-center justify-center">
              <h2 className="text-xl md:text-3xl">Querying data...</h2>
            </div>
          ) : hubInfos.length > 0 ? (
            <div className="container flex flex-col items-center gap-y-2">
              {hubInfos.map((hub, hubIndex) => (
                <HubCover
                  key={hub.creator}
                  isSubscribed={hub.subscribers.includes(account.bech32Address)}
                  client={client}
                  account={account}
                  hubName={hub.name}
                  creator={hub.creator}
                  payment={`${Number(hub.payment.amount) / 1e6} ${hub.payment.denom}`}
                  subscribers={hub.subscribers.length}
                  hubPosts={hub.posts}
                  postIndex={postIndices[hubIndex] ?? 0}
                  setPostIndex={(newIndex) => {
                    const newPostIndices = [...postIndices];
                    newPostIndices[hubIndex] = newIndex;
                    setPostIndices(newPostIndices);
                  }}
                  totalPosts={hub.posts.length}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-screen w-full items-center justify-center">
              <h2 className="text-xl md:text-3xl">
                Click "Create Hub" be the first
              </h2>
            </div>
          )}
        </>
      ) : (
        <div className="flex h-screen w-full items-center justify-center">
          <h2 className="text-3xl">
            {hasCacheAccount ? "Logging in, please wait" : "Please login first"}
          </h2>
        </div>
      )}
    </div>
  );
};

export default MainPage;
