import { GatoCibern } from './base64_image';

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const userPrompt = url.searchParams.get("prompt");

        // 1. Si no hay prompt, muestra el formulario HTML.
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
.cat-image { width: 300px; height: auto; margin-bottom: 20px; }
</style>
</head>
<body>
<img src="${GatoCibern}" class="cat-image">
<h1>Generador de Imágenes con IA</h1>
<form action="/generar-descargar" method="GET">
<input type="text" name="prompt" placeholder="Escribe tu idea aquí..." required>
<button type="submit">Generar y Descargar</button>
</form>
</body>
</html>
`;
            return new Response(html, {
                headers: {
                    "Content-Type": "text/html",
                },
            });
        }

        // 2. Si hay prompt, generamos y descargamos la imagen.
        const inputs = {
            prompt: userPrompt,
        };

        try {
            const imageResponse = await env.AI.run(
                "@cf/stabilityai/stable-diffusion-xl-base-1.0",
                inputs
            );
            
            // Devolver la imagen para su descarga
            return new Response(imageResponse, {
                headers: {
                    // Le dice al navegador que el archivo debe ser descargado
                    "Content-Disposition": `attachment; filename="imagen_ia.png"`,
                    // Especifica el tipo de archivo
                    "Content-Type": "image/png",
                },
            });
        } catch (error) {
            return new Response(`Error al generar la imagen: ${error.message}`, {
                status: 500,
            });
        }
    },
};
