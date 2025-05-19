// src/app/project/[projectId]/characters/page.tsx
"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useParams } from "next/navigation";
import styles from "./characters.module.scss";
import Sidebar from "@/components/sidebar/sidebar";
import { useProjectStore } from "@/store/projectStore";
import { useNoteStore } from "@/store/noteStore";
import type { Note } from "@/types/note";
import { useBlockStore } from "@/store/blockStore";
import type {
  Block,
  TextBlockProperties,
  ImageBlockProperties,
  BlockCreateRequest,
  BlockUpdateRequest,
} from "@/types/block";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";
import axios from "axios";

const EMPTY_ARRAY: Block[] = [];

interface DisplayProfileItem {
  blockId: number;
  fieldKey: string;
  label: string;
  value: string;
}

interface CharacterDetails {
  noteId: string;
  name: string;
  description: string;
  imageUrl?: string;
  imageCaption?: string;
  profileItems: DisplayProfileItem[];
  descriptionBlockId?: number;
  imageBlockId?: number;
}

const CHARACTER_NOTE_TYPE = "CHARACTER";
const CHARACTER_DESCRIPTION_FIELD_KEY = "character_description";
const CHARACTER_IMAGE_FIELD_KEY = "character_image";
const PROFILE_ITEM_FIELD_KEY_PREFIX = "profile_";

function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  );
  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    []
  );
  return debouncedCallback;
}

