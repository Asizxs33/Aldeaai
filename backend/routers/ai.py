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
    presentationType: str | None = None
    topic: str | None = None


VALID_LAYOUTS = {"title", "split_right", "split_left", "grid", "quote", "timeline", "stats"}


@router.post("/generate-presentation")
def generate_presentation(body: PresentationBody):
    if not body.prompt:
        raise HTTPException(400, "Prompt is required")

    slide_count = body.slideCount or 8
    lang_map = {"kk": "казахском", "ru": "русском", "en": "английском"}
    lang = lang_map.get(body.language or "ru", "русском")

    system_prompt = f"""You are an expert presentation designer for educational content.
Return ONLY a valid JSON object with this exact structure — no extra text:
{{
  "slides": [
    {{
      "id": 1,
      "title": "Slide title (5-8 words)",
      "content": "Main paragraph: 2-3 informative sentences explaining the topic in detail.",
      "bulletPoints": ["Point 1 with detail", "Point 2 with detail", "Point 3 with detail", "Point 4 with detail"],
      "layout": "one of: title | split_right | split_left | grid | quote | timeline | stats",
      "imageSearchTerm": "2-3 English keywords for image search (always English)"
    }}
  ]
}}

Layout assignment rules (STRICTLY follow these):
- Slide 1: ALWAYS "title"
- Last slide: "quote" (inspiring conclusion) or "title"
- Slides with 3 numbers/percentages/statistics: "stats"
- Slides comparing 4 items: "grid"
- Slides about history/steps/process: "timeline"
- Alternate between "split_right" and "split_left" for regular content slides

Content rules:
- content: ALWAYS 2-3 full sentences, informative and substantive — NEVER empty
- bulletPoints: ALWAYS 3-4 items with real text — NEVER empty array
- title: concise but meaningful (5-8 words)
- imageSearchTerm: always in English, relevant to slide content
- All slide text content must be in {lang} language
- imageSearchTerm must be in English regardless of language"""

    user_prompt = f"""Create a {slide_count}-slide presentation on: "{body.prompt}"
Language: {lang}
Presentation type: {body.presentationType or 'academic'}
Make it educational, engaging, and content-rich. Every slide must have substantial text."""

    client = get_openai()
    completion = client.chat.completions.create(
        model=get_model(),
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.7,
        response_format={"type": "json_object"},
    )

    content = completion.choices[0].message.content
    parsed = json.loads(content)
    slides = parsed.get("slides", parsed)
    if not isinstance(slides, list):
        slides = [slides]

    import random as _random
    normalized = []
    for i, s in enumerate(slides):
        layout = s.get("layout", "split_right")
        if layout not in VALID_LAYOUTS:
            layout = "split_right"

        search_term = s.get("imageSearchTerm", body.prompt)
        safe_term = search_term.replace(" ", ",")
        image_url = f"https://loremflickr.com/800/500/{safe_term}?random={_random.randint(1, 99999)}"

        normalized.append({
            "id": s.get("id", i + 1),
            "title": s.get("title", f"Slide {i+1}"),
            "content": s.get("content", ""),
            "bulletPoints": s.get("bulletPoints", []) if isinstance(s.get("bulletPoints"), list) else [],
            "layout": layout,
            "imageUrl": image_url,
        })

    return {"slides": normalized}


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
