import json
import random
import string
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Any
import database

router = APIRouter(tags=["tapqyr"])

GAME_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def generate_code() -> str:
    return "".join(random.choices(GAME_CHARS, k=6))


def parse_json_field(val):
    if isinstance(val, str):
        return json.loads(val)
    return val


# ── Quizzes ───────────────────────────────────────────────────────────────────

class QuizCreate(BaseModel):
    userId: str
    title: str
    questions: list[Any]


class QuizUpdate(BaseModel):
    title: str | None = None
    questions: list[Any] | None = None


@router.get("/tapqyr-quizzes")
def list_quizzes(userId: str = Query(...)):
    rows = database.query(
        "SELECT * FROM tapqyr_quizzes WHERE user_id = %s ORDER BY created_at DESC",
        (userId,),
    )
    return rows


@router.get("/tapqyr-quizzes/{id}")
def get_quiz(id: int):
    rows = database.query("SELECT * FROM tapqyr_quizzes WHERE id = %s", (id,))
    if not rows:
        raise HTTPException(404, "Quiz not found")
    return rows[0]


@router.post("/tapqyr-quizzes", status_code=201)
def create_quiz(body: QuizCreate):
    rows = database.query(
        "INSERT INTO tapqyr_quizzes (user_id, title, questions) VALUES (%s, %s, %s) RETURNING *",
        (body.userId, body.title, json.dumps(body.questions)),
    )
    return rows[0]


@router.put("/tapqyr-quizzes/{id}")
def update_quiz(id: int, body: QuizUpdate):
    parts, values = [], []
    if body.title is not None:
        parts.append("title = %s")
        values.append(body.title)
    if body.questions is not None:
        parts.append("questions = %s")
        values.append(json.dumps(body.questions))
    parts.append("updated_at = NOW()")
    values.append(id)

    rows = database.query(
        f"UPDATE tapqyr_quizzes SET {', '.join(parts)} WHERE id = %s RETURNING *",
        tuple(values),
    )
    if not rows:
        raise HTTPException(404, "Quiz not found")
    return rows[0]


@router.delete("/tapqyr-quizzes/{id}")
def delete_quiz(id: int):
    database.query("DELETE FROM tapqyr_quizzes WHERE id = %s", (id,))
    return {"message": "Quiz deleted"}


# ── Sessions ──────────────────────────────────────────────────────────────────

class SessionCreate(BaseModel):
    quizId: int
    hostId: str


class SessionAction(BaseModel):
    action: str
    data: Any = None


@router.post("/tapqyr-sessions", status_code=201)
def create_session(body: SessionCreate):
    code = None
    for _ in range(10):
        candidate = generate_code()
        existing = database.query(
            "SELECT id FROM tapqyr_sessions WHERE code = %s AND status != %s",
            (candidate, "finished"),
        )
        if not existing:
            code = candidate
            break
    if not code:
        raise HTTPException(500, "Could not generate unique session code")

    rows = database.query(
        "INSERT INTO tapqyr_sessions (code, quiz_id, host_id, status, current_question, game_state) "
        "VALUES (%s, %s, %s, 'waiting', -1, '{}') RETURNING *",
        (code, body.quizId, body.hostId),
    )
    quiz = database.query("SELECT * FROM tapqyr_quizzes WHERE id = %s", (body.quizId,))
    return {**rows[0], "quiz": quiz[0] if quiz else None}


@router.get("/tapqyr-sessions/{code}")
def get_session(code: str):
    code = code.upper()
    rows = database.query(
        "SELECT s.*, q.title as quiz_title, q.questions "
        "FROM tapqyr_sessions s JOIN tapqyr_quizzes q ON s.quiz_id = q.id "
        "WHERE s.code = %s AND s.status != 'finished'",
        (code,),
    )
    if not rows:
        raise HTTPException(404, "Session not found or finished")

    session = rows[0]
    players = database.query(
        "SELECT * FROM tapqyr_players WHERE session_id = %s ORDER BY joined_at",
        (session["id"],),
    )
    return {**session, "players": players}


@router.put("/tapqyr-sessions/{code}")
def update_session(code: str, body: SessionAction):
    code = code.upper()
    action = body.action

    if action == "start":
        sql = "UPDATE tapqyr_sessions SET status='playing', current_question=0, started_at=NOW() WHERE code=%s RETURNING *"
        params = (code,)
    elif action == "nextQuestion":
        sql = (
            "UPDATE tapqyr_sessions SET current_question=current_question+1, "
            "game_state=jsonb_set(COALESCE(game_state,'{}')::jsonb, '{showAnswer}', '\"false\"') "
            "WHERE code=%s RETURNING *"
        )
        params = (code,)
    elif action == "showAnswer":
        sql = (
            "UPDATE tapqyr_sessions SET game_state=jsonb_set(COALESCE(game_state,'{}')::jsonb, '{showAnswer}', 'true') "
            "WHERE code=%s RETURNING *"
        )
        params = (code,)
    elif action == "finish":
        sql = "UPDATE tapqyr_sessions SET status='finished', finished_at=NOW() WHERE code=%s RETURNING *"
        params = (code,)
    elif action == "updateState":
        sql = "UPDATE tapqyr_sessions SET game_state=%s WHERE code=%s RETURNING *"
        params = (json.dumps(body.data), code)
    else:
        raise HTTPException(400, "Invalid action")

    rows = database.query(sql, params)
    if not rows:
        raise HTTPException(404, "Session not found")
    return rows[0]


