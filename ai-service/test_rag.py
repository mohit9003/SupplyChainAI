from rag.document_processor import (
    extract_text_from_pdf,
    chunk_text
)

from rag.vector_store import (
    add_document_chunks,
    search_documents
)


PDF_FILE = "documents/test.pdf"


# =========================================================
# EXTRACT
# =========================================================

text = extract_text_from_pdf(
    PDF_FILE
)

print(
    "Extracted characters:",
    len(text)
)


# =========================================================
# CHUNK
# =========================================================

chunks = chunk_text(
    text
)

print(
    "Created chunks:",
    len(chunks)
)


# =========================================================
# STORE
# =========================================================

count = add_document_chunks(
    chunks,
    "test.pdf"
)

print(
    "Stored chunks:",
    count
)


# =========================================================
# SEARCH
# =========================================================

query = input(
    "\nAsk something about the document: "
)


results = search_documents(
    query
)


print("\nRelevant results:\n")


for result in results:

    print(
        "--------------------------------"
    )

    print(
        result["metadata"]
    )

    print(
        result["text"]
    )