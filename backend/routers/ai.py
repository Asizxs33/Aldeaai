import json
import os
import re

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response, StreamingResponse
from openai import OpenAI
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["ai"])


def get_openai():
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(500, "OPENAI_API_KEY is not configured")
    return OpenAI(api_key=api_key)


def get_model():
    return os.environ.get("OPENAI_MODEL", "gpt-4o-mini")


def get_presentation_model():
    return os.environ.get("OPENAI_PRESENTATION_MODEL", get_model())


# Presentation generation -------------------------------------------------------


class PresentationBody(BaseModel):
    prompt: str
    slideCount: int | None = None
    language: str | None = None
    presentationType: str | None = None
    topic: str | None = None
    ktp: str | None = None


VALID_LAYOUTS = {"title", "split_right", "split_left", "grid", "quote", "timeline", "stats"}
LANGUAGE_MAP = {"kk": "Kazakh", "ru": "Russian", "en": "English"}
PRESENTATION_TYPE_GUIDANCE = {
    "academic": "Focus on clear concepts, definitions, and classroom-ready examples.",
    "open": "Make it interactive and discussion-driven with student engagement prompts.",
    "science": "Use hypothesis, evidence, method, and interpretation language.",
    "educational": "Prioritize practical life relevance and reflective questions.",
    "parent": "Use clear non-technical language and emphasize outcomes and support.",
}
GENERIC_BULLETS = {
    "en": ["Core idea explained", "Real-world example", "Common mistake to avoid", "Quick recap"],
    "ru": ["Core idea explained", "Real-world example", "Common mistake to avoid", "Quick recap"],
    "kk": ["Core idea explained", "Real-world example", "Common mistake to avoid", "Quick recap"],
}
PRACTICAL_BULLET = {
    "en": "Classroom action: quick student task/checkpoint",
    "ru": "Classroom action: quick student task/checkpoint",
    "kk": "Classroom action: quick student task/checkpoint",
}


def _clean_text(value, fallback):
    text = str(value or "").strip()
    text = re.sub(r"\s+", " ", text)
    return text if text else fallback


def _split_sentences(text):
    return [part.strip() for part in re.split(r"(?<=[.!?])\s+", text) if part.strip()]


def _ensure_content(text, fallback_title):
    content = _clean_text(text, f"{fallback_title}.")
    sentences = _split_sentences(content)
    if len(sentences) >= 2:
        return content
    if content.endswith((".", "!", "?")):
        return f"{content} This slide clarifies the concept with a practical classroom angle."
    return f"{content}. This slide clarifies the concept with a practical classroom angle."


def _normalize_bullets(raw_bullets, content, lang_code):
    clean = []
    if isinstance(raw_bullets, list):
        for item in raw_bullets:
            text = _clean_text(item, "")
            if text:
                clean.append(text)
    if len(clean) >= 3:
        result = clean[:4]
    else:
        derived = []
        for sentence in _split_sentences(content):
            short = sentence.strip()
            if len(short) > 140:
                short = short[:137].rstrip() + "..."
            if short and short not in derived:
                derived.append(short)
            if len(derived) >= 4:
                break

        while len(derived) < 3:
            fallback_items = GENERIC_BULLETS.get(lang_code, GENERIC_BULLETS["en"])
            derived.append(fallback_items[len(derived)])
        result = derived[:4]

    practical = PRACTICAL_BULLET.get(lang_code, PRACTICAL_BULLET["en"])
    lowered = " ".join(item.lower() for item in result)
    if not any(token in lowered for token in ("practice", "task", "checkpoint", "activity")):
        if len(result) < 4:
            result.append(practical)
        else:
            result[-1] = practical

    return result[:4]


def _guess_layout(index, total, source_layout, title, content):
    if index == 0:
        return "title"
    if index == total - 1:
        return "quote"

    layout = source_layout if source_layout in VALID_LAYOUTS else ""
    text = f"{title} {content}".lower()

    has_stats = bool(re.search(r"\b\d+([.,]\d+)?\s*%?\b", text))
    if has_stats:
        return "stats"
    if any(keyword in text for keyword in ("step", "stage", "timeline", "phase", "process")):
        return "timeline"
    if layout in VALID_LAYOUTS and layout not in {"title", "quote"}:
        return layout

    return "split_left" if index % 2 else "split_right"


def _make_image_term(raw_term, title, prompt):
    term = _clean_text(raw_term, "")
    if len(term) < 3:
        term = f"{title} {prompt}"
    term = re.sub(r"[^\w\s,-]", " ", term).strip()
    term = re.sub(r"\s+", " ", term)
    words = term.split(" ")
    if len(words) > 4:
        words = words[:4]
    return " ".join(words) if words else "education classroom"


