// ============================================================
// ProOliva — Barra de suscripción (index.html y productos.html)
//
// Guarda correo + RUT de interesados en la tabla "subscribers" de
// Supabase. Requiere que supabase-config.js ya esté cargado antes
// que este archivo, y que la página tenga el bloque HTML de
// #subscribeForm (ver instrucciones del chat para copiarlo).
// ============================================================

function validateRut(rutRaw){
  const clean = (rutRaw || '').replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  let sum = 0, multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--){
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const mod = 11 - (sum % 11);
  const expectedDv = mod === 11 ? '0' : mod === 10 ? 'K' : String(mod);
  return dv === expectedDv;
}

function formatRut(rutRaw){
  const clean = (rutRaw || '').replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  return `${body}-${dv}`;
}

function initSubscribeBar(){
  const form = document.getElementById('subscribeForm');
  if (!form) return;

  const msgEl = document.getElementById('subscribeMsg');
  const emailInput = document.getElementById('subEmail');
  const rutInput = document.getElementById('subRut');
  const submitBtn = document.getElementById('subSubmitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msgEl.className = 'subscribe-msg';
    msgEl.textContent = '';

    const email = emailInput.value.trim();
    const rutRaw = rutInput.value.trim();

    if (rutRaw && !validateRut(rutRaw)){
      msgEl.textContent = 'El RUT ingresado no es válido.';
      msgEl.className = 'subscribe-msg error';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    const { error } = await supabaseClient.from('subscribers').insert({
      email,
      rut: rutRaw ? formatRut(rutRaw) : null,
      source: window.location.pathname.includes('productos') ? 'productos' : 'index'
    });

    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar';

    if (error){
      if (error.code === '23505'){
        msgEl.textContent = 'Ese correo ya estaba suscrito. ¡Gracias!';
        msgEl.className = 'subscribe-msg ok';
        form.reset();
      } else {
        msgEl.textContent = 'No se pudo guardar tu suscripción. Intenta de nuevo.';
        msgEl.className = 'subscribe-msg error';
        console.error(error);
      }
      return;
    }

    msgEl.textContent = '¡Gracias por suscribirte!';
    msgEl.className = 'subscribe-msg ok';
    form.reset();
  });
}

initSubscribeBar();
