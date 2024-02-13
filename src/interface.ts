import { UUID } from "crypto";
import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

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
  title: string;
  content: string;
  updated: bigint;
}

export type CustomElement = { type: "paragraph"; children: CustomText[] };
export type CustomText = { text: string };
