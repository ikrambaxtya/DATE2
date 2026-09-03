/**
 * SUNNAT RADIO CALENDAR - REAL-TIME CLOCK ENGINE (js/clock.js)
 * Ticking clock locked to Asia/Baghdad timezone with 100% Kurdish Sorani time indicators.
 */

const ClockEngine = (function () {
    let clockInterval = null;
    let onTickCallback = null;

    /**
     * Get current time in Asia/Baghdad timezone
     */
    function getBaghdadTime() {
        const now = new Date();
        const baghdadStr = now.toLocaleString('en-US', { timeZone: 'Asia/Baghdad' });
        return new Date(baghdadStr);
    }

    /**
     * Get Kurdish period tag
     */
    function getKurdishTimePeriod(hour) {
        if (hour >= 4 && hour < 12) return 'بەیانی';       // Morning
        if (hour >= 12 && hour < 16) return 'دوای نیوەڕۆ'; // Afternoon
        if (hour >= 16 && hour < 20) return 'ئێوارە';      // Evening
        return 'شەو';                                    // Night
    }

    /**
     * Format time components in Kurdish
     */
    function getTimeComponents() {
        const bTime = getBaghdadTime();
        let hours = bTime.getHours();
        const minutes = bTime.getMinutes();
        const seconds = bTime.getSeconds();
        const isPm = hours >= 12;

        const periodKurdish = getKurdishTimePeriod(hours);
        const ampmKurdish = isPm ? 'دوای نیوەڕۆ' : 'بەیانی';

        // Convert to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12;

        const pad = (n) => (n < 10 ? '0' + n : String(n));

        return {
            hoursRaw: hours,
            minutesRaw: minutes,
            secondsRaw: seconds,
            hoursFormatted: pad(hours),
            minutesFormatted: pad(minutes),
            secondsFormatted: pad(seconds),
            ampm: ampmKurdish,
            periodKurdish: periodKurdish,
            dateObject: bTime
        };
    }

    function start(callback) {
        onTickCallback = callback;
        update();
        if (clockInterval) clearInterval(clockInterval);
        clockInterval = setInterval(update, 1000);
    }

    function update() {
        const timeData = getTimeComponents();
        if (typeof onTickCallback === 'function') {
            onTickCallback(timeData);
        }
    }

    function stop() {
        if (clockInterval) {
            clearInterval(clockInterval);
            clockInterval = null;
        }
    }

    return {
        start: start,
        stop: stop,
        getTimeComponents: getTimeComponents,
        getBaghdadTime: getBaghdadTime
    };
})();
