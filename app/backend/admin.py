"""Authenticated shop operations. Customer receipts remain immutable."""
import re
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from pydantic import BaseModel, ConfigDict, Field
from pymongo import ReturnDocument

ORDER_TRANSITIONS = {
    "requested": ("confirmed", "cancelled"),
    "confirmed": ("preparing", "cancelled"),
    "preparing": ("ready", "cancelled"),
    "ready": ("completed", "cancelled"),
    "completed": (),
    "cancelled": (),
}
OrderStatus = Literal["requested", "confirmed", "preparing", "ready", "completed", "cancelled"]
InquiryStatus = Literal["new", "contacted", "closed"]


class OrderUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    status: OrderStatus
    expected_status: OrderStatus
    internal_notes: str = Field(default="", max_length=2000)


class InquiryUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    status: InquiryStatus
    expected_status: InquiryStatus
    internal_notes: str = Field(default="", max_length=2000)


def create_admin_router(db, require_admin):
    router = APIRouter(prefix="/api/admin", dependencies=[Depends(require_admin)])

    @router.get("/overview")
    async def overview(response: Response):
        response.headers["Cache-Control"] = "no-store"
        return {
            "products": await db.products.count_documents({}),
            "unavailable_products": await db.products.count_documents({"availability": {"$ne": "Available"}}),
            "open_orders": await db.orders.count_documents({"status": {"$in": ["requested", "confirmed", "preparing", "ready"]}}),
            "new_inquiries": await db.inquiries.count_documents({"$or": [{"status": "new"}, {"status": {"$exists": False}}]}),
        }

    @router.get("/order-inbox")
    async def order_inbox(response: Response, status: OrderStatus | None = None,
                          q: str = Query("", max_length=100), page: int = Query(1, ge=1),
                          limit: int = Query(20, ge=1, le=100)):
        response.headers["Cache-Control"] = "no-store"
        query = {"status": status} if status else {}
        if q.strip():
            pattern = {"$regex": re.escape(q.strip()), "$options": "i"}
            query["$or"] = [{key: pattern} for key in ("reference", "customer.name", "customer.phone")]
        projection = {"_id": 0, "fingerprint": 0, "idempotency_key": 0}
        rows = await db.orders.find(query, projection).sort("created_at", -1).skip((page - 1) * limit).to_list(limit)
        return {"items": rows, "total": await db.orders.count_documents(query)}

    @router.patch("/orders/{reference}")
    async def update_order(reference: str, body: OrderUpdate, user: dict = Depends(require_admin)):
        if body.status != body.expected_status and body.status not in ORDER_TRANSITIONS[body.expected_status]:
            raise HTTPException(422, "This order status change is not allowed.")
        now = datetime.now(timezone.utc).isoformat()
        changes = {"status": body.status, "internal_notes": body.internal_notes.strip(), "updated_at": now}
        update = {"$set": changes}
        if body.status != body.expected_status:
            update["$push"] = {"status_history": {"from": body.expected_status, "to": body.status, "at": now, "by": user["id"]}}
        result = await db.orders.find_one_and_update(
            {"reference": reference, "status": body.expected_status}, update,
            projection={"_id": 0, "fingerprint": 0, "idempotency_key": 0}, return_document=ReturnDocument.AFTER,
        )
        if result is None:
            if not await db.orders.find_one({"reference": reference}, {"_id": 1}):
                raise HTTPException(404, "Order not found.")
            raise HTTPException(409, "This order changed in another session. Refresh it before saving.")
        return result

    @router.get("/inquiry-inbox")
    async def inquiry_inbox(response: Response, status: InquiryStatus | None = None,
                            q: str = Query("", max_length=100), page: int = Query(1, ge=1),
                            limit: int = Query(20, ge=1, le=100)):
        response.headers["Cache-Control"] = "no-store"
        conditions = []
        if status == "new":
            conditions.append({"$or": [{"status": "new"}, {"status": {"$exists": False}}]})
        elif status:
            conditions.append({"status": status})
        if q.strip():
            pattern = {"$regex": re.escape(q.strip()), "$options": "i"}
            conditions.append({"$or": [{key: pattern} for key in ("name", "phone", "email", "product", "message")]})
        query = {"$and": conditions} if conditions else {}
        rows = await db.inquiries.find(query, {"_id": 0}).sort("created_at", -1).skip((page - 1) * limit).to_list(limit)
        return {"items": [{**row, "status": row.get("status", "new")} for row in rows], "total": await db.inquiries.count_documents(query)}

    @router.patch("/inquiries/{inquiry_id}")
    async def update_inquiry(inquiry_id: str, body: InquiryUpdate):
        query = {"id": inquiry_id}
        if body.expected_status == "new":
            query["$or"] = [{"status": "new"}, {"status": {"$exists": False}}]
        else:
            query["status"] = body.expected_status
        result = await db.inquiries.find_one_and_update(query, {"$set": {
            "status": body.status, "internal_notes": body.internal_notes.strip(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }}, projection={"_id": 0}, return_document=ReturnDocument.AFTER)
        if result is None:
            if not await db.inquiries.find_one({"id": inquiry_id}, {"_id": 1}):
                raise HTTPException(404, "Enquiry not found.")
            raise HTTPException(409, "This enquiry changed in another session. Refresh it before saving.")
        return result

    return router
