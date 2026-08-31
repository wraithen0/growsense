import type { Ref, RefCallback } from "react";

export interface GrowSenseDesignSourceMeta {
  nodeId: string;
  componentName?: string;
  sourceFile: string;
  sourceLine?: number;
  sourceColumn?: number;
  routeFile?: string;
  tagName?: string;
}

const designMetaByElement = new WeakMap<Element, GrowSenseDesignSourceMeta>();

function assignRef<T>(ref: Ref<T> | undefined | null, value: T | null) {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    ref(value);
    return;
  }

  try {
    (ref as { current: T | null }).current = value;
  } catch {
    // Some refs are intentionally immutable. Design instrumentation is a
    // preview-only helper and must never break the app's original ref behavior.
  }
}

export function registerGrowSenseDesignElement(
  element: Element | null,
  meta: GrowSenseDesignSourceMeta,
) {
  if (!element) {
    return;
  }

  designMetaByElement.set(element, {
    ...meta,
    tagName: meta.tagName ?? element.tagName.toLowerCase(),
  });
}

export function createGrowSenseDesignRef<T extends Element>(
  meta: GrowSenseDesignSourceMeta,
): RefCallback<T> {
  return (element) => registerGrowSenseDesignElement(element, meta);
}

export function composeGrowSenseDesignRefs<T extends Element>(
  ref: Ref<T> | undefined | null,
  designRef: RefCallback<T>,
): RefCallback<T> {
  return (element) => {
    assignRef(ref, element);
    designRef(element);
  };
}

export function getGrowSenseDesignMeta(element: Element) {
  return designMetaByElement.get(element);
}

export function findGrowSenseDesignElement(target: Element) {
  let current: Element | null = target;
  while (current && current !== document.documentElement && current !== document.body) {
    const meta = designMetaByElement.get(current);
    if (meta) {
      return { element: current, meta };
    }
    current = current.parentElement;
  }
  return null;
}
