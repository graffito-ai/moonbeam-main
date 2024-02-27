/**
 * Function used to convert a number of milliseconds to a particular time
 * (seconds, minutes, days, weeks, years), in order to help display how much
 * time elapsed since a transaction or reimbursement was made.
 *
 * @param milliseconds milliseconds to convert, to be passed in
 * @return a {@link string} representing the elapsed timeframe.
 */
export const convertMSToTimeframe = (milliseconds: number): string => {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);
    let months = Math.floor(days / 30);
    let years = Math.floor(months / 12);

    seconds = seconds % 60;
    minutes = minutes % 60;
    hours = hours % 24;
    days = days % 30
    months = months % 12;

    // return the elapsed time accordingly
    if (years !== 0) {
        return years !== 1 ? `${years} years ago` : `${years} year ago`;
    } else if (months !== 0) {
        return months !== 1 ? `${months} months ago` : `${months} month ago`;
    } else if (days !== 0) {
        return days !== 1 ? `${days} days ago` : `${days} day ago`;
    } else if (hours !== 0) {
        return hours !== 1 ? `${hours} hours ago` : `${hours} hour ago`;
    } else if (minutes !== 0) {
        return minutes !== 1 ? `${minutes} minutes ago` : `${minutes} minute ago`;
    } else if (seconds !== 0) {
        return seconds !== 1 ? `${seconds} seconds ago` : `${seconds} second ago`;
    } else {
        return ''
    }
}
