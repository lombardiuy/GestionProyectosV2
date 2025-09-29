  import { User } from "../interfaces/user.interface";
  


export function createUsername(name: string, userList: User[] | null): string {
  if (!name) return '';

  const words = name.split(' ').filter(w => w.trim() !== '');

  if (words.length < 2) return '';

  const baseUsername = words[0].charAt(0).toLowerCase() + words[1].toLowerCase();
  let finalUsername = baseUsername;

  if (userList && userList.length > 0) {
    const existingUsernames = new Set(userList.map(u => u.username.toLowerCase()));

    // Si ya existe el base, empezamos desde 2
    if (existingUsernames.has(baseUsername.toLowerCase())) {
      let counter = 2;
      while (existingUsernames.has((baseUsername + counter).toLowerCase())) {
        counter++;
      }
      finalUsername = baseUsername + counter;
    }
  }

  return finalUsername;
}
