import type { ControlCommand, Item, PlayMode, Session, TargetConfig } from "./types";

export interface OpenItemDetail {
  item: Pick<Item, "id" | "type" | "name" | "is_folder">;
}
export interface PlayDetail {
  itemId: string;
  mode: PlayMode;
}
export interface ControlDetail {
  sessionId: string;
  command: ControlCommand;
  value?: number;
}
/** Volume change for a client whose volume is a Home Assistant media_player. */
export interface VolumeDetail {
  entityId: string;
  level?: number;
  muted?: boolean;
}
export type TargetChoice =
  | { kind: "session"; session: Session }
  | { kind: "target"; target: TargetConfig };

declare global {
  interface HTMLElementEventMap {
    "emby-open-item": CustomEvent<OpenItemDetail>;
    "emby-play": CustomEvent<PlayDetail>;
    "emby-control": CustomEvent<ControlDetail>;
    "emby-volume": CustomEvent<VolumeDetail>;
    "emby-target-chosen": CustomEvent<TargetChoice>;
    "emby-pick-target": CustomEvent<void>;
    "emby-close": CustomEvent<void>;
    "emby-error": CustomEvent<{ code: string }>;
  }
}

export function fire<T>(node: HTMLElement, type: string, detail?: T): void {
  node.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
}
