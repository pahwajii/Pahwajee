// Original editorial guides published on 20 October 2026. Recipe methods are
// educational references, not unverified claims about the shop's own formula.
const story = '/blog/why-meerut-famous-rewri-gajak-nankhatai';
const nankhatai = '/blog/nankhatai-ingredients-guide';
const rewri = '/blog/how-rewri-is-made-ingredients-process';
const gajak = '/blog/gajak-making-ingredients-traditional-handwork';
const odoc = {label:'Uttar Pradesh One District One Cuisine: Meerut',href:'https://odoc-up.in/en/districts/meerut'};
const chef = {label:'Chef Ranveer Brar on traditional sugar work',href:'https://ranveerbrar.com/the-fine-art-of-sweetness/'};
const foodScience = {label:'Dr Suvendu Bhattacharya: traditional Gajak',href:'https://www.traditionalfoodofindia.com/gajak/'};
const rewriRecipe = {label:'Ruchi’s Kitchen: sugar and jaggery Rewari methods',href:'https://www.ruchiskitchen.com/homemade-til-rewari/'};
const illustration = 'AI-generated illustration of a general traditional method; not a photograph of Pahwajee’s kitchen.';

export const octoberGuides = [
  {
    slug:'why-meerut-famous-rewri-gajak-nankhatai',
    title:'Why Meerut Is Famous for Rewri, Gajak and Nankhatai',
    seoTitle:'Why Meerut Is Famous for Rewri, Gajak & Nankhatai',
    description:'Explore Meerut’s Rewri, Gajak and Nankhatai tradition: winter sweets, skilled sugar work, crumbly biscuits and what to try at Pahwajee, Abu Lane.',
    excerpt:'The ingredients, craftsmanship and everyday occasions behind Meerut’s best-known sweet specialities.',
    image:'/our_shop_main.jpeg', imageAlt:'Pahwajee’s sweet shop frontage in Abu Lane, Meerut',
    imageCaption:'Pahwajee at 19B, Abu Lane, Meerut.', datePublished:'2026-10-20',
    introduction:'Ask what to bring back from Meerut and Rewri, Gajak and Nankhatai belong on the shortlist. They offer three very different pleasures: a small sesame-coated bite, a flaky sweet and a crumbly biscuit for tea. Their connection with the city is recognised by Uttar Pradesh’s One District One Cuisine programme, which lists all three for Meerut district.',
    sections:[
      {heading:'Meerut’s recognised sweet tradition',
       paragraphs:['The state’s cuisine profile describes Rewri as part of Meerut’s sweet-making heritage across generations. It also identifies Gajak with Meerut city and nearby Sardhana, Daurala and Partapur, and describes Nankhatai as a bakery tradition that became popular across North India, including Meerut.', 'That supports Meerut’s reputation for these foods; it does not establish that all three were invented here. The more useful story is how a city becomes associated with a familiar selection of sweets, and how customers continue to recognise that selection. Our interpretation is that distinct textures, seasonal occasions and the craft behind them help explain their lasting appeal.'],
       references:[odoc]},
      {heading:'Why Meerut Rewri is a winter favourite',
       paragraphs:['Rewri is easy to recognise by its small size and sesame-covered surface. A few pieces can be shared after a meal or offered alongside other winter sweets. Sugar and jaggery versions exist, so “Rewri” describes more than one recipe.', 'There is skilled work behind that simple appearance. Chef Ranveer Brar’s account of visiting traditional Rewri workshops describes sugar pulling and explicitly points readers towards Rewri makers in Meerut and Lucknow. The confectioner’s handling of sugar is an important part of the story, alongside the ingredients.'],
       references:[chef], links:[{to:rewri,label:'See the ingredients and stages of Rewri making'},{to:'/products/khasta-rewri',label:'Explore Pahwajee’s Khasta Rewri'}]},
      {heading:'Gajak brings a different texture to the sweet box',
       paragraphs:['Gajak, also written as Gazak or Gajjak, is a family of sweets with different shapes and finishes. At Pahwajee, Gol Gazak is the round option and Dilkhush Gazak is the flaky option. They should not be treated as interchangeable with a firm peanut chikki simply because the sweets appear in the same winter display.', 'For a first purchase, compare the texture you enjoy before choosing by name alone. If you are buying for a family, pair a Rewri pack with a different Gajak variety so there is something to compare at the table. Check the current pack sizes and availability on the product pages.'],
       links:[{to:gajak,label:'Learn how Gajak is made and finished by hand'},{to:'/products/gol-gazak',label:'View Gol Gazak'},{to:'/products/dilkhush-gazak',label:'View Dilkhush Gazak'}]},
      {heading:'Why Nankhatai belongs beside the winter sweets',
       paragraphs:['Nankhatai adds a baked biscuit to this selection. Its appeal is the crumbly bite and the way a small plate fits a tea break. Unlike a mixed mithai box, it also gives you a straightforward choice between the two separately listed Pahwajee varieties: Pure Desi Ghee Nankhatai and Vanaspati Ghee Nankhatai.', 'When looking for famous Meerut Nankhatai, compare the actual variety and pack rather than treating “famous” as a guarantee of one recipe. Nankhatayi is another common spelling of the same biscuit. Our ingredient guide explains the usual flour, fat and flavouring choices without presenting them as the shop’s exact formula.'],
       links:[{to:nankhatai,label:'What goes into Nankhatai?'},{to:'/nankhatai-meerut',label:'Compare Nankhatai varieties and current prices'}]},
      {heading:'A practical tasting plan at Pahwajee, Meerut',
       list:['Start with Khasta Rewri if you enjoy small, crisp sesame bites.', 'Choose Gol Gazak or Dilkhush Gazak for a different shape and texture.', 'Add the Nankhatai variety you prefer for tea, and keep its pack instructions for storage.', 'For a present, compare the contents and available designs on the gifting page before confirming your order.'],
       paragraphs:['Our Abu Lane shop is at 19B, Abu Lane, Meerut. The website also lists Food Adda by Pahwajee at 13A, Gurudwara Road, Prahlad Nagar. Opening hours are 10:00 AM to 11:00 PM daily. Confirm the product, quantity and collection outlet before travelling, particularly for seasonal items.'],
       links:[{to:'/our-specialities',label:'Browse Meerut specialities'},{to:'/gifting',label:'Choose a mithai box or gift hamper'},{to:'/contact',label:'Contact our Meerut outlets'}]}
    ],
    relatedSlugs:['nankhatai-ingredients-guide','how-rewri-is-made-ingredients-process','gajak-making-ingredients-traditional-handwork'],
    cta:{heading:'Choose your Meerut favourites',label:'Explore our specialities',to:'/our-specialities',enquiry:'Meerut Rewri, Gajak and Nankhatai — please confirm current packs and availability'}
  },
  {
    slug:'nankhatai-ingredients-guide',
    title:'Nankhatai Ingredients: What Gives It a Crumbly Bite?',
    seoTitle:'Nankhatai Ingredients Explained | Pahwajee Meerut',
    description:'Learn the roles of flour, ghee, sugar, besan, sooji and cardamom in Nankhatai, then compare Pahwajee’s Desi Ghee and Vanaspati varieties in Meerut.',
    excerpt:'A clear guide to the flour, fat, sugar and flavourings behind a favourite tea-time biscuit.',
    image:'/blog/nankhatai-ingredients.webp',imageAlt:'Illustration of Nankhatai with flour, besan, semolina, sugar, ghee, cardamom and nuts',
    imageCaption:'AI-generated ingredient illustration. Recipes vary; these are common options, not a complete Pahwajee ingredient declaration.',datePublished:'2026-10-20',
    introduction:'Nankhatai is an Indian shortbread-style biscuit commonly made with flour, fat and sugar. Cardamom often supplies its familiar aroma, while additions such as besan or sooji change the finish. If you are comparing Nankhatai in Meerut, understanding those ingredients is more useful than judging only by a nut garnish or the colour of the biscuit.',
    sections:[
      {heading:'The main ingredients and what they do',
       ingredients:[
         {name:'Wheat flour / maida',purpose:'Forms the main body of many recipes. Whole-wheat versions also exist; the flour choice changes the finished biscuit.'},
         {name:'Ghee or another baking fat',purpose:'Helps bring the dough together and contributes to its short, crumbly texture. The type of fat is a meaningful difference between varieties.'},
         {name:'Powdered sugar',purpose:'Provides sweetness and mixes through the dough more evenly than coarse crystals.'},
         {name:'Besan (gram flour)',purpose:'An optional part of the flour blend, adding a roasted, nutty character.'},
         {name:'Fine sooji / semolina',purpose:'Used in some recipes for a light granular crunch; it is not compulsory in every Nankhatai.'},
         {name:'Cardamom and optional nuts',purpose:'Cardamom adds aroma. Almonds or pistachios may be used as a topping or in a particular variation.'}
       ], references:[{label:'Swasthi Shreekanth’s Nankhatai ingredient guide',href:'https://www.indianhealthyrecipes.com/nankhatai-recipe/'}]},
      {heading:'How the ingredients become Nankhatai',
       steps:[
         {title:'Prepare an even mixture',text:'Published recipes may cream the fat and powdered sugar first or mix the dry ingredients before adding fat. Sifting helps break up flour lumps.'},
         {title:'Bring the dough together gently',text:'Combine rather than kneading like bread dough. Some recipes use a little curd or a raising agent; those additions depend on the formula.'},
         {title:'Portion and shape',text:'Make similar-sized pieces, lightly flatten them and add the chosen garnish. Consistent portions help the batch bake evenly.'},
         {title:'Bake, then cool',text:'Bake to the intended light-golden finish and cool before packing. Oven settings and time depend on the tested recipe and size of the biscuits.'}
       ],
       paragraphs:['This is an overview, not a measured home recipe. For baking, follow one complete tested recipe instead of combining flour ratios, raising agents and timings from different methods.'],
       references:[{label:'Dassana Amit’s Nankhatai recipe and method',href:'https://www.vegrecipesofindia.com/nankhatai-recipe/'}]},
      {heading:'Desi Ghee and Vanaspati Nankhatai at Pahwajee',
       paragraphs:['Our Meerut catalogue lists Pure Desi Ghee Nankhatai and Vanaspati Ghee Nankhatai separately. The first uses pure desi ghee; the second uses vanaspati. Both have their own current price and 500 g or 1 kg pack options on the website.', 'The ingredient illustration above helps explain common recipes. It is not evidence that both shop varieties contain every pictured ingredient. Ask the team for the full ingredient list of the exact pack you plan to buy, including any flavouring, raising agent or garnish.'],
       links:[{to:'/products/pure-desi-ghee-nankhatai',label:'See Pure Desi Ghee Nankhatai'},{to:'/products/vanaspati-ghee-nankhatai',label:'See Vanaspati Ghee Nankhatai'}]},
      {heading:'What to check before ordering for someone else',
       paragraphs:['A gift recipient may care about more than the flavour. Confirm the type of fat, wheat ingredients, any nut garnish and the shop’s handling information when an allergy or dietary restriction matters. A vanaspati label by itself does not establish that the entire product is dairy-free or vegan.', 'Compare the net quantity and total pack price together. If you are taking Nankhatai on a journey, ask about packing and the best-before information for that batch. Keep the original label with the biscuits rather than promising a shelf life based on a general internet recipe.'],
       links:[{to:'/faqs',label:'Read our ordering FAQs'},{to:'/blog/how-to-store-nankhatai',label:'How to store Nankhatai after opening'}]},
      {heading:'Nankhatai in Meerut’s wider sweet selection',
       paragraphs:['A biscuit pack and a sesame sweet offer different textures when served together. You could pair Nankhatai with Khasta Rewri for small bites, or compare the biscuit with a flaky Gajak. Choose by the recipient’s preferences and check each product’s availability before building a gift.', 'For the local background, our Meerut sweets article explains the city’s association with Rewri, Gajak and Nankhatai. If you are curious about the difference between baking and sugar work, continue with the illustrated Rewri guide.'],
       links:[{to:story,label:'Why Meerut is known for these sweets'},{to:rewri,label:'Explore the Rewri making process'},{to:'/gifting',label:'Browse gifting options'}]}
    ],
    relatedSlugs:['how-to-store-nankhatai','why-meerut-famous-rewri-gajak-nankhatai','how-rewri-is-made-ingredients-process'],
    cta:{heading:'Choose your Nankhatai variety',label:'Shop Nankhatai in Meerut',to:'/nankhatai-meerut',enquiry:'Nankhatai — please confirm ingredients, variety and available pack sizes'}
  },
  {
    slug:'how-rewri-is-made-ingredients-process',
    title:'How Rewri Is Made: Ingredients and Traditional Steps',
    seoTitle:'How Rewri Is Made: Ingredients & Steps | Pahwajee',
    description:'Follow Rewri making from sesame roasting and syrup preparation to pulling, shaping and packing, with illustrations and Meerut product links.',
    excerpt:'From sesame seeds to small crisp bites: a closer look at the work behind Rewri.',
    image:'/blog/rewri-making-stages.webp',imageAlt:'Four illustrated Rewri stages: ingredients, sesame roasting, sugar working and finished sesame-coated pieces',
    imageCaption:illustration,datePublished:'2026-10-20',
    introduction:'Rewri, also called Revri or Rewari, is recognised by its small pieces and sesame coating. It looks simple in a bowl, but preparing the sweet involves careful control of the syrup and quick, consistent shaping. Here is the traditional sugar-Rewri process from ingredients to packing; jaggery versions and individual workshops use different formulas.',
    sections:[
      {heading:'What ingredients are used in Rewri?',
       ingredients:[
         {name:'Sesame seeds (til)',purpose:'Provide the characteristic outer coating and toasted flavour. Some methods also work seeds into the centre.'},
         {name:'Sugar or jaggery',purpose:'Forms the sweet base. Sugar Rewri and gur Rewri should be treated as different recipe variations.'},
         {name:'Water',purpose:'Used during syrup preparation; its amount and evaporation affect the cooking process.'},
         {name:'Ghee and flavourings, where used',purpose:'Some recipes use ghee, cardamom or a floral flavouring. Syrup formulations may also include other ingredients; check the particular product.'}
       ], references:[rewriRecipe]},
      {heading:'The making process, from roasting to coating',
       paragraphs:['The illustration reads from top left to bottom right: basic ingredients, sesame roasting, working the syrup, then the finished pieces. The sequence below fills in the preparation and finishing stages.'],
       steps:[
         {title:'Select and roast the sesame',text:'Prepare clean sesame seeds and roast them gently, stirring for an even result. Set aside seeds for coating.'},
         {title:'Prepare the syrup',text:'Cook the sweetener with water to the consistency required by that recipe. Under- or overcooking changes how the mixture can be worked.'},
         {title:'Work the sugar base',text:'In a pulled-sugar method, the mixture is gathered, stretched and folded. Its appearance becomes lighter as the confectioner works it.'},
         {title:'Divide and shape',text:'Portion the workable mass into small pieces and shape or flatten them. Consistent sizing is part of the finishing skill.'},
         {title:'Apply the sesame coating',text:'Roll or press the pieces into the prepared seeds while the surface can take the coating.'},
         {title:'Cool, inspect and pack',text:'Let the pieces set before packing, then check the finish and pack them for handling and storage. Follow the product’s own storage guidance.'}
       ],
       references:[rewriRecipe],
       paragraphsAfter:['This explains the craft rather than giving a measured recipe. Hot sugar can cause severe burns; pulling should be done with suitable tools, protection and experience, never by touching freshly cooked syrup. For home preparation, use a complete tested recipe and its safety instructions.']},
      {heading:'Why the confectioner’s handwork matters',
       paragraphs:['Chef Ranveer Brar describes the dexterity of traditional Rewri workers in his account of sugar-making workshops. It is a useful reminder that a short ingredient list does not mean an effortless process. Working the mass, keeping the pieces consistent and finishing the coating all require attention.', 'Tools and working methods differ between workshops. The small finished pieces hide much of that work, which is why watching the stages separately helps explain the care involved in their shape and coating.'],
       references:[chef],links:[{to:gajak,label:'Compare the handwork involved in Gajak'}]},
      {heading:'Is sugar Rewri the same as gur Rewri?',
       paragraphs:['The name covers different recipes. Replacing sugar with jaggery is not simply a colour change, and the process illustrated here should not be read as a universal formula. A product’s ingredients need to be checked directly; its pale or dark appearance is not a complete ingredient declaration.', 'Likewise, a sesame-coated Rewri is different from a large sesame laddoo or a slab of chikki. If you are trying Meerut Rewri for the first time, compare the shape and texture descriptions before choosing a pack.'],
       links:[{to:'/blog/rewri-gajak-chikki-difference',label:'Compare Rewri, Gajak and Chikki'}]},
      {heading:'Choosing Rewri at Pahwajee, Meerut',
       paragraphs:['Our catalogue includes Khasta Rewri, with its small crisp pieces, and the thinner Chips Rewri. Open each product to see the available packs, listed price and stock status. For a large order, share the required quantity and date with the shop before planning collection.', 'If the order is a gift, tell us whether you want a Rewri pack on its own or a wider selection. For allergens and recipe details, ask about the specific variety rather than relying on this general ingredient guide. Keep the supplied storage and best-before instructions with your pack.'],
       links:[{to:'/products/khasta-rewri',label:'View Khasta Rewri'},{to:'/products/chips-rewri',label:'View Chips Rewri'},{to:story,label:'Read about Meerut’s sweet-making reputation'},{to:'/contact',label:'Confirm your order with the shop'}]}
    ],
    relatedSlugs:['gajak-making-ingredients-traditional-handwork','rewri-gajak-chikki-difference','why-meerut-famous-rewri-gajak-nankhatai'],
    cta:{heading:'Find your preferred Rewri',label:'Browse Rewri & Gajak',to:'/rewri-gajak-meerut',enquiry:'Meerut Rewri — please confirm the ingredients, current packs and availability'}
  },
  {
    slug:'gajak-making-ingredients-traditional-handwork',
    title:'How Gajak Is Made: Ingredients and Traditional Handwork',
    seoTitle:'Gajak Ingredients & Traditional Making | Pahwajee Meerut',
    description:'Discover the sesame, sweeteners and skilled roasting, working, rolling and cutting behind traditional Gajak, with illustrations and Meerut varieties.',
    excerpt:'How a small ingredient list becomes a layered sweet, and where the maker’s skill still matters.',
    image:'/blog/gajak-handwork-stages.webp',imageAlt:'Illustrated Gajak ingredients, mixing in a pan, rolling a layered sheet and cutting rectangular pieces',
    imageCaption:illustration,datePublished:'2026-10-20',
    introduction:'Gajak is known for the texture created by working a sweetened sesame mixture. Also written as Gazak or Gajjak, it includes several regional styles and product varieties. This guide follows a traditional flaky sesame version and explains the role of handwork; it is not a claim that every Gajak, or every Pahwajee product, follows one identical method.',
    sections:[
      {heading:'The core ingredients in traditional sesame Gajak',
       ingredients:[
         {name:'Sesame seeds (til)',purpose:'The main seed ingredient in this style. Seeds may be whole, partly crushed or more finely worked, depending on the intended texture.'},
         {name:'Jaggery or sugar',purpose:'Provides the sweet binding base. The selected sweetener and its cooking affect the flavour and finish.'},
         {name:'Ghee, where used',purpose:'Appears in some formulas and may be used in preparing the working surface.'},
         {name:'Optional nuts, mawa or flavourings',purpose:'Create different varieties. Their presence must be confirmed for the particular Gajak; the name alone does not establish a recipe.'}
       ],references:[foodScience]},
      {heading:'How a layered Gajak takes shape',
       steps:[
         {title:'Roast the sesame',text:'Roasting develops the seed flavour. The maker keeps the batch moving to avoid uneven browning.'},
         {title:'Cook the sweet base',text:'Prepare the sugar or jaggery syrup to the consistency needed for the chosen style.'},
         {title:'Combine and work',text:'Mix in the sesame, then work the mass using the method suited to that recipe. Folding, rolling or beating may be used.'},
         {title:'Flatten and finish',text:'Roll or press the mixture to the intended thickness. Layered styles need careful handling to preserve their flaky finish.'},
         {title:'Portion and cool',text:'Score or cut at the appropriate stage, allow the pieces to set, then pack with care.'}
       ],references:[foodScience],
       paragraphsAfter:['The image shows ingredients, pan work, rolling and cutting as an illustration of these stages. Sugar and jaggery are pictured as possible sweeteners, not a required combination. A complete production formula needs its own quantities, temperatures and timing; this article is an explanation of the craft.']},
      {heading:'Where manual skill still makes a difference',
       paragraphs:['A Gajak maker has decisions to make throughout the batch: whether the seeds are sufficiently roasted, whether the syrup is ready to combine, how firmly to work the mixture and when it can be portioned. Traditional methods make those judgements visible through the use of pans, wooden tools, rollers and cutters.', 'A producer’s account from Shree Shyam Tilpatti describes stirring, working, flattening and cutting in its Jaipur method. Separately, Morena’s district administration describes hammering as part of its regional Gajak preparation. These examples show that manual work persists, but also that the exact technique varies between places and makers.'],
       references:[{label:'Shree Shyam Tilpatti’s account of its traditional process',href:'https://shreeshyamtilpatti.com/blogs/news/traditional-gajak-making-process-jaipur'},{label:'District Morena: its regional Gajak preparation',href:'https://morena.nic.in/en/culinary-delight/gazak/'}]},
      {heading:'How tools and handwork fit together',
       paragraphs:['Modern equipment can assist with parts of Gajak production, including preparation, heating, mixing or cutting. The food-science overview by Dr Suvendu Bhattacharya describes mechanised operations alongside traditional preparation.', 'For a buyer, the practical questions are about the product you will receive: its ingredients, texture, net quantity, packing and availability. When comparing varieties, use the product description and ask the shop about the details that matter to your order.'],references:[foodScience]},
      {heading:'Choosing Gajak in Meerut: Gol, Dilkhush and other varieties',
       paragraphs:['Pahwajee’s collection lets you compare Gol Gazak, the round-shaped option, with Dilkhush Gazak, described in our catalogue as flaky. Other listed varieties include Sugar Gazak and rolls. Open the individual product page to check what is currently offered rather than assuming every variety has the same sweetener, dairy ingredients or nuts.', 'For a mixed selection, you can pair a Gajak variety with Khasta Rewri or Nankhatai. The Rewri guide explains small sesame-coated pieces, while the Nankhatai guide explores a baked biscuit. Reading the three together makes it easier to choose by texture instead of ordering several similar items unintentionally.'],
       links:[{to:'/products/gol-gazak',label:'See Gol Gazak'},{to:'/products/dilkhush-gazak',label:'See Dilkhush Gazak'},{to:rewri,label:'How Rewri is made'},{to:nankhatai,label:'Nankhatai ingredients explained'}]},
      {heading:'Ordering, packing and taking Gajak home',
       paragraphs:['Choose your variety and pack from the live catalogue, then confirm the quantity and date with the shop for a seasonal or larger order. Ask for the full ingredients if you need to check sesame, nuts or dairy. Keep the supplied best-before and storage information; different recipes and packaging do not share one universal shelf life.', 'If you are buying in Meerut for a celebration, explore our gifting page and confirm the contents and presentation you want. Our contact page lists the outlets and phone numbers so you can agree where to collect the order.'],
       links:[{to:story,label:'Why Rewri, Gajak and Nankhatai are associated with Meerut'},{to:'/gifting',label:'Explore gift hampers and mithai boxes'},{to:'/contact',label:'Speak to our Meerut team'}]}
    ],
    relatedSlugs:['how-rewri-is-made-ingredients-process','rewri-gajak-chikki-difference','nankhatai-ingredients-guide'],
    cta:{heading:'Compare Meerut Gajak varieties',label:'Shop Rewri & Gajak',to:'/rewri-gajak-meerut',enquiry:'Gajak — please help me choose a variety and confirm ingredients, packs and availability'}
  }
];
