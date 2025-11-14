// Modal de edición del perfil
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modalEditar");
    const editarBtn = document.getElementById("editarBtn");
    const cancelarBtn = document.getElementById("cancelarBtn");

    editarBtn.addEventListener("click", () => {
        modal.classList.remove("hidden");
    });

    cancelarBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
    });
});
