// Sistema de pestañas para Login y Registro
document.addEventListener('DOMContentLoaded', function() {
    
    // Elementos del DOM
    const tabLogin = document.getElementById('tabLogin');
    const tabRegistro = document.getElementById('tabRegistro');
    const contentLogin = document.getElementById('contentLogin');
    const contentRegistro = document.getElementById('contentRegistro');

    // Función para cambiar a Login
    function mostrarLogin() {
        // Actualizar pestañas
        tabLogin.classList.add('active');
        tabRegistro.classList.remove('active');
        
        // Mostrar/ocultar contenido
        contentLogin.classList.remove('hidden');
        contentRegistro.classList.add('hidden');
        
        // Guardar preferencia en sessionStorage
        sessionStorage.setItem('activeTab', 'login');
    }

    // Función para cambiar a Registro
    function mostrarRegistro() {
        // Actualizar pestañas
        tabRegistro.classList.add('active');
        tabLogin.classList.remove('active');
        
        // Mostrar/ocultar contenido
        contentRegistro.classList.remove('hidden');
        contentLogin.classList.add('hidden');
        
        // Guardar preferencia en sessionStorage
        sessionStorage.setItem('activeTab', 'registro');
    }

    // Event listeners para las pestañas
    if (tabLogin) {
        tabLogin.addEventListener('click', mostrarLogin);
    }

    if (tabRegistro) {
        tabRegistro.addEventListener('click', mostrarRegistro);
    }

    // Restaurar pestaña activa desde sessionStorage
    const activeTab = sessionStorage.getItem('activeTab');
    if (activeTab === 'registro') {
        mostrarRegistro();
    }

    // Validación en tiempo real del DNI
    const dniInput = document.getElementById('dni');
    if (dniInput) {
        dniInput.addEventListener('input', function(e) {
            // Solo permitir números
            this.value = this.value.replace(/\D/g, '');
            
            // Limitar a 8 dígitos
            if (this.value.length > 8) {
                this.value = this.value.slice(0, 8);
            }
        });
    }

    // Validación de contraseña fuerte
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('input', function() {
            const password = this.value;
            
            // Validar longitud mínima
            if (password.length > 0 && password.length < 8) {
                this.setCustomValidity('La contraseña debe tener al menos 8 caracteres');
            } else {
                this.setCustomValidity('');
            }
        });
    });

    // Mostrar/ocultar contraseña
    function agregarTogglePassword() {
        const passwordFields = document.querySelectorAll('input[type="password"]');
        
        passwordFields.forEach(field => {
            const wrapper = field.parentElement;
            
            // Crear botón de toggle
            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600';
            toggleBtn.innerHTML = `
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
            `;
            
            toggleBtn.addEventListener('click', function() {
                const type = field.getAttribute('type') === 'password' ? 'text' : 'password';
                field.setAttribute('type', type);
                
                // Cambiar icono
                if (type === 'text') {
                    this.innerHTML = `
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                        </svg>
                    `;
                } else {
                    this.innerHTML = `
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                    `;
                }
            });
            
            wrapper.appendChild(toggleBtn);
        });
    }

    // Agregar toggle de contraseña después de un pequeño delay
    setTimeout(agregarTogglePassword, 100);

    // Manejo de formularios con loading state
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitButton = this.querySelector('button[type="submit"]');
            
            if (submitButton) {
                submitButton.classList.add('loading');
                submitButton.disabled = true;
            }
        });
    });

    // Auto-focus en el primer input visible
    const primerInputVisible = document.querySelector('.tab-content:not(.hidden) input:not([type="hidden"])');
    if (primerInputVisible) {
        setTimeout(() => primerInputVisible.focus(), 300);
    }

    // Validación de fecha de nacimiento (mayor de 18 años)
    const fechaNacimiento = document.getElementById('fecha_nacimiento');
    if (fechaNacimiento) {
        fechaNacimiento.addEventListener('change', function() {
            const fecha = new Date(this.value);
            const hoy = new Date();
            const edad = hoy.getFullYear() - fecha.getFullYear();
            const mes = hoy.getMonth() - fecha.getMonth();
            
            if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
                edad--;
            }
            
            if (edad < 18) {
                this.setCustomValidity('Debes ser mayor de 18 años para registrarte');
            } else {
                this.setCustomValidity('');
            }
        });
    }

    // Animación de entrada
    const card = document.querySelector('.bg-white.rounded-2xl');
    if (card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100);
    }
});
// --- ANIMACIÓN 1: Efecto pulse al enfocar inputs ---
const allInputs = document.querySelectorAll('input');
allInputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.style.transition = 'box-shadow 0.3s ease, transform 0.3s ease';
        this.style.boxShadow = '0 0 10px rgba(220, 38, 38, 0.5)';
        this.style.transform = 'scale(1.02)';
    });
    input.addEventListener('blur', function() {
        this.style.boxShadow = '';
        this.style.transform = '';
    });
});

// --- ANIMACIÓN 2: Zoom sutil en botón al pasar el mouse ---
const allButtons = document.querySelectorAll('.btn-primary');
allButtons.forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        this.style.transition = 'transform 0.2s ease';
        this.style.transform = 'scale(1.05)';
    });
    btn.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
});
