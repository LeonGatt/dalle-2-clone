import { readFiles } from "h3-formidable";
import { openai } from "@/utils/openAi";
import { ImageSizes } from "@/utils/enums";
import fs from "fs";

export default defineEventHandler(async (event) => {
  try {
    const { fields, files } = await readFiles(event, { includeFields: true });
    const { prompt } = fields;
    const { image, mask } = files;

    const [validPrompt] = prompt;
    const [validImage] = image;
    const [validMask] = mask;

    if (!validPrompt || !validImage) {
      return createError({
        statusCode: 400,
        statusMessage: "Missing prompt or image",
      });
    }

    const { data } = await openai.createImageEdit(
      fs.createReadStream(validImage.filepath) as any,
      validPrompt,
      fs.createReadStream(validMask.filepath) as any,
      5,
      ImageSizes.large,
      "b64_json"
    );
    return data;
  } catch (e) {
    console.error(e);
    return e;
  }
});
