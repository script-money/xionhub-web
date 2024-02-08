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
import { useCreatePost } from "~/hooks/useCreatePost";
import { HubInfoProps } from "~/interface";

const hubInfosAtom = atom<HubInfoProps[]>([]);
const postTitleAtom = atomWithStorage("title", "");
const postContentAtom = atomWithStorage("content", "");

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
  const { data: account } = useAbstraxionAccount();
  const { client } = useAbstraxionSigningClient();

  const [hubInfos, setHubInfos] = useAtom(hubInfosAtom);

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const [postTitle, setPostTitle] = useAtom(postTitleAtom);
  const [postContent, setPostContent] = useAtom(postContentAtom);

  const [, setShowModal] = useModal();

  const queryHubList = useQueryHubList(client);
  const {
    nameInputRef,
    handleCreateHub,
    error: createHubError,
  } = useCreateHub(client, account);
  const {
    handleCreatePost,
    txHash: createPostTxHash,
    error: createPostError,
  } = useCreatePost(postTitle, postContent, client, account);

  const [postCreated, setPostCreated] = useState(false);

  // capture create hub error in Effect
  useEffect(() => {
    if (createHubError) {
      console.error("createhub error:", createHubError);
    }
  }, [createHubError]);

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
      const data = await queryHubList(1, 10);
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
          Go To Dashboard
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
      {hubInfos.length > 0 && (
        <div>
          <h1 className="text-3xl">Hub List</h1>
          <div>
            {hubInfos.map((hub) => (
              <div key={hub.creator}>
                <p>{hub.name}</p>
                <p>{hub.creator}</p>
                <p>{hub.payment.amount}</p>
                <p>{hub.subscribers.length}</p>
                <p>{hub.posts[0]?.title ?? "No Post"}</p>
                <p>
                  {hub.posts[0]?.content
                    .split("\n")
                    .map((line, index) => (
                      <Fragment key={index}>
                        {line}
                        <br />
                      </Fragment>
                    ))
                    .slice(0, 100)}{" "}
                </p>
              </div>
            ))}
          </div>
        </div>
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
      <label>Post Title: </label>
      <input
        className="ms-1"
        type="text"
        placeholder="Post title input"
        defaultValue={""}
        onChange={(e) => setPostTitle(e.target.value)}
      />
      <label>Post Content: </label>
      <Slate
        editor={editor}
        initialValue={deserialize(postContent)}
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
    </main>
  );
};

export default DraftPage;
