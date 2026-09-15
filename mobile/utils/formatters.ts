import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string, withTime = false): string => {
  try {
    const date = parseISO(dateString);
    if (withTime) {
      return format(date, 'dd MMM yyyy, hh:mm a');
    }
    return format(date, 'dd MMM yyyy');
  } catch {
    return dateString;
  }
};

export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (isToday(date)) {
      return format(date, 'hh:mm a');
    }
    if (isYesterday(date)) {
      return 'Yesterday';
    }
    return format(date, 'dd MMM');
  } catch {
    return dateString;
  }
};

export const formatDistanceFromNow = (dateString: string): string => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

export const generateInvoiceNumber = (count: number): string => {
  const year = new Date().getFullYear();
  const nextYear = year + 1;
  return `CAC/${year}-${String(nextYear).slice(2)}/${String(count).padStart(3, '0')}`;
};

export const numberToIndianWords = (num: number): string => {
  if (isNaN(num) || num === 0) return 'Zero Only';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertTwoDigits = (n: number): string => {
    if (n < 20) return a[n];
    const tens = b[Math.floor(n / 10)];
    const ones = a[n % 10];
    return tens + (ones ? ' ' + ones : '');
  };

  const convertThreeDigits = (n: number): string => {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let result = '';
    if (hundred > 0) {
      result += a[hundred] + ' Hundred';
    }
    if (rest > 0) {
      result += (result ? ' ' : '') + convertTwoDigits(rest);
    }
    return result;
  };

  let integerPart = Math.floor(Math.abs(num));
  let result = '';

  const crore = Math.floor(integerPart / 10000000);
  integerPart %= 10000000;

  const lakh = Math.floor(integerPart / 100000);
  integerPart %= 100000;

  const thousand = Math.floor(integerPart / 1000);
  integerPart %= 1000;

  const hundreds = integerPart;

  if (crore > 0) {
    result += convertThreeDigits(crore) + ' Crore ';
  }
  if (lakh > 0) {
    result += convertThreeDigits(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    result += convertThreeDigits(thousand) + ' Thousand ';
  }
  if (hundreds > 0) {
    result += convertThreeDigits(hundreds);
  }

  result = result.trim();
  return result ? `Rs. ${result} Only` : 'Zero Only';
};

