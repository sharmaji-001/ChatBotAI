# ═══════════════════════════════════════════════════════════════════════════════
#  Rapt — AI Assistant for Raptbot Technologies Private Limited
#  Version : 3.0.1  ← Numeric & Special Character Fix
#  Stack   : FastAPI + AWS Bedrock (Amazon Nova Lite) + Knowledge Base RAG
#  FIX     : clean_reply regex no longer strips numbers / special characters
# ═══════════════════════════════════════════════════════════════════════════════

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator
from typing import Optional
import boto3
import uuid
import logging
import time
import re
from datetime import datetime, timezone
from collections import defaultdict
from threading import Lock


# ───────────────────────────────────────────────────────────────────────────────
# Logging Setup
# ───────────────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("raptbot.api")


# ───────────────────────────────────────────────────────────────────────────────
# App Configuration
# ───────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Rapt — Raptbot AI Assistant",
    description=(
        "Official conversational AI assistant for Raptbot Technologies Private Limited. "
        "Powered by AWS Bedrock with Retrieval-Augmented Generation (RAG) + Session Memory."
    ),
    version="3.0.1",
    docs_url="/docs",
    redoc_url="/redoc",
    contact={
        "name": "Raptbot Technologies",
        "url": "https://www.raptbot.in",
        "email": "consulting@raptbot.com"
    }
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# ───────────────────────────────────────────────────────────────────────────────
# AWS Bedrock Client
# ───────────────────────────────────────────────────────────────────────────────
bedrock_agent = boto3.client(
    "bedrock-agent-runtime",
    region_name="us-east-1"
)

KNOWLEDGE_BASE_ID  = "RF2DTARKMP"
BEDROCK_MODEL_ARN  = "arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-lite-v1:0"
MAX_RETRIEVAL_DOCS = 5


# ───────────────────────────────────────────────────────────────────────────────
# In-Memory Session Store
# ───────────────────────────────────────────────────────────────────────────────
_session_store: dict[str, list] = defaultdict(list)
_session_lock  = Lock()
MAX_HISTORY_MESSAGES = 20


def get_history(session_id: str) -> list:
    with _session_lock:
        return list(_session_store[session_id])


def add_to_history(session_id: str, role: str, text: str):
    with _session_lock:
        _session_store[session_id].append({"role": role, "text": text})
        if len(_session_store[session_id]) > MAX_HISTORY_MESSAGES:
            _session_store[session_id] = _session_store[session_id][-MAX_HISTORY_MESSAGES:]


def clear_history(session_id: str):
    with _session_lock:
        _session_store.pop(session_id, None)


def build_history_block(history: list) -> str:
    if not history:
        return "(This is the very first message — no prior conversation.)"
    lines = []
    for turn in history:
        label = "User" if turn["role"] == "user" else "Rapt"
        lines.append(f"{label}: {turn['text']}")
    return "\n".join(lines)


# ───────────────────────────────────────────────────────────────────────────────
# System Prompt
# ───────────────────────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """
You are Rapt — the official AI assistant for Raptbot Technologies Private Limited,
a specialized Salesforce consulting company headquartered in Jaipur, India,
with 8+ years of experience delivering enterprise solutions for clients across
the USA, Canada, Europe, and India.

════════════════════════════════════════
MEMORY & CONTEXT — CRITICAL RULE
════════════════════════════════════════
You have access to the FULL conversation history in the CONVERSATION HISTORY block below.
You MUST use this history to:
- Remember facts the user told you (name, budget, team size, company, Salesforce version, etc.)
- Reference those facts naturally in your replies — like a human consultant would.
- Never ask the user to repeat something they already told you.
- If the user refers to something from earlier ("what I said before", "my budget", "my team"),
  look it up in the history and answer directly.

Example of CORRECT behavior:
  History:  User said "my budget is 1 crore"
  User now: "What engagement model suits me?"
  Rapt:     "Given your 1 crore budget, a Fixed Price engagement would give you
             the most predictability..."

Example of WRONG behavior:
  User now: "What was my budget?"
  Rapt:     "I don't have information about your budget." ← NEVER do this

════════════════════════════════════════
CORE IDENTITY
════════════════════════════════════════
You are a senior Salesforce consultant, not a FAQ bot.
You are knowledgeable, warm, and direct — like a trusted advisor in a real conversation.
You never sound robotic, templated, or evasive.

════════════════════════════════════════
RESPONSE QUALITY STANDARDS
════════════════════════════════════════
Every response you give must:
1. Start with a relevant, natural sentence — never a filler opener like "Great question!"
2. Directly address what the user asked before asking any follow-up questions.
3. Be written in smooth, flowing prose — not bullet-point dumps unless genuinely needed.
4. End with a follow-up question OR a clear next step / call-to-action.
5. Match the user's tone — formal when they are formal, conversational when casual.
6. Always be complete — never trail off or give half-answers.

