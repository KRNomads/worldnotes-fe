"use client"

import { useEffect, useState } from "react"
import { useBlockStore } from "@/store/blockStore"
import { useNoteStore } from "@/store/noteStore"
import type { BlockCreateRequest } from "@/types/block"
import BlockComponent from "./block-component"
import AddBlockMenu from "./add-block-menu"
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner"
import styles from "../characters.module.scss"

interface CharacterEditorProps {
  noteId: string
  projectId: string
}

export default function CharacterEditor({ noteId, projectId }: CharacterEditorProps) {
  const { fetchBlocksByNote, getBlocksForNote, isLoading, error, createBlock } = useBlockStore()
  const { notes } = useNoteStore()
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [addMenuPosition, setAddMenuPosition] = useState<number | null>(null)

  const currentNote = notes.find((note) => note.id === noteId)
  const blocks = getBlocksForNote(noteId)

  useEffect(() => {
    if (noteId) {
      fetchBlocksByNote(noteId)
    }
  }, [noteId, fetchBlocksByNote])

  const handleAddBlock = async (type: "TEXT" | "TAGS" | "IMAGE", position?: number) => {
    if (!noteId) return

    let newPosition = blocks.length
    if (position !== undefined) {
      newPosition = position
    }

    let blockData: BlockCreateRequest

    switch (type) {
      case "TEXT":
        blockData = {
          noteId,
          title: "",
          type: "TEXT",
          properties: {
            type: "TEXT",
            value: "",
          },
        }
        break
      case "TAGS":
        blockData = {
          noteId,
          title: "태그",
          type: "TAGS",
          properties: {
            type: "TAGS",
            tags: [],
          },
        }
        break
      case "IMAGE":
        blockData = {
          noteId,
          title: "이미지",
          type: "IMAGE",
          properties: {
            type: "IMAGE",
            url: "",
            caption: "",
          },
        }
        break
      default:
        return
    }

    await createBlock(blockData)
    setShowAddMenu(false)
  }

  const handleShowAddMenu = (position: number) => {
    setAddMenuPosition(position)
    setShowAddMenu(true)
  }

  // 기본 블록 추가 (처음 캐릭터 생성 시)
  useEffect(() => {
    const addDefaultBlocks = async () => {
      if (noteId && blocks.length === 0 && !isLoading) {
        // 기본 블록 추가
        await createBlock({
          noteId,
          title: "캐릭터 이름",
          type: "TEXT",
          properties: {
            type: "TEXT",
            value: "",
          },
        })

        await createBlock({
          noteId,
          title: "캐릭터 설명",
          type: "TEXT",
          properties: {
            type: "TEXT",
            value: "",
          },
        })

        await createBlock({
          noteId,
          title: "특성",
          type: "TAGS",
          properties: {
            type: "TAGS",
            tags: [],
          },
        })
      }
    }

    addDefaultBlocks()
  }, [noteId, blocks.length, isLoading, createBlock])

  if (isLoading && blocks.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
        <p>블록을 불러오는 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>오류가 발생했습니다: {error}</p>
        <button className={styles.retryButton} onClick={() => fetchBlocksByNote(noteId)}>
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <div className={styles.editorWrapper}>
      <div className={styles.editorHeader}>
        <h1 className={styles.characterTitle}>{currentNote?.title || "캐릭터"}</h1>
      </div>

      <div className={styles.blocksContainer}>
        {blocks.map((block, index) => (
          <div key={block.blockId} className={styles.blockWrapper}>
            <BlockComponent block={block} noteId={noteId} />
            <button
              className={styles.addBlockButton}
              onClick={() => handleShowAddMenu(index + 1)}
              aria-label="블록 추가"
            >
              +
            </button>
          </div>
        ))}

        {blocks.length === 0 && (
          <div className={styles.emptyBlocksMessage}>
            <p>블록이 없습니다. 블록을 추가해보세요.</p>
            <button className={styles.addFirstBlockButton} onClick={() => handleAddBlock("TEXT")}>
              텍스트 블록 추가
            </button>
          </div>
        )}
      </div>

      {showAddMenu && (
        <AddBlockMenu
          onAddBlock={(type) => {
            handleAddBlock(type, addMenuPosition || undefined)
          }}
          onClose={() => setShowAddMenu(false)}
        />
      )}
    </div>
  )
}
