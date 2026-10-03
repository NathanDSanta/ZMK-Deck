export function parseKeyboardLayout(jsonText) {
  const data = typeof jsonText === "string" ? JSON.parse(jsonText) : jsonText;

  const layout = data.layouts?.default_transform?.layout;

  if (!Array.isArray(layout)) {
    throw new Error(
      "Invalid keyboard JSON: layouts.default_transform.layout not found.",
    );
  }

  return {
    id: data.id,
    name: data.name,
    keys: layout.map((key, index) => ({
      ...key,
      index,
      width: key.w ?? 1,
      height: key.h ?? 1,
      rotation: key.r ?? 0,
    })),
    sensors: data.sensors ?? [],
  };
}

/*
 * Parse the bindings inside:
 *
 * bindings = <
 *     &kp Q
 *     &kp W
 *     &dk 1
 * >
 *
 * We group everything starting with '&' until the next '&'.
 */
function parseBindings(bindingText) {
  const tokens = bindingText
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/,/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const bindings = [];
  let current = [];

  for (const token of tokens) {
    if (token.startsWith("&")) {
      if (current.length > 0) {
        bindings.push(current.join(" "));
      }

      current = [token];
    } else {
      current.push(token);
    }
  }

  if (current.length > 0) {
    bindings.push(current.join(" "));
  }

  return bindings;
}

function findLayerBlocks(keymapText) {
  const keymapStart = keymapText.indexOf("keymap");

  if (keymapStart === -1) {
    throw new Error("No ZMK keymap block found.");
  }

  const source = keymapText.slice(keymapStart);

  const layers = [];

  /*
   * We don't simply use a regex for the whole block because
   * ZMK files can contain nested braces.
   */
  const layerRegex = /(?:^|\n)\s*([A-Za-z0-9_]+)\s*\{/g;

  let match;

  while ((match = layerRegex.exec(source)) !== null) {
    const name = match[1];

    if (name === "keymap" || name === "behaviors" || name === "combos") {
      continue;
    }

    const openingBrace = source.indexOf("{", match.index);

    let depth = 1;
    let position = openingBrace + 1;

    while (position < source.length && depth > 0) {
      if (source[position] === "{") {
        depth++;
      } else if (source[position] === "}") {
        depth--;
      }

      position++;
    }

    const body = source.slice(openingBrace + 1, position - 1);

    if (!body.includes("bindings")) {
      continue;
    }

    layers.push({
      name,
      body,
    });
  }

  return layers;
}

function parseLayer(layer) {
  const bindingMatch = layer.body.match(/bindings\s*=\s*<(.*?)>/s);

  if (!bindingMatch) {
    return {
      name: layer.name,
      bindings: [],
      label: layer.name,
    };
  }

  const bindings = parseBindings(bindingMatch[1]);

  const labelMatch = layer.body.match(/label\s*=\s*"([^"]+)"/);

  return {
    name: layer.name,
    label: labelMatch?.[1] ?? layer.name,
    bindings,
  };
}

function parseDeckKey(binding) {
  const match = binding.match(/^&(?:dk|deck_key)\s+(\d+)$/);

  if (!match) {
    return null;
  }

  return Number(match[1]);
}

export function parseKeymap(keymapText) {
  const layers = findLayerBlocks(keymapText).map(parseLayer);

  if (layers.length === 0) {
    throw new Error("No keymap layers found.");
  }

  return {
    layers: layers.map((layer) => ({
      ...layer,

      keys: layer.bindings.map((binding, index) => ({
        index,
        binding,
        deckKey: parseDeckKey(binding),
        available: parseDeckKey(binding) !== null,
      })),
    })),
  };
}

export function combineKeyboardData(layout, keymap) {
  return {
    ...layout,

    layers: keymap.layers.map((layer) => ({
      ...layer,

      keys: layer.keys.map((key) => ({
        ...layout.keys[key.index],
        ...key,
      })),
    })),
  };
}

export function getKeyTransform(key, scale = 1) {
  if (!key.r) {
    return {
      left: key.x * scale,
      top: key.y * scale,
      rotation: 0,
    };
  }

  const rx = key.rx ?? key.x;
  const ry = key.ry ?? key.y;

  const radians = (key.r * Math.PI) / 180;

  const dx = key.x - rx;
  const dy = key.y - ry;

  const rotatedX = rx + dx * Math.cos(radians) - dy * Math.sin(radians);

  const rotatedY = ry + dx * Math.sin(radians) + dy * Math.cos(radians);

  return {
    left: rotatedX * scale,
    top: rotatedY * scale,
    rotation: key.r,
  };
}
