import {
  ArrowLeftIcon,
  ArrowRightIcon,
  HeartIcon,
  PersonIcon,
  SketchLogoIcon,
} from "@radix-ui/react-icons";

import { cn, formatAddress } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Fragment, useEffect } from "react";
import { useSubscribeToHub } from "~/hooks/useSubscribeToHub";
import { showAlertAtom } from "./hub-alert";
import { useLikePost } from "~/hooks/useLikePost";
import { Post } from "~/interface";
import { useSetAtom } from "jotai";

type CardProps = React.ComponentProps<typeof Card>;
type HubCoverProps = CardProps & {
  isSubscribed: boolean;
  client: any;
  account: any;
  hubName: string;
  creator: string;
  payment: `${number} ${string}`;
  subscribers: number;
  hubPosts: Post[];
  postIndex: number;
  setPostIndex: (index: number) => void;
  totalPosts: number;
};

export function HubCover({
  className,
  isSubscribed,
  client,
  account,
  hubName,
  creator,
  payment,
  subscribers,
  hubPosts,
  postIndex,
  setPostIndex,
  totalPosts,
  ...props
}: HubCoverProps) {
  const {
    handleSubscribeToHub,
    error: subscribeError,
    loading: subscribeLoading,
  } = useSubscribeToHub(client, account);

  const firstPost = hubPosts && hubPosts[0];
  const hasPost = firstPost && firstPost.title;

  let handleLikePost: () => Promise<void> | undefined;
  let liked = false;
  let likeError = "";
  let likeIsLoading = false;

  if (hubPosts && hubPosts.length > 0) {
    const currentPost = hubPosts[postIndex];
    ({
      handleLikePost,
      liked,
      error: likeError,
      loading: likeIsLoading,
    } = useLikePost(currentPost!.id, client, account));
  }

  const renderContent = (post?: Post) => {
    if (!post) return null;
    return post.content.split("\n").map((line, index) => (
      <Fragment key={index}>
        {line}
        <br />
      </Fragment>
    ));
  };

  const setShowAlert = useSetAtom(showAlertAtom);

  useEffect(() => {
    if (subscribeLoading || subscribeError) {
      setShowAlert({
        errorMessage: subscribeError,
        isConfirming: subscribeLoading,
      });
    }
    if (likeIsLoading || likeError) {
      setShowAlert({
        errorMessage: likeError,
        isConfirming: likeIsLoading,
      });
    }
  }, [subscribeLoading, subscribeError, likeIsLoading, likeError]);

  return (
    <Card className={cn("w-full md:w-[532px]", className)} {...props}>
      <CardHeader>
        <CardTitle>{hubName}</CardTitle>
        <div className="flex justify-between">
          <CardDescription>Create by {formatAddress(creator)}</CardDescription>
          <div className="flex">
            <PersonIcon />
            <CardDescription className="text-sm">
              {subscribers.toString()}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-col items-start space-x-4 rounded-md border p-4">
          <h4 className="text-sm font-medium">
            {hasPost ? hubPosts[postIndex]?.title : "No Post"}
          </h4>
          {hubPosts &&
            hubPosts.length > 0 &&
            renderContent(hubPosts[postIndex])}
        </div>
      </CardContent>
      {isSubscribed ? (
        <CardFooter className="flex gap-x-2">
          {hasPost && (
            <>
              <Button
                className="w-full"
                onClick={() => setPostIndex(Math.max(postIndex - 1, 0))}
                disabled={postIndex === 0}
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Previous Post
              </Button>
              <Button
                className="w-full"
                disabled={liked || likeIsLoading}
                onClick={(e) => {
                  e.preventDefault();
                  handleLikePost && handleLikePost();
                }}
              >
                <HeartIcon className="mr-2 h-4 w-4" />
                Like
              </Button>
              <Button
                className="w-full"
                onClick={() =>
                  setPostIndex(Math.min(postIndex + 1, totalPosts - 1))
                }
                disabled={postIndex === totalPosts - 1}
              >
                <ArrowRightIcon className="mr-2 h-4 w-4" />
                Next Post
              </Button>
            </>
          )}
        </CardFooter>
      ) : (
        <CardFooter>
          <Button
            className="w-full"
            onClick={(e) => {
              e.preventDefault();
              handleSubscribeToHub(creator);
            }}
            disabled={subscribeLoading}
          >
            {subscribeLoading ? (
              <>Loading...</>
            ) : (
              <>
                <SketchLogoIcon className="mr-2 h-4 w-4" /> Pay {payment} to
                subscribe
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
