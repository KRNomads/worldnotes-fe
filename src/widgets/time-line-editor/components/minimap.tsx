"use client";

import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { X, Maximize2 } from "lucide-react";
import { TimeColumn } from "../lib/timeline-utils";
import { TimelineEvent } from "../types/timeline-editor-types";
import { Button } from "@/shared/ui/button";

interface MinimapProps {
  timeColumns: TimeColumn[];
  events: TimelineEvent[];
  panTransform: { x: number; y: number };
  onPanChange: (transform: { x: number; y: number }) => void;
  columnWidth: number;
  viewportDimensions: { width: number; height: number };
  onClose: () => void;
}

export function Minimap({
  timeColumns,
  events,
  panTransform,
  onPanChange,
  columnWidth,
  viewportDimensions,
  onClose,
}: MinimapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // 미니맵 크기 설정
  const minimapWidth = isExpanded ? 400 : 200;
  const minimapHeight = isExpanded ? 300 : 150;
  const margin = { top: 10, right: 10, bottom: 10, left: 10 };

  useEffect(() => {
    if (!svgRef.current || timeColumns.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // 전체 타임라인 크기 계산 (실제 캔버스 크기와 동일하게)
    const totalTimelineWidth = timeColumns.length * columnWidth;
    const totalTimelineHeight = 800; // 세로 영역 크기

    // 실제 뷰포트 크기 (마진 제외)
    const actualViewportWidth = viewportDimensions.width - 240; // 좌우 마진 120씩
    const actualViewportHeight = viewportDimensions.height - 110; // 상하 마진 (헤더 80 + 여백)

    // 스케일 계산
    const scaleX =
      (minimapWidth - margin.left - margin.right) / totalTimelineWidth;
    const scaleY =
      (minimapHeight - margin.top - margin.bottom) / totalTimelineHeight;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // 배경
    const background = g
      .append("rect")
      .attr("width", minimapWidth - margin.left - margin.right)
      .attr("height", minimapHeight - margin.top - margin.bottom)
      .attr("fill", "#f9fafb")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 1)
      .style("cursor", "crosshair");

    // 타임라인 컬럼 표시 (세로선)
    timeColumns.forEach((column, i) => {
      const x = i * columnWidth * scaleX;
      g.append("line")
        .attr("x1", x)
        .attr("x2", x)
        .attr("y1", 0)
        .attr("y2", minimapHeight - margin.top - margin.bottom)
        .attr("stroke", "#d1d5db")
        .attr("stroke-width", 0.5);
    });

    // 이벤트 표시 (작은 원)
    events.forEach((event) => {
      const x = event.x * scaleX;
      const y = event.y * scaleY;

      g.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", isExpanded ? 3 : 2)
        .attr("fill", event.color)
        .attr("stroke", "white")
        .attr("stroke-width", 0.5)
        .style("cursor", "pointer")
        .on("click", (clickEvent) => {
          clickEvent.stopPropagation();
          // 이벤트 클릭 시 해당 위치로 이동
          const centerX = actualViewportWidth / 2;
          const centerY = actualViewportHeight / 2;
          const newPanX = centerX - event.x;
          const newPanY = centerY - event.y;

          // 경계 체크
          const minX = Math.min(0, -(totalTimelineWidth - actualViewportWidth));
          const maxX = 0;
          const minY = Math.min(
            0,
            -(totalTimelineHeight - actualViewportHeight)
          );
          const maxY = 0;

          const boundedX = Math.max(minX, Math.min(maxX, newPanX));
          const boundedY = Math.max(minY, Math.min(maxY, newPanY));

          onPanChange({ x: boundedX, y: boundedY });
        });

      // 이벤트 제목 표시 (확장 모드에서만)
      if (isExpanded) {
        g.append("text")
          .attr("x", x + 5)
          .attr("y", y + 1)
          .attr("class", "text-xs fill-gray-700")
          .attr("font-size", "8px")
          .text(
            event.title.length > 10
              ? event.title.substring(0, 10) + "..."
              : event.title
          )
          .style("pointer-events", "none");
      }
    });

    // 현재 뷰포트 영역 표시 (수정된 계산)
    const viewportWidth = actualViewportWidth * scaleX;
    const viewportHeight = actualViewportHeight * scaleY;

    // 뷰포트 위치 계산 (pan transform을 반영)
    const viewportX = Math.max(0, -panTransform.x * scaleX);
    const viewportY = Math.max(0, -panTransform.y * scaleY);

    // 뷰포트가 미니맵 경계를 벗어나지 않도록 클램핑
    const maxViewportX =
      minimapWidth - margin.left - margin.right - viewportWidth;
    const maxViewportY =
      minimapHeight - margin.top - margin.bottom - viewportHeight;

    const clampedViewportX = Math.max(0, Math.min(maxViewportX, viewportX));
    const clampedViewportY = Math.max(0, Math.min(maxViewportY, viewportY));

    // 뷰포트 크기도 경계에 맞게 조정
    const clampedViewportWidth = Math.min(
      viewportWidth,
      minimapWidth - margin.left - margin.right - clampedViewportX
    );
    const clampedViewportHeight = Math.min(
      viewportHeight,
      minimapHeight - margin.top - margin.bottom - clampedViewportY
    );

    const viewport = g
      .append("rect")
      .attr("x", clampedViewportX)
      .attr("y", clampedViewportY)
      .attr("width", Math.max(0, clampedViewportWidth))
      .attr("height", Math.max(0, clampedViewportHeight))
      .attr("fill", "rgba(59, 130, 246, 0.2)")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .style("cursor", "move");

    // 좌표 변환 함수들을 먼저 정의
    const minimapToWorld = (minimapX: number, minimapY: number) => {
      const worldX = minimapX / scaleX;
      const worldY = minimapY / scaleY;
      return { x: worldX, y: worldY };
    };

    const worldToPan = (worldX: number, worldY: number) => {
      const centerX = actualViewportWidth / 2;
      const centerY = actualViewportHeight / 2;
      const newPanX = centerX - worldX;
      const newPanY = centerY - worldY;

      // 경계 체크
      const minX = Math.min(0, -(totalTimelineWidth - actualViewportWidth));
      const maxX = 0;
      const minY = Math.min(0, -(totalTimelineHeight - actualViewportHeight));
      const maxY = 0;

      const boundedX = Math.max(minX, Math.min(maxX, newPanX));
      const boundedY = Math.max(minY, Math.min(maxY, newPanY));

      return { x: boundedX, y: boundedY };
    };

    // 배경 클릭 이벤트 (단순 클릭만)
    background.on("click", (event) => {
      const [mouseX, mouseY] = d3.pointer(event, g.node());
      const world = minimapToWorld(mouseX, mouseY);
      const newPan = worldToPan(world.x, world.y);
      onPanChange(newPan);
    });

    // 뷰포트 드래그 기능 (단순화)
    let isDragging = false;

    viewport.style("cursor", "move").on("mousedown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      isDragging = true;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDragging) return;

        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = moveEvent.clientX - rect.left - margin.left;
        const mouseY = moveEvent.clientY - rect.top - margin.top;

        const world = minimapToWorld(mouseX, mouseY);
        const newPan = worldToPan(world.x, world.y);
        onPanChange(newPan);
      };

      const handleMouseUp = () => {
        isDragging = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    });

    console.log("🗺️ Minimap updated:", {
      panTransform,
      viewportDimensions,
      actualViewportWidth,
      actualViewportHeight,
      viewportX: clampedViewportX,
      viewportY: clampedViewportY,
      viewportWidth: clampedViewportWidth,
      viewportHeight: clampedViewportHeight,
      scaleX,
      scaleY,
    });
  }, [
    timeColumns,
    events,
    panTransform,
    columnWidth,
    viewportDimensions,
    onPanChange,
    minimapWidth,
    minimapHeight,
    isExpanded,
  ]);

  return (
    <div className="fixed bottom-6 left-6 z-50 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-xs font-medium text-gray-700">미니맵</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "축소" : "확대"}
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClose}
            title="닫기"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* 미니맵 SVG */}
      <div className="relative">
        <svg
          ref={svgRef}
          width={minimapWidth}
          height={minimapHeight}
          className="block"
        />

        {/* 범례 */}
        <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full opacity-20"></div>
              <span>뷰포트</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>이벤트</span>
            </div>
          </div>
        </div>

        {/* 디버그 정보 (확장 모드에서만) */}
        {isExpanded && (
          <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded px-2 py-1 text-xs text-gray-600 font-mono">
            <div>Pan X: {Math.round(panTransform.x)}</div>
            <div>Pan Y: {Math.round(panTransform.y)}</div>
            <div>
              Viewport: {viewportDimensions.width}×{viewportDimensions.height}
            </div>
            <div>Events: {events.length}</div>
            <div>Columns: {timeColumns.length}</div>
          </div>
        )}
      </div>
    </div>
  );
}
