import React from "react";
import Svg, { Path, Rect, Circle } from "react-native-svg";

type Props = { color: string; size?: number };

export function HomeTabIcon({ color, size = 30 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <Path
        d="M3.75 11.25L15 2.5L26.25 11.25V26.25H18.75V18.75H11.25V26.25H3.75V11.25Z"
        stroke={color}
        strokeWidth={1.5}
        fill="none"
      />
      <Path
        d="M11.25 18.75H18.75"
        stroke={color}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

export function DestinationTabIcon({ color, size = 30 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <Path
        d="M15 2.5C10.858 2.5 7.5 5.858 7.5 10C7.5 15.625 15 27.5 15 27.5C15 27.5 22.5 15.625 22.5 10C22.5 5.858 19.142 2.5 15 2.5Z"
        stroke={color}
        strokeWidth={2}
        fill="none"
      />
      <Circle cx="15" cy="10" r="3" stroke={color} strokeWidth={2} fill="none" />
    </Svg>
  );
}

export function FavoritesTabIcon({ color, size = 30 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <Path
        d="M15 25.5C15 25.5 3 17.5 3 10.5C3 7.5 5.5 5 8.5 5C11 5 13 6.5 15 8.5C17 6.5 19 5 21.5 5C24.5 5 27 7.5 27 10.5C27 17.5 15 25.5 15 25.5Z"
        stroke={color}
        strokeWidth={2}
        fill="none"
      />
    </Svg>
  );
}

export function OffersTabIcon({ color, size = 30 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <Rect x="2.5" y="2.5" width="25" height="25" rx="2" stroke={color} strokeWidth={2} fill="none" />
      <Path d="M2.5 10H27.5" stroke={color} strokeWidth={2} />
      <Path d="M10 2.5V10" stroke={color} strokeWidth={2} />
      <Path d="M20 2.5V10" stroke={color} strokeWidth={2} />
    </Svg>
  );
}

export function ProfileTabIcon({ color, size = 30 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <Circle cx="15" cy="9" r="5" stroke={color} strokeWidth={2} fill="none" />
      <Path
        d="M3 27C3 21.477 8.477 17 15 17C21.523 17 27 21.477 27 27"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