════════════════════════════════════════
STRICT PROHIBITIONS — NEVER DO THESE
════════════════════════════════════════
- Never mention "passages", "chunks", "context", "search results", "knowledge base",
  or any internal retrieval references.
- Never say "Based on the information provided" or "According to the context".
- Never expose chunk IDs, passage numbers, or retrieval metadata.
- Never open with "Great question!", "Absolutely!", "Certainly!".
- Never say "I don't have information on that" without offering a follow-up.
- Never give a one-line dead-end answer.
- NEVER ask the user to repeat something already in the conversation history.
- Never break character or say you are an AI language model.

════════════════════════════════════════
RESPONSE LENGTH GUIDE
════════════════════════════════════════
- Simple factual / memory questions: 1–3 sentences, direct answer.
- Service or capability questions: 3–6 sentences + a follow-up question.
- Complex multi-part questions: Full detailed prose answer.
- Greetings: 3–5 sentences max.

════════════════════════════════════════
COMPANY FACTS
════════════════════════════════════════
Full Name     : Raptbot Technologies Private Limited
Founded       : March 2018  (7+ years of experience)
Headquarters  : 162/158, Sector 16, Pratap Nagar, Jaipur, Rajasthan 302033, India
Website       : www.raptbot.in
Phone         : +91 8123975208
Email         : consulting@raptbot.com
Core Focus    : Salesforce Consulting
Global Markets: USA, Canada, Europe, India

Services:
  Salesforce Implementation & Configuration
  Custom Development (Apex, Lightning Web Components)
  Salesforce Integrations (third-party apps, APIs, MuleSoft)
  Cloud & Data Migration
  Managed Services & Ongoing Support
  Consulting & Advisory
  Resource Augmentation / Staff Augmentation
  Heroku Application Development
  Cloud Database Solutions

Engagement Models:
  Fixed Price, Time & Materials, Monthly Retainer, Staff Augmentation

Tech Stack:
  Salesforce Platform, Salesforce DX, Heroku, Google Cloud,
  MuleSoft, Copado, Apex, LWC, REST/SOAP APIs
