import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UploadRecord from './UploadRecord';

const mockUpload = vi.fn();
const mockExtract = vi.fn();
const mockConfirm = vi.fn();

vi.mock('../hooks/useApi', () => ({
  useProfiles: () => ({
    data: [{ id: '1', full_name: 'Ranju Owner' }],
  }),
  useUploadRecord: () => ({
    mutateAsync: mockUpload,
    isPending: false,
  }),
  useExtractOCR: () => ({
    mutateAsync: mockExtract,
    isPending: false,
  }),
  useConfirmOCR: () => ({
    mutateAsync: mockConfirm,
    isPending: false,
  }),
}));

vi.mock('../api/client', () => ({
  ocrApi: {
    get: vi.fn(),
  },
}));

describe('UploadRecord Part 5 flow', () => {
  beforeEach(() => {
    mockUpload.mockResolvedValue({
      data: { record_id: 99 },
    });
    mockExtract.mockResolvedValue({
      data: {
        status: 'completed',
        extracted_record_type: 'lab_report',
        extracted_title: 'CBC Report',
        extracted_tags: ['CBC', 'General'],
      },
    });
    mockConfirm.mockResolvedValue({ data: { ok: true } });
  });

  it('uploads, extracts OCR, and confirms tags', async () => {
    const { container } = render(
      <MemoryRouter>
        <UploadRecord />
      </MemoryRouter>
    );

    const comboBoxes = screen.getAllByRole('combobox');
    fireEvent.change(comboBoxes[0], { target: { value: '1' } });

    const titleInput = screen.getAllByRole('textbox')[0];
    fireEvent.change(titleInput, { target: { value: 'CBC Report' } });

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeTruthy();
    const file = new File(['test'], 'report.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    const form = container.querySelector('form') as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalled();
      expect(mockExtract).toHaveBeenCalledWith('99');
      expect(screen.getByText('Extracted Biomarkers')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Confirm & Save for Analytics' }));

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          recordId: '99',
          payload: expect.objectContaining({
            record_type: 'lab_report',
          }),
        })
      );
    });
  });
});
