export function millisecondsToHHMMSS(milliseconds: number | undefined): string {
  if (milliseconds === undefined || Number.isNaN(milliseconds)) {
    return "";
  }

  let remainder = milliseconds;
  const hours = Math.floor(remainder / (1000 * 60 * 60));
  remainder = remainder % (1000 * 60 * 60);
  const minutes = Math.floor(remainder / (1000 * 60));
  remainder = remainder % (1000 * 60);
  const seconds = Math.floor(remainder / 1000);

  return (
    hours.toString().padStart(2, "0") +
    ":" +
    minutes.toString().padStart(2, "0") +
    ":" +
    seconds.toString().padStart(2, "0")
  );
}

export function formatMinutes(milliseconds: number | undefined): string {
  if (milliseconds === undefined) return "—";
  const minutes = Math.round(milliseconds / 60000);
  return `~${minutes} min`;
}
