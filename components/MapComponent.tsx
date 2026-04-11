"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { IntroPhase } from "@/components/IntroLanding";
import type { Match } from "@/data/mockData";
import { getFootballWorldCapitals } from "@/lib/football/national-geography";
import { type Locale, MAP_CONTROL_COPY } from "@/lib/i18n/ui";
import type { FootballTeam, GlobeHotNationalTeamConfig } from "@/lib/football/types";
import { getNationalFlagIcon } from "@/lib/teamBrand";

type MapComponentProps = {
  locale: Locale;
  selectedTeamId: string | null;
  onSelectTeam: (teamId: string) => void;
  visibleTeamIds?: string[];
  nationalTeams: FootballTeam[];
  nationalTeamMap: Record<string, FootballTeam>;
  nationalMatches: Match[];
  globeHotNationalTeams: GlobeHotNationalTeamConfig[];
  presentationPhase?: IntroPhase;
  onPresentationTargetChange?: (target: { x: number; y: number; size: number } | null) => void;
};

type FocusCameraFn = (latitude: number, longitude: number, distance?: number) => void;

type MarkerMeta = {
  group: THREE.Group;
  core: THREE.Sprite;
  halo: THREE.Mesh;
  ring: THREE.Mesh;
  hitArea: THREE.Mesh;
  teamId: string;
  phase: number;
  coreBaseScale: number;
  showInOverview: boolean;
  visibleAtOrBelowDistance: number;
};

type ArcMeta = {
  coreMaterial: THREE.MeshBasicMaterial;
  glowMaterial: THREE.MeshBasicMaterial;
  phase: number;
  intensity: number;
};

type GlobeLabelMeta = {
  sprite: THREE.Sprite;
  material: THREE.SpriteMaterial;
  kind: "country" | "city";
  priority: number;
  weight: number;
  baseScale: THREE.Vector3;
};

type GeoPosition = [number, number];

type GeoPolygonGeometry = {
  type: "Polygon";
  coordinates: GeoPosition[][];
};

type GeoMultiPolygonGeometry = {
  type: "MultiPolygon";
  coordinates: GeoPosition[][][];
};

type GeoMultiLineStringGeometry = {
  type: "MultiLineString";
  coordinates: GeoPosition[][];
};

type GeoFeature<TGeometry, TProperties> = {
  type: "Feature";
  geometry: TGeometry;
  properties: TProperties;
};

type GeoFeatureCollection<TGeometry, TProperties> = {
  type: "FeatureCollection";
  features: Array<GeoFeature<TGeometry, TProperties>>;
};

type RingMetrics = {
  area: number;
  centroidLng: number;
  centroidLat: number;
};

type ChinaBoundaryProperties = {
  type: string;
  id: string;
};

type ChinaFillProperties = {
  name: string;
  centroid?: GeoPosition;
  center?: GeoPosition;
};

type ChinaBoundaryCollection = GeoFeatureCollection<
  GeoMultiLineStringGeometry,
  ChinaBoundaryProperties
>;

type ChinaFillCollection = GeoFeatureCollection<
  GeoPolygonGeometry | GeoMultiPolygonGeometry,
  ChinaFillProperties
>;

type WorldProperties = {
  name: string;
  childNum?: number;
};

type WorldCollection = GeoFeatureCollection<
  GeoPolygonGeometry | GeoMultiPolygonGeometry,
  WorldProperties
>;

type ThreeState = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  markers: MarkerMeta[];
  arcs: ArcMeta[];
  arcGroup: THREE.Group;
};

const GLOBE_RADIUS = 1.54;
const DEFAULT_CAMERA_DISTANCE = 10.2;
const TEAM_FOCUS_DISTANCE = 7.2;
const GLOBE_CENTER = new THREE.Vector3(0, 0.08, 0);
const PRIMARY_BORDER_COLOR = "rgba(255, 255, 255, 0.84)";
const PRIMARY_BORDER_GLOW = "rgba(255, 255, 255, 0.38)";
const COUNTRY_LABEL_PRIORITY = new Set([
  "England",
  "Scotland",
  "Wales",
  "Northern Ireland",
  "Ireland",
  "France",
  "Spain",
  "Germany",
  "Italy",
  "Netherlands",
  "Belgium",
  "Portugal",
  "Switzerland",
  "Austria",
  "Denmark",
  "Poland",
  "Czech Rep.",
  "Croatia",
  "Greece",
  "Turkey",
  "Ukraine",
  "China",
  "Japan",
  "India",
  "Saudi Arabia",
  "Brazil",
  "Argentina",
  "United States",
  "Mexico",
  "Canada",
  "Australia"
]);
const COUNTRY_LABEL_OVERRIDES: Record<string, { lng: number; lat: number }> = {
  "United States": { lng: -98, lat: 39 },
  Brazil: { lng: -52, lat: -10 },
  Argentina: { lng: -64.2, lat: -34.2 },
  Canada: { lng: -101, lat: 57 },
  Mexico: { lng: -102.5, lat: 23.8 },
  Ireland: { lng: -8.2, lat: 53.3 },
  Russia: { lng: 100, lat: 61 },
  England: { lng: -1.8, lat: 52.8 },
  Scotland: { lng: -4.1, lat: 56.7 },
  Wales: { lng: -3.6, lat: 52.2 },
  "Northern Ireland": { lng: -6.6, lat: 54.8 },
  France: { lng: 2.5, lat: 46.4 },
  Spain: { lng: -3.7, lat: 40.2 },
  Portugal: { lng: -8, lat: 39.6 },
  Germany: { lng: 10.4, lat: 51.1 },
  Italy: { lng: 12.6, lat: 42.8 },
  Netherlands: { lng: 5.4, lat: 52.2 },
  Belgium: { lng: 4.6, lat: 50.8 },
  Switzerland: { lng: 8.1, lat: 46.8 },
  Austria: { lng: 14.2, lat: 47.6 },
  Denmark: { lng: 10, lat: 56.2 },
  Sweden: { lng: 15.2, lat: 62.2 },
  Poland: { lng: 19.2, lat: 52.1 },
  "Czech Rep.": { lng: 15.4, lat: 49.8 },
  Croatia: { lng: 16.5, lat: 45.4 },
  Hungary: { lng: 19.3, lat: 47.2 },
  Romania: { lng: 24.9, lat: 45.8 },
  Greece: { lng: 22.9, lat: 39.1 },
  Serbia: { lng: 20.8, lat: 44 },
  Ukraine: { lng: 31.2, lat: 49 },
  Turkey: { lng: 35.1, lat: 39.1 },
  China: { lng: 103.8, lat: 35.8 },
  India: { lng: 78.6, lat: 22.8 },
  Japan: { lng: 138, lat: 37.4 },
  Australia: { lng: 134.2, lat: -25.7 },
  Indonesia: { lng: 117.2, lat: -2.4 },
  "New Zealand": { lng: 172.5, lat: -41.2 },
  Mongolia: { lng: 103.8, lat: 46.9 },
  Kazakhstan: { lng: 67.9, lat: 48.2 },
  Iran: { lng: 53.7, lat: 32.1 },
  "Saudi Arabia": { lng: 44.6, lat: 23.9 },
  Norway: { lng: 10.1, lat: 62.8 },
  Greenland: { lng: -41.5, lat: 74.2 },
  Algeria: { lng: 2.8, lat: 28.3 },
  "South Africa": { lng: 24.2, lat: -29 },
  "Dem. Rep. Congo": { lng: 23.7, lat: -2.9 },
  Fiji: { lng: 178.1, lat: -17.8 }
};
const INITIAL_FOCUS = {
  latitude: 48,
  longitude: 0,
  distance: DEFAULT_CAMERA_DISTANCE
};
const INTRO_FOCUS = {
  latitude: 48,
  longitude: 0,
  distance: 14
};
const DEFAULT_AUTO_ROTATE_SPEED = 0.9;
const INTRO_SPIN_START_SPEED = 22;
const INTRO_SPIN_DECEL_DURATION = 5.2;
const REVEAL_FADE_DURATION = 1.08;

