import { CanvasContext } from "@luma.gl/core";

export type GeoJsonFeatureLike = {
  properties?: Record<string, unknown>;
};

export type GeoJsonFeatureCollection = {
  type: "FeatureCollection";
  features: GeoJsonFeatureLike[];
};

type TopologyPayload = {
  type: "Topology";
  objects: Record<string, unknown>;
};

type PatchedCanvasContextPrototype = {
  __liveGoalPatched?: boolean;
  _handleResize?: (entries: ResizeObserverEntry[]) => void;
  getMaxDrawingBufferSize: () => [number, number];
};

export const preferredWorldSources = ["/map/world_standard.json", "/world.json"];

export function normalizeCountryName(name: unknown): string {
  return typeof name === "string" ? name.trim() : "";
}

export function getGeoJsonCountryName(feature: GeoJsonFeatureLike | null | undefined) {
  const properties = feature?.properties ?? {};

  return (
    normalizeCountryName(properties.name) ||
    normalizeCountryName(properties.name_zh) ||
    normalizeCountryName(properties.NAME_ZH) ||
    normalizeCountryName(properties.NAME) ||
    normalizeCountryName(properties.admin) ||
    normalizeCountryName(properties.ADMIN) ||
    normalizeCountryName(properties.country) ||
    normalizeCountryName(properties.COUNTRY)
  );
}

function isFeatureCollection(payload: unknown): payload is GeoJsonFeatureCollection {
  return (
    typeof payload === "object" &&
    payload !== null &&
    (payload as { type?: unknown }).type === "FeatureCollection" &&
    Array.isArray((payload as { features?: unknown }).features)
  );
}

function isTopologyPayload(payload: unknown): payload is TopologyPayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    (payload as { type?: unknown }).type === "Topology" &&
    typeof (payload as { objects?: unknown }).objects === "object" &&
    (payload as { objects?: unknown }).objects !== null
  );
}

export async function normalizeWorldPayload(
  payload: unknown
): Promise<GeoJsonFeatureCollection | null> {
  if (isFeatureCollection(payload)) {
    return payload;
  }

  if (!isTopologyPayload(payload)) {
    return null;
  }

  const { feature } = await import("topojson-client");
  const topologyObjectEntries = Object.entries(payload.objects);
  const preferredEntry =
    topologyObjectEntries.find(([key]) =>
      ["land", "world", "countries", "country", "landmass"].some((token) =>
        key.toLowerCase().includes(token)
      )
    ) ?? topologyObjectEntries[0];

  if (!preferredEntry) {
    return null;
  }

  const converted = feature(payload as any, preferredEntry[1] as any) as {
    type?: string;
    features?: GeoJsonFeatureLike[];
  };

  if (converted.type === "FeatureCollection" && Array.isArray(converted.features)) {
    return converted as GeoJsonFeatureCollection;
  }

  return null;
}

export async function loadWorldGeoJson() {
  const failures: string[] = [];

  for (const source of preferredWorldSources) {
    try {
      const response = await fetch(source, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await normalizeWorldPayload(await response.json());

      if (!payload) {
        throw new Error("Not a supported GeoJSON or TopoJSON world dataset");
      }

      return { payload, source, error: null as string | null };
    } catch (error) {
      failures.push(`${source}: ${error instanceof Error ? error.message : "Unknown dataset error"}`);
    }
  }

  return {
    payload: null,
    source: null,
    error: failures.join(" | ")
  };
}

export function patchLumaResizeGuard() {
  const proto = CanvasContext.prototype as unknown as PatchedCanvasContextPrototype;

  if (proto.__liveGoalPatched) {
    return;
  }

  const originalGetMaxDrawingBufferSize = proto.getMaxDrawingBufferSize;
  const originalHandleResize = proto._handleResize;

  proto.getMaxDrawingBufferSize = function getMaxDrawingBufferSizeWithGuard() {
    const context = this as unknown as CanvasContext & {
      device?: { limits?: { maxTextureDimension2D?: number } };
      canvas?: { width?: number; height?: number };
    };
    const maxTextureDimension = context.device?.limits?.maxTextureDimension2D;

    if (!maxTextureDimension) {
      return [Math.max(1, context.canvas?.width ?? 1), Math.max(1, context.canvas?.height ?? 1)];
    }

    return originalGetMaxDrawingBufferSize.call(this);
  };

  if (originalHandleResize) {
    proto._handleResize = function handleResizeWithGuard(entries: ResizeObserverEntry[]) {
      const context = this as unknown as CanvasContext & { destroyed?: boolean; device?: unknown };

      if (context.destroyed || !context.device) {
        return;
      }

      originalHandleResize.call(this, entries);
    };
  }

  proto.__liveGoalPatched = true;
}
