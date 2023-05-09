interface CanvasStageEl extends HTMLElement {
  stageEl?: HTMLElement;
}

interface CanvasLine {
  stroke: string;
  strokeWidth: number;
  globalCompositeOperation: CanvasRenderingContext;
  lineCap: LineJoinType;
  lineJoin: LineJoinType;
  points: number[];
}

interface Position {
  x: number;
  y: number;
}
