import policy from '../../../store-policy.json' with { type: 'json' };
export { policy };

export const policyPages = {
  'terms-and-conditions': {
    title: 'Terms & Conditions',
    description: 'Ordering terms for Pahwajee Rewri Wale, Meerut: order confirmation, prices, availability, custom orders and customer support.',
    sections: [
      {heading:'Who we are',paragraphs:[`This website is operated by ${policy.businessName}, trading as Pahwa Jee / Pahwajee in Meerut. Our Abu Lane shop is at 19B, Abu Lane, Meerut. Our Food Adda outlet is at 13A, Gurudwara Road, Prahlad Nagar, Meerut. FSSAI No. 22718357001092.`]},
      {heading:'Order requests and confirmation',paragraphs:['Submitting the website form sends an order request. The shop must confirm stock, quantities, preparation and fulfilment before the order is accepted. No online payment is collected by this website; any payment arrangement is confirmed directly with the shop.','Please provide accurate contact details and, for a delivery request, a complete address. Keep your order reference so we can find your request.']},
      {heading:'Prices, packs and availability',paragraphs:['Prices are shown in Indian rupees. Check the pack size and quantity you select: a per-kg rate is different from a pack total. Delivery charges are separate from the items subtotal and are confirmed before fulfilment.','Seasonal products may be temporarily unavailable. Special-order items and custom cakes require confirmation. Photos labelled illustrative are representative; actual shape, garnish and packaging can vary. Ask about your chosen item before ordering if presentation or ingredients are important.']},
      {heading:'Custom mithai boxes and cakes',paragraphs:['Ready-made mithai boxes are sold as 1 kg packs at the listed assortment price. Custom boxes contain four 250 g sections; repeats are allowed. Their total is calculated from each selected sweet’s rate, with no additional packaging charge.','For cakes and other custom orders, share the size, design, quantity and date. The shop will confirm the final quote and preparation arrangements.']},
      {heading:'Ingredients and food handling',paragraphs:['Ask for ingredients, allergens and storage instructions for the exact product you choose. Do not assume that all varieties use the same ghee, sweetener, dairy or nuts. Follow the guidance supplied with your order.']},
      {heading:'Delivery, cancellations and product issues',paragraphs:['Our delivery and replacement policies form part of these terms. Contact the shop promptly for changes or cancellation requests; sending a message is not itself confirmation that an order has been cancelled.','Nothing in these terms removes any rights or remedies available to you under applicable consumer law.'],links:[{to:'/shipping-policy',label:'Delivery & collection policy'},{to:'/returns-and-cancellations',label:'Replacements & cancellations'}]},
    ],
  },
  'shipping-policy': {
    title: 'Delivery & Collection Policy',
    description: 'Pahwajee delivery in Meerut, approximate distance-based charges, outside-Meerut enquiries and store collection arrangements.',
    sections: [
      {heading:'Delivery within Meerut',paragraphs:['Delivery is currently offered within Meerut. Local charges are usually Rs 40–80, depending on distance. The shop confirms the exact delivery charge separately from your product total.']},
      {heading:'Outside Meerut',paragraphs:['Contact us before planning an order outside Meerut. Availability, transport arrangements and charges depend on the destination and distance. An outside-Meerut address entered in the request form does not guarantee delivery.']},
      {heading:'Delivery timing',paragraphs:['The team confirms preparation and delivery timing for your items, quantity and location. Share your required date and any event deadline before the order is confirmed.']},
      {heading:'Store collection',paragraphs:['Store pickup can be arranged with the team. Confirm which outlet will prepare your order and wait for confirmation that it is ready before travelling. Our listed business hours are 10:00 AM to 11:00 PM daily.'],links:[{to:'/contact',label:'Find our Meerut outlets'}]},
      {heading:'Check your order',paragraphs:['Please check the product, quantity and packaging when you receive your order. Keep the original packaging and order details if something is wrong or damaged, and contact the shop so we can investigate.'],links:[{to:'/returns-and-cancellations',label:'Wrong or damaged items: replacement process'}]},
    ],
  },
  'returns-and-cancellations': {
    title: 'Replacements & Cancellations',
    description: 'How to report a wrong or damaged Pahwajee order, retain packaging, request a replacement and contact the shop about cancellation.',
    sections: [
      {heading:'If you receive the wrong item',paragraphs:['Contact us with your order reference and details of what you received. Retain the original packaging and the item: we offer a replacement after checking the mismatch, with the original packaging available for verification.']},
      {heading:'If a product is damaged',paragraphs:['Contact the shop and share clear photos of the item and packaging, together with your order reference. We will check the reported damage and provide a full replacement of the affected product when the damage is verified.','Keep the product and packaging for inspection where possible. If the packaging is itself damaged, keep the remaining packaging and photos and tell us what happened. Do not consume a product you suspect is unsafe.']},
      {heading:'How to request help',paragraphs:[`Email ${policy.email} or call the numbers below. Include your name, order reference, product, delivery or collection details and a description of the issue. The team will explain how verification and replacement will be arranged.`]},
      {heading:'Changing or cancelling an order',paragraphs:['Contact the shop as soon as you need to change or cancel an order, particularly for a cake, customised box or special-order sweet. We will check whether preparation or dispatch has begun and confirm what is possible. Do not assume the request is cancelled until the shop confirms.']},
      {heading:'Payments and your consumer rights',paragraphs:['The website does not collect online payments. If you paid the shop directly, contact us about any payment adjustment or refund associated with your issue.','Our replacement process does not exclude any refund or other remedy you may be entitled to under applicable consumer law.']},
    ],
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    description: 'How Pahwajee Rewri Wale uses order and enquiry details, browser storage and website analytics, and how to contact us about your information.',
    sections: [
      {heading:'Information you provide',paragraphs:['Order requests collect your name, phone number, selected products and quantities, optional email and notes, and delivery address, city and pincode when you request delivery. Enquiry forms collect the contact details and message you choose to provide.','We use these details to respond, confirm availability, prepare and fulfil orders, handle product issues and keep order records. The website does not collect card details or take online payments.']},
      {heading:'How your information is handled',paragraphs:['Order and enquiry details are stored in the website’s database and may be sent to the shop through its email notification service. Hosting, database and email service providers process information needed to operate these services. Delivery details may be shared with the people arranging your delivery.','When you choose to send an order through WhatsApp, the prepared message includes your order and contact details. Review it before tapping Send. WhatsApp and other external services handle information under their own privacy policies.']},
      {heading:'Browser storage and analytics',paragraphs:['Your cart, favourites and theme preference are saved in your browser. Temporary session storage helps prevent duplicate order submissions. Clearing browser storage removes these saved preferences and items.','We use Google Analytics and Vercel Web Analytics to understand page visits and website performance. These providers may process usage, browser, device and network information under their own policies. Google Analytics may use cookies. You can manage cookies and stored site data in your browser settings.']},
      {heading:'External links and embedded content',paragraphs:['Google Maps, social media, Google reviews and WhatsApp links take you to, or load content from, other services. Those services may receive network and browser information when accessed; their own privacy terms apply.']},
      {heading:'Your information and requests',paragraphs:[`To ask about information you submitted, request a correction or request deletion, contact ${policy.email}. Include enough detail for us to locate your request, but do not send card details or passwords. We may need to verify the request and retain records required for outstanding orders, disputes or applicable legal obligations.`]},
      {heading:'Policy updates',paragraphs:['We may update this page when our website features or data practices change. The updated date appears above. Contact us if you have questions about how a particular order or enquiry is handled.']},
    ],
  },
};

