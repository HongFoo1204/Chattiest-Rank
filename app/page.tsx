'use client';

import { Button, ButtonGroup } from '@nextui-org/button';
import { Card, CardBody, CardFooter } from '@nextui-org/card';
import { useState } from 'react';
import type { ChattiestRank } from '@/interfaces/ChatUser';

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [chattiestResult, setChattiestResult] = useState<ChattiestRank[]>([]);
  const [resultPage, setResultPage] = useState<number>(1);

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
        setChattiestResult(result);
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
        <h1 className="font-bold">
          {chattiestResult.length > 1
            ? `Results for file ${resultPage}: `
            : 'Result'}
        </h1>
        <Card className="w-[200px] h-[300px]">
          <CardBody>
            {chattiestResult.length > 0 &&
              chattiestResult[resultPage - 1]?.map((user, index) => {
                return (
                  <p key={`result-${index}`}>
                    {user.name} - {user.wordsCount} words
                  </p>
                );
              })}
          </CardBody>
          {chattiestResult.length > 1 && (
            <CardFooter className="justify-center">
              <ButtonGroup>
                <Button
                  disabled={resultPage <= 1}
                  onClick={() => {
                    setResultPage(resultPage - 1);
                  }}
                >
                  {'<'}
                </Button>
                <Button
                  disabled={resultPage >= chattiestResult.length}
                  onClick={() => {
                    setResultPage(resultPage + 1);
                  }}
                >
                  {'>'}
                </Button>
              </ButtonGroup>
            </CardFooter>
          )}
        </Card>
      </div>
    </main>
  );
}
