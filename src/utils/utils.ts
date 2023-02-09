import { META } from "@consumet/extensions";

import { IMediaResult } from "../models/types";
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

export const addToUserList = async (
  userId: number,
  mediaId: number,
  data: IMediaResult
) => {
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
