const timeTransformed = (seconds) => {
    return new Date(seconds).toLocaleString('fi-FI', {
              timeZone: 'Europe/Helsinki',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
    });
}
export { timeTransformed };