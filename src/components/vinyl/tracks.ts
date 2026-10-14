export type ArtworkStyle = "rose" | "golden" | "garden" | "moon";

export interface VinylTrack {
  id: string;
  title: string;
  artist: string;
  /** A public asset path or an object URL. Leave empty until audio is available. */
  src?: string;
  /** Optional artwork. An original illustrated label is used if it is unavailable. */
  cover?: string;
  note?: string;
  artwork?: ArtworkStyle;
}