export const orderingFAQs = [
  {question:'How do I place an order?',answer:'Choose a product, pack size and quantity, then submit your cart as an order request. The shop will confirm availability and fulfilment. No online payment is collected on this website.'},
  {question:'Do you deliver in Meerut?',answer:policy.deliverySummary},
  {question:'What are your business hours?',answer:'Our listed hours are 10:00 AM to 11:00 PM daily. Confirm your order is ready and which outlet to visit before collection.'},
  {question:'What if my item is wrong or damaged?',answer:'Retain the original item and packaging and contact us with your order reference and photos. Wrong items can be replaced after verification; verified damage qualifies for full replacement of the affected product. See the replacement policy for the process.'},
  {question:'Can I choose four sweets for a gift box?',answer:'Yes. A custom 1 kg box has four 250 g sections, and repeats are allowed. Its price is the sum of the selected portions at their individual rates, with no extra packaging charge. Confirm availability through an enquiry.'},
  {question:'Do you take cake and bulk gifting orders?',answer:'Yes. Share your flavour or assortment, size, quantity, design and required date. The shop confirms the quote and preparation time; cakes and special orders are not promised for immediate collection.'},
  {question:'Are all sweets made with desi ghee?',answer:'No. Pure Desi Ghee Nankhatai and Vanaspati Ghee Nankhatai are different varieties. Ask for the ingredients and allergen information for each item; recipes differ.'},
  {question:'How do I cancel or change my request?',answer:'Contact the shop promptly with your order reference. The team will check preparation or dispatch and confirm what can be changed. A cancellation request is not complete until the shop confirms.'},
];
