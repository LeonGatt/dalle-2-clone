import { CanvasElement, CanvasRenderingContext } from "@/utils/enums";

// Painting defaults
export const DRAWER_WIDTH = 255;
export const MAX_BRUSH_SIZE = 150;
export const MIN_BRUSH_SIZE = 5;
export const DEFAULT_BRUSH_SIZE = 30;
export const BRUSH_STEP = 10;

// Image defaults
export const MAX_IMAGE_SIZE = 1024;

// Zoom defaults
export const MAX_ZOOM_OUT = 0.6;
export const ZOOM_STEP = 1.05;
export const ZOOM_STEP_BIG = 1.15;

// Canvas defaults
export const DEFAULT_SHADOW = {
  shadowColor: "black",
  shadowBlur: 8,
  shadowOffset: { x: 0, y: 0 },
  shadowOpacity: 0.3,
};

export const STAGE_BRUSH_SETTINGS = {
  radius: MIN_BRUSH_SIZE,
  stroke: "white",
  visible: false,
  ...DEFAULT_SHADOW,
};

export const GENERATION_FRAME = {
  name: CanvasElement.Frame,
  x: 0,
  y: 0,
  width: MAX_IMAGE_SIZE,
  height: MAX_IMAGE_SIZE,
  stroke: "white",
  draggable: true,
  ...DEFAULT_SHADOW,
  dragBoundFunc: (pos: any) => ({
    x: roundToTenth(pos.x),
    y: roundToTenth(pos.y),
  }),
};

export const IMAGE_DEFAULT_SETTINGS = {
  name: CanvasElement.Image,
  perfectDrawEnabled: true,
};

export const LINE_DEFAULT_SETTINGS: CanvasLine = {
  stroke: "#000000",
  strokeWidth: MIN_BRUSH_SIZE,
  globalCompositeOperation: CanvasRenderingContext.destinationOut,
  lineCap: LineJoinType.round,
  lineJoin: LineJoinType.round,
  points: [],
};

export const DEFAULT_KONVA_CONFIG = {
  width: 0,
  height: 0,
  draggable: false,
  scaleX: 1,
  scaleY: 1,
  offsetX: 0,
  offsetY: 0,
  x: 0,
  y: 0,
  id: "stage",
};
