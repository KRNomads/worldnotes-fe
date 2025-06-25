"use client";

import type React from "react";
import { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import { TimeColumn } from "../lib/timeline-utils";
import {
  ConnectionMode,
  Edge,
  TimelineEvent,
} from "../types/timeline-editor-types";

interface TimelineCanvasProps {
  chapters: TimeColumn[];
  events: TimelineEvent[];
  edges: Edge[];
  onEventMove: (eventId: string, x: number, y: number) => void;
  onEventClick: (eventId: string) => void;
  onEdgeClick: (edgeId: string) => void;
  selectedEvent: string | null;
  firstSelectedEvent: string | null;
  connectionMode: ConnectionMode;
  onNotesDrop: (note: any, x: number, y: number, chapterId: string) => void;
  columnWidth?: number;
  searchResults?: TimelineEvent[];
  currentSearchIndex?: number;
  panTransform: { x: number; y: number };
  onPanChange: (transform: { x: number; y: number }) => void;
}

export function TimelineCanvas({
  chapters: timeColumns,
  events,
  edges,
  onEventMove,
  onEventClick,
  onEdgeClick,
  selectedEvent,
  firstSelectedEvent,
  connectionMode,
  onNotesDrop,
  columnWidth = 200,
  searchResults = [],
  currentSearchIndex = 0,
  panTransform,
  onPanChange,
}: TimelineCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isDraggingScrollbar, setIsDraggingScrollbar] = useState(false);
  const isUpdatingTransformRef = useRef(false); // Flag to prevent infinite loops

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height - 20 }); // 스크롤바 공간 확보
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const getEdgeStyle = (type: Edge["type"]) => {
    switch (type) {
      case "sequence":
        return {
          stroke: "#3b82f6",
          strokeWidth: 2,
          strokeDasharray: "none",
          markerEnd: "url(#arrow-sequence)",
        };
      case "causality":
        return {
          stroke: "#ef4444",
          strokeWidth: 3,
          strokeDasharray: "none",
          markerEnd: "url(#arrow-causality)",
        };
      case "hint":
        return {
          stroke: "#8b5cf6",
          strokeWidth: 2,
          strokeDasharray: "5,5",
          markerEnd: "url(#arrow-hint)",
        };
      case "foreshadowing":
        return {
          stroke: "#f59e0b",
          strokeWidth: 2,
          strokeDasharray: "10,3,3,3",
          markerEnd: "url(#arrow-foreshadowing)",
        };
      default:
        return {
          stroke: "#6b7280",
          strokeWidth: 1,
          strokeDasharray: "none",
          markerEnd: "url(#arrow-default)",
        };
    }
  };

  // React Flow 스타일의 베지어 곡선 생성
  const createReactFlowBezier = (
    sourceEvent: TimelineEvent,
    targetEvent: TimelineEvent
  ) => {
    // 노드의 연결점 계산
    const sourceX = sourceEvent.x + 80; // 노드 오른쪽 가장자리
    const sourceY = sourceEvent.y;
    const targetX = targetEvent.x - 80; // 노드 왼쪽 가장자리
    const targetY = targetEvent.y;

    // React Flow 베지어 곡선 로직
    const xDistance = Math.abs(targetX - sourceX);
    const yDistance = Math.abs(targetY - sourceY);

    // 제어점 오프셋 계산 (React Flow와 동일한 로직)
    const offset = Math.min(xDistance * 0.5, Math.max(100, xDistance * 0.25));

    // 제어점 설정
    const controlX1 = sourceX + offset;
    const controlY1 = sourceY;
    const controlX2 = targetX - offset;
    const controlY2 = targetY;

    // SVG 베지어 곡선 경로
    return `M${sourceX},${sourceY} C${controlX1},${controlY1} ${controlX2},${controlY2} ${targetX},${targetY}`;
  };

  // 스크롤바 드래그 핸들러
  const handleScrollbarMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      setIsDraggingScrollbar(true);

      const totalWidth = timeColumns.length * columnWidth;
      const viewportWidth = dimensions.width - 100;

      if (totalWidth <= viewportWidth) return;

      const maxScroll = totalWidth - viewportWidth;
      const scrollbarWidth = scrollbarRef.current?.offsetWidth || 0;
      const thumbWidth = Math.max(
        20,
        (viewportWidth / totalWidth) * scrollbarWidth
      );

      const updateScroll = (clientX: number) => {
        if (!scrollbarRef.current) return;

        const rect = scrollbarRef.current.getBoundingClientRect();
        const clickX = clientX - rect.left;

        // 스크롤 위치 계산
        const newScrollRatio = Math.max(
          0,
          Math.min(1, (clickX - thumbWidth / 2) / (scrollbarWidth - thumbWidth))
        );
        const newScrollPosition = newScrollRatio * maxScroll;

        // 외부 상태 업데이트
        onPanChange({ x: -newScrollPosition, y: panTransform.y });
      };

      const handleMouseMove = (e: MouseEvent) => {
        updateScroll(e.clientX);
      };

      const handleMouseUp = () => {
        setIsDraggingScrollbar(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      // 초기 클릭 위치로 즉시 이동
      updateScroll(event.nativeEvent.clientX);
    },
    [
      timeColumns.length,
      columnWidth,
      dimensions.width,
      panTransform.y,
      onPanChange,
    ]
  );

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 80, right: 120, bottom: 30, left: 120 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Define arrow markers
    const defs = svg.append("defs");

    const createArrowMarker = (id: string, color: string) => {
      defs
        .append("marker")
        .attr("id", id)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 8)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", color);
    };

    createArrowMarker("arrow-sequence", "#3b82f6");
    createArrowMarker("arrow-causality", "#ef4444");
    createArrowMarker("arrow-hint", "#8b5cf6");
    createArrowMarker("arrow-foreshadowing", "#f59e0b");
    createArrowMarker("arrow-default", "#6b7280");

    const contentGroupOffset = margin.top + 20;
    const contentGroup = svg
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left + panTransform.x}, ${
          contentGroupOffset + panTransform.y
        })`
      );

    const headerGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left + panTransform.x}, 0)`);
    headerGroup
      .append("rect")
      .attr("x", -margin.left - panTransform.x)
      .attr("y", 0)
      .attr("width", dimensions.width)
      .attr("height", 60)
      .attr("fill", "white")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 1)
      .attr("pointer-events", "none");

    // Chapter positions
    const chapterWidth = columnWidth;
    const chapterPositions = timeColumns.map((chapter, i) => ({
      ...chapter,
      x: i * chapterWidth + chapterWidth / 2,
    }));

    // Draw chapter headers
    const chapterGroups = headerGroup
      .selectAll(".chapter-group")
      .data(chapterPositions)
      .enter()
      .append("g")
      .attr("class", "chapter-group")
      .attr("transform", (d) => `translate(${d.x}, 60)`);

    // Chapter title - 이제 단위날짜 표시
    chapterGroups
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", -30)
      .attr("class", "text-sm font-semibold fill-gray-800")
      .text((d) => d.name); // 1일, 2일, 3일... 또는 1챕터, 2챕터...

    // Chapter subtitle - 이제 실제 날짜 표시
    chapterGroups
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", -15)
      .attr("class", "text-xs fill-gray-500")
      .text((d) => d.subtitle); // 실제 날짜나 시간 범위

    // Calculate timeline boundaries - 세로 드래그 허용
    const totalTimelineWidth = timeColumns.length * chapterWidth;
    const totalTimelineHeight = 800; // 세로 영역 크기 설정
    const minX = Math.min(0, -(totalTimelineWidth - width));
    const maxX = 0;
    const minY = Math.min(0, -(totalTimelineHeight - height)); // 세로 경계 추가
    const maxY = 0;

    // Add pan functionality with boundaries
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 1])
      .on("zoom", (event) => {
        if (isDraggingScrollbar || isUpdatingTransformRef.current) return;

        let { x, y } = event.transform;
        x = Math.max(minX, Math.min(maxX, x));
        y = Math.max(minY, Math.min(maxY, y)); // 세로 경계 적용

        // 헤더와 콘텐츠 그룹 직접 업데이트 (즉시 반영)
        headerGroup.attr("transform", `translate(${margin.left + x}, 0)`);
        contentGroup.attr(
          "transform",
          `translate(${margin.left + x}, ${contentGroupOffset + y})`
        );

        // 외부 상태 업데이트 (디바운스)
        onPanChange({ x, y });
      });

    svg.call(zoom);

    // 외부에서 전달된 panTransform으로 zoom transform 설정 (프로그래매틱 업데이트)
    isUpdatingTransformRef.current = true;
    const transform = d3.zoomIdentity.translate(panTransform.x, panTransform.y);
    svg.call(zoom.transform as any, transform);

    // 약간의 지연 후 플래그 해제
    setTimeout(() => {
      isUpdatingTransformRef.current = false;
    }, 0);

    // Prevent default click behavior on empty space
    svg.on("click", (event) => {
      event.stopPropagation();
    });

    // 기존의 vertical separator lines를 제거하고 중앙에서 내려오는 세로선으로 교체
    const verticalLines = contentGroup
      .selectAll(".vertical-line")
      .data(chapterPositions)
      .enter()
      .append("line")
      .attr("class", "vertical-line")
      .attr("x1", (d) => d.x)
      .attr("x2", (d) => d.x)
      .attr("y1", -60) // 위로 좀 연장해도 되고
      .attr("y2", totalTimelineHeight)
      .attr("stroke", "#d1d5db")
      .attr("stroke-width", 1);

    // Draw edges (React Flow 스타일 베지어 곡선)
    const edgeGroups = contentGroup
      .selectAll(".edge-group")
      .data(edges)
      .enter()
      .append("g")
      .attr("class", "edge-group")
      .attr("data-edge-id", (d) => d.id);

    edgeGroups.each(function (edge) {
      const sourceEvent = events.find((e) => e.id === edge.sourceEventId);
      const targetEvent = events.find((e) => e.id === edge.targetEventId);

      if (!sourceEvent || !targetEvent) return;

      const style = getEdgeStyle(edge.type);
      const pathData = createReactFlowBezier(sourceEvent, targetEvent);

      const path = d3
        .select(this)
        .append("path")
        .attr("d", pathData)
        .attr("stroke", style.stroke)
        .attr("stroke-width", style.strokeWidth)
        .attr("stroke-dasharray", style.strokeDasharray)
        .attr("fill", "none")
        .attr("marker-end", style.markerEnd)
        .style("cursor", connectionMode === "delete" ? "pointer" : "default")
        .datum(edge) // 엣지 데이터를 path 요소에 바인딩
        .on("click", (event) => {
          event.stopPropagation();
          onEdgeClick(edge.id);
        });

      // 호버 효과
      if (connectionMode === "delete") {
        path
          .on("mouseenter", function () {
            d3.select(this).attr("stroke-width", Number(style.strokeWidth) + 1);
          })
          .on("mouseleave", function () {
            d3.select(this).attr("stroke-width", style.strokeWidth);
          });
      }
    });

    // Draw events
    const eventGroups = contentGroup
      .selectAll(".event-group")
      .data(events)
      .enter()
      .append("g")
      .attr("class", "event-group")
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
      .style(
        "cursor",
        connectionMode && connectionMode !== "delete" ? "pointer" : "move"
      );

    // Event cards
    const eventCards = eventGroups.append("g").attr("class", "event-card");

    eventCards
      .append("rect")
      .attr("x", -80)
      .attr("y", -25)
      .attr("width", 160)
      .attr("height", 50)
      .attr("rx", 8)
      .attr("fill", "white")
      .attr("stroke", (d) => {
        if (firstSelectedEvent === d.id) return "#10b981";
        if (selectedEvent === d.id) return "#3b82f6";
        if (
          searchResults.length > 0 &&
          searchResults.find((sr) => sr.id === d.id)
        ) {
          return searchResults[currentSearchIndex]?.id === d.id
            ? "#f59e0b"
            : "#fbbf24";
        }
        return "#e5e7eb";
      })
      .attr("stroke-width", (d) => {
        if (firstSelectedEvent === d.id || selectedEvent === d.id) return 2;
        if (
          searchResults.length > 0 &&
          searchResults.find((sr) => sr.id === d.id)
        )
          return 2;
        return 1;
      })
      .style("filter", (d) => {
        if (
          searchResults.length > 0 &&
          searchResults.find((sr) => sr.id === d.id)
        ) {
          return "drop-shadow(0 4px 8px rgba(0,0,0,0.15))";
        }
        return "drop-shadow(0 2px 4px rgba(0,0,0,0.1))";
      });

    // Event color indicator
    eventCards
      .append("rect")
      .attr("x", -80)
      .attr("y", -25)
      .attr("width", 4)
      .attr("height", 50)
      .attr("rx", 2)
      .attr("fill", (d) => d.color);

    // Event title
    eventCards
      .append("text")
      .attr("x", -70)
      .attr("y", -8)
      .attr("class", "text-xs font-medium fill-gray-900")
      .text((d) =>
        d.title.length > 20 ? d.title.substring(0, 20) + "..." : d.title
      );

    // Event description
    eventCards
      .append("text")
      .attr("x", -70)
      .attr("y", 8)
      .attr("class", "text-xs fill-gray-500")
      .text((d) =>
        d.description.length > 25
          ? d.description.substring(0, 25) + "..."
          : d.description
      );

    // Event interactions - 드래그 중 엣지 업데이트 추가
    let dragStarted = false;
    let moved = false;

    eventGroups
      .on("click", (event, d) => {
        event.stopPropagation();
        if (!moved) {
          console.log("✅ Click event triggered for", d.id);
          onEventClick(d.id);
        }
        moved = false;
      })
      .call(
        d3
          .drag<SVGGElement, TimelineEvent>()
          .on("start", () => {
            dragStarted = true;
            moved = false;
          })
          .on("drag", function (event, d) {
            moved = true;
            const newX = Math.max(0, Math.min(totalTimelineWidth, event.x));
            const newY = Math.max(0, Math.min(totalTimelineHeight, event.y)); // 세로 경계 적용
            d3.select(this).attr("transform", `translate(${newX}, ${newY})`);

            // 드래그 중 엣지 실시간 업데이트
            contentGroup.selectAll(".edge-group").each(function (edge: Edge) {
              const sourceEvent = events.find(
                (e) => e.id === edge.sourceEventId
              );
              const targetEvent = events.find(
                (e) => e.id === edge.targetEventId
              );

              if (!sourceEvent || !targetEvent) return;

              // 드래그 중인 이벤트의 좌표 업데이트
              let updatedSourceEvent = sourceEvent;
              let updatedTargetEvent = targetEvent;

              if (sourceEvent.id === d.id) {
                updatedSourceEvent = { ...sourceEvent, x: newX, y: newY };
              }
              if (targetEvent.id === d.id) {
                updatedTargetEvent = { ...targetEvent, x: newX, y: newY };
              }

              const style = getEdgeStyle(edge.type);
              const pathData = createReactFlowBezier(
                updatedSourceEvent,
                updatedTargetEvent
              );

              d3.select(this).select("path").attr("d", pathData);
            });
          })
          .on("end", (event, d) => {
            if (!moved) return;
            const newX = Math.max(0, Math.min(totalTimelineWidth, event.x));
            const newY = Math.max(0, Math.min(totalTimelineHeight, event.y)); // 세로 경계 적용
            onEventMove(d.id, newX, newY);
            dragStarted = false;
          })
      );

    // Handle drop events
    svg
      .on("dragover", (event) => {
        event.preventDefault();
      })
      .on("drop", (event) => {
        event.preventDefault();
        const noteData = JSON.parse(event.dataTransfer.getData("text/plain"));
        const [x, y] = d3.pointer(event, contentGroup.node());

        const chapterIndex = Math.floor(x / chapterWidth);
        const chapterId =
          timeColumns[
            Math.max(0, Math.min(chapterIndex, timeColumns.length - 1))
          ]?.id || "ch1";

        onNotesDrop(noteData, x, y, chapterId);
      });
  }, [
    dimensions,
    timeColumns,
    events,
    edges,
    selectedEvent,
    firstSelectedEvent,
    connectionMode,
    onEventMove,
    onEventClick,
    onEdgeClick,
    onNotesDrop,
    columnWidth,
    searchResults,
    currentSearchIndex,
    panTransform,
    onPanChange,
    isDraggingScrollbar,
  ]);

  // 스크롤바 업데이트
  useEffect(() => {
    if (!scrollbarRef.current || timeColumns.length === 0) return;

    const totalWidth = timeColumns.length * columnWidth;
    const viewportWidth = dimensions.width - 100; // 마진 고려

    if (totalWidth <= viewportWidth) {
      scrollbarRef.current.style.display = "none";
      return;
    }

    scrollbarRef.current.style.display = "block";

    const scrollbarWidth = scrollbarRef.current.offsetWidth;
    const thumbWidth = Math.max(
      20,
      (viewportWidth / totalWidth) * scrollbarWidth
    );
    const maxScroll = totalWidth - viewportWidth;
    const scrollPosition = Math.abs(panTransform.x);
    const thumbPosition =
      (scrollPosition / maxScroll) * (scrollbarWidth - thumbWidth);

    const thumb = scrollbarRef.current.querySelector(
      ".scrollbar-thumb"
    ) as HTMLElement;
    if (thumb) {
      thumb.style.width = `${thumbWidth}px`;
      thumb.style.left = `${Math.max(
        0,
        Math.min(scrollbarWidth - thumbWidth, thumbPosition)
      )}px`;
    }
  }, [panTransform, timeColumns, columnWidth, dimensions]);

  return (
    <div className="w-full h-full bg-gray-50 flex flex-col">
      {/* 컨테이너 및 SVG */}
      <div
        ref={containerRef}
        className="flex-1 h-full pt-[80px] overflow-hidden"
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="absolute top-0 left-0"
        />
      </div>

      {/* 가로 스크롤바 */}
      <div
        ref={scrollbarRef}
        className="h-5 bg-gray-100 border-t border-gray-200 relative cursor-pointer select-none"
        onMouseDown={handleScrollbarMouseDown}
      >
        <div
          className={`scrollbar-thumb absolute top-1 bottom-1 bg-gray-400 rounded transition-colors ${
            isDraggingScrollbar ? "bg-gray-600" : "hover:bg-gray-500"
          }`}
        />
      </div>
    </div>
  );
}
