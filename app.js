const CATEGORIES = [
  { id: 'all', title: 'Все', icon: '✦' },
  { id: 'remont', title: 'Дом и ремонт', icon: '⌂' },
  { id: 'auto', title: 'Автоуслуги', icon: '↗' },
  { id: 'beauty', title: 'Красота и уход', icon: '✳' },
  { id: 'food', title: 'Еда и кондитерские', icon: '◒' },
  { id: 'photo', title: 'Фото и творчество', icon: '▣' },
  { id: 'fitness', title: 'Фитнес', icon: '⌁' }
];

const masters = Array.isArray(window.BLIZHE_MASTERS) ? window.BLIZHE_MASTERS : [];
const catById = Object.fromEntries(CATEGORIES.map(item => [item.id, item]));
const categoriesEl = document.getElementById('categories');
const masterListEl = document.getElementById('master-list');
const emptyEl = document.getElementById('empty-state');

function safeUrl(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const parsed = new URL(url);
    return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : null;
  } catch { return null; }
}
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = String(text);
  return node;
}
function currentCategory() {
  const id = new URLSearchParams(location.search).get('category') || 'all';
  return catById[id] ? id : 'all';
}
function changeCategory(id) {
  const url = new URL(location.href);
  if (id === 'all') url.searchParams.delete('category');
  else url.searchParams.set('category', id);
  history.pushState({ category: id }, '', url);
  render();
}
function renderCategories(active) {
  categoriesEl.replaceChildren();
  CATEGORIES.forEach(category => {
    const count = category.id === 'all' ? masters.length : masters.filter(m => m.category === category.id).length;
    const button = el('button', 'category' + (active === category.id ? ' active' : ''));
    button.type = 'button';
    button.setAttribute('aria-pressed', String(active === category.id));
    button.append(el('span', 'category-icon', category.icon), el('span', 'category-name', category.title), el('span', 'category-count', count));
    button.addEventListener('click', () => changeCategory(category.id));
    categoriesEl.append(button);
  });
}
function renderMaster(master) {
  const card = el('article', 'master-card');
  const imageBox = el('div', 'master-art');
  const image = safeUrl(master.image);
  if (image) {
    const img = el('img'); img.src = image; img.alt = 'Работа или фотография: ' + master.name; img.loading = 'lazy';
    imageBox.append(img);
  } else {
    imageBox.classList.add('master-art-placeholder');
    imageBox.append(el('span', 'art-symbol', catById[master.category]?.icon || '✦'));
    imageBox.append(el('span', 'art-word', 'БЛИЖЕ.'));
  }
  const content = el('div', 'master-content');
  content.append(el('span', 'master-tag', catById[master.category]?.title || 'Услуги'));
  content.append(el('h3', '', master.name));
  content.append(el('div', 'master-service', master.service));
  content.append(el('p', 'master-description', master.description));
  const bottom = el('div', 'card-bottom');
  const area = el('div', 'area', '⌖  ' + (master.area || 'Сестрорецк'));
  const price = el('div', 'price', master.price || 'По договорённости');
  bottom.append(area, price);
  content.append(bottom);
  const url = safeUrl(master.contactUrl);
  if (url) {
    const contact = el('a', 'contact-button', 'Связаться с мастером ↗');
    contact.href = url; contact.target = '_blank'; contact.rel = 'noopener noreferrer';
    content.append(contact);
  } else {
    content.append(el('div', 'contact-placeholder', 'Контакт скоро появится'));
  }
  card.append(imageBox, content);
  return card;
}
function render() {
  const active = currentCategory();
  renderCategories(active);
  const filtered = active === 'all' ? masters : masters.filter(master => master.category === active);
  document.getElementById('results-title').textContent = active === 'all' ? 'Все специалисты' : catById[active].title;
  document.getElementById('results-subtitle').textContent = active === 'all' ? 'Мастера и услуги рядом с вами.' : `Найдено предложений: ${filtered.length}`;
  document.getElementById('count-label').textContent = `${masters.length} предложения`;
  masterListEl.replaceChildren(...filtered.map(renderMaster));
  emptyEl.hidden = filtered.length > 0;
}
window.addEventListener('popstate', render);
document.getElementById('year').textContent = new Date().getFullYear();
render();
