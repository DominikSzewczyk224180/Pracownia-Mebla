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

  // First 2 = big cards directly in grid, rest = small in sub-grid rows of 3
  const bigCats = categories.slice(0, 2);
  const smallCats = categories.slice(2);

  bigCats.forEach(cat => {
    grid.appendChild(createCatCard(cat, 'cat-big'));
  });

  // Small cards in a sub-grid container (rows of 3)
  if (smallCats.length > 0) {
    const subGrid = document.createElement('div');
    subGrid.className = 'products-grid-small';
    smallCats.forEach(cat => {
      subGrid.appendChild(createCatCard(cat, 'cat-small'));
    });
    grid.appendChild(subGrid);
  }
}

function createCatCard(cat, sizeClass) {
  const allPaths = cat.photos.map(p => IMG_BASE + cat.folder + '/' + p);
  const sliderPaths = allPaths.slice(0, 5);
  const count = allPaths.length;
  const countLabel = count === 1 ? '1 zdjęcie' : count < 5 ? count + ' zdjęcia' : count + ' zdjęć';

  const card = document.createElement('div');
  card.className = 'cat-card ' + sizeClass + ' reveal';
  card.dataset.category = cat.name;
  card.dataset.images = allPaths.join(',');

  // Only first image loads immediately, rest use data-src (lazy)
  card.innerHTML =
    '<div class="cat-slider">' +
      sliderPaths.map((src, i) => {
        if (i === 0) {
          return '<img src="' + src + '" alt="' + cat.name + '" class="active">';
        }
        return '<img data-src="' + src + '" alt="' + cat.name + '">';
      }).join('') +
    '</div>' +
    '<span class="cat-count">' + countLabel + '</span>' +
    '<div class="cat-overlay">' +
      '<h3>' + cat.name + '</h3>' +
      '<p>' + cat.desc + '</p>' +
      '<div class="cat-dots"></div>' +
      '<span class="cat-browse">Zobacz galerię <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>' +
    '</div>';

  return card;
}

// ========== REALIZACJE — show 8 random, load more on click ==========
let allGalleryImages = [];
let galleryShown = 0;
const GALLERY_BATCH = 8;

function buildGalleryMasonry(categories) {
  const masonry = document.getElementById('galleryMasonry');
  if (!masonry) return;

  // Collect all images with category labels
  categories.forEach(cat => {
    cat.photos.forEach(p => {
      allGalleryImages.push({
        src: IMG_BASE + cat.folder + '/' + p,
        cat: cat.name
      });
    });
  });

  // Shuffle
  for (let i = allGalleryImages.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allGalleryImages[i], allGalleryImages[j]] = [allGalleryImages[j], allGalleryImages[i]];
  }

  // Show first batch
  showMoreGallery();
}

function showMoreGallery() {
  const masonry = document.getElementById('galleryMasonry');
  const end = Math.min(galleryShown + GALLERY_BATCH, allGalleryImages.length);

  for (let i = galleryShown; i < end; i++) {
    const img = allGalleryImages[i];
    const item = document.createElement('div');
    item.className = 'gallery-item reveal';
    item.innerHTML = '<img src="' + img.src + '" alt="' + img.cat + '" loading="lazy">';
    item.addEventListener('click', () => {
      document.getElementById('lightboxImg').src = img.src;
      document.getElementById('lightbox').classList.add('open');
    });
    masonry.appendChild(item);
  }

  galleryShown = end;

  // Update or hide "load more" button
  const btn = document.getElementById('galleryLoadMore');
  if (btn) {
    if (galleryShown >= allGalleryImages.length) {
      btn.style.display = 'none';
    } else {
      btn.textContent = 'Pokaż więcej (' + (allGalleryImages.length - galleryShown) + ' pozostało)';
    }
  }

  // Re-init reveal for new items
  initReveal();
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

    // Lazy-load: move data-src to src when needed
    function ensureLoaded(index) {
      var img = images[index];
      if (img.dataset.src && !img.src) {
        img.src = img.dataset.src;
        delete img.dataset.src;
      }
    }

    function goTo(index) {
      ensureLoaded(index);
      // Also preload next one
      ensureLoaded((index + 1) % count);
      images[current].classList.remove('active');
      current = index;
      images[current].classList.add('active');
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function next() { goTo((current + 1) % count); }

    function startAuto() {
      if (count > 1) interval = setInterval(next, 4000);
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
