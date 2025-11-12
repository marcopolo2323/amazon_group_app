// Fecha/Hora helpers compartidos
export const formatDate = (d: Date): string => {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export const parseDateStr = (s: string): Date => {
  const [dd, mm, yyyy] = s.split("/").map((x) => parseInt(x, 10));
  return new Date(yyyy, mm - 1, dd);
};

export const generateInitialDates = (count = 30, startDate = new Date()): string[] => {
  const dates: string[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    dates.push(formatDate(d));
  }
  return dates;
};

export const generateTimes = (minuteStep = 30, startHour = 8, endHour = 20): string[] => {
  const t: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += minuteStep) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      t.push(`${hh}:${mm}`);
    }
  }
  return t;
};

export const nextDefaultTime = (now = new Date(), minuteStep = 30, startHour = 8, endHour = 20): string => {
  const currentMinutes = now.getMinutes();
  const nextMinute = Math.ceil(currentMinutes / minuteStep) * minuteStep;
  let hour = now.getHours();
  let minute = nextMinute >= 60 ? 0 : nextMinute;
  if (nextMinute >= 60) hour += 1;

  if (hour < startHour) hour = startHour;
  if (hour > endHour) {
    hour = startHour; // si se pasa del rango, vuelve al inicio
    minute = 0;
  }

  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return `${hh}:${mm}`;
};