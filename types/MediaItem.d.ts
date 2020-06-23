export interface MediaItem<SourceData = void> {
  sourceID: string;
  sourceType: string;
  sourceData: SourceData;
  artist: string;
  title: string;
  duration: number;
  thumbnail: string;
}
