export type CameraViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
  transitionDuration?: number;
  transitionInterpolator?: unknown;
};

export const initialViewState: CameraViewState = {
  longitude: 7.2,
  latitude: 47.6,
  zoom: 3.35,
  pitch: 42,
  bearing: -18
};

export const deckBackgroundColor = "#03060b";

export const activeCountryAliases: Record<string, string> = {
  England: "英国",
  "United Kingdom": "英国",
  UK: "英国",
  Britain: "英国",
  France: "法国",
  Spain: "西班牙",
  Germany: "德国",
  Italy: "意大利"
};
