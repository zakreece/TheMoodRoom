document.addEventListener('DOMContentLoaded', function() {
    const homeBtn = document.getElementById('homeBtn');
    const newEntryBtn = document.getElementById('newEntryBtn');
    const homeView = document.getElementById('homeView');
    const newEntryView = document.getElementById('newEntryView');
    const flashMessages = document.getElementById('flashMessages');
    const entriesList = document.getElementById('entriesList');
    const entryForm = document.getElementById('entryForm');
    const moodSelect = document.getElementById('mood');
    const otherMoodContainer = document.getElementById('otherMoodContainer');
    const otherMoodInput = document.getElementById('otherMood');
    const calendarContainer = document.getElementById('calendarContainer');
    const liveDateTimeEl = document.getElementById('liveDateTime');
    const weatherDisplayEl = document.getElementById('weatherDisplay');
    const model = document.getElementById('model');
    const modelEntries = document.getElementById('modelEntries');
    const closeModel = document.getElementById('closeModel');
    const STORAGE_KEY = 'moodroom_entries';
  
    moodSelect.addEventListener('change', function() {
      otherMoodContainer.style.display = (this.value === 'Other') ? 'block' : 'none';
      otherMoodInput.required = (this.value === 'Other');
    });
  
    function switchView(viewName) {
      if (viewName === 'home') {
        homeView.classList.add('active');
        newEntryView.classList.remove('active');
      } else {
        newEntryView.classList.add('active');
        homeView.classList.remove('active');
      }
    }
  
    function showFlashMessage(message, type = 'success') {
      flashMessages.innerHTML = `<div class="flash ${type}">${message}</div>`;
      flashMessages.classList.add('show');
      setTimeout(() => {
        flashMessages.classList.remove('show');
        flashMessages.innerHTML = '';
      }, 3000);
    }
  
    function loadEntries() {
      const entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      entriesList.innerHTML = entries.length === 0 
        ? '<p>No entries yet. Start by adding a new entry!</p>' 
        : '';
      entries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry';
        entryDiv.innerHTML = `
          <h3>${entry.title}</h3>
          <p><strong>Mood:</strong> ${entry.mood}</p>
          <div class="entry-details" id="details-${entry.id}">
            <p>${entry.content}</p>
            <small>Posted on ${new Date(entry.date).toLocaleString()}</small>
          </div>
          <div class="entry-actions">
            <button class="toggle-btn" data-target="details-${entry.id}">Hide Details</button>
            <button class="delete-btn" data-id="${entry.id}">Delete</button>
          </div>
        `;
        entriesList.appendChild(entryDiv);
      });
      generateCalendar();
    }
  
    function toggleDetails(event) {
      if (event.target.classList.contains('toggle-btn')) {
        const targetId = event.target.getAttribute('data-target');
        const detailsDiv = document.getElementById(targetId);
        if (detailsDiv.style.display === 'none' || detailsDiv.style.display === '') {
          detailsDiv.style.display = 'block';
          event.target.textContent = 'Hide Details';
        } else {
          detailsDiv.style.display = 'none';
          event.target.textContent = 'Show Details';
        }
      }
    }
  
    function deleteEntry(event) {
      if (event.target.classList.contains('delete-btn')) {
        const entryId = event.target.getAttribute('data-id');
        let entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        entries = entries.filter(entry => entry.id != entryId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        showFlashMessage('Entry deleted successfully!', 'success');
        loadEntries();
      }
    }
  
    function handleFormSubmit(event) {
      event.preventDefault();
      const title = document.getElementById('title').value.trim();
      let mood = moodSelect.value;
      const content = document.getElementById('content').value.trim();
      if (!title || !mood || !content) {
        showFlashMessage('All fields are required!', 'error');
        return;
      }
      if (mood === 'Other') {
        const otherMood = otherMoodInput.value.trim();
        if (!otherMood) {
          showFlashMessage('Please specify your mood.', 'error');
          return;
        }
        mood = otherMood;
      }
      const newEntry = { id: Date.now(), title, mood, content, date: new Date() };
      const entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      entries.push(newEntry);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      showFlashMessage('New diary entry added!', 'success');
      entryForm.reset();
      otherMoodContainer.style.display = 'none';
      loadEntries();
      switchView('home');
    }
  
    function generateCalendar() {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      const daysInMonth = lastDayOfMonth.getDate();
      const startDay = firstDayOfMonth.getDay();
      const entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      const filledDates = new Set();
      entries.forEach(entry => {
        const entryDate = new Date(entry.date);
        if (entryDate.getFullYear() === year && entryDate.getMonth() === month) {
          filledDates.add(`${year}-${String(month+1).padStart(2,'0')}-${entryDate.getDate()}`);
        }
      });
      let calendarHTML = '';
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      daysOfWeek.forEach(day => { calendarHTML += `<div class="day header">${day}</div>`; });
      for (let i = 0; i < startDay; i++) { calendarHTML += `<div class="day empty"></div>`; }
      for (let day = 1; day <= daysInMonth; day++) {
        const monthStr = String(month + 1).padStart(2, '0');
        const formattedDateISO = `${year}-${monthStr}-${day}`;
        const formattedDateUK = `${day}/${monthStr}/${year}`;
        const filledClass = filledDates.has(formattedDateISO) ? 'filled' : '';
        calendarHTML += `<div class="day ${filledClass}" data-date="${formattedDateISO}"><span class="date-number">${formattedDateUK}</span></div>`;
      }
      calendarContainer.innerHTML = calendarHTML;
    }
  
    function updateDateTime() {
      const now = new Date();
      const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit' };
      liveDateTimeEl.textContent = now.toLocaleDateString('en-GB', options);
    }
    setInterval(updateDateTime, 1000);
    updateDateTime();
  
    function fetchWeather(latitude, longitude) {
      const API_KEY = '9bb4e9f31773147f76f13013ab7f6054';
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
      fetch(url)
        .then(response => response.json())
        .then(data => {
          const temp = Math.round(data.main.temp);
          const weatherDescription = data.weather[0].main;
          weatherDisplayEl.textContent = `Weather: ${weatherDescription}, ${temp}°C`;
        })
        .catch(err => { weatherDisplayEl.textContent = 'Weather data unavailable'; });
    }
  
    function initWeather() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => fetchWeather(position.coords.latitude, position.coords.longitude),
          () => fetchWeather(51.5074, -0.1278)
        );
      } else {
        fetchWeather(51.5074, -0.1278);
      }
    }
    initWeather();
    setInterval(initWeather, 600000);
  
    calendarContainer.addEventListener('click', function(event) {
      const dayCell = event.target.closest('.day');
      if (!dayCell || dayCell.classList.contains('header') || dayCell.classList.contains('empty')) return;
      const date = dayCell.getAttribute('data-date');
      const entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      const filtered = entries.filter(entry => {
        const d = new Date(entry.date);
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getDate()}` === date;
      });
      if (filtered.length > 0) {
        let modelHTML = '';
        filtered.forEach(entry => {
          modelHTML += `
            <div class="entry">
              <h3>${entry.title}</h3>
              <p><strong>Mood:</strong> ${entry.mood}</p>
              <div class="entry-details">
                <p>${entry.content}</p>
                <small>Posted on ${new Date(entry.date).toLocaleString()}</small>
              </div>
            </div>
            <hr>
          `;
        });
        modelEntries.innerHTML = modelHTML;
        model.style.display = 'block';
      } else {
        showFlashMessage('No entries for this date.', 'error');
      }
    });
  
    closeModel.addEventListener('click', function() {
      model.style.display = 'none';
    });
    window.addEventListener('click', function(event) {
      if (event.target === model) { model.style.display = 'none'; }
    });
  
    homeBtn.addEventListener('click', () => switchView('home'));
    newEntryBtn.addEventListener('click', () => switchView('new'));
    entryForm.addEventListener('submit', handleFormSubmit);
    entriesList.addEventListener('click', function(event) {
      toggleDetails(event);
      deleteEntry(event);
    });
  
    switchView('home');
    loadEntries();
  });
  