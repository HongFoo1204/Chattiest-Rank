import { NextRequest, NextResponse } from 'next/server';
import type { ChatUser } from '@/interfaces/ChatUser';

export async function POST(request: NextRequest) {
  const data = await request.formData();

  const files = data.getAll('file') as unknown as File[];

  const users: any = await files.reduce(async (prev: any, file) => {
    // Return fail if file is not txt file (backend validation)
    if (file.type !== 'text/plain') {
      return NextResponse.json({ success: false });
    }

    // Read the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const lines = buffer.toString().split(/(?=<)/g); // split but keep the delimiter

    let newUsers: ChatUser[] = [];

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

    // Sort users by word count in descending order
    const sortedUsers = newUsers.sort((a, b) => b.wordsCount - a.wordsCount);

    return [...(await prev), sortedUsers];
  }, Promise.resolve([]));

  return NextResponse.json(users);
}
