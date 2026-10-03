import { useEffect, useMemo, useRef, useState } from "react";
import {
  combineKeyboardData,
  parseKeyboardLayout,
  parseKeymap,
} from "../keyboard/parser";

const KEY_SIZE = 62;

function parseBinding(binding) {
  if (!binding) {
    return {
      behavior: "",
      argument: "",
      modifiers: [],
    };
  }

  const clean = binding.trim();

  const parts = clean.split(/\s+/);

  // Keep the & and the lowercase behavior.
  // Example: "&kp", "&mo", "&lt"
  const behavior = parts[0] || "";

  let argument = parts.slice(1).join(" ");

  const modifiers = [];

  const modifierIcons = {
    LS: "⇧",
    RS: "⇧",
    LC: "⌃",
    RC: "⌃",
    LA: "⌥",
    RA: "⌥",
    LG: "⌘",
    RG: "⌘",
  };

  /*
   * Handle modifier wrappers:
   *
   * LS(A)
   * LC(A)
   * LS(LC(A))
   */
  let nested = true;

  while (nested) {
    nested = false;

    const match = argument.match(
      /^(LS|RS|LC|RC|LA|RA|LG|RG)\((.*)\)$/
    );

    if (match) {
      const modifier = match[1];

      argument = match[2];

      modifiers.push(
        modifierIcons[modifier] || modifier
      );

      nested = true;
    }
  }

  /*
   * Arguments are displayed in uppercase.
   *
   * Example:
   *
   * enter -> ENTER
   * left  -> LEFT
   * a     -> A
   */
  argument = argument.toUpperCase();

  return {
    behavior,
    argument,
    modifiers,
  };
}

function BindingLabel({ binding }) {
  const parsed = parseBinding(binding);

  if (!binding) {
    return null;
  }

  return (
    <>
      {/* Top-left: &kp, &mo, &lt, etc. */}
      <div className="key-binding">
        <span className="binding-behavior">
          {parsed.behavior}
        </span>
      </div>

      {/* Bottom: ⇧ A, ENTER, 1, etc. */}
      {(parsed.argument ||
        parsed.modifiers.length > 0) && (
          <div className="key-argument">
            {parsed.modifiers.map(
              (modifier, index) => (
                <span
                  className="binding-modifier"
                  key={`${modifier}-${index}`}
                >
                  {modifier}
                </span>
              )
            )}

            {parsed.argument && (
              <span className="binding-argument">
                {parsed.argument}
              </span>
            )}
          </div>
        )}
    </>
  );
}

