const ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';

const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

const randomSuffix = (length = 8) => {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => ALPHABET[value % ALPHABET.length]).join('');
};

export const generateJitsiLink = (title: string) => {
  const slug = slugify(title);
  return `https://meet.jit.si/EduQuest-${slug ? `${slug}-` : ''}${randomSuffix()}`;
};
