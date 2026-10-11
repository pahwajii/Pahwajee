import { Heart } from 'lucide-react';
import { useFavourites } from '../context/FavouritesContext';
export default function FavouriteButton({item, kind = 'product', label = false, className = ''}) {
  const {ready, isSaved, toggle} = useFavourites();
  const ref = {kind, slug:item.slug};
  const saved = isSaved(ref);
  return <button type="button" disabled={!ready} aria-pressed={saved} aria-label={`${saved ? 'Remove' : 'Save'} ${item.name} ${saved ? 'from' : 'to'} favourites`} onClick={() => toggle(ref, item.name)} className={`inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-full border border-border bg-background/95 px-3 text-primary shadow-sm hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 ${className}`}>
    <Heart size={19} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />{label && <span className="text-sm font-semibold">{saved ? 'Saved to favourites' : 'Save to favourites'}</span>}
  </button>;
}
