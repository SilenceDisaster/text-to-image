import {GatoCibern} from './base64_image';
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const userPrompt = url.searchParams.get("prompt");

    // 1. Si no hay prompt en la URL, mostramos un formulario HTML.
    if (!userPrompt) {
      const html =
      `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Generador de Imágenes con IA Oswaldo Rodriguez</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
<style>
body { font-family: 'Montserrat', sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #121212; color: #e0e0e0; }
h1 { color: #bb86fc; text-align: center; }
form { display: flex; gap: 10px; margin-top: 20px; }
input[type="text"] { width: 400px; padding: 10px; border: 1px solid #333; border-radius: 5px; background-color: #2c2c2c; color: #e0e0e0; }
button { padding: 10px 20px; border: none; border-radius: 5px; background-color: #03dac6; color: #121212; font-weight: bold; cursor: pointer; }
button:hover { background-color: #018786; }
.cat-image { width: 300px; height: auto; margin-bottom: 20px; } /* Ajusta el tamaño aquí */
</style>
</head>
<body>
<img src="${GatoCibern}" class="cat-image">
<h1>Generador de Imágenes con IA</h1>
<form action="/" method="GET">
<input type="text" name="prompt" placeholder="Escribe tu idea aquí..." required>
<button type="submit">Generar</button>
</form>
</body>
</html>
`;
      // Devolvemos el HTML como respuesta
      return new Response(html, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    }

    // 2. Si sí hay prompt, generamos la imagen como antes.
    const inputs = {
      prompt: userPrompt,
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
};
try {
    const response = await env.AI.run(
        "@cf/stabilityai/stable-diffusion-xl-base-1.0",
        inputs
    );

    // 1. Crear un nombre de archivo único
    const filename = `imagen-${Date.now()}.png`;

    // 2. Subir la imagen al bucket de R2
    await env.MY_BUCKET.put(filename, response);

    // 3. Crear la URL pública para la imagen
    const imageUrl = `https://<URL_DE_TU_BUCKET_R2>/${filename}`;

    // 4. Devolver una respuesta HTML con la imagen guardada
    const htmlResponse = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Imagen Generada</title>
                <meta charset="UTF-8">
            </head>
            <body>
                <h1>¡Tu imagen ha sido generada!</h1>
                <img src="${imageUrl}">
                <br>
                <a href="/">Generar otra imagen</a>
            </body>
        </html>
    `;

    return new Response(htmlResponse, {
        headers: { "Content-Type": "text/html" },
    });

} catch (error) {
    return new Response(`Error al generar la imagen: ${error.message}`, {
        status: 500,
    });
}
