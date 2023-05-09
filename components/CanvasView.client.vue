<template>
  <ToolBar
    @download="handleDownloadClick"
    @fetch="handleFetch"
    @change-image="loadGeneratedImage"
    @reset-image="resetImage"
    :download-enabled="!!file"
    :disabled="!file"
  />

  <CanvasStage ref="stageRef" :loading="loading">
    <v-layer>
      <v-group :config="{ name: CanvasElement.OriginalImage }">
        <v-image :config="imageConfig" />
      </v-group>
      <v-group :config="{ name: CanvasElement.Group }">
        <v-image :config="imageConfig" />
        <template v-for="line in paintState.getLinesByHistory">
          <v-line :config="line" />
        </template>
      </v-group>
    </v-layer>
    <v-layer>
      <v-circle :config="mouseConfig" />
      <GenerationFrame :file="file" />
    </v-layer>
  </CanvasStage>
</template>
<script lang="ts" setup>
import { CanvasElement } from "@/utils/enums";

const { resetPosition, setImageDimensions } = useKonvaStage();
const { getRelativePos, getImageRightDimension } = useKonvaHelpers();
const { paintState } = usePaint();
const { setPositionFromImage } = useKonvaFrame();

const originalFile = ref<File | undefined>();
const file = shallowRef();
const stageRef = ref();
const loading = ref(false);

const {
  generateNewImage,
  generateNewVariant,
  resetImages,
  generatedImages,
  getSelectedImage,
} = useImageGeneration({
  stageRef,
});

const { x, y, isOutside } = useMouseInElement(stageRef.value?.stageEl);

const handleLoadImage = (image?: File | string, restoreCanvas = false) => {
  if (!image) return;
  let url: string | undefined = "";
  if (typeof image === "string") {
    if (image.startsWith("data:image")) {
      url = image;
    } else {
      url = `data:image/png;base64, ${image}`;
    }
  } else {
    originalFile.value = image;
    url = useObjectUrl(image).value;
  }
  if (!url) return;
  const img = new Image();
  img.src = url;
  img.onload = () => {
    const { width, height } = getImageRightDimension(img);
    img.width = width;
    img.height = height;
    setImageDimensions(img);
    file.value = img;
    setPositionFromImage(img);
    resetPosition();
  };
  if (restoreCanvas) {
    paintState.listLine = [];
    paintState.currentHistory = 0;
  }
};

const resetImage = () => {
  file.value = undefined;
  paintState.listLine = [];
  paintState.currentHistory = 0;
};

useDropZone(stageRef, (files: File[] | null) =>
  handleLoadImage(files?.[0], true)
);

const loadGeneratedImage = () => handleLoadImage(getSelectedImage.value, true);

const handleDownloadClick = async () =>
  await handleDownload(stageRef.value?.stageEl);

const handleFetch = async (prompt: string) => {
  if (!prompt) return;
  loading.value = true;
  try {
    resetImages();
    if (file.value) {
      await generateNewVariant(prompt);
    } else {
      await generateNewImage(prompt);
    }

    if (generatedImages.value.length > 0) {
      loadGeneratedImage();
    }
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
};

const imageConfig = computed(() => ({
  ...IMAGE_DEFAULT_SETTINGS,
  image: file.value,
}));

const mouseConfig = computed(() => {
  const pos = getRelativePos({ x: x.value, y: y.value });
  return {
    ...STAGE_BRUSH_SETTINGS,
    x: pos.x,
    y: pos.y,
    radius: paintState.brushSize / 2,
    visible: paintState.paintMode && !isOutside.value,
  };
});
</script>
