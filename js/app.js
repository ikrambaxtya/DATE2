/**
 * SUNNAT RADIO CALENDAR - MAIN APPLICATION CONTROLLER (js/app.js)
 * Light Mode, Month Numbers, Geolocation, LocalStorage & Aladhan Saudi API Hijri Sync.
 */

document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const activeDayNameEl = document.getElementById('active-day-name');
    const clockHoursEl = document.getElementById('clock-hours');
    const clockMinutesEl = document.getElementById('clock-minutes');
    const clockSecondsEl = document.getElementById('clock-seconds');
    const clockAmpmEl = document.getElementById('clock-ampm');
    const timePeriodIndicatorEl = document.getElementById('time-period-indicator');
    const clockFullDateSummaryEl = document.getElementById('clock-full-date-summary');

    // Calendar Cards
    // 1. Hijri
    const hijriDayNumEl = document.getElementById('hijri-day-num');
    const hijriMonthNameEl = document.getElementById('hijri-month-name');
    const hijriYearNumEl = document.getElementById('hijri-year-num');
    const hijriFullStrEl = document.getElementById('hijri-full-str');
    const hijriOffsetValEl = document.getElementById('hijri-offset-val');
    const hijriMinusBtn = document.getElementById('hijri-minus-btn');
    const hijriPlusBtn = document.getElementById('hijri-plus-btn');
    const hijriMonthNumPill = document.getElementById('hijri-month-num-pill');

    // 2. Kurdish
    const kurdishDayNumEl = document.getElementById('kurdish-day-num');
    const kurdishMonthNameEl = document.getElementById('kurdish-month-name');
    const kurdishYearNumEl = document.getElementById('kurdish-year-num');
    const kurdishFullStrEl = document.getElementById('kurdish-full-str');
    const kurdishSeasonEl = document.getElementById('kurdish-season');
    const kurdishMonthNumPill = document.getElementById('kurdish-month-num-pill');

    // 3. Gregorian
    const gregorianDayNumEl = document.getElementById('gregorian-day-num');
    const gregorianMonthNameEl = document.getElementById('gregorian-month-name');
    const gregorianYearNumEl = document.getElementById('gregorian-year-num');
    const gregorianFullStrEl = document.getElementById('gregorian-full-str');
    const gregorianDayOfYearEl = document.getElementById('gregorian-day-of-year');
    const gregorianMonthNumPill = document.getElementById('gregorian-month-num-pill');

    // Modal DOM
    const monthsModal = document.getElementById('months-modal');
    const modalCalendarTitle = document.getElementById('modal-calendar-title');
    const monthsGridContainer = document.getElementById('months-grid-container');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const viewMonthsBtns = document.querySelectorAll('.view-months-btn');

    // Controls & Audio
    const copyDateBtn = document.getElementById('copy-date-btn');
    const toastNotification = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');

    const audioToggleBtn = document.getElementById('audio-toggle-btn');
    const livePlayerBar = document.getElementById('live-player-bar');
    const radioAudioElement = document.getElementById('radio-audio-element');
    const playPauseStreamBtn = document.getElementById('play-pause-stream-btn');
    const playIcon = document.getElementById('play-icon');

    // Prayer Times & Geolocation
    const citySelectEl = document.getElementById('city-select');
    const geoLocationBtn = document.getElementById('geo-location-btn');
    const nextPrayerNameEl = document.getElementById('next-prayer-name');
    const nextPrayerTimerEl = document.getElementById('next-prayer-timer');

    const prayerBoxes = {
        fajr: document.getElementById('prayer-fajr'),
        sunrise: document.getElementById('prayer-sunrise'),
        dhuhr: document.getElementById('prayer-dhuhr'),
        asr: document.getElementById('prayer-asr'),
        maghrib: document.getElementById('prayer-maghrib'),
        isha: document.getElementById('prayer-isha')
    };

    let selectedCity = 'Hawler';

    /**
     * LocalStorage Helper Functions
     */
    function loadSavedPreferences() {
        try {
            const savedCity = localStorage.getItem('sunnat_selected_city');
            if (savedCity && PrayerEngine.cities[savedCity]) {
                selectedCity = savedCity;
                if (citySelectEl) citySelectEl.value = savedCity;
            }

            const savedOffset = localStorage.getItem('sunnat_hijri_offset');
            if (savedOffset !== null) {
                const offsetVal = parseInt(savedOffset, 10);
                if (!isNaN(offsetVal)) {
                    CalendarEngine.setHijriOffset(offsetVal);
                }
            }
        } catch (e) {
            console.warn('LocalStorage error:', e);
        }
    }

    function saveCityPreference(cityKey) {
        try {
            localStorage.setItem('sunnat_selected_city', cityKey);
        } catch (e) {
            console.warn('LocalStorage save error:', e);
        }
    }

    function saveHijriOffsetPreference(offsetVal) {
        try {
            localStorage.setItem('sunnat_hijri_offset', offsetVal);
        } catch (e) {
            console.warn('LocalStorage save error:', e);
        }
    }

    function showToast(msg) {
        toastMessage.textContent = msg;
        toastNotification.classList.add('show');
        setTimeout(() => {
            toastNotification.classList.remove('show');
        }, 3200);
    }

    /**
     * Update All Dates & Month Number Badges
     */
    function updateDateDisplays(currentDate) {
        const dateObj = currentDate || ClockEngine.getBaghdadTime();
        const formatNum = CalendarEngine.formatNumber;

        // 1. Day of Week
        const dayName = CalendarEngine.getDayOfWeekKurdish(dateObj);
        activeDayNameEl.textContent = dayName;

        // 2. Hijri Date
        const hijriData = CalendarEngine.getHijriDate(dateObj);
        hijriDayNumEl.textContent = hijriData.formattedDay;
        hijriMonthNameEl.textContent = hijriData.monthName;
        hijriYearNumEl.textContent = `${hijriData.formattedYear} هـ`;
        hijriFullStrEl.textContent = hijriData.fullString;
        if (hijriMonthNumPill) hijriMonthNumPill.textContent = `مانگی ${hijriData.formattedMonthNumber}`;

        const offset = CalendarEngine.getHijriOffset();
        const offsetText = offset === 0 ? 'ڕێکخستن' : (offset > 0 ? `+${offset}` : `${offset}`);
        hijriOffsetValEl.textContent = formatNum(offsetText);

        // 3. Kurdish Date
        const kurdishData = CalendarEngine.getKurdishDate(dateObj);
        kurdishDayNumEl.textContent = kurdishData.formattedDay;
        kurdishMonthNameEl.textContent = kurdishData.monthName;
        kurdishYearNumEl.textContent = `${kurdishData.formattedYear} کوردی`;
        kurdishFullStrEl.textContent = kurdishData.fullString;
        kurdishSeasonEl.innerHTML = `<i class="fa-solid ${kurdishData.seasonIcon}"></i> ${kurdishData.season}`;
        if (kurdishMonthNumPill) kurdishMonthNumPill.textContent = `مانگی ${kurdishData.formattedMonthNumber}`;

        // 4. Gregorian Date
        const gregorianData = CalendarEngine.getGregorianDate(dateObj);
        gregorianDayNumEl.textContent = gregorianData.formattedDay;
        gregorianMonthNameEl.textContent = gregorianData.monthNameKurdish;
        gregorianYearNumEl.textContent = `${gregorianData.formattedYear} زاینی`;
        gregorianFullStrEl.textContent = gregorianData.formattedStandardString;
        gregorianDayOfYearEl.textContent = `ڕۆژی ${gregorianData.formattedDayOfYear}ی ساڵ`;
        if (gregorianMonthNumPill) gregorianMonthNumPill.textContent = `مانگی ${gregorianData.formattedMonthNumber}`;

        // Clock Summary
        clockFullDateSummaryEl.textContent = `${dayName}، ${hijriData.fullString}`;
    }

    // Register callback for live Aladhan API Hijri update
    CalendarEngine.setOnHijriUpdateListener(function(updatedHijri) {
        updateDateDisplays(ClockEngine.getBaghdadTime());
    });

    /**
     * Update Clock UI
     */
    function updateClockUI(timeData) {
        const formatNum = CalendarEngine.formatNumber;

        clockHoursEl.textContent = formatNum(timeData.hoursFormatted);
        clockMinutesEl.textContent = formatNum(timeData.minutesFormatted);
        clockSecondsEl.textContent = formatNum(timeData.secondsFormatted);
        clockAmpmEl.textContent = timeData.ampm;
        timePeriodIndicatorEl.textContent = timeData.periodKurdish;

        updateDateDisplays(timeData.dateObject);
        updatePrayerTimes(timeData.dateObject);
    }

    /**
     * Update Prayer Times UI
     */
    function updatePrayerTimes(currentDate) {
        const info = PrayerEngine.getNextPrayerInfo(selectedCity, currentDate);
        const formatNum = CalendarEngine.formatNumber;

        const times = info.times;
        for (const prayerKey in times) {
            if (prayerBoxes[prayerKey]) {
                const timeEl = prayerBoxes[prayerKey].querySelector('.prayer-time');
                const raw12h = PrayerEngine.format12HourKurdish(times[prayerKey]);
                const [hh, mm] = raw12h.split(':');
                timeEl.textContent = `${formatNum(hh)}:${formatNum(mm)}`;
                prayerBoxes[prayerKey].classList.remove('active-prayer');
            }
        }

        if (info.nextPrayer && prayerBoxes[info.nextPrayer.id]) {
            prayerBoxes[info.nextPrayer.id].classList.add('active-prayer');
            nextPrayerNameEl.textContent = info.nextPrayer.name;
        }

        const [cH, cM, cS] = info.countdownString.split(':');
        nextPrayerTimerEl.textContent = `${formatNum(cH)}:${formatNum(cM)}:${formatNum(cS)}`;
    }

    /**
     * Open 12-Month Calendar Overview Modal
     */
    function openMonthsModal(calendarType) {
        const formatNum = CalendarEngine.formatNumber;
        const bTime = ClockEngine.getBaghdadTime();
        monthsGridContainer.innerHTML = '';

        let titleText = '';
        let monthsList = [];
        let activeMonthNum = 1;

        if (calendarType === 'hijri') {
            titleText = 'تەواوی مانگەکانی کۆچی';
            monthsList = CalendarEngine.getAllHijriMonths();
            activeMonthNum = CalendarEngine.getHijriDate(bTime).monthNumber;
        } else if (calendarType === 'kurdish') {
            titleText = 'تەواوی مانگەکانی کوردی';
            monthsList = CalendarEngine.getAllKurdishMonths();
            activeMonthNum = CalendarEngine.getKurdishDate(bTime).monthNumber;
        } else if (calendarType === 'gregorian') {
            titleText = 'تەواوی مانگەکانی زاینی';
            monthsList = CalendarEngine.getAllGregorianMonths();
            activeMonthNum = CalendarEngine.getGregorianDate(bTime).monthNumber;
        }

        modalCalendarTitle.textContent = titleText;

        monthsList.forEach((m) => {
            const isActive = m.monthNum === activeMonthNum;
            const cardEl = document.createElement('div');
            cardEl.className = `month-item-card ${isActive ? 'active-month-card' : ''}`;

            const daysText = m.daysCount ? `${formatNum(m.daysCount)} ڕۆژ` : '';
            const extraText = m.season ? `${m.season}` : daysText;

            cardEl.innerHTML = `
                <div class="month-item-top">
                    <span class="month-item-name">${m.name}</span>
                    <span class="month-item-badge">مانگی ${formatNum(m.monthNum)}</span>
                </div>
                <div class="month-item-info">
                    ${extraText} ${isActive ? '• <strong style="color:var(--accent-gold-dark);">مانگی ئێستا</strong>' : ''}
                </div>
            `;
            monthsGridContainer.appendChild(cardEl);
        });

        monthsModal.classList.remove('hidden');
    }

    function closeMonthsModal() {
        monthsModal.classList.add('hidden');
    }

    // Modal Event Listeners
    viewMonthsBtns.forEach((btn) => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const calType = btn.getAttribute('data-calendar');
            openMonthsModal(calType);
        });
    });

    // Card click triggers
    const hijriTrigger = document.getElementById('hijri-card-trigger');
    const kurdishTrigger = document.getElementById('kurdish-card-trigger');
    const gregorianTrigger = document.getElementById('gregorian-card-trigger');

    if (hijriTrigger) hijriTrigger.addEventListener('click', (e) => { if (!e.target.closest('button')) openMonthsModal('hijri'); });
    if (kurdishTrigger) kurdishTrigger.addEventListener('click', (e) => { if (!e.target.closest('button')) openMonthsModal('kurdish'); });
    if (gregorianTrigger) gregorianTrigger.addEventListener('click', (e) => { if (!e.target.closest('button')) openMonthsModal('gregorian'); });

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeMonthsModal);
    if (monthsModal) {
        monthsModal.addEventListener('click', function (e) {
            if (e.target === monthsModal) closeMonthsModal();
        });
    }

    /**
     * Geolocation Auto-Detection
     */
    function detectUserLocation() {
        if ("geolocation" in navigator) {
            showToast('دۆزینەوەی شوێنەکەت لە ئارادایە...');
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const result = PrayerEngine.getNearestCity(lat, lng);
                    selectedCity = result.key;
                    citySelectEl.value = result.key;
                    saveCityPreference(result.key);
                    updatePrayerTimes(ClockEngine.getBaghdadTime());
                    showToast(`شوێنەکەت دیاری کرا: شاری ${result.name}`);
                },
                function (error) {
                    showToast('نەتوانرا شوێنەکەت دیاری باری: شاری هەڵبژێردراو وەکو خۆی مایەوە');
                },
                { timeout: 8000 }
            );
        } else {
            showToast('وێبگەڕەکەت پشتیوانیی دیاریکردنی شوێن ناکات');
        }
    }

    // Geolocation Button Event
    if (geoLocationBtn) {
        geoLocationBtn.addEventListener('click', detectUserLocation);
    }

    // Hijri Offset Adjusters
    hijriMinusBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const curr = CalendarEngine.getHijriOffset();
        const newOffset = curr - 1;
        CalendarEngine.setHijriOffset(newOffset);
        saveHijriOffsetPreference(newOffset);
        updateDateDisplays();
    });

    hijriPlusBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const curr = CalendarEngine.getHijriOffset();
        const newOffset = curr + 1;
        CalendarEngine.setHijriOffset(newOffset);
        saveHijriOffsetPreference(newOffset);
        updateDateDisplays();
    });

    // City Selector Event
    citySelectEl.addEventListener('change', function (e) {
        selectedCity = e.target.value;
        saveCityPreference(selectedCity);
        updatePrayerTimes(ClockEngine.getBaghdadTime());
    });

    // Copy Date Event
    copyDateBtn.addEventListener('click', function () {
        const bTime = ClockEngine.getBaghdadTime();
        const day = CalendarEngine.getDayOfWeekKurdish(bTime);
        const hijri = CalendarEngine.getHijriDate(bTime).fullString;
        const kurdish = CalendarEngine.getKurdishDate(bTime).fullString;
        const gregorian = CalendarEngine.getGregorianDate(bTime).formattedStandardString;

        const copyText = `ڕۆژی ${day} | کۆچی: ${hijri} | کوردی: ${kurdish} | زاینی: ${gregorian} - ڕادیۆی سوننەت`;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(copyText).then(() => {
                showToast('زانیاری بەرواری ئەمڕۆ کۆپی کرا!');
            });
        } else {
            const dummy = document.createElement('textarea');
            dummy.value = copyText;
            document.body.appendChild(dummy);
            dummy.select();
            document.execCommand('copy');
            document.body.removeChild(dummy);
            showToast('زانیاری بەرواری ئەمڕۆ کۆپی کرا!');
        }
    });

    // Audio Bar Toggle
    audioToggleBtn.addEventListener('click', function () {
        livePlayerBar.classList.toggle('hidden');
    });

    // Audio Play/Pause
    playPauseStreamBtn.addEventListener('click', function () {
        if (radioAudioElement.paused) {
            radioAudioElement.play().then(() => {
                playIcon.classList.remove('fa-play');
                playIcon.classList.add('fa-pause');
                showToast('پەخشی ڕاستەوخۆی دەنگیی دەستی پێکرد');
            }).catch(() => {
                window.open('https://www.radiosunnat.net/paxsh', '_blank');
            });
        } else {
            radioAudioElement.pause();
            playIcon.classList.remove('fa-pause');
            playIcon.classList.add('fa-play');
            showToast('پەخشی دەنگی وەستێنرا');
        }
    });

    // Initialize Saved LocalStorage Preferences & Start Real-time Clock
    loadSavedPreferences();
    ClockEngine.start(updateClockUI);
});
