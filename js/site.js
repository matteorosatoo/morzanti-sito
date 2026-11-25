/* morzanti — comportamento del sito. Nessuna libreria. Funziona anche aprendo i file direttamente. */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');

  /* ---------- barra: diventa piena quando si scorre sopra la foto d'apertura ---------- */
  var bar = document.querySelector('.bar');
  if (bar && document.body.classList.contains('con-hero')) {
    var aggiornaBarra = function () { bar.classList.toggle('piena', window.scrollY > 40); };
    aggiornaBarra();
    window.addEventListener('scroll', aggiornaBarra, { passive: true });
  }

  /* ---------- menu del telefono ---------- */
  var menu = document.getElementById('menu');
  var apri = document.querySelector('.bar__menu');
  var chiudi = menu && menu.querySelector('[data-chiudi]');
  function setMenu(aperto) {
    if (!menu) return;
    menu.hidden = !aperto;
    apri.setAttribute('aria-expanded', String(aperto));
    document.body.style.overflow = aperto ? 'hidden' : '';
    (aperto ? chiudi : apri).focus();
  }
  if (menu && apri) {
    apri.addEventListener('click', function () { setMenu(true); });
    chiudi.addEventListener('click', function () { setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1020 && !menu.hidden) setMenu(false); });
  }

  /* ---------- lingua: EN · ES ----------
     I testi inglesi sono nell'HTML. Le traduzioni sono in js/testi.js (TESTI.es), con la stessa chiave data-i18n.
     Se una chiave manca resta l'inglese e compare l'avviso in basso. */
  var TESTI = window.TESTI || { es: {} };
  var nodi = Array.prototype.slice.call(document.querySelectorAll('[data-i18n]'));
  nodi.forEach(function (n) { n.__en = n.innerHTML; });
  var avviso = document.querySelector('.avviso-lingua');

  function applicaLingua(lingua) {
    var mancanti = 0;
    nodi.forEach(function (n) {
      var k = n.getAttribute('data-i18n');
      if (lingua === 'es') {
        if (Object.prototype.hasOwnProperty.call(TESTI.es, k)) n.innerHTML = TESTI.es[k];
        else { n.innerHTML = n.__en; mancanti++; }
      } else n.innerHTML = n.__en;
    });
    doc.lang = lingua;
    document.querySelectorAll('.lingua button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lingua') === lingua));
    });
    if (avviso) avviso.hidden = !(lingua === 'es' && mancanti > 0);
    try { localStorage.setItem('morzanti-lingua', lingua); } catch (e) {}
  }
  document.querySelectorAll('.lingua button').forEach(function (b) {
    b.addEventListener('click', function () { applicaLingua(b.getAttribute('data-lingua')); });
  });
  if (avviso) avviso.querySelector('button').addEventListener('click', function () { applicaLingua('en'); });
  var salvata = 'en';
  try { salvata = localStorage.getItem('morzanti-lingua') || 'en'; } catch (e) {}
  if (salvata !== 'en') applicaLingua(salvata);

  /* ---------- cucine: filtro ---------- */
  var filtri = document.querySelectorAll('.filtri button');
  filtri.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-filtro');
      filtri.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      document.querySelectorAll('.cucine .cucina').forEach(function (c) {
        c.hidden = !(f === 'all' || (c.getAttribute('data-materia') || '').split(' ').indexOf(f) > -1);
      });
    });
  });

  /* ---------- modulo: per ora non invia nulla, mostra solo la conferma ---------- */
  var modulo = document.querySelector('form.modulo');
  if (modulo) {
    var es = function () { return doc.lang === 'es'; };
    var messaggi = {
      valueMissing: function () { return es() ? 'Este campo es necesario.' : 'Please fill in this field.'; },
      typeMismatch: function () { return es() ? 'Revise el formato, por favor.' : 'Please check the format.'; }
    };
    function controlla(campo) {
      var box = campo.closest('.campo'); var err = box.querySelector('.errore');
      var v = campo.validity; var msg = '';
      if (!v.valid) msg = v.valueMissing ? messaggi.valueMissing() : messaggi.typeMismatch();
      box.classList.toggle('campo--errore', !!msg);
      campo.setAttribute('aria-invalid', msg ? 'true' : 'false');
      err.textContent = msg;
      return !msg;
    }
    var campi = modulo.querySelectorAll('input,select,textarea');
    campi.forEach(function (c) {
      c.addEventListener('blur', function () { if (c.value) controlla(c); });
      c.addEventListener('input', function () { if (c.closest('.campo').classList.contains('campo--errore')) controlla(c); });
    });
    modulo.addEventListener('submit', function (e) {
      e.preventDefault();
      var primo = null;
      campi.forEach(function (c) { if (!controlla(c) && !primo) primo = c; });
      if (primo) { primo.focus(); return; }
      var nome = (modulo.elements.nome.value || '').trim().split(/\s+/)[0];
      var conferma = document.getElementById('conferma');
      conferma.querySelector('[data-nome]').textContent = nome;
      modulo.hidden = true;
      var intro = document.querySelector('[data-intro-modulo]');
      if (intro) intro.hidden = true;
      conferma.hidden = false;
      conferma.querySelector('h2').focus();
    });
  }

  /* ---------- comparsa leggera ---------- */
  var rivela = document.querySelectorAll('.rivela');
  if ('IntersectionObserver' in window && rivela.length) {
    var io = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) { if (v.isIntersecting) { v.target.classList.add('visto'); io.unobserve(v.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rivela.forEach(function (r) { io.observe(r); });
  } else rivela.forEach(function (r) { r.classList.add('visto'); });
})();
