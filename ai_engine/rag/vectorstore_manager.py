from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

DATA_DIR = Path("data")
VECTOR_DB_DIR = Path("vector_db")


def get_embedding_model():
    return HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")


def get_vectorstore(school_id: int):
    vector_path = VECTOR_DB_DIR / str(school_id)
    embedding_model = get_embedding_model()

    if vector_path.exists():
        return FAISS.load_local(
            str(vector_path),
            embedding_model,
            allow_dangerous_deserialization=True
        )

    # build from PDFs in data/{school_id}/
    pdf_dir = DATA_DIR / str(school_id)
    if not pdf_dir.exists() or not list(pdf_dir.glob("*.pdf")):
        return None

    documents = []
    for pdf_path in pdf_dir.glob("*.pdf"):
        loader = PyPDFLoader(str(pdf_path))
        documents.extend(loader.load())

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.split_documents(documents)

    vectorstore = FAISS.from_documents(chunks, embedding_model)
    vector_path.mkdir(parents=True, exist_ok=True)
    vectorstore.save_local(str(vector_path))

    return vectorstore
