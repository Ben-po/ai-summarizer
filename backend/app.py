from flask import Flask, request, jsonify
import os
import sys
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

# Make imports robust regardless of current working directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Load backend/.env if present, but tolerate parse errors so the app still starts
env_path = os.path.join(BASE_DIR, ".env")
try:
    load_dotenv(env_path)
except Exception as e:
    # don't crash on dotenv parse issues; warn and continue
    print(f"Warning: failed to load .env from {env_path}: {e}")

from summarizer import extract_text_from_pdf, summarize_text

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = os.getenv("UPLOAD_FOLDER", "uploads")
app.secret_key = os.getenv("SECRET_KEY")
# Ensure the upload folder exists regardless of how the app is started
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

ALLOWED_EXTENSIONS = {"pdf"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/process-local", methods=["GET"])
def process_local_file():
    """Process a file that already exists in the server uploads folder.
    Usage: /process-local?name=Sample%20A.pdf
    """
    name = request.args.get("name")
    if not name:
        return jsonify({"error": "Missing 'name' query parameter"}), 400

    if not allowed_file(name):
        return jsonify({"error": "Invalid file type"}), 400

    file_path = os.path.join(app.config["UPLOAD_FOLDER"], name)
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found on server"}), 404

    text = extract_text_from_pdf(file_path)
    summary = summarize_text(text)
    return jsonify({"summary": summary})


@app.route("/summarize", methods=["POST"])
def summarize_text_route():
    """Summarize arbitrary text sent as JSON or form data.

    Accepts:
      - JSON: {"text": "..."}
      - form-urlencoded/form-data: text field named 'text'
    Returns JSON: {"summary": "..."}
    """
    # Debug/log the incoming request for troubleshooting
    app.logger.info("Request Content-Type: %s", request.content_type)
    app.logger.info("Request headers: %s", dict(request.headers))
    app.logger.info("Request.form keys: %s", list(request.form.keys()))

    # Prefer JSON body if provided
    text = None
    if request.is_json:
        try:
            data = request.get_json()
            text = data.get("text") if isinstance(data, dict) else None
        except Exception:
            text = None

    # Accept plain text body as well
    if not text and request.mimetype == "text/plain":
        try:
            text = request.get_data(as_text=True)
        except Exception:
            text = None

    if text is None:
        # fallback to form data
        text = request.form.get("text")

    if not text and list(request.form.keys()) == [""]:
        # use the first (unnamed) value
        text = next(iter(request.form.values()), None)

    if not text:
        # Return debugging info to help determine why the text wasn't found
        raw_body = None
        try:
            raw_body = request.get_data(as_text=True)
            if raw_body and len(raw_body) > 2000:
                raw_body = raw_body[:2000] + "... (truncated)"
        except Exception:
            raw_body = "<unreadable>"

        return jsonify({
            "error": "Missing 'text' in request (JSON or form)",
            "content_type": request.content_type,
            "form_keys": list(request.form.keys()),
            "raw_body_preview": raw_body,
        }), 400

    summary = summarize_text(text)
    return jsonify({"summary": summary})

@app.route("/upload", methods=["POST"])
def upload_file():
    # (no debug logging in production)

    # Choose the uploaded file. Prefer the explicit 'file' key. If the client
    # mistakenly sent an unnamed file part (empty string key), accept that as a
    # fallback to be more forgiving during development.
    uploaded_file = None
    if "file" in request.files:
        uploaded_file = request.files["file"]
    elif "" in request.files:
        # client sent a file with an empty name (Postman sometimes leaves the
        # key blank). Use that as a fallback.
        uploaded_file = request.files[""]
    else:
        # Return debugging info to help identify what was actually sent
        return jsonify({
            "error": "No file part",
            "content_type": request.content_type,
            "files": list(request.files.keys()),
            "form": request.form.to_dict(),
        }), 400

    file = uploaded_file
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(file_path)

        # Process PDF
        text = extract_text_from_pdf(file_path)
        summary = summarize_text(text)

        return jsonify({"summary": summary})

    return jsonify({"error": "Invalid file type"}), 400

# Note: OpenAI client and summary logic live in backend/summarizer.py

if __name__ == "__main__":
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    app.run(debug=True)