export default function CharactersPage() {
  const params = useParams();
  const currentProjectId = Array.isArray(params.projectId)
    ? params.projectId[0]
    : params.projectId;

  const {
    currentProject,
    fetchProject,
    error: projectError,
  } = useProjectStore();
  const {
    activeProjectCharacterNotes,
    ensureActiveProjectCharacterNotes,
    createNote: createCharacterNoteInStore,
    deleteNote: deleteCharacterNoteInStore,
    updateNote: updateCharacterNoteInStore,
    isLoading: isLoadingNotes,
    error: errorNotes,
  } = useNoteStore();
  const {
    fetchBlocksByNote,
    createBlock,
    updateBlock,
    deleteBlock: deleteCharacterBlock,
    isLoading: isLoadingBlocks,
    error: errorBlocks,
  } = useBlockStore();

  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(
    null
  );
  const [characterDetails, setCharacterDetails] =
    useState<CharacterDetails | null>(null);
  const [editingProfileItem, setEditingProfileItem] = useState<{
    blockId: number;
    value: string;
  } | null>(null);
  const [editingDescription, setEditingDescription] = useState<string | null>(
    null
  );
  const [editingName, setEditingName] = useState<string | null>(null);
  const [isCreatingCharacter, setIsCreatingCharacter] = useState(false); // 유저의 명시적 생성과 구분하기 위해 다른 이름 사용 가능
  const [isAutoCreatingDefaultCharacter, setIsAutoCreatingDefaultCharacter] =
    useState(false); // 자동 생성 중 플래그
  const [isDeletingCharacter, setIsDeletingCharacter] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    if (currentProjectId) {
      fetchProject(currentProjectId);
    }
  }, [currentProjectId, fetchProject]);

  useEffect(() => {
    if (currentProjectId) {
      setIsPageLoading(true);
      ensureActiveProjectCharacterNotes(currentProjectId);
    }
  }, [currentProjectId, ensureActiveProjectCharacterNotes]);

  // 캐릭터 목록 로드 완료 또는 변경 시 처리: 기본 캐릭터 생성 및 선택 로직
  useEffect(() => {
    if (isLoadingNotes === false && currentProjectId) {
      // 노트 목록 로딩이 완료되었고 projectId가 있을 때
      if (
        activeProjectCharacterNotes.length === 0 &&
        !isAutoCreatingDefaultCharacter &&
        !isCreatingCharacter
      ) {
        // 캐릭터가 하나도 없고, 자동 생성 중도 아니고, 유저가 생성 중도 아닐 때 기본 캐릭터 자동 생성
        setIsAutoCreatingDefaultCharacter(true);
        console.log(
          "[CharactersPage] 캐릭터 목록이 비어 있어 기본 캐릭터 생성을 시도합니다."
        );
        createCharacterNoteInStore({
          projectId: currentProjectId,
          title: "새 캐릭터", // 기본 캐릭터 이름
          type: CHARACTER_NOTE_TYPE,
        })
          .then(async (newNote) => {
            if (newNote && newNote.id) {
              console.log(
                "[CharactersPage] 기본 캐릭터 노트 생성 성공:",
                newNote
              );
              if (createBlock) {
                // 기본 설명 블록도 함께 생성
                try {
                  await createBlock({
                    noteId: newNote.id,
                    title: "캐릭터 설명",
                    fieldKey: CHARACTER_DESCRIPTION_FIELD_KEY,
                    type: "TEXT",
                    properties: {
                      type: "TEXT",
                      value: "",
                    } as TextBlockProperties,
                  });
                  console.log(
                    "[CharactersPage] 기본 캐릭터 설명 블록 생성 성공"
                  );
                } catch (blockError) {
                  console.error(
                    "[CharactersPage] 기본 캐릭터 설명 블록 생성 실패:",
                    blockError
                  );
                }
              }
              // 생성 후 목록을 다시 가져와서(ensure가 해줌) 아래 로직에서 선택하도록 유도
              // 또는, 여기서 바로 setSelectedCharacterId(newNote.id); 를 호출할 수도 있으나,
              // 목록이 업데이트 된 후 첫번째 것을 선택하는 로직과 일관성을 위해 ensure 호출
            } else {
              console.warn(
                "[CharactersPage] 기본 캐릭터 노트가 생성되었으나 ID가 없습니다."
              );
            }
          })
          .catch((error) => {
            console.error("[CharactersPage] 기본 캐릭터 생성 중 오류:", error);
          })
          .finally(() => {
            setIsAutoCreatingDefaultCharacter(false);
            // 생성(또는 실패) 후 캐릭터 목록을 확실히 다시 가져오도록 함
            ensureActiveProjectCharacterNotes(currentProjectId);
          });
      } else if (activeProjectCharacterNotes.length > 0) {
        // 캐릭터 목록이 있을 때: 현재 선택이 유효하거나, 없으면 첫번째 캐릭터 선택
        const currentSelectionValid = activeProjectCharacterNotes.some(
          (c) => c.id === selectedCharacterId
        );
        if (!selectedCharacterId || !currentSelectionValid) {
          setSelectedCharacterId(activeProjectCharacterNotes[0].id);
        }
      } else if (
        activeProjectCharacterNotes.length === 0 &&
        !isAutoCreatingDefaultCharacter &&
        !isCreatingCharacter
      ) {
        // 캐릭터도 없고, 생성 시도 중도 아니면 선택 없음
        setSelectedCharacterId(null);
        setCharacterDetails(null);
      }
      setIsPageLoading(false); // 페이지 로딩 완료 (목록 처리 끝)
    }
  }, [
    activeProjectCharacterNotes,
    isLoadingNotes,
    currentProjectId,
    selectedCharacterId, // 현재 선택 확인용
    isAutoCreatingDefaultCharacter, // 자동 생성 중복 방지
    isCreatingCharacter, // 유저 생성 중복 방지
    createCharacterNoteInStore,
    createBlock,
    ensureActiveProjectCharacterNotes,
  ]);

  useEffect(() => {
    if (selectedCharacterId) {
      setCharacterDetails(null);
      fetchBlocksByNote(selectedCharacterId);
    } else if (!selectedCharacterId && characterDetails !== null) {
      // 선택된 캐릭터가 없어지면 상세 정보도 초기화
      setCharacterDetails(null);
    }
  }, [selectedCharacterId, fetchBlocksByNote]); // characterDetails를 의존성에서 제거하여 루프 방지

  const selectedCharacterNote = useMemo(() => {
    if (!selectedCharacterId) return null;
    return (
      activeProjectCharacterNotes.find(
        (note) => note.id === selectedCharacterId
      ) || null
    );
  }, [selectedCharacterId, activeProjectCharacterNotes]);

  const currentCharacterBlocks = useBlockStore((state) =>
    selectedCharacterId
      ? state.blocksByNoteId[selectedCharacterId] || EMPTY_ARRAY
      : EMPTY_ARRAY
  );

  useEffect(() => {
    if (selectedCharacterNote && currentCharacterBlocks) {
      // currentCharacterBlocks가 로드된 후 파싱
      const name = selectedCharacterNote.title || "이름 없음";
      let description = "";
      let descriptionBlockId: number | undefined;
      let imageUrl: string | undefined;
      let imageCaption: string | undefined;
      let imageBlockId: number | undefined;
      const profileItems: DisplayProfileItem[] = [];

      currentCharacterBlocks.forEach((block: Block) => {
        if (
          block.fieldKey === CHARACTER_DESCRIPTION_FIELD_KEY &&
          block.type === "TEXT"
        ) {
          description = (block.properties as TextBlockProperties)?.value || "";
          descriptionBlockId = block.blockId;
        } else if (
          block.fieldKey === CHARACTER_IMAGE_FIELD_KEY &&
          block.type === "IMAGE"
        ) {
          imageUrl = (block.properties as ImageBlockProperties)?.url;
          imageCaption = (block.properties as ImageBlockProperties)?.caption;
          imageBlockId = block.blockId;
        } else if (
          block.fieldKey?.startsWith(PROFILE_ITEM_FIELD_KEY_PREFIX) &&
          block.type === "TEXT"
        ) {
          profileItems.push({
            blockId: block.blockId,
            fieldKey: block.fieldKey,
            label: block.fieldKey
              .substring(PROFILE_ITEM_FIELD_KEY_PREFIX.length)
              .replace(/_/g, " "),
            value: (block.properties as TextBlockProperties)?.value || "",
          });
        }
      });
      profileItems.sort((a, b) => a.label.localeCompare(b.label));
      setCharacterDetails({
        noteId: selectedCharacterNote.id,
        name,
        description,
        imageUrl,
        imageCaption,
        profileItems,
        descriptionBlockId,
        imageBlockId,
      });
      setEditingName(name);
      setEditingDescription(description);
    } else if (!selectedCharacterNote && selectedCharacterId) {
      // 선택된 ID는 있으나 노트 객체가 아직 없는 경우 (로드 중일 수 있음)
      // 또는 목록에서 삭제된 직후일 수 있음. characterDetails는 null로 유지하거나 로딩 상태 표시
      setCharacterDetails(null);
    }
  }, [selectedCharacterNote, currentCharacterBlocks, selectedCharacterId]);

  const handleCharacterNameSave = useCallback(
    async (newName: string) => {
      if (
        !selectedCharacterNote ||
        newName === selectedCharacterNote.title ||
        !updateCharacterNoteInStore
      )
        return;
      await updateCharacterNoteInStore(selectedCharacterNote.id, {
        title: newName,
      });
    },
    [selectedCharacterNote, updateCharacterNoteInStore]
  );
  const debouncedCharacterNameSave = useDebounce(handleCharacterNameSave, 1000);

  const handleCharacterDescriptionSave = useCallback(
    async (newDescription: string) => {
      if (!selectedCharacterId || !characterDetails) return;
      if (
        newDescription === characterDetails.description &&
        characterDetails.descriptionBlockId
      )
        return; // 변경 없으면 저장 안함 (블록 ID 있을때만)
      // 블록이 없는데 빈 설명을 저장하려 할 때는 생성 로직으로 가야함
      const descBlockId = characterDetails.descriptionBlockId;
      const payload: BlockUpdateRequest = {
        properties: {
          type: "TEXT",
          value: newDescription,
        } as TextBlockProperties,
      };

      if (descBlockId) {
        await updateBlock(descBlockId, selectedCharacterId, payload);
      } else {
        // 설명 블록이 없으면 새로 생성 (캐릭터 생성 시 이미 만들어졌을 수도 있음)
        await createBlock({
          noteId: selectedCharacterId,
          title: "캐릭터 내부 설명",
          fieldKey: CHARACTER_DESCRIPTION_FIELD_KEY,
          type: "TEXT",
          properties: {
            type: "TEXT",
            value: newDescription,
          } as TextBlockProperties,
        });
        fetchBlocksByNote(selectedCharacterId); // 생성 후 블록 목록 갱신
      }
    },
    [
      selectedCharacterId,
      characterDetails,
      updateBlock,
      createBlock,
      fetchBlocksByNote,
    ]
  );
  const debouncedCharacterDescriptionSave = useDebounce(
    handleCharacterDescriptionSave,
    1000
  );

  const handleProfileItemValueSave = useCallback(
    async (blockId: number, newProfileValue: string) => {
      if (!selectedCharacterId || !characterDetails) return;
      const targetItem = characterDetails.profileItems.find(
        (item) => item.blockId === blockId
      );
      if (!targetItem || newProfileValue === targetItem.value) return;

      const payload: BlockUpdateRequest = {
        properties: {
          type: "TEXT",
          value: newProfileValue,
        } as TextBlockProperties,
      };
      await updateBlock(blockId, selectedCharacterId, payload);
    },
    [selectedCharacterId, characterDetails, updateBlock]
  );
  const debouncedProfileItemValueSave = useDebounce(
    handleProfileItemValueSave,
    1000
  );

  const handleAddCharacter = async () => {
    if (
      !currentProjectId ||
      isCreatingCharacter ||
      isAutoCreatingDefaultCharacter ||
      !createCharacterNoteInStore
    )
      return;
    setIsCreatingCharacter(true);
    const newCharacterName = prompt(
      "새 캐릭터의 이름을 입력하세요:",
      "새 캐릭터"
    );
    if (newCharacterName) {
      try {
        const newNote = await createCharacterNoteInStore({
          projectId: currentProjectId,
          title: newCharacterName,
          type: CHARACTER_NOTE_TYPE,
        });
        if (newNote) {
          setSelectedCharacterId(newNote.id);
          if (createBlock) {
            await createBlock({
              noteId: newNote.id,
              title: "캐릭터 내부 설명",
              fieldKey: CHARACTER_DESCRIPTION_FIELD_KEY,
              type: "TEXT",
              properties: { type: "TEXT", value: "" } as TextBlockProperties,
            });
            fetchBlocksByNote(newNote.id); // 새 캐릭터 블록 즉시 로드
          }
        }
      } catch (error) {
        console.error("캐릭터 생성 실패:", error);
        alert("캐릭터 생성에 실패했습니다.");
      } finally {
        setIsCreatingCharacter(false);
      }
    } else {
      setIsCreatingCharacter(false);
    }
  };

  const handleDeleteCharacter = async () => {
    if (
      !selectedCharacterId ||
      !characterDetails ||
      isDeletingCharacter ||
      !deleteCharacterNoteInStore
    )
      return;
    if (
      window.confirm(
        `'${characterDetails.name}' 캐릭터를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      setIsDeletingCharacter(true);
      try {
        const success = await deleteCharacterNoteInStore(selectedCharacterId);
        if (success) {
          // setSelectedCharacterId(null); // 이 부분은 목록 변경 감지 useEffect가 처리
          // setCharacterDetails(null);
          // ensureActiveProjectCharacterNotes(currentProjectId); // 스토어에서 목록 자동 업데이트 및 위 useEffect 트리거 기대
        } else {
          alert("캐릭터 삭제에 실패했습니다.");
        }
      } catch (error) {
        console.error("캐릭터 삭제 중 오류:", error);
        alert("캐릭터 삭제 중 오류가 발생했습니다.");
      } finally {
        setIsDeletingCharacter(false);
      }
    }
  };

  const addProfileItem = async () => {
    if (!selectedCharacterId || !createBlock) return;
    const newLabelCandidate = `항목${
      characterDetails?.profileItems.length || 0 + 1
    }`;
    const newLabel = prompt(
      "추가할 프로필 항목의 이름을 입력하세요 (예: 나이, 직업):",
      newLabelCandidate
    );
    if (newLabel && newLabel.trim() !== "") {
      const fieldKey = `${PROFILE_ITEM_FIELD_KEY_PREFIX}${newLabel
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")}`;
      if (
        characterDetails?.profileItems.some(
          (item) => item.fieldKey === fieldKey
        )
      ) {
        alert("이미 동일한 이름의 프로필 항목이 존재합니다.");
        return;
      }
      const newBlockData: BlockCreateRequest = {
        noteId: selectedCharacterId,
        title: newLabel,
        fieldKey: fieldKey,
        type: "TEXT",
        properties: { type: "TEXT", value: "" } as TextBlockProperties,
      };
      const newBlock = await createBlock(newBlockData);
      if (newBlock) {
        // fetchBlocksByNote(selectedCharacterId); // 블록 목록 다시 로드하여 UI 업데이트
        console.log("프로필 항목 블록 생성됨:", newBlock);
      } else {
        alert("프로필 항목 추가에 실패했습니다.");
      }
    }
  };

  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
  };

  const pageOverallError = projectError || errorNotes || errorBlocks;

  if (isPageLoading) {
    return (
      <div className={styles.centeredMessage}>
        <LoadingSpinner />
        <p>캐릭터 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (pageOverallError) {
    return (
      <div className={styles.centeredMessage}>
        <p>오류가 발생했습니다: {pageOverallError}</p>
        <button
          onClick={() =>
            currentProjectId &&
            ensureActiveProjectCharacterNotes(currentProjectId)
          }
          className={styles.retryButton}
        >
          캐릭터 목록 다시 불러오기
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Sidebar
        activeItem="characters"
        isProjectSidebar={true}
        projectId={currentProjectId}
      />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>
            {currentProject ? `${currentProject.title} : ` : ""}캐릭터 정보
          </h2>
          <button
            className={styles.addCharacterBtn}
            onClick={handleAddCharacter}
            disabled={isCreatingCharacter || isAutoCreatingDefaultCharacter}
          >
            {isCreatingCharacter || isAutoCreatingDefaultCharacter
              ? "생성 중..."
              : "+ 캐릭터 추가"}
          </button>
        </div>

        <div className={styles.contentContainer}>
          <div className={styles.charactersPanel}>
            <h3 className={styles.charactersPanelTitle}>캐릭터 목록</h3>
            <div className={styles.divider}></div>
            {isLoadingNotes && activeProjectCharacterNotes.length === 0 && (
              <div className={styles.centeredMessage}>
                <LoadingSpinner />
                <p>목록 로딩 중...</p>
              </div>
            )}
            {!isLoadingNotes &&
              activeProjectCharacterNotes.length === 0 &&
              !isAutoCreatingDefaultCharacter && ( // 자동 생성 중이 아닐 때만 "없음" 표시
                <p className={styles.noCharacters}>캐릭터가 없습니다.</p>
              )}
            <div className={styles.charactersList}>
              {activeProjectCharacterNotes.map((characterNote: Note) => (
                <div
                  key={characterNote.id}
                  className={`${styles.characterItem} ${
                    selectedCharacterId === characterNote.id
                      ? styles.characterItemActive
                      : ""
                  }`}
                  onClick={() => setSelectedCharacterId(characterNote.id)}
                >
                  <div className={styles.characterAvatar}></div>
                  <span className={styles.characterName}>
                    {characterNote.title || "이름 없음"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {selectedCharacterId &&
          characterDetails &&
          !(isLoadingBlocks && !currentCharacterBlocks.length) ? ( // 블록 첫 로딩 중이 아닐 때
            <div className={styles.characterInfoPanel}>
              <div className={styles.characterInfoHeader}>
                <input
                  type="text"
                  className={styles.characterInfoTitleInput}
                  value={editingName ?? characterDetails.name}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => {
                    if (
                      editingName !== null &&
                      editingName !== characterDetails.name
                    )
                      debouncedCharacterNameSave(editingName);
                    // setEditingName(null); // blur 시 바로 null로 하면, 클릭 등으로 포커스 잃을 때 입력값 사라짐. 저장 후 이름 동기화로 처리.
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      (e.target as HTMLInputElement).blur();
                  }} // 엔터 시 저장
                  placeholder="캐릭터 이름"
                  disabled={isDeletingCharacter}
                />
                <button
                  className={styles.deleteBtn}
                  onClick={handleDeleteCharacter}
                  disabled={isDeletingCharacter}
                >
                  {isDeletingCharacter ? "삭제 중..." : "캐릭터 삭제"}
                </button>
              </div>

              <div className={styles.characterInfoTop}>
                <div className={styles.characterImageArea}>
                  {characterDetails.imageUrl ? (
                    <Image
                      src={characterDetails.imageUrl}
                      alt={characterDetails.name || "캐릭터 이미지"}
                      width={150}
                      height={150}
                      className={styles.characterImage}
                      style={{ objectFit: "cover" }}
                      priority={false}
                    />
                  ) : (
                    <div className={styles.characterImagePlaceholderContainer}>
                      <span className={styles.characterImagePlaceholder}>
                        🖼️
                      </span>
                    </div>
                  )}
                </div>
                <div className={styles.characterDescArea}>
                  <h4 className={styles.characterDescTitle}>캐릭터 설명</h4>
                  <div className={styles.characterDescInputContainer}>
                    <textarea
                      className={styles.characterDescInput}
                      value={editingDescription ?? characterDetails.description}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      onBlur={() => {
                        if (
                          editingDescription !== null &&
                          editingDescription !== characterDetails.description
                        )
                          debouncedCharacterDescriptionSave(editingDescription);
                        // setEditingDescription(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey)
                          (e.target as HTMLTextAreaElement).blur();
                      }}
                      placeholder="캐릭터에 대한 설명을 입력하세요..."
                      onInput={handleTextareaInput}
                      rows={3}
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className={styles.characterProfile}>
                <h3 className={styles.profileTitle}>캐릭터 프로필</h3>
                <div className={styles.profileItems}>
                  {characterDetails.profileItems.map((item) => (
                    <div key={item.blockId} className={styles.profileRow}>
                      <div className={styles.profileLabel}>
                        <input
                          type="text"
                          className={styles.profileLabelInput}
                          value={item.label}
                          readOnly // 라벨은 fieldKey 기반으로, 현재 수정 기능 미구현
                        />
                      </div>
                      <div className={styles.profileInputContainer}>
                        <textarea
                          className={styles.profileInput}
                          value={
                            editingProfileItem?.blockId === item.blockId
                              ? editingProfileItem.value
                              : item.value
                          }
                          placeholder="내용을 입력하세요"
                          rows={1}
                          onChange={(e) =>
                            setEditingProfileItem({
                              blockId: item.blockId,
                              value: e.target.value,
                            })
                          }
                          onBlur={() => {
                            if (
                              editingProfileItem &&
                              editingProfileItem.blockId === item.blockId &&
                              editingProfileItem.value !== item.value
                            ) {
                              debouncedProfileItemValueSave(
                                editingProfileItem.blockId,
                                editingProfileItem.value
                              );
                            }
                            setEditingProfileItem(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey)
                              (e.target as HTMLTextAreaElement).blur();
                          }}
                          onInput={handleTextareaInput}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.addProfileBtnContainer}>
                  <button
                    className={styles.addProfileBtn}
                    onClick={addProfileItem}
                  >
                    프로필 항목 추가
                  </button>
                </div>
              </div>
            </div>
          ) : selectedCharacterId && (isLoadingBlocks || !characterDetails) ? (
            <div className={styles.centeredMessage}>
              <LoadingSpinner />
              <p>캐릭터 상세 정보를 불러오는 중...</p>
            </div>
          ) : (
            <div className={styles.characterInfoPanelPlaceholder}>
              <p>왼쪽 목록에서 캐릭터를 선택하거나, 새 캐릭터를 추가하세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