@router.delete("/tapqyr-sessions/{code}")
def delete_session(code: str):
    code = code.upper()
    session = database.query("SELECT id FROM tapqyr_sessions WHERE code = %s", (code,))
    if session:
        sid = session[0]["id"]
        database.query("DELETE FROM tapqyr_players WHERE session_id = %s", (sid,))
        database.query("DELETE FROM tapqyr_answers WHERE session_id = %s", (sid,))
    database.query("DELETE FROM tapqyr_sessions WHERE code = %s", (code,))
    return {"message": "Session deleted"}


# ── Players ───────────────────────────────────────────────────────────────────

class PlayerJoin(BaseModel):
    code: str
    name: str


@router.post("/tapqyr-players", status_code=201)
def join_game(body: PlayerJoin):
    code = body.code.upper()
    name = body.name.strip()

    session_rows = database.query(
        "SELECT s.*, q.questions, q.title as quiz_title FROM tapqyr_sessions s "
        "JOIN tapqyr_quizzes q ON s.quiz_id = q.id "
        "WHERE s.code = %s AND s.status = 'waiting'",
        (code,),
    )
    if not session_rows:
        raise HTTPException(404, "Game not found or already started")

    session = session_rows[0]

    existing = database.query(
        "SELECT id FROM tapqyr_players WHERE session_id = %s AND name = %s",
        (session["id"], name),
    )
    if existing:
        raise HTTPException(400, "Name already taken")

    avatar = f"https://api.dicebear.com/7.x/fun-emoji/svg?seed={name}"
    player_rows = database.query(
        "INSERT INTO tapqyr_players (session_id, name, score, avatar) VALUES (%s, %s, 0, %s) RETURNING *",
        (session["id"], name, avatar),
    )

    questions = parse_json_field(session.get("questions") or [])
    return {
        "player": player_rows[0],
        "session": {
            "code": session["code"],
            "status": session["status"],
            "quizTitle": session.get("quiz_title", "Quiz"),
            "questionCount": len(questions) if isinstance(questions, list) else 0,
        },
    }


@router.get("/tapqyr-players/{code}")
def get_players(code: str, playerId: str | None = Query(None)):
    code = code.upper()
    session_rows = database.query(
        "SELECT s.*, q.questions FROM tapqyr_sessions s "
        "JOIN tapqyr_quizzes q ON s.quiz_id = q.id WHERE s.code = %s",
        (code,),
    )
    if not session_rows:
        raise HTTPException(404, "Session not found")

    session = session_rows[0]
    players = database.query(
        "SELECT * FROM tapqyr_players WHERE session_id = %s ORDER BY score DESC",
        (session["id"],),
    )

    answers = []
    if session.get("status") == "playing" and session.get("current_question", -1) >= 0:
        answers = database.query(
            "SELECT player_id, answer_index FROM tapqyr_answers WHERE session_id = %s AND question_index = %s",
            (session["id"], session["current_question"]),
        )

    questions = parse_json_field(session.get("questions") or [])
    return {
        "status": session["status"],
        "currentQuestion": session["current_question"],
        "gameState": session.get("game_state") or {},
        "players": players,
        "answeredCount": len(answers),
        "questions": questions if session["status"] == "playing" else None,
    }


# ── Answers ───────────────────────────────────────────────────────────────────

class AnswerBody(BaseModel):
    code: str
    playerId: int
    questionIndex: int
    answerIndex: int
    timeLeft: float | None = None
    maxTime: float | None = None


@router.post("/tapqyr-answer")
def submit_answer(body: AnswerBody):
    code = body.code.upper()

    session_rows = database.query(
        "SELECT s.*, q.questions FROM tapqyr_sessions s "
        "JOIN tapqyr_quizzes q ON s.quiz_id = q.id "
        "WHERE s.code = %s AND s.status = 'playing'",
        (code,),
    )
    if not session_rows:
        raise HTTPException(404, "Game not found or not playing")

    session = session_rows[0]
    questions = parse_json_field(session.get("questions") or [])

    existing = database.query(
        "SELECT id FROM tapqyr_answers WHERE session_id=%s AND player_id=%s AND question_index=%s",
        (session["id"], body.playerId, body.questionIndex),
    )
    if existing:
        raise HTTPException(400, "Already answered")

    correct_index = questions[body.questionIndex].get("correctIndex") if len(questions) > body.questionIndex else None
    is_correct = body.answerIndex == correct_index
    points = 0
    if is_correct:
        speed = (body.timeLeft / body.maxTime) if (body.timeLeft is not None and body.maxTime) else 0.5
        points = round(500 + 500 * speed)

    database.query(
        "INSERT INTO tapqyr_answers (session_id, player_id, question_index, answer_index, is_correct, points, answered_at) "
        "VALUES (%s, %s, %s, %s, %s, %s, NOW())",
        (session["id"], body.playerId, body.questionIndex, body.answerIndex, is_correct, points),
    )
    if points > 0:
        database.query("UPDATE tapqyr_players SET score = score + %s WHERE id = %s", (points, body.playerId))

    player = database.query("SELECT * FROM tapqyr_players WHERE id = %s", (body.playerId,))
    return {
        "isCorrect": is_correct,
        "correctIndex": correct_index,
        "points": points,
        "totalScore": player[0]["score"] if player else 0,
    }
