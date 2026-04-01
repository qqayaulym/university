import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Filter, Clock, User, Tag, Search, ChevronDown } from 'lucide-react';
import Calendar from '../components/Calendar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import StatusMessage from '../components/ui/StatusMessage';
import '../styles/courses.css';
import api from '../api/axios';
import { useI18n } from '../contexts/I18nContext';

const CoursesPage = () => {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [courses, filters, selectedDate]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/courses/with-status');
      setCourses(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Курстарды жүктеу қатесі');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...courses];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(course => course.status === filters.status);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(course => 
        course.name.toLowerCase().includes(searchLower) ||
        course.bio.toLowerCase().includes(searchLower) ||
        course.author.toLowerCase().includes(searchLower)
      );
    }

    // Date filter
    if (selectedDate) {
      filtered = filtered.filter(course => {
        if (course.start_at) {
          const courseDate = new Date(course.start_at).toISOString().split('T')[0];
          return courseDate === selectedDate;
        }
        return false;
      });
    }

    // Date range filter
    if (filters.dateRange) {
      const today = new Date();
      let startDate, endDate;

      switch (filters.dateRange) {
        case 'today':
          startDate = endDate = today;
          break;
        case 'week':
          startDate = today;
          endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = today;
          endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          break;
      }

      if (startDate && endDate) {
        filtered = filtered.filter(course => {
          if (course.start_at) {
            const courseDate = new Date(course.start_at);
            return courseDate >= startDate && courseDate <= endDate;
          }
          return false;
        });
      }
    }

    setFilteredCourses(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'kk' ? 'kk-KZ' : lang === 'ru' ? 'ru-RU' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString(lang === 'kk' ? 'kk-KZ' : lang === 'ru' ? 'ru-RU' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      my_created: { color: 'blue', text: 'Менің курсым' },
      my_member: { color: 'green', text: 'Қатысушымын' },
      available: { color: 'gray', text: 'Қол жетімді' }
    };
    
    const badge = badges[status] || badges.available;
    return (
      <span className={`status-badge status-badge-${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const isUpcoming = (course) => {
    if (!course.start_at) return false;
    return new Date(course.start_at) > new Date();
  };

  const isDeadlineNear = (course) => {
    if (!course.deadline) return false;
    const deadline = new Date(course.deadline);
    const now = new Date();
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  if (loading) return <Loader />;
  if (error) return <StatusMessage type="error" message={error} />;

  return (
    <div className="courses-page">
      <div className="courses-header">
        <h1>Курстар</h1>
        <div className="courses-actions">
          <Button
            variant="outline"
            onClick={() => setShowCalendar(!showCalendar)}
            className="calendar-toggle"
          >
            <Calendar size={20} />
            {showCalendar ? 'Күнтізбені жасыру' : 'Күнтізбені көрсету'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="courses-filters">
        <div className="filter-controls">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Курстарды іздеу..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="search-input"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="filter-toggle"
          >
            <Filter size={20} />
            Сүзгілер
            <ChevronDown size={16} className={`chevron ${showFilters ? 'open' : ''}`} />
          </Button>
        </div>

        {showFilters && (
          <div className="filter-options">
            <div className="filter-group">
              <label>Статус:</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="filter-select"
              >
                <option value="all">Барлығы</option>
                <option value="my_created">Менің курстарым</option>
                <option value="my_member">Қатысушымын</option>
                <option value="available">Қол жетімді</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Кезең:</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="filter-select"
              >
                <option value="">Барлық уақыт</option>
                <option value="today">Бүгін</option>
                <option value="week">Апта</option>
                <option value="month">Ай</option>
              </select>
            </div>

            {selectedDate && (
              <div className="filter-group">
                <label>Таңдалған күн:</label>
                <div className="selected-date">
                  {formatDate(selectedDate)}
                  <button
                    onClick={() => setSelectedDate('')}
                    className="clear-date"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Calendar */}
      {showCalendar && (
        <Card className="calendar-card">
          <Calendar
            courses={courses}
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate}
          />
        </Card>
      )}

      {/* Courses Grid */}
      <div className="courses-content">
        {filteredCourses.length === 0 ? (
          <div className="no-courses">
            <div className="no-courses-icon">
              <Calendar size={48} />
            </div>
            <h3>Курстар табылмады</h3>
            <p>Сүзгілерді өзгеріп көріңіз немесе жаңа курс құрыңыз</p>
          </div>
        ) : (
          <div className="courses-grid">
            {filteredCourses.map(course => (
              <Card key={course.id} className="course-card">
                <div className="course-header">
                  <div className="course-status">
                    {getStatusBadge(course.status)}
                  </div>
                  {isUpcoming(course) && (
                    <div className="course-badge upcoming">
                      <Clock size={14} />
                      Жақында
                    </div>
                  )}
                  {isDeadlineNear(course) && (
                    <div className="course-badge deadline">
                      <Tag size={14} />
                      Дедлайн жақын
                    </div>
                  )}
                </div>

                <div className="course-content">
                  <h3 className="course-title">{course.name}</h3>
                  <p className="course-description">{course.bio}</p>
                  
                  <div className="course-meta">
                    <div className="meta-item">
                      <User size={16} />
                      <span>{course.author}</span>
                    </div>
                    {course.start_at && (
                      <div className="meta-item">
                        <Calendar size={16} />
                        <span>{formatDateTime(course.start_at)}</span>
                      </div>
                    )}
                    {course.deadline && (
                      <div className="meta-item deadline">
                        <Clock size={16} />
                        <span>Дедлайн: {formatDate(course.deadline)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="course-actions">
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    Толығырақ
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
