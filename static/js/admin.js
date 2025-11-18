// ===============================================
// 🎯 PANEL ADMIN - JavaScript
// ===============================================

let productoEnEdicion = null;

// 📂 Cambiar de tabs
function openTab(tabName) {
    // Ocultar todos los tabs
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));

    // Desactivar todos los botones de tab
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));

    // Activar el tab seleccionado
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');

    // Si es el tab de productos, cargar los productos
    if (tabName === 'productos') {
        cargarProductos();
    }
}

// 📋 Cargar productos desde el servidor
function cargarProductos() {
    const loadingTable = document.getElementById('loadingTable');
    const productosContent = document.getElementById('productosContent');
    const tablaProductos = document.getElementById('tablaProductos');
    const emptyState = document.getElementById('emptyState');

    loadingTable.classList.add('show');
    productosContent.style.display = 'none';

    fetch('/api/productos')
        .then(response => response.json())
        .then(data => {
            loadingTable.classList.remove('show');

            if (data.success && data.productos && data.productos.length > 0) {
                productosContent.style.display = 'block';
                emptyState.style.display = 'none';

                tablaProductos.innerHTML = '';

                data.productos.forEach(producto => {
                    const fila = document.createElement('tr');

                    const stockClass = producto.stock > 20 ? 'good' : 'low';
                    const stockText = producto.stock > 20 ? '✅ Disponible' : '⚠️ Bajo';
                    const ofertaBadge = producto.tiene_oferta
                        ? '<span class="oferta-badge">✨ EN OFERTA</span>'
                        : '<span style="color: #999;">-</span>';

                    fila.innerHTML = `
                        <td>${producto.id}</td>
                        <td>${producto.nombre}</td>
                        <td>${producto.descripcion.substring(0, 40)}...</td>
                        <td><span class="price-tag">S/ ${producto.precio.toFixed(2)}</span></td>
                        <td><span class="stock-tag ${stockClass}">${stockText} (${producto.stock})</span></td>
                        <td>${ofertaBadge}</td>
                        <td>${producto.imagen || 'N/A'}</td>
                        <td>
                            <div class="actions">
                                <button class="btn btn-edit" onclick="abrirEditar(${producto.id}, '${producto.nombre}', ${producto.precio}, ${producto.stock}, '${producto.descripcion}', ${producto.tiene_oferta}, '${producto.imagen}')">
                                    ✏️ Editar
                                </button>
                                <button class="btn btn-danger" onclick="eliminarProducto(${producto.id}, '${producto.nombre}')">
                                    🗑️ Eliminar
                                </button>
                            </div>
                        </td>
                    `;

                    tablaProductos.appendChild(fila);
                });
            } else {
                productosContent.style.display = 'block';
                emptyState.style.display = 'block';
                tablaProductos.innerHTML = '';
            }
        })
        .catch(error => {
            console.error('Error al cargar productos:', error);
            mostrarAlerta('error', '❌ Error al cargar los productos');
            loadingTable.classList.remove('show');
            productosContent.style.display = 'block';
            emptyState.style.display = 'block';
        });
}

