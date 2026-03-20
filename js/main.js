// ========== NAV SCROLL ==========
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 80);
});

// ========== MOBILE MENU ==========
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.add('open');
});
document.getElementById('mobileClose').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.remove('open');
});
function closeMobile() { document.getElementById('mobileMenu').classList.remove('open'); }
window.closeMobile = closeMobile;

// ========== SCROLL REVEAL ==========
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}
initReveal();

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ========== LOAD GALLERY DATA & BUILD CARDS ==========
const IMG_BASE = 'images/';

fetch('gallery-data.json')
  .then(r => r.json())
  .then(categories => {
    buildCategoryCards(categories);
    buildGalleryMasonry(categories);
    initSliders();
    // Re-init reveal for dynamically added elements
    initReveal();
  })
  .catch(err => console.error('Could not load gallery-data.json:', err));

function buildCategoryCards(categories) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  categories.forEach(cat => {
    const paths = cat.photos.map(p => IMG_BASE + cat.folder + '/' + p);
    const count = paths.length;
    const countLabel = count === 1 ? '1 zdjęcie' : count < 5 ? count + ' zdjęcia' : count + ' zdjęć';

    const card = document.createElement('div');
    card.className = 'cat-card reveal';
    card.dataset.category = cat.name;
    card.dataset.images = paths.join(',');

    card.innerHTML =
      '<div class="cat-slider">' +
        paths.map(src => '<img src="' + src + '" alt="' + cat.name + '" loading="lazy">').join('') +
      '</div>' +
      '<span class="cat-count">' + countLabel + '</span>' +
      '<div class="cat-overlay">' +
        '<h3>' + cat.name + '</h3>' +
        '<p>' + cat.desc + '</p>' +
        '<div class="cat-dots"></div>' +
        '<span class="cat-browse">Zobacz galerię <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>' +
      '</div>';

    grid.appendChild(card);
  });
}

function buildGalleryMasonry(categories) {
  const masonry = document.getElementById('galleryMasonry');
  if (!masonry) return;

  // Collect all images from all categories, shuffled
  const allImages = [];
  categories.forEach(cat => {
    cat.photos.forEach(p => {
      allImages.push(IMG_BASE + cat.folder + '/' + p);
    });
  });

  // Simple shuffle
  for (let i = allImages.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allImages[i], allImages[j]] = [allImages[j], allImages[i]];
  }

  allImages.forEach(src => {
    const item = document.createElement('div');
    item.className = 'gallery-item reveal';
    item.innerHTML = '<img src="' + src + '" alt="Realizacja" loading="lazy">';
    masonry.appendChild(item);
  });

  // Lightbox for gallery items
  masonry.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      document.getElementById('lightboxImg').src = item.querySelector('img').src;
      document.getElementById('lightbox').classList.add('open');
    });
  });
}

// ========== CATEGORY CARD SLIDERS ==========
function initSliders() {
  document.querySelectorAll('.cat-card').forEach(card => {
    const slider = card.querySelector('.cat-slider');
    const images = slider.querySelectorAll('img');
    const dotsContainer = card.querySelector('.cat-dots');
    const count = images.length;
    let current = 0;
    let interval;

    // Create dots
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('span');
      dot.className = 'cat-dot' + (i === 0 ? ' active' : '');
      dotsContainer.appendChild(dot);
    }
    const dots = dotsContainer.querySelectorAll('.cat-dot');

    function goTo(index) {
      current = index;
      slider.style.transform = 'translateX(-' + (current * 100) + '%)';
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function next() { goTo((current + 1) % count); }

    function startAuto() {
      if (count > 1) interval = setInterval(next, 3500);
    }
    function stopAuto() { clearInterval(interval); }

    startAuto();
    card.addEventListener('mouseenter', stopAuto);
    card.addEventListener('mouseleave', startAuto);

    // Click opens gallery
    card.addEventListener('click', () => openCatGallery(card));
  });
}

// ========== CATEGORY GALLERY MODAL ==========
const catGallery = document.getElementById('catGallery');
const catGalleryImg = document.getElementById('catGalleryImg');
const catGalleryTitle = document.getElementById('catGalleryTitle');
const catGalleryCounter = document.getElementById('catGalleryCounter');
const catGalleryThumbs = document.getElementById('catGalleryThumbs');

let catImages = [];
let catCurrent = 0;

function openCatGallery(card) {
  catImages = card.dataset.images.split(',');
  catCurrent = 0;
  catGalleryTitle.textContent = card.dataset.category;

  // Build thumbs
  catGalleryThumbs.innerHTML = '';
  catImages.forEach((src, i) => {
    const thumb = document.createElement('div');
    thumb.className = 'cat-gallery-thumb' + (i === 0 ? ' active' : '');
    thumb.innerHTML = '<img src="' + src + '" alt="Zdjęcie ' + (i + 1) + '">';
    thumb.addEventListener('click', (e) => {
      e.stopPropagation();
      catCurrent = i;
      updateCatGallery();
    });
    catGalleryThumbs.appendChild(thumb);
  });

  updateCatGallery();
  catGallery.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function updateCatGallery() {
  catGalleryImg.src = catImages[catCurrent];
  catGalleryCounter.textContent = (catCurrent + 1) + ' / ' + catImages.length;
  catGalleryThumbs.querySelectorAll('.cat-gallery-thumb')
    .forEach((t, i) => t.classList.toggle('active', i === catCurrent));
}

function closeCatGallery() {
  catGallery.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('catGalleryClose').addEventListener('click', closeCatGallery);
catGallery.addEventListener('click', (e) => { if (e.target === catGallery) closeCatGallery(); });

document.getElementById('catPrev').addEventListener('click', (e) => {
  e.stopPropagation();
  catCurrent = (catCurrent - 1 + catImages.length) % catImages.length;
  updateCatGallery();
});

document.getElementById('catNext').addEventListener('click', (e) => {
  e.stopPropagation();
  catCurrent = (catCurrent + 1) % catImages.length;
  updateCatGallery();
});

// ========== KEYBOARD NAV ==========
document.addEventListener('keydown', (e) => {
  if (catGallery.classList.contains('open')) {
    if (e.key === 'Escape') closeCatGallery();
    if (e.key === 'ArrowLeft') { catCurrent = (catCurrent - 1 + catImages.length) % catImages.length; updateCatGallery(); }
    if (e.key === 'ArrowRight') { catCurrent = (catCurrent + 1) % catImages.length; updateCatGallery(); }
    return;
  }
  const lb = document.getElementById('lightbox');
  if (e.key === 'Escape' && lb.classList.contains('open')) lb.classList.remove('open');
});

// ========== LIGHTBOX CLOSE ==========
const lightbox = document.getElementById('lightbox');
lightbox.addEventListener('click', (e) => {
  if (e.target !== document.getElementById('lightboxImg')) lightbox.classList.remove('open');
});
