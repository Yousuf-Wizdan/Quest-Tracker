import { Canvas, Mask, RadialGradient, Rect, SweepGradient, useCanvasSize } from "@shopify/react-native-skia";
import { useMemo } from "react";
import type { StyleProp, ViewStyle } from "react-native";

const RED = "rgba(244,66,62,";

function webWedges() {
  const step = 15;
  const glow = 0.8;
  const positions: number[] = [];
  const colors: string[] = [];
  const count = Math.floor(360 / step);
  for (let i = 0; i < count; i += 1) {
    const start = (i * step) / 360;
    const end = Math.min(1, (i * step + glow) / 360);
    positions.push(start, end);
    colors.push(`${RED}0.045)`, "transparent");
  }
  return { positions, colors };
}

export function SpiderWebBackground({ style }: { style?: StyleProp<ViewStyle> }) {
  const { ref, size } = useCanvasSize();
  const web = useMemo(() => webWedges(), []);
  const { width, height } = size;

  if (width === 0 || height === 0) {
    return null;
  }

  const cx = width / 2;
  const cy = -150;

  return (
    <Canvas ref={ref} style={style} pointerEvents="none">
      {/* deep blue wash, bottom-left */}
      <Rect x={0} y={0} width={width} height={height}>
        <RadialGradient
          c={{ x: width * 0.08, y: height * 1.08 }}
          r={width * 1.4}
          colors={["rgba(70,120,255,0.06)", "transparent"]}
        />
      </Rect>

      {/* red halo, top-center */}
      <Rect x={0} y={0} width={width} height={height}>
        <RadialGradient
          c={{ x: cx, y: -160 }}
          r={width * 1.1}
          colors={[`${RED}0.10)`, "transparent"]}
        />
      </Rect>

      {/* spider web: repeating conic + repeating radial, masked by a top glow */}
      <Mask
        mode="luminance"
        mask={
          <RadialGradient
            c={{ x: cx, y: 0 }}
            r={Math.max(width, height) * 0.72}
            colors={["#000", "transparent"]}
          />
        }
      >
        <Rect x={0} y={0} width={width} height={height}>
          <SweepGradient
            c={{ x: cx, y: cy }}
            start={0}
            end={360}
            positions={web.positions}
            colors={web.colors}
          />
        </Rect>
        <Rect x={0} y={0} width={width} height={height}>
          <RadialGradient
            c={{ x: cx, y: cy }}
            r={88}
            mode="repeat"
            positions={[0, 44 / 88, 45 / 88, 1]}
            colors={["transparent", "transparent", `${RED}0.055)`, "transparent"]}
          />
        </Rect>
      </Mask>
    </Canvas>
  );
}
