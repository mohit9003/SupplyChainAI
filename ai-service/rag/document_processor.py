from pypdf import PdfReader


def extract_text_from_pdf(file_path: str) -> str:

    reader = PdfReader(
        file_path
    )

    pages = []

    for page in reader.pages:

        text = page.extract_text()

        if text:
            pages.append(text)

    return "\n".join(pages).strip()


def chunk_text(
    text: str,
    chunk_size: int = 1000,
    overlap: int = 200
):

    text = text.strip()

    if not text:
        return []

    chunks = []

    start = 0

    while start < len(text):

        end = start + chunk_size

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start += chunk_size - overlap

    return chunks