import { Dimensions } from "react-native";

const { width: W, height: H } = Dimensions.get("window");

const BASE_W = 375;
const BASE_H = 812;

/** Mise à l'échelle horizontale (padding, width, gap…) */
export const s = (size: number): number => Math.round((W / BASE_W) * size);

/** Mise à l'échelle verticale (height, marginTop…) */
export const vs = (size: number): number => Math.round((H / BASE_H) * size);

/**
 * Mise à l'échelle modérée — idéale pour les polices et les tailles
 * qui ne doivent pas grossir/rétrécir autant que l'écran.
 * factor 0 = pas de scaling, 1 = scaling complet.
 */
export const ms = (size: number, factor = 0.4): number =>
  Math.round(size + (s(size) - size) * factor);
