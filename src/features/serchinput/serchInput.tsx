"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import Fuse, { type IFuseOptions } from "fuse.js";
import styles from "./serchInput.module.scss";

interface SearchInputProps<T> {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  className?: string;
  disabled?: boolean;

  // Fuse.js 관련 props
  data: T[]; // 검색 대상이 될 전체 원본 데이터 배열
  fuseOptions: IFuseOptions<T>; // Fuse.js 검색 옵션 (예: keys, threshold 등)
  onSearchResults: (results: T[]) => void;
}

export default function SearchInput<TData = string>({
  // TData 제네릭으로 데이터 타입 명시
  placeholder = "검색어를 입력하세요...",
  value,
  onChange,
  onClear,
  className = "",
  disabled = false,
  data,
  fuseOptions,
  onSearchResults,
}: SearchInputProps<TData>) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fuseInstanceRef = useRef<Fuse<TData> | null>(null);

  useEffect(() => {
    if (data && data.length > 0) {
      fuseInstanceRef.current = new Fuse(data, fuseOptions);
    } else {
      fuseInstanceRef.current = null;
    }
  }, [data, fuseOptions]);

  useEffect(() => {
    if (!fuseInstanceRef.current) {
      if (value.trim() === "") {
        onSearchResults(data || []);
      } else {
        onSearchResults([]);
      }
      return;
    }

    if (value.trim() === "") {
      onSearchResults(data);
    } else {
      const searchResults = fuseInstanceRef.current.search(value.trim());
      onSearchResults(searchResults.map((result) => result.item));
    }
  }, [value, data, fuseOptions, onSearchResults]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClearButtonClick = () => {
    onChange("");
    onClear?.();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      handleClearButtonClick();
    }
  };

  // 컴포넌트 마운트 시 포커스 (선택사항, 현재 로직에서는 isFocused 상태에 따라 동작)
  useEffect(() => {
    if (isFocused && inputRef.current) {
      // inputRef.current.focus(); // 필요에 따라 주석 해제 또는 로직 수정
    }
  }, [isFocused]);

  return (
    <div className={`${styles.searchContainer} ${className}`}>
      <div
        className={`${styles.searchInputWrapper} ${
          isFocused ? styles.focused : ""
        } ${disabled ? styles.disabled : ""}`}
      >
        {/* 검색 아이콘 */}
        <div className={styles.searchIcon}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        {/* 입력 필드 */}
        <input
          ref={inputRef}
          type="text"
          className={styles.searchInput}
          placeholder={placeholder}
          value={value} // 부모로부터 받은 현재 검색어
          onChange={handleInputChange} // 검색어 변경 핸들러
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          autoComplete="off"
        />

        {/* 클리어 버튼 */}
        {value && !disabled && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClearButtonClick}
            aria-label="검색어 지우기"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
