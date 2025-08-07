import { GatoCibern } from './base64_image';

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const userPrompt = url.searchParams.get("prompt");

        // Caso 1: Mostrar el formulario inicial.
        if (url.pathname === '/') {
            const html =
                `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Generador de Imágenes con IA</title>
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
<form action="/generar-y-mostrar" method="GET">
<input type="text" name="prompt" placeholder="Escribe tu idea aquí..." required>
<button type="submit">Generar</button>
</form>
</body>
</html>`;
            return new Response(html, { headers: { "Content-Type": "text/html" } });
        }

        // Caso 2: Generar y mostrar la imagen en una página de resultados.
        if (url.pathname === '/generar-y-mostrar' && userPrompt) {
            const inputs = { prompt: userPrompt };
            try {
                // Generar la imagen con la IA
                const imageBlob = await env.AI.run(
                    "@cf/stabilityai/stable-diffusion-xl-base-1.0",
                    inputs
                );
                
                // Devolver el HTML de la página de resultados
                const htmlResponse = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Imagen Generada</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
<style>
    body { font-family: 'Montserrat', sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #121212; color: #e0e0e0; }
    .image-container { text-align: center; }
    .image-container img { max-width: 80%; height: auto; margin-bottom: 20px; border: 2px solid #03dac6; }
    .options { display: flex; gap: 20px; }
    .options a { text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold; }
    .download-btn { background-color: #bb86fc; color: #121212; }
    .new-image-btn { background-color: #03dac6; color: #121212; }
</style>
</head>
<body>
<h1>¡Tu imagen ha sido generada!</h1>
<div class="image-container">
    <img src="/imagen-data?prompt=${encodeURIComponent(userPrompt)}" alt="Imagen generada por IA">
</div>
<div class="options">
    <a href="/imagen-data?prompt=${encodeURIComponent(userPrompt)}" download="imagen-ia.png" class="download-btn">Descargar imagen</a>
    <a href="/" class="new-image-btn">Generar otra imagen</a>
</div>
</body>
</html>`;

                return new Response(htmlResponse, { headers: { "Content-Type": "text/html" } });
            } catch (error) {
                return new Response(`Error al generar la imagen: ${error.message}`, { status: 500 });
            }
        }
        
        // Caso 3: Devolver los datos de la imagen directamente.
        if (url.pathname === '/imagen-data' && userPrompt) {
            const inputs = { prompt: userPrompt };
            try {
                // Generar la imagen con la IA
                const imageBlob = await env.AI.run(
                    "@cf/stabilityai/stable-diffusion-xl-base-1.0",
                    inputs
                );
                
                // Devolver la imagen directamente
                return new Response(imageBlob, {
                    headers: {
                        'Content-Type': 'image/png',
                        'Cache-Control': 'public, max-age=3600', // Cachear la imagen para no regenerarla
                    },
                });
            } catch (error) {
                return new Response(`Error al generar la imagen: ${error.message}`, { status: 500 });
            }
        }

        // Caso 4: Ruta no encontrada.
        return new Response("Ruta no encontrada", { status: 404 });
    },
};
