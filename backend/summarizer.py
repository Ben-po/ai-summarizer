import os
from PyPDF2 import PdfReader
from dotenv import load_dotenv

# Use new OpenAI client (openai>=1.0.0)
from openai import OpenAI

# Load .env from this backend directory if present, but tolerate parse issues
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
try:
    load_dotenv(os.path.join(BASE_DIR, ".env"))
except Exception:
    # ignore parse errors and rely on environment variables
    pass

# Create a client using the OPENAI_API_KEY environment variable if present
_api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=_api_key) if _api_key else None

def extract_text_from_pdf(pdf_path):
    """Extracts all text from a PDF file."""
    text = ""
    reader = PdfReader(pdf_path)
    for page in reader.pages:
        text += page.extract_text() or ""
    return text.strip()

def summarize_text(text):
    """Summarizes the given text using OpenAI."""
    if not text:
        return "No readable text found in the PDF."

    # Trim if text is too long (models have token limits)
    if len(text) > 12000:
        text = text[:12000]

    prompt = f"Summarize the following PDF content in a clear, concise way:\n\n{text}"

    # Ensure API client is available
    if not client:
        return "OpenAI API key not configured. Set OPENAI_API_KEY in environment or backend/.env"

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert at summarizing documents."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.5,  # how creative the response is
            max_tokens=500,
        )
    except Exception as e:
        err = str(e)
        # If the error is due to insufficient quota or rate limits, fall back to a
        # local extractive summarizer so the feature still works offline.
        if "insufficient_quota" in err or "429" in err or "quota" in err.lower():
            fallback = local_summarize(text)
            return (
                "(OpenAI unavailable - falling back to local summary)\n\n" + fallback
            )
        return f"OpenAI API error: {e}"

    # Extract text defensively (client responses can be objects or dict-like)
    try:
        return response.choices[0].message.content.strip()
    except Exception:
        try:
            return response["choices"][0]["message"]["content"].strip()
        except Exception:
            return str(response)


def local_summarize(text, max_sentences: int = 3) -> str:
    """Simple extractive summarizer as a fallback when OpenAI isn't available.

    Chooses the top `max_sentences` scoring sentences by word frequency.
    This is intentionally lightweight and has no external dependencies.
    """
    import re
    from collections import Counter

    # Split into sentences (simple rule-based)
    sentences = re.split(r'(?<=[\.!?])\s+', text.strip())
    if not sentences:
        return ""
    if len(sentences) <= max_sentences:
        return " ".join(sentences)

    # Build simple frequency table (lowercased words)
    words = re.findall(r"\w+", text.lower())
    # Minimal stopword list
    stopwords = {
        'the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'for', 'on', 'with',
        'as', 'are', 'was', 'be', 'by', 'an', 'or', 'from', 'at', 'this', 'which'
    }
    words = [w for w in words if w not in stopwords and len(w) > 2]
    freqs = Counter(words)

    # Score sentences
    sent_scores = []
    for i, s in enumerate(sentences):
        s_words = re.findall(r"\w+", s.lower())
        score = sum(freqs.get(w, 0) for w in s_words)
        sent_scores.append((i, score, s))

    # Pick top sentences by score, preserve original order
    top = sorted(sent_scores, key=lambda x: x[1], reverse=True)[:max_sentences]
    top_sorted = sorted(top, key=lambda x: x[0])
    summary = " ".join(s for _, _, s in top_sorted)
    return summary
