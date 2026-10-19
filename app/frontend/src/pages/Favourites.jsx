import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';
import FavouriteButton from '../components/FavouriteButton';
import OptimizedImage from '../components/OptimizedImage';
import { useFavourites } from '../context/FavouritesContext';
import { useCart } from '../context/CartContext';
import { favouriteKey } from '../lib/favourites';
import { displayPrice, formatMoney, productPackSizes, packLabel } from '../lib/cart';
import fallback from '../generated/catalog.json';
import menu from '../data/in-store-menu.json';
const snapshot = Object.fromEntries(fallback.map(item => [item.slug,item]));
const menuItems = Object.fromEntries(menu.map(item => [item.slug,item]));
export default function Favourites() {
  const {items, ready, storageError, toggle} = useFavourites();
  const {catalog, catalogStatus, refreshCatalog} = useCart();
  const [compare,setCompare] = useState(false);
  const products = catalogStatus === 'ready' ? catalog : {...snapshot,...catalog};
  const rows = items.map(ref => ({ref,item:(ref.kind === 'menu' ? menuItems : products)[ref.slug]}));
  const price = row => row.ref.kind === 'menu' ? row.item.priceLabel || formatMoney(row.item.price * 100) : displayPrice(row.item);
  const status = row => row.ref.kind === 'menu' ? row.item.availability || 'In store only' : row.item.availability || 'Check with store';
  const packs = row => row.ref.kind === 'menu' ? row.item.priceLabel ? 'Ask in store' : row.item.iceCream ? 'Ice cream +Rs 20' : 'Per serving' : row.item.sale_unit === 'kg' ? productPackSizes(row.item).map(packLabel).join(' / ') : row.item.sale_unit || 'Enquire with store';
  return <div className="container-x py-8 sm:py-12">
    <SEO title="Your Favourites | PAHWA JEE" noindex />
    <div className="flex flex-wrap justify-between items-start gap-4">
      <div><h1 className="text-3xl sm:text-4xl font-serif">Your favourites</h1><p className="mt-3 text-sm text-muted-foreground">Save items with the heart, compare prices here, then choose what to order.</p><p className="mt-2 text-xs text-muted-foreground">Saved in this browser. No account needed.</p></div>
      <Link to="/cart" className="btn-outline">View cart</Link>
    </div>
    {storageError && <p role="alert" className="mt-4 rounded-xl border border-border p-3 text-sm">Browser storage is unavailable. Your favourites will last only until you close or reload this page.</p>}
    {!ready ? <p role="status" className="py-12">Loading favourites...</p> : !rows.length ? <div className="py-16 text-center"><Heart className="mx-auto mb-4 text-primary" size={36} aria-hidden="true" /><h2 className="text-xl font-serif">No favourites yet</h2><p className="mt-3 text-sm text-muted-foreground">Tap a heart on a product or menu item to save it here.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link to="/products" className="btn-primary">Browse sweets</Link><Link to="/in-store-menu" className="btn-outline">In-store menu</Link></div></div> : <>
      <div className="my-6 flex flex-wrap items-center justify-between gap-3"><p className="text-sm">{rows.length} saved {rows.length === 1 ? 'item' : 'items'}</p><button type="button" aria-pressed={compare} onClick={() => setCompare(value=>!value)} className="btn-outline min-h-11">{compare ? 'Show product cards' : 'Compare prices'}</button></div>
      {catalogStatus !== 'ready' && rows.some(row=>row.ref.kind==='product') && <p role="status" className="mb-4 text-sm text-muted-foreground">{catalogStatus==='error' ? 'Live prices could not be loaded. Showing the last saved catalogue; reload the catalogue before ordering.' : 'Checking current prices and availability...'}</p>}
      {catalogStatus === 'error' && rows.some(row=>row.ref.kind==='product') && <button type="button" onClick={()=>refreshCatalog().catch(()=>{})} className="mb-4 min-h-11 text-sm underline">Reload current prices</button>}
      {compare ? <><p className="mb-3 text-xs text-muted-foreground">Compare the listed rates and pack sizes. On a small screen, swipe the table sideways.</p><div role="region" aria-label="Favourite price comparison" tabIndex={0} className="overflow-x-auto rounded-xl border border-border focus-visible:outline-primary"><table className="w-full min-w-[620px] text-sm text-left"><caption className="sr-only">Saved items, prices, pack sizes and availability</caption><thead className="bg-card"><tr>{['Item','Rate','Pack / serving','Availability',''].map((heading,index)=><th key={index} scope="col" className="p-4 font-semibold">{heading}</th>)}</tr></thead><tbody>{rows.filter(row=>row.item).map(row=><tr key={favouriteKey(row.ref)} className="border-t border-border"><th scope="row" className="p-4"><Link className="underline underline-offset-4" to={row.ref.kind==='product' ? '/products/'+row.item.slug : '/in-store-menu'}>{row.item.name}</Link></th><td className="p-4 whitespace-nowrap">{price(row)}</td><td className="p-4">{packs(row)}</td><td className="p-4">{status(row)}</td><td className="p-3"><FavouriteButton item={row.item} kind={row.ref.kind} /></td></tr>)}</tbody></table></div></> :
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">{rows.filter(row=>row.item).map(row=>row.ref.kind==='product' ? <ProductCard key={favouriteKey(row.ref)} product={row.item} /> : <article key={favouriteKey(row.ref)} className="card-warm overflow-hidden"><div className="relative aspect-square"><OptimizedImage square src={row.item.image} alt={row.item.name} sizes="(min-width:1280px) 300px, 50vw" className="absolute inset-0 h-full w-full object-cover" /><FavouriteButton item={row.item} kind="menu" className="absolute top-2 right-2" />{row.item.representative && <span className="absolute bottom-2 right-2 rounded bg-background/95 px-2 py-1 text-[11px]">Illustrative</span>}</div><div className="p-3 sm:p-4"><h2 className="text-base sm:text-xl font-serif">{row.item.name}</h2><p className="mt-2 font-semibold">{price(row)}</p><p className="mt-2 text-xs text-muted-foreground">{status(row)}{row.item.iceCream ? ' / Ice cream +Rs 20' : ''}</p><Link className="inline-flex min-h-11 items-center mt-2 text-sm underline" to="/in-store-menu">View in-store menu</Link></div></article>)}</div>}
      {rows.filter(row=>!row.item).map(row=><div key={favouriteKey(row.ref)} className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"><p className="text-sm">{row.ref.slug.replaceAll('-',' ')}: {row.ref.kind === 'menu' || catalogStatus === 'ready' ? 'no longer listed' : 'current details unavailable'}.</p><button type="button" className="btn-outline min-h-11" onClick={()=>toggle(row.ref,row.ref.slug)}>Remove unavailable favourite</button></div>)}
    </>}
  </div>;
}
