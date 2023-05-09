<template>
  <div id="canvas">
    <v-stage
      ref="stageEl"
      :config="stage"
      @mousedown="handleMouseDown"
      @mousemove="paintState.paint"
      @mouseup="handleMouseUp"
      @dragmove="handleDragEnd"
      @wheel="handleWheel"
    >
      <slot />
    </v-stage>

    <v-overlay
      :model-value="loading"
      persistent
      class="align-center justify-center"
    >
      <v-progress-circular color="primary" indeterminate size="64" />
    </v-overlay>
  </div>
</template>
<script lang="ts" setup>
import { useTitle } from "@vueuse/core";

const { paintState } = usePaint();

const stageEl = ref<HTMLDivElement>();

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
});

const handleMouseDown = (e: any) => {
  if (paintState.paintMode) {
    paintState.startPainting(e);
  }
};
const handleMouseUp = () => {
  if (paintState.paintMode) {
    paintState.isPainting = false;
  }
};

defineExpose({ stageEl });

const { stage, handleDragEnd, handleWheel } = useKonvaStage();

useTitle(() => (props.loading ? "Working on it..." : "DALL·E 2 Clone"));
</script>