"""

PROMPT_TEMPLATE = (
    SYSTEM_PROMPT.strip()
    + "\n\n"
    + "════════════════════════════════════════\n"
    + " BACKGROUND KNOWLEDGE (use naturally — do NOT cite this block)\n"
    + "════════════════════════════════════════\n"
    + "$search_results$"
    + "\n\n"
    + "════════════════════════════════════════\n"
    + " CONVERSATION HISTORY (use this memory — NEVER ask user to repeat anything)\n"
    + "════════════════════════════════════════\n"
    + "$conversation_history$"
    + "\n\n"
    + "User's latest message: $query$\n\n"
    + "Your response (warm, natural, uses memory from conversation history):"
)


# ───────────────────────────────────────────────────────────────────────────────
# Dead-End Detection & Cleanup
# ───────────────────────────────────────────────────────────────────────────────
_DEAD_END_PATTERNS = [
    r"i (don'?t|do not|didn'?t|did not) have (specific |detailed |any )?(information|info|details|data|knowledge)",
    r"i (am|'m) not sure (about|of)",
    r"(no|not any) (specific |relevant )?(information|info|details|data) (is |was |are )?(available|provided|found|mentioned)",
    r"(cannot|can'?t|could not|couldn'?t) (find|locate|provide|access)",
    r"(not|isn'?t|wasn'?t) (mentioned|provided|covered|available|included)",
    r"(outside|beyond) (my|our) (knowledge|scope|information|data)",
    r"i (couldn'?t|could not|didn'?t|did not) find",
    r"no (information|details|data) (on|about|regarding) that",
    r"that (is|'s) not something i (have|can|know)",
    r"i don'?t have access to (our |previous |past |the )?conversation",
    r"i can'?t (recall|remember|access) (what|the)",
]
_COMPILED_DEAD_END = [re.compile(p, re.IGNORECASE) for p in _DEAD_END_PATTERNS]

_BAD_PREAMBLES = [
    r"based on (the )?(information|context|data|passages?|search results?|conversation history?) (provided|above|given|retrieved)[,.]?\s*",
    r"according to (the )?(context|passages?|search results?|data|knowledge base|conversation)[,.]?\s*",
    r"(the )?(passage|context|search results?|chunk)\s*(states?|says?|mentions?|indicates?|shows?)[,.]?\s*",
    r"as per (the )?(data|context|information|passage|conversation history)[,.]?\s*",
    r"from (the )?(context|passages?|search results?|conversation history)[,.]?\s*",
]
_COMPILED_BAD_PREAMBLES = [re.compile(p, re.IGNORECASE) for p in _BAD_PREAMBLES]

GREETING_TRIGGERS = frozenset({
    "hi", "hello", "hey", "howdy", "hiya", "good morning",
    "good afternoon", "good evening", "sup", "greetings", "what's up"
})

GREETING_RESPONSE = (
    "Hello! Welcome to Raptbot Technologies — I'm Rapt, your AI assistant here. "
    "We're a Salesforce-specialist consulting firm with over 7 years of experience "
    "helping businesses across the USA, Canada, Europe, and India get the most out of "
    "Salesforce. Whether you want to explore our services, discuss a project idea, or "
    "just need some Salesforce guidance, I'm here to help. What can I assist you with today?"
)

CLARIFICATION_FALLBACK = (
    "That's an interesting one — I want to make sure I give you the most useful answer, "
    "so let me ask a quick follow-up. Could you share a bit more context about what you're "
    "looking for? For instance, is this related to a specific Salesforce challenge, a project "
    "you're planning, pricing, or something else? The more detail you share, the better I can "
    "help. And if it's easier, you're always welcome to reach out directly at info@raptbot.in "
    "or call us at +91 8123975208."
)


def is_greeting(text: str) -> bool:
    cleaned = text.strip().lower().rstrip("!.,?")
    words   = cleaned.split()
    if len(words) <= 5:
        return any(cleaned == g or cleaned.startswith(g) for g in GREETING_TRIGGERS)
    return False


def is_dead_end(text: str) -> bool:
    if not text or len(text.strip()) < 20:
        return True
    return any(p.search(text) for p in _COMPILED_DEAD_END)


def clean_reply(text: str) -> str:
    """
    Strip only real Bedrock citation markers from the reply.

    FIX (v3.0.1): The previous single regex —
        r"%?\\[?(passage\\s*)?\\d+\\]?%?"
    — had every delimiter marked optional (?), so it collapsed to just \\d+
    and stripped ALL digits from the output (phone numbers, years, prices, etc.)
    and mangled surrounding special characters.

    Solution: three tight, non-optional patterns that each require their full
    surrounding syntax, leaving bare numbers in normal prose completely untouched.
    """
    # Pattern 1 — %1%  or  %[passage 1]%  (Bedrock percent-wrapped citations)
    text = re.sub(r"%\[?(passage\s*)?\d+\]?%", "", text, flags=re.IGNORECASE)

    # Pattern 2 — [passage 1]  (bracket + word "passage" + number)
    text = re.sub(r"\[passage\s*\d+\]", "", text, flags=re.IGNORECASE)

    # Pattern 3 — [1]  (plain bracketed number citation)
    text = re.sub(r"\[\d+\]", "", text)

    # Strip bad preambles ("Based on the context provided, ..." etc.)
    for pattern in _COMPILED_BAD_PREAMBLES:
        text = pattern.sub("", text)

    # Normalise whitespace
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r" {2,}", " ", text)

    return text.strip()


# ───────────────────────────────────────────────────────────────────────────────
# Pydantic Schemas
# ───────────────────────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000,
                         examples=["What Salesforce services do you offer?"])
    session_id: Optional[str] = Field(default=None,
                                      description="Pass the same session_id every message to maintain memory.")

    @field_validator("message")
    @classmethod
    def sanitize_message(cls, v: str) -> str:
        return v.strip()


class ChatResponse(BaseModel):
    success: bool
    session_id: str
    message_id: str
    reply: str
    timestamp: str
    response_time_ms: int
    history_length: int


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    backend: str
    active_sessions: int
    timestamp: str


class ErrorDetail(BaseModel):
    success: bool = False
    error_code: str
    message: str
    message_id: str
    timestamp: str
    support: str = "consulting@raptbot.com"


# ───────────────────────────────────────────────────────────────────────────────
# Exception Handlers
# ───────────────────────────────────────────────────────────────────────────────
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorDetail(
            error_code=f"http_{exc.status_code}",
            message=str(exc.detail),
            message_id=str(uuid.uuid4()),
            timestamp=datetime.now(timezone.utc).isoformat()
        ).model_dump()
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content=ErrorDetail(
            error_code="internal_server_error",
            message="Something went wrong. Please try again or contact info@raptbot.in.",
            message_id=str(uuid.uuid4()),
            timestamp=datetime.now(timezone.utc).isoformat()
        ).model_dump()
    )


# ───────────────────────────────────────────────────────────────────────────────
# Routes
# ───────────────────────────────────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
def root():
    return {
        "service": "Rapt — Raptbot AI Assistant v3.0.1",
        "status": "running",
        "endpoints": {
            "docs":          "/docs",
            "health":        "GET  /health",
            "chat":          "POST /chat",
            "clear_session": "DELETE /session/{session_id}",
            "view_history":  "GET  /session/{session_id}/history"
        }
    }


@app.get("/health", response_model=HealthResponse, tags=["System"])
def health_check():
    with _session_lock:
        active = len(_session_store)
    return HealthResponse(
        status="healthy",
        service="Rapt — Raptbot AI Assistant",
        version="3.0.1",
        backend="AWS Bedrock + RAG + Session Memory",
        active_sessions=active,
        timestamp=datetime.now(timezone.utc).isoformat()
    )


@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
def chat(request: ChatRequest):
    """
    Send a message to Rapt. Pass the same `session_id` every time to keep memory alive.
    Rapt will remember everything — budgets, names, requirements — across the whole conversation.
    """
    message_id   = str(uuid.uuid4())
    session_id   = request.session_id or str(uuid.uuid4())
    user_message = request.message
    start_time   = time.time()

    logger.info(f"[{session_id[:8]}] Received: \"{user_message[:80]}\"")

    # ── Greeting fast-path ──────────────────────────────────────────────────────
    if is_greeting(user_message):
        add_to_history(session_id, "user", user_message)
        add_to_history(session_id, "assistant", GREETING_RESPONSE)
        elapsed_ms = int((time.time() - start_time) * 1000)
        return ChatResponse(
            success=True, session_id=session_id, message_id=message_id,
            reply=GREETING_RESPONSE,
            timestamp=datetime.now(timezone.utc).isoformat(),
            response_time_ms=elapsed_ms,
            history_length=len(get_history(session_id))
        )

    # ── Load + format history ───────────────────────────────────────────────────
    history      = get_history(session_id)
    history_text = build_history_block(history)
    logger.info(f"[{session_id[:8]}] Memory: {len(history)} messages loaded.")

    # Save user msg first
    add_to_history(session_id, "user", user_message)

    # Inject history into prompt
    prompt_with_memory = PROMPT_TEMPLATE.replace("$conversation_history$", history_text)

    # ── Bedrock RAG call ────────────────────────────────────────────────────────
    try:
        bedrock_response = bedrock_agent.retrieve_and_generate(
            input={"text": user_message},
            retrieveAndGenerateConfiguration={
                "type": "KNOWLEDGE_BASE",
                "knowledgeBaseConfiguration": {
                    "knowledgeBaseId": KNOWLEDGE_BASE_ID,
                    "modelArn":        BEDROCK_MODEL_ARN,
                    "retrievalConfiguration": {
                        "vectorSearchConfiguration": {"numberOfResults": MAX_RETRIEVAL_DOCS}
                    },
                    "generationConfiguration": {
                        "promptTemplate": {"textPromptTemplate": prompt_with_memory},
                        "inferenceConfig": {
                            "textInferenceConfig": {
                                "temperature": 0.45,
                                "topP":        0.92,
                                "maxTokens":   700
                            }
                        }
                    }
                }
            }
        )
    except bedrock_agent.exceptions.ResourceNotFoundException:
        raise HTTPException(503, "Knowledge base unavailable. Please try again.")
    except bedrock_agent.exceptions.ThrottlingException:
        raise HTTPException(503, "High traffic — please retry in a few seconds.")
    except Exception as e:
        logger.error(f"[{session_id[:8]}] Bedrock error: {e}", exc_info=True)
        raise HTTPException(503, "AI service error. Please try again or contact info@raptbot.in.")

    # ── Clean + validate reply ──────────────────────────────────────────────────
    raw_reply = bedrock_response.get("output", {}).get("text", "").strip()
    reply     = clean_reply(raw_reply)

    if is_dead_end(reply):
        logger.warning(f"[{session_id[:8]}] Dead-end detected — using fallback.")
        reply = CLARIFICATION_FALLBACK

    # Save Rapt's reply to memory
    add_to_history(session_id, "assistant", reply)
    history_len = len(get_history(session_id))

    elapsed_ms = int((time.time() - start_time) * 1000)
    logger.info(f"[{session_id[:8]}] Done in {elapsed_ms}ms | memory: {history_len} msgs")

    return ChatResponse(
        success=True, session_id=session_id, message_id=message_id,
        reply=reply,
        timestamp=datetime.now(timezone.utc).isoformat(),
        response_time_ms=elapsed_ms,
        history_length=history_len
    )


@app.delete("/session/{session_id}", tags=["Session"])
def clear_session_endpoint(session_id: str):
    """Clear all memory for this session. Call when user clicks 'New Chat'."""
    clear_history(session_id)
    logger.info(f"Session cleared: {session_id[:8]}")
    return {"success": True, "message": "Session memory cleared."}


@app.get("/session/{session_id}/history", tags=["Session"])
def get_session_history(session_id: str):
    """Debug: view full conversation history for a session."""
    history = get_history(session_id)
    return {"session_id": session_id, "message_count": len(history), "history": history}
