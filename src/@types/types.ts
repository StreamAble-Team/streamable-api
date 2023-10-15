export interface ITitle {
  english: string;
  romaji?: string;
  native?: string;
}

export enum MediaType {
  TV = "TV",
  TV_SHORT = "TV_SHORT",
  MOVIE = "MOVIE",
  SPECIAL = "SPECIAL",
  OVA = "OVA",
  ONA = "ONA",
  MUSIC = "MUSIC",
  MANGA = "MANGA",
  NOVEL = "NOVEL",
  ONE_SHOT = "ONE_SHOT",
}

export enum WatchingStatus {
  CURRENT = "CURRENT",
  PLANNING = "PLANNING",
  COMPLETED = "COMPLETED",
  DROPPED = "DROPPED",
  PAUSED = "PAUSED",
  REPEATING = "REPEATING",
}

export interface IEpisode {
  id: number;
  title: string;
  description?: string;
  url?: string;
  cover?: string;
  type?: MediaType;
  duration?: number;
  releaseDate?: string;
  watchingStatus: WatchingStatus;
}

export interface IMediaResult {
  id: number;
  title: ITitle;
  description?: string;
  url: string;
  image: string;
  cover: string;
  type: string;
  duration?: number;
  episodes?: IEpisode[];
  chapters?: number;
}

export interface IAnimeResult extends IMediaResult {
  malId?: number;
  genres?: string[];
  description?: string;
  status?: string;
  totalEpisodes?: number;
  subOrDub: string;
  synonyms?: string[];
  countryOfOrigin?: string;
  isAdult?: boolean;
  isLicensed?: boolean;
  season?: string;
  studios?: string[];
  color?: string;
  cover: string;
  trailer?: string;
  episodes?: IEpisode[];
  startDate?: string;
  endDate?: string;
  recommendations?: IAnimeResult[];
  relations?: IAnimeResult[];
}

export interface ITvResult extends IMediaResult {
  id: number;
  title: ITitle;
}

export type DropdownData = {
  label: string;
  value: string;
  image?: string;
};
