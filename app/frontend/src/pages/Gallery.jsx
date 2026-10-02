import { useEffect, useMemo, useState } from 'react';
import { Camera, ImageOff, LoaderCircle, Search, X } from 'lucide-react';
import SEO from '../components/SEO';

const fallbackPhotos = [];

const categories = [
  { label: 'All Photos', value: 'all' },
  { label: 'Rewri', value: 'Rewri' },
  { label: 'Gajak', value: 'Gajak' },
  { label: 'Nankhatai', value: 'Nankhatai' },
  { label: 'Gift Hampers', value: 'Hampers' },
  { label: 'Sweets', value: 'Sweets' },
  { label: 'Store Front', value: 'Store' },
  { label: 'Food Adda Vertical', value: 'Food Adda' }
];

function titleFromPath(src) {
  const file = src.split('/').pop() || 'Gallery photo';
  return file
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizePhoto(item, index) {
  if (typeof item === 'string') {
    return {
      id: item,
      src: item.startsWith('/') ? item : `/${item}`,
      title: titleFromPath(item),
      alt: titleFromPath(item),
      category: 'Store'
    };
  }

  const src = item.src || item.image || '';
  return {
    id: item.id || src || `gallery-${index}`,
    src: src.startsWith('/') ? src : `/${src}`,
    title: item.title || titleFromPath(src),
    alt: item.alt || item.title || titleFromPath(src),
    category: item.category || 'Store',
  };
}

export default function Gallery() {
  const [photos, setPhotos] = useState(fallbackPhotos);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/gallery.json')
      .then((response) => (response.ok ? response.json() : []))
      .then((items) => {
        const normalized = Array.isArray(items) ? items.map(normalizePhoto).filter((photo) => photo.src) : [];
        setPhotos(normalized);
      })
      .catch(() => setPhotos(fallbackPhotos))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredPhotos = useMemo(() => {
    const search = query.trim().toLowerCase();

    return photos.filter((photo) => {
      const categoryMatch = activeCategory === 'all' || photo.category === activeCategory;
      const textMatch = !search || `${photo.title} ${photo.alt} ${photo.category || ''}`.toLowerCase().includes(search);
      return categoryMatch && textMatch;
    });
  }, [photos, query, activeCategory]);

  return (
    <div className="noise-bg pb-16 pt-8">
      <SEO 
        title="Store Gallery & Product Photography | PAHWAJEE Meerut"
        description="Browse authentic photos of PAHWAJEE's Desi Ghee Nankhatai, Punjabi Rewri, winter Gajak, festive dry fruit hampers, and Abu Lane store front in Meerut."
      />

      <section className="container-x">
        <div className="grid gap-8 pt-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="eyebrow">PAHWAJEE Photo Gallery</p>
            <h1 className="mt-4 max-w-3xl text-5xl leading-none md:text-6xl font-serif">Sweets, hampers, and store counters.</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
              A visual tour of our traditional sweets, winter rewri & gajak, desi ghee nankhatai, and festive gifting collections in Meerut.
            </p>
          </div>

          <div className="glass rounded-xl p-4">
            <label className="flex items-center gap-3 rounded-lg border border-border bg-white px-4 py-3">
              <Search size={18} className="shrink-0 text-primary" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search photos e.g. rewri, nankhatai, hampers..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
            <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
              <Camera size={16} className="text-secondary" />
              <span>Showing {filteredPhotos.length} of {photos.length} real photos</span>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setActiveCategory(cat.value)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition-all duration-300 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-primary/20'
                    : 'border border-border bg-white/80 dark:bg-card/70 text-foreground hover:border-primary/40 hover:text-primary'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="mt-10 grid min-h-64 place-items-center rounded-2xl border border-border/70 bg-white/40 dark:bg-card/30">
            <LoaderCircle className="animate-spin text-primary" size={30} />
          </div>
        ) : filteredPhotos.length ? (
          <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
            {filteredPhotos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setSelectedPhoto(photo)}
                className="group mb-5 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-border/70 bg-white text-left shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white font-serif text-sm font-semibold">{photo.title}</p>
                    <span className="text-[10px] text-secondary tracking-widest uppercase font-medium">{photo.category}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-10 grid min-h-80 place-items-center rounded-2xl border border-dashed border-primary/30 bg-white/45 dark:bg-card/30 px-6 text-center">
            <div className="max-w-md">
              <ImageOff className="mx-auto text-primary" size={38} />
              <h2 className="mt-5 font-serif text-3xl">No photos found</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                No gallery images match the selected filter. Try choosing another category or clearing search.
              </p>
            </div>
          </div>
        )}
      </section>

      {selectedPhoto ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/85 p-4 backdrop-blur-sm" onClick={() => setSelectedPhoto(null)}>
          <button
            type="button"
            aria-label="Close gallery photo"
            className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white text-foreground hover:scale-110 transition"
            onClick={() => setSelectedPhoto(null)}
          >
            <X size={20} />
          </button>
          <div className="max-h-[90vh] max-w-[92vw] text-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedPhoto.src}
              alt={selectedPhoto.alt}
              className="max-h-[80vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl mx-auto"
            />
            <p className="text-white font-serif text-xl mt-4 font-semibold">{selectedPhoto.title}</p>
            <p className="text-secondary text-xs uppercase tracking-wider">{selectedPhoto.category}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
