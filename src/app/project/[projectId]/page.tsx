// src/app/project/[projectId]/page.tsx
"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useNoteStore } from "@/entities/note/store/noteStore";
import { useProjectStore } from "@/entities/project/store/projectStore";
import LoadingSpinner from "@/shared/ui/LoadingSpinner/LoadingSpinner";

export default function ProjectPage() {
  const router = useRouter();
  const { projectId } = useParams();
  const { setCurrentProject, fetchProject } = useProjectStore();

  // fetchNotesByProject를 사용합니다.
  // 이 함수는 이제 notes 배열뿐만 아니라, activeProjectBasicInfoNote,
  // activeProjectCharacterNotes, activeProjectDetailsNotes와 같은
  // 전용 상태들도 해당 projectId에 맞게 함께 채워줍니다.
  // isLoading과 error는 스토어의 범용 상태를 사용하며,
  // fetchNotesByProject 작업의 상태를 반영합니다.
  const { fetchNotesByProject, isLoading, error } = useNoteStore();

  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId as string);

      // 1. 프로젝트 기본 정보 가져오기
      fetchProject(projectId as string);

      // 2. 프로젝트의 모든 노트 정보 가져오기
      // 이 과정에서 notes 배열 및 모든 activeProject... 전용 상태들이 채워집니다.
      fetchNotesByProject(projectId as string)
        .then(() => {
          // 모든 데이터 로드 작업이 시작되었거나 완료된 후 basicinfo 페이지로 리다이렉트
          // fetchNotesByProject가 비동기이므로, 실제 데이터가 채워지는 것은
          // 스토어 내부의 set 함수 호출 이후입니다.
          // then 블록은 API 호출이 성공적으로 완료되었음을 의미합니다.
          router.push(`/project/${projectId}/basicinfo`);
        })
        .catch((err) => {
          // fetchNotesByProject는 내부적으로 error 상태를 설정합니다.
          // 여기서는 추가적인 콘솔 로깅 정도만 필요할 수 있습니다.
          // UI에 표시되는 에러 메시지는 스토어의 error 상태를 통해 반영됩니다.
          console.error("프로젝트 노트 전체 로드 실패 (ProjectPage):", err);
          // setPageError를 호출할 필요 없이 스토어의 error 상태가 사용됩니다.
        });
    }
  }, [projectId, fetchProject, fetchNotesByProject, router]);

  // 리다이렉트 전 로딩 화면 표시 (스토어의 isLoading, error 상태 사용)
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
      {isLoading ? ( // 스토어의 범용 isLoading 상태 사용
        <>
          <LoadingSpinner />
          <p>프로젝트 데이터를 불러오는 중...</p>
        </>
      ) : error ? ( // 스토어의 범용 error 상태 사용
        <div>
          <p>오류가 발생했습니다: {error}</p>
          <button
            onClick={() => {
              // 재시도 로직: fetchNotesByProject를 다시 호출
              if (projectId) {
                fetchNotesByProject(projectId as string)
                  .then(() => {
                    // 성공 시 다시 리다이렉트 시도
                    router.push(`/project/${projectId}/basicinfo`);
                  })
                  .catch((err) => {
                    // 실패 시 에러는 스토어에 이미 설정됨
                    console.error(
                      "프로젝트 노트 재시도 실패 (ProjectPage):",
                      err
                    );
                  });
              }
            }}
          >
            다시 시도
          </button>
        </div>
      ) : (
        <p>기본 정보 페이지로 이동 중...</p>
      )}
    </div>
  );
}
