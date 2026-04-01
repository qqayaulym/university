import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import '../styles/calendar.css';

const Calendar = ({ courses = [], onDateSelect, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');

  const monthNames = {
    kk: ['Қаңтар', 'Ақпан', 'Наурыз', 'Сәуір', 'Мамыр', 'Маусым', 
           'Шілде', 'Тамыз', 'Қыркүйек', 'Қазан', 'Қараша', 'Желтоқсан'],
    ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
           'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 
           'July', 'August', 'September', 'October', 'November', 'December']
  };

  const weekDays = {
    kk: ['Жс', 'Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сб'],
    ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  };

  const lang = localStorage.getItem('language') || 'kk';

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const coursesByDate = useMemo(() => {
    const grouped = {};
    courses.forEach(course => {
      if (course.start_at) {
        const date = new Date(course.start_at).toISOString().split('T')[0];
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(course);
      }
      if (course.deadline) {
        const date = new Date(course.deadline).toISOString().split('T')[0];
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push({ ...course, isDeadline: true });
      }
    });
    return grouped;
  }, [courses]);

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (day) => {
    if (!day) return;
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDateSelect && onDateSelect(dateStr);
  };

  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day) => {
    if (!day || !selectedDate) return false;
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr === selectedDate;
  };

  const getCoursesForDay = (day) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return coursesByDate[dateStr] || [];
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button onClick={() => navigateMonth('prev')} className="calendar-nav-btn">
            <ChevronLeft size={20} />
          </button>
          <h3 className="calendar-title">
            {monthNames[lang][currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button onClick={() => navigateMonth('next')} className="calendar-nav-btn">
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="calendar-actions">
          <CalendarIcon size={20} className="calendar-icon" />
        </div>
      </div>

      <div className="calendar-grid">
        {/* Week day headers */}
        {weekDays[lang].map((day, index) => (
          <div key={index} className="calendar-weekday">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {generateCalendarDays().map((day, index) => {
          const dayCourses = getCoursesForDay(day);
          const hasEvents = dayCourses.length > 0;
          const hasDeadline = dayCourses.some(course => course.isDeadline);

          return (
            <div
              key={index}
              className={`calendar-day ${
                day ? 'calendar-day-valid' : 'calendar-day-empty'
              } ${
                isToday(day) ? 'calendar-day-today' : ''
              } ${
                isSelected(day) ? 'calendar-day-selected' : ''
              } ${
                hasEvents ? 'calendar-day-has-events' : ''
              }`}
              onClick={() => handleDateClick(day)}
            >
              {day && (
                <>
                  <div className="calendar-day-number">{day}</div>
                  {hasEvents && (
                    <div className="calendar-events">
                      {dayCourses.slice(0, 3).map((course, idx) => (
                        <div
                          key={idx}
                          className={`calendar-event ${course.isDeadline ? 'calendar-event-deadline' : 'calendar-event-start'}`}
                          title={course.name}
                        >
                          {course.isDeadline ? '🔴' : '🟢'}
                        </div>
                      ))}
                      {dayCourses.length > 3 && (
                        <div className="calendar-event-more">
                          +{dayCourses.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-event calendar-event-start"></div>
          <span>Курс басталады</span>
        </div>
        <div className="legend-item">
          <div className="legend-event calendar-event-deadline"></div>
          <span>Дедлайн</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
