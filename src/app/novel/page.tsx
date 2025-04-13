// src/app/novel/page.tsx
"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function NovelPage() {
  const [projects, setProjects] = useState([]);
  const { user, logout } = useAuth();

  useEffect(() => {
    // 사용자 프로젝트 데이터 가져오기
    const fetchProjects = async () => {
      try {
        const response = await api.get("/api/projects");
        setProjects(response.data);
      } catch (error) {
        console.error("프로젝트 불러오기 실패:", error);
      }
    };

    fetchProjects();
  }, []);

  return (
    <ProtectedRoute>
      <div>
        <h1>환영합니다, {user?.name || "사용자"}님!</h1>
        <h2>내 소설 프로젝트</h2>

        {/* 프로젝트 목록 */}
        <div>
          {projects.length > 0 ? (
            projects.map((project) => (
              <div key={project.id}>
                <h3>{project.name}</h3>
                <p>마지막 수정: {project.updatedAt}</p>
              </div>
            ))
          ) : (
            <p>프로젝트가 없습니다. 새 프로젝트를 생성해보세요!</p>
          )}
        </div>

        {/* 로그아웃 버튼 */}
        <button onClick={logout}>로그아웃</button>
      </div>
    </ProtectedRoute>
  );
}
