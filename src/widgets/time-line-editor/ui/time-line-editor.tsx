"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Plus, GripVertical, X, Edit, Archive } from "lucide-react";

interface StoryEvent {
  id: string;
  title: string;
  description: string;
  timeSlot: number; // -1이면 배치되지 않은 상태
  position: number;
}

export default function TimeLineEditor() {
  const [events, setEvents] = useState<StoryEvent[]>([
    {
      id: "1",
      title: "주인공 등장",
      description: "주인공이 평범한 일상을 보내고 있다",
      timeSlot: 0,
      position: 0,
    },
    {
      id: "2",
      title: "사건 발생",
      description: "예상치 못한 사건이 일어난다",
      timeSlot: 2,
      position: 0,
    },
    {
      id: "3",
      title: "갈등 심화",
      description: "문제가 더욱 복잡해진다",
      timeSlot: 4,
      position: 0,
    },
  ]);

  const [unplacedEvents, setUnplacedEvents] = useState<StoryEvent[]>([
    {
      id: "4",
      title: "서브 플롯",
      description: "부차적인 이야기가 전개된다",
      timeSlot: -1,
      position: 0,
    },
    {
      id: "5",
      title: "반전",
      description: "예상치 못한 반전이 일어난다",
      timeSlot: -1,
      position: 0,
    },
  ]);

  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<number | null>(null);
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<string | null>(null);
  const [draggedFromPool, setDraggedFromPool] = useState<boolean>(false);

  const timeSlots = 8;
  const maxPositions = 5;

  const addEventToPool = () => {
    const newEvent: StoryEvent = {
      id: Date.now().toString(),
      title: "새 사건",
      description: "사건 설명을 입력하세요",
      timeSlot: -1,
      position: 0,
    };
    setUnplacedEvents([...unplacedEvents, newEvent]);
    setEditingEvent(newEvent.id);
  };

  const addEvent = (timeSlot: number, position: number) => {
    const newEvent: StoryEvent = {
      id: Date.now().toString(),
      title: "새 사건",
      description: "사건 설명을 입력하세요",
      timeSlot,
      position,
    };
    setEvents([...events, newEvent]);
    setEditingEvent(newEvent.id);
  };

  const updateEvent = (id: string, updates: Partial<StoryEvent>) => {
    setEvents(
      events.map((event) =>
        event.id === id ? { ...event, ...updates } : event
      )
    );
    setUnplacedEvents(
      unplacedEvents.map((event) =>
        event.id === id ? { ...event, ...updates } : event
      )
    );
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id));
    setUnplacedEvents(unplacedEvents.filter((event) => event.id !== id));
  };

  const moveEventToPool = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (event) {
      setEvents(events.filter((e) => e.id !== eventId));
      setUnplacedEvents([
        ...unplacedEvents,
        { ...event, timeSlot: -1, position: 0 },
      ]);
    }
  };

  const moveEventToTimeline = (
    eventId: string,
    timeSlot: number,
    position: number
  ) => {
    const event = unplacedEvents.find((e) => e.id === eventId);
    if (event) {
      setUnplacedEvents(unplacedEvents.filter((e) => e.id !== eventId));
      setEvents([...events, { ...event, timeSlot, position }]);
    }
  };

  const handleDragStart = (
    e: React.DragEvent,
    eventId: string,
    fromPool = false
  ) => {
    setDraggedEvent(eventId);
    setDraggedFromPool(fromPool);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropOnTimeline = (
    e: React.DragEvent,
    timeSlot: number,
    position: number
  ) => {
    e.preventDefault();
    if (draggedEvent) {
      const existingEvent = events.find(
        (event) => event.timeSlot === timeSlot && event.position === position
      );

      if (!existingEvent || existingEvent.id === draggedEvent) {
        if (draggedFromPool) {
          moveEventToTimeline(draggedEvent, timeSlot, position);
        } else {
          updateEvent(draggedEvent, { timeSlot, position });
        }
      }
      setDraggedEvent(null);
      setDraggedFromPool(false);
    }
  };

  const handleDropOnPool = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedEvent && !draggedFromPool) {
      moveEventToPool(draggedEvent);
      setDraggedEvent(null);
      setDraggedFromPool(false);
    }
  };

  const getEventAtPosition = (timeSlot: number, position: number) => {
    return events.find(
      (event) => event.timeSlot === timeSlot && event.position === position
    );
  };

  const renderEventCard = (event: StoryEvent, fromPool = false) => (
    <Card
      key={event.id}
      className="cursor-move hover:shadow-md transition-shadow mb-3"
      draggable
      onDragStart={(e) => handleDragStart(e, event.id, fromPool)}
    >
      <CardContent className="p-3">
        {editingEvent === event.id ? (
          <div className="space-y-2">
            <Input
              value={event.title}
              onChange={(e) => updateEvent(event.id, { title: e.target.value })}
              className="text-sm font-medium"
              placeholder="사건 제목"
            />
            <Textarea
              value={event.description}
              onChange={(e) =>
                updateEvent(event.id, { description: e.target.value })
              }
              className="text-xs resize-none"
              rows={2}
              placeholder="사건 설명"
            />
            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={() => setEditingEvent(null)}
                className="text-xs h-6"
              >
                완료
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => deleteEvent(event.id)}
                className="text-xs h-6"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-sm font-medium text-gray-800 line-clamp-1">
                {event.title}
              </h3>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingEvent(event.id)}
                  className="h-5 w-5 p-0"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                {!fromPool && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveEventToPool(event.id)}
                    className="h-5 w-5 p-0"
                    title="사건 풀로 이동"
                  >
                    <Archive className="w-3 h-3" />
                  </Button>
                )}
                <GripVertical className="w-3 h-3 text-gray-400" />
              </div>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">
              {event.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full h-screen bg-gray-50 flex">
      {/* 왼쪽 사이드바 - 사건 풀 */}
      <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Archive className="w-5 h-5" />
              사건 풀
            </CardTitle>
            <p className="text-sm text-gray-600">
              배치되지 않은 사건들을 관리하세요
            </p>
          </CardHeader>
          <CardContent
            className="space-y-3 min-h-[200px] border-2 border-dashed border-gray-200 rounded-lg p-3"
            onDragOver={handleDragOver}
            onDrop={handleDropOnPool}
          >
            {unplacedEvents.map((event) => renderEventCard(event, true))}

            {unplacedEvents.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <Archive className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">사건을 여기로 드래그하거나</p>
                <p className="text-sm">새 사건을 추가하세요</p>
              </div>
            )}

            <Button
              onClick={addEventToPool}
              variant="outline"
              className="w-full border-dashed"
            >
              <Plus className="w-4 h-4 mr-2" />새 사건 추가
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 오른쪽 타임라인 */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            스토리 플롯 타임라인
          </h1>
          <p className="text-gray-600">
            시간축을 따라 스토리 사건들을 배치하고 관리하세요
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* 시간축 헤더 */}
          <div className="grid grid-cols-8 gap-4 mb-4 border-b-2 border-gray-300 pb-4">
            {Array.from({ length: timeSlots }, (_, i) => (
              <div key={i} className="text-center">
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  시간 {i + 1}
                </div>
                <div className="text-xs text-gray-500">
                  {i === 0 && "시작"}
                  {i === timeSlots - 1 && "끝"}
                  {i > 0 && i < timeSlots - 1 && `${i}단계`}
                </div>
              </div>
            ))}
          </div>

          {/* 세로선과 이벤트들 */}
          <div className="grid grid-cols-8 gap-4">
            {Array.from({ length: timeSlots }, (_, timeSlot) => (
              <div
                key={timeSlot}
                className="relative"
                onMouseEnter={() => setHoveredSlot(timeSlot)}
                onMouseLeave={() => {
                  setHoveredSlot(null);
                  setHoveredPosition(null);
                }}
              >
                {/* 세로선 */}
                <div className="absolute left-1/2 top-0 w-0.5 h-full bg-gray-300 transform -translate-x-1/2" />

                {/* 이벤트 위치들 */}
                <div className="space-y-4">
                  {Array.from({ length: maxPositions }, (_, position) => {
                    const event = getEventAtPosition(timeSlot, position);

                    return (
                      <div
                        key={position}
                        className="relative h-24 flex items-center justify-center"
                        onMouseEnter={() => setHoveredPosition(position)}
                        onDragOver={handleDragOver}
                        onDrop={(e) =>
                          handleDropOnTimeline(e, timeSlot, position)
                        }
                      >
                        {event
                          ? renderEventCard(event)
                          : hoveredSlot === timeSlot &&
                            hoveredPosition === position && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addEvent(timeSlot, position)}
                                className="w-8 h-8 rounded-full p-0 border-dashed border-2 hover:border-solid"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
