import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any
import database

router = APIRouter(prefix="/analytics", tags=["analytics"])


class EventBody(BaseModel):
    eventType: str
    userId: int | str | None = None
    eventData: Any = None


@router.post("", status_code=201)
def log_event(body: EventBody):
    if not body.eventType:
        raise HTTPException(400, "eventType is required")
    database.query(
        "INSERT INTO analytics_events (user_id, event_type, event_data) VALUES (%s, %s, %s)",
        (body.userId, body.eventType, json.dumps(body.eventData) if body.eventData is not None else None),
    )
    return {"message": "Event logged"}


@router.get("")
def get_analytics():
    by_type = database.query(
        "SELECT event_type, COUNT(*) as count FROM analytics_events GROUP BY event_type ORDER BY count DESC"
    )
    today = database.query(
        "SELECT event_type, COUNT(*) as count FROM analytics_events WHERE created_at >= CURRENT_DATE GROUP BY event_type"
    )
    weekly = database.query(
        "SELECT DATE(created_at) as date, event_type, COUNT(*) as count "
        "FROM analytics_events WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' "
        "GROUP BY DATE(created_at), event_type ORDER BY date"
    )
    unique_users = database.query(
        "SELECT COUNT(DISTINCT user_id) as count FROM analytics_events WHERE user_id IS NOT NULL"
    )[0]["count"]
    total = database.query("SELECT COUNT(*) as total FROM analytics_events")[0]["total"]

    try:
        top_users = database.query(
            "SELECT u.email, u.name, COUNT(a.id) as event_count "
            "FROM analytics_events a JOIN users u ON a.user_id = u.id "
            "GROUP BY u.id, u.email, u.name ORDER BY event_count DESC LIMIT 10"
        )
    except Exception:
        top_users = []

    return {
        "totalEvents": int(total),
        "uniqueActiveUsers": int(unique_users),
        "eventsByType": {r["event_type"]: int(r["count"]) for r in by_type},
        "eventsToday": {r["event_type"]: int(r["count"]) for r in today},
        "weeklyEvents": [{"date": str(r["date"]), "type": r["event_type"], "count": int(r["count"])} for r in weekly],
        "topUsers": [{"email": r["email"], "name": r.get("name"), "events": int(r["event_count"])} for r in top_users],
    }
