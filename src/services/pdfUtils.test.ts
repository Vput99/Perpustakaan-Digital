import { test } from 'node:test';
import assert from 'node:assert';
import { getPdfUrl } from './pdfUtils.ts';

test('getPdfUrl constructs the correct Google Drive API URL', () => {
  // Set environment variable for the test
  process.env.VITE_GOOGLE_DRIVE_API_KEY = 'test-api-key';

  const driveId = '12345';
  const expectedUrl = `https://www.googleapis.com/drive/v3/files/${driveId}?alt=media&key=test-api-key`;

  const actualUrl = getPdfUrl(driveId);

  assert.strictEqual(actualUrl, expectedUrl);
});
