import os
from typing import Any, Dict, List, Optional

import chromadb
import requests
from dotenv import load_dotenv

load_dotenv()


class RAGService:
    def __init__(self):
        """初始化 ChromaDB 客户端。"""
        self.client = chromadb.PersistentClient(path="./chroma_db")
        self.api_key = os.getenv("ZHIPU_API_KEY")
        self.base_url = "https://open.bigmodel.cn/api/paas/v4"

    def _get_public_collection(self):
        return self.client.get_or_create_collection(
            name="knowledge_public",
            metadata={"hnsw:space": "cosine"}
        )

    def _get_user_collection(self, user_id: int):
        return self.client.get_or_create_collection(
            name=f"knowledge_user_{user_id}",
            metadata={"hnsw:space": "cosine"}
        )

    def index_document(
        self,
        document_id: int,
        text: str,
        title: str,
        source_name: Optional[str] = None,
        user_id: Optional[int] = None,
        is_system: bool = False,
    ) -> Dict[str, int]:
        """为单篇文档建立向量索引。"""
        collection = self._get_user_collection(user_id) if user_id is not None else self._get_public_collection()
        chunks = self._split_text(text, chunk_size=800)

        if not chunks:
            return {"total_chunks": 0}

        embeddings = self._get_embeddings(chunks)
        document_key = str(document_id)
        ids = [f"doc_{document_key}_chunk_{i}" for i in range(len(chunks))]
        metadatas = [
            {
                "document_id": document_key,
                "title": title,
                "source": source_name or title,
                "chunk_id": i,
                "scope": "system" if is_system else ("user" if user_id is not None else "public"),
            }
            for i in range(len(chunks))
        ]

        collection.add(
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )
        return {"total_chunks": len(chunks)}

    def delete_document(self, document_id: int, user_id: Optional[int] = None):
        """从向量库删除文档。"""
        collection = self._get_user_collection(user_id) if user_id is not None else self._get_public_collection()
        collection.delete(where={"document_id": str(document_id)})

    def search(self, query: str, top_k: int = 3, user_id: Optional[int] = None) -> Dict[str, List[Any]]:
        """检索公共知识库和当前用户私有知识库。"""
        query_embedding = self._get_embeddings([query])[0]
        hits: List[Dict[str, Any]] = []

        def collect(collection) -> None:
            count = collection.count()
            if count <= 0:
                return

            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=min(top_k, count),
                include=["documents", "metadatas", "distances"]
            )

            documents = results.get("documents", [[]])[0]
            metadatas = results.get("metadatas", [[]])[0]
            distances = results.get("distances", [[]])[0]

            for document, metadata, distance in zip(documents, metadatas, distances):
                hits.append({
                    "document": document,
                    "metadata": metadata,
                    "distance": distance
                })

        collect(self._get_public_collection())
        if user_id is not None:
            collect(self._get_user_collection(user_id))

        hits.sort(key=lambda item: item["distance"])
        selected = hits[:top_k]
        return {
            "documents": [item["document"] for item in selected],
            "metadatas": [item["metadata"] for item in selected],
        }

    def get_stats(self, public_documents: int, public_chunks: int, user_documents: int = 0, user_chunks: int = 0) -> Dict[str, Any]:
        """统一返回知识库统计。"""
        return {
            "total_documents": public_documents + user_documents,
            "public_documents": public_documents,
            "public_chunks": public_chunks,
            "user_documents": user_documents,
            "user_chunks": user_chunks,
            "collection_name": "knowledge_public + knowledge_user"
        }

    def _split_text(self, text: str, chunk_size: int = 800) -> List[str]:
        """按段落分块。"""
        paragraphs = text.split('\n\n')
        chunks: List[str] = []
        current_chunk = ""

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            if len(current_chunk) + len(para) + 2 < chunk_size:
                current_chunk += para + "\n\n"
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = para + "\n\n"

        if current_chunk:
            chunks.append(current_chunk.strip())

        return chunks

    def _get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """调用智谱 Embedding API。"""
        embeddings = []

        for text in texts:
            try:
                response = requests.post(
                    f"{self.base_url}/embeddings",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "embedding-2",
                        "input": text
                    },
                    timeout=30
                )

                if response.status_code == 200:
                    data = response.json()
                    embeddings.append(data["data"][0]["embedding"])
                else:
                    raise Exception(f"Embedding API 调用失败 (状态码 {response.status_code}): {response.text}")
            except requests.exceptions.RequestException as exc:
                raise Exception(f"网络请求失败: {str(exc)}")

        return embeddings


rag_service = RAGService()
