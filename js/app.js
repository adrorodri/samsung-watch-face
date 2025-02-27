(function () {
    let timerUpdateDate = 0;
    let isAmbientMode = false;
    let interval;

    function init() {
        updateBattery();
        updateHR();
        updateDate(0);
        setInterval(function () {
            updateTime();
        }, 1000);

        setInterval(function () {
            updateBattery();
        }, 60 * 1000)

        document.addEventListener("visibilitychange", function () {
            if (!document.hidden) {
                updateTime();
                updateDate(0);
            }
        });

        document.addEventListener('ambientmodechanged', function (ev) {
            if (ev.detail.ambientMode === true) {
                activateAmbientMode();
            } else {
                deactivateAmbientMode();
            }
        });

    }

    function onBatteryResponse(battery) {
        batteryLevel = Math.trunc(battery.level * 100);
        batteryIsCharging = battery.isCharging;
        $("#battery-text").html(batteryLevel);
    }

    function updateBattery() {
        tizen.systeminfo.getPropertyValue('BATTERY', onBatteryResponse);
    }

    function updateHR() {
    }

    function rotateElements(angle, className) {
        $(className).css("transform", "rotate(" + angle % 360 + "deg)");
    }

    function updateDate(prevDate) {
        const datetime = tizen.time.getCurrentDateTime();
        let nextInterval;

        if (prevDate === datetime.getDate()) {
            nextInterval = 1000;
        } else {
            nextInterval = (23 - datetime.getHours()) * 60 * 60 * 1000
                + (59 - datetime.getMinutes()) * 60 * 1000
                + (59 - datetime.getSeconds()) * 1000
                + (1000 - datetime.getMilliseconds()) + 1;
        }

        $("#date-text").html(padStart(datetime.getDate().toString()) + "/" + getMonth(datetime.getMonth()));

        // If an updateDate timer already exists, clear the previous timer
        if (timerUpdateDate) {
            clearTimeout(timerUpdateDate);
        }

        // Set next timeout for date update
        timerUpdateDate = setTimeout(function () {
            updateDate(datetime.getDate());
        }, nextInterval);
    }

    /**
     * Updates the hour/minute/second hands according to the current time
     *
     * @private
     */
    function updateTime() {
        const datetime = tizen.time.getCurrentDateTime();
        const hour = datetime.getHours();
        const minute = datetime.getMinutes();
        const second = datetime.getSeconds();

        const separator = second % 2 === 0 ? ":" : " ";

        $("#time-text").html(padStart(hour.toString()) + separator + padStart(minute.toString()));

        // Update the hour/minute/second hands
        rotateElements((hour + (minute / 60) + (second / 3600)) * 30, "#hands-hr-needle");
        rotateElements((minute + second / 60) * 6, "#hands-min-needle");
        clearInterval(interval);
        if (!isAmbientMode) {
            let anim = 0.1;
            rotateElements(second * 6, "#hands-sec-needle");
            interval = setInterval(() => {
                rotateElements((second + anim) * 6, "#hands-sec-needle");
                anim += 0.1;
            }, 100);
        }
    }

    function activateAmbientMode() {
        isAmbientMode = true;
        $("#hands-sec-needle").hide();
        $("#hands-min-needle").css("background-image", "url(../image/watch-minute-aod.png)");
        $("#hands-hr-needle").css("background-image", "url(../image/watch-hour-aod.png)");
        $("#controls").css("background-image", "url(../image/foreground-aod.png)");
        $("#watch-bg").css("transition", "unset");
        $("#watch-bg").css("height", "200%");
        $("#watch-bg").css("width", "200%");
        $("#watch-bg").css("background-image", "url(../image/background-aod.png)");
    }

    function deactivateAmbientMode() {
        isAmbientMode = false;
        $("#hands-sec-needle").show();
        $("#hands-min-needle").css("background-image", "url(../image/watch-minute.png)");
        $("#hands-hr-needle").css("background-image", "url(../image/watch-hour.png)");
        $("#controls").css("background-image", "url(../image/foreground.png)");
        $("#watch-bg").css("transition", "all 700ms ease-in-out");
        $("#watch-bg").css("height", "100%");
        $("#watch-bg").css("width", "100%");
        $("#watch-bg").css("background-image", "url(../image/background.png)");
    }

    function showLogs(logs) {
        $("#logs").html(logs)
    }

    function padStart(str) {
        return '00'.slice(str.toString().length) + str;
    }

    function getMonth(num) {
        switch (num) {
            case 0:
                return "JAN";
            case 1:
                return "FEB";
            case 2:
                return "MAR";
            case 3:
                return "APR";
            case 4:
                return "MAY";
            case 5:
                return "JUN";
            case 6:
                return "JUL";
            case 7:
                return "AGO";
            case 8:
                return "SEP";
            case 9:
                return "OCT";
            case 10:
                return "NOV";
            case 11:
                return "DEC";
            default:
                return "-";
        }
    }

    window.onload = init();
}());