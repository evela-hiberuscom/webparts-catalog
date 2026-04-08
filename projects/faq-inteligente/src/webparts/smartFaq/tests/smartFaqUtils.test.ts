import { filterFaqs, isFaqPartial, sortFaqs } from '../utils/smartFaqUtils';

describe('smartFaqUtils', () => {
  it('sorts featured faqs first and then by category and question', () => {
    const result = sortFaqs([
      { id: '1', question: 'B', answer: 'A', category: 'HR', aliases: [], isFeatured: false },
      { id: '2', question: 'A', answer: 'B', category: 'IT', aliases: [], isFeatured: true }
    ]);

    expect(result[0].id).toBe('2');
  });

  it('filters by query and category', () => {
    const result = filterFaqs([
      { id: '1', question: 'Cómo pedir vacaciones', answer: 'Usa el portal', category: 'HR', aliases: ['vacaciones'], isFeatured: false },
      { id: '2', question: 'Acceso VPN', answer: 'Contacta con soporte', category: 'IT', aliases: ['vpn'], isFeatured: false }
    ], 'vpn', 'IT');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('detects partial items when the answer is missing', () => {
    expect(isFaqPartial({ id: '1', question: 'Q', answer: '', category: 'General', aliases: [], isFeatured: false })).toBe(true);
  });
});
