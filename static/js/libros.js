// libros.js — mejoras: contador, AJAX submit optimista, modal confirmación, paginación simple
document.addEventListener("DOMContentLoaded", () => {
    const btnRec = document.getElementById("btnRecomendaciones");
    const btnRecL = document.getElementById("btnReclamos");
    const secRec = document.getElementById("seccionRecomendaciones");
    const secRecL = document.getElementById("seccionReclamos");

    const formRec = document.getElementById('formRecomendacion');
    const formRecL = document.getElementById('formReclamos');
    const listaRec = document.getElementById('listaRecomendaciones');
    const listaRecL = document.getElementById('listaReclamos');

    // Toggle tabs
    function setTab(isRec){
        if(isRec){
            secRec.classList.remove('hidden'); secRecL.classList.add('hidden');
            btnRec.classList.add('bg-amber-500','text-white'); btnRec.classList.remove('bg-gray-200','text-gray-700');
            btnRecL.classList.remove('bg-amber-500','text-white'); btnRecL.classList.add('bg-gray-200','text-gray-700');
        } else {
            secRecL.classList.remove('hidden'); secRec.classList.add('hidden');
            btnRecL.classList.add('bg-amber-500','text-white'); btnRecL.classList.remove('bg-gray-200','text-gray-700');
            btnRec.classList.remove('bg-amber-500','text-white'); btnRec.classList.add('bg-gray-200','text-gray-700');
        }
    }

    btnRec.addEventListener('click', ()=> setTab(true));
    btnRecL.addEventListener('click', ()=> setTab(false));

    // Character counters
    const counterRec = document.getElementById('counterRec');
    const counterRecL = document.getElementById('counterRecL');
    const mensajeRec = document.getElementById('mensajeRec');
    const mensajeRecL = document.getElementById('mensajeRecL');

    function updateCounter(el, counter){
        if(!el || !counter) return;
        counter.textContent = el.value.length;
    }
    if(mensajeRec) mensajeRec.addEventListener('input', ()=> updateCounter(mensajeRec, counterRec));
    if(mensajeRecL) mensajeRecL.addEventListener('input', ()=> updateCounter(mensajeRecL, counterRecL));

    // Simple client-side pagination: hide items beyond first N, load more on click
    function setupPagination(container, btnId, pageSize=5){
        if(!container) return;
        const items = Array.from(container.querySelectorAll('.entry'));
        let shown = pageSize;
        function render(){
            items.forEach((it, idx)=> it.style.display = idx < shown ? '' : 'none');
        }
        render();
        const btn = document.getElementById(btnId);
        if(btn){
            btn.addEventListener('click', (e)=>{ e.preventDefault(); shown += pageSize; render(); if(shown >= items.length) btn.style.display='none'; });
            if(shown >= items.length) btn.style.display='none';
        }
    }
    setupPagination(listaRec, 'loadMoreRec', 5);
    setupPagination(listaRecL, 'loadMoreRecL', 5);

    // Toast helper
    function toast(msg, time=2000){
        const t = document.createElement('div');
        t.className = 'cart-toast'; t.textContent = msg; document.body.appendChild(t);
        requestAnimationFrame(()=> t.classList.add('show'));
        setTimeout(()=> { t.classList.remove('show'); setTimeout(()=> t.remove(), 300); }, time);
    }

    // AJAX submit: optimistic UI update, then POST form
    async function submitForm(formEl, isReclamo=false){
        const textarea = formEl.querySelector('textarea[name="mensaje"]');
        if(!textarea) return;
        const text = textarea.value.trim();
        if(!text) return;

        // disable and show loading
        const btn = formEl.querySelector('button');
        btn.disabled = true; btn.classList.add('opacity-70');

        // optimistic UI: add entry locally
        const now = new Date().toLocaleString();
        const wrapper = document.createElement('div');
        wrapper.className = 'p-4 bg-'+(isReclamo? 'red-50 border-red-200' : 'yellow-50 border-yellow-200')+' rounded-lg entry-new';
        wrapper.innerHTML = `<p class="font-semibold">Tú <span class='entry-meta'>${now}</span></p><p>${text}</p>`;
        if(isReclamo) listaRecL.prepend(wrapper); else listaRec.prepend(wrapper);

        // send to server (form-encoded)
        try{
            const formData = new FormData();
            formData.append('tipo', isReclamo ? 'reclamo' : 'recomendacion');
            formData.append('mensaje', text);
            const res = await fetch('/libros', { method:'POST', body: formData });
            if(!res.ok) throw new Error('Error al enviar');
            toast('Enviado con éxito');
            textarea.value = '';
            updateCounter(textarea, isReclamo ? counterRecL : counterRec);
        }catch(err){
            toast('Error al enviar. Intenta de nuevo.');
            console.error(err);
        } finally {
            btn.disabled = false; btn.classList.remove('opacity-70');
        }
    }

    if(formRec) formRec.addEventListener('submit', (e)=>{ e.preventDefault(); submitForm(formRec, false); });

    // For reclamos, ask confirmation in modal
    const modal = document.getElementById('modalConfirm');
    const modalCancel = document.getElementById('modalCancel');
    const modalConfirmBtn = document.getElementById('modalConfirmBtn');
    let pendingReclamo = null;
    if(formRecL) formRecL.addEventListener('submit', (e)=>{ e.preventDefault(); pendingReclamo = formRecL; modal.classList.remove('hidden'); });
    if(modalCancel) modalCancel.addEventListener('click', ()=> { modal.classList.add('hidden'); pendingReclamo = null; });
    if(modalConfirmBtn) modalConfirmBtn.addEventListener('click', ()=> { if(pendingReclamo){ submitForm(pendingReclamo, true); modal.classList.add('hidden'); pendingReclamo=null; }});

    // Clear local personal history (calls backend? here only local UI removal)
    const clearBtn = document.getElementById('clearHistoryBtn');
    if(clearBtn){ clearBtn.addEventListener('click', ()=>{ if(confirm('Borrarás los mensajes guardados localmente en esta sesión. Continuar?')){ // no local storage used for libros, so simply remove entries from DOM
            listaRec.querySelectorAll('.entry-new').forEach(n=>n.remove()); listaRecL.querySelectorAll('.entry-new').forEach(n=>n.remove()); toast('Mensajes locales borrados'); } }); }

});

