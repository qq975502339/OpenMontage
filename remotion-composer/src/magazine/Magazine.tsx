import React from "react";
import { AbsoluteFill, Audio, Sequence, useVideoConfig } from "remotion";
import type { MagazineProps } from "./types";
import { resolveSkin } from "./skins";
import { MagazinePageView } from "./pages";
import { PageSubtitles } from "./Subtitles";
import { resolveAsset } from "../lib/resolveAsset";

// Lay out pages back-to-back on a timeline using each page's duration.
export const Magazine: React.FC<MagazineProps> = (props) => {
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
          <MagazinePageView
            brand={props.brand} skin={skin} page={page} index={i} total={pages.length}
          />
          <PageSubtitles cues={page.subtitles} />
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
