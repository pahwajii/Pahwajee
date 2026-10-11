import test from 'node:test';
import assert from 'node:assert/strict';
import {restoreFavourites,toggleFavourite,favouriteKey} from './favourites.js';
test('favourites restore safely, deduplicate and keep menu and shop IDs distinct',()=>{
  for(const raw of ['bad','null','{}','42']) assert.deepEqual(restoreFavourites(raw),[]);
  const raw=[{kind:'product',slug:'mango-bite',price:1},{kind:'product',slug:'mango-bite'},{kind:'menu',slug:'mango-bite'},{kind:'product',slug:'../admin'},{kind:'other',slug:'test'},null];
  assert.deepEqual(restoreFavourites(JSON.stringify(raw)),[{kind:'product',slug:'mango-bite'},{kind:'menu',slug:'mango-bite'}]);
});
test('saving and removing survives serialization without touching other saved items',()=>{
  const a={kind:'product',slug:'gond-laddoo'}, b={kind:'menu',slug:'lassi'};
  let items=toggleFavourite([],a); items=toggleFavourite(items,b);
  assert.equal(items.length,2);
  items=restoreFavourites(JSON.stringify(items));
  assert.deepEqual(toggleFavourite(items,a),[b]);
  assert.deepEqual(toggleFavourite([b],b),[]);
  assert.deepEqual(toggleFavourite(items,{kind:'product',slug:'invalid slug'}),items);
  assert.notEqual(favouriteKey(a),favouriteKey({...a,kind:'menu'}));
});
test('oversized storage is bounded and strips untrusted fields',()=>{
  const raw=Array.from({length:150},(_,i)=>({kind:'product',slug:'item-'+i,html:'<script>',price:1}));
  const items=restoreFavourites(JSON.stringify(raw));
  assert.equal(items.length,100);
  assert.deepEqual(Object.keys(items[0]),['kind','slug']);
});
