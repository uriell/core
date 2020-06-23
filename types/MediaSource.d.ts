import { MediaItem } from './MediaItem';
import { User } from './User';
import { Uwave } from './Uwave';

type Omit<Obj, Key extends string> = Pick<Obj, Exclude<keyof Obj, Key>>;
type StripSourceType<Obj> = Omit<Obj, 'sourceType'>;

/** Get the MediaItem type for a source plugin. */
type MediaItemOf<SourcePlugin extends MediaSource<any, any>> =
  SourcePlugin extends MediaSource<infer SourceData, _> ? MediaItem<SourceData> : never;
/** Get the Pagination type for a source plugin. */
type PaginationOf<SourcePlugin extends MediaSource<any, any>> =
  SourcePlugin extends MediaSource<_, infer Pagination> ? Pagination : never;

export type MediaSourceItem<SourceData = void> = StripSourceType<MediaItem<SourceData>>;

/**
 * Wrapper around source plugins with some more convenient aliases.
 */
export interface Source<SourcePlugin extends MediaSource<any, any>> {
  type: string;
  readonly apiVersion: number;
  /**
   * Add a default sourceType property to a list of media items.
   *
   * Media items can provide their own sourceType, too, so media sources can
   * aggregate items from different source types.
   */
  addSourceType(items: StripSourceType<MediaItemOf<SourcePlugin>>[]): MediaItemOf<SourcePlugin>[];
  /**
   * Find a single media item by ID.
   */
  getOne(user: User, id: string): Promise<MediaItemOf<SourcePlugin> | undefined>;
  /**
   * Find several media items by ID.
   */
  get(user: User, ids: string[]): Promise<MediaItemOf<SourcePlugin>[]>;
  /**
   * Search this media source for items. Parameters can really be anything, but
   * will usually include a search string `query` and a page identifier `page`.
   */
  search(user: User, query: string, pagination?: PaginationOf<SourcePlugin>): Promise<MediaItemOf<SourcePlugin>[]>;
  /**
   * Import *something* from this media source. Because media sources can
   * provide wildly different imports, üWave trusts clients to know what they're
   * doing.
   */
  import(user: User, ...args: unknown[]): Promise<unknown>;
}

/**
 * Data holder for things that source plugins may require.
 */
export interface SourceContext<SourcePlugin extends MediaSource<any, any>> {
  uw: Uwave;
  source: Source<SourcePlugin>;
  user: User;
}

/**
 * Wrapper around playlist functions for use with import plugins. Intended to be
 * temporary until more data manipulation stuff is moved into core from api-v1.
 *
 * This is legacy, media sources should use the methods provided by the
 * `playlists` plugin instead.
 */
export interface ImportContext<SourcePlugin extends MediaSource<any, any>> extends SourceContext<SourcePlugin> {
  /**
   * Create a playlist for the current user.
   *
   * @param name  Playlist name.
   * @param itemOrItems  Playlist items.
   * @returns Playlist model.
   */
  createPlaylist(name: string, itemOrItems: MediaItem | MediaItem[]): Promise<unknown>;
}

export interface MediaSourceV1<SourceData = void, Pagination = unknown> {
  /** The API version implemented by this media source. */
  api?: 1;
  /** The name of this media source. */
  name: string;
  /** Get media items from the source by ID. */
  get(sourceIDs: string[]): Promise<MediaSourceItem<SourceData>[]>;
  /** Search the source for media items. */
  search(query: string, pagination?: Pagination): Promise<MediaSourceItem<SourceData>[]>;
  import?(context: ImportContext<this>, action: unknown): Promise<unknown>;
}

export interface MediaSourceV2<SourceData = void, Pagination = unknown> {
  /** The API version implemented by this media source. */
  api: 2;
  /** The name of this media source. */
  name: string;
  /** Get media items from the source by ID. */
  get(context: SourceContext<this>, sourceIDs: string[]): Promise<MediaSourceItem<SourceData>[]>;
  /** Search the source for media items. */
  search(context: SourceContext<this>, query: string, pagination?: Pagination): Promise<MediaSourceItem<SourceData>[]>;
  import?(context: ImportContext<this>, action: unknown): Promise<unknown>;
}

export type MediaSource<SourceData = void, Pagination = unknown> =
  | MediaSourceV1<SourceData, Pagination>
  | MediaSourceV2<SourceData, Pagination>;
