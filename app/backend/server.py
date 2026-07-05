from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
env_path = ROOT_DIR / '.env'
loaded = load_dotenv(env_path, override=True)
print(f"DEBUG: env_path={env_path.resolve()}, exists={env_path.exists()}, loaded={loaded}", flush=True)
print(f"DEBUG: MONGO_URL in os.environ={os.environ.get('MONGO_URL')}", flush=True)

import os
import uuid
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import Optional, List

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# ------------------- Setup -------------------
mongo_url = os.environ['MONGO_URL']
print(f"DEBUG: MONGO_URL={mongo_url}", flush=True)
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"
JWT_SECRET = os.environ["JWT_SECRET"]

app = FastAPI(title="PAHWA JEE API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ------------------- Auth helpers -------------------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "type": "access",
               "exp": datetime.now(timezone.utc) + timedelta(minutes=60)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "type": "refresh",
               "exp": datetime.now(timezone.utc) + timedelta(days=7)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def set_auth_cookies(response: Response, access: str, refresh: str):
    response.set_cookie("access_token", access, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(401, "Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"password_hash": 0, "_id": 0})
        if not user:
            raise HTTPException(401, "User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin only")
    return user


# ------------------- Models -------------------
class LoginIn(BaseModel):
    email: EmailStr
    password: str

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    description: str = ""
    category: str
    image: str = ""
    images: List[str] = []
    price: Optional[str] = None
    availability: str = "Available"
    tags: List[str] = []
    featured: bool = False
    bestseller: bool = False
    order: int = 0

class ProductIn(BaseModel):
    name: str
    slug: Optional[str] = None
    description: str = ""
    category: str
    image: str = ""
    images: List[str] = []
    price: Optional[str] = None
    availability: str = "Available"
    tags: List[str] = []
    featured: bool = False
    bestseller: bool = False
    order: int = 0

class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    image: str = ""
    description: str = ""
    order: int = 0

class Testimonial(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    location: str = "Meerut"
    rating: int = 5
    review: str
    avatar: str = ""
    order: int = 0

class TestimonialIn(BaseModel):
    name: str
    location: str = "Meerut"
    rating: int = 5
    review: str
    avatar: str = ""
    order: int = 0

class GalleryItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    image: str
    title: str = ""
    category: str = "Store"
    order: int = 0

class GalleryIn(BaseModel):
    image: str
    title: str = ""
    category: str = "Store"
    order: int = 0

class Banner(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    subtitle: str = ""
    image: str = ""
    cta_text: str = ""
    cta_link: str = ""
    active: bool = True
    order: int = 0

class FAQ(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    answer: str
    order: int = 0

class InquiryIn(BaseModel):
    name: str
    phone: str
    email: Optional[str] = ""
    message: str
    product: Optional[str] = ""

class NewsletterIn(BaseModel):
    email: EmailStr


# ------------------- Seed data -------------------
SEED_CATEGORIES = [
    {"name": "Signature", "slug": "signature", "description": "Timeless heritage recipes crafted daily.", "image": "https://images.pexels.com/photos/8887052/pexels-photo-8887052.jpeg", "order": 1},
    {"name": "Summer Specials", "slug": "summer-specials", "description": "Cool, creamy & refreshing.", "image": "https://images.unsplash.com/photo-1644461151939-f78a01d14608?crop=entropy&cs=srgb&fm=jpg&w=1200", "order": 2},
    {"name": "Fast Food", "slug": "fast-food", "description": "Hot & fresh, made to order.", "image": "https://images.unsplash.com/photo-1667185487656-91aee4306658?crop=entropy&cs=srgb&fm=jpg&w=1200", "order": 3},
    {"name": "Bakery", "slug": "bakery", "description": "Cakes, pastries & artisan bakes.", "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop", "order": 4},
    {"name": "Winter Specials", "slug": "winter-specials", "description": "Warm treats for cold days.", "image": "https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=1200&auto=format&fit=crop", "order": 5},
    {"name": "Festival Collection", "slug": "festival-collection", "description": "Premium hampers for every celebration.", "image": "https://images.unsplash.com/photo-1773450970959-cef81e9b1053?crop=entropy&cs=srgb&fm=jpg&w=1200", "order": 6},
]

def _p(name, cat, desc, img, price=None, feat=False, best=False, avail="Available"):
    from re import sub
    slug = sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    return {"name": name, "slug": slug, "description": desc, "category": cat, "image": img,
            "price": price, "featured": feat, "bestseller": best, "availability": avail, "tags": [], "images": [], "order": 0}

SEED_PRODUCTS = [
    # Signature
    _p("Pure Desi Ghee Nankhatai", "signature", "Buttery, crumbly cookies baked with pure desi ghee — a Meerut heritage since decades.", "https://images.pexels.com/photos/37219215/pexels-photo-37219215.jpeg", "₹450/kg", True, True),
    _p("Punjabi Style Rewri", "signature", "Crunchy sesame & jaggery rewri, hand-rolled in the authentic Punjabi tradition.", "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=1200&auto=format&fit=crop", "₹380/kg", True, True),
    _p("Premium Gazak", "signature", "Layered sesame gazak — light, flaky & delicately sweet. A winter favourite.", "https://images.unsplash.com/photo-1606755962773-d324e2a2c8ea?w=1200&auto=format&fit=crop", "₹420/kg", True, True),
    # Summer Specials
    _p("Fresh Milk Bottle", "summer-specials", "Farm-fresh chilled milk, filled daily. Perfect for families.", "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=1200&auto=format&fit=crop", "₹60/L"),
    _p("Mango Shake", "summer-specials", "Alphonso mango blended with thick creamy milk. Summer in a glass.", "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=1200&auto=format&fit=crop", "₹120", False, True),
    _p("Banana Shake", "summer-specials", "Ripe bananas, cold milk, a hint of honey.", "https://images.unsplash.com/photo-1601371520429-cff7fddb8ac0?w=1200&auto=format&fit=crop", "₹100"),
    _p("Khajoor Shake", "summer-specials", "Rich date shake with pure milk — natural sweetness, energy boost.", "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=1200&auto=format&fit=crop", "₹140"),
    _p("Anjeer Shake", "summer-specials", "Premium figs blended with milk & saffron.", "https://images.unsplash.com/photo-1541544181051-e46607bc22a4?w=1200&auto=format&fit=crop", "₹150"),
    _p("Chocolate Shake", "summer-specials", "Silky Belgian chocolate shake, topped with cream.", "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=1200&auto=format&fit=crop", "₹130"),
    _p("Oreo Shake", "summer-specials", "Crushed Oreo cookies swirled into thick milkshake.", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&auto=format&fit=crop", "₹140"),
    _p("Strawberry Shake", "summer-specials", "Fresh strawberries whisked with chilled milk.", "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=1200&auto=format&fit=crop", "₹130"),
    _p("Cold Coffee", "summer-specials", "Signature thick cold coffee with ice-cream scoop.", "https://images.unsplash.com/photo-1624306070914-c480667416cd?crop=entropy&cs=srgb&fm=jpg&w=1200", "₹110", True, True),
    _p("Lassi", "summer-specials", "Thick sweet lassi topped with malai.", "https://images.unsplash.com/photo-1626200925376-97b7ad4a5cad?w=1200&auto=format&fit=crop", "₹80"),
    _p("Fresh Juices", "summer-specials", "Seasonal fruits, freshly pressed. No sugar added.", "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=1200&auto=format&fit=crop", "₹90"),
    _p("Ice Cream", "summer-specials", "Assorted premium ice-creams — cones, cups & sundaes.", "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=1200&auto=format&fit=crop", "₹60+"),
    # Fast Food
    _p("Maggi", "fast-food", "Classic desi masala Maggi with veggies & cheese.", "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=1200&auto=format&fit=crop", "₹70"),
    _p("Sandwiches", "fast-food", "Toasted grilled sandwiches with fresh veggies & cheese.", "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=1200&auto=format&fit=crop", "₹90+"),
    _p("Patties", "fast-food", "Hot flaky veg patties — the perfect tea-time snack.", "https://images.unsplash.com/photo-1601001435957-74f0958a93c5?w=1200&auto=format&fit=crop", "₹40"),
    _p("Burgers", "fast-food", "Juicy stuffed burgers with crispy patties.", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&auto=format&fit=crop", "₹120"),
    _p("Pizza", "fast-food", "Wood-fired thin crust pizza with premium toppings.", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&auto=format&fit=crop", "₹180+"),
    _p("French Fries", "fast-food", "Crispy golden fries with signature dips.", "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=1200&auto=format&fit=crop", "₹90"),
    _p("Garlic Bread", "fast-food", "Buttery garlic bread with herbs & cheese.", "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=1200&auto=format&fit=crop", "₹130"),
    # Bakery
    _p("Birthday Cakes", "bakery", "Custom birthday cakes made fresh — 1kg, 2kg, tiered & themed.", "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=1200&auto=format&fit=crop", "₹600+", True, True),
    _p("Anniversary Cakes", "bakery", "Elegant anniversary cakes to make it unforgettable.", "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=1200&auto=format&fit=crop", "₹700+"),
    _p("Customized Cakes", "bakery", "Bring your vision to life — photo cakes, character cakes & more.", "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=1200&auto=format&fit=crop", "On Request"),
    _p("Pastries", "bakery", "Chocolate, black forest, red velvet & more.", "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1200&auto=format&fit=crop", "₹60+"),
    _p("Cookies", "bakery", "Assorted butter cookies & jar cookies.", "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=1200&auto=format&fit=crop", "₹250/kg"),
    # Winter Specials
    _p("Peanut Chikki", "winter-specials", "Traditional peanut & jaggery chikki, snap-crisp.", "https://images.unsplash.com/photo-1606755962773-d324e2a2c8ea?w=1200&auto=format&fit=crop", "₹320/kg"),
    _p("Til Patti", "winter-specials", "Golden sesame patti with a caramelized finish.", "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1200&auto=format&fit=crop", "₹360/kg"),
    _p("Dry Fruit Sweets", "winter-specials", "Kaju katli, badam barfi, anjeer roll — pure decadence.", "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1200&auto=format&fit=crop", "₹950/kg", True, True),
    _p("Hot Coffee", "winter-specials", "Rich brewed hot coffee, topped with cocoa dust.", "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&auto=format&fit=crop", "₹80"),
    _p("Hot Chocolate", "winter-specials", "Thick Belgian hot chocolate with marshmallows.", "https://images.unsplash.com/photo-1517578239113-b03992dcdd25?w=1200&auto=format&fit=crop", "₹110"),
    # Festival Hampers
    _p("Dry Fruit Trays", "festival-collection", "Premium wooden trays with assorted dry fruits.", "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=1200&auto=format&fit=crop", "₹1200+", True, True),
    _p("Diwali Gift Hampers", "festival-collection", "Curated Diwali hampers — sweets, chocolates, candles & more.", "https://images.unsplash.com/photo-1573648952759-a4e0e01e9e6b?w=1200&auto=format&fit=crop", "₹1500+", True),
    _p("Raksha Bandhan Hampers", "festival-collection", "Beautiful rakhi hampers for your siblings — near or far.", "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=1200&auto=format&fit=crop", "₹800+"),
    _p("Corporate Gift Hampers", "festival-collection", "Bulk corporate gifting — custom branding available.", "https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&auto=format&fit=crop", "On Request"),
    _p("Wedding Gift Hampers", "festival-collection", "Elegant wedding return gifts — trays, boxes, personalized packaging.", "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop", "On Request"),
    _p("Premium Customized Hampers", "festival-collection", "Design your own hamper — pick your products & packaging.", "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=1200&auto=format&fit=crop", "On Request", True),
]

SEED_TESTIMONIALS = [
    {"name": "Rahul Sharma", "location": "Sadar Bazaar, Meerut", "rating": 5, "review": "PAHWA JEE's nankhatai is a Meerut legend. My family has been buying from here for over 20 years. Nothing else comes close.", "avatar": "https://i.pravatar.cc/150?img=12", "order": 1},
    {"name": "Priya Agarwal", "location": "Shastri Nagar, Meerut", "rating": 5, "review": "Ordered a customized birthday cake — delivered on time, tasted heavenly, and looked absolutely stunning. Highly recommended!", "avatar": "https://i.pravatar.cc/150?img=45", "order": 2},
    {"name": "Aman Verma", "location": "Abu Lane, Meerut", "rating": 5, "review": "Their cold coffee is the best in Meerut. I drop by every evening after work. Fresh, thick and full of flavour.", "avatar": "https://i.pravatar.cc/150?img=33", "order": 3},
    {"name": "Neha Gupta", "location": "Meerut Cantt", "rating": 5, "review": "Got Diwali hampers for my entire office. Everyone loved the packaging and the quality of dry fruits. Will order again next year!", "avatar": "https://i.pravatar.cc/150?img=48", "order": 4},
    {"name": "Vikram Malhotra", "location": "Modipuram, Meerut", "rating": 5, "review": "Rewri and gazak are exactly like my grandmother used to make. Authentic taste, generous quantity, fair prices.", "avatar": "https://i.pravatar.cc/150?img=15", "order": 5},
    {"name": "Sneha Kapoor", "location": "Bhagwatpur, Meerut", "rating": 5, "review": "Best shakes in town. The Anjeer shake is my absolute favourite. The staff is so warm and welcoming too.", "avatar": "https://i.pravatar.cc/150?img=47", "order": 6},
]

SEED_GALLERY = [
    {"image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&auto=format&fit=crop", "title": "Store Front", "category": "Store", "order": 1},
    {"image": "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=1600&auto=format&fit=crop", "title": "Custom Cakes", "category": "Cakes", "order": 2},
    {"image": "https://images.unsplash.com/photo-1624306070914-c480667416cd?w=1600&auto=format&fit=crop", "title": "Cold Coffee", "category": "Shakes", "order": 3},
    {"image": "https://images.pexels.com/photos/37219215/pexels-photo-37219215.jpeg", "title": "Nankhatai", "category": "Bakery", "order": 4},
    {"image": "https://images.unsplash.com/photo-1573648952759-a4e0e01e9e6b?w=1600&auto=format&fit=crop", "title": "Festival Hampers", "category": "Hampers", "order": 5},
    {"image": "https://images.unsplash.com/photo-1606755962773-d324e2a2c8ea?w=1600&auto=format&fit=crop", "title": "Gazak", "category": "Sweets", "order": 6},
    {"image": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1600&auto=format&fit=crop", "title": "Pastries", "category": "Bakery", "order": 7},
    {"image": "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=1600&auto=format&fit=crop", "title": "Mango Shake", "category": "Shakes", "order": 8},
    {"image": "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=1600&auto=format&fit=crop", "title": "Dry Fruit Trays", "category": "Hampers", "order": 9},
    {"image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1600&auto=format&fit=crop", "title": "Pizza", "category": "Fast Food", "order": 10},
    {"image": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=1600&auto=format&fit=crop", "title": "Ice Cream", "category": "Shakes", "order": 11},
    {"image": "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&auto=format&fit=crop", "title": "Wedding Hampers", "category": "Hampers", "order": 12},
]

SEED_FAQS = [
    {"question": "Do you take custom cake orders?", "answer": "Absolutely! We craft custom birthday, anniversary, wedding & themed cakes. Please place your order at least 24 hours in advance. Call 6396339806 to discuss designs.", "order": 1},
    {"question": "Do you offer bulk / corporate orders?", "answer": "Yes — we specialize in corporate gifting, weddings & bulk festival hampers with custom packaging & branding options. Contact us for a personalized quote.", "order": 2},
    {"question": "What are your business hours?", "answer": "We are open every day from 9:00 AM to 10:30 PM, including Sundays and public holidays.", "order": 3},
    {"question": "Do you deliver in Meerut?", "answer": "Yes, we offer local delivery in Meerut. Delivery charges depend on your location and order value. Please call us to confirm.", "order": 4},
    {"question": "Which payment methods do you accept?", "answer": "We accept cash, UPI, all major cards, and digital wallets at the store. For online orders, we can share UPI details when confirming.", "order": 5},
    {"question": "Are your products made with pure desi ghee?", "answer": "Our signature nankhatai and select sweets are made with 100% pure desi ghee. Each product mentions its key ingredients — just ask us anything!", "order": 6},
    {"question": "Can I schedule a cake for a specific time?", "answer": "Yes, once your order is confirmed we deliver at your preferred time slot. For same-day delivery, please order before 12 PM.", "order": 7},
]

SEED_BANNERS = [
    {"title": "Fresh Every Day. Trusted for Generations.", "subtitle": "Loved Across Meerut for Nankhatai, Rewri, Gazak, Shakes & Premium Gift Hampers.", "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920&auto=format&fit=crop", "cta_text": "Explore Products", "cta_link": "/products", "active": True, "order": 1},
]


async def seed_data():
    # Categories
    if await db.categories.count_documents({}) == 0:
        docs = [Category(**c).model_dump() for c in SEED_CATEGORIES]
        await db.categories.insert_many(docs)
    # Products
    if await db.products.count_documents({}) == 0:
        docs = [Product(**p).model_dump() for p in SEED_PRODUCTS]
        await db.products.insert_many(docs)
    # Testimonials
    if await db.testimonials.count_documents({}) == 0:
        docs = [Testimonial(**t).model_dump() for t in SEED_TESTIMONIALS]
        await db.testimonials.insert_many(docs)
    # Gallery
    if await db.gallery.count_documents({}) == 0:
        docs = [GalleryItem(**g).model_dump() for g in SEED_GALLERY]
        await db.gallery.insert_many(docs)
    # FAQs
    if await db.faqs.count_documents({}) == 0:
        docs = [FAQ(**f).model_dump() for f in SEED_FAQS]
        await db.faqs.insert_many(docs)
    # Banners
    if await db.banners.count_documents({}) == 0:
        docs = [Banner(**b).model_dump() for b in SEED_BANNERS]
        await db.banners.insert_many(docs)


async def seed_admin():
    email = os.environ["ADMIN_EMAIL"].lower()
    pw = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": email})
    if not existing:
        doc = {
            "id": str(uuid.uuid4()),
            "email": email,
            "name": "PAHWA JEE Admin",
            "role": "admin",
            "password_hash": hash_password(pw),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(doc)
        logger.info(f"Seeded admin: {email}")
    elif not verify_password(pw, existing.get("password_hash", "")):
        await db.users.update_one({"email": email}, {"$set": {"password_hash": hash_password(pw)}})
        logger.info(f"Updated admin password: {email}")


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.products.create_index("slug", unique=True)
    await db.categories.create_index("slug", unique=True)
    await seed_admin()
    await seed_data()


@app.on_event("shutdown")
async def shutdown():
    client.close()


# ------------------- Auth routes -------------------
@api_router.post("/auth/login")
async def login(body: LoginIn, response: Response):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user.get("password_hash", "")):
        raise HTTPException(401, "Invalid email or password")
    uid = user["id"]
    access = create_access_token(uid, email)
    refresh = create_refresh_token(uid)
    set_auth_cookies(response, access, refresh)
    return {"id": uid, "email": email, "name": user.get("name"), "role": user.get("role")}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}

@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user

@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(401, "No refresh token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(401, "Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(401, "User not found")
        new_access = create_access_token(user["id"], user["email"])
        response.set_cookie("access_token", new_access, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
        return {"ok": True}
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid refresh token")


# ------------------- Public routes -------------------
@api_router.get("/")
async def root():
    return {"name": "PAHWA JEE API", "status": "ok"}

@api_router.get("/categories")
async def get_categories():
    return await db.categories.find({}, {"_id": 0}).sort("order", 1).to_list(200)

@api_router.get("/products")
async def get_products(category: Optional[str] = None, featured: Optional[bool] = None, bestseller: Optional[bool] = None, q: Optional[str] = None, limit: int = 200):
    query = {}
    if category:
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    if bestseller is not None:
        query["bestseller"] = bestseller
    if q:
        query["$or"] = [{"name": {"$regex": q, "$options": "i"}}, {"description": {"$regex": q, "$options": "i"}}]
    return await db.products.find(query, {"_id": 0}).sort("order", 1).to_list(limit)

@api_router.get("/products/{slug}")
async def get_product(slug: str):
    p = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Product not found")
    return p

@api_router.get("/testimonials")
async def get_testimonials():
    return await db.testimonials.find({}, {"_id": 0}).sort("order", 1).to_list(100)

@api_router.get("/gallery")
async def get_gallery():
    return await db.gallery.find({}, {"_id": 0}).sort("order", 1).to_list(200)

@api_router.get("/banners")
async def get_banners():
    return await db.banners.find({"active": True}, {"_id": 0}).sort("order", 1).to_list(20)

@api_router.get("/faqs")
async def get_faqs():
    return await db.faqs.find({}, {"_id": 0}).sort("order", 1).to_list(100)

@api_router.post("/inquiries")
async def create_inquiry(body: InquiryIn):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.inquiries.insert_one(doc)
    return {"ok": True, "id": doc["id"]}

@api_router.post("/newsletter")
async def newsletter(body: NewsletterIn):
    email = body.email.lower()
    await db.newsletter.update_one({"email": email}, {"$setOnInsert": {"email": email, "created_at": datetime.now(timezone.utc).isoformat()}}, upsert=True)
    return {"ok": True}


# ------------------- Admin routes -------------------
def _slugify(name: str) -> str:
    from re import sub
    return sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')

@api_router.get("/admin/inquiries")
async def admin_inquiries(_: dict = Depends(require_admin)):
    return await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

@api_router.get("/admin/newsletter")
async def admin_newsletter(_: dict = Depends(require_admin)):
    return await db.newsletter.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)

@api_router.post("/admin/products")
async def admin_create_product(body: ProductIn, _: dict = Depends(require_admin)):
    data = body.model_dump()
    if not data.get("slug"):
        data["slug"] = _slugify(data["name"])
    if await db.products.find_one({"slug": data["slug"]}):
        raise HTTPException(400, "Slug already exists")
    prod = Product(**data)
    await db.products.insert_one(prod.model_dump())
    return prod.model_dump()

@api_router.put("/admin/products/{pid}")
async def admin_update_product(pid: str, body: ProductIn, _: dict = Depends(require_admin)):
    data = body.model_dump()
    if not data.get("slug"):
        data["slug"] = _slugify(data["name"])
    res = await db.products.update_one({"id": pid}, {"$set": data})
    if res.matched_count == 0:
        raise HTTPException(404, "Product not found")
    return await db.products.find_one({"id": pid}, {"_id": 0})

@api_router.delete("/admin/products/{pid}")
async def admin_delete_product(pid: str, _: dict = Depends(require_admin)):
    await db.products.delete_one({"id": pid})
    return {"ok": True}

@api_router.post("/admin/testimonials")
async def admin_create_testimonial(body: TestimonialIn, _: dict = Depends(require_admin)):
    t = Testimonial(**body.model_dump())
    await db.testimonials.insert_one(t.model_dump())
    return t.model_dump()

@api_router.delete("/admin/testimonials/{tid}")
async def admin_delete_testimonial(tid: str, _: dict = Depends(require_admin)):
    await db.testimonials.delete_one({"id": tid})
    return {"ok": True}

@api_router.post("/admin/gallery")
async def admin_create_gallery(body: GalleryIn, _: dict = Depends(require_admin)):
    g = GalleryItem(**body.model_dump())
    await db.gallery.insert_one(g.model_dump())
    return g.model_dump()

@api_router.delete("/admin/gallery/{gid}")
async def admin_delete_gallery(gid: str, _: dict = Depends(require_admin)):
    await db.gallery.delete_one({"id": gid})
    return {"ok": True}


# ------------------- Wire up -------------------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