// ---------------- View more / modal and search/filter ----------------
document.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-action]');
    if(!btn) return;
    const action = btn.getAttribute('data-action');
    if(action === 'view'){
        const text = btn.getAttribute('data-text') || '';
        const authorEl = btn.closest('.libro-card')?.querySelector('.libro-title');
        const author = authorEl ? authorEl.textContent.trim() : 'Autor';
        const modal = document.getElementById('modalView');
        if(modal){
            document.getElementById('modalViewAuthor').textContent = author;
            document.getElementById('modalViewText').textContent = text;
            modal.classList.remove('hidden');
        }
    }
    if(action === 'quote'){
        const text = btn.getAttribute('data-text') || '';
        // copy text to clipboard for quoting
        navigator.clipboard?.writeText(text).then(()=>{ alert('Texto copiado para citar'); }).catch(()=>{ alert('No se pudo copiar'); });
    }
});

document.addEventListener('DOMContentLoaded', ()=>{
    const modal = document.getElementById('modalView');
    const close = document.getElementById('modalViewClose');
    if(close && modal){ close.addEventListener('click', ()=> modal.classList.add('hidden')); }
    if(modal){ modal.addEventListener('click', (ev)=>{ if(ev.target === modal) modal.classList.add('hidden'); }); }

    // Search / filter in sidebar
    const sidebarSearch = document.querySelector('.sidebar-search input');
    if(sidebarSearch){
        sidebarSearch.addEventListener('input', (e)=>{
            const q = e.target.value.trim().toLowerCase();
            document.querySelectorAll('.entry').forEach(entry=>{
                const txt = entry.textContent.toLowerCase();
                entry.style.display = q ? (txt.includes(q) ? '' : 'none') : '';
            });
        });
    }
});