type WorldCapitalEntry = ReturnType<typeof getFootballWorldCapitals>[number];
const FOOTBALL_WORLD_CAPITALS = getFootballWorldCapitals();

function hexToColor(hex: string) {
  return new THREE.Color(hex);
}

function latLngToVector3(latitude: number, longitude: number, radius: number) {
  const phi = THREE.MathUtils.degToRad(90 - latitude);
  const theta = THREE.MathUtils.degToRad(longitude + 180);

  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function getFocusedCameraPosition(latitude: number, longitude: number, distance: number) {
  return latLngToVector3(latitude, longitude, distance).add(GLOBE_CENTER.clone());
}

function interpolateUnitVectors(start: THREE.Vector3, end: THREE.Vector3, t: number) {
  const startDirection = start.clone().normalize();
  const endDirection = end.clone().normalize();
  const dot = THREE.MathUtils.clamp(startDirection.dot(endDirection), -1, 1);
  const angle = Math.acos(dot);

  if (angle < 1e-5) {
    return startDirection;
  }

  const sinAngle = Math.sin(angle);

  if (Math.abs(sinAngle) < 1e-5) {
    const fallbackAxis = new THREE.Vector3(0, 1, 0);
    const axis = startDirection.clone().cross(fallbackAxis).normalize();

    if (axis.lengthSq() < 1e-5) {
      axis.set(1, 0, 0);
    }

    return startDirection
      .clone()
      .applyAxisAngle(axis, Math.PI * t)
      .normalize();
  }

  const startWeight = Math.sin((1 - t) * angle) / sinAngle;
  const endWeight = Math.sin(t * angle) / sinAngle;

  return startDirection
    .clone()
    .multiplyScalar(startWeight)
    .add(endDirection.clone().multiplyScalar(endWeight))
    .normalize();
}

function createOrbitalArcCurve(
  start: THREE.Vector3,
  end: THREE.Vector3,
  intensity: number
) {
  const startDirection = start.clone().normalize();
  const endDirection = end.clone().normalize();
  const angularDistance = Math.acos(
    THREE.MathUtils.clamp(startDirection.dot(endDirection), -1, 1)
  );
  const segments = Math.max(72, Math.round(72 + (angularDistance / Math.PI) * 56));
  const baseRadius = GLOBE_RADIUS * 1.028;
  const arcLift = THREE.MathUtils.lerp(0.22, 0.82, angularDistance / Math.PI) + intensity * 0.16;
  const points: THREE.Vector3[] = [];

  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;
    const direction = interpolateUnitVectors(startDirection, endDirection, t);
    const radius = baseRadius + Math.sin(Math.PI * t) * arcLift;
    points.push(direction.multiplyScalar(radius));
  }

  return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
}

