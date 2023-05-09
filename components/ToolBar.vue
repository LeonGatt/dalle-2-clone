<template>
  <div class="toolbar toolbar__tools">
    <v-btn @click="resetPosition()" :disabled="disabled">
      <v-icon>mdi-image-filter-center-focus</v-icon>
    </v-btn>

    <v-btn-toggle
      :model-value="paintState.paintMode"
      @update:modelValue="toggleMode(!!$event)"
      :disabled="disabled"
    >
      <v-btn :value="false">
        <v-icon>mdi-cursor-default</v-icon>
      </v-btn>

      <v-btn :value="true">
        <v-icon>mdi-eraser</v-icon>
      </v-btn>
    </v-btn-toggle>
    <v-btn :disabled="history === 0 || disabled" @click="paintState.undo()">
      <v-icon>mdi-undo</v-icon>
    </v-btn>
    <v-btn
      @click="paintState.redo()"
      :disabled="
        availableHistory <= history || availableHistory === 0 || disabled
      "
    >
      <v-icon>mdi-redo</v-icon>
    </v-btn>
    <v-spacer />

    <v-btn @click="$emit('download')" :disabled="!downloadEnabled || disabled">
      <v-icon>mdi-download</v-icon>
    </v-btn>
    <v-btn
      @click="$emit('resetImage')"
      :disabled="!downloadEnabled || disabled"
    >
      <v-icon>mdi-trash-can-outline</v-icon>
    </v-btn>
  </div>
  <Transition name="bounce">
    <div
      v-show="store.generatedImages.length > 1"
      class="toolbar toolbar__variants"
    >
      <v-btn
        :disabled="store.selectedImage === 0"
        @click="handleChangeImage(-1)"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      {{ store.selectedImage + 1 }} / {{ store.generatedImages.length }}
      <v-btn
        :disabled="store.selectedImage === store.generatedImages.length - 1"
        @click="handleChangeImage(1)"
      >
        <v-icon>mdi-arrow-right</v-icon>
      </v-btn>
    </div>
  </Transition>
  <div v-show="paintState.paintMode" class="toolbar toolbar__brush">
    <v-slider
      :model-value="paintState.brushSize"
      @update:modelValue="paintState.brushSize = Math.round($event)"
      density="compact"
      direction="vertical"
      hide-details
      :min="MIN_BRUSH_SIZE"
      :max="MAX_BRUSH_SIZE"
    />
  </div>
  <div class="toolbar toolbar__sentence">
    <v-text-field
      v-model="sentence"
      dense
      variant="solo"
      hide-details
      class="elevation-0"
      placeholder="Start with a detailed description"
      density="compact"
      @keydown.stop
    >
      <template #append-inner>
        <v-icon :disabled="!sentence" @click="handleFetch">mdi-magnify</v-icon>
      </template>
    </v-text-field>
  </div>
</template>
<script lang="ts" setup>
const { resetPosition } = useKonvaStage();
const { paintState, toggleMode } = usePaint();
const store = useImageStore();

defineProps({
  downloadEnabled: {
    type: Boolean,
    required: true,
  },
  disabled: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["download", "fetch", "change-image"]);

const sentence = ref("");

const history = computed(() => paintState.currentHistory);
const availableHistory = computed(() => paintState.listLine.length);

const handleFetch = () => {
  emit("fetch", sentence.value);
};

const handleChangeImage = (direction: number) => {
  store.selectedImage += direction;
  emit("change-image");
};

const handleKeyDown = (e: KeyboardEvent) => {
  const { metaKey, ctrlKey, shiftKey } = e;
  switch (e.key) {
    case "Enter":
      handleFetch();
      break;
    case "Escape":
      sentence.value = "";
      break;
    case "z":
      if (metaKey || ctrlKey) {
        if (shiftKey) {
          paintState.redo();
        } else {
          paintState.undo();
        }
      }
      break;
    case "c":
      resetPosition();
    case "s":
      paintState.paintMode = false;
      break;
    case "e":
      paintState.paintMode = true;
      break;
    case "ArrowUp":
      if (paintState.brushSize + BRUSH_STEP > MAX_BRUSH_SIZE) return;
      paintState.brushSize += BRUSH_STEP;
      break;
    case "ArrowDown":
      if (paintState.brushSize - BRUSH_STEP < MIN_BRUSH_SIZE) return;
      paintState.brushSize -= BRUSH_STEP;
      break;
    default:
      break;
  }
};
useEventListener(window, "keydown", handleKeyDown);
</script>

<style lang="scss">
.toolbar {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99;
  display: flex;
  gap: 8px;
  padding: 8px;
  line-height: 1;
  align-items: center;

  @include glassBlur();
  .v-btn {
    height: 48px;
  }
  &__tools {
    width: 50%;
    min-width: min-content;
    bottom: 10px;
  }
  &__brush {
    width: 48px;
    padding: 16px;
    top: 50%;
    transform: translateY(-50%);
    right: 10px;
    left: inherit;
    height: 200px;
    @include glassBlur();

    .v-slider.v-input--vertical {
      height: 100% !important;
      margin: 0 !important;
      .v-input__control {
        min-height: inherit !important;
      }
    }
    .v-slider.v-input--vertical .v-input__control {
      min-height: inherit !important;
    }
  }
  &__variants {
    @include glassBlur();
    bottom: 86px;
    user-select: none;

    .v-btn {
      height: 30px;
      padding: 0 6px !important;
      min-width: 30px;
    }
  }
  &__sentence {
    width: 50%;
    top: 10px;
    @include glassBlur();
  }
}

@keyframes pulse {
  from {
    transform: scale3d(1, 1, 1);
  }

  50% {
    transform: scale3d(1.05, 1.05, 1.05);
  }

  to {
    transform: scale3d(1, 1, 1);
  }
}

.bounce-enter-active {
  animation: pulse 0.5s;
}
</style>
