import Konva from "konva";

export const urlToFile = (
  url: string,
  filename: string,
  mimeType = "image/png"
) => {
  return fetch(url)
    .then((res) => res.arrayBuffer())
    .then((buf) => new File([buf], filename, { type: mimeType }));
};

export const handleDownload = async (stage?: HTMLElement) => {
  if (!stage) return;

  const { getImage } = useKonvaHelpers();

  const dataURL = getImage(stage);
  const a = document.createElement("a");
  a.href = dataURL;
  a.download = "Image.png";
  a.click();
  a.remove();
};

export const roundToTenth = (num: number) =>
  Math.round(Math.round(num / 10) * 10);

export const getKonvaValues = (el: Konva.Shape) => {
  const stage = el.getStage();
  return {
    pointer: stage?.getPointerPosition() ?? { x: 0, y: 0 },
    scale: stage?.scaleX() ?? 0,
    x: stage?.x() ?? 0,
    y: stage?.y() ?? 0,
    offsetX: stage?.offsetX() ?? 0,
    offsetY: stage?.offsetY() ?? 0,
  };
};
