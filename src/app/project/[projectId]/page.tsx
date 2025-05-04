// src/app/project/[projectId]/page.tsx
"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useNoteStore } from "@/store/noteStore";
import { useProjectStore } from "@/store/projectStore";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";

export default function ProjectPage() {
  const router = useRouter();
  const { projectId } = useParams();
  const { fetchProject } = useProjectStore();
  const { fetchNotesByProject, isLoading, error } = useNoteStore();

  useEffect(() => {
    if (projectId) {
      // 프로젝트 정보 가져오기
      fetchProject(projectId as string);

      // 프로젝트의 모든 노트 데이터 가져오기
      fetchNotesByProject(projectId as string)
        .then(() => {
          // 노트 데이터 로드 완료 후 basicinfo 페이지로 리다이렉트
          router.push(`/project/${projectId}/basicinfo`);
        })
        .catch((error) => {
          console.error("노트 데이터 로드 실패:", error);
        });
    }
  }, [projectId, fetchProject, fetchNotesByProject, router]);

  // 리다이렉트 전 로딩 화면 표시
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      {isLoading ? (
        <>
          <LoadingSpinner />
          <p>프로젝트 데이터를 불러오는 중...</p>
        </>
      ) : error ? (
        <div>
          <p>오류가 발생했습니다: {error}</p>
          <button onClick={() => fetchNotesByProject(projectId as string)}>
            다시 시도
          </button>
        </div>
      ) : (
        <p>기본 정보 페이지로 이동 중...</p>
      )}
    </div>
  );
}
