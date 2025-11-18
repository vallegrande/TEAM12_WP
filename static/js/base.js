// Script base: revelado por scroll, efecto 'doom' glitch y dropdowns
document.addEventListener('DOMContentLoaded', () => {
    // -------------------- Dropdown funcional con click --------------------
    const dropdowns = document.querySelectorAll('.group');
    dropdowns.forEach(drop => {
        const btn = drop.querySelector('button');
        if(!btn) return;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const menu = drop.querySelector('div.absolute');
            if(!menu) return;
            menu.classList.toggle('invisible');
            menu.classList.toggle('opacity-100');
            menu.classList.toggle('scale-100');
        });
    });

    // -------------------- Reveal on scroll (IntersectionObserver) --------------------
    const revealElements = document.querySelectorAll('.reveal');
    if(revealElements.length){
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting){
                    entry.target.classList.add('in-view');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        revealElements.forEach(el => obs.observe(el));
    }

    // -------------------- Preparar efecto 'doom' glitch para títulos --------------------
    const doomTitles = document.querySelectorAll('.doom-glitch');
    doomTitles.forEach(t => {
        // Guardar el texto original en data-text para los pseudo-elementos CSS
        const text = t.textContent.trim();
        t.setAttribute('data-text', text);
    });

    // -------------------- Pequeñas animaciones en elementos interactivos --------------------
    const hoverables = document.querySelectorAll('button, a, .card');
    hoverables.forEach(el => {
        el.addEventListener('pointerenter', () => el.classList.add('will-hover'));
        el.addEventListener('pointerleave', () => el.classList.remove('will-hover'));
    });

    console.log('Base JS cargado: dropdowns, reveal, doom-glitch inicializados.');
});

// Exponer función utilitaria para activar manualmente animaciones si es necesario
function revealNow(selector){
    document.querySelectorAll(selector).forEach(el => el.classList.add('in-view'));
}

// Exportar a window para acceso desde otras partes del sitio
window.revealNow = revealNow;

// Utilidad global para mostrar toasts del servidor o del cliente
function showServerToast(message, duration = 2500){
    try{
        const key = 'server-toast';
        let el = document.getElementById(key);
        if(!el){
            el = document.createElement('div'); el.id = key; el.className = 'cart-toast'; document.body.appendChild(el);
        }
        el.textContent = message;
        requestAnimationFrame(()=> el.classList.add('show'));
        clearTimeout(el._t);
        el._t = setTimeout(()=> el.classList.remove('show'), duration);
    }catch(e){ console.warn('showServerToast error', e); }
}

window.showServerToast = showServerToast;

// Mostrar modal de bienvenida si el mensaje coincide
function showWelcomeModal(message){
        try{
                // Detectar nombre si aparece en el mensaje
                let name = null;
                const m = message.match(/Bienven(ido|ido de vuelta)[,\s!]*([^!\n]*)/i);
                if(m && m[2]){
                        // limpiar comas y espacios
                        name = m[2].replace(/[!,]/g,'').trim();
                } else {
                        const m2 = message.match(/[¡]?Bienvenido,?\s*(.+)!?/i);
                        if(m2 && m2[1]) name = m2[1].replace(/[!,]/g,'').trim();
                }

                const modal = document.createElement('div');
                modal.className = 'welcome-modal';
                modal.innerHTML = `
                    <div class="welcome-backdrop"></div>
                    <div class="welcome-card" role="dialog" aria-modal="true">
                        <div class="welcome-hero">
                            <button class="welcome-close" aria-label="Cerrar">✕</button>
                            <h2>¡Bienvenido${name ? ' ' + name : ''}!</h2>
                            <p>Nos alegra que estés aquí. Calidad y frescura en cada corte, directo a tu mesa.</p>
                        </div>
                        <div class="welcome-body">
                            <p>Explora nuestros productos destacados y promociones. Aquí tienes un acceso rápido para empezar.</p>
                            <a class="welcome-cta" href="/productos">VER AHORA</a>
                        </div>
                        <div class="welcome-footer">Si no quieres ver este mensaje otra vez, lo puedes cerrar y continuar navegando.</div>
                    </div>`;

                document.body.appendChild(modal);

                const close = modal.querySelector('.welcome-close');
                function removeModal(){ modal.remove(); }
                close.addEventListener('click', removeModal);
                modal.querySelector('.welcome-backdrop').addEventListener('click', removeModal);
        }catch(e){ console.warn('Error mostrando welcome modal', e); }
}

// -------------------- Botón Volver Arriba y comportamiento de header --------------------
document.addEventListener('DOMContentLoaded', () => {
    // Reuse existing fallback button if present, otherwise create it.
    let back = document.getElementById('back-to-top');
    if (!back) {
        back = document.createElement('button');
        back.id = 'back-to-top';
        back.title = 'Volver arriba';
        back.setAttribute('aria-label','Volver arriba');
        back.innerHTML = '\u25B2';
        document.body.appendChild(back);
    } else {
        // If there's a server-rendered fallback, ensure it's visible for JS control
        back.classList.remove('hidden');
    }

    const header = document.querySelector('header');
    const showWhen = 240;

    function onScroll(){
        const y = window.scrollY || window.pageYOffset;
        if(y > showWhen){
            back.classList.add('show');
            if(header) header.classList.add('header-scrolled');
        } else {
            back.classList.remove('show');
            if(header) header.classList.remove('header-scrolled');
        }
    }

    back.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mostrar mensajes flash del servidor si existen
    try{
        if(window.SERVER_FLASH && Array.isArray(window.SERVER_FLASH)){
            window.SERVER_FLASH.forEach(msg => {
                if(msg && msg.length){
                    // si el mensaje es de bienvenida, mostrar modal en lugar de solo toast
                    if(/bienven(ido|ida)/i.test(msg)){
                        showWelcomeModal(msg);
                    } else {
                        showServerToast(msg, 3500);
                    }
                }
            });
            // limpiar para evitar re-mostrado si se recarga
            window.SERVER_FLASH = [];
        }
    }catch(e){ console.warn('Error mostrando SERVER_FLASH', e); }
});

