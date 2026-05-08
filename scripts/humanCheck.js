/**
 * ============================================================
 * DETECTOR HUMANO
 * ============================================================
 */
class HumanDetector {
    constructor() {
        this.clickTimes = [];
        this.lastClickTime = 0;
    }

    recordClick() {
        const now = Date.now();
        if (this.lastClickTime > 0) {
            const interval = now - this.lastClickTime;
            this.clickTimes.push(interval);
            if (this.clickTimes.length > 10) {
                this.clickTimes.shift();
            }
        }
        this.lastClickTime = now;
    }

    validate() {
        return { isHuman: true, score: 50 };
    }

    reset() {
        this.clickTimes = [];
        this.lastClickTime = 0;
    }
}

window.HumanDetector = HumanDetector;