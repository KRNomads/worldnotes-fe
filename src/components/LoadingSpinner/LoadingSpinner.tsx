// components/LoadingSpinner.tsx
import React from "react";
// SCSS 모듈 파일 임포트
import styles from "./LoadingSpinner.module.scss";

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  thickness?: number;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  // SCSS 변수에 정의된 기본값을 여기서도 설정 (props 없을 시 대비)
  size = 36,
  color = "#0070f3",
  thickness = 4,
  className = "",
}) => {
  // 인라인 스타일: props로 받은 값으로 SCSS의 기본값을 덮어씀
  const spinnerStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderWidth: `${thickness}px`,
    borderLeftColor: color, // 회전하는 부분 색상 적용
    // 트랙 색상(border-color)은 SCSS 파일에서 $track-color로 설정됨
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${styles.spinnerContainer} ${className}`}
    >
      {/* 기본 스피너 클래스 적용 및 인라인 스타일로 커스터마이징 */}
      <div className={styles.spinner} style={spinnerStyle}></div>
      <span className={styles.visuallyHidden}>Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
