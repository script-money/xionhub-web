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
import { Fragment } from "react";
import { useSubscribeToHub } from "~/hooks/useSubscribeToHub";
import { HubAlert } from "./hub-alert";

type CardProps = React.ComponentProps<typeof Card>;
type HubCoverProps = CardProps & {
  isSubscribed: boolean;
  client: any;
  account: any;
  hubName: string;
  creator: string;
  payment: `${number} ${string}`;
  subscribers: number;
  firstPostTitle: string;
  firstPostContent?: string;
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
  firstPostTitle,
  firstPostContent,
  ...props
}: HubCoverProps) {
  const { handleSubscribeToHub, error, loading } = useSubscribeToHub(
    client,
    account,
  );

  return (
    <Card className={cn("w-[532px]", className)} {...props}>
      {error && <HubAlert error={error} />}
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
          <h4 className="text-sm font-medium">{firstPostTitle}</h4>
          {firstPostContent &&
            firstPostContent != "" &&
            firstPostContent
              .split("\n")
              .map((line, index) => (
                <Fragment key={index}>
                  {line}
                  <br />
                </Fragment>
              ))
              .slice(0, 100)}
        </div>
      </CardContent>
      {isSubscribed ? (
        <CardFooter className="flex gap-x-2">
          <Button className="w-full">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Previous Post
          </Button>
          <Button className="w-full">
            <HeartIcon className="mr-2 h-4 w-4" />
            Like
          </Button>
          <Button className="w-full">
            <ArrowRightIcon className="mr-2 h-4 w-4" />
            Next Post
          </Button>
        </CardFooter>
      ) : (
        <CardFooter>
          <Button
            className="w-full"
            onClick={(e) => {
              e.preventDefault();
              handleSubscribeToHub(creator);
            }}
            disabled={loading}
          >
            {" "}
            {loading ? (
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
