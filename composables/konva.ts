import { defineStore } from "pinia";
import { CanvasElement } from "@/utils/enums";
import { isEmpty, pick } from "lodash";

const getStagePosition = (stage: any) => {
  let x = 0;
  let y = 0;
  let scale = 1;
  const { width, height } = stage.image;

  if (width || height) {
    const relatedTo = { x: width / 2, y: height / 2 };
    const stageCenter = { x: stage.width / 2, y: stage.height / 2 };

    x = roundToTenth(
      relatedTo.x > stageCenter.x
        ? relatedTo.x - stageCenter.x
        : -(stageCenter.x - relatedTo.x)
    );
    y = roundToTenth(
      relatedTo.y > stageCenter.y
        ? relatedTo.y - stageCenter.y
        : -(stageCenter.y - relatedTo.y)
    );
  }
  return { x, y, scale };
};

// Konva store
export const useKonvaStore = defineStore(AppStore.konva, {
  state: () => ({
    config: DEFAULT_KONVA_CONFIG,
    image: { width: 0, height: 0 },
    frame: {
      ...GENERATION_FRAME,
      x: 0,
      y: 0,
    },
  }),
  getters: {
    getStage: (state) => state.config,
    getFrame: (state) => state.frame,
    isFrameMoved: (state) => state.frame.x !== 0 || state.frame.y !== 0,
  },
  actions: {
    setFramePosition(position: Position) {
      if (isEmpty(position)) return;
      this.frame = {
        ...this.frame,
        ...pick(position, ["x", "y"]),
      };
    },
    setStage({
      width,
      height,
    }: {
      width: globalThis.Ref<number>;
      height: globalThis.Ref<number>;
    }) {
      this.config.width = width.value;
      this.config.height = height.value;
      this.resetPosition();
    },
    resetPosition() {
      const { x, y, scale } = getStagePosition({
        ...this.config,
        image: this.image,
      });
      this.config.offsetX = x;
      this.config.offsetY = y;
      this.config.x = 0;
      this.config.y = 0;
      this.config.scaleX = scale;
      this.config.scaleY = scale;
    },
    handleDragEnd(e: any) {
      e.evt.preventDefault();
      const origin = e.target.getStage();
      this.config.x = origin.x();
      this.config.y = origin.y();
    },
    handleWheel(e: any) {
      e.evt.preventDefault();

      this.config.x += roundToTenth(e.evt.deltaX);
      this.config.y += roundToTenth(e.evt.deltaY);
    },
    toggleDraggable(draggable: boolean) {
      this.config.draggable = draggable;
    },
    setImageDimensions({ width, height }: { width: number; height: number }) {
      this.image.width = width;
      this.image.height = height;
    },
  },
});

export const useKonvaStage = () => {
  const stage = useKonvaStore();
  const dimensions = useWindowSize();

  useEventListener(window, "resize", () => stage.setStage(dimensions));

  const getKonva = () => {
    const stageEl = document.getElementById("canvas");
    const stage = stageEl?.getElementsByClassName(
      "konvajs-content"
    )[0] as HTMLElement;
    return stage;
  };

  const toggleCursor = (cursor: string) => {
    const stage = getKonva();
    if (stage) {
      stage.style.cursor = cursor;
    }
  };

  onMounted(() => stage.setStage(dimensions));

  return {
    stage: stage.getStage,
    resetPosition: stage.resetPosition,
    handleDragEnd: stage.handleDragEnd,
    handleWheel: stage.handleWheel,
    toggleDraggable: stage.toggleDraggable,
    setImageDimensions: stage.setImageDimensions,
    toggleCursor,
    getKonva,
  };
};

export const useKonvaControls = () => {
  const stage = useKonvaStore();

  return {
    resetPosition: stage.resetPosition,
  };
};

export const useKonvaHelpers = () => {
  const stage = useKonvaStore();

  const getRelativePos = (position: { x: number; y: number }) => ({
    x: position.x - (stage.getStage.x - stage.getStage.offsetX),
    y: position.y - (stage.getStage.y - stage.getStage.offsetY),
  });

  const getImageRightDimension = (img: HTMLImageElement) => {
    const mainSide = img.width > img.height ? "width" : "height";
    const ratio =
      mainSide === "height" ? img.width / img.height : img.height / img.width;

    let dimensions = {
      width: MAX_IMAGE_SIZE / ratio,
      height: MAX_IMAGE_SIZE,
    };
    if (mainSide === "height") {
      dimensions = {
        width: MAX_IMAGE_SIZE,
        height: MAX_IMAGE_SIZE / ratio,
      };
    }
    return dimensions;
  };

  const getImage = (stageRef: any, original = false, pixelRatio = 3) => {
    const canvas = stageRef?.getStage();

    if (!canvas) return;
    const image = canvas.findOne(
      original ? `.${CanvasElement.OriginalImage}` : `.${CanvasElement.Group}`
    );

    const frame = canvas.findOne(`.${CanvasElement.Frame}`);
    return image.toDataURL({
      pixelRatio,
      ...stage.getStage,
      offsetX: 0,
      offsetY: 0,
      x: frame.x() - stage.getStage.offsetX + canvas.x(),
      y: frame.y() - stage.getStage.offsetY + canvas.y(),
      scaleX: stage.getStage.scaleX,
      scaleY: stage.getStage.scaleY,
      width: MAX_IMAGE_SIZE,
      height: MAX_IMAGE_SIZE,
    });
  };

  return { getRelativePos, getImageRightDimension, getImage };
};

export const useKonvaFrame = () => {
  const stage = useKonvaStore();

  const setPositionFromImage = (image: HTMLImageElement) => {
    stage.setFramePosition({
      x: (image.width - MAX_IMAGE_SIZE) / 2,
      y: (image.height - MAX_IMAGE_SIZE) / 2,
    });
  };

  return {
    stage,
    frame: stage.getFrame,
    setFramePosition: stage.setFramePosition,
    setPositionFromImage,
  };
};
