import { GatoCibern } from './base64_image';

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const userPrompt = url.searchParams.get("prompt");

        // Esta es la ruta para obtener la imagen directamente
        if (url.pathname === '/imagen-data' && userPrompt) {
            try {
                const inputs = { prompt: userPrompt };
                const imageBlob = await env.AI.run(
                    "@cf/stabilityai/stable-diffusion-xl-base-1.0",
                    inputs
                );
                return new Response(imageBlob, {
                    headers: {
                        'Content-Type': 'image/png',
                        'Cache-Control': 'public, max-age=3600',
                    },
                });
            } catch (error) {
                return new Response(`Error al generar la imagen: ${error.message}`, { status: 500 });
            }
        }

        // El HTML principal que maneja ambas vistas
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generador de Imágenes con IA</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body { 
            font-family: 'Montserrat', sans-serif; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            min-height: 100vh;
            margin: 0; 
            background-color: #121212; 
            color: #e0e0e0; 
            text-align: center;
            padding: 20px;
            box-sizing: border-box;
        }
        .container {
            width: 100%;
            max-width: 800px;
        }
        h1 { 
            color: #bb86fc; 
            font-size: 2em; 
            margin-bottom: 20px;
        }
        form { 
            display: flex; 
            gap: 10px; 
            margin-top: 20px; 
            flex-wrap: wrap; 
            justify-content: center;
        }
        input[type="text"] { 
            width: 400px; 
            max-width: 80%; 
            padding: 12px; 
            border: 1px solid #333; 
            border-radius: 5px; 
            background-color: #2c2c2c; 
            color: #e0e0e0; 
            box-sizing: border-box;
        }
        button { 
            padding: 12px 24px; 
            border: none; 
            border-radius: 5px; 
            background-color: #03dac6; 
            color: #121212; 
            font-weight: bold; 
            cursor: pointer; 
        }
        button:hover { 
            background-color: #018786; 
        }
        .cat-image { 
            width: 250px; 
            height: auto; 
            margin-bottom: 20px; 
        }
        .image-container { 
            text-align: center; 
            display: none; /* Inicialmente oculto */
        }
        .image-container img { 
            max-width: 90%; 
            height: auto; 
            margin-bottom: 20px; 
            border: 2px solid #03dac6;
        }
        .options { 
            display: flex; 
            gap: 20px; 
            flex-wrap: wrap;
            justify-content: center;
        }
        .options a { 
            text-decoration: none; 
            padding: 12px 24px; 
            border-radius: 5px; 
            font-weight: bold; 
        }
        .download-btn { 
            background-color: #bb86fc; 
            color: #121212; 
        }
        .new-image-btn { 
            background-color: #03dac6; 
            color: #121212; 
        }
        /* Estilos para móviles */
        @media (max-width: 600px) {
            h1 {
                font-size: 1.8em;
            }
            .cat-image {
                width: 200px;
            }
            form, .options {
                flex-direction: column;
                gap: 10px;
            }
            input[type="text"] {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container" id="form-container">
        <img src="${GatoCibern}" class="cat-image">
        <h1>Generador de Imágenes con IA</h1>
        <form id="image-form">
            <input type="text" id="prompt-input" name="prompt" placeholder="Escribe tu idea aquí..." required>
            <button type="submit">Generar</button>
        </form>
    </div>

    <div class="container image-container" id="result-container">
        <h1>¡Tu imagen ha sido generada!</h1>
        <div class="image-container">
            <img id="generated-image" src="" alt="Imagen generada por IA">
        </div>
        <div class="options">
            <a id="download-link" href="#" download="imagen-ia.png" class="download-btn">Descargar imagen</a>
            <button id="new-image-btn" class="new-image-btn">Generar otra imagen</button>
        </div>
    </div>

    <script>
        document.getElementById('image-form').addEventListener('submit', async function(event) {
            event.preventDefault();
            const prompt = document.getElementById('prompt-input').value;
            showLoading(prompt);
            await fetchImageAndDisplay(prompt);
        });

        document.getElementById('new-image-btn').addEventListener('click', async function() {
            const prompt = document.getElementById('prompt-input').value;
            showLoading(prompt);
            await fetchImageAndDisplay(prompt);
        });

        function showLoading(prompt) {
            const formContainer = document.getElementById('form-container');
            const resultContainer = document.getElementById('result-container');
            const h1Element = resultContainer.querySelector('h1');
            const imgElement = document.getElementById('generated-image');

            formContainer.style.display = 'none';
            resultContainer.style.display = 'block';
            h1Element.textContent = \`Generando imagen para: "\${prompt}"...\`;
            imgElement.style.display = 'none';
        }

        async function fetchImageAndDisplay(prompt) {
            try {
                const imgElement = document.getElementById('generated-image');
                const downloadLink = document.getElementById('download-link');
                const h1Element = document.getElementById('result-container').querySelector('h1');

                const imageUrl = \`/imagen-data?prompt=\${encodeURIComponent(prompt)}\`;
                const response = await fetch(imageUrl);
                
                if (!response.ok) {
                    throw new Error('No se pudo generar la imagen.');
                }
                
                const blob = await response.blob();
                const objectURL = URL.createObjectURL(blob);

                imgElement.src = objectURL;
                imgElement.style.display = 'block';
                downloadLink.href = objectURL;
                h1Element.textContent = '¡Tu imagen ha sido generada!';

                // Limpiar la URL del blob después de que la imagen se cargue
                imgElement.onload = () => URL.revokeObjectURL(objectURL);

            } catch (error) {
                const h1Element = document.getElementById('result-container').querySelector('h1');
                h1Element.textContent = \`Error: \${error.message}\`;
            }
        }
    </script>
</body>
</html>`;

        return new Response(html, { headers: { "Content-Type": "text/html" } });
    },
};
