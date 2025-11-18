document.addEventListener('DOMContentLoaded', () => {
  console.log("Productos cargado");

  const botones = document.querySelectorAll('.product-card button');

  botones.forEach(btn => {
    btn.addEventListener('click', () => {

      // ✨ Cambio leve: efecto rápido al presionar el botón
      btn.classList.add('btn-click');
      setTimeout(() => btn.classList.remove('btn-click'), 200);

      btn.closest('.product-card').classList.add('fade-in');
      alert("Producto agregado al carrito 🛒");
    });
  });
});