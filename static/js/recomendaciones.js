document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formRecomendacion");
    const alerta = document.getElementById("alertaExito");

    if (form) {
        form.addEventListener("submit", () => {
            // Mostrar alerta visual tras enviar
            setTimeout(() => {
                if (alerta) {
                    alerta.classList.remove("hidden");
                    alerta.classList.add("block");
                    // Ocultar después de 4 segundos
                    setTimeout(() => alerta.classList.add("hidden"), 4000);
                }
                form.reset();
            }, 400);
        });
    }
});
