export enum AvailableResolutions {
  P144 = 'P144',
  P240 = 'P240',
  P360 = 'P360',
  P480 = 'P480',
  P720 = 'P720',
  P1080 = 'P1080',
  P1440 = 'P1440',
  P2160 = 'P2160',
}

export type CreateVideo = {
  title: string;
  author: string;
  availableResolutions: AvailableResolutions[];
}

export type UpdateVideo = {
  title: string;
  author: string;
  availableResolutions: AvailableResolutions[];
  canBeDownloaded: boolean;
  minAgeRestriction: number | null;
  publicationDate: string;
}
