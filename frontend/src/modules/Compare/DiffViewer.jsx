import React from "react";
import { Diff, Hunk, parseDiff } from "react-diff-view";
import "react-diff-view/style/index.css";
import { createTwoFilesPatch } from "diff";
import '../../App.css';

const DiffViewer = ({ oldText, newText, filePrimeTitle = 'Before', fileSecondTitle = 'After' }) => {
  let diffText = createTwoFilesPatch(
    filePrimeTitle,
    fileSecondTitle,
    oldText,
    newText,
    '', '',
    { context: Number.MAX_SAFE_INTEGER }
  );;

  diffText = diffText
    .split("\n")
    .filter((line) => !line.startsWith("==="))
    .join("\n");

  let files = [];
  try {
    files = parseDiff(diffText);
  } catch (error) {
    console.error("Lỗi parseDiff:", error);
    return <div className="text-red-500">Lỗi khi parse diff!</div>;
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div className="diff-title">{fileSecondTitle}</div>
        <div className="diff-title">{filePrimeTitle}</div>
      </div>
      {files.map((file, index) => {
        const { hunks, type, newPath } = file;

        if (!hunks || hunks.length === 0) {
          return (
            <div key={index} className="text-gray-500">
              No differences
            </div>
          );
        }

        return (
          <Diff
            key={newPath || index}
            viewType="split"
            diffType={type}
            hunks={hunks}
            className="custom-diff-table"
          >
            {(actualHunks) =>
              actualHunks?.map((hunk, i) => (
                <Hunk key={i} hunk={hunk} />
              ))
            }
          </Diff>
        );
      })}
    </div>
  );
};

export default DiffViewer;
