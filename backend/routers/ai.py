import os
import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel
from openai import OpenAI

router = APIRouter(prefix="/ai", tags=["ai"])


def get_openai():
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(500, "OPENAI_API_KEY is not configured")
    return OpenAI(api_key=api_key)


def get_model():
    return os.environ.get("OPENAI_MODEL", "gpt-4o-mini")


# ── Generate presentation ──────────────────────────────────────────────────────

class PresentationBody(BaseModel):
    prompt: str
    slideCount: int | None = None
    language: str | None = None


@router.post("/generate-presentation")
def generate_presentation(body: PresentationBody):
    if not body.prompt:
        raise HTTPException(400, "Prompt is required")

    client = get_openai()
    completion = client.chat.completions.create(
        model=get_model(),
        messages=[
            {
                "role": "system",
                "content": "Ты - опытный педагог и методист. Твоя задача - создавать профессиональные презентации для образовательных целей. Всегда возвращай только валидный JSON массив, без дополнительного текста.",
            },
            {"role": "user", "content": body.prompt},
        ],
        temperature=0.7,
        response_format={"type": "json_object"},
    )

    content = completion.choices[0].message.content
    parsed = json.loads(content)
    slides = parsed.get("slides", parsed)
    if not isinstance(slides, list):
        slides = [slides]

    slides = [
        {
            "id": s.get("id", i + 1),
            "title": s.get("title", f"Слайд {i+1}"),
            "content": s.get("content", ""),
            "bulletPoints": s.get("bulletPoints", []) if isinstance(s.get("bulletPoints"), list) else [],
            "imageUrl": s.get("imageUrl"),
        }
        for i, s in enumerate(slides)
    ]
    return {"slides": slides}


# ── Generate content (streaming) ──────────────────────────────────────────────

class ContentBody(BaseModel):
    prompt: str
    toolId: str | None = None
    topic: str | None = None
    subjectTitle: str | None = None
    grade: str | None = None
    language: str | None = None
    responseFormat: str | None = None


@router.post("/generate-content")
def generate_content(body: ContentBody):
    if not body.prompt:
        raise HTTPException(400, "Prompt is required")

    client = get_openai()
    is_json = body.responseFormat == "json_object"

    def stream():
        completion = client.chat.completions.create(
            model=get_model(),
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Ты - полезный AI-ассистент. Отвечай строго в формате JSON."
                        if is_json
                        else "Ты - полезный AI-ассистент. Для ҚМЖ создавай только HTML таблицу. Для остальных инструментов используй понятную структуру."
                    ),
                },
                {"role": "user", "content": body.prompt},
            ],
            temperature=0.7,
            max_tokens=4000,
            stream=True,
            response_format={"type": "json_object"} if is_json else None,
        )
        for chunk in completion:
            text = chunk.choices[0].delta.content or ""
            if text:
                yield text

    return StreamingResponse(stream(), media_type="text/plain; charset=utf-8")


# ── Chat (non-streaming, for bot UI) ─────────────────────────────────────────

class ChatBody(BaseModel):
    message: str
    language: str | None = "ru"


@router.post("/chat")
def chat(body: ChatBody):
    if not body.message:
        raise HTTPException(400, "message is required")

    lang_map = {"kk": "казахском", "ru": "русском", "en": "английском"}
    lang = lang_map.get(body.language or "ru", "русском")

    client = get_openai()
    completion = client.chat.completions.create(
        model=get_model(),
        messages=[
            {
                "role": "system",
                "content": (
                    f"Ты - умный и дружелюбный AI-ассистент. "
                    f"Отвечай на {lang} языке. "
                    "Используй обычный текст, абзацы и Markdown. "
                    "Будь лаконичным и полезным."
                ),
            },
            {"role": "user", "content": body.message},
        ],
        temperature=0.7,
        max_tokens=2000,
    )
    return {"response": completion.choices[0].message.content}


# ── TTS ───────────────────────────────────────────────────────────────────────

class TTSBody(BaseModel):
    text: str
    voice: str | None = "alloy"


@router.post("/tts")
def tts(body: TTSBody):
    if not body.text:
        raise HTTPException(400, "Text is required")

    client = get_openai()
    response = client.audio.speech.create(
        model="tts-1",
        voice=body.voice or "alloy",
        input=body.text,
    )
    audio = response.read()
    return Response(content=audio, media_type="audio/mpeg")


# ── Tulga character speech ─────────────────────────────────────────────────────

class TulgaBody(BaseModel):
    topic: str
    character: str
    language: str | None = "en"


@router.post("/tulga-content")
def tulga_content(body: TulgaBody):
    if not body.topic or not body.character:
        raise HTTPException(400, "Topic and character are required")

    client = get_openai()
    prompt = (
        f'You are {body.character}. Write a short speech (about 30 seconds spoken) on the topic: "{body.topic}". '
        f"Language: {body.language}. Tone: Inspiring, wise, and characteristic of {body.character}. "
        "Keep it concise but impactful. Do not include stage directions or labels. Just the speech text."
    )
    completion = client.chat.completions.create(
        model=get_model(),
        messages=[
            {"role": "system", "content": f"You are acting as the historical figure {body.character}."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
    )
    return {"content": completion.choices[0].message.content}
