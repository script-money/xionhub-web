import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import { HubInfoProps } from "./interface";

export const userHasHubAtom = atom<boolean>(false);
export const hasCacheAccountAtom = atom<boolean>(false);

export const hubInfosAtom = atom<HubInfoProps[]>([]);
export const postTitleAtom = atomWithStorage("title", "");
export const postContentAtom = atomWithStorage("content", "");
export const showCreatePostAtom = atom<boolean>(false);
export const showCreateHubAtom = atom<boolean>(false);
