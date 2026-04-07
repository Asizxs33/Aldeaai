import json
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Any
import database

router = APIRouter(tags=["presentations"])


class PresentationCreate(BaseModel):
    userId: str
    title: str
    templateId: str
    slides: list[Any]
    topic: str | None = None
    language: str | None = "kk"
    slideCount: int | None = None
    presentationType: str | None = None
    ktp: Any = None


class PresentationUpdate(BaseModel):
    title: str | None = None
    topic: str | None = None
    templateId: str | None = None
    language: str | None = None
    slideCount: int | None = None
    slides: list[Any] | None = None
    presentationType: str | None = None
    ktp: Any = None


def _parse_slides(row: dict) -> dict:
    if isinstance(row.get("slides"), str):
        row["slides"] = json.loads(row["slides"])
    return row


@router.get("/presentation-api")
def list_presentations(userId: str = Query(...)):
    rows = database.query(
        "SELECT id, title, topic, template_id, language, slide_count, presentation_type, created_at, updated_at "
        "FROM presentations WHERE user_id = %s ORDER BY created_at DESC",
        (userId,),
    )
    return [dict(r, created_at=str(r["created_at"]), updated_at=str(r["updated_at"])) for r in rows]


@router.get("/presentation-api/{id}")
def get_presentation(id: int):
    rows = database.query("SELECT * FROM presentations WHERE id = %s", (id,))
    if not rows:
        raise HTTPException(404, "Presentation not found")
    return _parse_slides(rows[0])


@router.post("/presentation-api", status_code=201)
def create_presentation(body: PresentationCreate):
    rows = database.query(
        "INSERT INTO presentations (user_id, title, topic, template_id, language, slide_count, slides, presentation_type, ktp) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING *",
        (
            body.userId, body.title, body.topic, body.templateId,
            body.language or "kk", body.slideCount or len(body.slides),
            json.dumps(body.slides), body.presentationType,
            json.dumps(body.ktp) if body.ktp is not None else None,
        ),
    )
    return _parse_slides(rows[0])


@router.put("/presentation-api/{id}")
def update_presentation(id: int, body: PresentationUpdate):
    fields = body.model_dump(exclude_none=True)
    if not fields:
        raise HTTPException(400, "No fields to update")

    mapping = {
        "title": "title", "topic": "topic", "templateId": "template_id",
        "language": "language", "slideCount": "slide_count",
        "slides": "slides", "presentationType": "presentation_type", "ktp": "ktp",
    }
    parts, values = [], []
    for key, col in mapping.items():
        if key in fields:
            val = fields[key]
            if key in ("slides", "ktp") and val is not None:
                val = json.dumps(val)
            parts.append(f"{col} = %s")
            values.append(val)

    parts.append("updated_at = NOW()")
    values.append(id)

    rows = database.query(
        f"UPDATE presentations SET {', '.join(parts)} WHERE id = %s RETURNING *",
        tuple(values),
    )
    if not rows:
        raise HTTPException(404, "Presentation not found")
    return _parse_slides(rows[0])


@router.delete("/presentation-api/{id}")
def delete_presentation(id: int):
    rows = database.query("DELETE FROM presentations WHERE id = %s RETURNING id", (id,))
    if not rows:
        raise HTTPException(404, "Presentation not found")
    return {"message": "Presentation deleted", "id": rows[0]["id"]}