function Keyboard({
  layoutText,
  keymapText,
  config,
}) {
  const [selectedLayer, setSelectedLayer] = useState(0);

  /*
   * Reference to the element containing the keyboard.
   *
   * ResizeObserver uses this to determine how much space
   * is actually available.
   */
  const panelRef = useRef(null);

  const [availableWidth, setAvailableWidth] =
    useState(0);

  /*
   * Observe the keyboard container.
   *
   * Whenever the window/container changes size, the
   * keyboard will be rescaled.
   */
  useEffect(() => {
    const element = panelRef.current;

    if (!element) {
      return;
    }

    const updateSize = () => {
      setAvailableWidth(
        element.clientWidth
      );
    };

    updateSize();

    const observer = new ResizeObserver(
      updateSize
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  /*
   * Parse layout and keymap.
   */
  const keyboard = useMemo(() => {
    if (!layoutText || !keymapText) {
      return null;
    }

    try {
      const layout =
        parseKeyboardLayout(layoutText);

      const keymap =
        parseKeymap(keymapText);

      return combineKeyboardData(
        layout,
        keymap
      );
    } catch (error) {
      console.error(
        "Failed to parse keyboard:",
        error
      );

      return {
        error: error.message,
      };
    }
  }, [layoutText, keymapText]);

  /*
   * No files loaded.
   */
  if (!layoutText || !keymapText) {
    return (
      <div className="page">
        <header className="page-header">
          <div>
            <p className="eyebrow">
              KEYBOARD
            </p>

            <h2>Keyboard</h2>

            <p>
              Load your ZMK layout and
              keymap from Settings to
              visualize your keyboard.
            </p>
          </div>
        </header>

        <div className="empty-state">
          <div className="empty-state-icon">
            ⌨
          </div>

          <h3>No keyboard loaded</h3>

          <p>
            Go to Settings and select your
            ZMK physical layout JSON and
            keymap files.
          </p>
        </div>
      </div>
    );
  }

  /*
   * Parser error.
   */
  if (keyboard?.error) {
    return (
      <div className="page">
        <header className="page-header">
          <div>
            <p className="eyebrow">
              KEYBOARD
            </p>

            <h2>Keyboard</h2>
          </div>
        </header>

        <div className="empty-state">
          <div className="empty-state-icon">
            ⚠
          </div>

          <h3>
            Unable to parse keyboard
          </h3>

          <p>{keyboard.error}</p>
        </div>
      </div>
    );
  }

  const layers = keyboard?.layers || [];

  if (layers.length === 0) {
    return (
      <div className="page">
        <header className="page-header">
          <div>
            <p className="eyebrow">
              KEYBOARD
            </p>

            <h2>Keyboard</h2>
          </div>
        </header>

        <div className="empty-state">
          <div className="empty-state-icon">
            ⚠
          </div>

          <h3>No layers found</h3>

          <p>
            No usable layers were found in
            your keymap.
          </p>
        </div>
      </div>
    );
  }

  /*
   * Prevent the selected layer from becoming invalid.
   */
  const layerIndex = Math.min(
    selectedLayer,
    layers.length - 1
  );

  const layer = layers[layerIndex];

  const layoutKeys = keyboard.keys || [];

  /*
   * Determine the natural dimensions of the
   * keyboard in layout units.
   */
  const maxX = Math.max(
    ...layoutKeys.map(
      (key) =>
        (key.x || 0) +
        (key.w || 1)
    ),
    1
  );

  const maxY = Math.max(
    ...layoutKeys.map(
      (key) =>
        (key.y || 0) +
        (key.h || 1)
    ),
    1
  );

  /*
   * Extra space around the keyboard.
   *
   * This is particularly useful for the rotated
   * Chocofi thumb keys.
   */
  const canvasPadding = 2;

  const canvasWidth =
    (maxX + canvasPadding * 2) *
    KEY_SIZE;

  const canvasHeight =
    (maxY + canvasPadding * 2) *
    KEY_SIZE;

  /*
   * The panel has padding on both sides.
   *
   * Calculate how much horizontal space is
   * available for the actual keyboard.
   */
  const panelPadding = 64;

  const usableWidth = Math.max(
    availableWidth - panelPadding,
    1
  );

  /*
   * Never make the keyboard larger than its
   * natural size.
   *
   * If the available container is smaller,
   * scale it down.
   */
  const scale = Math.min(
    usableWidth / canvasWidth,
    1
  );

  /*
   * Calculate the final displayed dimensions.
   *
   * The wrapper occupies this exact size, while
   * the keyboard itself remains at its natural
   * coordinate size and is transformed using CSS.
   */
  const displayedWidth =
    canvasWidth * scale;

  const displayedHeight =
    canvasHeight * scale;

  /*
   * Convert the physical layout into renderable
   * keys.
   */
  const renderedKeys = layoutKeys.map(
    (layoutKey, index) => {
      const keymapKey =
        layer?.keys?.[index];

      const binding =
        keymapKey?.binding || "";

      const deckKey =
        keymapKey?.deckKey ?? null;

      const isDeckKey =
        deckKey !== null &&
        deckKey !== undefined;

      /*
       * Find the function assigned to
       * this deck key.
       */
      let functionName = null;

      if (
        isDeckKey &&
        config?.buttons
      ) {
        functionName =
          config.buttons[
          String(deckKey)
          ] ??
          config.buttons[deckKey] ??
          null;
      }

      const width =
        (layoutKey.w || 1) *
        KEY_SIZE;

      const height =
        (layoutKey.h || 1) *
        KEY_SIZE;

      const left =
        (layoutKey.x +
          canvasPadding) *
        KEY_SIZE;

      const top =
        (layoutKey.y +
          canvasPadding) *
        KEY_SIZE;

      const rotation =
        layoutKey.r || 0;

      /*
       * Use the physical layout's rotation
       * origin instead of rotating around
       * the center of each individual key.
       */
      let transformOrigin =
        "50% 50%";

      if (
        typeof layoutKey.rx ===
        "number" &&
        typeof layoutKey.ry ===
        "number"
      ) {
        const originX =
          (layoutKey.rx -
            layoutKey.x) *
          KEY_SIZE;

        const originY =
          (layoutKey.ry -
            layoutKey.y) *
          KEY_SIZE;

        transformOrigin =
          `${originX}px ${originY}px`;
      }

      return {
        ...layoutKey,
        index,
        binding,
        deckKey,
        functionName,
        isDeckKey,
        width,
        height,
        left,
        top,
        rotation,
        transformOrigin,
      };
    }
  );

  return (
    <div className="page keyboard-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">
            KEYBOARD
          </p>

          <h2>
            {keyboard.name ||
              "Keyboard"}
          </h2>

          <p>
            Configure functions and
            assign them to your custom
            ZMK keyboard.
          </p>
        </div>
      </header>

      {/* =========================
                Layer selector
               ========================= */}

      <div className="keyboard-toolbar">
        <div className="layer-selector">
          <span className="toolbar-label">
            Layer
          </span>

          <div className="layer-buttons">
            {layers.map(
              (
                currentLayer,
                index
              ) => (
                <button
                  key={
                    currentLayer.name ||
                    index
                  }
                  className={
                    index ===
                      layerIndex
                      ? "layer-button active"
                      : "layer-button"
                  }
                  onClick={() =>
                    setSelectedLayer(
                      index
                    )
                  }
                >
                  {currentLayer.label ||
                    currentLayer.name ||
                    `Layer ${index + 1
                    }`}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* =========================
                Keyboard
               ========================= */}

      <div className="keyboard-workspace">
        <div
          className="keyboard-panel"
          ref={panelRef}
        >
          <div
            className="keyboard-layout-wrapper"
            style={{
              width: `${displayedWidth}px`,
              height: `${displayedHeight}px`,
            }}
          >
            <div
              className="keyboard-layout"
              style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                transform: `scale(${scale})`,
              }}
            >
              {renderedKeys.map(
                (key) => (
                  <div
                    key={key.index}
                    className={[
                      "keyboard-key",
                      key.isDeckKey
                        ? "deck-key"
                        : "",
                      !key.binding
                        ? "disabled"
                        : "",
                    ]
                      .filter(
                        Boolean
                      )
                      .join(
                        " "
                      )}
                    style={{
                      left: `${key.left}px`,
                      top: `${key.top}px`,
                      width: `${key.width}px`,
                      height: `${key.height}px`,
                      transform: `rotate(${key.rotation}deg)`,
                      transformOrigin:
                        key.transformOrigin,
                    }}
                    title={
                      key.isDeckKey
                        ? key.functionName
                          ? `Deck key ${key.deckKey}: ${key.functionName}`
                          : `Deck key ${key.deckKey}`
                        : key.binding
                    }
                  >
                    <BindingLabel
                      binding={
                        key.binding
                      }
                    />

                    {key.isDeckKey && (
                      <div className="deck-key-content">
                        {/* Future function icon */}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Keyboard;
