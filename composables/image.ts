import { ImagesResponse } from "openai";
import { defineStore } from "pinia";

export const useImageStore = defineStore(AppStore.image, {
  state: () => ({
    generatedImages: [] as string[],
    selectedImage: 0,
  }),
  getters: {
    getGeneratedImages: (state) => state.generatedImages,
    getSelectedImage: (state) => state.generatedImages[state.selectedImage],
  },
  actions: {
    setGeneratedImages(images: string[]) {
      this.generatedImages = images;
      this.selectedImage = 0;
    },
    resetImages() {
      this.generatedImages = [];
      this.selectedImage = 0;
    },
  },
});

export const useImageGeneration = (conf: {
  stageRef: globalThis.Ref<CanvasStageEl | undefined>;
}) => {
  const store = useImageStore();

  const { getImage } = useKonvaHelpers();

  const generateNewImage = async (prompt: string) => {
    try {
      const data: ImagesResponse = await $fetch("/api/creation", {
        method: "post",
        body: { prompt },
      });
      if (!data.data[0].b64_json) throw new Error("No image generated");

      store.setGeneratedImages([data.data[0].b64_json]);

      return true;
    } catch (e) {
      console.error(e);
    }
  };

  const generateNewVariant = async (prompt: string) => {
    try {
      const mask = await urlToFile(
        getImage(conf.stageRef.value?.stageEl, false, 1),
        "mask.png",
        "image/png"
      );
      const image = await urlToFile(
        getImage(conf.stageRef.value?.stageEl, true, 1),
        "image.png",
        "image/png"
      );
      const form = new FormData();
      form.append("image", image);
      form.append("mask", mask);
      form.append("prompt", prompt);

      const data: ImagesResponse = await $fetch("/api/variant", {
        method: "post",
        body: form,
      });
      if (!data.data.length) throw new Error("No image generated");
      store.setGeneratedImages(
        data.data.map((d) => d?.b64_json ?? "").filter((d) => d)
      );
      return true;
    } catch (e) {
      console.error(e);
    }
  };

  return {
    generateNewImage,
    generateNewVariant,
    resetImages: store.resetImages,
    getSelectedImage: computed(() => store.getSelectedImage),
    generatedImages: computed(() => store.generatedImages),
  };
};
