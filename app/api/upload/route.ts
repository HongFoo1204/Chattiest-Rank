import { NextRequest, NextResponse } from 'next/server';
import type { ChatUser } from '@/interfaces/ChatUser';

export async function POST(request: NextRequest) {
  const data = await request.formData();

  const files = data.getAll('file') as unknown as File[];

  const users: ChatUser[] = await files.reduce(async (prev: any, file) => {
    if (file.type !== 'text/plain') {
      return NextResponse.json({ success: false });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const lines = buffer.toString().split(/(?=<)/g); // split but keep the delimiter

    let newUsers: ChatUser[] = await prev;

    for (const line of lines) {
      // Match user decalration
      const matches = line.match(/<([^>]+)> (.+)/);

      if (matches) {
        const username = matches[1];
        const words = line.split('> ')[1].split(' ');
        const userIndex = newUsers.findIndex((x) => x.name === username);

        if (userIndex >= 0) {
          newUsers[userIndex].wordsCount += words.length;
        } else {
          newUsers.push({
            name: username,
            wordsCount: words.length,
          });
        }
      }
    }

    return newUsers;
  }, Promise.resolve([]));

  // Sort users by word count in descending order
  const sortedUsers = users.sort((a, b) => b.wordsCount - a.wordsCount);

  return NextResponse.json({ sortedUsers });
}
