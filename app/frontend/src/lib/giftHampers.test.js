import test from 'node:test';
import assert from 'node:assert/strict';
import { HAMPER_COLLECTION_SLUG, designsFor, giftHamperDesigns, hamperEnquiry, hamperPath, productGallery, selectedGalleryIndex } from './giftHampers.js';

test('replacing a legacy collection cover keeps all existing design identities', () => {
  const product = { slug: HAMPER_COLLECTION_SLUG, image: '/api/product-images/new-cover.webp', images: ['/api/product-images/new-cover.webp'] };
  assert.deepEqual(designsFor(product).map((design) => design.id), giftHamperDesigns.map((design) => design.id));
  assert.equal(designsFor(null).length, 0);
});

test('managed design photos and names win over old gallery filenames', () => {
  const updated = giftHamperDesigns.map((design) => design.id === 'golden-platter'
    ? { ...design, name: 'Golden celebration platter', image: '/api/product-images/updated.webp' }
    : design);
  const product = { slug: HAMPER_COLLECTION_SLUG, images: giftHamperDesigns.map((design) => design.image), gift_designs: updated };
  assert.deepEqual(designsFor(product), updated);
  assert.deepEqual(productGallery(product), updated);
  assert.deepEqual(designsFor({ ...product, gift_designs: [] }), []);
  assert.equal(designsFor({ ...product, gift_designs: null }).length, 7);
});

test('selected design survives photo replacement and gallery reorder', () => {
  const selected = 'golden-platter';
  const original = productGallery({ slug: HAMPER_COLLECTION_SLUG });
  assert.equal(original[selectedGalleryIndex(original, selected)].name, 'Golden Dry Fruit Platter');
  const refreshed = [...original].reverse().map((design) => design.id === selected ? { ...design, image: '/new-golden.webp' } : design);
  assert.equal(refreshed[selectedGalleryIndex(refreshed, selected)].image, '/new-golden.webp');
  assert.equal(selectedGalleryIndex(refreshed, 'removed-design'), 0);
  assert.equal(selectedGalleryIndex([], selected), 0);
});

test('links and enquiry drafts retain the exact design and correctly resolve uploaded or external photos', () => {
  for (const design of giftHamperDesigns) {
    const url = new URL(hamperPath(design), 'https://pahwajee.in');
    assert.equal(url.pathname, '/products/dry-fruit-gift-trays');
    assert.equal(url.searchParams.get('design'), design.id);
    assert.ok(hamperEnquiry(design).includes(design.name));
    assert.ok(hamperEnquiry(design).includes(`https://pahwajee.in${design.image}`));
  }
  const external = { id: 'golden-platter', name: 'Golden platter', image: 'https://images.example.com/platter.webp' };
  assert.ok(hamperEnquiry(external).includes('Photo: https://images.example.com/platter.webp.'));
  assert.ok(hamperEnquiry({ ...external, image: 'https://' }).includes('Golden platter. Please confirm'));
  const duplicatePhotoDesigns = [giftHamperDesigns[4], { ...giftHamperDesigns[6], image: giftHamperDesigns[4].image }];
  assert.equal(designsFor({ gift_designs: duplicatePhotoDesigns }).length, 2);
  assert.notEqual(hamperPath(duplicatePhotoDesigns[0]), hamperPath(duplicatePhotoDesigns[1]));
});

test('ordinary product galleries preserve photo selection without becoming hamper designs', () => {
  const gallery = productGallery({ slug: 'ordinary-sweet', name: 'Sweet', image: '/cover.webp', images: ['/one.webp', '/two.webp'] });
  assert.equal(gallery[selectedGalleryIndex(gallery, '/two.webp')].image, '/two.webp');
  assert.equal(productGallery({ slug: 'ordinary-sweet', name: 'Sweet', image: '/cover.webp' })[0].image, '/cover.webp');
});
