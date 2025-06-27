"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Menu,
  Trash2,
  ArrowRight,
  Zap,
  EyeIcon,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { generateTimeColumns } from "./lib/timeline-utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Minimap } from "./ui/minimap";
import { TimelineCanvas } from "./ui/timeline-canvas";
import { NotesPanel } from "./ui/notes-panel";
import { EventEditPanel } from "./ui/event-edit-panel";
import { SettingsDialog } from "./ui/settings-dialog";
import { ConnectionMode } from "./types/timeline-editor-types";
import { TimelineEditorHeader } from "./timeline-editor-header";
import { initialEvents, initialSettings } from "./lib/timeline-sample";
import {
  TimeColumn,
  TimelineEdge,
  TimelineEvent,
} from "@/entities/timeline/types/timeline-types";
import { Note } from "@/entities/note/types/note";

export function TimelineEditor() {
  const [events, setEvents] = useState<TimelineEvent[]>(initialEvents);
  const [edges, setEdges] = useState<TimelineEdge[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>(null);
  const [firstSelectedEvent, setFirstSelectedEvent] = useState<string | null>(
    null
  );

  // 새로운 간단한 설정 구조
  const [timelineSettings, setTimelineSettings] = useState(initialSettings);

  const [showSettings, setShowSettings] = useState(false);
  const [showMinimap, setShowMinimap] = useState(false);
  const [showEventList, setShowEventList] = useState(false);
  const [showEventEdit, setShowEventEdit] = useState(false);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [panTransform, setPanTransform] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector(".timeline-container");
      if (container) {
        const rect = container.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const getSortedEvents = () => {
    return [...events].sort((a, b) => a.x - b.x);
  };

  const [timeColumns, setTimeColumns] = useState<TimeColumn[]>(
    generateTimeColumns(timelineSettings)
  );

  useEffect(() => {
    setTimeColumns(generateTimeColumns(timelineSettings));
  }, [timelineSettings]);

  const handleConnectionModeChange = (mode: ConnectionMode) => {
    if (connectionMode === mode) {
      // 같은 모드를 다시 클릭하면 해제
      setConnectionMode(null);
      setFirstSelectedEvent(null);
    } else {
      setConnectionMode(mode);
      setFirstSelectedEvent(null);
    }
  };

  const handleEventClick = (eventId: string) => {
    console.log("🟢 Event clicked:", eventId);
    if (connectionMode && connectionMode !== "delete") {
      if (!firstSelectedEvent) {
        console.log("🟠 First event selected");
        setFirstSelectedEvent(eventId);
      } else if (firstSelectedEvent !== eventId) {
        console.log(
          "🔵 Creating edge between",
          firstSelectedEvent,
          "and",
          eventId
        );
        const newEdge: TimelineEdge = {
          id: `edge-${Date.now()}`,
          type: connectionMode,
          sourceEventId: firstSelectedEvent,
          targetEventId: eventId,
        };
        setEdges((prev) => [...prev, newEdge]);
        setFirstSelectedEvent(null);
        setConnectionMode(null);
      }
    } else {
      console.log("🟣 Opening edit panel for", eventId);
      setSelectedEvent(eventId);
      setShowEventEdit(true);
    }
  };

  const handleEdgeClick = (edgeId: string) => {
    if (connectionMode === "delete") {
      setEdges((prev) => prev.filter((edge) => edge.id !== edgeId));
    }
  };

  const handleEventMove = (eventId: string, newX: number, newY: number) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId ? { ...event, x: newX, y: newY } : event
      )
    );
  };

  const handleEventAdd = () => {
    // 현재 뷰포트의 중앙 좌표 계산 (pan transform 고려)
    const viewportCenterX = dimensions.width / 2;
    const viewportCenterY = dimensions.height / 2;

    // pan transform을 고려한 실제 월드 좌표 계산
    const worldCenterX = viewportCenterX - panTransform.x - 50;
    const worldCenterY = viewportCenterY - panTransform.y - 100;

    // 세로 경계도 고려
    const totalTimelineWidth =
      timeColumns.length * timelineSettings.columnWidth;
    const totalTimelineHeight = 800;

    const newEvent: TimelineEvent = {
      id: `event-${Date.now()}`,
      title: "새로운 사건",
      description: "사건 설명을 입력하세요",
      time: timeColumns[0]?.id || "ch1",
      x: Math.max(0, Math.min(totalTimelineWidth, worldCenterX)),
      y: Math.max(0, Math.min(totalTimelineHeight, worldCenterY)),
      color: "#6b7280",
    };

    setEvents((prev) => [...prev, newEvent]);
    setSelectedEvent(newEvent.id);
  };

  const handleEventDelete = (eventId: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== eventId));
    setEdges((prev) =>
      prev.filter(
        (edge) =>
          edge.sourceEventId !== eventId && edge.targetEventId !== eventId
      )
    );
    setSelectedEvent(null);
  };

  const handleNotesDrop = (
    note: Note,
    x: number,
    y: number,
    chapterId: string
  ) => {
    const newEvent: TimelineEvent = {
      id: `event-${Date.now()}`,
      title: note.title,
      description: note.summary,
      time: chapterId,
      x,
      y,
      color: note.color || "#6b7280",
    };
    setEvents((prev) => [...prev, newEvent]);
  };

  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];

    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const goToNextSearchResult = () => {
    const searchResults = getSearchResults();
    if (searchResults.length > 0) {
      const nextIndex = (currentSearchIndex + 1) % searchResults.length;
      setCurrentSearchIndex(nextIndex);
      setSelectedEvent(searchResults[nextIndex].id);
    }
  };

  const goToPrevSearchResult = () => {
    const searchResults = getSearchResults();
    if (searchResults.length > 0) {
      const prevIndex =
        currentSearchIndex === 0
          ? searchResults.length - 1
          : currentSearchIndex - 1;
      setCurrentSearchIndex(prevIndex);
      setSelectedEvent(searchResults[prevIndex].id);
    }
  };

  const navigateToEvent = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    setSelectedEvent(eventId);
    setShowEventList(false);

    // Calculate the required pan transform to center the event
    const eventX = event.x;
    const eventY = event.y;
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    // Calculate new pan position to center the event
    const newPanX = centerX - eventX - 50; // 50 is margin offset
    const newPanY = centerY - eventY - 100; // 100 is margin offset

    // Apply bounds checking
    const totalTimelineWidth =
      timeColumns.length * timelineSettings.columnWidth;
    const minX = Math.min(0, -(totalTimelineWidth - dimensions.width + 100));
    const maxX = 0;
    const minY = 0;
    const maxY = 0;

    const boundedX = Math.max(minX, Math.min(maxX, newPanX));
    const boundedY = Math.max(minY, Math.min(maxY, newPanY));

    setPanTransform({ x: boundedX, y: boundedY });
  };

  // Debounced pan change handler to prevent infinite loops
  const handlePanChange = useCallback(
    (newTransform: { x: number; y: number }) => {
      setPanTransform(newTransform);
    },
    []
  );

  return (
    <>
      {/* 헤더 */}
      <TimelineEditorHeader
        showMinimap={showMinimap}
        setShowMinimap={setShowMinimap}
        setShowSettings={setShowSettings}
      />

      {/* 에디터 */}
      <div className="bg-white border-b border-gray-200">
        {/* 엣지 설정 */}
        <div className="flex items-center gap-2 ">
          <Button
            variant={connectionMode === "sequence" ? "default" : "ghost"}
            size="sm"
            className="text-gray-600"
            onClick={() => handleConnectionModeChange("sequence")}
          >
            <ArrowRight className="h-4 w-4 mr-1" />
            순서
          </Button>
          <Button
            variant={connectionMode === "causality" ? "default" : "ghost"}
            size="sm"
            className="text-gray-600"
            onClick={() => handleConnectionModeChange("causality")}
          >
            <Zap className="h-4 w-4 mr-1" />
            인과
          </Button>
          <Button
            variant={connectionMode === "hint" ? "default" : "ghost"}
            size="sm"
            className="text-gray-600"
            onClick={() => handleConnectionModeChange("hint")}
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            암시
          </Button>
          <Button
            variant={connectionMode === "foreshadowing" ? "default" : "ghost"}
            size="sm"
            className="text-gray-600"
            onClick={() => handleConnectionModeChange("foreshadowing")}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            복선
          </Button>
          <Button
            variant={connectionMode === "delete" ? "destructive" : "ghost"}
            size="sm"
            className="text-gray-600"
            onClick={() => handleConnectionModeChange("delete")}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            삭제
          </Button>
        </div>

        {/* Connection Mode Indicator */}
        {connectionMode && connectionMode !== "delete" && (
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              {firstSelectedEvent
                ? "두 번째 이벤트를 선택하세요"
                : "첫 번째 이벤트를 선택하세요"}{" "}
              (
              {connectionMode === "sequence"
                ? "순서"
                : connectionMode === "causality"
                ? "인과"
                : connectionMode === "hint"
                ? "암시"
                : "복선"}{" "}
              연결)
            </p>
          </div>
        )}

        {connectionMode === "delete" && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">삭제할 연결선을 클릭하세요</p>
          </div>
        )}

        {/* 검색 & 이벤트 추가 */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="이벤트 검색..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentSearchIndex(0);
              }}
              className="pl-10"
            />
            {searchQuery && getSearchResults().length > 0 && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={goToPrevSearchResult}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="text-xs text-gray-500 px-1">
                  {currentSearchIndex + 1}/{getSearchResults().length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={goToNextSearchResult}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          <Button
            onClick={handleEventAdd}
            className="bg-gray-900 hover:bg-gray-800 text-white px-4"
          >
            <Plus className="h-4 w-4 mr-1" />
            이벤트 추가
          </Button>
        </div>

        {/* 검색 결과 정보 */}
        {searchQuery && (
          <div className="mt-2 text-sm text-gray-600">
            {getSearchResults().length}개의 이벤트가 검색되었습니다
            {getSearchResults().length === 0 && (
              <span className="text-gray-500"> - 검색 결과가 없습니다</span>
            )}
          </div>
        )}
      </div>

      {/* 이벤트 리스트 플로팅 버튼 */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setShowEventList(!showEventList)}
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          size="icon"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* 이벤트 리스트 패널 */}
      {showEventList && (
        <div className="fixed bottom-24 right-6 w-80 max-h-96 bg-white rounded-lg shadow-xl border border-gray-200 z-40 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">이벤트 목차</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEventList(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              시간순으로 정렬된 이벤트 목록
            </p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {getSortedEvents().map((event, index) => (
              <div
                key={event.id}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedEvent === event.id ? "bg-blue-50 border-blue-200" : ""
                }`}
                onClick={() => {
                  navigateToEvent(event.id);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: event.color }}
                      />
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {event.title}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">
                        {timeColumns.find((ch) => ch.id === event.time)?.name ||
                          "Unknown"}
                      </span>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs text-gray-400">
                        위치: {Math.round(event.x)}, {Math.round(event.y)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">아직 이벤트가 없습니다.</p>
                <p className="text-xs mt-1">이벤트를 추가해보세요!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 미니맵 */}
      {showMinimap && (
        <Minimap
          timeColumns={timeColumns}
          events={events}
          panTransform={panTransform}
          onPanChange={handlePanChange}
          columnWidth={timelineSettings.columnWidth}
          viewportDimensions={dimensions}
          onClose={() => setShowMinimap(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden timeline-container">
        {/* Timeline Canvas */}
        <div className="flex-1 relative">
          <TimelineCanvas
            chapters={timeColumns}
            events={events}
            edges={edges}
            onEventMove={handleEventMove}
            onEventClick={handleEventClick}
            onEdgeClick={handleEdgeClick}
            selectedEvent={selectedEvent}
            firstSelectedEvent={firstSelectedEvent}
            connectionMode={connectionMode}
            onNotesDrop={handleNotesDrop}
            searchResults={getSearchResults()}
            currentSearchIndex={currentSearchIndex}
            columnWidth={timelineSettings.columnWidth}
            panTransform={panTransform}
            onPanChange={handlePanChange}
          />
        </div>

        {/* Notes Panel */}
        {showNotesPanel && (
          <NotesPanel
            onClose={() => setShowNotesPanel(false)}
            onEventDelete={handleEventDelete}
            selectedEvent={selectedEvent}
            events={events}
            setEvents={setEvents}
          />
        )}

        {/* Event Edit Panel */}
        {showEventEdit && selectedEvent && (
          <EventEditPanel
            isOpen={showEventEdit}
            onClose={() => setShowEventEdit(false)}
            event={events.find((e) => e.id === selectedEvent)!}
            onEventUpdate={(updatedEvent) => {
              setEvents((prev) =>
                prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
              );
            }}
            onEventDelete={handleEventDelete}
          />
        )}
      </div>
      {showSettings && (
        <SettingsDialog
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={timelineSettings}
          onSettingsChange={setTimelineSettings}
          events={events}
          onEventsChange={setEvents}
        />
      )}
    </>
  );
}
