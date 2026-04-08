import {
  limitRecognitions,
  normalizeRecognitionItem,
  sortRecognitionsByDate
} from './recognitionsUtils';

describe('recognitionsUtils', () => {
  it('marks incomplete recognitions as partial and normalizes relative urls', () => {
    const recognition = normalizeRecognitionItem(
      {
        id: '1',
        targetName: 'Equipo Soporte',
        date: '2026-03-20T12:00:00.000Z',
        photoUrl: '/_layouts/15/userphoto.aspx?size=S',
        detailUrl: '/sites/intranet/reconocimientos/soporte'
      },
      0,
      'https://contoso.sharepoint.com/sites/demo'
    );

    expect(recognition.photoUrl).toBe(
      'https://contoso.sharepoint.com/_layouts/15/userphoto.aspx?size=S'
    );
    expect(recognition.detailUrl).toBe(
      'https://contoso.sharepoint.com/sites/intranet/reconocimientos/soporte'
    );
    expect(recognition.isPartial).toBe(true);
  });

  it('sorts by newest date first and sends missing dates to the end', () => {
    const items = [
      normalizeRecognitionItem(
        {
          id: 'late',
          targetName: 'Bravo',
          message: 'Segundo',
          date: '2026-03-18T08:00:00.000Z',
          photoUrl: '/photo-bravo.png',
          detailUrl: '/bravo'
        },
        0,
        'https://contoso.sharepoint.com/sites/demo'
      ),
      normalizeRecognitionItem(
        {
          id: 'early',
          targetName: 'Alpha',
          message: 'Primero',
          date: '2026-03-20T08:00:00.000Z',
          photoUrl: '/photo-alpha.png',
          detailUrl: '/alpha'
        },
        1,
        'https://contoso.sharepoint.com/sites/demo'
      ),
      normalizeRecognitionItem(
        {
          id: 'nodate',
          targetName: 'Sin fecha',
          message: 'Tercero',
          photoUrl: '/photo-nodate.png',
          detailUrl: '/nodate'
        },
        2,
        'https://contoso.sharepoint.com/sites/demo'
      )
    ];

    expect(sortRecognitionsByDate(items).map((item) => item.id)).toEqual(['early', 'late', 'nodate']);
    expect(limitRecognitions(items, 2)).toHaveLength(2);
  });
});