function createAtmosphereShell(radius: number) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius, 64, 64),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      uniforms: {
        glowColor: { value: new THREE.Color("#dffcf6") }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          float rim = 1.0 - max(dot(normalize(vNormal), normalize(vViewPosition)), 0.0);
          float intensity = pow(rim, 2.8);
          gl_FragColor = vec4(glowColor, intensity * 0.54);
        }
      `
    })
  );
}

function createGridGroup(radius: number) {
  const group = new THREE.Group();
  const faintMaterial = new THREE.LineBasicMaterial({
    color: "#5c6d73",
    transparent: true,
    opacity: 0.24
  });
  const accentMaterial = new THREE.LineBasicMaterial({
    color: "#d8fffa",
    transparent: true,
    opacity: 0.32
  });

  for (let latitude = -60; latitude <= 60; latitude += 30) {
    const points: THREE.Vector3[] = [];

    for (let longitude = -180; longitude <= 180; longitude += 4) {
      points.push(latLngToVector3(latitude, longitude, radius));
    }

    group.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        latitude === 0 ? accentMaterial : faintMaterial
      )
    );
  }

  for (let longitude = -150; longitude <= 180; longitude += 30) {
    const points: THREE.Vector3[] = [];

    for (let latitude = -90; latitude <= 90; latitude += 3) {
      points.push(latLngToVector3(latitude, longitude, radius));
    }

    group.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        longitude === 0 ? accentMaterial : faintMaterial
      )
    );
  }

  return group;
}

function projectGeoPoint(longitude: number, latitude: number, width: number, height: number) {
  return {
    x: ((longitude + 180) / 360) * width,
    y: ((90 - latitude) / 180) * height
  };
}

function traceGeoPath(
  context: CanvasRenderingContext2D,
  coordinates: GeoPosition[],
  width: number,
  height: number,
  closePath: boolean
) {
  let previousX: number | null = null;

  coordinates.forEach(([longitude, latitude], index) => {
    const { x, y } = projectGeoPoint(longitude, latitude, width, height);
    const hasWrap = previousX !== null && Math.abs(x - previousX) > width * 0.5;

    if (index === 0 || hasWrap) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }

    previousX = x;
  });

  if (closePath) {
    context.closePath();
  }
}

function walkCoordinates(
  geometry: GeoPolygonGeometry | GeoMultiPolygonGeometry,
  visitor: (longitude: number, latitude: number) => void
) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;

  polygons.forEach((polygon) => {
    polygon.forEach((ring) => {
      ring.forEach(([longitude, latitude]) => visitor(longitude, latitude));
    });
  });
}

function getRingMetrics(ring: GeoPosition[]): RingMetrics {
  let areaAccumulator = 0;
  let centroidXAccumulator = 0;
  let centroidYAccumulator = 0;

  for (let index = 0; index < ring.length - 1; index += 1) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[index + 1];
    const cross = x1 * y2 - x2 * y1;

    areaAccumulator += cross;
    centroidXAccumulator += (x1 + x2) * cross;
    centroidYAccumulator += (y1 + y2) * cross;
  }

  const signedArea = areaAccumulator / 2;

  if (Math.abs(signedArea) < 1e-7) {
    const longitudeTotal = ring.reduce((sum, [longitude]) => sum + longitude, 0);
    const latitudeTotal = ring.reduce((sum, [, latitude]) => sum + latitude, 0);
    const count = Math.max(ring.length, 1);

    return {
      area: 0,
      centroidLng: longitudeTotal / count,
      centroidLat: latitudeTotal / count
    };
  }

  return {
    area: Math.abs(signedArea),
    centroidLng: centroidXAccumulator / (6 * signedArea),
    centroidLat: centroidYAccumulator / (6 * signedArea)
  };
}

function getPrimaryPolygonCentroid(
  geometry: GeoPolygonGeometry | GeoMultiPolygonGeometry
): RingMetrics | null {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  let bestMetrics: RingMetrics | null = null;

  polygons.forEach((polygon) => {
    const outerRing = polygon[0];

    if (!outerRing?.length) {
      return;
    }

    const metrics = getRingMetrics(outerRing);

    if (!bestMetrics || metrics.area > bestMetrics.area) {
      bestMetrics = metrics;
    }
  });

  return bestMetrics;
}

function createCountryAnchorData(worldData: WorldCollection) {
  return worldData.features
    .map((feature) => {
      if (!feature.properties.name) {
        return null;
      }

      let minLng = Infinity;
      let maxLng = -Infinity;
      let minLat = Infinity;
      let maxLat = -Infinity;

      walkCoordinates(feature.geometry, (longitude, latitude) => {
        minLng = Math.min(minLng, longitude);
        maxLng = Math.max(maxLng, longitude);
        minLat = Math.min(minLat, latitude);
        maxLat = Math.max(maxLat, latitude);
      });

      const override = COUNTRY_LABEL_OVERRIDES[feature.properties.name];
      const primaryCentroid = getPrimaryPolygonCentroid(feature.geometry);

      return {
        name: feature.properties.name,
        lng: override?.lng ?? primaryCentroid?.centroidLng ?? (minLng + maxLng) / 2,
        lat: override?.lat ?? primaryCentroid?.centroidLat ?? (minLat + maxLat) / 2,
        roughArea: (maxLng - minLng) * (maxLat - minLat),
        priority: COUNTRY_LABEL_PRIORITY.has(feature.properties.name) ? 1 : 2
      };
    })
    .filter(
      (
        item
      ): item is {
        name: string;
        lng: number;
        lat: number;
        roughArea: number;
        priority: number;
      } => Boolean(item)
    );
}

function createGlobeLabelSprite(kind: "country" | "city", text: string) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    const fallbackMaterial = new THREE.SpriteMaterial({ color: "#ffffff" });
    return { sprite: new THREE.Sprite(fallbackMaterial), material: fallbackMaterial };
  }

  const fontSize = kind === "country" ? 28 : 22;
  const paddingX = kind === "country" ? 20 : 14;
  const paddingY = kind === "country" ? 11 : 9;
  const fontWeight = kind === "country" ? 600 : 400;
  const letterSpacing = kind === "country" ? 4 : 2;
  const dpi = 2;

  context.font = `${fontWeight} ${fontSize}px ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace`;
  const measuredWidth = Math.ceil(context.measureText(text).width + paddingX * 2 + text.length * letterSpacing);
  const measuredHeight = fontSize + paddingY * 2;

  canvas.width = measuredWidth * dpi;
  canvas.height = measuredHeight * dpi;
  context.scale(dpi, dpi);
  context.font = `${fontWeight} ${fontSize}px ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace`;
  context.textAlign = "center";
  context.textBaseline = "middle";

  if (kind === "city") {
    context.shadowColor = "rgba(118, 145, 154, 0.14)";
    context.shadowBlur = 8;
  }

  context.fillStyle = kind === "country" ? "rgba(245, 248, 250, 0.76)" : "rgba(182, 204, 210, 0.46)";
  context.fillText(text, measuredWidth / 2, measuredHeight / 2 + 1);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    opacity: 1
  });
  const sprite = new THREE.Sprite(material);
  const height = kind === "country" ? 0.096 : 0.076;
  const width = height * (measuredWidth / measuredHeight);

  sprite.scale.set(width, height, 1);
  sprite.renderOrder = 40;

  return { sprite, material };
}

function drawProvinceFillTexture(
  fillData: ChinaFillCollection,
  width: number,
  height: number
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  context.clearRect(0, 0, width, height);
  context.lineJoin = "round";
  context.lineCap = "round";

  fillData.features.forEach((feature) => {
    const polygons =
      feature.geometry.type === "Polygon"
        ? [feature.geometry.coordinates]
        : feature.geometry.coordinates;

    context.save();
    context.beginPath();

    polygons.forEach((polygon) => {
      polygon.forEach((ring) => {
        traceGeoPath(context, ring, width, height, true);
      });
    });

    context.fillStyle = "rgba(226, 255, 249, 0.024)";
    context.fill("evenodd");
    context.restore();
  });

  return canvas;
}

function drawBoundaryTexture(
  boundaryData: ChinaBoundaryCollection,
  width: number,
  height: number
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  const boundaryStyles: Record<string, { color: string; width: number; glow: number }> = {
    国界: { color: PRIMARY_BORDER_COLOR, width: 1.28, glow: 10 },
    争议: { color: "rgba(236, 247, 244, 0.48)", width: 1.08, glow: 7 },
    港澳: { color: "rgba(236, 247, 244, 0.48)", width: 1.08, glow: 7 },
    海洋: { color: "rgba(236, 247, 244, 0.3)", width: 0.92, glow: 5 }
  };

  context.clearRect(0, 0, width, height);
  context.lineJoin = "round";
  context.lineCap = "round";

  boundaryData.features.forEach((feature) => {
    if (feature.properties.type === "省界") {
      return;
    }

    const style = boundaryStyles[feature.properties.type] ?? boundaryStyles.国界;

    context.save();
    context.beginPath();

    feature.geometry.coordinates.forEach((segment) => {
      traceGeoPath(context, segment, width, height, false);
    });

    context.strokeStyle = style.color;
    context.lineWidth = style.width + 1.15;
    context.shadowBlur = style.glow;
    context.shadowColor = PRIMARY_BORDER_GLOW;
    context.globalAlpha = 0.28;
    context.stroke();

    context.shadowBlur = 0;
    context.globalAlpha = 1;
    context.strokeStyle = style.color;
    context.lineWidth = style.width;
    context.stroke();
    context.restore();
  });

  return canvas;
}

function drawWorldBoundaryTexture(worldData: WorldCollection, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  context.clearRect(0, 0, width, height);
  context.lineJoin = "round";
  context.lineCap = "round";

  worldData.features.forEach((feature) => {
    if (feature.properties.name === "China") {
      return;
    }

    const polygons =
      feature.geometry.type === "Polygon"
        ? [feature.geometry.coordinates]
        : feature.geometry.coordinates;

    context.save();
    context.beginPath();

    polygons.forEach((polygon) => {
      polygon.forEach((ring, ringIndex) => {
        if (ringIndex === 0) {
          traceGeoPath(context, ring, width, height, true);
        }
      });
    });

    context.strokeStyle = PRIMARY_BORDER_COLOR;
    context.lineWidth = 1.18;
    context.shadowBlur = 10;
    context.shadowColor = PRIMARY_BORDER_GLOW;
    context.globalAlpha = 0.28;
    context.stroke();

    context.shadowBlur = 0;
    context.globalAlpha = 1;
    context.strokeStyle = PRIMARY_BORDER_COLOR;
    context.lineWidth = 0.8;
    context.stroke();
    context.restore();
  });

  return canvas;
}

function createCanvasTexture(canvas: HTMLCanvasElement, anisotropy: number) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  texture.needsUpdate = true;
  return texture;
}

function createChinaOverlayGroup(
  fillData: ChinaFillCollection,
  boundaryData: ChinaBoundaryCollection,
  anisotropy: number
) {
  const width = 4096;
  const height = 2048;
  const fillCanvas = drawProvinceFillTexture(fillData, width, height);
  const lineCanvas = drawBoundaryTexture(boundaryData, width, height);
  const group = new THREE.Group();

  if (!fillCanvas || !lineCanvas) {
    return group;
  }

  const fillTexture = createCanvasTexture(fillCanvas, anisotropy);
  const lineTexture = createCanvasTexture(lineCanvas, anisotropy);

  const fillShell = new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_RADIUS * 1.004, 96, 96),
    new THREE.MeshBasicMaterial({
      map: fillTexture,
      transparent: true,
      opacity: 0.66,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );

  const glowShell = new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_RADIUS * 1.007, 96, 96),
    new THREE.MeshBasicMaterial({
      map: lineTexture,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );

  const lineShell = new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_RADIUS * 1.0105, 96, 96),
    new THREE.MeshBasicMaterial({
      map: lineTexture,
      transparent: true,
      opacity: 0.86,
      depthWrite: false
    })
  );

  group.add(fillShell);
  group.add(glowShell);
  group.add(lineShell);

  return group;
}

function createWorldBoundaryGroup(worldData: WorldCollection, anisotropy: number) {
  const width = 4096;
  const height = 2048;
  const lineCanvas = drawWorldBoundaryTexture(worldData, width, height);
  const group = new THREE.Group();

  if (!lineCanvas) {
    return group;
  }

  const lineTexture = createCanvasTexture(lineCanvas, anisotropy);

  const glowShell = new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_RADIUS * 1.0055, 96, 96),
    new THREE.MeshBasicMaterial({
      map: lineTexture,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );

  const lineShell = new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_RADIUS * 1.0085, 96, 96),
    new THREE.MeshBasicMaterial({
      map: lineTexture,
      transparent: true,
      opacity: 0.86,
      depthWrite: false
    })
  );

  group.add(glowShell);
  group.add(lineShell);

  return group;
}

function createStarField(count: number, innerRadius: number, outerRadius: number) {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const distance = THREE.MathUtils.lerp(innerRadius, outerRadius, Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const vector = new THREE.Vector3().setFromSpherical(
      new THREE.Spherical(distance, phi, theta)
    );

    vertices[index * 3] = vector.x;
    vertices[index * 3 + 1] = vector.y;
    vertices[index * 3 + 2] = vector.z;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: "#f7ffff",
      size: 0.038,
      transparent: true,
      opacity: 0.82,
      sizeAttenuation: true,
      depthWrite: false
    })
  );
}

function createCircularFlagTexture(iconSrc: string, accent: string) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  if (!context) {
    return texture;
  }

  const paintBase = () => {
    context.clearRect(0, 0, size, size);
    context.save();
    context.beginPath();
    context.arc(size / 2, size / 2, size * 0.46, 0, Math.PI * 2);
    context.closePath();
    context.fillStyle = "rgba(255,255,255,0.96)";
    context.shadowColor = "rgba(0,0,0,0.35)";
    context.shadowBlur = 18;
    context.fill();
    context.restore();

    context.save();
    context.beginPath();
    context.arc(size / 2, size / 2, size * 0.37, 0, Math.PI * 2);
    context.closePath();
    context.fillStyle = "#0a1014";
    context.fill();
    context.restore();

    context.save();
    context.beginPath();
    context.arc(size / 2, size / 2, size * 0.44, 0, Math.PI * 2);
    context.closePath();
    context.strokeStyle = "rgba(255,255,255,0.28)";
    context.lineWidth = 7;
    context.stroke();
    context.restore();

    context.save();
    context.beginPath();
    context.arc(size / 2, size / 2, size * 0.31, 0, Math.PI * 2);
    context.closePath();
    context.fillStyle = accent;
    context.globalAlpha = 0.14;
    context.fill();
    context.restore();

    texture.needsUpdate = true;
  };

  paintBase();

  const image = new Image();
  image.crossOrigin = "anonymous";
  image.onload = () => {
    paintBase();
    context.save();
    context.beginPath();
    context.arc(size / 2, size / 2, size * 0.29, 0, Math.PI * 2);
    context.closePath();
    context.clip();
    const targetSize = size * 0.58;
    const sourceWidth = image.naturalWidth || image.width || targetSize;
    const sourceHeight = image.naturalHeight || image.height || targetSize;
    const scale = Math.max(targetSize / sourceWidth, targetSize / sourceHeight);
    const drawWidth = sourceWidth * scale;
    const drawHeight = sourceHeight * scale;
    const drawX = size / 2 - drawWidth / 2;
    const drawY = size / 2 - drawHeight / 2;
    context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    context.restore();

    context.save();
    context.beginPath();
    context.arc(size / 2, size / 2, size * 0.295, 0, Math.PI * 2);
    context.closePath();
    context.strokeStyle = "rgba(255,255,255,0.14)";
    context.lineWidth = 2.5;
    context.stroke();
    context.restore();

    texture.needsUpdate = true;
  };
  image.onerror = () => {
    paintBase();
  };
  image.src = iconSrc;

  return texture;
}

function createMarker(
  team: FootballTeam,
  latitude: number,
  longitude: number,
  phase: number,
  showInOverview: boolean,
  visibleAtOrBelowDistance: number
) {
  const group = new THREE.Group();
  const position = latLngToVector3(latitude, longitude, GLOBE_RADIUS * 1.016);
  const normal = position.clone().normalize();
  const accentColor = hexToColor(team.accent);

  group.position.copy(position);
  group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.056, 16, 16),
    new THREE.MeshBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0.13,
      depthWrite: false
    })
  );

  const markerTexture = createCircularFlagTexture(
    getNationalFlagIcon(
      team.id,
      team.shortName,
      team.accent,
      team.countryCode,
      team.countryFlagUrl
    ),
    team.accent
  );

  const core = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: markerTexture,
      transparent: true,
      opacity: 0.98,
      depthWrite: false
    })
  );
  const coreBaseScale = 0.116;
  core.scale.setScalar(coreBaseScale);
  core.position.z = 0.028;

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.061, 0.0035, 10, 48),
    new THREE.MeshBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0.24,
      depthWrite: false
    })
  );

  const hitArea = new THREE.Mesh(
    new THREE.SphereGeometry(0.082, 10, 10),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.001,
      depthWrite: false
    })
  );

  hitArea.userData.teamId = team.id;

  group.add(halo);
  group.add(core);
  group.add(ring);
  group.add(hitArea);

  return {
    group,
    core,
    halo,
    ring,
    hitArea,
    teamId: team.id,
    phase,
    coreBaseScale,
    showInOverview,
    visibleAtOrBelowDistance
  };
}

function disposeScene(root: THREE.Object3D) {
  root.traverse((object) => {
    const candidate = object as THREE.Mesh & {
      geometry?: THREE.BufferGeometry;
      material?: THREE.Material | THREE.Material[];
    };

    candidate.geometry?.dispose();

    if (Array.isArray(candidate.material)) {
      candidate.material.forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value instanceof THREE.Texture) {
            value.dispose();
          }
        });
        material.dispose();
      });
      return;
    }

    Object.values(candidate.material ?? {}).forEach((value) => {
      if (value instanceof THREE.Texture) {
        value.dispose();
      }
    });
    candidate.material?.dispose();
  });
}

export function MapComponent({
  locale,
  selectedTeamId,
  onSelectTeam,
  visibleTeamIds,
  nationalTeams,
  nationalTeamMap,
  nationalMatches,
  globeHotNationalTeams,
  presentationPhase = "revealed",
  onPresentationTargetChange
}: MapComponentProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const threeRef = useRef<ThreeState | null>(null);
  const onSelectTeamRef = useRef(onSelectTeam);
  const selectedTeamIdRef = useRef<string | null>(selectedTeamId);
  const hoveredTeamIdRef = useRef<string | null>(null);
  const focusCameraRef = useRef<FocusCameraFn>(() => undefined);
  const pendingCameraGoalRef = useRef<THREE.Vector3 | null>(null);
  const presentationPhaseRef = useRef<IntroPhase>(presentationPhase);
  const presentationTargetRef = useRef(onPresentationTargetChange);
  const lastPresentationTargetRef = useRef<{ x: number; y: number; size: number } | null>(null);
  const introSpinElapsedRef = useRef(0);
  const revealFadeElapsedRef = useRef(0);
  const autoSpinRef = useRef(true);
  const arcVisibilityRef = useRef(true);
  const [isAutoSpinEnabled, setIsAutoSpinEnabled] = useState(true);
  const [isArcVisible, setIsArcVisible] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const copy = MAP_CONTROL_COPY[locale];
  const visibleTeamIdSet = useMemo(
    () => new Set(visibleTeamIds ?? globeHotNationalTeams.map((team) => team.id)),
    [globeHotNationalTeams, visibleTeamIds]
  );

  onSelectTeamRef.current = onSelectTeam;
  selectedTeamIdRef.current = selectedTeamId;
  presentationPhaseRef.current = presentationPhase;
  presentationTargetRef.current = onPresentationTargetChange;
  autoSpinRef.current = isAutoSpinEnabled;
  arcVisibilityRef.current = isArcVisible;

  useEffect(() => {
    if (presentationPhase === "launching") {
      introSpinElapsedRef.current = 0;
      revealFadeElapsedRef.current = 0;
    }

    if (presentationPhase === "revealed") {
      revealFadeElapsedRef.current = 0;
    }

    if (presentationPhase === "idle") {
      introSpinElapsedRef.current = 0;
      revealFadeElapsedRef.current = 0;
    }
  }, [presentationPhase]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
      setRenderError(null);
    } catch (error) {
      setRenderError(error instanceof Error ? error.message : "WebGL renderer unavailable");
      return;
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    const root = new THREE.Group();
    const globeGroup = new THREE.Group();
    const worldBoundaryGroup = new THREE.Group();
    const chinaOverlayGroup = new THREE.Group();
    const arcGroup = new THREE.Group();
    const markerGroup = new THREE.Group();
    const markerHitAreas: THREE.Object3D[] = [];
    const markers: MarkerMeta[] = [];
    const markersByTeamId = new Map<string, MarkerMeta>();
    const arcs: ArcMeta[] = [];
    const globeLabels: GlobeLabelMeta[] = [];
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const pointerState = {
      active: false,
      moved: false,
      startX: 0,
      startY: 0
    };
    let animationFrame = 0;
    let disposed = false;

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor("#02050a", 0);
    container.appendChild(renderer.domElement);

    scene.add(root);
    root.add(createStarField(1800, 10, 22));
    root.add(globeGroup);
    globeGroup.position.copy(GLOBE_CENTER);

    scene.add(new THREE.AmbientLight("#d9f7ef", 0.52));

    const keyLight = new THREE.DirectionalLight("#f4fffd", 1.82);
    keyLight.position.set(4.2, 2.4, 5.6);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight("#88fff4", 1.62, 18, 2);
    rimLight.position.set(-5.8, -2.4, -3.2);
    scene.add(rimLight);

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS, 96, 96),
      new THREE.MeshStandardMaterial({
        color: "#071018",
        emissive: "#101920",
        emissiveIntensity: 1.02,
        metalness: 0.18,
        roughness: 0.88
      })
    );

    const innerShell = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS * 1.006, 64, 64),
      new THREE.MeshBasicMaterial({
        color: "#dffcf7",
        transparent: true,
        opacity: 0.052,
        depthWrite: false
      })
    );

    const auraRing = new THREE.Mesh(
      new THREE.TorusGeometry(GLOBE_RADIUS * 1.12, 0.004, 10, 220),
      new THREE.MeshBasicMaterial({
        color: "#bff7ed",
        transparent: true,
        opacity: 0.12,
        depthWrite: false
      })
    );
    auraRing.rotation.x = Math.PI * 0.72;
    auraRing.rotation.z = Math.PI * 0.15;

    globeGroup.add(globe);
    globeGroup.add(innerShell);
    globeGroup.add(createAtmosphereShell(GLOBE_RADIUS * 1.12));
    globeGroup.add(createGridGroup(GLOBE_RADIUS * 1.002));
    globeGroup.add(worldBoundaryGroup);
    globeGroup.add(chinaOverlayGroup);
    globeGroup.add(auraRing);
    globeGroup.add(arcGroup);
    globeGroup.add(markerGroup);
    arcGroup.visible = arcVisibilityRef.current;

    void (async () => {
      try {
        const [worldResponse, boundaryResponse, fillResponse] = await Promise.all([
          fetch("/world.json"),
          fetch("/map/china_boundary.json"),
          fetch("/map/china_fill.json")
        ]);

        if (!worldResponse.ok || !boundaryResponse.ok || !fillResponse.ok) {
          throw new Error("Map overlay data unavailable");
        }

        const [worldData, boundaryData, fillData] = (await Promise.all([
          worldResponse.json(),
          boundaryResponse.json(),
          fillResponse.json()
        ])) as [WorldCollection, ChinaBoundaryCollection, ChinaFillCollection];

        if (disposed) {
          return;
        }

        worldBoundaryGroup.add(
          createWorldBoundaryGroup(worldData, renderer.capabilities.getMaxAnisotropy())
        );
        chinaOverlayGroup.add(
          createChinaOverlayGroup(fillData, boundaryData, renderer.capabilities.getMaxAnisotropy())
        );

        createCountryAnchorData(worldData)
          .filter((item) => item.name !== "United Kingdom")
          .forEach((item) => {
          const { sprite, material } = createGlobeLabelSprite("country", item.name);
          const position = latLngToVector3(item.lat, item.lng, GLOBE_RADIUS * 1.045).add(
            GLOBE_CENTER.clone()
          );
          sprite.position.copy(position);
          root.add(sprite);
          globeLabels.push({
            sprite,
            material,
            kind: "country",
            priority: item.priority === 1 || item.roughArea > 90 ? 1 : 2,
            weight: item.priority === 1 ? 120 + Math.min(item.roughArea, 240) : Math.min(item.roughArea, 180),
            baseScale: sprite.scale.clone()
          });
        });

        [
          { name: "England", lng: -1.8, lat: 52.8, priority: 1, roughArea: 68 },
          { name: "Scotland", lng: -4.1, lat: 56.7, priority: 1, roughArea: 52 },
          { name: "Wales", lng: -3.6, lat: 52.2, priority: 1, roughArea: 34 },
          { name: "Northern Ireland", lng: -6.6, lat: 54.8, priority: 1, roughArea: 28 }
        ].forEach((item) => {
          const { sprite, material } = createGlobeLabelSprite("country", item.name);
          const position = latLngToVector3(item.lat, item.lng, GLOBE_RADIUS * 1.045).add(
            GLOBE_CENTER.clone()
          );
          sprite.position.copy(position);
          root.add(sprite);
          globeLabels.push({
            sprite,
            material,
            kind: "country",
            priority: 1,
            weight: 100 + item.roughArea,
            baseScale: sprite.scale.clone()
          });
        });

        FOOTBALL_WORLD_CAPITALS.forEach((entry) => {
          const { sprite, material } = createGlobeLabelSprite("city", entry.capital);
          const position = latLngToVector3(entry.lat, entry.lng, GLOBE_RADIUS * 1.06).add(
            GLOBE_CENTER.clone()
          );
          sprite.position.copy(position);
          root.add(sprite);
          globeLabels.push({
            sprite,
            material,
            kind: "city",
            priority: COUNTRY_LABEL_PRIORITY.has(entry.country) ? 1 : 2,
            weight: COUNTRY_LABEL_PRIORITY.has(entry.country) ? 76 : 44,
            baseScale: sprite.scale.clone()
          });
        });
      } catch (error) {
        console.warn("Failed to load map overlay data", error);
      }
    })();

    nationalTeams.forEach((team, index) => {
      const visibleAtOrBelowDistance =
        visibleTeamIdSet.has(team.id) || Boolean(team.showInGlobeOverview)
          ? team.visibleAtOrBelowDistance ?? 8.1
          : Math.min(team.visibleAtOrBelowDistance ?? 8.1, 5.02);
      const marker = createMarker(
        team,
        team.lat,
        team.lng,
        index * 0.65,
        visibleTeamIdSet.has(team.id) || Boolean(team.showInGlobeOverview),
        visibleAtOrBelowDistance
      );
      marker.group.userData.teamId = team.id;
      markerGroup.add(marker.group);
      markerHitAreas.push(marker.group.children[3] as THREE.Object3D);
      markers.push(marker);
      markersByTeamId.set(team.id, marker);
    });

    nationalMatches.filter(
      (match) => visibleTeamIdSet.has(match.homeTeamId) && visibleTeamIdSet.has(match.awayTeamId)
    ).forEach((match, index) => {
      const sourceTeam = nationalTeamMap[match.homeTeamId];
      const targetTeam = nationalTeamMap[match.awayTeamId];

      if (!sourceTeam || !targetTeam) {
        return;
      }

      const source = latLngToVector3(sourceTeam.lat, sourceTeam.lng, GLOBE_RADIUS * 1.028);
      const target = latLngToVector3(targetTeam.lat, targetTeam.lng, GLOBE_RADIUS * 1.028);
      const curve = createOrbitalArcCurve(source, target, match.intensity);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: hexToColor(sourceTeam.accent),
        transparent: true,
        opacity: 0.28,
        depthWrite: false
      });
      const coreMaterial = new THREE.MeshBasicMaterial({
        color: "#f8fffe",
        transparent: true,
        opacity: 0.92,
        depthWrite: false
      });

      arcGroup.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(curve, 144, 0.017 + match.intensity * 0.0035, 8, false),
          glowMaterial
        )
      );
      arcGroup.add(
        new THREE.Mesh(
          new THREE.TubeGeometry(curve, 144, 0.0052 + match.intensity * 0.0018, 8, false),
          coreMaterial
        )
      );

      arcs.push({
        coreMaterial,
        glowMaterial,
        phase: match.phase + index * 0.22,
        intensity: match.intensity
      });
    });

    const updateRendererSize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const initialFocus = presentationPhaseRef.current === "revealed" ? INITIAL_FOCUS : INTRO_FOCUS;

    camera.position.copy(
      getFocusedCameraPosition(initialFocus.latitude, initialFocus.longitude, initialFocus.distance)
    );

    focusCameraRef.current = (latitude, longitude, distance = DEFAULT_CAMERA_DISTANCE) => {
      pendingCameraGoalRef.current = getFocusedCameraPosition(latitude, longitude, distance);
    };

    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.68;
    controls.zoomSpeed = 0.88;
    controls.autoRotate = true;
    controls.autoRotateSpeed = DEFAULT_AUTO_ROTATE_SPEED;
    controls.minDistance = 4.8;
    controls.maxDistance = 14;
    controls.target.copy(GLOBE_CENTER);
    camera.lookAt(GLOBE_CENTER);
    controls.update();

    const resolveVisibleIntersectionTeamId = () => {
      const cameraDistance = camera.position.distanceTo(GLOBE_CENTER);
      const intersections = raycaster.intersectObjects(markerHitAreas, false);

      for (const intersection of intersections) {
        const teamId = intersection.object.userData.teamId;

        if (typeof teamId !== "string") {
          continue;
        }

        const marker = markersByTeamId.get(teamId);

        if (!marker) {
          continue;
        }

        const isVisible =
          marker.showInOverview ||
          cameraDistance <= marker.visibleAtOrBelowDistance ||
          teamId === selectedTeamIdRef.current;

        if (isVisible && marker.group.visible && marker.hitArea.visible) {
          return teamId;
        }
      }

      return null;
    };

    const handlePointerDown = (event: PointerEvent) => {
      pointerState.active = true;
      pointerState.moved = false;
      pointerState.startX = event.clientX;
      pointerState.startY = event.clientY;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (
        pointerState.active &&
        Math.hypot(event.clientX - pointerState.startX, event.clientY - pointerState.startY) > 5
      ) {
        pointerState.moved = true;
      }

      const rect = renderer.domElement.getBoundingClientRect();

      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hoveredTeamId = resolveVisibleIntersectionTeamId();
      hoveredTeamIdRef.current = hoveredTeamId;
      renderer.domElement.style.cursor = hoveredTeamId ? "pointer" : "grab";
    };

    const handlePointerUp = () => {
      pointerState.active = false;
    };

    const handleClick = (event: MouseEvent) => {
      if (pointerState.moved) {
        pointerState.moved = false;
        return;
      }

      const rect = renderer.domElement.getBoundingClientRect();

      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const teamId = resolveVisibleIntersectionTeamId();

      if (typeof teamId === "string") {
        onSelectTeamRef.current(teamId);
      }
    };

    const handleControlStart = () => {
      pendingCameraGoalRef.current = null;
      renderer.domElement.style.cursor = "grabbing";
    };

    const handleControlEnd = () => {
      renderer.domElement.style.cursor = "grab";
    };

    const handlePointerLeave = () => {
      hoveredTeamIdRef.current = null;
      renderer.domElement.style.cursor = "grab";
    };

    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);
    renderer.domElement.addEventListener("pointerleave", handlePointerLeave);
    renderer.domElement.addEventListener("click", handleClick);
    controls.addEventListener("start", handleControlStart);
    controls.addEventListener("end", handleControlEnd);
    renderer.domElement.style.cursor = "grab";

    updateRendererSize();
    window.addEventListener("resize", updateRendererSize);

    const clock = new THREE.Clock();

    const animate = () => {
      animationFrame = window.requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.elapsedTime;
      const cameraGoal = pendingCameraGoalRef.current;
      const isPresentationReady = presentationPhaseRef.current === "revealed";
      const isRevealing = presentationPhaseRef.current === "revealed";
      const isPresentationActive =
        presentationPhaseRef.current === "launching" || presentationPhaseRef.current === "revealed";

      if (isPresentationActive && introSpinElapsedRef.current < INTRO_SPIN_DECEL_DURATION) {
        introSpinElapsedRef.current = Math.min(
          INTRO_SPIN_DECEL_DURATION,
          introSpinElapsedRef.current + delta
        );
      }

      if (isRevealing) {
        revealFadeElapsedRef.current += delta;
      }

      const introSpinProgress = THREE.MathUtils.clamp(
        introSpinElapsedRef.current / INTRO_SPIN_DECEL_DURATION,
        0,
        1
      );
      const revealProgress = THREE.MathUtils.clamp(
        revealFadeElapsedRef.current / REVEAL_FADE_DURATION,
        0,
        1
      );
      const easedRevealProgress = 1 - (1 - revealProgress) ** 3;
      const easedSpinProgress = 1 - (1 - introSpinProgress) ** 2.35;
      const introAutoRotateSpeed = THREE.MathUtils.lerp(
        INTRO_SPIN_START_SPEED,
        DEFAULT_AUTO_ROTATE_SPEED,
        easedSpinProgress
      );

      controls.autoRotate = isPresentationActive && autoSpinRef.current && !cameraGoal;
      controls.autoRotateSpeed = introAutoRotateSpeed;
      controls.enabled = isPresentationReady;
      markerGroup.visible = isPresentationReady || revealProgress > 0.01;
      arcGroup.visible = (isPresentationReady || revealProgress > 0.01) && arcVisibilityRef.current;

      if (cameraGoal) {
        camera.position.lerp(cameraGoal, 0.055);

        if (camera.position.distanceTo(cameraGoal) < 0.03) {
          camera.position.copy(cameraGoal);
          pendingCameraGoalRef.current = null;
        }
      }

      const cameraDirection = camera.position.clone().sub(GLOBE_CENTER).normalize();
      const cameraDistance = camera.position.distanceTo(GLOBE_CENTER);

      markers.forEach((marker) => {
        const isSelected = marker.teamId === selectedTeamIdRef.current;
        const isHovered = marker.teamId === hoveredTeamIdRef.current;
        const isVisible = marker.showInOverview || cameraDistance <= marker.visibleAtOrBelowDistance || isSelected;
        const pulse = 0.5 + Math.sin(elapsed * 2.2 + marker.phase) * 0.5;
        const markerScale = isSelected
          ? 1.18 + pulse * 0.12
          : isHovered
            ? 1.02 + pulse * 0.05
            : 0.9 + pulse * 0.04;
        const haloOpacity = isSelected ? 0.22 + pulse * 0.1 : 0.08 + pulse * 0.05;
        const ringOpacity = isSelected ? 0.42 + pulse * 0.16 : 0.18 + pulse * 0.08;
        const coreScale = isHovered ? marker.coreBaseScale * 1.28 : marker.coreBaseScale;

        marker.group.visible = isVisible;
        marker.hitArea.visible = isVisible;

        if (!isVisible) {
          return;
        }

        marker.group.scale.setScalar(THREE.MathUtils.lerp(0.78, markerScale, easedRevealProgress));
        marker.core.scale.setScalar(coreScale);
        (marker.halo.material as THREE.MeshBasicMaterial).opacity = haloOpacity * easedRevealProgress;
        (marker.ring.material as THREE.MeshBasicMaterial).opacity = ringOpacity * easedRevealProgress;
        (marker.core.material as THREE.SpriteMaterial).opacity =
          (isSelected ? 1 : 0.94) * easedRevealProgress;
      });

      if (isPresentationReady || revealProgress > 0.01) {
        arcs.forEach((arc) => {
          const pulse = 0.5 + Math.sin(elapsed * 1.8 + arc.phase) * 0.5;
          arc.coreMaterial.opacity =
            (0.78 + pulse * (0.24 + arc.intensity * 0.16)) * easedRevealProgress;
          arc.glowMaterial.opacity =
            (0.18 + pulse * (0.16 + arc.intensity * 0.1)) * easedRevealProgress;
        });
      }
      const countryPriorityLimit =
        cameraDistance >= 9.2 ? 1 : cameraDistance >= 7.8 ? 2 : cameraDistance >= 6.15 ? 2 : 1;
      const cityPriorityLimit =
        cameraDistance >= 7.55 ? 0 : cameraDistance >= 6.85 ? 1 : cameraDistance >= 6.1 ? 2 : 3;
      const maxCountryLabels =
        cameraDistance >= 9.2 ? 14 : cameraDistance >= 7.8 ? 22 : cameraDistance >= 6.15 ? 16 : 8;
      const maxCityLabels =
        cameraDistance >= 6.85 ? 8 : cameraDistance >= 6.1 ? 16 : cameraDistance >= 5.4 ? 24 : 34;
      const globeCenterScreen = GLOBE_CENTER.clone().project(camera);
      const cameraToCenter = GLOBE_CENTER.clone().sub(camera.position).normalize();
      const horizontalAxis = new THREE.Vector3()
        .crossVectors(camera.up, cameraToCenter)
        .normalize()
        .multiplyScalar(GLOBE_RADIUS * 1.04);
      const globeEdgeScreen = GLOBE_CENTER.clone().add(horizontalAxis).project(camera);
      const rect = renderer.domElement.getBoundingClientRect();
      const globeCenterPx = {
        x: ((globeCenterScreen.x + 1) * 0.5) * rect.width,
        y: ((1 - globeCenterScreen.y) * 0.5) * rect.height
      };
      const globeEdgePx = {
        x: ((globeEdgeScreen.x + 1) * 0.5) * rect.width,
        y: ((1 - globeEdgeScreen.y) * 0.5) * rect.height
      };
      const globeRadiusPx = Math.hypot(
        globeEdgePx.x - globeCenterPx.x,
        globeEdgePx.y - globeCenterPx.y
      );
      const globeRadiusInNdc = Math.sqrt(
        (globeEdgeScreen.x - globeCenterScreen.x) ** 2 +
          (globeEdgeScreen.y - globeCenterScreen.y) ** 2
      );
      const countryCandidates: Array<{ label: GlobeLabelMeta; score: number }> = [];
      const cityCandidates: Array<{ label: GlobeLabelMeta; score: number }> = [];

      globeLabels.forEach((label) => {
        const worldPosition = label.sprite.position.clone();
        const normal = worldPosition.clone().sub(GLOBE_CENTER).normalize();
        const facingStrength = normal.dot(cameraDirection);
        const projected = worldPosition.clone().project(camera);
        const distanceFromGlobeCenter = Math.sqrt(
          (projected.x - globeCenterScreen.x) ** 2 + (projected.y - globeCenterScreen.y) ** 2
        );
        const insideGlobeSilhouette = distanceFromGlobeCenter <= globeRadiusInNdc * 0.95;
        const isInClipSpace =
          projected.z >= -1 &&
          projected.z <= 1 &&
          projected.x >= -1.2 &&
          projected.x <= 1.2 &&
          projected.y >= -1.2 &&
          projected.y <= 1.2;
        const isCandidate =
          isInClipSpace &&
          insideGlobeSilhouette &&
          facingStrength > (label.kind === "country" ? (label.priority === 1 ? 0.18 : 0.28) : label.priority === 1 ? 0.24 : 0.34);
        const scaleFactor =
          label.kind === "country"
            ? THREE.MathUtils.clamp(cameraDistance / DEFAULT_CAMERA_DISTANCE, 0.72, 0.98)
            : THREE.MathUtils.clamp(cameraDistance / TEAM_FOCUS_DISTANCE, 0.58, 0.9);

        label.sprite.scale.copy(label.baseScale).multiplyScalar(scaleFactor);
        label.sprite.visible = false;
        label.material.opacity = 0;

        if (!isCandidate) {
          return;
        }

        const score = label.weight * 10 + facingStrength * 40 - distanceFromGlobeCenter * 12;

        if (label.kind === "country") {
          if (label.priority > countryPriorityLimit) {
            return;
          }

          countryCandidates.push({ label, score });
          return;
        }

        if (cityPriorityLimit === 0 || label.priority > cityPriorityLimit) {
          return;
        }

        cityCandidates.push({ label, score });
      });

      if (isPresentationReady) {
        countryCandidates
          .sort((left, right) => right.score - left.score)
          .slice(0, maxCountryLabels)
          .forEach(({ label }) => {
            label.sprite.visible = true;
            label.material.opacity =
              (cameraDistance >= 9.2 ? 0.62 : cameraDistance >= 7.8 ? 0.52 : 0.34) *
              easedRevealProgress;
          });

        cityCandidates
          .sort((left, right) => right.score - left.score)
          .slice(0, maxCityLabels)
          .forEach(({ label }) => {
            label.sprite.visible = true;
            label.material.opacity =
              (cameraDistance >= 6.85 ? 0.36 : cameraDistance >= 6.1 ? 0.44 : 0.52) *
              easedRevealProgress;
          });
      }

      if (presentationPhaseRef.current !== "revealed" && presentationTargetRef.current) {
        const nextTarget = {
          x: rect.left + globeCenterPx.x,
          y: rect.top + globeCenterPx.y,
          size: globeRadiusPx * 2
        };
        const previousTarget = lastPresentationTargetRef.current;

        if (
          !previousTarget ||
          Math.abs(previousTarget.x - nextTarget.x) > 1 ||
          Math.abs(previousTarget.y - nextTarget.y) > 1 ||
          Math.abs(previousTarget.size - nextTarget.size) > 1
        ) {
          lastPresentationTargetRef.current = nextTarget;
          presentationTargetRef.current(nextTarget);
        }
      }

      auraRing.rotation.z += 0.0012;
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    threeRef.current = {
      renderer,
      scene,
      camera,
      controls,
      markers,
      arcs,
      arcGroup
    };

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", updateRendererSize);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener("pointerleave", handlePointerLeave);
      renderer.domElement.removeEventListener("click", handleClick);
      controls.removeEventListener("start", handleControlStart);
      controls.removeEventListener("end", handleControlEnd);
      controls.dispose();
      disposeScene(scene);
      renderer.dispose();
      renderer.domElement.remove();
      threeRef.current = null;
    };
  }, [globeHotNationalTeams, nationalMatches, nationalTeamMap, nationalTeams, visibleTeamIdSet]);

  useEffect(() => {
    if (!threeRef.current) {
      return;
    }

    threeRef.current.arcGroup.visible = isArcVisible && presentationPhase === "revealed";
  }, [isArcVisible, presentationPhase]);

  useEffect(() => {
    if (!selectedTeamId) {
      pendingCameraGoalRef.current = null;
      return;
    }

    const team = nationalTeamMap[selectedTeamId];

    if (!team) {
      return;
    }

    focusCameraRef.current(team.lat, team.lng, TEAM_FOCUS_DISTANCE);
  }, [nationalTeamMap, selectedTeamId]);

  const handleResetView = () => {
    focusCameraRef.current(INITIAL_FOCUS.latitude, INITIAL_FOCUS.longitude, INITIAL_FOCUS.distance);
  };

  return (
    <div className="relative h-screen min-h-screen w-full overflow-hidden bg-[#02050a]">
      <div
        className="absolute inset-0 h-full w-full"
        style={{ transform: "translate(-49%, -50%)" }}
      >
        <div ref={containerRef} className="absolute inset-0 h-full w-full" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(225,255,248,0.16),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(112,255,225,0.08),transparent_22%),linear-gradient(180deg,rgba(1,3,8,0.08),rgba(1,3,8,0.46))]" />

      {presentationPhase === "revealed" ? (
        <div className="absolute bottom-5 right-4 z-30 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
          <div className="rounded-full border border-white/8 bg-black/28 px-3 py-2 text-[10px] tracking-[0.16em] text-white/58 backdrop-blur-md">
            {copy.flylineDisclaimer}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsArcVisible((current) => !current)}
              className="rounded-full border border-white/8 bg-black/28 px-3 py-2 text-[10px] tracking-[0.22em] text-white/46 backdrop-blur-md transition duration-300 hover:border-white/16 hover:bg-black/34 hover:text-white/78"
            >
              {isArcVisible ? copy.flylinesOn : copy.flylinesOff}
            </button>

            <button
              type="button"
              onClick={() => setIsAutoSpinEnabled((current) => !current)}
              className="rounded-full border border-white/8 bg-black/28 px-3 py-2 text-[10px] tracking-[0.22em] text-white/46 backdrop-blur-md transition duration-300 hover:border-white/16 hover:bg-black/34 hover:text-white/78"
            >
              {isAutoSpinEnabled ? copy.autoRotateOn : copy.autoRotateOff}
            </button>

            <button
              type="button"
              onClick={handleResetView}
              className="rounded-full border border-white/8 bg-black/28 px-3 py-2 text-[10px] tracking-[0.22em] text-white/46 backdrop-blur-md transition duration-300 hover:border-white/16 hover:bg-black/34 hover:text-white/78"
            >
              {copy.resetView}
            </button>
          </div>
        </div>
      ) : null}

      {renderError ? (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 w-[min(92vw,30rem)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-amber-300/25 bg-black/70 px-6 py-5 text-sm leading-7 text-amber-100 backdrop-blur-2xl">
          {copy.renderError}
          <div className="mt-2 text-xs tracking-[0.2em] text-amber-200/70">
            {copy.rendererLabel} / {renderError}
          </div>
        </div>
      ) : null}

    </div>
  );
}