def _build_slide_plan(slide_count, presentation_type):
    base_plan = [
        "Title and lesson framing",
        "Learning objectives and expected outcomes",
        "Core concept explanation",
        "Visual example or demonstration",
        "Guided practice with teacher prompts",
        "Common mistakes and how to avoid them",
        "Application task or mini-case",
        "Quick check for understanding",
        "Summary and key takeaways",
        "Reflection / homework / next steps",
    ]

    type_extra = {
        "science": "Include evidence, experiment logic, and interpretation.",
        "open": "Include interactive discussion prompts and student participation tasks.",
        "parent": "Include practical support recommendations for home.",
        "educational": "Include real-life behavior/value application examples.",
    }.get(presentation_type, "Include clear classroom execution steps.")

    selected = base_plan[:slide_count]
    if slide_count > len(base_plan):
        for i in range(slide_count - len(base_plan)):
            selected.append(f"Extended practice block {i + 1}")

    plan_lines = [f"- Slide {idx + 1}: {item}" for idx, item in enumerate(selected)]
    plan_lines.append(f"- Global type focus: {type_extra}")
    return "\n".join(plan_lines)


@router.post("/generate-presentation")
def generate_presentation(body: PresentationBody):
    if not body.prompt:
        raise HTTPException(400, "Prompt is required")

    slide_count = max(5, min(20, body.slideCount or 8))
    lang_code = (body.language or "ru").lower()
    lang_name = LANGUAGE_MAP.get(lang_code, "Russian")
    topic = _clean_text(body.topic or body.prompt, body.prompt)
    presentation_type = (body.presentationType or "academic").lower()
    type_hint = PRESENTATION_TYPE_GUIDANCE.get(
        presentation_type, "Keep a balanced educational style with clear examples and student-friendly explanations."
    )
    ktp_hint = _clean_text(body.ktp, "")
    lesson_plan = _build_slide_plan(slide_count, presentation_type)

    system_prompt = f"""You are an expert educational presentation designer.
Return ONLY valid JSON in this structure:
{{
  "slides": [
    {{
      "id": 1,
      "title": "Slide title (5-8 words)",
      "content": "2-3 informative full sentences",
      "bulletPoints": ["3-4 meaningful bullets with practical classroom value"],
      "layout": "title|split_right|split_left|grid|quote|timeline|stats",
      "imageSearchTerm": "2-4 English keywords"
    }}
  ]
}}

Quality requirements:
- Every slide must be lesson-ready, specific, and usable by a teacher immediately.
- Add practical points: class task, check for understanding, or student action.
- No generic filler, no empty arrays, no vague wording.
- All slide text must be in {lang_name}.
- imageSearchTerm must always be English.
- Return exactly {slide_count} slides."""

    user_prompt = f"""Create a {slide_count}-slide educational presentation.
Topic: "{topic}"
Language: {lang_name}
Presentation type: {presentation_type}
Type guidance: {type_hint}
KTP reference: {ktp_hint or "not provided"}

Use this slide flow:
{lesson_plan}

Make the deck practical for real classroom use."""

    client = get_openai()
    completion = client.chat.completions.create(
        model=get_presentation_model(),
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.35,
        response_format={"type": "json_object"},
    )

    content = completion.choices[0].message.content
    try:
        parsed = json.loads(content)
    except json.JSONDecodeError as exc:
        raise HTTPException(502, f"Invalid AI response JSON: {exc}") from exc

    slides = parsed.get("slides", parsed)
    if not isinstance(slides, list):
        slides = [slides]
    if not slides:
        raise HTTPException(502, "AI did not return slides")

    while len(slides) < slide_count:
        slides.append({})
    slides = slides[:slide_count]

    import random as _random

    normalized = []
    for i, s in enumerate(slides):
        title = _clean_text(s.get("title"), f"Slide {i + 1}")
        content_text = _ensure_content(s.get("content"), title)
        bullets = _normalize_bullets(s.get("bulletPoints"), content_text, lang_code)
        layout = _guess_layout(i, slide_count, s.get("layout"), title, content_text)
        search_term = _make_image_term(s.get("imageSearchTerm"), title, topic)
        safe_term = search_term.replace(" ", ",")
        image_url = f"https://loremflickr.com/800/500/{safe_term}?random={_random.randint(1, 99999)}"

        normalized.append(
            {
                "id": i + 1,
                "title": title,
                "content": content_text,
                "bulletPoints": bullets,
                "layout": layout,
                "imageUrl": image_url,
            }
        )

    return {"slides": normalized}


# Generic content generation (streaming) ---------------------------------------


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
                        "You are a helpful educational AI assistant. Return strict JSON when requested."
                        if is_json
                        else "You are a helpful educational AI assistant. Use clear structure and practical teaching language."
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


# Chat endpoint ----------------------------------------------------------------


class ChatBody(BaseModel):
    message: str
    language: str | None = "ru"


@router.post("/chat")
def chat(body: ChatBody):
    if not body.message:
        raise HTTPException(400, "message is required")

    lang_name = LANGUAGE_MAP.get((body.language or "ru").lower(), "Russian")

    client = get_openai()
    completion = client.chat.completions.create(
        model=get_model(),
        messages=[
            {
                "role": "system",
                "content": (
                    f"You are a smart and friendly AI assistant. Reply in {lang_name}. "
                    "Use plain text/Markdown and be concise and useful."
                ),
            },
            {"role": "user", "content": body.message},
        ],
        temperature=0.7,
        max_tokens=2000,
    )
    return {"response": completion.choices[0].message.content}


# TTS --------------------------------------------------------------------------


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


# Tulga character speech -------------------------------------------------------


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
