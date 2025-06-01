import axios from "axios";
import type { NoteGroup, Entry } from "@/shared/types/noteGroup";

export const noteGroupApi = {
  // 그룹 목록 조회
  fetchGroups: (projectId: string) =>
    axios
      .get<NoteGroup[]>(`/api/v1/groups/project/${projectId}`)
      .then((res) => res.data),

  // 그룹 생성
  createGroup: (projectId: string, title: string, type: string) =>
    axios
      .post<NoteGroup>(`/api/v1/groups`, { projectId, title, type })
      .then((res) => res.data),

  // 그룹 삭제
  deleteGroup: (groupId: number) => axios.delete(`/api/v1/groups/${groupId}`),

  // 그룹 엔트리 조회
  fetchEntries: (groupId: number) =>
    axios
      .get<Entry[]>(`/api/v1/group-entries/group/${groupId}`)
      .then((res) => res.data),

  // 그룹에 엔트리 추가
  addEntry: (
    groupId: number,
    noteId: string,
    positionX: number,
    positionY: number
  ) =>
    axios
      .post<Entry>(`/api/v1/group-entries?groupId=${groupId}`, {
        noteId,
        positionX,
        positionY,
      })
      .then((res) => res.data),

  // 엔트리 위치 업데이트
  updateEntryPosition: (
    entryId: number,
    positionX: number,
    positionY: number
  ) =>
    axios
      .put<Entry>(`/api/v1/group-entries/${entryId}/position`, {
        positionX,
        positionY,
      })
      .then((res) => res.data),

  // 엔트리 삭제
  removeEntry: (entryId: number) =>
    axios.delete(`/api/v1/group-entries/${entryId}`),
};
