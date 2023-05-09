import { defineStore } from "pinia";

export const usePaintStore = defineStore(AppStore.paint, {
  state: () => ({
    listLine: [] as CanvasLine[],
    paintMode: false,
    isPainting: false,
    brushSize: DEFAULT_BRUSH_SIZE,
    currentHistory: 0,
  }),
  getters: {
    getLinesByHistory: (state) => state.listLine.slice(0, state.currentHistory),
  },
  actions: {
    startPainting(e: any) {
      const { getRelativePos } = useKonvaHelpers();
      if (!this.paintMode) return;
      this.isPainting = true;
      const pos = getRelativePos(e.target.getStage().getPointerPosition());

      // Remove all lines after current history step
      if (this.listLine.length > this.currentHistory) {
        this.listLine = this.listLine.slice(0, this.currentHistory);
      }

      this.listLine.push({
        ...LINE_DEFAULT_SETTINGS,
        strokeWidth: this.brushSize,
        points: [pos.x, pos.y, pos.x, pos.y],
      });

      // Update current history step
      this.currentHistory += 1;
    },

    paint(e: any) {
      const { getRelativePos } = useKonvaHelpers();
      if (!this.isPainting) return;
      const pos = getRelativePos(e.target.getStage().getPointerPosition());

      this.listLine[this.listLine.length - 1].points = this.listLine[
        this.listLine.length - 1
      ].points.concat([pos.x, pos.y]);
    },
    undo() {
      if (this.currentHistory > 0) {
        this.currentHistory -= 1;
      }
    },
    redo() {
      if (this.currentHistory < this.listLine.length) {
        this.currentHistory += 1;
      }
    },
  },
});

export const usePaint = () => {
  const state = usePaintStore();

  const { toggleDraggable, toggleCursor } = useKonvaStage();

  const toggleMode = (val: boolean) => {
    state.paintMode = val;
    toggleDraggable(!val);
    toggleCursor(val ? "none" : "default");
  };

  return {
    paintState: state,
    toggleMode,
  };
};
