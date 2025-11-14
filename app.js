
const CART_KEY = 'acai_cart_v3';

function getCart(){ try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }catch(e){ return []; } }
function saveCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); updateBadge(); }
function addToCart(item){
  const cart = getCart();
  const existing = cart.find(i=>i.id===item.id);
  if(existing){ existing.qty = Number(existing.qty) + Number(item.qty); }
  else{ cart.push(item); }
  saveCart(cart);
  toast(item.name + ' adicionado');
}
function changeQty(id, delta){
  const cart = getCart();
  const it = cart.find(i=>i.id===id);
  if(!it) return;
  it.qty = Number(it.qty) + Number(delta);
  if(it.qty <= 0){ const idx = cart.findIndex(i=>i.id===id); cart.splice(idx,1); }
  saveCart(cart);
  renderCartTable();
}
function removeItem(id){
  const cart = getCart();
  const idx = cart.findIndex(i=>i.id===id);
  if(idx>=0){ cart.splice(idx,1); saveCart(cart); renderCartTable(); }
}
function clearCart(){ localStorage.removeItem(CART_KEY); renderCartTable(); updateBadge(); }
function updateBadge(){ const el = document.getElementById('cart-count'); if(el) el.innerText = getCart().reduce((s,i)=>s+Number(i.qty),0); }

function renderCartTable(){
  const tbody = document.getElementById('cartTableBody');
  if(!tbody) return;
  const cart = getCart();
  tbody.innerHTML = '';
  let total = 0;
  cart.forEach(it=>{
    const price = parseFloat(it.price.replace('R$','').replace(',','.')) || 0;
    const lineTotal = price * Number(it.qty);
    total += lineTotal;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${it.name}</td>
      <td>
        <button class="qty-btn" onclick="changeQty('${it.id}', -1)">-</button>
        ${it.qty}
        <button class="qty-btn" onclick="changeQty('${it.id}', 1)">+</button>
      </td>
      <td>${it.price}</td>
      <td>R$${lineTotal.toFixed(2).replace('.',',')}</td>
      <td><button onclick="removeItem('${it.id}')">Remover</button></td>`;
    tbody.appendChild(tr);
  });
  const totalEl = document.getElementById('cartTotal');
  if(totalEl) totalEl.innerText = 'R$' + total.toFixed(2).replace('.',',');
  updateBadge();
}

function sendOrderToWhatsApp(){
  const cart = getCart();
  if(cart.length===0){ alert('Carrinho vazio'); return; }
  const nome = document.getElementById('nome').value || 'Cliente';
  const mesa = document.getElementById('mesa').value || '---';
  const pagamento = document.getElementById('pagamento').value || '---';
  const delivery = document.getElementById('delivery').checked ? 'Sim' : 'Não';
  let text = `Pedido%0ACliente: ${nome}%0AMesa: ${mesa}%0APagamento: ${pagamento}%0ADelivery: ${delivery}%0AItens:%0A`;
  cart.forEach(c=>{ text += `- ${c.name} x${c.qty} (${c.price})%0A`; });
  const phone = '558498813-3251';
  const url = `https://wa.me/${phone}?text=${text}`;
  window.open(url, '_blank');
}

/* small toast */
function toast(msg){
  let t = document.getElementById('toast');
  if(!t){
    t = document.createElement('div'); t.id='toast';
    t.style.position='fixed'; t.style.right='18px'; t.style.bottom='18px'; t.style.padding='12px 16px';
    t.style.background='rgba(0,0,0,0.6)'; t.style.color='white'; t.style.borderRadius='10px'; t.style.zIndex=2000;
    document.body.appendChild(t);
  }
  t.innerText = msg;
  t.style.opacity = 1;
  setTimeout(()=> t.style.opacity = 0, 1800);
}

/* simple translator using MyMemory */
function translatePage(lang){
  if(!lang) return;
  const nodes = document.querySelectorAll('[data-translate]');
  nodes.forEach(node=>{
    const original = node.getAttribute('data-original') || node.innerText;
    if(!node.getAttribute('data-original')) node.setAttribute('data-original', original);
    const q = encodeURIComponent(original);
    fetch(`https://api.mymemory.translated.net/get?q=${q}&langpair=pt|${lang}`)
      .then(r=>r.json())
      .then(d=>{ if(d && d.responseData && d.responseData.translatedText) node.innerText = d.responseData.translatedText; })
      .catch(e=>console.log('err',e));
  });
}

document.addEventListener('DOMContentLoaded', ()=>{ updateBadge(); renderCartTable(); });
