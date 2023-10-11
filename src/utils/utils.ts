import { META } from "@consumet/extensions";

import { IMediaResult } from "../@types";
import { prisma } from "./prisma/client";

const anilist = new META.Anilist();

export const addToDatabase = async (data: IMediaResult) => {
  // add data to prisma database or update if already exists
  let { id, title, description, url, image, cover, type, duration } = data;
  id = Number(id);

  const media = await prisma.media.upsert({
    where: { id },
    update: {
      title: {
        english: title.english,
        romaji: title.romaji,
        native: title.native,
      },
      description: description || "",
      image,
      cover,
      type,
    },
    create: {
      id,
      title: {
        english: title.english,
        romaji: title.romaji,
        native: title.native,
      },
      description: description || "",
      image,
      cover,
      type,
    },
  });

  return media;
};

export const getMedia = async (id: number) => {
  const media = await prisma.media.findUnique({
    where: { id },
  });

  return media;
};

export const addToUserList = async (userId: number, mediaId: number, data: IMediaResult) => {
  const media = await getMedia(mediaId);

  if (!media) {
    const dataToAdd = await anilist.fetchAnimeInfo(mediaId.toString());
    const formattedData = formatData(dataToAdd);
    await addToDatabase(formattedData);
  }

  const { episodes, chapters, duration } = data;
};

export const formatData = (data: any): IMediaResult => {
  const toReturn: IMediaResult = {
    id: data.id,
    title: {
      english: data.title?.english,
      romaji: data.title?.romaji,
      native: data.title?.native,
    },
    description: data?.description,
    url: data?.url,
    image: data?.image,
    cover: data?.cover,
    type: data?.type,
    duration: data?.duration,
    episodes: data?.episodes,
    chapters: data?.chapters,
  };

  return toReturn;
};

export const sortQualities = (qualities: string[]): string[] => {
  const order = ["1080p", "480p", "360p", "720p", "default", "backup"];

  qualities.sort((a, b) => {
    const indexA = order.indexOf(a);
    const indexB = order.indexOf(b);

    // If a or b is not found in the order array, place it at the end
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    // Compare the indexes to determine the sort order
    return indexA - indexB;
  });

  return qualities;
};
