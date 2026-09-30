import React from "react";
import { AbsoluteFill, Audio, Sequence, useVideoConfig } from "remotion";
import type { MagazineProps } from "./types";
import { resolveSkin } from "./skins";
import { FootageMedia } from "./pages";
import { VMagazinePageView } from "./pages-v";
import { PageSubtitles } from "./Subtitles";
import { resolveAsset } from "../lib/resolveAsset";

// 9:16 vertical magazine (1080×1920): same timeline logic as Magazine.tsx,
// vertical page layouts, subtitles lifted into the Douyin safe area.
export const MagazineV: React.FC<MagazineProps> = (props) => {
  const { fps } = useVideoConfig();
  const skin = resolveSkin(props.skin as string | undefined);
  const pages = props.pages || [];

  let cursor = 0;
  const timeline = pages.map((page) => {
    const from = cursor;
    const durationInFrames = Math.max(1, Math.round(page.durationSeconds * fps));
    cursor += durationInFrames;
    return { page, from, durationInFrames };
  });

  return (
    <AbsoluteFill style={{ background: skin.paper }}>
      {timeline.map(({ page, from, durationInFrames }, i) => (
        <Sequence key={page.id} from={from} durationInFrames={durationInFrames} layout="none">
          <VMagazinePageView
            brand={props.brand}
            skin={skin}
            page={page}
            index={i}
            total={pages.length}
            FootageMedia={FootageMedia}
          />
          <PageSubtitles cues={page.subtitles} vertical />
          {page.narration && <Audio src={resolveAsset(page.narration)} />}
        </Sequence>
      ))}

      {props.audio?.narration && (
        <Audio src={resolveAsset(props.audio.narration)} />
      )}
      {props.audio?.music && (
        <Audio src={resolveAsset(props.audio.music)} volume={props.audio.musicVolume ?? 0.12} loop />
      )}
    </AbsoluteFill>
  );
};
