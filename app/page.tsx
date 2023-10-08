'use client';

import { Button } from '@nextui-org/button';
import { Card, CardBody } from '@nextui-org/card';
import { useState } from 'react';
import type { ChatUser } from '@/interfaces/ChatUser';

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [chattiestRank, setChattiestRank] = useState<ChatUser[]>([]);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;

    for (let i = 0; i < files.length; i++) {
      const file = e.dataTransfer.files[i];
      // Alert if file is not txt
      if (file.type !== 'text/plain') {
        alert('Only plain text files are supported');
        return;
      }
      // Default: add file to file list
      setSelectedFiles((current) => [...current, file]);
    }
  };

  const handleFileUpload = async () => {
    if (selectedFiles) {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append(`file`, file);
      });

      try {
        // Call NextJs api
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const result = await res.json();
        setChattiestRank(result.sortedUsers);
      } catch (err) {
        //TODO: handle error
        console.error(err);
      }
    }
  };

  const handleRemoveClick = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  return (
    <main className="flex min-h-screen items-center justify-evenly p-24">
      <div className="flex flex-col gap-2 items-start">
        <h1 className="font-bold">Upload a log file (.txt)</h1>
        <Card className="min-w-[500px] min-h-[300px]">
          <CardBody
            className="justify-center items-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
          >
            {selectedFiles.length ? (
              <>
                {selectedFiles.map((file, index) => (
                  <div
                    key={`selectedFiles-${index}`}
                    className="w-full flex items-center"
                  >
                    <p>
                      Selected File {index + 1}: {file.name}
                    </p>
                    <Button
                      isIconOnly
                      color="danger"
                      aria-label="remove"
                      size="sm"
                      className="ml-5"
                      onClick={() => {
                        handleRemoveClick(index);
                      }}
                    >
                      X
                    </Button>
                  </div>
                ))}
              </>
            ) : (
              <p>(Drag and drop your file here)</p>
            )}
          </CardBody>
        </Card>
        <Button onClick={handleFileUpload}>Upload</Button>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h1 className="font-bold">Results:</h1>
        <Card className="w-[200px] h-[300px]">
          <CardBody>
            {chattiestRank?.map((user, index) => {
              return (
                <p key={`result-${index}`}>
                  {user.name} - {user.wordsCount} words
                </p>
              );
            })}
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
