import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, differenceInCalendarDays } from 'date-fns';
import { FiPlus, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const generateId = () => Math.random().toString(36).substr(2, 9);
const getColor = () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 80%)`;

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState(() => {
    const now = new Date();
    const sample1 = { id: generateId(), title: "Event 1", resource: "Resource A", startDate: new Date(now.getFullYear(), now.getMonth(), 3).toISOString(), endDate: new Date(now.getFullYear(), now.getMonth(), 5).toISOString(), color: getColor() };
    const sample2 = { id: generateId(), title: "Event 2", resource: "Resource B", startDate: new Date(now.getFullYear(), now.getMonth(), 7).toISOString(), endDate: new Date(now.getFullYear(), now.getMonth(), 10).toISOString(), color: getColor() };
    const sample3 = { id: generateId(), title: "Event 3", resource: "Resource C", startDate: new Date(now.getFullYear(), now.getMonth(), 12).toISOString(), endDate: new Date(now.getFullYear(), now.getMonth(), 12).toISOString(), color: getColor() };
    const sample4 = { id: generateId(), title: "Event 4", resource: "Resource A", startDate: new Date(now.getFullYear(), now.getMonth(), 15).toISOString(), endDate: new Date(now.getFullYear(), now.getMonth(), 18).toISOString(), color: getColor() };
    const sample5 = { id: generateId(), title: "Event 5", resource: "Resource B", startDate: new Date(now.getFullYear(), now.getMonth(), 20).toISOString(), endDate: new Date(now.getFullYear(), now.getMonth(), 23).toISOString(), color: getColor() };
    const sample6 = { id: generateId(), title: "Event 6", resource: "Resource C", startDate: new Date(now.getFullYear(), now.getMonth(), 25).toISOString(), endDate: new Date(now.getFullYear(), now.getMonth(), 28).toISOString(), color: getColor() };
    return [sample1, sample2, sample3, sample4, sample5, sample6];
  });
  const [resources, setResources] = useState([
    'Resource A',
    'Resource B',
    'Resource C',
    'Resource D',
    'Resource E',
    'Resource F',
    'Resource G',
    'Resource H',
    'Resource I',
    'Resource J'
  ]);
  useEffect(() => { localStorage.setItem('calendarEvents', JSON.stringify(events)); }, [events]);
  const daysInMonth = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
  const cellWidth = 80;
  const rowHeight = 60;
  const [draggingEvent, setDraggingEvent] = useState(null);
  const [resizingEvent, setResizingEvent] = useState(null);
  useEffect(() => {
    const handleMouseMoveGlobal = (e) => {
      if (draggingEvent) {
        const deltaX = e.clientX - draggingEvent.initialX;
        const deltaY = e.clientY - draggingEvent.initialY;
        const deltaCells = Math.round(deltaX / cellWidth);
        const deltaRows = Math.round(deltaY / rowHeight);
        setDraggingEvent(prev => ({ ...prev, deltaCells, deltaRows }));
      }
      if (resizingEvent) {
        const deltaX = e.clientX - resizingEvent.initialX;
        const deltaCells = Math.round(deltaX / cellWidth);
        setResizingEvent(prev => ({ ...prev, deltaCells }));
      }
    };
    const handleMouseUpGlobal = () => {
      if (draggingEvent) {
        setEvents(prev =>
          prev.map(ev => {
            if (ev.id === draggingEvent.id) {
              let newStartIndex = draggingEvent.initialStartIndex + (draggingEvent.deltaCells || 0);
              let newEndIndex = draggingEvent.initialEndIndex + (draggingEvent.deltaCells || 0);
              newStartIndex = Math.max(0, Math.min(newStartIndex, daysInMonth.length - 1));
              newEndIndex = Math.max(0, Math.min(newEndIndex, daysInMonth.length - 1));
              let newResourceIndex = draggingEvent.initialResourceIndex + (draggingEvent.deltaRows || 0);
              newResourceIndex = Math.max(0, Math.min(newResourceIndex, resources.length - 1));
              return { ...ev, startDate: daysInMonth[newStartIndex].toISOString(), endDate: daysInMonth[newEndIndex].toISOString(), resource: resources[newResourceIndex] };
            }
            return ev;
          })
        );
        setDraggingEvent(null);
      }
      if (resizingEvent) {
        setEvents(prev =>
          prev.map(ev => {
            if (ev.id === resizingEvent.id) {
              let newEndIndex = resizingEvent.initialEndIndex + (resizingEvent.deltaCells || 0);
              newEndIndex = Math.max(0, Math.min(newEndIndex, daysInMonth.length - 1));
              return { ...ev, endDate: daysInMonth[newEndIndex].toISOString() };
            }
            return ev;
          })
        );
        setResizingEvent(null);
      }
    };
    document.addEventListener('mousemove', handleMouseMoveGlobal);
    document.addEventListener('mouseup', handleMouseUpGlobal);
    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobal);
      document.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [draggingEvent, resizingEvent, daysInMonth, cellWidth, rowHeight, resources]);
  const getDateIndex = (dateStr) => {
    const d = new Date(dateStr);
    const formatted = format(d, 'yyyy-MM-dd');
    return daysInMonth.findIndex(day => format(day, 'yyyy-MM-dd') === formatted);
  };
  const generateRandomEvent = () => {
    const randomResource = resources[Math.floor(Math.random() * resources.length)];
    const startIndex = Math.floor(Math.random() * daysInMonth.length);
    const span = Math.floor(Math.random() * 3) + 1;
    let endIndex = startIndex + span - 1;
    if (endIndex >= daysInMonth.length) { endIndex = daysInMonth.length - 1; }
    const newEvent = {
      id: generateId(),
      title: `Random Event ${events.length + 1}`,
      resource: randomResource,
      startDate: daysInMonth[startIndex].toISOString(),
      endDate: daysInMonth[endIndex].toISOString(),
      color: getColor()
    };
    setEvents(prev => [...prev, newEvent]);
  };
  return (
    <div style={{ fontFamily: 'sans-serif', paddingTop: '80px' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: '#fff', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px', padding: '16px', borderBottom: '1px solid #ccc' }}>
        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}><FiChevronLeft /></button>
        <h2 style={{ margin: 0 }}>{format(currentDate, 'MMMM yyyy')}</h2>
        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}><FiChevronRight /></button>
        <button onClick={() => setResources([...resources, `Resource ${String.fromCharCode(65 + resources.length)}`])}><FiPlus /> Add Resource</button>
        <button onClick={generateRandomEvent} style={{ marginLeft: 'auto' }}>Generate Random Event</button>
      </div>
      <div style={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
        <div style={{ width: '320px', overflowY: 'auto', borderRight: '1px solid #ccc' }}>
          {resources.map(resource => (
            <div key={resource} style={{ height: `${rowHeight}px`, display: 'flex', alignItems: 'center', padding: '4px', borderBottom: '1px solid #ccc' }}>
              {resource}
            </div>
          ))}
        </div>
        <div style={{ flexGrow: 1, overflowX: 'auto' }}>
          <div style={{ display: 'flex' }}>
            {daysInMonth.map(day => (
              <div key={day.toISOString()} style={{ width: `${cellWidth}px`, borderRight: '1px solid #eee', padding: '4px', boxSizing: 'border-box', textAlign: 'center' }}>
                <div>{format(day, 'EEE')}</div>
                <div>{format(day, 'd')}</div>
              </div>
            ))}
          </div>
          <div>
            {resources.map((resource, resourceIndex) => (
              <div key={resource} style={{ position: 'relative', height: `${rowHeight}px`, borderBottom: '1px solid #ccc' }}>
                <div style={{ display: 'flex', height: '100%' }}>
                  {daysInMonth.map(day => (
                    <div key={day.toISOString()} style={{ width: `${cellWidth}px`, borderRight: '1px solid #eee', height: '100%' }} />
                  ))}
                </div>
                {events.filter(ev => ev.resource === resource).map(ev => {
                  let startIndex = getDateIndex(ev.startDate);
                  let endIndex = getDateIndex(ev.endDate);
                  if (startIndex === -1) startIndex = 0;
                  if (endIndex === -1) endIndex = daysInMonth.length - 1;
                  const span = endIndex - startIndex + 1;
                  const leftPercent = (startIndex / daysInMonth.length) * 100;
                  const widthPercent = (span / daysInMonth.length) * 100;
                  return (
                    <div key={ev.id} style={{
                      position: 'absolute',
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      top: '8px',
                      bottom: '8px',
                      backgroundColor: ev.color,
                      borderRadius: '4px',
                      padding: '4px',
                      cursor: 'move',
                      userSelect: 'none',
                      overflow: 'hidden'
                    }}
                      onMouseDown={(e) => {
                        if (e.target.classList.contains('resizer')) return;
                        const sIndex = getDateIndex(ev.startDate);
                        const eIndex = getDateIndex(ev.endDate);
                        const resourceIdx = resources.findIndex(r => r === ev.resource);
                        setDraggingEvent({
                          id: ev.id,
                          initialX: e.clientX,
                          initialY: e.clientY,
                          initialStartIndex: sIndex,
                          initialEndIndex: eIndex,
                          initialResourceIndex: resourceIdx,
                          deltaCells: 0,
                          deltaRows: 0
                        });
                      }}>
                      <div style={{ fontWeight: 'bold' }}>{ev.title}</div>
                      <div style={{ fontSize: '0.8em' }}>
                        {format(new Date(ev.startDate), 'MMM d')} - {format(new Date(ev.endDate), 'MMM d')}
                      </div>
                      <button onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this event?')) {
                          setEvents(events.filter(item => item.id !== ev.id));
                        }
                      }} style={{
                        position: 'absolute',
                        top: '2px',
                        right: '20px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                      }}>
                        <FiTrash2 />
                      </button>
                      <div className="resizer" style={{
                        position: 'absolute',
                        right: '0',
                        top: 0,
                        bottom: 0,
                        width: '10px',
                        cursor: 'ew-resize'
                      }} onMouseDown={(e) => {
                        e.stopPropagation();
                        const eIndex = getDateIndex(ev.endDate);
                        setResizingEvent({
                          id: ev.id,
                          initialX: e.clientX,
                          initialEndIndex: eIndex,
                          deltaCells: 0
                        });
                      }} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
