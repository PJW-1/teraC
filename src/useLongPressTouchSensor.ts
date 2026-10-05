import { useLayoutEffect } from 'react';
import type { FluidDragActions, PreDragActions, SensorAPI } from '@hello-pangea/dnd';

// --- 길게 눌러야 드래그가 시작되는 터치 센서 ---
// @hello-pangea/dnd 기본 터치 센서(useTouchSensor)와 같은 동작이지만,
// 기본 120ms는 스크롤하려고 손가락을 잠깐 대기만 해도 드래그가 시작돼서 시간을 늘렸다.
const LONG_PRESS_MS = 400;
// 누르고 있는 동안 이 거리(px) 안의 손 떨림은 허용한다 (기본 마우스 센서와 같은 5px)
const PRESS_MOVE_TOLERANCE = 5;
const FORCE_PRESS_THRESHOLD = 0.15;

type Point = { x: number; y: number };
type Phase =
  | { type: 'IDLE' }
  | { type: 'PENDING'; point: Point; actions: PreDragActions; longPressTimerId: number }
  | { type: 'DRAGGING'; actions: FluidDragActions; hasMoved: boolean };

type Binding = { eventName: string; fn: (event: Event) => void; options?: AddEventListenerOptions };

const IDLE: Phase = { type: 'IDLE' };

function bindWindowEvents(bindings: Binding[], shared: AddEventListenerOptions) {
  const unbinds = bindings.map(({ eventName, fn, options }) => {
    const merged = { ...shared, ...options };
    window.addEventListener(eventName, fn, merged);
    return () => window.removeEventListener(eventName, fn, merged);
  });
  return () => unbinds.forEach(unbind => unbind());
}

export function useLongPressTouchSensor(api: SensorAPI) {
  useLayoutEffect(() => {
    let phase: Phase = IDLE;
    let unbind = () => {};

    const listenForTouchStart = () => {
      unbind = bindWindowEvents([{ eventName: 'touchstart', fn: onTouchStart }], { capture: true, passive: false });
    };

    const stop = () => {
      if (phase.type === 'IDLE') return;
      if (phase.type === 'PENDING') clearTimeout(phase.longPressTimerId);
      phase = IDLE;
      unbind();
      listenForTouchStart();
    };

    const cancel = () => {
      const current = phase;
      stop();
      if (current.type === 'DRAGGING') current.actions.cancel({ shouldBlockNextClick: true });
      if (current.type === 'PENDING') current.actions.abort();
    };

    const startDragging = () => {
      if (phase.type !== 'PENDING') return;
      phase = { type: 'DRAGGING', actions: phase.actions.fluidLift(phase.point), hasMoved: false };
    };

    const onTouchMove = (event: Event) => {
      const touch = (event as TouchEvent).touches[0];
      if (phase.type === 'PENDING') {
        const moved = touch ? Math.hypot(touch.clientX - phase.point.x, touch.clientY - phase.point.y) : Infinity;
        // 손 떨림보다 크게 움직이면 스크롤로 보고 드래그 대기를 취소한다
        if (moved > PRESS_MOVE_TOLERANCE) cancel();
        return;
      }
      if (phase.type !== 'DRAGGING' || !touch) {
        cancel();
        return;
      }
      phase.hasMoved = true;
      event.preventDefault();
      phase.actions.move({ x: touch.clientX, y: touch.clientY });
    };

    const onTouchEnd = (event: Event) => {
      if (phase.type !== 'DRAGGING') {
        cancel();
        return;
      }
      event.preventDefault();
      phase.actions.drop({ shouldBlockNextClick: true });
      stop();
    };

    const onTouchCancel = (event: Event) => {
      if (phase.type === 'DRAGGING') event.preventDefault();
      cancel();
    };

    const onTouchForceChange = (event: Event) => {
      if (phase.type === 'IDLE') return;
      const touch = (event as TouchEvent).touches[0];
      if (!touch || touch.force < FORCE_PRESS_THRESHOLD) return;
      const shouldRespect = phase.actions.shouldRespectForcePress();
      if (phase.type === 'PENDING') {
        if (shouldRespect) cancel();
        return;
      }
      if (shouldRespect && !phase.hasMoved) {
        cancel();
        return;
      }
      event.preventDefault();
    };

    const onKeyDown = (event: Event) => {
      if (phase.type === 'DRAGGING' && (event as KeyboardEvent).key === 'Escape') event.preventDefault();
      cancel();
    };

    const bindPressEvents = () => {
      unbind = bindWindowEvents([
        { eventName: 'touchmove', fn: onTouchMove, options: { capture: false } },
        { eventName: 'touchend', fn: onTouchEnd },
        { eventName: 'touchcancel', fn: onTouchCancel },
        { eventName: 'touchforcechange', fn: onTouchForceChange },
        { eventName: 'orientationchange', fn: cancel },
        { eventName: 'resize', fn: cancel },
        { eventName: 'contextmenu', fn: event => event.preventDefault() },
        { eventName: 'keydown', fn: onKeyDown },
        { eventName: 'visibilitychange', fn: cancel },
      ], { capture: true, passive: false });
    };

    function onTouchStart(event: Event) {
      if (event.defaultPrevented) return;
      const draggableId = api.findClosestDraggableId(event);
      if (!draggableId) return;
      const actions = api.tryGetLock(draggableId, stop, { sourceEvent: event });
      if (!actions) return;
      const touch = (event as TouchEvent).touches[0];
      unbind();
      phase = {
        type: 'PENDING',
        point: { x: touch.clientX, y: touch.clientY },
        actions,
        longPressTimerId: window.setTimeout(startDragging, LONG_PRESS_MS),
      };
      bindPressEvents();
    }

    listenForTouchStart();
    // iOS Safari는 touchstart 전에 등록된 non-passive touchmove 리스너가 있어야
    // 드래그 중에 스크롤을 막을 수 있다 (기본 터치 센서와 같은 처리)
    const unbindWebkitHack = bindWindowEvents([{ eventName: 'touchmove', fn: () => {} }], { capture: false, passive: false });

    return () => {
      unbind();
      unbindWebkitHack();
      if (phase.type === 'PENDING') clearTimeout(phase.longPressTimerId);
      phase = IDLE;
    };
  }, [api]);
}
