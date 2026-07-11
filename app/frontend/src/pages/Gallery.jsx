import { useEffect, useMemo, useState } from 'react';
import { Camera, ImageOff, LoaderCircle, Search, X } from 'lucide-react';

const fallbackPhotos = [];

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
    };
  }

  const src = item.src || item.image || '';
  return {
    id: item.id || src || `gallery-${index}`,
    src: src.startsWith('/') ? src : `/${src}`,
    title: item.title || titleFromPath(src),
    alt: item.alt || item.title || titleFromPath(src),
    category: item.category,
  };
}

export default function Gallery() {
  const [photos, setPhotos] = useState(fallbackPhotos);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [query, setQuery] = useState('');
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
    if (!search) return photos;

    return photos.filter((photo) => {
      const text = `${photo.title} ${photo.alt} ${photo.category || ''}`.toLowerCase();
      return text.includes(search);
    });
  }, [photos, query]);

  return (
    <div className="noise-bg">
      <section className="container-x section-y">
        <div className="grid gap-8 pt-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="eyebrow">PAHWA JEE Gallery</p>
            <h1 className="mt-4 max-w-3xl text-5xl leading-none md:text-6xl">Fresh counters, celebrations and daily favourites.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              A look at the sweets, bakery, shakes, hampers and moments from our Meerut store.
            </p>
          </div>

          <div className="glass rounded-lg p-4">
            <label className="flex items-center gap-3 rounded-lg border border-border bg-white px-4 py-3">
              <Search size={18} className="shrink-0 text-primary" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search gallery"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
            <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
              <Camera size={17} className="text-secondary" />
              <span>{photos.length} photos of our products and more </span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-14 grid min-h-64 place-items-center rounded-lg border border-border/70 bg-white/40">
            <LoaderCircle className="animate-spin text-primary" size={30} />
          </div>
        ) : filteredPhotos.length ? (
          <div className="mt-14 columns-1 gap-5 sm:columns-2 lg:columns-3">
            {filteredPhotos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setSelectedPhoto(photo)}
                className="group mb-5 block w-full break-inside-avoid overflow-hidden rounded-lg border border-border/70 bg-white text-left shadow-[0_10px_28px_rgb(44,30,22,0.08)]"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className={`w-full object-cover transition duration-500 group-hover:scale-[1.03] ${
                    index % 5 === 0 ? 'aspect-[4/5]' : index % 3 === 0 ? 'aspect-[5/4]' : 'aspect-square'
                  }`}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-14 grid min-h-80 place-items-center rounded-lg border border-dashed border-primary/30 bg-white/45 px-6 text-center">
            <div className="max-w-md">
              <ImageOff className="mx-auto text-primary" size={38} />
              <h2 className="mt-5 font-serif text-3xl">No gallery photos found</h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                Add image files to <span className="font-semibold text-foreground">app/frontend/public</span> and list them in <span className="font-semibold text-foreground">gallery.json</span>.
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
            className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white text-foreground"
            onClick={() => setSelectedPhoto(null)}
          >
            <X size={20} />
          </button>
          <img
            src={selectedPhoto.src}
            alt={selectedPhoto.alt}
            className="max-h-[86vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
}
