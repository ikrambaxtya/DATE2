/**
 * SUNNAT RADIO CALENDAR - PRAYER TIMES ENGINE (js/prayers.js)
 * Interfaced with official 'noor_prayer_time.db' dataset with Geolocation support.
 */

const PrayerEngine = (function () {
    const cities = {
        Hawler:       { name: 'هەولێر', lat: 36.1912, lng: 44.0092 },
        Slemani:      { name: 'سلێمانی', lat: 35.5560, lng: 45.4370 },
        Duhok:        { name: 'دهۆک', lat: 36.8679, lng: 42.9886 },
        Kirkuk:       { name: 'کەرکووک', lat: 35.4681, lng: 44.3922 },
        Halabja:      { name: 'هەڵەبجە', lat: 35.1778, lng: 45.9861 },
        Baghdad:      { name: 'بەغدا', lat: 33.3152, lng: 44.3661 },
        Zakho:        { name: 'زاخۆ', lat: 37.1511, lng: 42.6822 },
        Koya:         { name: 'کۆیە', lat: 36.0825, lng: 44.6311 },
        Akre:         { name: 'ئاکرێ', lat: 36.7411, lng: 43.8933 },
        Darbandikhan: { name: 'دەربەندیخان', lat: 35.1133, lng: 45.6961 },
        Qaladze:      { name: 'قەڵادزێ', lat: 36.1822, lng: 45.1211 }
    };

    /**
     * Get exact prayer times from 'noor_prayer_time.db' dataset for selected city & date
     */
    function getPrayerTimes(cityName = 'Hawler', date = new Date()) {
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const dateKey = `${mm}-${dd}`;

        if (typeof NOOR_PRAYER_DB !== 'undefined' && NOOR_PRAYER_DB[cityName] && NOOR_PRAYER_DB[cityName][dateKey]) {
            return NOOR_PRAYER_DB[cityName][dateKey];
        }

        // Fallback default
        return {
            fajr: "04:08",
            sunrise: "05:42",
            dhuhr: "12:14",
            asr: "15:44",
            maghrib: "18:36",
            isha: "19:51"
        };
    }

    /**
     * Calculate closest city based on user latitude & longitude
     */
    function getNearestCity(userLat, userLng) {
        let minDistance = Infinity;
        let closestCityKey = 'Hawler';

        for (const key in cities) {
            const c = cities[key];
            const dLat = c.lat - userLat;
            const dLng = c.lng - userLng;
            const dist = Math.sqrt(dLat * dLat + dLng * dLng);
            if (dist < minDistance) {
                minDistance = dist;
                closestCityKey = key;
            }
        }
        return {
            key: closestCityKey,
            name: cities[closestCityKey].name
        };
    }

    function format12HourKurdish(timeStr) {
        if (!timeStr) return '';
        const [hStr, mStr] = timeStr.split(':');
        let hours = parseInt(hStr, 10);
        hours = hours % 12;
        hours = hours ? hours : 12;
        const pad = (n) => (n < 10 ? '0' + n : String(n));
        return `${pad(hours)}:${mStr}`;
    }

    function getNextPrayerInfo(cityName = 'Hawler', currentDate = new Date()) {
        const times = getPrayerTimes(cityName, currentDate);
        const list = [
            { id: 'fajr', name: 'بەیانی', time: times.fajr },
            { id: 'sunrise', name: 'کۆڕی خۆر', time: times.sunrise },
            { id: 'dhuhr', name: 'نیوەڕۆ', time: times.dhuhr },
            { id: 'asr', name: 'عەسر', time: times.asr },
            { id: 'maghrib', name: 'ئێوارە', time: times.maghrib },
            { id: 'isha', name: 'عیشا', time: times.isha }
        ];

        const nowMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();
        const nowSeconds = currentDate.getSeconds();
        const totalNowSec = nowMinutes * 60 + nowSeconds;

        let nextPrayer = null;
        let diffSec = 0;

        for (let i = 0; i < list.length; i++) {
            const [h, m] = list[i].time.split(':').map(Number);
            const prayerSec = (h * 60 + m) * 60;
            if (prayerSec > totalNowSec) {
                nextPrayer = list[i];
                diffSec = prayerSec - totalNowSec;
                break;
            }
        }

        if (!nextPrayer) {
            nextPrayer = list[0];
            const [h, m] = list[0].time.split(':').map(Number);
            const fajrTomorrowSec = (24 * 60 * 60) + (h * 60 + m) * 60;
            diffSec = fajrTomorrowSec - totalNowSec;
        }

        const hrs = Math.floor(diffSec / 3600);
        const mins = Math.floor((diffSec % 3600) / 60);
        const secs = diffSec % 60;

        const pad = (n) => (n < 10 ? '0' + n : String(n));
        const countdownStr = `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;

        return {
            nextPrayer: nextPrayer,
            countdownString: countdownStr,
            times: times
        };
    }

    return {
        getPrayerTimes: getPrayerTimes,
        getNearestCity: getNearestCity,
        format12HourKurdish: format12HourKurdish,
        getNextPrayerInfo: getNextPrayerInfo,
        cities: cities
    };
})();
