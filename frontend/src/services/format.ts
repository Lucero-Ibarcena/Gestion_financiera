export const money = (amount: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount || 0);

export const shortDate = (value: string) =>
  new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
  })
    .format(new Date(`${value.slice(0, 10)}T12:00:00`))
    .replace('.', '');

export const localDateInput = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const monthName = (date: Date, style: 'short' | 'long' = 'short') =>
  new Intl.DateTimeFormat('es-AR', { month: style }).format(date).replace('.', '');

export const categories = [
  'Vivienda',
  'Comida',
  'Transporte',
  'Salud',
  'Ocio',
  'Compras',
  'Servicios',
  'Educación',
  'Sueldo',
  'Otros',
];
