/**
 * Frontend Drag & Drop Upload Helper
 * (upload.js)
 */

import { sessionManager } from './session.js';
import { showToast } from './utils.js';

export function setupDragAndDrop(targetElement, onFileUploaded) {
  if (!targetElement) return;

  targetElement.addEventListener('dragover', (e) => {
    e.preventDefault();
    targetElement.classList.add('drag-over');
  });

  targetElement.addEventListener('dragleave', () => {
    targetElement.classList.remove('drag-over');
  });

  targetElement.addEventListener('drop', async (e) => {
    e.preventDefault();
    targetElement.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);

    showToast('Uploading dropped file...', 'info');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-session-token': sessionManager.getToken() },
        body: formData
      });
      const data = await res.json();
      if (data.success && data.data) {
        onFileUploaded(data.data, file);
        showToast('File uploaded!', 'success');
      } else {
        showToast(data.message || 'Upload failed', 'error');
      }
    } catch (err) {
      showToast('Error uploading file', 'error');
    }
  });
}
