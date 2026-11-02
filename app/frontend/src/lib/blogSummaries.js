// Listing metadata only. Article bodies load with the article route.
export const blogSummaries = [
  {
    "slug": "why-meerut-famous-rewri-gajak-nankhatai",
    "title": "Why Meerut Is Famous for Rewri, Gajak and Nankhatai",
    "seoTitle": "Why Meerut Is Famous for Rewri, Gajak & Nankhatai",
    "description": "Explore Meerut’s Rewri, Gajak and Nankhatai tradition: winter sweets, skilled sugar work, crumbly biscuits and what to try at Pahwajee, Abu Lane.",
    "excerpt": "The ingredients, craftsmanship and everyday occasions behind Meerut’s best-known sweet specialities.",
    "image": "/our_shop_main.jpeg",
    "imageAlt": "Pahwajee’s sweet shop frontage in Abu Lane, Meerut",
    "datePublished": "2026-10-20"
  },
  {
    "slug": "nankhatai-ingredients-guide",
    "title": "Nankhatai Ingredients: What Gives It a Crumbly Bite?",
    "seoTitle": "Nankhatai Ingredients Explained | Pahwajee Meerut",
    "description": "Learn the roles of flour, ghee, sugar, besan, sooji and cardamom in Nankhatai, then compare Pahwajee’s Desi Ghee and Vanaspati varieties in Meerut.",
    "excerpt": "A clear guide to the flour, fat, sugar and flavourings behind a favourite tea-time biscuit.",
    "image": "/blog/nankhatai-ingredients.webp",
    "imageAlt": "Illustration of Nankhatai with flour, besan, semolina, sugar, ghee, cardamom and nuts",
    "datePublished": "2026-10-20"
  },
  {
    "slug": "how-rewri-is-made-ingredients-process",
    "title": "What Is Rewri? Ingredients and How It Is Made",
    "seoTitle": "What Is Rewri? Ingredients & How It Is Made | Pahwajee",
    "description": "Rewri is a small sesame-coated sweet made with sugar or jaggery. Explore its ingredients, traditional making steps and Pahwajee varieties in Meerut.",
    "excerpt": "A guide to Rewri’s sesame coating, ingredients and traditional making steps.",
    "image": "/blog/rewri-making-stages.webp",
    "imageAlt": "Four illustrated Rewri stages: ingredients, sesame roasting, sugar working and finished sesame-coated pieces",
    "datePublished": "2026-10-20"
  },
  {
    "slug": "gajak-making-ingredients-traditional-handwork",
    "title": "How Gajak Is Made: Ingredients and Traditional Handwork",
    "seoTitle": "Gajak Ingredients & Traditional Making | Pahwajee Meerut",
    "description": "Discover the sesame, sweeteners and skilled roasting, working, rolling and cutting behind traditional Gajak, with illustrations and Meerut varieties.",
    "excerpt": "How a small ingredient list becomes a layered sweet, and where the maker’s skill still matters.",
    "image": "/blog/gajak-handwork-stages.webp",
    "imageAlt": "Illustrated Gajak ingredients, mixing in a pan, rolling a layered sheet and cutting rectangular pieces",
    "datePublished": "2026-10-20"
  },
  {
    "slug": "rewri-gajak-chikki-difference",
    "title": "Gajak vs Chikki: Ingredients, Texture and Shape",
    "seoTitle": "Gajak vs Chikki: Differences Explained | Pahwajee",
    "description": "Gajak is often flaky or layered; Chikki has a firm, brittle crunch. Compare their ingredients and shapes with Rewri, then explore varieties in Meerut.",
    "excerpt": "Compare flaky Gajak, brittle Chikki and sesame-coated Rewri before choosing a pack.",
    "image": "/products/Khasta-rewri.png",
    "imageAlt": "Small sesame-covered Rewri pieces piled on a plate",
    "datePublished": "2026-10-12"
  },
  {
    "slug": "diwali-gift-hampers-meerut-guide",
    "title": "Choosing a Diwali Gift Hamper in Meerut",
    "seoTitle": "Diwali Gift Hampers in Meerut: Buying Guide | PAHWAJEE",
    "description": "Choose a Diwali gift hamper by recipient, contents, budget and collection date. Explore dry fruit designs and mithai boxes at Pahwajee in Meerut.",
    "excerpt": "A practical guide to contents, presentation and planning your festive gifts.",
    "image": "/products/Dryfruit-tray1.png",
    "imageAlt": "Peacock-patterned gift box holding three jars of dry fruits",
    "datePublished": "2026-10-12"
  },
  {
    "slug": "how-to-store-nankhatai",
    "title": "How to Store Nankhatai and Keep It Fresh",
    "seoTitle": "How to Store Nankhatai at Home | PAHWAJEE Meerut",
    "description": "Simple Nankhatai storage tips: use a dry airtight container, keep away from heat and moisture, and follow the pack’s best-before instructions.",
    "excerpt": "Keep the crumbly texture with a few simple storage and serving habits.",
    "image": "/products/nankhatayi.png",
    "imageAlt": "Golden Nankhatai cookies topped with chopped nuts on a brass plate",
    "datePublished": "2026-10-12"
  }
];

export const blogPath = post => `/blog/${post.slug}`;
export const blogDate = value => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date(`${value}T12:00:00+05:30`));
