// src/app/dashboard/page.tsx
"use client";

import React, { useEffect } from "react"; // useEffect 임포트
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./dashboard.module.scss";
// Project 타입 임포트 (경로 확인 필요)
import Sidebar from "../../components/sidebar/sidebar"; // Sidebar 컴포넌트 임포트 (경로 확인 필요)

// Project 타입 정의 (만약 @/types/project 파일이 없다면 임시로 여기에 정의)
// 실제로는 @/types/project.ts 와 같은 파일에서 관리하는 것이 좋습니다.
interface Project {
  id: string;
  title: string;
  lastModified: string;
}

export default function Dashboard() {
  const router = useRouter();

  // 예시 프로젝트 데이터
  const recentProjects: Project[] = [
    {
      id: "1",
      title: "새 작품",
      lastModified: "6시간 전",
    },
    {
      id: "2",
      title: "새 작품",
      lastModified: "10일 전",
    },
  ];

  // 컴포넌트 마운트 시 사용자 데이터 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      // .env 파일에서 백엔드 URL 가져오기
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      // 백엔드 URL 환경 변수가 설정되었는지 확인
      if (!backendUrl) {
        console.error(
          "오류: NEXT_PUBLIC_BACKEND_URL 환경 변수가 설정되지 않았습니다."
        );
        // 환경 변수가 없으면 API 호출을 시도하지 않음
        return;
      }

      // API 엔드포인트 전체 URL 생성
      const apiUrl = `${backendUrl}/api/v1/auth/me`;

      try {
        console.log(`API 요청 시작: ${apiUrl}`);
        // 생성된 전체 URL로 GET 요청 보내기
        // 쿠키 기반 인증 사용 시 withCredentials: true 추가
        const response = await axios.get(apiUrl, {
          withCredentials: true,
        });

        console.log("API 응답 데이터:", response.data);
        // 필요하다면 전체 응답 객체도 로깅
        console.log("API 전체 응답:", response);

        // --- 여기서 응답 데이터를 상태에 저장하거나 활용할 수 있습니다 ---
        // 예: Zustand 스토어 업데이트
        // const { setUser } = useAuthStore.getState();
        // setUser(response.data);
      } catch (error) {
        console.error(`API 요청 실패: ${apiUrl}`, error);
        // Axios 에러인 경우 더 자세한 정보 로깅
        if (axios.isAxiosError(error)) {
          console.error("에러 응답 상태:", error.response?.status);
          console.error("에러 응답 데이터:", error.response?.data);
        }
      }
    };

    // 정의된 비동기 함수 호출
    fetchUserData();
  }, []); // 빈 의존성 배열: 컴포넌트 마운트 시 1회만 실행

  // 새 프로젝트 생성 핸들러
  const handleNewProject = () => {
    console.log("새 작품 만들기 버튼 클릭");
    // 새 프로젝트 생성을 위한 페이지 또는 API 호출 로직 구현 필요
    router.push("/project/basicinfo"); // 예시: 기본 정보 페이지로 이동
  };

  // 기존 프로젝트 클릭 핸들러
  const handleProjectClick = (projectId: string) => {
    console.log(`프로젝트 클릭: ${projectId}`);
    // 클릭된 프로젝트 ID를 사용하여 해당 프로젝트 상세 페이지로 이동
    // 예시: router.push(`/project/${projectId}/some-detail`);
    router.push(`/project/basicinfo`); // 현재는 projectId와 상관없이 이동
  };

  return (
    <div className={styles.container}>
      {/* 사이드바 컴포넌트 */}
      <Sidebar activeItem="home" isProjectSidebar={false} />

      {/* 메인 콘텐츠 영역 */}
      <div className={styles.mainArea}>
        {/* 헤더 */}
        <div className={styles.header}>
          <h1 className={styles.welcomeMessage}>
            WorldNote에 오신 걸 환영합니다.
          </h1>
          <button
            className={styles.newProjectButton}
            onClick={handleNewProject}
          >
            + 새 작품
          </button>
        </div>

        {/* 최근 작품 섹션 */}
        <h2 className={styles.sectionTitle}>최근 작품</h2>

        {/* 프로젝트 카드 목록 */}
        <div className={styles.projectsContainer}>
          {recentProjects.length === 0 ? (
            <p>최근 작업한 작품이 없습니다.</p> // 프로젝트가 없을 경우 메시지 표시
          ) : (
            recentProjects.map((project) => (
              <div
                key={project.id}
                className={styles.projectCard}
                onClick={() => handleProjectClick(project.id)} // 클릭 시 핸들러 호출
                role="button" // 시맨틱하게 버튼 역할임을 명시
                tabIndex={0} // 키보드 접근성 위해 추가
                onKeyDown={(e) => {
                  // Enter 키로도 클릭 가능하게
                  if (e.key === "Enter" || e.key === " ") {
                    handleProjectClick(project.id);
                  }
                }}
              >
                <h3 className={styles.projectTitle}>{project.title}</h3>
                <p className={styles.lastModified}>
                  {project.lastModified} 수정
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
