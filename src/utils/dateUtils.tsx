export function getTodayDateInputValue() {
    return new Date().toISOString().split('T')[0];
}

export function addDays(date: string, days: number) {
    const currentDate = new Date(`${date}T00:00:00`);
    currentDate.setDate(currentDate.getDate() + days);

    return currentDate.toISOString().split('T')[0];
}

export function formatDateToDisplay(date: string) {
    const currentDate = new Date(`${date}T00:00:00`);

    return currentDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}