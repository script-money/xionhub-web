import { UUID } from "crypto";

export type Address = string;

export interface HubInfoProps {
  creator: Address;
  name: string;
  payment: {
    amount: `${bigint}`;
    denom: "uxion" | "xion";
  };
  posts: Post[];
  subscribers: Address[];
}

export interface Post {
  id: UUID;
  title: String;
  content: String;
  updated: bigint;
}
