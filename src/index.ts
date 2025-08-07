export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const userPrompt = url.searchParams.get("prompt");

    // Si el usuario no proporciona un prompt, usamos uno predeterminado.
    const prompt = userPrompt || "A majestic cat in a Cyberpunk City";

    const inputs = {
      prompt: prompt,
    };

    try {
      const response = await env.AI.run(
        "@cf/stabilityai/stable-diffusion-xl-base-1.0",
        inputs,
      );

      return new Response(response, {
        headers: {
          "content-type": "image/png",
        },
      });
    } catch (error) {
      return new Response(`Error al generar la imagen: ${error.message}`, {
        status: 500,
      });
    }
  },
} satisfies ExportedHandler<Env>;
