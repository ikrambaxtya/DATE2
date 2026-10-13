/**
 * SUNNAT RADIO CALENDAR - CALENDAR ENGINE (js/calendar.js)
 * Precision Saudi Arabia Umm al-Qura Hijri (with Aladhan API + Offline Fallback), Kurdish & Gregorian.
 */

const CalendarEngine = (function () {
    const kurdishDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

    function formatNumber(num) {
        if (num === null || num === undefined) return '';
        const str = String(num);
        return str.replace(/[0-9]/g, (d) => kurdishDigits[parseInt(d)]);
    }

    const kurdishDaysOfWeek = [
        'یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'هەینی', 'شەممە'
    ];

    const shortKurdishDays = ['ی', 'د', 'س', 'چ', 'پ', 'هـ', 'ش'];

    const kurdishMonths = [
        { name: 'نەورۆز', monthNum: 1, season: 'وەرزی بەهار', icon: 'fa-seedling', daysCount: 31 },
        { name: 'گوڵان', monthNum: 2, season: 'وەرزی بەهار', icon: 'fa-seedling', daysCount: 31 },
        { name: 'جۆزەردان', monthNum: 3, season: 'وەرزی بەهار', icon: 'fa-sun', daysCount: 31 },
        { name: 'پوشپەڕ', monthNum: 4, season: 'وەرزی هاوین', icon: 'fa-sun', daysCount: 31 },
        { name: 'گەلاوێژ', monthNum: 5, season: 'وەرزی هاوین', icon: 'fa-sun', daysCount: 31 },
        { name: 'خەرمانان', monthNum: 6, season: 'وەرزی هاوین', icon: 'fa-leaf', daysCount: 31 },
        { name: 'ڕەزبەر', monthNum: 7, season: 'وەرزی پایز', icon: 'fa-wind', daysCount: 30 },
        { name: 'گەڵاڕێزان', monthNum: 8, season: 'وەرزی پایز', icon: 'fa-leaf', daysCount: 30 },
        { name: 'بەرفانبار', monthNum: 9, season: 'وەرزی پایز', icon: 'fa-cloud-rain', daysCount: 30 },
        { name: 'ڕێبەندان', monthNum: 10, season: 'وەرزی زستان', icon: 'fa-snowflake', daysCount: 30 },
        { name: 'ڕەشەمە', monthNum: 11, season: 'وەرزی زستان', icon: 'fa-snowflake', daysCount: 30 },
        { name: 'خاکەلێوە', monthNum: 12, season: 'وەرزی زستان', icon: 'fa-cloud-sun', daysCount: 29 }
    ];

    const hijriMonthsArabic = [
        { name: 'محرم', monthNum: 1, daysCount: 30 },
        { name: 'صفر', monthNum: 2, daysCount: 29 },
        { name: 'ربيع الأول', monthNum: 3, daysCount: 30 },
        { name: 'ربيع الآخر', monthNum: 4, daysCount: 29 },
        { name: 'جمادى الأولى', monthNum: 5, daysCount: 30 },
        { name: 'جمادى الآخرة', monthNum: 6, daysCount: 29 },
        { name: 'رجب', monthNum: 7, daysCount: 30 },
        { name: 'شعبان', monthNum: 8, daysCount: 29 },
        { name: 'رمضان', monthNum: 9, daysCount: 30 },
        { name: 'شوال', monthNum: 10, daysCount: 29 },
        { name: 'ذو القعدة', monthNum: 11, daysCount: 30 },
        { name: 'ذو الحجة', monthNum: 12, daysCount: 29 }
    ];

    const gregorianMonthsKurdish = [
        { name: 'کانوونی دووەم', monthNum: 1, daysCount: 31 },
        { name: 'شبات', monthNum: 2, daysCount: 28 },
        { name: 'ئازار', monthNum: 3, daysCount: 31 },
        { name: 'نیسان', monthNum: 4, daysCount: 30 },
        { name: 'ئایار', monthNum: 5, daysCount: 31 },
        { name: 'حوزەیران', monthNum: 6, daysCount: 30 },
        { name: 'تەمووز', monthNum: 7, daysCount: 31 },
        { name: 'ئاب', monthNum: 8, daysCount: 31 },
        { name: 'ئەیلوول', monthNum: 9, daysCount: 30 },
        { name: 'تشرینی یەکەم', monthNum: 10, daysCount: 31 },
        { name: 'تشرینی دووەم', monthNum: 11, daysCount: 30 },
        { name: 'کانوونی یەکەم', monthNum: 12, daysCount: 31 }
    ];

    let hijriOffset = 0;
    let apiHijriCache = {}; // Cache by date string 'DD-MM-YYYY'
    let onHijriUpdateListener = null;

    function gregorianToKurdish(gYear, gMonth, gDay) {
        const gDaysInMonth = [0, 31, (isLeapGregorian(gYear) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const jDaysInMonth = [0, 31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

        let gy = gYear - 1600;
        let gm = gMonth - 1;
        let gd = gDay - 1;

        let gDayNo = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400);

        for (let i = 0; i < gm; ++i) {
            gDayNo += gDaysInMonth[i + 1];
        }
        gDayNo += gd;

        let jDayNo = gDayNo - 79;

        let jNp = Math.floor(jDayNo / 12053);
        jDayNo %= 12053;

        let jy = 979 + 33 * jNp + 4 * Math.floor(jDayNo / 1461);
        jDayNo %= 1461;

        if (jDayNo >= 366) {
            jy += Math.floor((jDayNo - 1) / 365);
            jDayNo = (jDayNo - 1) % 365;
        }

        let jm, jd;
        for (let i = 0; i < 11 && jDayNo >= jDaysInMonth[i + 1]; ++i) {
            jDayNo -= jDaysInMonth[i + 1];
            jm = i + 1;
        }
        jm = (jm || 0) + 1;
        jd = jDayNo + 1;

        const kurdishYear = jy + 1321;
        const monthObj = kurdishMonths[jm - 1];
        const formattedMonthNum = formatNumber(monthObj.monthNum);

        return {
            day: jd,
            monthIndex: jm - 1,
            monthNumber: monthObj.monthNum,
            formattedMonthNumber: formattedMonthNum,
            monthName: monthObj.name,
            monthNameWithNum: `${monthObj.name} (مانگی ${formattedMonthNum})`,
            season: monthObj.season,
            seasonIcon: monthObj.icon,
            daysCount: monthObj.daysCount,
            year: kurdishYear,
            formattedDay: formatNumber(jd),
            formattedYear: formatNumber(kurdishYear),
            fullString: `${formatNumber(jd)} ${monthObj.name} (${formattedMonthNum}) ${formatNumber(kurdishYear)}`
        };
    }

    function isLeapGregorian(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    /**
     * Fetch Official Saudi Arabia Umm al-Qura Hijri Date via Aladhan API
     */
    async function fetchSaudiHijriApi(dateObj) {
        const d = dateObj || new Date();
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;

        if (apiHijriCache[formattedDate]) {
            return apiHijriCache[formattedDate];
        }

        try {
            const url = `https://api.aladhan.com/v1/gToH/${formattedDate}?method=4`;
            const response = await fetch(url);
            const data = await response.json();

            if (data && data.code === 200 && data.data && data.data.hijri) {
                const h = data.data.hijri;
                const hDay = parseInt(h.day, 10);
                const hMonthNum = parseInt(h.month.number, 10);
                const hYear = parseInt(h.year, 10);

                const monthObj = hijriMonthsArabic[hMonthNum - 1] || hijriMonthsArabic[0];
                const formattedMonthNum = formatNumber(monthObj.monthNum);

                const result = {
                    day: hDay,
                    monthIndex: hMonthNum - 1,
                    monthNumber: monthObj.monthNum,
                    formattedMonthNumber: formattedMonthNum,
                    monthName: monthObj.name,
                    monthNameWithNum: `${monthObj.name} (مانگی ${formattedMonthNum})`,
                    year: hYear,
                    formattedDay: formatNumber(hDay),
                    formattedYear: formatNumber(hYear),
                    fullString: `${formatNumber(hDay)} ${monthObj.name} (${formattedMonthNum}) ${formatNumber(hYear)} هـ`,
                    isApiSourced: true
                };

                apiHijriCache[formattedDate] = result;

                if (typeof onHijriUpdateListener === 'function') {
                    onHijriUpdateListener(result);
                }
                return result;
            }
        } catch (error) {
            console.warn('Aladhan API fetch warning:', error);
        }
        return null;
    }

    function parseDigitString(str) {
        if (!str) return 0;
        const western = String(str).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
        return parseInt(western, 10);
    }

    /**
     * Calculate Precision Hijri Date (With API cache check + Offline Umm al-Qura fallback)
     */
    function gregorianToHijri(date, offsetDays = hijriOffset, allowApiFetch = false) {
        const d = new Date(date);
        d.setDate(d.getDate() + offsetDays);

        const dayStr = String(d.getDate()).padStart(2, '0');
        const monthStr = String(d.getMonth() + 1).padStart(2, '0');
        const yearStr = d.getFullYear();
        const dateKey = `${dayStr}-${monthStr}-${yearStr}`;

        // Check if API cache is ready
        if (offsetDays === 0 && apiHijriCache[dateKey]) {
            return apiHijriCache[dateKey];
        }

        // Trigger API fetch in background ONLY when explicitly permitted (e.g. today's date)
        if (allowApiFetch && offsetDays === 0 && !apiHijriCache[dateKey]) {
            fetchSaudiHijriApi(d);
        }

        // Try Saudi Arabia Umm al-Qura Intl Formatter
        const locales = ['en-u-ca-islamic-umalqura', 'ar-SA-u-ca-islamic-umalqura', 'ar-SA-u-ca-islamic', 'ar-SA-u-ca-islamic-uma'];
        for (const loc of locales) {
            try {
                const formatter = new Intl.DateTimeFormat(loc, {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric'
                });
                const parts = formatter.formatToParts(d);
                let day, month, year;
                for (const part of parts) {
                    if (part.type === 'day') day = parseDigitString(part.value);
                    if (part.type === 'month') month = parseDigitString(part.value);
                    if (part.type === 'year') year = parseDigitString(part.value);
                }
                if (day && month && year && year >= 1300 && year <= 1600 && month >= 1 && month <= 12) {
                    const monthObj = hijriMonthsArabic[month - 1] || hijriMonthsArabic[0];
                    const formattedMonthNum = formatNumber(monthObj.monthNum);
                    return {
                        day: day,
                        monthIndex: month - 1,
                        monthNumber: monthObj.monthNum,
                        formattedMonthNumber: formattedMonthNum,
                        monthName: monthObj.name,
                        monthNameWithNum: `${monthObj.name} (مانگی ${formattedMonthNum})`,
                        year: year,
                        formattedDay: formatNumber(day),
                        formattedYear: formatNumber(year),
                        fullString: `${formatNumber(day)} ${monthObj.name} (${formattedMonthNum}) ${formatNumber(year)} هـ`
                    };
                }
            } catch (e) {
                // Next locale
            }
        }

        // Fallback Kuwaiti calculation
        let day = d.getDate();
        let month = d.getMonth();
        let year = d.getFullYear();

        let m = month + 1;
        let y = year;
        if (m < 3) {
            y -= 1;
            m += 12;
        }

        let a = Math.floor(y / 100);
        let b = 2 - a + Math.floor(a / 4);
        let jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;

        let z = jd + 0.5;
        let i = Math.floor(z);

        let l = i - 1948440 + 10632;
        let n = Math.floor((l - 1) / 10631);
        l = l - 10631 * n + 354;
        let j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) + (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
        l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;

        let hMonth = Math.floor((24 * l) / 709);
        let hDay = l - Math.floor((709 * hMonth) / 24);
        let hYear = 30 * n + j - 30;

        const monthObj = hijriMonthsArabic[hMonth - 1] || hijriMonthsArabic[0];
        const formattedMonthNum = formatNumber(monthObj.monthNum);

        return {
            day: hDay,
            monthIndex: hMonth - 1,
            monthNumber: monthObj.monthNum,
            formattedMonthNumber: formattedMonthNum,
            monthName: monthObj.name,
            monthNameWithNum: `${monthObj.name} (مانگی ${formattedMonthNum})`,
            year: hYear,
            formattedDay: formatNumber(hDay),
            formattedYear: formatNumber(hYear),
            fullString: `${formatNumber(hDay)} ${monthObj.name} (${formattedMonthNum}) ${formatNumber(hYear)} هـ`
        };
    }

    /**
     * Format Gregorian Date with Month Number
     */
    function formatGregorian(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dayOfWeekIndex = date.getDay();

        const start = new Date(date.getFullYear(), 0, 0);
        const diff = (date - start) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        const monthObj = gregorianMonthsKurdish[month - 1];
        const formattedMonthNum = formatNumber(month);

        return {
            day: day,
            month: month,
            monthNumber: month,
            formattedMonthNumber: formattedMonthNum,
            year: year,
            dayOfWeekName: kurdishDaysOfWeek[dayOfWeekIndex],
            monthNameKurdish: monthObj.name,
            monthNameWithNum: `${monthObj.name} (مانگی ${formattedMonthNum})`,
            formattedDay: formatNumber(day),
            formattedMonth: formattedMonthNum,
            formattedYear: formatNumber(year),
            formattedDayOfYear: formatNumber(dayOfYear),
            formattedStandardString: `${formatNumber(year)} - ${formattedMonthNum} - ${formatNumber(day)}`
        };
    }

    /**
     * Ramadan Countdown & In-Ramadan Calculator with Authentic Duas
     */
    function getRamadanStatus(date, offset = hijriOffset) {
        const baseDate = date ? new Date(date) : new Date();
        const todayHijri = gregorianToHijri(baseDate, offset);
        const isRamadan = (todayHijri.monthNumber === 9);

        if (isRamadan) {
            // In Ramadan: Count how many days remain of Ramadan until 1st of Shawwal
            let cur = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
            let count = 0;
            while (count < 35) {
                cur.setDate(cur.getDate() + 1);
                count++;
                const h = gregorianToHijri(cur, offset);
                if (h.monthNumber === 10 && h.day === 1) {
                    break;
                }
            }
            return {
                isRamadan: true,
                daysRemaining: count,
                formattedDaysRemaining: formatNumber(count),
                currentFastDay: todayHijri.day,
                formattedFastDay: formatNumber(todayHijri.day),
                hijriYear: todayHijri.year,
                formattedHijriYear: formatNumber(todayHijri.year),
                statusTitle: 'مانگی پیرۆزی ڕەمەزان',
                subtitle: 'چەند ڕۆژی ماوە لە مانگی پیرۆزی ڕەمەزان',
                statusBadgeText: 'ئێستا لە مانگی ڕەمەزانین',
                countdownUnit: 'ڕۆژ ماوە لە مانگی ڕەمەزان',
                detailText: `ئەمڕۆ ڕۆژی ${formatNumber(todayHijri.day)}ی مانگی پیرۆزی ڕەمەزانی ${formatNumber(todayHijri.year)} هـ`,
                duaBadgeTitle: 'دوعای بەربانگ و مانگی پیرۆزی ڕەمەزان',
                duaArabic: '«ذَهَبَ الظَّمَأُ، وَابْتَلَّتِ العُرُوقُ، وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ»',
                duaKurdish: '«تینویەتی نەما و دەمارەکان تەڕ بوونەوە و پاداشت جێگیر بوو بە ویستی خودا.»',
                duaSecondary: '«اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي» (خوایە تۆ لێبوردەیت و لێخۆشبوونت خۆشدەوێت، لە گوناهم خۆشبە)'
            };
        } else {
            // Before/After Ramadan: Count days remaining until 1st of Ramadan
            let cur = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
            let count = 0;
            const targetYear = todayHijri.monthNumber > 9 ? todayHijri.year + 1 : todayHijri.year;
            while (count < 366) {
                cur.setDate(cur.getDate() + 1);
                count++;
                const h = gregorianToHijri(cur, offset);
                if (h.monthNumber === 9 && h.day === 1) {
                    break;
                }
            }
            return {
                isRamadan: false,
                daysRemaining: count,
                formattedDaysRemaining: formatNumber(count),
                targetYear: targetYear,
                formattedTargetYear: formatNumber(targetYear),
                statusTitle: 'چەند ڕۆژ ماوە بۆ مانگی ڕەمەزان',
                subtitle: 'ژماردنی ڕۆژەکانی ماون بۆ دەستپێکی مانگی پیرۆزی ڕەمەزان',
                statusBadgeText: 'چاوەڕوانی ڕەمەزان',
                countdownUnit: 'ڕۆژ ماوە بۆ مانگی پیرۆزی ڕەمەزان',
                detailText: `دەستپێکی ڕەمەزانی پیرۆز بۆ ساڵی ${formatNumber(targetYear)} کۆچی`,
                duaBadgeTitle: 'دوعای گەشتن بە مانگی پیرۆزی ڕەمەزان',
                duaArabic: '«اللَّهُمَّ بَلِّغْنَا رَمَضَانَ، وَسَلِّمْنَا لِرَمَضَانَ، وَتَسَلَّمْهُ مِنَّا مُتَقَبَّلًا»',
                duaKurdish: '«خوایە بمانگەیەنیت بە مانگی پیرۆزی ڕەمەزان و تەمەنمان پێ ببەخشیت، و ڕەمەزانمان بۆ ساغ بکەیتەوە، و کردەوەکانمان تێیدا لێ وەربگریت.»',
                duaSecondary: '«اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالأَمْنِ وَالإِيمَانِ، وَالسَّلامَةِ وَالإِسْلامِ، رَبِّي وَرَبُّكَ اللَّهُ»'
            };
        }
    }

    return {
        getKurdishDate: function (date) {
            const d = date || new Date();
            return gregorianToKurdish(d.getFullYear(), d.getMonth() + 1, d.getDate());
        },
        getHijriDate: function (date, offset = hijriOffset, allowApiFetch = true) {
            const d = date || new Date();
            return gregorianToHijri(d, offset, allowApiFetch);
        },
        getRamadanStatus: function (date, offset = hijriOffset) {
            return getRamadanStatus(date, offset);
        },
        fetchSaudiHijriApi: fetchSaudiHijriApi,
        setOnHijriUpdateListener: function(fn) {
            onHijriUpdateListener = fn;
        },
        getGregorianDate: function (date) {
            const d = date || new Date();
            return formatGregorian(d);
        },
        getDayOfWeekKurdish: function (date) {
            const d = date || new Date();
            return kurdishDaysOfWeek[d.getDay()];
        },
        getAllHijriMonths: function () {
            return hijriMonthsArabic;
        },
        getAllKurdishMonths: function () {
            return kurdishMonths;
        },
        getAllGregorianMonths: function () {
            return gregorianMonthsKurdish;
        },
        setHijriOffset: function (val) {
            hijriOffset = val;
        },
        getHijriOffset: function () {
            return hijriOffset;
        },
        shortKurdishDays: shortKurdishDays,
        formatNumber: formatNumber
    };
})();
