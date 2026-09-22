import ollama
import chromadb
from pathlib import Path


# =========================================================
# CHROMA CONFIGURATION
# =========================================================

CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "supplychain_documents"
EMBEDDING_MODEL = "nomic-embed-text"

client = chromadb.PersistentClient(path=CHROMA_PATH)

collection = client.get_or_create_collection(
    name=COLLECTION_NAME
)


# =========================================================
# EMBEDDINGS
# =========================================================

def create_embedding(text: str):
    response = ollama.embeddings(
        model=EMBEDDING_MODEL,
        prompt=text
    )

    return response["embedding"]


# =========================================================
# ADD DOCUMENT CHUNKS
# =========================================================

def add_document_chunks(
    chunks,
    filename: str,
    document_id: str
):
    if not chunks:
        return

    ids = []
    embeddings = []
    documents = []
    metadatas = []

    for index, chunk in enumerate(chunks):
        ids.append(f"{document_id}_{index}")
        documents.append(chunk)

        embeddings.append(
            create_embedding(chunk)
        )

        metadatas.append({
            "document_id": document_id,
            "filename": filename,
            "chunk_index": index
        })

    collection.upsert(
        ids=ids,
        embeddings=embeddings,
        documents=documents,
        metadatas=metadatas
    )


# =========================================================
# SEARCH DOCUMENTS
# =========================================================

def search_documents(
    query: str,
    document_id: str | None = None,
    top_k: int = 5
):
    query_embedding = create_embedding(query)

    search_kwargs = {
        "query_embeddings": [query_embedding],
        "n_results": top_k
    }

    if document_id:
        search_kwargs["where"] = {
            "document_id": document_id
        }

    results = collection.query(**search_kwargs)

    output = []

    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    for index, document in enumerate(documents):
        output.append({
            "text": document,
            "metadata": (
                metadatas[index]
                if index < len(metadatas)
                else {}
            ),
            "distance": (
                distances[index]
                if index < len(distances)
                else None
            )
        })

    return output


# =========================================================
# LIST DOCUMENTS
# =========================================================

def get_all_documents():
    results = collection.get(
        include=["metadatas"]
    )

    metadatas = results.get("metadatas", [])

    documents = {}

    for metadata in metadatas:
        if not metadata:
            continue

        document_id = metadata.get("document_id")

        if not document_id:
            continue

        if document_id not in documents:
            documents[document_id] = {
                "document_id": document_id,
                "filename": metadata.get(
                    "filename",
                    "Unknown document"
                ),
                "chunks": 0
            }

        documents[document_id]["chunks"] += 1

    return list(documents.values())


# =========================================================
# DELETE DOCUMENT
# =========================================================

def delete_document(document_id: str):
    collection.delete(
        where={
            "document_id": document_id
        }
    )
