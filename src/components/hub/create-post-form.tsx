import { useEffect, useMemo, useState } from "react";
import { createEditor, Node, Descendant } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { atomWithStorage } from "jotai/utils";
import { useAtom, useSetAtom } from "jotai";
import { withHistory } from "slate-history";

import { useCreatePost } from "~/hooks/useCreatePost";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { showAlertAtom } from "./hub-alert";
import { showCreatePostAtom } from "~/atom";
import { Cross1Icon } from "@radix-ui/react-icons";

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

const postTitleAtom = atomWithStorage("title", "");
const postContentAtom = atomWithStorage("content", "");

const CreatePostForm: React.FC<{ client: any; account: any }> = ({
  client,
  account,
}) => {
  const [postTitle, setPostTitle] = useAtom(postTitleAtom);
  const [postContent, setPostContent] = useAtom(postContentAtom);

  const [showCreatePost, setShowCreatePost] = useAtom(showCreatePostAtom);

  const [value, setValue] = useState<Descendant[]>(deserialize(postContent));

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const { handleCreatePost, txHash, error, loading } = useCreatePost(
    client,
    account,
  );
  const [showAlert, setShowAlert] = useAtom(showAlertAtom);

  useEffect(() => {
    // Sync the state with the postContentAtom
    setValue(deserialize(postContent));
  }, [postContent]);

  useEffect(() => {
    if (error) {
      setShowAlert({
        isSuccess: false,
        message: error,
        isConfirming: false,
      });
    } else if (loading) {
      setShowAlert({
        isSuccess: false,
        message: "",
        isConfirming: true,
      });
    } else if (txHash) {
      setShowAlert({
        isSuccess: true,
        message: txHash,
        isConfirming: false,
      });
      setShowCreatePost(false);
    }
  }, [loading, error, txHash]);

  return (
    <div className="container flex items-center justify-center">
      <Card className="relative w-full p-4 md:w-[618px]">
        <Button
          variant="outline"
          size="icon"
          className="absolute right-2 top-2"
          onClick={() => setShowCreatePost(false)}
        >
          <Cross1Icon className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl">Create Post</h1>
        <Label htmlFor="postTile">Title</Label>
        <Input
          type="text"
          value={postTitle} // Controlled component needs value prop
          onChange={(e) => setPostTitle(e.target.value)} // Bind setPostTitle to input's onChange event
        />
        <Label htmlFor="postContent">Content</Label>
        <Slate
          editor={editor}
          initialValue={value}
          onChange={(newValue) => {
            setValue(newValue);
            const isAstChange = editor.operations.some(
              (op) => "set_selection" !== op.type,
            );
            if (isAstChange) {
              setPostContent(serialize(newValue));
            }
          }}
        >
          <Editable
            className="flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300"
            renderElement={(props) => {
              return <p {...props.attributes}>{props.children}</p>;
            }}
          />
        </Slate>
        <Button
          className="mt-2"
          type="submit"
          variant="outline"
          onClick={() => handleCreatePost(postTitle, postContent)}
        >
          Create Post
        </Button>
      </Card>
    </div>
  );
};

export default CreatePostForm;
