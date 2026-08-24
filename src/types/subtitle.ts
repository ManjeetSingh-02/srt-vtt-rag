// type for subtitle data
export type Subtitle = {
  type: string;
  data: {
    text: string;
    start: number;
    end: number;
  };
};

// type for subtitle chunk
export type SubtitleChunk = {
  file: string;
  text: string;
  start: number;
  end: number;
};
