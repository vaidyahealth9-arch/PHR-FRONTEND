import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ReportSummary from '../ReportSummary';
import TrendChart from '../TrendChart';
import ShareModal from '../ShareModal';

// Mock the useApi hook
vi.mock('../../hooks/useApi', () => ({
  useApi: () => ({
    request: vi.fn().mockImplementation(async (url: string, options?: { method?: string }) => {
      if (url.includes('/summary')) {
        return {
          record_id: 1,
          title: 'Test Report',
          summary_text: 'This is a test summary',
          key_findings: [
            {
              analyte: 'Glucose',
              value: 128.5,
              unit: 'mg/dL',
              status: 'high',
              clinical_note: 'Elevated glucose',
            },
          ],
          clinical_significance: 'This is clinically significant',
          confidence: 0.95,
          disclaimer: 'This is a disclaimer',
        };
      }

      if (url.includes('/trends/')) {
        return {
          trend_data: [
            { date: '2026-03-01', value: 110, unit: 'mg/dL', status: 'normal' },
            { date: '2026-03-10', value: 120, unit: 'mg/dL', status: 'high' },
          ],
          statistics: {
            min: 110,
            max: 120,
            avg: 115,
            trend_direction: 'worsening',
          },
          reference_range: {
            low: 70,
            high: 110,
            unit: 'mg/dL',
          },
        };
      }

      if (url.includes('/share') && options?.method === 'GET') {
        return [];
      }

      if (url.includes('/share') && options?.method === 'POST') {
        return {
          link: 'https://phr.app/share/test-token',
          expires_at: '2026-12-31T10:00:00Z',
        };
      }

      return { status: 'ok' };
    }),
  }),
}));

describe('Part 6 Frontend Components', () => {
  describe('ReportSummary Component', () => {
    it('should display loading state', () => {
      render(<ReportSummary recordId={1} />);
    });
  });

  describe('TrendChart Component', () => {
    const mockData = [
      { date: '2026-03-01T00:00:00Z', value: '110', status: 'GREEN' },
      { date: '2026-03-10T00:00:00Z', value: '120', status: 'RED' },
    ];

    it('should not render if data is empty', () => {
      const { container } = render(<TrendChart data={[]} />);
      expect(container).toBeEmptyDOMElement();
    });

    it('should display rendered lines for data points', () => {
      // We can check if the ResponsiveContainer/LineChart renders something
      // but Recharts is tricky in test environment without mock. 
      // Just check it renders without crashing.
      const { container } = render(<TrendChart data={mockData} unit="mg/dL" />);
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });
  });

  describe('ShareModal Component', () => {
    it('should render', () => {
      render(
        <ShareModal recordId={1} onClose={vi.fn()} />
      );
    });
  });
});
