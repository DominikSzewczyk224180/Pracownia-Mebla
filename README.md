# Pracownia Mebla — Strona internetowa

## Struktura folderów

```
pracownia-mebla/
├── index.html
├── gallery-data.json          ← EDYTUJ TEN PLIK gdy dodajesz zdjęcia
├── css/
│   └── style.css
├── js/
│   └── main.js
└── images/
    ├── site/                  ← logo, budynek, inne stałe grafiki
    │   ├── logo.png
    │   ├── logo-white.png
    │   ├── building.png
    │   └── restaurant.png
    ├── Kuchnie nowoczesne/    ← zdjęcia kategorii
    │   ├── 1.png
    │   ├── 2.png
    │   └── 3.png
    ├── Kuchnie klasyczne/
    ├── Meble nietypowe/
    ├── Szafy/
    ├── Meble do lazienki/
    ├── Szafki do salonu/
    └── Kompleksowe realizacje/
```

## Jak dodać nowe zdjęcia

### 1. Wrzuć zdjęcie do odpowiedniego folderu
Np. nowe zdjęcie kuchni nowoczesnej → `images/Kuchnie nowoczesne/4.png`

### 2. Zaktualizuj `gallery-data.json`
Dodaj nazwę pliku do tablicy `photos`:

```json
{
  "name": "Kuchnie nowoczesne",
  "desc": "Minimalizm, naturalne drewno, czyste linie",
  "folder": "Kuchnie nowoczesne",
  "photos": ["1.png", "2.png", "3.png", "4.png"]
}
```

### 3. Gotowe!
Strona automatycznie pokaże nowe zdjęcie w karuzeli kategorii,
w galerii realizacji i w modalu po kliknięciu.

## Jak dodać nową kategorię

1. Utwórz nowy folder w `images/`, np. `images/Garderoby/`
2. Wrzuć do niego zdjęcia (1.png, 2.png, ...)
3. Dodaj nowy wpis w `gallery-data.json`:

```json
{
  "name": "Garderoby",
  "desc": "Garderoby na wymiar z systemem organizacji",
  "folder": "Garderoby",
  "photos": ["1.png", "2.png"]
}
```

## Uwagi
- Nazwy plików zdjęć mogą być dowolne (1.png, kuchnia-biala.jpg, itp.)
- Obsługiwane formaty: .png, .jpg, .jpeg, .webp
- Folder w `gallery-data.json` musi dokładnie odpowiadać nazwie folderu na dysku
- Polskie znaki w nazwie folderu na serwerze zamień na ASCII
  (np. "łazienki" → "lazienki") — w polu "name" mogą być polskie znaki