// ➕ Agregar nuevo producto
document.getElementById('formProducto').addEventListener('submit', function(e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const precio = parseFloat(document.getElementById('precio').value);
    const stock = parseInt(document.getElementById('stock').value);
    const imagen = document.getElementById('imagen').value;
    const tieneOferta = document.getElementById('tieneOferta').checked;

    // Validaciones
    if (!nombre || !descripcion || precio <= 0 || stock < 0) {
        mostrarAlerta('error', '⚠️ Por favor completa todos los campos correctamente');
        return;
    }

    const btnSubmit = event.target.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.textContent;
    btnSubmit.disabled = true;
    btnSubmit.textContent = '⏳ Guardando...';

    const datosProducto = {
        nombre,
        descripcion,
        precio,
        stock,
        imagen,
        tiene_oferta: tieneOferta
    };

    fetch('/api/productos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosProducto)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarAlerta('success', '✅ ' + data.message);
                document.getElementById('formProducto').reset();

                // Ir al tab de productos para ver el nuevo producto
                setTimeout(() => {
                    document.querySelector('[onclick="openTab(\'productos\')"]').click();
                }, 1000);
            } else {
                mostrarAlerta('error', '❌ ' + (data.error || 'Error al guardar'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarAlerta('error', '❌ Error al guardar el producto');
        })
        .finally(() => {
            btnSubmit.disabled = false;
            btnSubmit.textContent = textoOriginal;
        });
});

// ✏️ Abrir modal para editar
function abrirEditar(id, nombre, precio, stock, descripcion, tieneOferta, imagen) {
    productoEnEdicion = id;

    document.getElementById('editId').value = id;
    document.getElementById('editNombre').value = nombre;
    document.getElementById('editPrecio').value = precio;
    document.getElementById('editStock').value = stock;
    document.getElementById('editDescripcion').value = descripcion;
    document.getElementById('editTieneOferta').checked = tieneOferta;
    document.getElementById('editImagen').value = imagen || '';

    document.getElementById('modalEditar').classList.add('show');
}

// ❌ Cerrar modal
function cerrarModal() {
    document.getElementById('modalEditar').classList.remove('show');
    productoEnEdicion = null;
}

// Cerrar modal al hacer click fuera
window.onclick = function(event) {
    const modal = document.getElementById('modalEditar');
    if (event.target == modal) {
        modal.classList.remove('show');
    }
}

// 💾 Guardar cambios de edición
document.getElementById('formEditar').addEventListener('submit', function(e) {
    e.preventDefault();

    const id = document.getElementById('editId').value;
    const nombre = document.getElementById('editNombre').value.trim();
    const descripcion = document.getElementById('editDescripcion').value.trim();
    const precio = parseFloat(document.getElementById('editPrecio').value);
    const stock = parseInt(document.getElementById('editStock').value);
    const imagen = document.getElementById('editImagen').value;
    const tieneOferta = document.getElementById('editTieneOferta').checked;

    // Validaciones
    if (!nombre || !descripcion || precio <= 0 || stock < 0) {
        mostrarAlerta('error', '⚠️ Por favor completa todos los campos correctamente');
        return;
    }

    const btnSubmit = event.target.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.textContent;
    btnSubmit.disabled = true;
    btnSubmit.textContent = '⏳ Guardando...';

    const datosActualizados = {
        nombre,
        descripcion,
        precio,
        stock,
        imagen,
        tiene_oferta: tieneOferta
    };

    fetch(`/api/productos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosActualizados)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarAlerta('success', '✅ ' + data.message);
                cerrarModal();
                cargarProductos();
            } else {
                mostrarAlerta('error', '❌ ' + (data.error || 'Error al actualizar'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarAlerta('error', '❌ Error al actualizar el producto');
        })
        .finally(() => {
            btnSubmit.disabled = false;
            btnSubmit.textContent = textoOriginal;
        });
});

// 🗑️ Eliminar producto
function eliminarProducto(id, nombre) {
    const confirmar = confirm(`¿Estás seguro de que deseas eliminar el producto "${nombre}"?\n\n⚠️ Esta acción no se puede deshacer.`);

    if (!confirmar) return;

    fetch(`/api/productos/${id}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarAlerta('success', '✅ ' + data.message);
                cargarProductos();
            } else {
                mostrarAlerta('error', '❌ ' + (data.error || 'Error al eliminar'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarAlerta('error', '❌ Error al eliminar el producto');
        });
}

// 📢 Mostrar alertas
function mostrarAlerta(tipo, mensaje) {
    const alertId = `alert${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
    const alert = document.getElementById(alertId);

    alert.textContent = mensaje;
    alert.classList.add('show');

    setTimeout(() => {
        alert.classList.remove('show');
    }, 5000);
}

// 🎯 Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Panel Admin cargado correctamente');
});
