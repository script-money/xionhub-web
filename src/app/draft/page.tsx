"use client";
import {
  Abstraxion,
  useAbstraxionAccount,
  useAbstraxionSigningClient,
  useModal,
} from "@burnt-labs/abstraxion";
import "@burnt-labs/ui/dist/index.css";
import { Fragment, useEffect, useMemo, useState } from "react";
import useQueryHubList from "~/hooks/useQueryHubList";
import { useCreateHub } from "~/hooks/useCreateHub";

// Import the Slate editor factory.
import { createEditor, BaseEditor, Node, Descendant } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { ReactEditor } from "slate-react";
import { withHistory } from "slate-history";
import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import Image from "next/image";
import { useCreatePost } from "~/hooks/useCreatePost";
import { HubInfoProps } from "~/interface";
import { HubCover } from "~/components/hub/hub-cover";
import { useSubscribeToHub } from "~/hooks/useSubscribeToHub";
import { formatAddress } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import HubCreateForm from "~/components/hub/hub-create-form";
import { HubAlert, showAlertAtom } from "~/components/hub/hub-alert";

const hubInfosAtom = atom<HubInfoProps[]>([]);
const postTitleAtom = atomWithStorage("title", "");
const postContentAtom = atomWithStorage("content", "");
const showCreatePostAtom = atom<boolean>(false);
const showCreateHubAtom = atom<boolean>(true);

// Define a serializing function that takes a value and returns a string.
const serialize = (value: Descendant[]) => {
  return (
    value
      // Return the string content of each paragraph in the value's children.
      .map((n) => Node.string(n))
      // Join them all with line breaks denoting paragraphs.
      .join("\n")
  );
};

// Define a deserializing function that takes a string and returns a value.
const deserialize = (str: string | null) => {
  if (str == null) {
    return [{ children: [{ text: "" }] }] as Descendant[];
  }
  // Return a value array of children derived by splitting the string.
  return str.split("\n").map((line) => {
    return {
      children: [{ text: line }],
    } as Descendant;
  });
};

type CustomElement = { type: "paragraph"; children: CustomText[] };
type CustomText = { text: string };

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const DraftPage = () => {
  // 先连上账户，然后才会初始化client
  const { data: account, isConnected } = useAbstraxionAccount();
  const { client } = useAbstraxionSigningClient();

  const [hubInfos, setHubInfos] = useAtom(hubInfosAtom);

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const [postTitle, setPostTitle] = useAtom(postTitleAtom);
  const [postContent, setPostContent] = useAtom(postContentAtom);
  const [showCreatePost, setShowCreatePost] = useAtom(showCreatePostAtom);
  const [showCreateHub, setShowCreateHub] = useAtom(showCreateHubAtom);
  const [showAlert] = useAtom(showAlertAtom);

  const [, setShowModal] = useModal();

  const { queryHubList, isQueryingHubs } = useQueryHubList(client);

  const {
    handleCreatePost,
    txHash: createPostTxHash,
    error: createPostError,
  } = useCreatePost(postTitle, postContent, client, account);

  const [postCreated, setPostCreated] = useState(false);
  const [postIndices, setPostIndices] = useState(() => hubInfos.map(() => 0));

  useEffect(() => {
    if (client) {
      console.log("Querying Hubs");
      handleQueryHubs();
    }
  }, [client]);

  // capture create hub error in Effect
  useEffect(() => {
    if (createPostError) {
      console.error("createPost error:", createPostError);
    }
  }, [createPostError]);

  // Add an effect to listen for changes in the createPostError state
  // If there is no error, it means the post was created successfully
  useEffect(() => {
    if (createPostTxHash) {
      setPostCreated(true);
    }
  }, [createPostTxHash]);

  // TODO: show query automaticly and render the result
  const handleQueryHubs = async () => {
    if (!client) {
      console.log("client is not ready");
      return;
    }
    try {
      const data = await queryHubList(1, 5);
      if (data) {
        setHubInfos(data);
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
        <HubAlert />
        {showCreateHub && <HubCreateForm client={client} account={account} />}
        {showCreatePost && (
          <div className="">
            <label>Post Title: </label>
            <input
              className="ms-1"
              type="text"
              placeholder="Post title input"
              onChange={(e) => setPostTitle(e.target.value)}
            />
            <label>Post Content: </label>
            <Slate
              editor={editor}
              initialValue={deserialize(postContent)} // Changed from initialValue to value for controlled component
              onChange={(value) => {
                const isAstChange = editor.operations.some(
                  (op) => "set_selection" !== op.type,
                );
                if (isAstChange) {
                  setPostContent(serialize(value));
                }
              }}
            >
              <Editable />
            </Slate>
            <button onClick={handleCreatePost} className="border text-xl">
              Create Post
            </button>
            {postCreated && (
              <div className="text-green-500">
                Post created successfully! Hash: {createPostTxHash}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-y-2">
      <HubAlert />
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
            <Button
              variant="secondary"
              className="border text-xl"
              onClick={() => setShowModal(true)}
            >
              {formatAddress(account.bech32Address)}
            </Button>
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
              <h2 className="text-3xl">Querying data...</h2>
            </div>
          ) : (
            hubInfos.length > 0 && (
              <div className="container flex flex-col gap-y-2">
                {hubInfos.map((hub, hubIndex) => (
                  <HubCover
                    key={hub.creator}
                    isSubscribed={hub.subscribers.includes(
                      account.bech32Address,
                    )}
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
            )
          )}
        </>
      ) : (
        <div className="flex h-screen w-full items-center justify-center">
          <h2 className="text-3xl">
            {localStorage.getItem("xion-authz-granter-account")
              ? "Logging in, please wait"
              : "Please login first"}
          </h2>
        </div>
      )}
    </div>
  );
};

export default DraftPage;
