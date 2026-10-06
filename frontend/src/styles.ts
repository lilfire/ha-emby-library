import { css } from "lit";

// Everything is derived from Home Assistant's theme variables.
export const sharedStyles = css`
  :host {
    --el-gap: 12px;
    --el-radius: var(--ha-card-border-radius, 12px);
    --el-tile-radius: 8px;
    --el-surface: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
    --el-muted: var(--secondary-text-color);
    --el-accent: var(--primary-color);
    --el-on-accent: var(--text-primary-color, #fff);
    box-sizing: border-box;
    color: var(--primary-text-color);
    font-family: var(--ha-font-family-body, var(--paper-font-body1_-_font-family, inherit));
  }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  [hidden] {
    display: none !important;
  }
  button {
    font: inherit;
    color: inherit;
    background: none;
    border: 0;
    margin: 0;
    padding: 0;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  button:disabled {
    cursor: default;
    opacity: 0.5;
  }
  :focus {
    outline: none;
  }
  :focus-visible {
    outline: 2px solid var(--el-accent);
    outline-offset: 2px;
  }
  .icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    min-height: 44px;
    border-radius: 50%;
    color: var(--primary-text-color);
  }
  .icon-button:hover:not(:disabled) {
    background: var(--el-surface);
  }
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 44px;
    padding: 0 18px;
    border-radius: 22px;
    background: var(--el-surface);
    font-weight: 500;
    white-space: nowrap;
  }
  .button.primary {
    background: var(--el-accent);
    color: var(--el-on-accent);
  }
  .button:hover:not(:disabled) {
    filter: brightness(1.1);
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 44px;
    padding: 0 14px;
    border-radius: 22px;
    background: var(--el-surface);
    white-space: nowrap;
  }
  .chip[aria-pressed="true"],
  .chip[aria-selected="true"] {
    background: var(--el-accent);
    color: var(--el-on-accent);
  }
  .state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 32px 16px;
    text-align: center;
    color: var(--el-muted);
  }
  .state ha-icon {
    --mdc-icon-size: 40px;
  }
  .state.error > ha-icon {
    color: var(--error-color);
  }
  .muted {
    color: var(--el-muted);
  }
  .skeleton {
    position: relative;
    overflow: hidden;
    background: var(--el-surface);
    border-radius: var(--el-tile-radius);
  }
  .skeleton::after {
    content: "";
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background: linear-gradient(90deg, transparent, rgba(127, 127, 127, 0.18), transparent);
    animation: el-shimmer 1.4s infinite;
  }
  @keyframes el-shimmer {
    100% {
      transform: translateX(100%);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .skeleton::after {
      animation: none;
    }
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
`;
