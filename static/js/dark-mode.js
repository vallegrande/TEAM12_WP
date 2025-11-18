// ============================================
// SISTEMA DE MODO OSCURO/CLARO COMPLETO
// ============================================

class ThemeManager {
    constructor() {
        this.THEME_KEY = 'pochito-theme';
        this.DARK_THEME = 'dark';
        this.LIGHT_THEME = 'light';
        this.init();
    }

    init() {
        // Cargar tema guardado o usar preferencia del sistema
        const savedTheme = localStorage.getItem(this.THEME_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (prefersDark ? this.DARK_THEME : this.LIGHT_THEME);
        
        this.setTheme(initialTheme);
        this.setupToggleButtons();
        this.watchSystemPreference();
    }

    setTheme(theme) {
        // Establecer atributo data-theme en el elemento raíz
        document.documentElement.setAttribute('data-theme', theme);
        
        // Actualizar clase dark para Tailwind CSS
        if (theme === this.DARK_THEME) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        localStorage.setItem(this.THEME_KEY, theme);
        
        // Actualizar todos los botones de tema
        this.updateAllToggleButtons(theme);
        
        // Emitir evento personalizado
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || this.LIGHT_THEME;
        const newTheme = currentTheme === this.DARK_THEME ? this.LIGHT_THEME : this.DARK_THEME;
        this.setTheme(newTheme);
    }

    setupToggleButtons() {
        // Botón en la navegación
        const navToggle = document.getElementById('theme-toggle-nav');
        if (navToggle) {
            navToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Botón en la página de login
        const loginToggle = document.getElementById('theme-toggle-login');
        if (loginToggle) {
            loginToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Botón en la página de libros
        const librosToggle = document.getElementById('theme-toggle-libros');
        if (librosToggle) {
            librosToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Botón en la página de perfil
        const perfilToggle = document.getElementById('theme-toggle-perfil');
        if (perfilToggle) {
            perfilToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Botones genéricos con clase theme-toggle
        const genericToggles = document.querySelectorAll('[data-theme-toggle="true"]');
        genericToggles.forEach(btn => {
            btn.addEventListener('click', () => this.toggleTheme());
        });
    }

    updateAllToggleButtons(theme) {
        // Actualizar icono en botones de tema
        const toggleButtons = document.querySelectorAll('#theme-toggle-nav, #theme-toggle-login, #theme-toggle-libros, #theme-toggle-perfil, [data-theme-toggle="true"]');
        toggleButtons.forEach(btn => {
            const icon = btn.querySelector('svg');
            if (icon) {
                if (theme === this.DARK_THEME) {
                    // Mostrar icono de sol (para cambiar a claro)
                    icon.innerHTML = `<path d="M12 3v1m0 16v1m9-9h-1m-16 0H1m15.364 1.636l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
                    icon.classList.add('text-yellow-400');
                    icon.classList.remove('text-blue-500');
                    btn.title = 'Cambiar a modo claro';
                } else {
                    // Mostrar icono de luna (para cambiar a oscuro)
                    icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
                    icon.classList.add('text-blue-500');
                    icon.classList.remove('text-yellow-400');
                    btn.title = 'Cambiar a modo oscuro';
                }
            }
        });
    }

    watchSystemPreference() {
        // Escuchar cambios en las preferencias del sistema
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeQuery.addListener((e) => {
            // Solo cambiar si el usuario no ha establecido una preferencia manual
            if (!localStorage.getItem(this.THEME_KEY)) {
                this.setTheme(e.matches ? this.DARK_THEME : this.LIGHT_THEME);
            }
        });
    }

    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || this.LIGHT_THEME;
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeManager = new ThemeManager();
    });
} else {
    window.themeManager = new ThemeManager();
}

// Función global para cambiar tema (para uso en HTML)
function toggleTheme() {
    if (window.themeManager) {
        window.themeManager.toggleTheme();
    }
}
