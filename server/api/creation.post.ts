import { openai } from "@/utils/openAi";
import { ImageSizes } from "@/utils/enums";

export default defineEventHandler(async (event) => {
  const { prompt } = await readBody(event);

  if (!prompt) {
    return createError({
      statusCode: 400,
      statusMessage: "Missing prompt",
    });
  }

  try {
    const { data } = await openai.createImage({
      prompt,
      n: 1,
      size: ImageSizes.large,
      response_format: "b64_json",
    });
    return data;
  } catch (e) {
    console.error(e);
    return e;
  }
});
