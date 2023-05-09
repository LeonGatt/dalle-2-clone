<template>
  <v-rect
    v-if="file && frameConfig"
    :config="frameConfig"
    @mouseenter="setFrameCursor('grab')"
    @mouseleave="setFrameCursor('default')"
    @mousedown="setFrameCursor('grabbing')"
    @mouseup="setFrameCursor('grab')"
    @dragmove="handleDrag"
  />
</template>
<script lang="ts" setup>
import { KonvaEventObject } from "konva/lib/Node";
import { pick } from "lodash";

defineProps({
  file: {
    type: Object as PropType<File>,
    default: undefined,
  },
});

const { paintState } = usePaint();
const { stage, setFramePosition } = useKonvaFrame();
const { toggleCursor } = useKonvaStage();

const setFrameCursor = (cursor: string) => {
  if (!paintState.paintMode) {
    toggleCursor(cursor);
  }
};
const handleDrag = (e: KonvaEventObject<DragEvent>) =>
  setFramePosition(pick(e.target.attrs, ["x", "y"]));

const frameConfig = computed(() => ({
  ...stage.frame,
  draggable: !paintState.paintMode,
}));
</script>
