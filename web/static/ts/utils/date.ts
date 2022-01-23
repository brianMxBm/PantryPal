import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function timeUntilUTCMidnight(): string {
    const tomorrow = new Date();
    tomorrow.setUTCHours(24, 0, 0, 0);
    return dayjs(tomorrow).fromNow();
}