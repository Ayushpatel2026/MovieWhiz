
// THIS IS NOT BEING USED ANYWHERE RIGHT NOW, 
// MAYBE WE WILL DO THE DATE FORMATTING IN THE BACKEND INSTEAD
export const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Intl.DateTimeFormat(undefined, options).format(date);
  };